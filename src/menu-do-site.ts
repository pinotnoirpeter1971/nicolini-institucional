import { laboratorio } from './site';

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
  /** /blog, /blog/categoria/[slug], /blog/[slug] e o bloco Blog da home. */
  blog: laboratorio,
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
  faixaDeAnuncio: 'travada',
  /* PROVISÓRIO (demonstração, 12/11/2026): a busca vale 'ativa' e leva a /produtos?busca=. Pedro desfaz depois. */
  busca: 'ativa',
  cep: 'travada',
  conta: 'travada',
  curtidos: 'travada',
  /* Destravado em 12/11/2026 (pedido de Pedro): abre a lista das categorias de Produtos. */
  megaMenu: 'ativa',
  newsletter: 'apagada',
  selosDePagamento: 'apagada',
} as const;

/*
 * O texto da faixa de anúncio. O do protótipo ("Entrega grátis em Caxias do
 * Sul") é promessa comercial que a casa não fez, e nada fictício vai a público:
 * fica uma frase verdadeira até Pedro escolher a mensagem.
 */
export const textoDaFaixa = 'Empório e Bistrô em Caxias do Sul';

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

/* Depois das categorias: as páginas da casa (Eventos e Bistrô entram no header
 * do e-commerce, DESIGN-BRIEF §4). "Loja física" fica à direita. */
export const menuPrincipal: ItemDoMenu[] = [
  { rotulo: 'Blog', href: '/blog', aceso: modulos.blog },
  { rotulo: 'Eventos', href: '/eventos', aceso: modulos.eventos },
  { rotulo: 'Bistrô', href: '/bistro', aceso: true },
];

export const todosOsProdutos: ItemDoMenu = { rotulo: 'Todos os produtos', href: '/produtos', aceso: modulos.produtos };

export const lojaFisica: ItemDoMenu = { rotulo: 'Loja física', href: '/a-loja', aceso: true };

export const itensAcesos = (itens: ItemDoMenu[]) => itens.filter((item) => item.aceso);
