/*
 * DADOS SIMULADOS DO LABORATÓRIO. Só o `next dev` chega aqui: as camadas
 * (src/engine/fonte.ts e navegador.ts) importam esta pasta atrás de
 * `laboratorio`, que é `false` no build de produção, e o teste confere que nada
 * daqui aparece no build. Nada disto é conteúdo real: produtos, preços, matérias
 * e eventos são exemplos para desenhar as telas e os estados.
 *
 * Cada objeto segue À RISCA os tipos do SDK público (src/engine/sdk-0.7.0), para
 * a Etapa 3 só trocar a fonte. As fotos são as que o site já publica em
 * public/media (nenhuma foto nova vai ao ar por causa do laboratório).
 */
import type {
  BlogBlockData,
  BlogCategoryData,
  BlogPostData,
  PublicMediaData,
  PublicOrderConfigData,
  PublicProductCategoryData,
  PublicProductData,
} from '../sdk-0.7.0/index.js';

/** Marca que o teste procura no build de produção: não pode aparecer lá. */
export const MARCA_DO_LABORATORIO = 'dados-simulados-do-laboratorio-nicolini';

const uuid = (n: number) => `5a1a0000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`;

function foto(url: string, width: number, height: number, alt: string, x = 0.5, y = 0.5): PublicMediaData {
  return { kind: 'image', url, width, height, alt, focus: { x, y }, sources: [{ url, width }] };
}

/* As fotos que o site já tem, com as medidas reais. */
const F = {
  queijos: (alt: string, y = 0.5) => foto('/media/category-queijos.jpg', 1200, 1500, alt, 0.5, y),
  queijaria: (alt: string) => foto('/media/loja/queijaria.jpg', 1200, 1500, alt, 0.5, 0.2),
  balcaoQueijos: (alt: string) => foto('/media/loja/loja-9.jpg', 1238, 1500, alt),
  charcutaria: (alt: string, y = 0.5) => foto('/media/category-charcutaria.jpg', 1050, 1500, alt, 0.5, y),
  prateleira: (alt: string) => foto('/media/loja/prateleira.jpg', 1200, 1500, alt),
  frios: (alt: string) => foto('/media/loja/loja-8.jpg', 1100, 1500, alt),
  geladeira: (alt: string) => foto('/media/loja/loja-7.jpg', 1200, 1500, alt),
  massas: (alt: string, y = 0.5) => foto('/media/category-massas.jpg', 1200, 1500, alt, 0.5, y),
  massasBlog: (alt: string) => foto('/media/blog/massas.jpg', 1166, 1500, alt),
  massasPrateleira: (alt: string) => foto('/media/loja/loja-2.jpg', 1000, 1500, alt),
  alDente: (alt: string) => foto('/media/rustichella/al-dente.jpg', 1200, 1600, alt),
  chefMassa: (alt: string) => foto('/media/rustichella/chef-massa.jpg', 1273, 844, alt),
  vinhos: (alt: string) => foto('/media/category-vinhos.jpg', 1200, 1500, alt),
  rotulos: (alt: string) => foto('/media/loja/loja-1.jpg', 1200, 1500, alt),
  estanteVinhos: (alt: string) => foto('/media/loja/loja-3.jpg', 1200, 1500, alt),
  espumante: (alt: string) => foto('/media/loja/loja-4.jpg', 1200, 1500, alt, 0.4, 0.5),
  adega: (alt: string) => foto('/media/loja/loja-5.jpg', 1000, 1500, alt),
  conservas: (alt: string) => foto('/media/category-conservas.jpg', 1202, 1500, alt),
  parede: (alt: string) => foto('/media/loja/loja-6.jpg', 1000, 1500, alt),
  salmao: (alt: string) => foto('/media/blog/salmao.jpg', 1125, 1500, alt),
  rigatoni: (alt: string) => foto('/media/bistro/galeria/rigatoni.jpg', 923, 1200, alt),
  salaoBistro: (alt: string) => foto('/media/rustichella/salao-bistro.jpg', 1290, 1647, alt),
  servico: (alt: string) => foto('/media/rustichella/servico.jpg', 1067, 1600, alt),
  cozinhando: (alt: string) => foto('/media/rustichella/cozinhando.jpg', 1200, 900, alt),
};

/* ── Produtos ─────────────────────────────────────────────────────────────── */

export const categoriasDeProdutos: PublicProductCategoryData[] = [
  { slug: 'queijos', name: 'Queijos', description: 'Dos grandes franceses aos italianos de longa maturação.', count: 0 },
  { slug: 'charcutaria', name: 'Charcutaria', description: 'Do jamón ao Parma, cortes fatiados na hora.', count: 0 },
  { slug: 'massas', name: 'Massas', description: 'Massas italianas, do grano duro à fresca.', count: 0 },
  { slug: 'vinhos', name: 'Vinhos', description: 'Garrafas para abrir agora ou para guardar na adega.', count: 0 },
  { slug: 'conservas', name: 'Conservas', description: 'Latas, vidros e preparos com padrão Nicolini.', count: 0 },
];

