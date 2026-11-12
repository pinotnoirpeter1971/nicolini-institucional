import type { NextConfig } from 'next';
import { engineUrl, indexavel } from './src/site';

/*
 * O que era o vercel.json (Vite) vive aqui agora.
 *
 * /menu/ é o endereço que circula (links de reserva já enviados a clientes) e o
 * app de public/menu usa caminhos relativos (./css, ./js), que só resolvem com a
 * barra. Por isso o redirect automático de barra do Next fica desligado e o site
 * assume os dele: /menu ganha a barra; todas as outras páginas perdem a barra,
 * para nenhuma ter dois endereços. Redirect e rewrite em next.config viram regra
 * de roteamento na Vercel: nenhuma função roda por visita (o proxy rodaria).
 */

/*
 * Quem pode embutir o site e o /menu/ num quadro: o próprio site e o painel do
 * Engine, cujo visualizador de sites mostra a página dentro dele. Entram o
 * endereço atual do painel, o futuro (gestao.capilanocreative.com, decisão de
 * Pedro) e os laboratórios do painel (3200 e 3299, em 127.0.0.1 e localhost),
 * porque o painel local também embute as prévias deste site.
 */
const quemPodeEmbutir = [
  "'self'",
  'https://capilano-restaurant-engines.vercel.app',
  'https://gestao.capilanocreative.com',
  'http://127.0.0.1:3200',
  'http://localhost:3200',
  'http://127.0.0.1:3299',
  'http://localhost:3299',
];

/*
 * Endereços com outra caixa (/Rustichella, como sai digitado no impresso e na
 * bio). Na Vercel as regras daqui casam SEM diferenciar maiúsculas (o
 * caseSensitiveRoutes do Next não chega ao roteamento de lá), mas os arquivos
 * estáticos diferenciam. Um redirect /Rustichella → /rustichella casaria
 * também o próprio /rustichella e daria laço. Por isso:
 * - as páginas fixas recebem um rewrite para a própria página em minúsculas
 *   (afterFiles: só vale quando o endereço exato não existe; a página já tem
 *   canônico em minúsculas);
 * - /menu (sem barra), em qualquer caixa, redireciona para /menu/;
 * - /MENU/ e afins não podem redirecionar para /menu/ (laço no casamento sem
 *   caixa): servem o app por rewrite, e os arquivos dele (./css, ./js) também.
 * As classes [Rr]… fazem cada regra casar igual nos dois casamentos (com e sem
 * diferença de caixa). O teste (scripts/testar-rotas.mjs) simula os dois sobre
 * o routes-manifest.
 */
function qualquerCaixa(trecho: string) {
  return [...trecho].map((c) => (/[a-z]/.test(c) ? `[${c.toUpperCase()}${c}]` : c)).join('');
}
const MENU = qualquerCaixa('menu');
const mesmaPagina = (pagina: string) => ({
  source: `/:pagina(${qualquerCaixa(pagina)})`,
  destination: `/${pagina}`,
});

/* Só em build de produção (prévia e produção na Vercel, next start). No
 * laboratório (next dev) não há restrição de quadros. */
const emProducao = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  /* A pasta acima (Site Nicolini) tem um package.json de workspaces que não é
   * deste repositório; a raiz do projeto é esta pasta. */
  turbopack: { root: process.cwd() },
  skipTrailingSlashRedirect: true,
  /* Laboratório (next dev) aberto por 127.0.0.1 e pelo celular no Wi-Fi: sem
   * isto o Next recusa os recursos de desenvolvimento a essas origens e a
   * página não hidrata (o menu não abre). Só o nome do host conta; `*` vale
   * por um trecho do endereço. Faixas de rede local: 192.168/16, 10/8, 172.16/12. */
  allowedDevOrigins: [
    '127.0.0.1',
    '192.168.*.*',
    '10.*.*.*',
    ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`),
  ],
  /* As regras deste repositório estão no CONTEXTO.md e no AGENTS.md da pasta
   * de cima; o next dev não deve gerar AGENTS.md/CLAUDE.md aqui. */
  agentRules: false,
  poweredByHeader: false,
  images: { unoptimized: true },

  async redirects() {
    return [
      /* O Next aceita barra opcional no fim de toda regra; a espiada (?!/)
       * impede esta de casar com o próprio /menu/ (em qualquer caixa). */
      { source: `/:menu(${MENU}(?!/))`, destination: '/menu/', permanent: true },
      { source: '/bistro/reservas', destination: '/menu/#/reserva', permanent: false },
      { source: '/bistro/menu', destination: '/menu/', permanent: false },
      { source: '/bistro/rustichella', destination: '/rustichella', permanent: true },
      /* Endereços que circulam fora do site. */
      { source: '/rustichella.html', destination: '/rustichella', permanent: true },
      { source: '/index.html', destination: '/', permanent: true },
      /* Barra final: só /menu/ (em qualquer caixa) fica com ela. O primeiro
       * caractere do trecho não pode ser / nem \ : com //exemplo.com/ o
       * destino viraria //exemplo.com, um redirect para fora do site. */
      { source: `/:caminho((?!${MENU}/?$)[^/\\\\].*)/`, destination: '/:caminho', permanent: true },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [
        { source: `/:menu(${MENU})/`, destination: '/menu/index.html' },
        {
          source: '/menu-engine/api/v1/public/restaurants/nicolini',
          destination: `${engineUrl}/api/v1/public/restaurants/nicolini`,
        },
      ],
      /* Só quando o endereço exato não é página nem arquivo: o caminho em
       * minúsculas nunca passa por aqui. */
      afterFiles: [
        mesmaPagina('rustichella'),
        mesmaPagina('bistro'),
        mesmaPagina('a-loja'),
        { source: `/:menu(${MENU})/:arquivo+`, destination: '/menu/:arquivo+' },
      ],
      fallback: [],
    };
  },

  async headers() {
    const comuns = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ];
    if (emProducao) {
      comuns.push({ key: 'Content-Security-Policy', value: `frame-ancestors ${quemPodeEmbutir.join(' ')}` });
    }
    if (!indexavel) {
      comuns.push({ key: 'X-Robots-Tag', value: 'noindex' });
    }
    return [{ source: '/:caminho*', headers: comuns }];
  },
};

export default nextConfig;
