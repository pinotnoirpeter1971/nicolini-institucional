import type { Metadata } from 'next';
import type { PublicMediaData } from './engine/sdk-0.7.0/index.js';

/*
 * Metadados das páginas fixas. Antes moravam em index.html e rustichella.html.
 * O Next substitui o bloco openGraph inteiro quando a página declara o seu, por
 * isso cada página monta o dela por aqui, com o próprio endereço canônico.
 * Endereços relativos viram absolutos pelo metadataBase (app/layout.tsx).
 */
type Pagina = {
  caminho: string;
  titulo: string;
  descricao: string;
  ogTitulo: string;
  ogDescricao: string;
  ogImagem: string;
};

export const emporio = {
  titulo: 'Nicolini — empório em Caxias do Sul',
  descricao:
    'Nicolini — empório em Caxias do Sul. Queijos, embutidos, massas, vinhos e conservas escolhidos um por um.',
  ogTitulo: 'Nicolini — empório em Caxias do Sul',
  ogDescricao: 'Queijos, embutidos, massas, vinhos e conservas escolhidos um por um.',
  ogImagem: '/media/og-nicolini.jpg',
};

export function metadados({ caminho, titulo, descricao, ogTitulo, ogDescricao, ogImagem }: Pagina): Metadata {
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: caminho },
    openGraph: {
      type: 'website',
      siteName: 'Nicolini',
      locale: 'pt_BR',
      title: ogTitulo,
      description: ogDescricao,
      url: caminho,
      images: [{ url: ogImagem, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

/*
 * Metadados das páginas novas (produtos, blog, eventos, sacola, recibo). A
 * imagem de compartilhamento é a capa ou a primeira foto; sem ela, a da casa.
 * `privada` põe noindex (sacola e recibo, SPEC-SITE §4).
 */
export function metadadosDaPagina({
  caminho,
  titulo,
  descricao,
  imagem,
  privada = false,
}: {
  caminho: string;
  titulo: string;
  descricao: string;
  imagem?: { url: string; width: number; height: number } | null;
  privada?: boolean;
}): Metadata {
  const tituloCompleto = `${titulo} — Nicolini`;
  return {
    title: tituloCompleto,
    description: descricao,
    alternates: { canonical: caminho },
    openGraph: {
      type: 'website',
      siteName: 'Nicolini',
      locale: 'pt_BR',
      title: tituloCompleto,
      description: descricao,
      url: caminho,
      images: [imagem ? { url: imagem.url, width: imagem.width, height: imagem.height } : { url: emporio.ogImagem, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
    ...(privada ? { robots: { index: false, follow: false } } : {}),
  };
}

/*
 * Imagem de compartilhamento da matéria/evento: a capa servida como JPEG por
 * /capa/<slug>.jpg (app/capa/[arquivo]/route.ts), porque o WhatsApp não mostra
 * miniatura de WebP, que é o que o Engine entrega. ?v muda quando a capa muda.
 */
export const LARGURA_DA_CAPA = 1200;

type Capa = { photo: PublicMediaData | null } | null;

export function fotoDaCapa(capa: Capa): { fonte: string; width: number; height: number } | null {
  const foto = capa?.photo;
  if (!foto) return null;
  if (foto.kind === 'video') return foto.poster ? { fonte: foto.poster, width: foto.width, height: foto.height } : null;
  const maior = [...foto.sources].sort((a, b) => b.width - a.width)[0];
  if (!maior || maior.width <= foto.width) return { fonte: foto.url, width: foto.width, height: foto.height };
  return { fonte: maior.url, width: maior.width, height: Math.round((maior.width * foto.height) / foto.width) };
}

export function imagemDaCapa(slug: string, capa: Capa) {
  const foto = fotoDaCapa(capa);
  if (!foto || !foto.width || !foto.height) return null;
  let h = 5381;
  for (const c of foto.fonte) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
  /* A largura de saída segue a maior fonte; a proporção é a da foto. */
  const width = Math.min(LARGURA_DA_CAPA, foto.width);
  return { url: `/capa/${slug}.jpg?v=${h.toString(36)}`, width, height: Math.round((width * foto.height) / foto.width) };
}