type NovoProduto = Omit<PublicProductData, 'id' | 'currency' | 'photo' | 'category' | 'stepGrams' | 'minGrams' | 'sizeLabel' | 'featured' | 'available'> &
  Partial<Pick<PublicProductData, 'stepGrams' | 'minGrams' | 'sizeLabel' | 'featured' | 'available'>>;

let proximo = 1;
function produto(p: NovoProduto): PublicProductData {
  const categoria = categoriasDeProdutos.find((c) => c.slug === p.categorySlug)!;
  const porPeso = p.saleMode === 'weight';
  return {
    id: uuid(proximo++),
    currency: 'BRL',
    featured: false,
    available: true,
    ...p,
    sizeLabel: porPeso ? null : (p.sizeLabel ?? null),
    stepGrams: porPeso ? (p.stepGrams ?? 100) : null,
    minGrams: porPeso ? (p.minGrams ?? 100) : null,
    photo: p.photos[0] ?? null,
    category: { slug: categoria.slug, name: categoria.name },
  };
}

export const produtos: PublicProductData[] = [
  /* Queijos: 14, para a categoria ter "ver mais" (12 por página). */
  produto({
    slug: 'parmigiano-reggiano-24-meses', name: 'Parmigiano Reggiano 24 meses', brand: 'Caseificio Bertinelli',
    saleMode: 'weight', priceCents: 23990, stepGrams: 100, minGrams: 200, featured: true, categorySlug: 'queijos',
    origin: 'Parma, Itália',
    description: 'Dois anos de cura em Parma. Pasta granulosa, cristais que estalam e um fim longo de nozes tostadas. Cortado na hora, no balcão, na espessura que você pedir.',
    photos: [F.queijos('Peças de Parmigiano Reggiano na queijaria'), F.queijaria('Balcão de queijos da Nicolini'), F.balcaoQueijos('Queijos curados no balcão')],
  }),
  produto({
    slug: 'grana-padano-dop', name: 'Grana Padano D.O.P.', brand: 'Zanetti', saleMode: 'weight', priceCents: 15990,
    stepGrams: 100, minGrams: 200, categorySlug: 'queijos', origin: 'Lombardia, Itália',
    description: 'Mais delicado que o Parmigiano, com doçura de leite e textura firme. Para ralar sobre a massa ou servir em lascas.',
    photos: [F.balcaoQueijos('Grana Padano no balcão')],
  }),
  produto({
    slug: 'pecorino-romano', name: 'Pecorino Romano D.O.P.', brand: 'Locatelli', saleMode: 'weight', priceCents: 18900,
    stepGrams: 100, minGrams: 100, categorySlug: 'queijos', origin: 'Lácio, Itália',
    description: 'Leite de ovelha, sal e tempo. O queijo da carbonara e do cacio e pepe.',
    photos: [F.queijos('Pecorino Romano', 0.3)],
  }),
  produto({
    slug: 'prima-donna-maturo', name: 'Prima Donna Maturo', brand: 'Vandersterre', saleMode: 'weight', priceCents: 16990,
    stepGrams: 100, minGrams: 200, featured: true, categorySlug: 'queijos', origin: 'Holanda',
    description: 'De inspiração italiana e produção holandesa: pasta firme, cristais e uma doçura concentrada que pede pouco além de um bom pão.',
    photos: [F.queijaria('Prima Donna no balcão da queijaria')],
  }),
  produto({
    slug: 'comte-18-meses', name: 'Comté 18 meses', brand: 'Marcel Petite', saleMode: 'weight', priceCents: 32990,
    stepGrams: 100, minGrams: 200, available: false, categorySlug: 'queijos', origin: 'Jura, França',
    description: 'Afinado em caves de montanha. Notas de avelã, manteiga e frutas secas.',
    photos: [F.balcaoQueijos('Comté curado')],
  }),
  produto({
    slug: 'roquefort-aop', name: 'Roquefort A.O.P.', brand: 'Société', saleMode: 'unit', priceCents: 7490, sizeLabel: '100 g',
    categorySlug: 'queijos', origin: 'Aveyron, França',
    description: 'Azul de leite de ovelha, maturado nas grutas de Combalou. Salgado, cremoso e intenso.',
    photos: [F.queijos('Roquefort', 0.7)],
  }),
  produto({
    slug: 'brie-de-meaux', name: 'Brie de Meaux', brand: 'Donge', saleMode: 'unit', priceCents: 6890, sizeLabel: 'porção de 200 g',
    categorySlug: 'queijos', origin: 'Île-de-France, França',
    description: 'Casca florida e pasta que escorre no ponto certo. Sirva em temperatura ambiente.',
    photos: [F.queijaria('Brie de Meaux')],
  }),
  produto({
    slug: 'gorgonzola-dolce', name: 'Gorgonzola Dolce D.O.P.', brand: 'Igor', saleMode: 'unit', priceCents: 5490, sizeLabel: '150 g',
    categorySlug: 'queijos', origin: 'Piemonte, Itália',
    description: 'Cremoso e suave, para risotos, molhos e uma pera madura.',
    photos: [F.balcaoQueijos('Gorgonzola dolce')],
  }),
  produto({
    slug: 'queijo-canastra', name: 'Queijo Canastra curado', brand: 'Canastra Real', saleMode: 'unit', priceCents: 8900,
    sizeLabel: 'peça de 600 g', categorySlug: 'queijos', origin: 'Minas Gerais, Brasil',
    description: 'Leite cru e pingo, curado por 30 dias. Casca fina, interior amanteigado.',
    photos: [F.queijos('Queijo Canastra', 0.4)],
  }),
  produto({
    slug: 'manchego-curado', name: 'Manchego curado', brand: 'García Baquero', saleMode: 'weight', priceCents: 19990,
    stepGrams: 100, minGrams: 200, categorySlug: 'queijos', origin: 'La Mancha, Espanha',
    description: 'Ovelha manchega, doze meses de cura. Para a tábua, com marmelada.',
    photos: [F.queijaria('Manchego curado')],
  }),
  produto({
    slug: 'taleggio-dop', name: 'Taleggio D.O.P.', brand: 'Arrigoni', saleMode: 'unit', priceCents: 6290, sizeLabel: '200 g',
    categorySlug: 'queijos', origin: 'Lombardia, Itália',
    description: 'Casca lavada, aroma marcante e sabor mais suave do que promete.',
    photos: [F.balcaoQueijos('Taleggio')],
  }),
  produto({
    slug: 'burrata-fresca', name: 'Burrata fresca', brand: null, saleMode: 'unit', priceCents: 3490, sizeLabel: 'unidade de 200 g',
    categorySlug: 'queijos', origin: 'Caxias do Sul, Brasil',
    description: 'Chega às quintas-feiras. Consumir em até três dias.',
    photos: [F.queijos('Burrata', 0.6)],
  }),
  produto({
    slug: 'mascarpone', name: 'Mascarpone', brand: 'Galbani', saleMode: 'unit', priceCents: 2890, sizeLabel: '250 g',
    categorySlug: 'queijos', origin: 'Lombardia, Itália',
    description: 'A base do tiramisù. Também vai bem num risoto no fim do fogo.',
    photos: [F.queijaria('Mascarpone')],
  }),
  produto({
    slug: 'parmigiano-36-meses-peca', name: 'Parmigiano Reggiano 36 meses, peça inteira', brand: 'Caseificio Bertinelli',
    saleMode: 'unit', priceCents: null, sizeLabel: 'peça de cerca de 38 kg', categorySlug: 'queijos', origin: 'Parma, Itália',
    description: 'A roda inteira, para restaurantes e grandes ocasiões. O valor depende do peso da peça disponível: fale com a casa.',
    photos: [F.queijos('Roda de Parmigiano Reggiano', 0.4)],
  }),

  /* Charcutaria */
  produto({
    slug: 'jamon-iberico-de-bellota', name: 'Jamón Ibérico de Bellota 100%', brand: 'Cinco Jotas', saleMode: 'weight',
    priceCents: 89000, stepGrams: 50, minGrams: 100, featured: true, categorySlug: 'charcutaria', origin: 'Jabugo, Espanha',
    description: 'Porco ibérico puro, criado solto e alimentado de bolotas. Cura de mais de três anos. Fatiado à mão no balcão.',
    photos: [F.charcutaria('Jamón ibérico fatiado na hora', 0.4), F.prateleira('Peças de jamón na prateleira'), F.frios('Seleção de frios Nicolini')],
  }),
  produto({
    slug: 'prosciutto-di-parma-24-meses', name: 'Prosciutto di Parma 24 meses', brand: 'Galloni', saleMode: 'weight',
    priceCents: 32900, stepGrams: 50, minGrams: 100, featured: true, categorySlug: 'charcutaria', origin: 'Parma, Itália',
    description: 'Só pernil, sal marinho e o ar de Langhirano. Doce, delicado, fatiado fino.',
    photos: [F.prateleira('Prosciutto di Parma')],
  }),
  produto({
    slug: 'mortadella-bologna-pistache', name: 'Mortadella Bologna I.G.P. com pistache', brand: 'Ceratti', saleMode: 'weight',
    priceCents: 9990, stepGrams: 100, minGrams: 100, categorySlug: 'charcutaria', origin: 'Bolonha, Itália',
    description: 'A clássica, com pistache. Fatiada fina para o sanduíche ou em cubos para o aperitivo.',
    photos: [F.frios('Mortadella com pistache')],
  }),
  produto({
    slug: 'salame-tipo-italiano', name: 'Salame tipo italiano fatiado', brand: 'Ceratti', saleMode: 'unit', priceCents: 2490,
    sizeLabel: '100 g', categorySlug: 'charcutaria', origin: 'São Paulo, Brasil',
    description: 'Moagem média, pimenta-do-reino e alho. Pronto para a tábua.',
    photos: [F.geladeira('Salame fatiado na geladeira')],
  }),
  produto({
    slug: 'guanciale-curado', name: 'Guanciale curado', brand: null, saleMode: 'unit', priceCents: 4590, sizeLabel: 'peça de 300 g',
    categorySlug: 'charcutaria', origin: 'Caxias do Sul, Brasil',
    description: 'Papada de porco curada com pimenta. A gordura que faz a carbonara.',
    photos: [],
  }),
  produto({
    slug: 'lombo-condimentado', name: 'Lombo condimentado', brand: 'Ceratti', saleMode: 'weight', priceCents: 12990,
    stepGrams: 100, minGrams: 100, categorySlug: 'charcutaria', origin: 'São Paulo, Brasil',
    description: 'Lombo suíno curado com ervas. Magro e perfumado.',
    photos: [F.charcutaria('Lombo condimentado', 0.7)],
  }),

  /* Massas */
  produto({
    slug: 'fettuccine-rustichella', name: 'Fettuccine', brand: "Rustichella d'Abruzzo", saleMode: 'unit', priceCents: 4290,
    sizeLabel: '500 g', featured: true, categorySlug: 'massas', origin: 'Abruzzo, Itália',
    description: 'Trafila de bronze e secagem lenta, a no máximo 40 °C. A superfície porosa segura o molho.',
    photos: [F.massasBlog('Pacotes de massa Rustichella'), F.alDente('Massa al dente'), F.chefMassa('Chef preparando massa')],
  }),
  produto({
    slug: 'paccheri-rigati', name: 'Paccheri rigati', brand: 'Giuseppe Cocco', saleMode: 'unit', priceCents: 3890,
    sizeLabel: '500 g', featured: true, categorySlug: 'massas', origin: 'Fara San Martino, Itália',
    description: 'Tubos largos e estriados, para ragù e frutos do mar.',
    photos: [F.massas('Paccheri na prateleira')],
  }),
  produto({
    slug: 'tagliatelle-all-uovo', name: "Tagliatelle all'uovo", brand: "Rustichella d'Abruzzo", saleMode: 'unit', priceCents: 3490,
    sizeLabel: '250 g', categorySlug: 'massas', origin: 'Abruzzo, Itália',
    description: 'Massa ao ovo em ninhos. Manteiga e sálvia bastam.',
    photos: [F.alDente("Tagliatelle all'uovo")],
  }),
  produto({
    slug: 'spaghetti-quadrati', name: 'Spaghetti quadrati', brand: 'Martelli', saleMode: 'unit', priceCents: 3290,
    sizeLabel: '500 g', categorySlug: 'massas', origin: 'Toscana, Itália',
    description: 'Seção quadrada, mordida firme. Para o alho, óleo e pimenta.',
    photos: [F.massasPrateleira('Spaghetti na prateleira')],
  }),
  produto({
    slug: 'rigatoni-grano-duro', name: 'Rigatoni', brand: 'Afeltra', saleMode: 'unit', priceCents: 3690, sizeLabel: '500 g',
    categorySlug: 'massas', origin: 'Gragnano, Itália',
    description: 'Massa de Gragnano I.G.P., da cidade que inventou a massa seca.',
    photos: [F.massas('Rigatoni', 0.3)],
  }),
  produto({
    slug: 'lasagna-all-uovo', name: "Lasagna all'uovo", brand: "Rustichella d'Abruzzo", saleMode: 'unit', priceCents: 3990,
    sizeLabel: '500 g', available: false, categorySlug: 'massas', origin: 'Abruzzo, Itália',
    description: 'Folhas finas, não precisam de pré-cozimento.',
    photos: [F.massasPrateleira("Lasagna all'uovo")],
  }),

  /* Vinhos */
  produto({
    slug: 'barolo-docg-2018', name: 'Barolo D.O.C.G. 2018', brand: 'Pio Cesare', saleMode: 'unit', priceCents: null,
    sizeLabel: 'garrafa 750 ml', categorySlug: 'vinhos', origin: 'Piemonte, Itália',
    description: 'Nebbiolo de Serralunga e La Morra. Poucas garrafas por safra: o valor e a disponibilidade são confirmados pela casa.',
    photos: [F.rotulos('Rótulos de vinho na estante')],
  }),
  produto({
    slug: 'chianti-classico-2021', name: 'Chianti Classico 2021', brand: 'Castello di Ama', saleMode: 'unit', priceCents: 21900,
    sizeLabel: 'garrafa 750 ml', featured: true, categorySlug: 'vinhos', origin: 'Toscana, Itália',
    description: 'Sangiovese de Gaiole. Cereja, violeta e acidez que pede comida.',
    photos: [F.vinhos('Garrafas de Chianti Classico')],
  }),
  produto({
    slug: 'champagne-brut-reserve', name: 'Champagne Brut Réserve', brand: 'Charles Heidsieck', saleMode: 'unit', priceCents: 59900,
    sizeLabel: 'garrafa 750 ml', categorySlug: 'vinhos', origin: 'Champagne, França',
    description: 'Metade de vinhos de reserva, longa permanência sobre as borras. Brioche e amêndoa.',
    photos: [F.espumante('Champagne na adega')],
  }),
  produto({
    slug: 'malbec-reserva', name: 'Malbec Reserva', brand: 'Catena Zapata', saleMode: 'unit', priceCents: 16900,
    sizeLabel: 'garrafa 750 ml', categorySlug: 'vinhos', origin: 'Mendoza, Argentina',
    description: 'Vinhedos de altitude. Fruta escura, taninos macios.',
    photos: [F.estanteVinhos('Malbec na estante')],
  }),
  produto({
    slug: 'espumante-nature', name: 'Espumante Nature', brand: 'Cave Geisse', saleMode: 'unit', priceCents: 15900,
    sizeLabel: 'garrafa 750 ml', categorySlug: 'vinhos', origin: 'Pinto Bandeira, Brasil',
    description: 'Método tradicional, sem açúcar de expedição. Da Serra Gaúcha.',
    photos: [F.adega('Espumantes na adega')],
  }),

  /* Conservas */
  produto({
    slug: 'pomodoro-san-marzano', name: 'Pomodoro San Marzano D.O.P.', brand: 'Mutti', saleMode: 'unit', priceCents: 6990,
    sizeLabel: 'lata 400 g', categorySlug: 'conservas', origin: 'Campânia, Itália',
    description: 'Tomates de solo vulcânico, inteiros e pelados. O molho começa aqui.',
    photos: [F.conservas('Latas de tomate na prateleira')],
  }),
  produto({
    slug: 'ventresca-de-atum', name: 'Ventresca de atum em azeite', brand: 'Ortiz', saleMode: 'unit', priceCents: 8990,
    sizeLabel: 'vidro 220 g', featured: true, categorySlug: 'conservas', origin: 'Cantábria, Espanha',
    description: 'A barriga do bonito-do-norte, a parte mais macia, em azeite de oliva.',
    photos: [F.parede('Conservas na parede da loja')],
  }),
  produto({
    slug: 'files-de-anchova', name: 'Filés de anchova em azeite', brand: 'Ortiz', saleMode: 'unit', priceCents: 6490,
    sizeLabel: 'lata 47,5 g', categorySlug: 'conservas', origin: 'Cantábria, Espanha',
    description: 'Limpas à mão, curadas no sal por meses.',
    photos: [F.conservas('Anchovas em lata')],
  }),
  produto({
    slug: 'azeite-extravirgem', name: 'Azeite extravirgem', brand: 'Frantoio Muraglia', saleMode: 'unit', priceCents: 14900,
    sizeLabel: 'garrafa 500 ml', categorySlug: 'conservas', origin: 'Puglia, Itália',
    description: 'Coratina de colheita precoce. Amargo e picante, como deve ser.',
    photos: [F.parede('Azeites na prateleira')],
  }),
];

