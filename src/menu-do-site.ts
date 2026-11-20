/*
 * O menu do site e as peças que dependem de módulo do Engine. É configuração
 * do próprio site (SPEC D15, SPEC-SITE §1.6). Ligar um módulo na ativação é
 * trocar o valor dele aqui para `true`. Exceção: as categorias de Produtos no
 * header vêm do Engine (veja `CATEGORIAS_NA_LINHA`, abaixo).
 *
 * Hoje cada módulo vale `laboratorio`: aceso no `next dev` (com dados
 * simulados) e apagado no build de produção. Apagado quer dizer: o item some do
 * menu e do rodapé, a página responde 404 e nenhum bloco da home aparece.
 * O teste (scripts/testar-rotas.mjs) confere isso no build de produção.
 */
export const modulos = {
  /** /produtos, /produtos/[categoria], /produto/[slug], as categorias no header e o destaque da home. */
  produtos: true,
  /**
   * O item "Blog" no menu (o grupo da casa no header e o rodapé). Aceso desde
   * 19/11/2026 (decisão de Pedro no header novo). As páginas /blog… respondem
   * pelo Blog do Engine (404 com ele desligado).
   */
  blog: true,
  /**
   * O item "Eventos" no menu, ao lado do Bistrô. Aceso desde 12/11/2026 (pedido
   * de Pedro): a Rustichella está publicada no Engine. As páginas /eventos e
   * /eventos/[slug] respondem pelo Blog do Engine (404 com ele desligado).
   */
  eventos: true,
  /** A sacola (ícone, painel e /sacola) e o recibo (/pedido). Pede `produtos`. */
  pedidos: true,
  /** /politica-de-privacidade. Texto ainda não aprovado: acende com Pedidos. */
  privacidade: true,
};

/*
 * Peças de loja completa (DESIGN-BRIEF §6, SPEC-SITE §8).
 *
 * DECISÃO DE PEDRO (12/11/2026): o header é o do protótipo do e-commerce como
 * ele é, e as peças dele que o brief mandava guardar ficam À VISTA, MAS
 * TRAVADAS: não executam nada, não levam a página que não existe, não chamam
 * rede, não coletam dado e são anunciadas como desativadas. Pedro decide depois
 * o que cada uma faz; acender a função de qualquer uma pede spec próprio.
 *
 * - 'travada': aparece, desativada (as do header);
 * - 'ativa': funciona (megaMenu e, provisoriamente, a busca);
 * - 'apagada': não é desenhada (as de fora do header).
 */
export const pecasDeLoja = {
  /* PROVISÓRIO (demonstração, 12/11/2026): a busca vale 'ativa' e leva a /produtos?busca=. Pedro desfaz depois. */
  busca: 'ativa',
  /* A casa não vai ter CEP (Pedro, 19/11/2026): no lugar dele, "Visite-nos ↗" (Cabecalho.tsx). */
  cep: 'apagada',
  conta: 'travada',
  curtidos: 'travada',
  /* Destravado em 12/11/2026 (pedido de Pedro): abre a lista das categorias de Produtos. */
  megaMenu: 'ativa',
  newsletter: 'apagada',
  selosDePagamento: 'apagada',
} as const;

/*
 * A tarja preta (Pedro, 19/11/2026): DESLIGADA até haver um anúncio de verdade
 * (um evento, as encomendas de Natal, um horário especial). Para ligar, troque
 * `modo` e o `texto`:
 * - 'empurra': desce do alto 5 s depois de o header ficar completo, empurrando
 *   o header para baixo; some quando a pessoa volta ao topo da página;
 * - 'flutuante': uma pílula escura embaixo, no centro, 5 s depois, com ✕.
 * O CEP saiu dela (a casa não vai ter CEP). O texto do protótipo do e-commerce
 * ("Entrega grátis em Caxias do Sul") é promessa que a casa não fez.
 */
export const faixa: { modo: 'desligada' | 'empurra' | 'flutuante'; texto: string } = {
  modo: 'desligada',
  texto: 'Empório e Bistrô em Caxias do Sul',
};

/*
 * Conteúdo que espera confirmação da casa. Mesma regra dos módulos: aceso no
 * laboratório, apagado no build de produção até a casa confirmar (nada
 * fictício vai a público). Confirmado, troque para `true`.
 */
export const conteudoAConfirmar = {
  /** O bloco vermelho da home (tábua de frios), o mesmo do e-commerce. Confirmado por Pedro em 12/11/2026. */
  tabuaDeFrios: true,
};

export type ItemDoMenu = { rotulo: string; href: string; aceso: boolean };

