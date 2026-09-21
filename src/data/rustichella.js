/*
 * CONTEUDO PROVISORIO — jantar Bistrô Nicolini × Rustichella d'Abruzzo.
 *
 * Fonte unica da landing do evento. Nao se mistura com `bistro.js` de
 * proposito: o jantar tem data, horario, preco e canal de reserva proprios, e
 * some da casa depois de outubro. O endereco e o contato continuam vindo de
 * `casa.js` — o jantar acontece na mesma casa, entao duplicar a rua seria
 * criar duas versoes da mesma verdade.
 *
 * Os textos desta revisao vieram do `TEXTOS-RUSTICHELLA.md` na raiz da pasta de
 * trabalho, escritos pelo cliente, mais o release enviado a imprensa
 * ("Release Nicolini e Rustichella.docx"). O release e hoje a fonte mais
 * confiavel dos fatos do evento: e o que ja esta na mao dos jornalistas.
 *
 * O que e MOCKUP e precisa de correcao antes de publicar esta marcado com
 * `CONFIRMAR` na linha. Nao publicar a pagina sem varrer esses pontos.
 */

/*
 * Credito da fotografia enviada pelo cliente em setembro de 2026. Vale para as
 * fotos do pastificio e da delegacao feitas por ele: `cozinhando`, `trigo`,
 * `secagem`, `max-mariola`, `chef-massa`, `servico` e os dois retratos.
 *
 * NAO vale para o que entrou depois, em setembro, pelo doc de textos:
 * `trafila.jpg` (veio da pasta de assets antiga, autoria desconhecida),
 * `penne.webp` e `secagem-lenta.webp` (material de marketing da propria
 * Rustichella) e `al-dente.jpg` (banco de imagens). CONFIRMAR de quem sao
 * antes de publicar — por isso o credito nao aparece mais como assinatura
 * unica da tira.
 */
export const creditoFotos = 'Giovanni Galati / Divulgação';

export const evento = {
  /*
   * Linha de apresentacao sob o titulo. Quem chega pela bio do Instagram nao
   * sabe o que e a Rustichella: um rotulo em caixa alta nao resolveria isso.
   */
  resumo:
    'Um dos pastifícios mais renomados da Itália chegará a Caxias do Sul, trazendo a proprietária Stefania juntamente de seu Chef estrelado Emmanuel di Liddo, marcando três noites inesquecíveis com a mais alta gastronomia no Bistrô Nicolini.',
  /*
   * O titulo agora e o encontro das duas casas, escrito por extenso. A unica
   * quebra possivel e depois do "&": os espacos internos de cada marca sao
   * rigidos (` ` de um lado, `white-space: nowrap` no `em` do outro),
   * senao a linha partiria em "Nicolini & Rustichella / d'Abruzzo", que separa
   * o nome da convidada do seu proprio sobrenome.
   */
  titulo: { casa: 'Nicolini', convidada: 'Rustichella d’Abruzzo' },
  cidade: 'Caxias do Sul',
  anfitriao: 'Bistrô Nicolini',
  convidada: 'Rustichella d’Abruzzo',
  logo: '/media/rustichella/logo-rustichella.png',
  /*
   * A espiga e mascara, nao imagem: o PNG so carrega o canal alfa e a cor vem
   * do CSS (`background: currentColor`). Foi assim que ela pode aparecer verde
   * sobre o creme e clara sobre a faixa escura sem duas versoes do arquivo.
   *
   * Origem: o EPS que veio da pasta de assets trazia um preview TIFF embutido,
   * de onde o desenho foi extraido e limpo. Se um dia aparecer o vetor de
   * verdade, e so trocar por um SVG e apagar a mascara.
   */
  espiga: '/media/rustichella/espiga.png',
  hero: {
    /*
     * O arquivo anterior (`campo.jpg`) tinha 696px de largura para uma faixa
     * que ocupa a tela inteira: numa tela de 1440 ele era ampliado mais de tres
     * vezes. Este veio do cliente ja tratado e reamostrado, e foi reduzido para
     * 2000px — acima disso o ganho na tela nao paga o peso do download.
     *
     * CONFIRMAR: se este campo e mesmo do Abruzzo. A legenda e o `alt` evitam
     * afirmar isso ate o cliente responder.
     */
    foto: '/media/rustichella/campo-alta.jpg',
    alt: 'Campo de trigo maduro ao pé de uma montanha, sob céu limpo',
  },
  /*
   * A foto que fecha a secao de localizacao. Vertical no arquivo e cortada em
   * faixa larga, entao o enquadramento sobe um pouco (ver `.cozinha--local`)
   * para pegar as luminarias e a folhagem das vigas, nao so os tampos.
   */
  local: {
    foto: '/media/rustichella/salao-bistro.jpg',
    alt: 'Mesas postas no salão do Bistrô Nicolini, com luminárias acesas sobre as vigas',
  },
  datas: '8, 9 e 10 de outubro',
  ano: '2026',
  diasDaSemana: 'Quinta, sexta e sábado',
  horario: '20h', // CONFIRMAR: horario de chegada e de inicio do servico.
  /*
   * SEM USO hoje: a grade de reserva em tres colunas que exibia preco saiu, no
   * lugar de uma tarja curta (decisao do cliente, para nao repetir a mesma
   * informacao tres vezes na mesma pagina). Fica guardado porque o valor real
   * ainda deve chegar e a tarja pode passar a exibi-lo.
   */
  preco: 'R$ 000 por pessoa', // MOCKUP
  precoNota: 'Valor e forma de pagamento a confirmar.', // MOCKUP
};