for (const c of categoriasDeProdutos) c.count = produtos.filter((p) => p.categorySlug === c.slug).length;

/* ── Blog e eventos ───────────────────────────────────────────────────────── */

export const categoriasDoBlog: BlogCategoryData[] = [
  { slug: 'receita-do-mes', name: 'Receita do mês', count: 0 },
  { slug: 'origem', name: 'Origem', count: 0 },
  { slug: 'ingredientes', name: 'Ingredientes', count: 0 },
  { slug: 'a-mesa', name: 'À mesa', count: 0 },
];

let blocoId = 1;
const b = () => `b${blocoId++}`;
const p = (...trechos: Array<string | { text: string; bold?: true; italic?: true; href?: string }>): BlogBlockData => ({
  id: b(),
  type: 'paragraph',
  text: trechos.map((t) => (typeof t === 'string' ? { text: t } : t)),
});
const h = (text: string): BlogBlockData => ({ id: b(), type: 'heading', text });
const f = (photo: PublicMediaData, caption: string): BlogBlockData => ({ id: b(), type: 'photo', photo, caption });
const q = (text: string, source: string): BlogBlockData => ({ id: b(), type: 'quote', text, source });
const v = (videoId: string, caption: string): BlogBlockData => ({ id: b(), type: 'youtube', videoId, caption });

