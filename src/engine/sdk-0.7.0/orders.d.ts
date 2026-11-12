/**
 * Pedidos (SPEC-PEDIDOS §3 e §4.1): a sacola do site envia um pedido sem pagamento, o Engine
 * confere, calcula e grava, e devolve o recibo com o endereço do WhatsApp da loja já montado.
 * O navegador chama o Engine direto (nunca por rewrite do site: o limite é por IP do visitante).
 * Nunca se manda preço: só ids, quantidades e o total que o cliente viu.
 */
export type PublicOrderConfigData = {
    /** A casa recebe pedidos agora. Falso: o site mostra o contato geral, sem pedido. */
    accepting: boolean;
    /** Aviso curto da casa para a sacola (como funciona a retirada, por exemplo). */
    notice: string | null;
    currency: string;
    limits: {
        items: number;
        maxUnits: number;
        maxGrams: number;
        customerNameMin: number;
        customerName: number;
        note: number;
    };
};
export type PublicOrderStatus = "new" | "in_progress" | "done" | "cancelled";
export type PublicOrderLineData = {
    productId: string | null;
    name: string;
    brand: string | null;
    saleMode: "unit" | "weight";
    sizeLabel: string | null;
    /** Em `unit`, o preço da unidade; em `weight`, o preço por quilo. */
    unitPriceCents: number;
    /** Unidades (`unit`) ou gramas (`weight`). */
    quantity: number;
    lineTotalCents: number;
};
export type PublicOrderReceiptData = {
    number: number;
    status: PublicOrderStatus;
    createdAt: string;
    /** Nulos depois que o prazo de guarda da casa passa. */
    customerName: string | null;
    note: string | null;
    items: PublicOrderLineData[];
    estimatedTotalCents: number;
    currency: string;
    /** Abre o WhatsApp da loja com o texto pronto e o link do recibo. O site só abre este endereço. */
    whatsappUrl: string | null;
    /** O pedido no painel da loja ("Equipe: abrir no painel"); abrir exige login. */
    panelUrl: string;
};
export type CreatePublicOrderInput = {
    /** UUID gerado pelo site junto com o token; reenviar a mesma chave com o mesmo corpo não duplica. */
    idempotencyKey: string;
    /** O token do recibo (`createOrderToken`). Vai no fragmento do link: `/pedido#<token>`. */
    token: string;
    customerName: string;
    note?: string | null;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    /** O total que a sacola mostrou. Se o Engine calcular outro, recusa com `total_changed`. */
    expectedTotalCents: number;
};
/** Uma linha atual da sacola, devolvida numa recusa: é a fonte de verdade para o site se atualizar. */
export type OrderCurrentLineData = {
    productId: string;
    name: string;
    brand: string | null;
    saleMode: "unit" | "weight";
    sizeLabel: string | null;
    stepGrams: number | null;
    minGrams: number | null;
    unitPriceCents: number;
    quantity: number;
    lineTotalCents: number;
};
export type OrderRefusalReason = "not_accepting" | "items_changed" | "total_changed" | "idempotency_mismatch" | "token_in_use";
export type OrderRejectedWhy = "gone" | "unavailable" | "no_price" | "quantity";
export type OrderTotalChangedDetails = {
    lines: OrderCurrentLineData[];
    estimatedTotalCents: number;
    currency: string;
};
/**
 * Um item recusado. Em `quantity` vêm também as regras atuais do produto (modo de venda, passo,
 * mínimo e preço), para o site corrigir a quantidade sem reler o produto.
 */
export type OrderRejectedItem = {
    productId: string;
    why: OrderRejectedWhy;
    message: string;
    saleMode?: "unit" | "weight";
    stepGrams?: number | null;
    minGrams?: number | null;
    unitPriceCents?: number;
};
export type OrderItemsChangedDetails = OrderTotalChangedDetails & {
    rejected: OrderRejectedItem[];
};
/**
 * Erro de uma chamada de Pedidos. `code` é o do Engine (`CONFLICT`, `VALIDATION`, `LIMIT`,
 * `NOT_FOUND`, `FORBIDDEN`, `TEMPORARY`). Em recusa de negócio (`CONFLICT`), `reason` diz o motivo e
 * `details` traz as linhas atuais (`items_changed`, `total_changed`). Em `LIMIT` (429),
 * `retryAfterSeconds` diz quanto esperar. (Não estende `RestaurantsPublicError`: o índice do
 * pacote reexporta este arquivo, e a classe-base ainda não existiria ao carregar.)
 */
export declare class RestaurantsOrderError extends Error {
    readonly status: number;
    readonly code: string;
    readonly reason: OrderRefusalReason | string | null;
    readonly details: unknown;
    readonly retryAfterSeconds: number | null;
    constructor(message: string, status: number, code: string, reason: OrderRefusalReason | string | null, details: unknown, retryAfterSeconds: number | null);
}
/** A recusa `items_changed` ou `total_changed`, com as linhas atuais; ou `null` se o erro é outro. */
export declare function orderRefusalLines(error: unknown): (OrderTotalChangedDetails & Partial<Pick<OrderItemsChangedDetails, "rejected">>) | null;
export declare const ORDER_TOKEN_PATTERN: RegExp;
/** Gera o token do recibo no navegador, com acaso criptográfico. Guarde-o antes de enviar o pedido. */
export declare function createOrderToken(): string;
/** A chave de idempotência e o token nascem juntos, quando o cliente manda enviar (SPEC-PEDIDOS §3.1). */
export declare function createOrderAttempt(): {
    idempotencyKey: string;
    token: string;
};
/** O token que está no fragmento do endereço do recibo (`/pedido#<token>`), ou `null` se não parece um. */
export declare function orderTokenFromHash(hash: string): string | null;
/**
 * O que impede pedir esta quantidade, ou `null`. Em `unit`, de 1 a 99 unidades. Em `weight`,
 * gramas no passo do produto, do mínimo dele até 20 kg. É a mesma regra que o Engine aplica.
 */
export declare function orderQuantityProblem(product: {
    saleMode: "unit" | "weight";
    stepGrams: number | null;
    minGrams: number | null;
}, quantity: number): string | null;
type Base = {
    apiBaseUrl: string;
    restaurantKey: string;
    signal?: AbortSignal;
};
/** Se a casa recebe pedidos, os limites da sacola e o aviso. `null`: a casa não tem Pedidos (404). */
export declare function fetchPublicOrderConfig(input: Base): Promise<PublicOrderConfigData | null>;
/**
 * Envia o pedido. Devolve o recibo (com `whatsappUrl`). Recusa lança `RestaurantsOrderError`:
 * use `orderRefusalLines(error)` para atualizar a sacola em `items_changed` e `total_changed`.
 */
export declare function createPublicOrder(input: Base & {
    order: CreatePublicOrderInput;
}): Promise<PublicOrderReceiptData>;
/** O recibo pelo token (enviado no corpo). `null`: token errado ou recibo vencido (respondem igual). */
export declare function lookupPublicOrder(input: Base & {
    token: string;
}): Promise<PublicOrderReceiptData | null>;
export {};
