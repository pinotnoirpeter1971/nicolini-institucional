import { type PublicMediaData } from "./index.js";
/**
 * Produtos (SPEC-PRODUTOS §4): leitura pública ao vivo do catálogo do empório. Nunca traz `sku`,
 * rascunho nem arquivado. Módulo desligado ou casa inexistente respondem 404.
 * `priceCents` nulo é "sob consulta": aparece no site, sem botão de adicionar.
 */
export type PublicProductCardData = {
    id: string;
    slug: string;
    name: string;
    brand: string | null;
    /** `unit`: preço da unidade. `weight`: preço por quilo; a quantidade é em gramas. */
    saleMode: "unit" | "weight";
    priceCents: number | null;
    currency: string;
    /** Só em `unit`: "500 g", "garrafa 750 ml". */
    sizeLabel: string | null;
    /** Só em `weight`: de quanto em quanto se pede e o mínimo, em gramas. */
    stepGrams: number | null;
    minGrams: number | null;
    available: boolean;
    featured: boolean;
    photo: PublicMediaData | null;
    categorySlug: string;
};
export type PublicProductData = PublicProductCardData & {
    description: string | null;
    origin: string | null;
    photos: PublicMediaData[];
    category: {
        slug: string;
        name: string;
    };
};
export type PublicProductPageData = {
    items: PublicProductCardData[];
    nextCursor: string | null;
};
export type PublicProductCategoryData = {
    slug: string;
    name: string;
    description: string | null;
    count: number;
};
export type PublicProductIndexEntry = {
    slug: string;
    category: string;
    updatedAt: string;
};
/**
 * O valor de uma linha em centavos: preço × unidades, ou preço por quilo × gramas ÷ 1.000,
 * arredondado ao centavo com a metade para cima. É a mesma conta que o Engine faz ao receber o
 * pedido: a sacola nunca mostra um total que o Engine recusaria.
 */
export declare function lineTotalCents(product: {
    saleMode: "unit" | "weight";
    priceCents: number;
}, quantity: number): number;
/** O que impede pedir esta quantidade (unidades, ou gramas no passo e acima do mínimo), ou `null`. */
export declare function quantityProblem(product: {
    saleMode: "unit" | "weight";
    stepGrams: number | null;
    minGrams: number | null;
}, quantity: number): string | null;
type Base = {
    apiBaseUrl: string;
    restaurantKey: string;
    signal?: AbortSignal;
};
/** Uma página de cartões: destaques primeiro, depois nome. 24 por página (até 48). Categoria que não existe: 404 (`RestaurantsPublicError`). */
export declare function fetchPublicProducts(input: Base & {
    category?: string;
    featured?: boolean;
    cursor?: string | null;
    limit?: number;
}): Promise<PublicProductPageData>;
/** Quantos ids o Engine aceita numa leitura por `ids` (um pedido tem até 40 itens). */
export declare const PUBLIC_PRODUCT_IDS_MAX = 50;
/**
 * Os produtos da sacola, pelo id, com o preço de agora: sem cache. Id ausente na resposta é
 * produto que saiu do site. Acima de `PUBLIC_PRODUCT_IDS_MAX` ids, divide em lotes (em paralelo)
 * e junta as respostas; a sacola de um pedido (até 40 itens) cabe numa chamada só.
 */
export declare function fetchPublicProductsByIds(input: Base & {
    ids: string[];
}): Promise<PublicProductCardData[]>;
/** O produto inteiro, ou `null` quando ele não está no ar (ou o módulo está desligado). */
export declare function fetchPublicProduct(input: Base & {
    slug: string;
}): Promise<PublicProductData | null>;
/** Categorias com ao menos um produto no ar, em ordem, com a contagem. */
export declare function fetchPublicProductCategories(input: Base): Promise<PublicProductCategoryData[]>;
/** Todos os produtos no ar (até 5.000): slug, categoria e a hora da última alteração. */
export declare function fetchPublicProductIndex(input: Base): Promise<PublicProductIndexEntry[]>;
export {};