/*
 * As tres fotos da abertura, numa so moldura, uma de cada vez.
 *
 * Voltou a ser um trilho a pedido do cliente — mas o de `CasaFotos`, que anda
 * so quando alguem manda, nao o antigo, que trocava sozinho a cada cinco
 * segundos e escondia dois tercos do proprio conteudo atras do tempo. O
 * contador embaixo avisa quantas sao, que e o que faltava.
 *
 * CONFIRMAR: `penne.webp` e material de marketing da Rustichella e traz um
 * vidro de molho de outra marca (Terlato Kitchen) em cena. Conferir com o
 * cliente se isso pode aparecer numa peca da casa.
 */
export const aberturaFotos = [
  {
    src: '/media/rustichella/campos-abruzzo.jpg',
    alt: 'Espigas de trigo duro maduras em primeiro plano, com colinas cultivadas ao fundo',
    legenda: 'Campos da Rustichella, em Abruzzo.',
  },
  {
    src: '/media/rustichella/penne.webp',
    alt: 'Pacote de penne Rustichella d’Abruzzo sobre a bancada, com massa e molho ao lado',
    legenda: 'Massa de grano duro, de secagem lenta.',
  },
  {
    src: '/media/rustichella/secagem.jpg',
    /* A legenda dizia "ao fim das 40 horas de secagem", numero que o cliente
     * falou por telefone. O release diz "ate 50 horas" e e o que o texto ao
     * lado afirma: em vez de manter dois numeros na mesma tela, a legenda
     * deixou de contar horas. CONFIRMAR qual e a verdade. */
    legenda: 'Massa longa ao fim da secagem lenta.',
  },
];

/*
 * A faixa de foto que faz a virada entre "o jantar" e os convidados.
 *
 * Nao e uma secao: e uma fotografia com legenda, e por isso nao tem `h2`. O
 * rotulo em caixa alta ("Em Abruzzo") saiu a pedido do cliente — a linha
 * abaixo ja diz de onde para onde, e o sobrescrito so repetia.
 *
 * O scrim dela corre da esquerda para a direita, e nao de baixo para cima como
 * o de `.cozinha`: sao duas sangrias na mesma pagina, e escurecer as duas pelo
 * mesmo lado faria a segunda parecer repeticao da primeira. A composicao ajuda
 * — a esquerda da foto e armario e potes, a acao esta no centro e a direita.
 */
export const sangria = {
  foto: '/media/rustichella/cozinhando.jpg',
  alt:
    'Stefania Peduzzi e o chef Emmanuel Di Liddo cozinhando lado a lado na cozinha do pastifício',
  linha: 'Da Itália, ao Bistrô.',
  legenda:
    'Stefania Peduzzi e o chef Emmanuel Di Liddo no pastifício, em Abruzzo.',
};

/*
 * Cinco tempos, sem foto nenhuma: os pratos ainda nao foram executados aqui, e
 * um grid de fotos genericas de massa envelheceria na primeira semana. O menu
 * e tipografico, como um menu impresso — e a sobremesa em aberto cabe nele sem
 * constrangimento, com `aDefinir`.
 *
 * Os rotulos de etapa ("Entrada", "Primeiro prato", "Segundo prato"...) sairam:
 * numa carta de cinco linhas o numeral ja diz a ordem, e a etapa escrita por
 * extenso dobrava a altura de cada tempo sem acrescentar informacao.
 */
