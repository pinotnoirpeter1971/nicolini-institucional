/*
 * Configuração pública do site. Tudo aqui vem de variáveis de ambiente
 * públicas (NEXT_PUBLIC_*), com padrão no próprio código: o site não tem segredo.
 *
 * - NEXT_PUBLIC_SITE_URL: origem pública, base dos endereços canônicos, do
 *   sitemap e das imagens de compartilhamento.
 * - NEXT_PUBLIC_SITE_INDEXAVEL: a chave única de indexação. Ausente, "true" ou
 *   "1": indexável (o padrão, como sempre foi), e o robots.txt aponta o sitemap.
 *   "false" ou "0": todas as páginas levam noindex; o robots.txt continua
 *   liberando a leitura, para o buscador conseguir ler o noindex. Qualquer
 *   outro valor derruba o build: um erro de digitação não pode deixar o site
 *   indexável (ou fora do Google) por engano.
 * - NEXT_PUBLIC_ENGINE_URL: endereço do Restaurants Engine, para onde o
 *   /menu-engine/... é repassado. Vai trocar com a mudança de domínio do Engine.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.emporionicolini.com.br').replace(/\/+$/, '');

function lerChaveDeIndexacao(valor: string | undefined): boolean {
  const v = (valor ?? '').trim();
  if (v === '' || v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  throw new Error(
    `NEXT_PUBLIC_SITE_INDEXAVEL="${v}" não é um valor conhecido. Use "true" ou "1" (indexável), "false" ou "0" (noindex), ou deixe a variável vazia (indexável).`,
  );
}

export const indexavel = lerChaveDeIndexacao(process.env.NEXT_PUBLIC_SITE_INDEXAVEL);

export const engineUrl = (process.env.NEXT_PUBLIC_ENGINE_URL || 'https://capilano-restaurant-engines.vercel.app').replace(/\/+$/, '');

/* As páginas fixas do site, na ordem do sitemap. Os módulos (blog, produtos)
 * entram depois, pelos índices do Engine. */
export const paginasFixas = ['/', '/a-loja', '/bistro', '/rustichella'] as const;
