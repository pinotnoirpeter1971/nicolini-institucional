import type { MetadataRoute } from 'next';
import { indiceDeProdutos } from '../src/engine/fonte';
import { paginasFixas, siteUrl } from '../src/site';

/* Guardado por 60 s, como as páginas. As páginas fixas mais o que o índice de
 * Produtos trouxer (módulo desligado: índice vazio, nenhuma página de produto). */
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixas = paginasFixas.map((caminho) => ({ url: caminho === '/' ? `${siteUrl}/` : `${siteUrl}${caminho}` }));
  const indice = await indiceDeProdutos();
  if (!indice.length) return fixas;
  const categorias = [...new Set(indice.map((p) => p.category))];
  return [
    ...fixas,
    { url: `${siteUrl}/produtos` },
    ...categorias.map((c) => ({ url: `${siteUrl}/produtos/${c}` })),
    ...indice.map((p) => ({ url: `${siteUrl}/produto/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
