/**
 * Erro de uma chamada de Pedidos. `code` é o do Engine (`CONFLICT`, `VALIDATION`, `LIMIT`,
 * `NOT_FOUND`, `FORBIDDEN`, `TEMPORARY`). Em recusa de negócio (`CONFLICT`), `reason` diz o motivo e
 * `details` traz as linhas atuais (`items_changed`, `total_changed`). Em `LIMIT` (429),
 * `retryAfterSeconds` diz quanto esperar. (Não estende `RestaurantsPublicError`: o índice do
 * pacote reexporta este arquivo, e a classe-base ainda não existiria ao carregar.)
 */
export class RestaurantsOrderError extends Error {
    status;
    code;
    reason;
    details;
    retryAfterSeconds;
    constructor(message, status, code, reason, details, retryAfterSeconds) {
        super(message);
        this.status = status;
        this.code = code;
        this.reason = reason;
        this.details = details;
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
/** A recusa `items_changed` ou `total_changed`, com as linhas atuais; ou `null` se o erro é outro. */
export function orderRefusalLines(error) {
    if (!(error instanceof RestaurantsOrderError) || (error.reason !== "items_changed" && error.reason !== "total_changed"))
        return null;
    const details = error.details;
    return details && Array.isArray(details.lines) ? details : null;
}
/* ── Token e quantidade ───────────────────────────────────────────────────────────── */
/** Base32 sem ambiguidade (sem i, l, o, u), minúsculo. 16 caracteres = 80 bits de acaso. */
const TOKEN_ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz";
export const ORDER_TOKEN_PATTERN = /^[0-9a-hjkmnp-tv-z]{16}$/;
/** Gera o token do recibo no navegador, com acaso criptográfico. Guarde-o antes de enviar o pedido. */
export function createOrderToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    let token = "";
    // 256 é múltiplo de 32: os 5 bits baixos de cada byte são uniformes.
    for (const byte of bytes)
        token += TOKEN_ALPHABET[byte & 31];
    return token;
}
/** A chave de idempotência e o token nascem juntos, quando o cliente manda enviar (SPEC-PEDIDOS §3.1). */
export function createOrderAttempt() {
    return { idempotencyKey: crypto.randomUUID(), token: createOrderToken() };
}
/** O token que está no fragmento do endereço do recibo (`/pedido#<token>`), ou `null` se não parece um. */
export function orderTokenFromHash(hash) {
    const token = hash.replace(/^#/, "").trim().toLowerCase();
    return ORDER_TOKEN_PATTERN.test(token) ? token : null;
}
/* Cópia idêntica de `orderQuantityProblem` de @restaurants/contracts (o SDK é publicado sozinho).
 * O teste `tests/orders.test.ts` compara as duas nos casos de borda. */
const ORDER_MAX_UNITS = 99;
const ORDER_MAX_GRAMS = 20_000;
/**
 * O que impede pedir esta quantidade, ou `null`. Em `unit`, de 1 a 99 unidades. Em `weight`,
 * gramas no passo do produto, do mínimo dele até 20 kg. É a mesma regra que o Engine aplica.
 */
export function orderQuantityProblem(product, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1)
        return "Quantidade inválida.";
    if (product.saleMode === "unit")
        return quantity > ORDER_MAX_UNITS ? `No máximo ${ORDER_MAX_UNITS} unidades por pedido.` : null;
    const step = product.stepGrams ?? 100;
    const min = product.minGrams ?? 100;
    if (quantity < min)
        return `O mínimo é ${min} g.`;
    if (quantity % step)
        return `Peça de ${step} em ${step} g.`;
    return quantity > ORDER_MAX_GRAMS ? `No máximo ${ORDER_MAX_GRAMS / 1000} kg por pedido.` : null;
}
const endpoint = (input, path) => `${input.apiBaseUrl.replace(/\/$/, "")}/api/v1/public/restaurants/${encodeURIComponent(input.restaurantKey)}/orders${path}`;
async function unwrap(response, fallback) {
    const body = await response.json().catch(() => null);
    if (!response.ok) {
        const error = body?.error ?? {};
        // O cabeçalho pode não chegar ao navegador (CORS); o corpo traz o mesmo tempo de espera.
        const header = Number(response.headers.get("retry-after"));
        const inBody = Number(error.details?.retryAfterSeconds);
        const retry = Number.isFinite(header) && header > 0 ? header : Number.isFinite(inBody) && inBody > 0 ? inBody : null;
        throw new RestaurantsOrderError(error.message ?? fallback, response.status, error.code ?? "TEMPORARY", error.reason ?? null, error.details ?? null, response.status === 429 ? retry : null);
    }
    if (!body || typeof body !== "object" || !("data" in body))
        throw new RestaurantsOrderError("Resposta pública inválida.", 502, "TEMPORARY", null, null, null);
    return body.data;
}
async function post(input, path, payload, fallback) {
    const response = await fetch(endpoint(input, path), {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/json" },
        body: JSON.stringify(payload),
        referrerPolicy: "no-referrer",
        signal: input.signal,
    });
    return unwrap(response, fallback);
}
/** Se a casa recebe pedidos, os limites da sacola e o aviso. `null`: a casa não tem Pedidos (404). */
export async function fetchPublicOrderConfig(input) {
    const response = await fetch(endpoint(input, "/config"), { headers: { accept: "application/json" }, signal: input.signal });
    if (response.status === 404)
        return null;
    return unwrap(response, "Não foi possível consultar os pedidos.");
}
/**
 * Envia o pedido. Devolve o recibo (com `whatsappUrl`). Recusa lança `RestaurantsOrderError`:
 * use `orderRefusalLines(error)` para atualizar a sacola em `items_changed` e `total_changed`.
 */
export async function createPublicOrder(input) {
    return post(input, "", input.order, "Não foi possível enviar o pedido.");
}
/** O recibo pelo token (enviado no corpo). `null`: token errado ou recibo vencido (respondem igual). */
export async function lookupPublicOrder(input) {
    try {
        return await post(input, "/lookup", { token: input.token }, "Não foi possível consultar o pedido.");
    }
    catch (error) {
        if (error instanceof RestaurantsOrderError && error.status === 404)
            return null;
        throw error;
    }
}
