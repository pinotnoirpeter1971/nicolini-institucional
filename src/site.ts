/*
 * Configuração pública do site. Tudo aqui vem de variáveis de ambiente
 * públicas (NEXT_PUBLIC_*), com padrão no próprio código: o site não tem segredo.
 *
 * - NEXT_PUBLIC_SITE_URL: origem pública, base dos endereços canônicos, do
 *   sitemap e das imagens de compartilhamento.
 * - NEXT_PUBLIC_SITE_INDEXAVEL: a chave única de indexação. Ligada (padrão),
 *   o site é indexável e o robots.txt aponta o sitemap. Desligada ("false" ou
 *   "0"), todas as páginas levam noindex; o robots.txt continua liberando a
 *   leitura, para o buscador conseguir ler o noindex.
 * - NEXT_PUBLIC_ENGINE_URL: endereço do Restaurants Engine, para onde o
 *   /menu-engine/... é repassado. Vai trocar com a mudança de domínio do Engine.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.emporionicolini.com.br').replace(/\/+$/, '');

export const indexavel = !['false', '0', 'nao', 'não', 'off'].includes(
  (process.env.NEXT_PUBLIC_SITE_INDEXAVEL || '').trim().toLowerCase(),
);

export const engineUrl = (process.env.NEXT_PUBLIC_ENGINE_URL || 'https://capilano-restaurant-engines.vercel.app').replace(/\/+$/, '');

/* As páginas fixas do site, na ordem do sitemap. Os módulos (blog, produtos)
 * entram depois, pelos índices do Engine. */
export const paginasFixas = ['/', '/a-loja', '/bistro', '/rustichella'] as const;
