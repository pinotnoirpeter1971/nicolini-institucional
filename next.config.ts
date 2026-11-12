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

/* Painel do Engine: o visualizador de sites embute o site. Endereço atual e o futuro. */
const quemPodeEmbutir = [
  "'self'",
  'https://capilano-restaurant-engines.vercel.app',
  'https://restaurantes.capilanocreative.com',
];

/* Só em build de produção (prévia e produção na Vercel, next start). No
 * laboratório (next dev) não há restrição de quadros. */
const emProducao = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  /* A pasta acima (Site Nicolini) tem um package.json de workspaces que não é
   * deste repositório; a raiz do projeto é esta pasta. */
  turbopack: { root: process.cwd() },
  skipTrailingSlashRedirect: true,
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
      /* Barra final: só /menu/ fica com ela. */
      { source: '/:caminho((?!menu/?$).+)/', destination: '/:caminho', permanent: true },
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
