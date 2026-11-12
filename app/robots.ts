import type { MetadataRoute } from 'next';
import { indexavel, siteUrl } from '../src/site';

/* Nunca bloqueia a leitura: buscador bloqueado não chega a ler o noindex. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    ...(indexavel ? { sitemap: `${siteUrl}/sitemap.xml` } : {}),
  };
}