export const tempos = [
  {
    id: 'entrada',
    ordem: 'I',
    nome: 'Paccherini all’Ananas e Blu alla Spirulina',
    descricao: 'Servidos com tartare fresca de peixe.',
  },
  {
    id: 'primo',
    ordem: 'II',
    nome: 'Tagliolino com trufas frescas',
    descricao: 'A trufa vai ralada à mesa, sobre a massa ainda quente.', // MOCKUP: modo de servico
  },
  {
    id: 'secondo',
    ordem: 'III',
    nome: 'Rustichelle, linha Gaetano',
    descricao: 'Cogumelos porcini salteados na manteiga e vinho branco.',
  },
  {
    id: 'terzo',
    ordem: 'IV',
    nome: 'Paccherini aos quatro tomates',
    descricao: 'O clássico assinado pela Rustichella d’Abruzzo.',
  },
  {
    id: 'dolce',
    ordem: 'V',
    nome: 'A anunciar',
    descricao: 'Será revelada em breve.',
    aDefinir: true,
  },
];

/*
 * A faixa que responde, sem texto corrido, as quatro perguntas que chegam por
 * WhatsApp: quando, que horas, o que se come e se ainda tem lugar.
 */
export const fatos = [
  { rotulo: 'Datas', valor: evento.datas, nota: evento.diasDaSemana },
  { rotulo: 'Serviço', valor: evento.horario, nota: 'Chegada a partir das 19h30' }, // MOCKUP: chegada
  { rotulo: 'Menu', valor: `${tempos.length} tempos`, nota: 'O mesmo nas três noites' },
  { rotulo: 'Lugares', valor: 'Limitados', nota: 'Reserva por WhatsApp' },
];

/*
 * A tira — cinco fotos com legenda, entre os convidados e o menu.
 *
 * Deixou de ser um album do pastificio ("De onde ela vem") e virou um
 * argumento em cinco passos: o grao, o bronze, a secagem, o resultado no prato
 * e o reconhecimento de quem cozinha. A ordem e a do release, e e ela que
 * responde o titulo da secao.
 *
 * Fica ANTES do menu de proposito: o assunto e por que esta massa merece um
 * jantar, e essa e a pergunta que a carta responde logo depois.
 *
 * Cinco tiles iguais, na mesma proporcao vertical. O destaque nao precisa vir
 * da grade: ele ja vem de uma foto em preto e branco entre quatro coloridas.
 *
 * `*assim*` marca italico na descricao — a mesma convencao do doc de textos
 * que o cliente edita. Ver `comEnfase` em `pages/Rustichella.jsx`.
 */
export const tira = [
  {
    id: 'grao',
    foto: '/media/rustichella/trigo.jpg',
    alt: 'Espigas de trigo duro maduras em primeiro plano, com colinas ao fundo',
    titulo: 'O grão',
    /* CONFIRMAR: se os campos sao da propria Rustichella ou de fornecedores
     * dela. A legenda evita afirmar propriedade ate o cliente responder. */
    descricao: 'O trigo *grano duro* garante o *al dente* perfeito.',
  },
  {
    id: 'bronze',
    foto: '/media/rustichella/trafila.jpg',
    alt: 'Massa sendo extrudada por uma trafila de bronze',
    titulo: 'O bronze',
    /*
     * O doc de textos trouxe aqui a legenda do grao ("O grano duro do Abruzzo,
     * de onde sai a semola da casa"), que nao descreve esta foto nem o titulo
     * dela. Reescrita no mesmo registro dos outros quatro. CONFIRMAR com o
     * cliente se era isso mesmo.
     */
    descricao:
      'A trafila de bronze deixa a superfície áspera o bastante para o molho grudar.',
  },
  {
    id: 'secagem',
    foto: '/media/rustichella/secagem-lenta.webp',
    alt: 'Massa longa pendurada em varas de madeira durante a secagem',
    titulo: 'Secagem',
    /* CONFIRMAR: o doc do cliente dizia 48 horas; o release, que ja esta com a
     * imprensa, diz ate 50, a no maximo 40 °C. Ficou 50 para a pagina nao
     * contradizer o release. */
    descricao: 'A secagem de até 50 horas preserva a estrutura e o sabor do trigo.',
  },
  {
    id: 'resultado',
    foto: '/media/rustichella/al-dente.jpg',
    alt: 'Spaghetti sendo retirado da panela com um pegador, ainda no ponto',
    titulo: 'O resultado',
    descricao:
      'Tais características resultam em uma massa com equilíbrio perfeito entre elasticidade, textura *al dente* e aroma.',
  },
  {
    id: 'reconhecimento',
    foto: '/media/rustichella/max-mariola.jpg',
    alt: 'O chef Max Mariola caminhando por um campo de trigo com massa longa na mão',
    titulo: 'Reconhecimento',
    /*
     * CONFIRMAR: autorizacao de uso de imagem. E figura publica em peca que
     * promove jantar pago — pedir confirmacao por escrito ao cliente.
     *
     * A legenda o coloca como quem aprecia a massa, nao como quem vem cozinhar.
     * Era o risco da versao anterior, numa landing que vai na bio do Instagram:
     * chef conhecido na pagina de um jantar pago le como "ele vem".
     */
    descricao:
      'E por isso é apreciada pelos melhores chefs da Itália, como Max Mariola.',
  },
];

