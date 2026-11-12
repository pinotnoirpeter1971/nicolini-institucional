import { laboratorio } from './site';

/*
 * O menu do site e as peças que dependem de módulo do Engine. É configuração
 * do próprio site (SPEC D15, SPEC-SITE §1.6): o layout não pergunta nada ao
 * Engine. Ligar um módulo na ativação é trocar o valor dele aqui para `true`.
 *
 * Hoje cada módulo vale `laboratorio`: aceso no `next dev` (com dados
 * simulados) e apagado no build de produção. Apagado quer dizer: o item some do
 * menu e do rodapé, a página responde 404 e nenhum bloco da home aparece.
 * O teste (scripts/testar-rotas.mjs) confere isso no build de produção.
 */
export const modulos = {
  /** /produtos, /produtos/[categoria], /produto/[slug], as categorias no header e o destaque da home. */
  produtos: laboratorio,
  /** /blog, /blog/categoria/[slug], /blog/[slug] e o bloco Blog da home. */
  blog: laboratorio,
  /** /eventos e /eventos/[slug]. */
  eventos: laboratorio,
  /** A sacola (ícone, painel e /sacola) e o recibo (/pedido). Pede `produtos`. */
  pedidos: laboratorio,
  /** /politica-de-privacidade. Texto ainda não aprovado: acende com Pedidos. */
  privacidade: laboratorio,
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
 * - 'apagada': não é desenhada (as de fora do header).
 */
export const pecasDeLoja = {
  faixaDeAnuncio: 'travada',
  busca: 'travada',
  cep: 'travada',
  conta: 'travada',
  curtidos: 'travada',
  megaMenu: 'travada',
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
  /** O bloco vermelho da home (tábua de frios): texto e oferta vêm do protótipo do e-commerce. */
  tabuaDeFrios: laboratorio,
};

export type ItemDoMenu = { rotulo: string; href: string; aceso: boolean };

/* As categorias na linha de baixo do header, como no e-commerce. São
 * configuração do site (o layout não chama o Engine): o slug precisa existir
 * em Produtos. Só aparecem com Produtos aceso. */
export const categoriasNoMenu: ItemDoMenu[] = [
  { rotulo: 'Queijos', href: '/produtos/queijos', aceso: modulos.produtos },
  { rotulo: 'Charcutaria', href: '/produtos/charcutaria', aceso: modulos.produtos },
  { rotulo: 'Conservas', href: '/produtos/conservas', aceso: modulos.produtos },
  { rotulo: 'Massas', href: '/produtos/massas', aceso: modulos.produtos },
  { rotulo: 'Vinhos', href: '/produtos/vinhos', aceso: modulos.produtos },
];

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
