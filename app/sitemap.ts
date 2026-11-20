import type { MetadataRoute } from 'next';
import { categoriasDeProdutos as lerCategorias, categoriasDoBlog, indiceDeProdutos, indiceDoBlog } from '../src/engine/fonte';
import { paginasFixas, siteUrl } from '../src/site';

/* Guardado por 60 s, como as páginas (SPEC-SITE §4). */
export const revalidate = 60;

/* As páginas fixas mais o que os índices do Blog e de Produtos trouxerem. Módulo desligado: nada dele entra. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixas: MetadataRoute.Sitemap = paginasFixas.map((caminho) => ({ url: caminho === '/' ? `${siteUrl}/` : `${siteUrl}${caminho}` }));
  const [indice, categorias, produtos, departamentos] = await Promise.all([indiceDoBlog(), categoriasDoBlog(), indiceDeProdutos(), lerCategorias().catch(() => null)]);
  const blog: MetadataRoute.Sitemap = indice
    ? [
        { url: `${siteUrl}/blog` },
        { url: `${siteUrl}/eventos` },
        ...(categorias ?? []).map((c) => ({ url: `${siteUrl}/blog/categoria/${c.slug}` })),
        ...indice.map((m) => ({ url: `${siteUrl}/${m.kind === 'event' ? 'eventos' : 'blog'}/${m.slug}`, lastModified: m.updatedAt })),
      ]
    : [];
  /* O índice traz a categoria de cada produto (a de dentro, quando há); os departamentos vêm da lista (D-141). */
  const categoriasDeProdutos = [...new Set([...(departamentos ?? []).map((d) => d.slug), ...produtos.map((p) => p.category)])];
  const catalogo: MetadataRoute.Sitemap = produtos.length
    ? [
        { url: `${siteUrl}/produtos` },
        ...categoriasDeProdutos.map((c) => ({ url: `${siteUrl}/produtos/${c}` })),
        ...produtos.map((p) => ({ url: `${siteUrl}/produto/${p.slug}`, lastModified: p.updatedAt })),
      ]
    : [];
  return [...fixas, ...blog, ...catalogo];
}
