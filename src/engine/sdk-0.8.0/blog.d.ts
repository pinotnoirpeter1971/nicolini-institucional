import { type PublicMediaData } from "./index.js";
/**
 * Blog e eventos (SPEC-BLOG §4): entrega ao vivo, fora do pacote de publicação do cardápio.
 * As rotas respondem 404 quando a casa não existe, o Blog está desligado, a categoria não existe ou
 * a matéria não está no ar. `fetchBlogPost` devolve `null` no 404 (como `fetchPublicProduct`); as
 * outras lançam `RestaurantsPublicError` com `status` 404 para o site repassar.
 */
export type BlogPostKind = "article" | "event";
export type BlogRunData = {
    text: string;
    bold?: true;
    italic?: true;
    href?: string;
};
export type BlogCoverData = {
    type: "photo";
    photo: PublicMediaData;
} | {
    type: "video";
    videoId: string;
    photo: PublicMediaData | null;
};
export type BlogEventData = {
    startsOn: string;
    endsOn: string | null;
    place: string;
    landingPath: string | null;
};
export type BlogBlockData = {
    id: string;
    type: "paragraph";
    text: BlogRunData[];
} | {
    id: string;
    type: "heading";
    text: string;
} | {
    id: string;
    type: "photo";
    photo: PublicMediaData;
    caption: string;
} | {
    id: string;
    type: "quote";
    text: string;
    source: string;
} | {
    id: string;
    type: "youtube";
    videoId: string;
    caption: string;
};
/** Cartão de lista. `date` é a data que o site mostra; em evento, `event` traz as datas. */
export type BlogCardData = {
    id: string;
    kind: BlogPostKind;
    slug: string;
    title: string;
    excerpt: string;
    cover: BlogCoverData | null;
    category: {
        slug: string;
        name: string;
    } | null;
    date: string;
    event: BlogEventData | null;
    readingMinutes: number;
};
/** A matéria inteira: o cartão, os blocos, a primeira publicação e a última alteração publicada. */
export type BlogPostData = BlogCardData & {
    blocks: BlogBlockData[];
    publishedAt: string;
    updatedAt: string;
};
export type BlogPostsPage = {
    items: BlogCardData[];
    nextCursor: string | null;
};
export type BlogCategoryData = {
    slug: string;
    name: string;
    count: number;
};
export type BlogIndexEntry = {
    kind: BlogPostKind;
    slug: string;
    updatedAt: string;
};
type Common = {
    apiBaseUrl: string;
    restaurantKey: string;
    signal?: AbortSignal;
};
/**
 * Uma página de cartões. `kind` é obrigatório; `category` (slug) só em matéria; `when` só em
 * evento (`upcoming`: o mais próximo primeiro; `past`: o mais recente primeiro). 12 por página
 * (até 48); a próxima página vem com `cursor: nextCursor`.
 */
export declare function fetchBlogPosts(input: Common & {
    kind: BlogPostKind;
    category?: string;
    when?: "upcoming" | "past";
    cursor?: string;
    limit?: number;
}): Promise<BlogPostsPage>;
/** A matéria inteira, ou `null` quando ela não está no ar (ou o Blog está desligado). */
export declare function fetchBlogPost(input: Common & {
    slug: string;
}): Promise<BlogPostData | null>;
/** Categorias com ao menos uma matéria no ar, em ordem, com a contagem. */
export declare function fetchBlogCategories(input: Common): Promise<BlogCategoryData[]>;
/** Tudo o que está no ar (sitemap e 404 barato): tipo, slug e a última alteração publicada. */
export declare function fetchBlogIndex(input: Common): Promise<BlogIndexEntry[]>;
/** Miniatura do YouTube (480×360, existe para todo vídeo). */
export declare const youtubeThumbnail: (videoId: string) => string;
/** Reprodução sem cookies de rastreio. */
export declare const youtubeEmbedUrl: (videoId: string) => string;
/** "Próximo" até o fim do dia de `endsOn` (ou de `startsOn`), no fuso da casa (`today` em AAAA-MM-DD). */
export declare const eventIsUpcoming: (event: BlogEventData, today: string) => boolean;
export {};
