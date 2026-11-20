import { RestaurantsPublicError } from "./index.js";
async function blogGet(input, path, query) {
    const base = input.apiBaseUrl.replace(/\/$/, "");
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {}))
        if (value !== undefined && value !== "")
            search.set(key, String(value));
    const qs = search.toString();
    const response = await fetch(`${base}/api/v1/public/restaurants/${encodeURIComponent(input.restaurantKey)}/blog${path}${qs ? `?${qs}` : ""}`, { headers: { accept: "application/json" }, signal: input.signal });
    const body = await response.json().catch(() => null);
    if (!response.ok)
        throw new RestaurantsPublicError(body?.error?.message ?? "Não foi possível carregar o blog.", response.status);
    if (!body || typeof body !== "object" || !("data" in body))
        throw new RestaurantsPublicError("Resposta pública inválida.", 502);
    return body.data;
}
/**
 * Uma página de cartões. `kind` é obrigatório; `category` (slug) só em matéria; `when` só em
 * evento (`upcoming`: o mais próximo primeiro; `past`: o mais recente primeiro). 12 por página
 * (até 48); a próxima página vem com `cursor: nextCursor`.
 */
export function fetchBlogPosts(input) {
    return blogGet(input, "/posts", { kind: input.kind, category: input.category, when: input.when, cursor: input.cursor, limit: input.limit });
}
/** A matéria inteira, ou `null` quando ela não está no ar (ou o Blog está desligado). */
export async function fetchBlogPost(input) {
    try {
        return await blogGet(input, `/posts/${encodeURIComponent(input.slug)}`);
    }
    catch (error) {
        if (error instanceof RestaurantsPublicError && error.status === 404)
            return null;
        throw error;
    }
}
/** Categorias com ao menos uma matéria no ar, em ordem, com a contagem. */
export async function fetchBlogCategories(input) {
    return (await blogGet(input, "/categories")).items;
}
/** Tudo o que está no ar (sitemap e 404 barato): tipo, slug e a última alteração publicada. */
export async function fetchBlogIndex(input) {
    return (await blogGet(input, "/index")).items;
}
/** Miniatura do YouTube (480×360, existe para todo vídeo). */
export const youtubeThumbnail = (videoId) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
/** Reprodução sem cookies de rastreio. */
export const youtubeEmbedUrl = (videoId) => `https://www.youtube-nocookie.com/embed/${videoId}`;
/** "Próximo" até o fim do dia de `endsOn` (ou de `startsOn`), no fuso da casa (`today` em AAAA-MM-DD). */
export const eventIsUpcoming = (event, today) => (event.endsOn ?? event.startsOn) >= today;
