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
 * Os quatro endereços fixos e o /menu/ com outra caixa (/Rustichella, como
 * sai digitado no impresso e na bio) redirecionam para o endereço certo. Exige
 * rotas sensíveis à caixa (experimental.caseSensitiveRoutes, abaixo): sem
 * isso o Next casa as regras sem diferenciar maiúsculas e /rustichella
 * redirecionaria para si mesmo.
 */
function semDiferencaDeCaixa(trecho: string) {
  return [...trecho].map((c) => (/[a-z]/.test(c) ? `[${c.toUpperCase()}${c}]` : c)).join('');
}
const caixaErrada = (pagina: string, destino: string) => ({
  source: `/:pagina((?!${pagina}/?$)${semDiferencaDeCaixa(pagina)})`,
  destination: destino,
  permanent: true,
});

/* Só em build de produção (prévia e produção na Vercel, next start). No
 * laboratório (next dev) não há restrição de quadros. */
const emProducao = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  /* A pasta acima (Site Nicolini) tem um package.json de workspaces que não é
   * deste repositório; a raiz do projeto é esta pasta. */
  turbopack: { root: process.cwd() },
  skipTrailingSlashRedirect: true,
  experimental: { caseSensitiveRoutes: true },
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
       * impede esta de casar com o próprio /menu/. */
      { source: '/:menu(menu(?!/))', destination: '/menu/', permanent: true },
      { source: '/bistro/reservas', destination: '/menu/#/reserva', permanent: false },
      { source: '/bistro/menu', destination: '/menu/', permanent: false },
      { source: '/bistro/rustichella', destination: '/rustichella', permanent: true },
      /* Endereços que circulam fora do site. */
      { source: '/rustichella.html', destination: '/rustichella', permanent: true },
      { source: '/index.html', destination: '/', permanent: true },
      caixaErrada('rustichella', '/rustichella'),
      caixaErrada('bistro', '/bistro'),
      caixaErrada('a-loja', '/a-loja'),
      caixaErrada('menu', '/menu/'),
      /* Barra final: só /menu/ fica com ela. O primeiro caractere do trecho
       * não pode ser / nem \ : com //exemplo.com/ o destino viraria
       * //exemplo.com, um redirect para fora do site. */
      { source: '/:caminho((?!menu/?$)[^/\\\\].*)/', destination: '/:caminho', permanent: true },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [
        { source: '/menu/', destination: '/menu/index.html' },
        {
          source: '/menu-engine/api/v1/public/restaurants/nicolini',
          destination: `${engineUrl}/api/v1/public/restaurants/nicolini`,
        },
      ],
      afterFiles: [],
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