/*
 * As categorias do header (a linha de baixo, Departamentos e o menu do celular)
 * vêm do Engine desde 12/11/2026 (pedido de Pedro; antes eram uma lista fixa
 * aqui). São as categorias com produto no ar, na ordem do painel (Site →
 * Produtos → Categorias): criar, renomear, ordenar ou esvaziar uma categoria
 * no painel muda o header em até 60 s, sem deploy. Categoria sem produto no ar
 * não aparece (não há link para página vazia).
 *
 * A linha de baixo mostra as primeiras `CATEGORIAS_NA_LINHA` (a ordem do
 * painel decide quais); Departamentos e o menu do celular mostram todas. A
 * leitura é a mesma de /produtos, guardada por 60 s e dividida por todas as
 * páginas (src/moldura/Moldura.tsx). Só aparecem com Produtos aceso.
 */
export const CATEGORIAS_NA_LINHA = 5;

/*
 * O header novo (Pedro, 19/11/2026; protótipo em Site Nicolini/mockups/header,
 * a hipótese "1+"). A linha de baixo é de quem está na página: à esquerda, o
 * que tem dentro da parte do site em que se está; à direita, na cor da área, a
 * casa toda (`casaDoSite`), sempre igual, com a parte atual sublinhada.
 *
 * - Empório (home, produtos, A loja, sacola…), Blog e Eventos: à esquerda,
 *   Departamentos e as categorias. O Blog é do Empório e fala dos produtos dele.
 * - Bistrô e as landings de evento: à esquerda, a navegação delas
 *   (`navegacaoDaArea`), no lugar dos departamentos.
 */
export type Area = 'emporio' | 'bistro' | 'evento' | 'eventos' | 'blog';

export function areaDoEndereco(pathname: string): Area {
  const p = pathname.toLowerCase();
  if (p === '/bistro' || p.startsWith('/bistro/')) return 'bistro';
  if (p === '/rustichella') return 'evento';
  if (p === '/eventos' || p.startsWith('/eventos/')) return 'eventos';
  if (p === '/blog' || p.startsWith('/blog/')) return 'blog';
  return 'emporio';
}

/* Qual item do grupo da casa fica sublinhado em cada área. */
export const casaDaArea: Record<Area, string> = { emporio: '/', bistro: '/bistro', evento: '/eventos', eventos: '/eventos', blog: '/blog' };

export const casaDoSite: ItemDoMenu[] = [
  { rotulo: 'Empório', href: '/', aceso: true },
  { rotulo: 'Bistrô', href: '/bistro', aceso: true },
  { rotulo: 'Eventos', href: '/eventos', aceso: modulos.eventos },
  { rotulo: 'Blog', href: '/blog', aceso: modulos.blog },
];

/* A navegação de dentro das áreas que têm a sua. O título abre o bloco no menu do celular. */
export const navegacaoDaArea: Partial<Record<Area, { titulo: string; itens: { rotulo: string; href: string }[] }>> = {
  bistro: {
    titulo: 'Bistrô',
    itens: [
      { rotulo: 'O Bistrô', href: '#o-bistro' },
      { rotulo: 'Cardápio', href: '/menu/' },
      { rotulo: 'Reservas', href: '/menu/#/reserva' },
      { rotulo: 'Como chegar', href: '#como-chegar' },
    ],
  },
  evento: {
    titulo: 'Rustichella',
    itens: [
      { rotulo: 'O jantar', href: '#o-jantar' },
      { rotulo: 'Os convidados', href: '#os-convidados' },
      { rotulo: 'O menu', href: '#o-menu' },
      { rotulo: 'Reservar', href: '#reserva' },
    ],
  },
};

/*
 * As páginas que abrem com foto ou vídeo na tela inteira. Nelas o header começa
 * curto e sem fundo sobre a abertura (logo, a casa, lupa e sacola) e fica
 * completo ao rolar; nas outras ele já nasce completo.
 */
export const paginasComAbertura = ['/', '/bistro', '/rustichella'];

/* O rodapé: as páginas da casa. */
export const menuPrincipal: ItemDoMenu[] = [
  { rotulo: 'Blog', href: '/blog', aceso: modulos.blog },
  { rotulo: 'Eventos', href: '/eventos', aceso: modulos.eventos },
  { rotulo: 'Bistrô', href: '/bistro', aceso: true },
];

export const todosOsProdutos: ItemDoMenu = { rotulo: 'Todos os produtos', href: '/produtos', aceso: modulos.produtos };

export const lojaFisica: ItemDoMenu = { rotulo: 'Loja física', href: '/a-loja', aceso: true };

export const itensAcesos = (itens: ItemDoMenu[]) => itens.filter((item) => item.aceso);
