import type { MetadataRoute } from 'next';
import { categoriasDoBlog, indiceDeProdutos, indiceDoBlog } from '../src/engine/fonte';
import { paginasFixas, siteUrl } from '../src/site';

/* Guardado por 60 s, como as páginas (SPEC-SITE §4). */
export const revalidate = 60;

/* As páginas fixas mais o que os índices do Blog e de Produtos trouxerem. Módulo desligado: nada dele entra. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixas: MetadataRoute.Sitemap = paginasFixas.map((caminho) => ({ url: caminho === '/' ? `${siteUrl}/` : `${siteUrl}${caminho}` }));
  const [indice, categorias, produtos] = await Promise.all([indiceDoBlog(), categoriasDoBlog(), indiceDeProdutos()]);
  const blog: MetadataRoute.Sitemap = indice
    ? [
        { url: `${siteUrl}/blog` },
        { url: `${siteUrl}/eventos` },
        ...(categorias ?? []).map((c) => ({ url: `${siteUrl}/blog/categoria/${c.slug}` })),
        ...indice.map((m) => ({ url: `${siteUrl}/${m.kind === 'event' ? 'eventos' : 'blog'}/${m.slug}`, lastModified: m.updatedAt })),
      ]
    : [];
  const categoriasDeProdutos = [...new Set(produtos.map((p) => p.category))];
  const catalogo: MetadataRoute.Sitemap = produtos.length
    ? [
        { url: `${siteUrl}/produtos` },
        ...categoriasDeProdutos.map((c) => ({ url: `${siteUrl}/produtos/${c}` })),
        ...produtos.map((p) => ({ url: `${siteUrl}/produto/${p.slug}`, lastModified: p.updatedAt })),
      ]
    : [];
  return [...fixas, ...blog, ...catalogo];
}
