/*
 * Fonte unica do Bistro; `casa.js` continua sendo a do emporio.
 *
 * O Bistro Nicolini funciona no mezanino do Emporio Nicolini (mesmo endereco,
 * Avenida Abramo Randon, 1141), por isso o endereco vem de `casa.js` — duplicar
 * a rua seria criar duas versoes da mesma verdade. Telefone e WhatsApp de
 * reserva sao os mesmos da casa, coletados de listagens de terceiros; o e-mail
 * `@queijarianicolini.com.br` e provavel e ainda nao verificado. Os horarios
 * abaixo seguem provisorios — nao ha fonte publica confiavel para eles.
 * O Instagram proprio do bistro e @bistronicolini.
 */

export const bistro = {
  nome: 'Bistrô Nicolini',
  /* Duas variantes do mesmo desenho, ambas brancas. A completa traz a linha
   * "ALTA GASTRONOMIA", que so fica legivel a partir de uns 300px de largura;
   * abaixo disso usa-se a compacta. Ver o comentario dentro dos SVGs. */
  logo: '/media/bistro/logo-bistro.svg',
  logoCompacta: '/media/bistro/logo-bistro-compacta.svg',
  hero: {
    foto: '/media/bistro/hero.jpg',
    alt: 'Salão do Bistrô Nicolini à noite, com taças e luminárias acesas',
  },
  telefone: { exibicao: '(54) 3029-0217', link: '+555430290217' },
  whatsapp: { exibicao: '(54) 99959-2314', link: '5554999592314' },
  email: 'bistro@queijarianicolini.com.br',
  horarios: [
    { dia: 'Terça a quinta', hora: '12h às 15h · 19h às 23h' },
    { dia: 'Sexta e sábado', hora: '12h às 15h · 19h às 23h30' },
    { dia: 'Domingo', hora: '12h às 16h' },
    { dia: 'Segunda', hora: 'Fechado', fechado: true },
  ],
};

/*
 * Quatro pratos, nao o cardapio inteiro: a pagina mostra o repertorio e o
 * cardapio completo fica no PDF. Assim a secao nao envelhece a cada troca de
 * menu.
 */
export const pratos = [
  {
    id: 'rigatoni',
    nome: 'Carbonara Clássica',
    descricao:
      'Massa de secagem lenta, guanciale italiano, Pecorino Romano, gemas e pimenta-do-reino. Nada mais.',
    foto: '/media/bistro/prato-rigatoni.jpg',
  },
  {
    id: 'nhoque',
    nome: 'Nhoque com filé',
    descricao: 'Nhoque de batata, demi-glace e fonduta de parmesão.',
    foto: '/media/bistro/prato-nhoque.jpg',
  },
  {
    id: 'peixe',
    nome: 'Salmão',
    descricao: 'Salmão selvagem do Alasta e purê de abóbora.',
    foto: '/media/bistro/prato-peixe.jpg',
  },
  {
    id: 'cordeiro',
    nome: 'Carré de cordeiro',
    descricao: 'Crocante, acompanha farofa e purê.',
    foto: '/media/bistro/prato-cordeiro.jpg',
  },
];

/*
 * A galeria alterna salao, prato, gesto e detalhe de propósito: oito fotos de
 * comida em sequencia viram catalogo, e o assunto aqui e a casa.
 */
export const galeria = [
  {
    src: '/media/bistro/galeria/salao.jpg',
    alt: 'Mesa posta do bistrô com luminária acesa ao fundo',
  },
  {
    src: '/media/bistro/galeria/queijo.jpg',
    alt: 'Queijo sendo ralado à mesa sobre o nhoque',
  },
  {
    src: '/media/bistro/galeria/spaghetti.jpg',
    alt: 'Spaghetti servido com uma taça de tinto',
  },
  {
    src: '/media/bistro/galeria/rigatoni.jpg',
    alt: 'Rigatoni com guanciale visto de perto',
  },
  {
    src: '/media/bistro/galeria/sobremesa.jpg',
    alt: 'Sobremesa com tuile sendo quebrada à mesa',
  },
  {
    src: '/media/bistro/galeria/cozinha.jpg',
    alt: 'Prato em primeiro plano e a cozinha ao fundo',
  },
  {
    src: '/media/bistro/galeria/vinhos.jpg',
    alt: 'Rótulos italianos na adega do bistrô',
  },
  {
    src: '/media/bistro/galeria/livros.jpg',
    alt: 'Estante de livros de cozinha do bistrô',
  },
];

/* O espelho da navegacao do emporio: a casa em que voce esta, o pratico, e a
 * casa vizinha. Ver `navEmporio` em `casa.js`. */
export const navBistro = [
  { tipo: 'ancora', id: 'o-bistro', rotulo: 'O Bistrô' },
  { tipo: 'ancora', id: 'como-chegar', rotulo: 'Como chegar' },
  /*
   * TEMPORARIO — o jantar sai do site depois de outubro de 2026. Ao remover a
   * landing, remover esta entrada aqui E a gemea em `navEmporio` (`casa.js`): a rota
   * continuaria resolvendo (ver `App.jsx`), entao o link nao quebraria — so
   * ficaria anunciando no header um jantar que ja aconteceu, que e pior.
   */
  { tipo: 'rota', to: '/rustichella', rotulo: 'Jantar Rustichella' },
  { tipo: 'rota', to: '/', rotulo: 'Empório' },
];
