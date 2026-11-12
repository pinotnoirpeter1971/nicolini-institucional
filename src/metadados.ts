import type { Metadata } from 'next';

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