/*
 * Duas pessoas, nao tres: a terceira integrante entrou numa versao anterior sem
 * sobrenome nem cargo confirmados e saiu por decisao do cliente. Se voltar, a
 * grade acomoda — mas `.delegacao` esta calibrada para dois retratos.
 *
 * Sem nota de apresentacao: a secao virou so os dois retratos com nome e cargo,
 * a pedido do cliente ("nenhum texto e necessario aqui"). Quem eles sao ja e
 * dito no texto da abertura e na legenda da sangria, logo acima.
 *
 * Os dois retratos foram trocados em setembro pelos oficiais enviados pelo
 * cliente. Os anteriores vinham de veiculos de terceiros, com marca d'agua, e
 * carregavam um problema de direito de imagem que estes resolvem.
 */
export const delegacao = [
  {
    id: 'stefania',
    nome: 'Stefania Peduzzi',
    papel: 'Proprietária, Rustichella d’Abruzzo',
    foto: '/media/rustichella/retrato-stefania.jpg',
    alt: 'Retrato de Stefania Peduzzi segurando uma embalagem da Rustichella d’Abruzzo',
  },
  {
    id: 'emmanuel',
    nome: 'Emmanuel Di Liddo',
    papel: 'Chef Ambassador',
    foto: '/media/rustichella/retrato-emmanuel.jpg',
    alt: 'Retrato do chef Emmanuel Di Liddo de dólmã e avental brancos',
  },
];

/*
 * Ficha da massa. SEM USO hoje: a secao "A casa de Abruzzo", que a exibia, saiu
 * quando a abertura virou foto + texto. Fica guardada porque esta pasta nao
 * tem Git — apagar aqui e perder de vez. Se nao voltar a ser usada ate a
 * publicacao, remover.
 *
 * O formato de lista de atributos e um aceno ao catalogo da propria
 * Rustichella, que descreve cada linha assim.
 *
 * Os valores foram acertados pelo release de setembro de 2026, que e a fonte
 * mais confiavel que existe hoje: semola selecionada de trigo duro, agua de
 * montanha do Abruzzo, trafila de bronze e secagem de ate 50 horas a no maximo
 * 40 °C. Substituem a faixa de "24 a 48 horas" tirada do catalogo da linha
 * PrimoGrano, que descrevia so aquela linha.
 */
export const ficha = [
  { termo: 'Origem', valor: 'Abruzzo, Itália' },
  { termo: 'Matéria-prima', valor: 'Sêmola selecionada de grano duro' },
  { termo: 'Trefilação', valor: 'Trafila de bronze' },
  { termo: 'Secagem', valor: 'Lenta, de até 50 horas, a no máximo 40 °C' },
];

/* O espelho da navegacao das outras paginas: as ancoras da propria pagina, o
 * fio, e a casa vizinha. Ver `navBistro` em `bistro.js`. */
export const navEvento = [
  { tipo: 'ancora', id: 'o-jantar', rotulo: 'O jantar' },
  { tipo: 'ancora', id: 'o-menu', rotulo: 'O menu' },
  { tipo: 'ancora', id: 'reserva', rotulo: 'Reserva' },
  { tipo: 'rota', to: '/bistro', rotulo: 'Bistrô' },
];
