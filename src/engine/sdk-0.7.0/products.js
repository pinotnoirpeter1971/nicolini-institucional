import { RestaurantsPublicError } from "./index.js";
/* ── Valor da linha ──────────────────────────────────────────────────────────────────
 * Cópia idêntica de `lineTotalCents` e `quantityProblem` de @restaurants/contracts (o SDK é
 * publicado sozinho). O teste `tests/products.test.ts` compara as duas nos casos de borda.
 */
const MAX_PRICE_CENTS = 100_000_000;
const MAX_GRAMS = 100_000;
const MAX_UNITS = 999;
/**
 * O valor de uma linha em centavos: preço × unidades, ou preço por quilo × gramas ÷ 1.000,
 * arredondado ao centavo com a metade para cima. É a mesma conta que o Engine faz ao receber o
 * pedido: a sacola nunca mostra um total que o Engine recusaria.
 */
export function lineTotalCents(product, quantity) {
    const { saleMode, priceCents } = product;
    if (!Number.isInteger(priceCents) || priceCents < 0 || priceCents > MAX_PRICE_CENTS)
        throw new RangeError("Preço fora dos limites.");
    const max = saleMode === "weight" ? MAX_GRAMS : MAX_UNITS;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > max)
        throw new RangeError("Quantidade fora dos limites.");
    if (saleMode === "unit")
        return priceCents * quantity;
    if (saleMode !== "weight")
        throw new RangeError("Modo de venda desconhecido.");
    return Math.floor((priceCents * quantity + 500) / 1000);
}
/** O que impede pedir esta quantidade (unidades, ou gramas no passo e acima do mínimo), ou `null`. */
export function quantityProblem(product, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1)
        return "Quantidade inválida.";
    if (product.saleMode === "unit")
        return quantity > MAX_UNITS ? `No máximo ${MAX_UNITS} unidades.` : null;
    const step = product.stepGrams ?? 100;
    const min = product.minGrams ?? 100;
    if (quantity < min)
        return `O mínimo é ${min} g.`;
    if (quantity > MAX_GRAMS)
        return `No máximo ${MAX_GRAMS / 1000} kg.`;
    if (quantity % step)
        return `Peça de ${step} em ${step} g.`;
    return null;
}
async function get(input, path, allowMissing = false) {
    const base = input.apiBaseUrl.replace(/\/$/, "");
    const response = await fetch(`${base}/api/v1/public/restaurants/${encodeURIComponent(input.restaurantKey)}/products${path}`, { headers: { accept: "application/json" }, signal: input.signal });
    if (allowMissing && response.status === 404)
        return null;
    const body = await response.json().catch(() => null);
    if (!response.ok)
        throw new RestaurantsPublicError(body?.error?.message ?? "Não foi possível carregar os produtos.", response.status);
    if (!body || typeof body !== "object" || !("data" in body))
        throw new RestaurantsPublicError("Resposta pública inválida.", 502);
    return body.data;
}
/** Uma página de cartões: destaques primeiro, depois nome. 24 por página (até 48). Categoria que não existe: 404 (`RestaurantsPublicError`). */
export async function fetchPublicProducts(input) {
    const query = new URLSearchParams();
    if (input.category)
        query.set("category", input.category);
    if (input.featured)
        query.set("featured", "1");
    if (input.cursor)
        query.set("cursor", input.cursor);
    if (input.limit)
        query.set("limit", String(input.limit));
    const search = query.toString();
    return (await get(input, `/items${search ? `?${search}` : ""}`));
}
/** Quantos ids o Engine aceita numa leitura por `ids` (um pedido tem até 40 itens). */
export const PUBLIC_PRODUCT_IDS_MAX = 50;
/**
 * Os produtos da sacola, pelo id, com o preço de agora: sem cache. Id ausente na resposta é
 * produto que saiu do site. Acima de `PUBLIC_PRODUCT_IDS_MAX` ids, divide em lotes (em paralelo)
 * e junta as respostas; a sacola de um pedido (até 40 itens) cabe numa chamada só.
 */
export async function fetchPublicProductsByIds(input) {
    const ids = [...new Set(input.ids)];
    const batches = [];
    for (let at = 0; at < ids.length; at += PUBLIC_PRODUCT_IDS_MAX)
        batches.push(ids.slice(at, at + PUBLIC_PRODUCT_IDS_MAX));
    const pages = await Promise.all(batches.map((batch) => get(input, `/items?ids=${batch.map(encodeURIComponent).join(",")}`)));
    return pages.flatMap((page) => page.items);
}
/** O produto inteiro, ou `null` quando ele não está no ar (ou o módulo está desligado). */
export async function fetchPublicProduct(input) {
    return get(input, `/items/${encodeURIComponent(input.slug)}`, true);
}
/** Categorias com ao menos um produto no ar, em ordem, com a contagem. */
export async function fetchPublicProductCategories(input) {
    return (await get(input, "/categories")).items;
}
/** Todos os produtos no ar (até 5.000): slug, categoria e a hora da última alteração. */
export async function fetchPublicProductIndex(input) {
    return (await get(input, "/index")).items;
}
