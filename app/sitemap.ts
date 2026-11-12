import type { MetadataRoute } from 'next';
import { paginasFixas, siteUrl } from '../src/site';

/* Só as páginas fixas por enquanto; Blog e Produtos entram pelos índices do Engine. */
export default function sitemap(): MetadataRoute.Sitemap {
  return paginasFixas.map((caminho) => ({ url: caminho === '/' ? `${siteUrl}/` : `${siteUrl}${caminho}` }));
}