type NovaMateria = Omit<BlogPostData, 'id' | 'kind' | 'category' | 'event' | 'publishedAt' | 'updatedAt' | 'readingMinutes'> & {
  categoria?: string;
  evento?: BlogPostData['event'];
};

let proximaMateria = 1;
function materia(m: NovaMateria): BlogPostData {
  const { categoria, evento, ...resto } = m;
  const cat = categoria ? categoriasDoBlog.find((c) => c.slug === categoria)! : null;
  const palavras = m.blocks
    .map((bloco) => (bloco.type === 'paragraph' ? bloco.text.map((t) => t.text).join('') : 'text' in bloco ? bloco.text : ''))
    .join(' ')
    .split(/\s+/).length;
  return {
    id: uuid(1000 + proximaMateria++),
    kind: evento ? 'event' : 'article',
    category: cat ? { slug: cat.slug, name: cat.name } : null,
    event: evento ?? null,
    readingMinutes: Math.max(1, Math.round(palavras / 200)),
    publishedAt: `${m.date}T12:00:00.000Z`,
    updatedAt: `${m.date}T12:00:00.000Z`,
    ...resto,
  };
}

export const materias: BlogPostData[] = [
  materia({
    slug: 'rigatoni-ao-ragu-branco', categoria: 'receita-do-mes', date: '2026-11-10',
    title: 'Rigatoni ao ragù branco de linguiça',
    excerpt: 'A receita do mês é de domingo: linguiça, vinho branco, um rigatoni de Gragnano e paciência no fogo baixo.',
    cover: { type: 'video', videoId: 'ZZKuRH-wzAw', photo: F.rigatoni('Rigatoni ao ragù branco servido no bistrô') },
    blocks: [
      p('O ragù branco é o primo discreto do ragù de tomate. Sem o vermelho, o que aparece é a carne, o vinho e o tempo de panela. Pede uma massa de ', { text: 'superfície porosa', italic: true }, ', que segure o molho em vez de deixá-lo escorrer.'),
      h('O que vai na panela'),
      p({ text: 'Para quatro pessoas: ', bold: true }, '500 g de rigatoni, 400 g de linguiça fresca sem a pele, meia cebola, um talo de salsão, 150 ml de vinho branco seco, caldo, manteiga e Parmigiano Reggiano 24 meses.'),
      v('IPUPvuvZwIQ', 'Como a Rustichella faz a massa que vai neste prato.'),
      h('O passo a passo'),
      p('Doure a linguiça esfarelada até soltar a gordura. Junte a cebola e o salsão bem picados e deixe amolecer. Deglaceie com o vinho e, quando o álcool evaporar, cubra com caldo e deixe reduzir por quarenta minutos, mexendo de vez em quando.'),
      f(F.alDente('Massa al dente'), 'A massa vai para a panela do molho um minuto antes do ponto.'),
      p('Termine a massa na panela do ragù, com uma concha da água do cozimento. Fogo desligado, manteiga gelada e o queijo ralado na hora. Mexa até virar creme. Se quiser saber mais sobre a massa, leia ', { text: 'o que uma boa massa tem de especial', href: 'https://www.emporionicolini.com.br/blog/o-que-uma-boa-massa-tem' }, '.'),
      q('Quando a massa é boa, o molho não precisa esconder nada.', 'Cozinha do Bistrô Nicolini'),
    ],
  }),
  materia({
    slug: 'jamon-de-bellota', categoria: 'origem', date: '2026-11-03',
    title: 'Jamón de bellota: quando o tempo vira sabor.',
    excerpt: 'Raça, cura e serviço: os detalhes que fazem de uma fatia de bellota uma experiência completa.',
    cover: { type: 'photo', photo: F.prateleira('Peças de jamón na prateleira da Nicolini') },
    blocks: [
      p('No jamón de bellota, o sabor começa muito antes do corte. Raça, alimentação, cura e tempo se encontram numa fatia que pede atenção, não excesso.'),
      p('A alimentação à base de bolotas constrói uma gordura aromática e uma textura que se desfaz devagar. A cura concentra o sabor sem apagar a origem: cada produtor deixa uma assinatura própria.'),
      f(F.charcutaria('Jamón sendo fatiado à mão', 0.4), 'Fatiado à mão, no balcão, na hora.'),
      h('O que observar na hora de servir'),
      p('Deixe as fatias respirarem por alguns minutos. Uma temperatura amena revela a gordura, o perfume e a persistência. Prato neutro, pão, azeite suave e uma bebida seca bastam.'),
      q('A melhor fatia de jamón é a que ainda carrega o tempo na textura.', 'Balcão de charcutaria'),
    ],
  }),
  materia({
    slug: 'o-que-uma-boa-massa-tem', categoria: 'ingredientes', date: '2026-10-27',
    title: 'O que uma boa massa tem de especial?',
    excerpt: 'Sêmola, água, formato e tempo: os detalhes que fazem uma massa simples pedir menos molho, e entregar mais.',
    cover: { type: 'photo', photo: F.massasBlog('Massas italianas na prateleira') },
    blocks: [
      p('Uma boa massa parece um ingrediente simples, e é justamente aí que mora a exigência: poucos elementos, muito critério.'),
      h('Trafila de bronze'),
      p('A massa passa por moldes de bronze que deixam a superfície áspera. É essa rugosidade que segura o molho.'),
      f(F.chefMassa('Massa sendo preparada'), 'Secagem lenta, a no máximo 40 °C.'),
      p('Na panela, a diferença aparece: a massa cozinha por igual e mantém a mordida.'),
    ],
  }),
  materia({
    slug: 'salmao-selvagem-do-alasca', categoria: 'origem', date: '2026-10-20',
    title: 'Os segredos do salmão selvagem do Alasca.',
    excerpt: 'Rios frios, corridas longas e uma textura que chega à mesa com mais intensidade: o que observar antes da primeira garfada.',
    cover: { type: 'photo', photo: F.salmao('Salmão grelhado com brotos') },
    blocks: [
      p('O salmão selvagem do Alasca não começa na frigideira. Começa em águas frias e num ciclo de retorno que concentra sabor, gordura e textura.'),
      q('Quanto mais extraordinária a origem, menos a cozinha precisa falar alto.', 'Nicolini'),
      p('Chama alta por pouco tempo, sal na medida e um acompanhamento que deixe o peixe no centro da mesa.'),
    ],
  }),
  materia({
    slug: 'tagliatelle-manteiga-e-salvia', categoria: 'receita-do-mes', date: '2026-10-13',
    title: 'Tagliatelle com manteiga e sálvia',
    excerpt: 'Três ingredientes e dez minutos. A receita do mês de outubro mostra que uma boa massa ao ovo dispensa molho pesado.',
    cover: { type: 'video', videoId: '6nePg6yr_og', photo: null },
    blocks: [
      p('Derreta a manteiga com as folhas de sálvia até espumar e perfumar. Junte a massa escorrida, um pouco da água do cozimento e o queijo. Pronto.'),
      v('6nePg6yr_og', 'A massa ao ovo, feita em Abruzzo.'),
    ],
  }),
  materia({
    slug: 'prima-donna', categoria: 'ingredientes', date: '2026-10-06',
    title: 'Prima Donna: o que torna esse queijo tão especial?',
    excerpt: 'Cristais, maturação e textura: como reconhecer um queijo que atravessa a mesa com personalidade.',
    cover: { type: 'photo', photo: F.queijaria('Queijos no balcão da queijaria') },
    blocks: [p('De inspiração italiana e produção holandesa, o Prima Donna ocupa um lugar entre o queijo de mesa e o de cozinha.')],
  }),
  materia({
    slug: 'velho-mundo-ou-novo-mundo', categoria: 'a-mesa', date: '2026-09-29',
    title: 'Velho mundo ou novo mundo? Duas formas de contar uma mesma uva.',
    excerpt: 'Território, clima e estilo: um jeito simples de escolher entre tradição europeia e expressão contemporânea.',
    cover: { type: 'photo', photo: F.rotulos('Garrafas de vinho deitadas na adega') },
    blocks: [p('Velho e Novo Mundo não são lados opostos. São maneiras diferentes de deixar o lugar aparecer na mesma uva.')],
  }),
  materia({
    slug: 'bacalhau-escolha-corte-e-dessalga', categoria: 'ingredientes', date: '2026-09-22',
    title: 'Bacalhau: escolha, corte e dessalga.',
    excerpt: 'O que observar entre origem, espessura e preparo antes de levar o Gadus morhua para a panela.',
    cover: { type: 'photo', photo: F.conservas('Conservas na prateleira') },
    blocks: [p('No bacalhau, a escolha do corte já antecipa boa parte do preparo.')],
  }),
  materia({
    slug: 'uma-boa-tabua', categoria: 'a-mesa', date: '2026-09-15',
    title: 'Uma boa tábua começa antes do queijo.',
    excerpt: 'Textura, temperatura e contraste: pequenos critérios para deixar uma seleção falar por si.',
    cover: { type: 'photo', photo: F.balcaoQueijos('Queijos curados no balcão') },
    blocks: [p('Uma tábua boa tem três texturas, uma acidez e algo crocante.')],
  }),
  materia({
    slug: 'pomodoro-manjericao-e-azeite', categoria: 'receita-do-mes', date: '2026-09-08',
    title: 'Pomodoro, manjericão e um bom azeite',
    excerpt: 'A receita de setembro é a mais simples do ano, e por isso mesmo depende de cada ingrediente.',
    cover: { type: 'photo', photo: F.alDente('Massa ao pomodoro') },
    blocks: [p('Tomate San Marzano, alho, azeite e manjericão. Nada mais.')],
  }),
  materia({
    slug: 'trafila-de-bronze', categoria: 'origem', date: '2026-09-01',
    title: 'Trafila de bronze: o detalhe que segura o molho',
    excerpt: 'Uma visita a Abruzzo para entender por que a superfície da massa importa tanto quanto a farinha.',
    cover: { type: 'photo', photo: F.chefMassa('Massa fresca em Abruzzo') },
    blocks: [p('Em Pianella, a massa sai do bronze áspera ao toque.')],
  }),

  /* Eventos (matéria de tipo `event`). */
  materia({
    slug: 'noite-de-queijos-franceses', date: '2026-11-27',
    title: 'Noite de queijos franceses',
    excerpt: 'Seis queijos, três vinhos e a história de cada afinador, contada no balcão da queijaria.',
    cover: { type: 'photo', photo: F.queijaria('Balcão da queijaria Nicolini') },
    evento: { startsOn: '2026-11-27', endsOn: null, place: 'Empório Nicolini', landingPath: null },
    blocks: [
      p('Uma noite para provar devagar: Comté, Roquefort, Brie de Meaux, Époisses, Saint-Nectaire e um Mimolette de longa cura, cada um com um vinho escolhido pela casa.'),
      h('Como funciona'),
      p('Lugares limitados, no balcão. A reserva é feita pelo WhatsApp da loja.'),
    ],
  }),
  materia({
    slug: 'vinhos-do-piemonte', date: '2026-12-05',
    title: 'Degustação: vinhos do Piemonte',
    excerpt: 'Barbera, Barbaresco e Barolo lado a lado, com pratos do bistrô pensados para cada taça.',
    cover: { type: 'photo', photo: F.adega('Adega da Nicolini') },
    evento: { startsOn: '2026-12-05', endsOn: null, place: 'Bistrô Nicolini', landingPath: null },
    blocks: [p('Três vinhos, três pratos e uma conversa sobre Nebbiolo.')],
  }),
  materia({
    slug: 'nicolini-e-rustichella', date: '2026-10-08',
    title: "Bistrô Nicolini & Rustichella d'Abruzzo",
    excerpt: 'A casa de Abruzzo em Caxias do Sul: cinco tempos servidos em três noites, com Stefania Peduzzi e o chef Emmanuel di Liddo.',
    cover: { type: 'photo', photo: F.servico('Serviço do jantar Rustichella no Bistrô') },
    evento: { startsOn: '2026-10-08', endsOn: '2026-10-10', place: 'Bistrô Nicolini', landingPath: '/rustichella' },
    blocks: [],
  }),
  materia({
    slug: 'festa-da-charcutaria', date: '2026-08-22',
    title: 'Festa da charcutaria',
    excerpt: 'Uma tarde de cortes na hora, com produtores da Serra e do outro lado do Atlântico.',
    cover: { type: 'photo', photo: F.frios('Seleção de frios Nicolini') },
    evento: { startsOn: '2026-08-22', endsOn: null, place: 'Empório Nicolini', landingPath: null },
    blocks: [p('Foi uma tarde de fatiadoras ligadas.')],
  }),
];

for (const c of categoriasDoBlog) c.count = materias.filter((m) => m.kind === 'article' && m.category?.slug === c.slug).length;

/* ── Pedidos ──────────────────────────────────────────────────────────────── */

export const configDePedidos: PublicOrderConfigData = {
  accepting: true,
  notice: 'Retirada na loja, de segunda a sábado. Combinamos o horário pelo WhatsApp.',
  currency: 'BRL',
  limits: { items: 40, maxUnits: 99, maxGrams: 20000, customerNameMin: 2, customerName: 120, note: 500 },
};
