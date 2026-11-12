import type { MetadataRoute } from 'next';
import { categoriasDoBlog, indiceDoBlog } from '../src/engine/fonte';
import { paginasFixas, siteUrl } from '../src/site';

/* Guardado por 60 s, como as páginas (SPEC-SITE §4). */
export const revalidate = 60;

/* As páginas fixas mais o que o índice do Blog traz. Blog desligado: só as fixas. Produtos entram pela trilha do catálogo. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixas: MetadataRoute.Sitemap = paginasFixas.map((caminho) => ({ url: caminho === '/' ? `${siteUrl}/` : `${siteUrl}${caminho}` }));
  const [indice, categorias] = await Promise.all([indiceDoBlog(), categoriasDoBlog()]);
  if (!indice) return fixas;
  const blog: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/blog` },
    { url: `${siteUrl}/eventos` },
    ...(categorias ?? []).map((c) => ({ url: `${siteUrl}/blog/categoria/${c.slug}` })),
    ...indice.map((m) => ({ url: `${siteUrl}/${m.kind === 'event' ? 'eventos' : 'blog'}/${m.slug}`, lastModified: m.updatedAt })),
  ];
  return [...fixas, ...blog];
}
