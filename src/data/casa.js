/*
 * Fonte única das informações institucionais.
 *
 * Endereço, telefone fixo, CNPJ e razão social foram coletados de registros
 * públicos (Receita Federal / ReceitaWS e diretórios locais) em setembro de
 * 2026 — confirmar antes de qualquer publicação. WhatsApp e horários vêm de
 * listagens de terceiros; o e-mail `@queijarianicolini.com.br` é um endereço
 * de marca provável, ainda não verificado.
 */

export const casa = {
  marca: 'NICOLINI',
  nome: 'Nicolini',
  descricao: 'Curadoria de produtos da alta gastronomia',
  endereco: {
    linha1: 'Avenida Abramo Randon, 1141',
    bairro: 'Interlagos',
    cidade: 'Caxias do Sul',
    estado: 'RS',
    cep: '95055-010',
  },
  telefone: { exibicao: '(54) 3029-0217', link: '+555430290217' },
  whatsapp: { exibicao: '(54) 99959-2314', link: '5554999592314' },
  email: 'contato@queijarianicolini.com.br',
  instagram: '@queijarianicolini',
  cnpj: '30.134.710/0001-75',
  razaoSocial: 'Queijaria Nicolini Ltda.',
  horarios: [
    { dia: 'Segunda a sábado', hora: '9h às 19h45' },
    { dia: 'Domingo', hora: 'Fechado', fechado: true },
  ],
  mapsBusca:
    'https://maps.app.goo.gl/oNC6Y24sixD76jHb9',
  mapsEmbed:
    'https://www.google.com/maps?q=Avenida+Abramo+Randon+1141+Caxias+do+Sul+RS&z=16&output=embed',
};

export const redes = [
  {
    id: 'instagram',
    icone: 'instagram',
    rotulo: 'Instagram',
    exibicao: casa.instagram,
    href: 'https://instagram.com/queijarianicolini',
  },
  {
    id: 'whatsapp',
    icone: 'whatsapp',
    rotulo: 'WhatsApp',
    exibicao: casa.whatsapp.exibicao,
    href: `https://wa.me/${casa.whatsapp.link}`,
  },
  {
    id: 'facebook',
    icone: 'facebook',
    rotulo: 'Facebook',
    exibicao: '/queijarianicolini',
    href: 'https://facebook.com/queijarianicolini',
  },
];

export const secoes = [
  { id: 'a-casa', rotulo: 'A casa' },
  { id: 'o-que-encontra', rotulo: 'O que encontra' },
  { id: 'blog', rotulo: 'Blog' },
  { id: 'contato', rotulo: 'Como chegar' },
];

export const setores = [
  {
    id: 'charcutaria',
    nome: 'Charcutaria',
    texto: 'Do Jàmon ao Parma, selecionamos os melhores embutidos do mundo.',
    destaque:
      'Cortes fatiados na hora, na espessura certa para valorizar o produto.',
    foto: '/media/category-charcutaria.jpg',
  },
  {
    id: 'queijos',
    nome: 'Queijos',
    texto: 'Dos grandes franceses aos italianos de longa maturação.',
    destaque:
      'Texturas, maturações e origens para descobrir e se encantar.',
    foto: '/media/category-queijos.jpg',
  },
  {
    id: 'massas',
    nome: 'Massas',
    texto: 'Massas italianas, do grano duro à fresca.',
    destaque:
      'Trafila de bronze, boa sêmola e tempo de secagem fazem diferença no prato.',
    foto: '/media/category-massas.jpg',
  },
  {
    id: 'vinhos',
    nome: 'Vinhos',
    texto: 'Garrafas para abrir agora e ou para guardar na adega.',
    destaque:
      'Seleção curada a dedo com os melhores vinhos no novo e velho mundo.',
    foto: '/media/category-vinhos.jpg',
  },
  {
    id: 'mercearia',
    nome: 'Conservas',
    texto: 'Latas, vidros e preparos com padrão Nicolini.',
    destaque:
      'Ingredientes de origem para sua receita ir além.',
    foto: '/media/category-conservas.jpg',
  },
];

/*
 * As fotos que giram dentro do quadro de "A casa". A primeira e a que abre a
 * secao, entao ela deve ser a mais representativa da loja.
 *
 * `prateleira.jpg` fica de fora de proposito: ela ja ilustra a materia de
 * charcutaria em `materias`, logo abaixo na mesma home.
 */
export const fotosDaCasa = [
  {
    src: '/media/loja/queijaria.jpg',
    alt: 'Interior da Nicolini, com a queijaria e sacolas da casa',
    legenda: 'Nosso espaço',
    /* Ancorada no topo: o corte do quadrado sai todo por baixo. Vale um
     * `foco` proprio sempre que a foto tiver um assunto fora do centro. */
    foco: '50% 0',
  },
  {
    src: '/media/loja/loja-8.jpg',
    alt: 'Seleção Nicolini preparada para presentear',
    legenda: 'Frios e embutidos',
  },
  {
    src: '/media/loja/loja-3.jpg',
    alt: 'Rótulos de vinho na estante da loja',
    legenda: 'Seleção de vinhos',
  },
  {
    src: '/media/loja/loja-2.jpg',
    alt: 'Massas italianas organizadas na prateleira',
    legenda: 'A prateleira de massas',
  },
];

export const materias = [
  {
    slug: 'presunto-cru',
    titulo: 'Jamón de bellota: quando o tempo vira sabor.',
    assunto: 'Origem',
    resumo:
      'Raça, cura e serviço: os detalhes que fazem de uma fatia de bellota uma experiência completa.',
    foto: '/media/loja/prateleira.jpg',
  },
  {
    slug: 'massa-seca',
    titulo: 'O que uma boa massa tem de especial?',
    assunto: 'Ingredientes',
    resumo:
      'Sêmola, água, formato e tempo: os detalhes que fazem uma massa simples pedir menos molho, e entregar mais.',
    foto: '/media/blog/massas.jpg',
  },
  {
    slug: 'salmao',
    titulo: 'Os segredos do salmão selvagem do Alasca.',
    assunto: 'Origem',
    resumo:
      'Rios frios, corridas longas e uma textura que chega à mesa com mais intensidade: o que observar antes da primeira garfada.',
    foto: '/media/blog/salmao.jpg',
  },
];

/*
 * A navegacao do header e por pagina, nao global: cada pagina mostra as suas
 * proprias ancoras e, depois do fio, a casa vizinha. Assim o header nunca
 * oferece uma secao que vive em outra pagina.
 *
 * `secoes` acima continua sendo a lista completa da home — e ela que o rodape
 * usa como indice, entao "O que encontra" e "Blog" seguem alcancaveis mesmo
 * fora do header.
 */
export const navEmporio = [
  { tipo: 'ancora', id: 'a-casa', rotulo: 'O Empório' },
  { tipo: 'ancora', id: 'contato', rotulo: 'Como chegar' },
  /*
   * TEMPORARIO — o jantar sai do site depois de outubro de 2026. Ao remover a
   * landing, remover esta entrada aqui E a gemea em `navBistro` (`bistro.js`): a rota
   * continuaria resolvendo (ver `App.jsx`), entao o link nao quebraria — so
   * ficaria anunciando no header um jantar que ja aconteceu, que e pior.
   */
  { tipo: 'rota', to: '/rustichella', rotulo: 'Jantar Rustichella' },
  { tipo: 'rota', to: '/bistro', rotulo: 'Bistrô' },
];
