import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { indexavel, siteUrl } from '../src/site';

/*
 * CSS por área. A ORDEM DESTES IMPORTS É A CASCATA: é a ordem em que o
 * conteúdo estava no antigo src/styles.css (a concatenação dos arquivos, sem a
 * linha de cabeçalho de cada um, é igual ao arquivo original). Área nova entra
 * no fim, com arquivo próprio (blog.css, produtos.css, pedido.css), para as
 * trilhas não editarem o mesmo arquivo. Detalhe no CONTEXTO.md.
 */
import '../src/styles/fontes.css';
import '../src/styles/base.css';
import '../src/styles/moldura-cabecalho.css';
import '../src/styles/home.css';
import '../src/styles/moldura-rodape.css';
import '../src/styles/loja.css';
import '../src/styles/responsivo.css';
import '../src/styles/bistro.css';
import '../src/styles/moldura-whatsapp.css';
import '../src/styles/rustichella.css';
/* Áreas do design de 12/11/2026 (moldura nova, produtos, blog, sacola e recibo). */
import '../src/styles/componentes.css';
import '../src/styles/produtos.css';
import '../src/styles/blog.css';
import '../src/styles/pedido.css';

/* O layout raiz não chama o Engine (SPEC-SITE §1.6). */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
  robots: indexavel ? undefined : { index: false, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#161514',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
