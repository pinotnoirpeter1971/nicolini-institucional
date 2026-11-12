/*
 * LABORATÓRIO: o que o navegador pede ao Engine (sacola, envio, recibo e "ver
 * mais"), respondido com os dados simulados. Mesmas funções e mesmos erros do
 * SDK (`RestaurantsOrderError` com `reason` e `details`), para a sacola e o
 * recibo tratarem a resposta simulada exatamente como a real.
 *
 * O painel do laboratório escolhe o que o próximo envio responde (o "cenário")
 * e guarda tudo no localStorage deste navegador, com o prefixo
 * `nicolini:laboratorio:`.
 */
import {
  RestaurantsOrderError,
  lineTotalCents,
  orderQuantityProblem,
  type CreatePublicOrderInput,
  type OrderCurrentLineData,
  type OrderRejectedItem,
  type PublicOrderConfigData,
  type PublicOrderLineData,
  type PublicOrderReceiptData,
  type PublicProductCardData,
} from '../sdk-0.7.0/index.js';
import { configDePedidos, produtos } from './dados';
import { cartao } from './servidor';

export { fetchBlogPosts, fetchPublicProducts } from './servidor';

type Base = { apiBaseUrl: string; restaurantKey: string; signal?: AbortSignal };

export const CENARIOS = {
  normal: 'Envio normal',
  'preco-mudou': 'Preço mudou (uma vez)',
  'item-saiu': 'Um item saiu do ar (uma vez)',
  indisponivel: 'Um item ficou indisponível (uma vez)',
  pausada: 'Casa pausou os pedidos no envio',
  'nao-recebe': 'Casa não recebe pedidos (desde o início)',
  limite: 'Limite de pedidos atingido (429)',
  falha: 'Engine fora do ar no envio',
} as const;
export type NomeDoCenario = keyof typeof CENARIOS;

const CHAVE = 'nicolini:laboratorio:';
const ler = <T,>(nome: string, padrao: T): T => {
  try {
    const v = localStorage.getItem(CHAVE + nome);
    return v ? (JSON.parse(v) as T) : padrao;
  } catch {
    return padrao;
  }
};
const gravar = (nome: string, valor: unknown) => {
  try {
    localStorage.setItem(CHAVE + nome, JSON.stringify(valor));
  } catch {
    /* sem armazenamento: o laboratório só não lembra */
  }
};

export const cenarioAtual = (): NomeDoCenario => ler<NomeDoCenario>('cenario', 'normal');
export const escolherCenario = (nome: NomeDoCenario) => gravar('cenario', nome);

/* Mudanças feitas "no painel" pelo laboratório: valem para a releitura da sacola e para o envio. */
type Ajuste = { priceCents?: number; gone?: true; available?: false };
const ajustes = () => ler<Record<string, Ajuste>>('ajustes', {});
export function recomecar() {
  gravar('ajustes', {});
  gravar('cenario', 'normal');
}

function produtoAtual(id: string) {
  const ajuste = ajustes()[id];
  const p = produtos.find((x) => x.id === id);
  if (!p || ajuste?.gone) return null;
  return { ...p, ...(ajuste?.priceCents !== undefined ? { priceCents: ajuste.priceCents } : {}), ...(ajuste?.available === false ? { available: false } : {}) };
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ── Sacola ───────────────────────────────────────────────────────────────── */

export async function fetchPublicProductsByIds(input: Base & { ids: string[] }): Promise<PublicProductCardData[]> {
  await esperar(350);
  return [...new Set(input.ids)].map(produtoAtual).filter((p) => p !== null).map(cartao);
}

export async function fetchPublicOrderConfig(_input: Base): Promise<PublicOrderConfigData | null> {
  await esperar(150);
  return { ...configDePedidos, accepting: cenarioAtual() !== 'nao-recebe' };
}

/* ── Envio ────────────────────────────────────────────────────────────────── */

type Guardado = { chave: string; corpo: string; recibo: PublicOrderReceiptData };

export async function createPublicOrder(input: Base & { order: CreatePublicOrderInput }): Promise<PublicOrderReceiptData> {
  await esperar(700);
  const { order } = input;
  const corpo = JSON.stringify(order);
  const enviados = ler<Record<string, Guardado>>('enviados', {});

  /* Idempotência: a mesma chave com o mesmo corpo devolve o mesmo pedido. */
  const repetido = Object.values(enviados).find((e) => e.chave === order.idempotencyKey);
  if (repetido) {
    if (repetido.corpo !== corpo) throw new RestaurantsOrderError('Chave já usada com outro pedido.', 409, 'CONFLICT', 'idempotency_mismatch', null, null);
    return repetido.recibo;
  }
  if (enviados[order.token]) throw new RestaurantsOrderError('Este link já pertence a outro pedido.', 409, 'CONFLICT', 'token_in_use', null, null);

  const cenario = cenarioAtual();
  if (cenario === 'pausada' || cenario === 'nao-recebe')
    throw new RestaurantsOrderError('A casa não está recebendo pedidos agora.', 409, 'CONFLICT', 'not_accepting', null, null);
  if (cenario === 'limite')
    throw new RestaurantsOrderError('Muitos pedidos em pouco tempo.', 429, 'LIMIT', null, { retryAfterSeconds: 540 }, 540);
  if (cenario === 'falha') throw new RestaurantsOrderError('Serviço indisponível.', 503, 'TEMPORARY', null, null, null);

  /* Os cenários de uma vez mudam o primeiro item "no painel" e voltam ao normal. */
  const primeiro = order.items[0]?.productId;
  if (primeiro && (cenario === 'preco-mudou' || cenario === 'item-saiu' || cenario === 'indisponivel')) {
    const todos = ajustes();
    const atual = produtoAtual(primeiro);
    if (cenario === 'preco-mudou' && atual?.priceCents) todos[primeiro] = { priceCents: Math.round((atual.priceCents * 1.08) / 10) * 10 };
    if (cenario === 'item-saiu') todos[primeiro] = { gone: true };
    if (cenario === 'indisponivel') todos[primeiro] = { available: false };
    gravar('ajustes', todos);
    escolherCenario('normal');
  }

  const linhas: OrderCurrentLineData[] = [];
  const recusados: OrderRejectedItem[] = [];
  for (const item of order.items) {
    const p = produtoAtual(item.productId);
    if (!p) {
      recusados.push({ productId: item.productId, why: 'gone', message: 'Saiu do site.' });
      continue;
    }
    if (!p.available) {
      recusados.push({ productId: item.productId, why: 'unavailable', message: 'Indisponível no momento.' });
      continue;
    }
    if (p.priceCents === null) {
      recusados.push({ productId: item.productId, why: 'no_price', message: 'Agora é sob consulta.' });
      continue;
    }
    const problema = orderQuantityProblem(p, item.quantity);
    if (problema) {
      recusados.push({
        productId: item.productId, why: 'quantity', message: problema,
        saleMode: p.saleMode, stepGrams: p.stepGrams, minGrams: p.minGrams, unitPriceCents: p.priceCents,
      });
      continue;
    }
    linhas.push({
      productId: p.id, name: p.name, brand: p.brand, saleMode: p.saleMode, sizeLabel: p.sizeLabel,
      stepGrams: p.stepGrams, minGrams: p.minGrams, unitPriceCents: p.priceCents, quantity: item.quantity,
      lineTotalCents: lineTotalCents({ saleMode: p.saleMode, priceCents: p.priceCents }, item.quantity),
    });
  }
  const total = linhas.reduce((soma, l) => soma + l.lineTotalCents, 0);
  if (recusados.length)
    throw new RestaurantsOrderError('Alguns itens mudaram.', 409, 'CONFLICT', 'items_changed',
      { lines: linhas, estimatedTotalCents: total, currency: 'BRL', rejected: recusados }, null);
  if (total !== order.expectedTotalCents)
    throw new RestaurantsOrderError('O total mudou.', 409, 'CONFLICT', 'total_changed', { lines: linhas, estimatedTotalCents: total, currency: 'BRL' }, null);

  const numero = ler<number>('numero', 1042) + 1;
  gravar('numero', numero);
  const recibo = montarRecibo(numero, order.token, 'new', new Date().toISOString(), order.customerName, order.note ?? null, linhas);
  enviados[order.token] = { chave: order.idempotencyKey, corpo, recibo };
  gravar('enviados', enviados);
  return recibo;
}

function montarRecibo(
  number: number, token: string, status: PublicOrderReceiptData['status'], createdAt: string,
  customerName: string | null, note: string | null, linhas: Array<Omit<OrderCurrentLineData, 'stepGrams' | 'minGrams'>>,
): PublicOrderReceiptData {
  const items: PublicOrderLineData[] = linhas.map((l) => ({
    productId: l.productId, name: l.name, brand: l.brand, saleMode: l.saleMode, sizeLabel: l.sizeLabel,
    unitPriceCents: l.unitPriceCents, quantity: l.quantity, lineTotalCents: l.lineTotalCents,
  }));
  /* O Engine monta este endereço com o número da loja. No laboratório vai sem
   * número (o WhatsApp pede o contato), para nenhum teste cair na loja real. */
  const texto = `Olá! Fiz o pedido nº ${number} pelo site.\n${location.origin}/pedido#${token}`;
  return {
    number, status, createdAt, customerName, note, items,
    estimatedTotalCents: items.reduce((s, i) => s + i.lineTotalCents, 0),
    currency: 'BRL',
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(texto)}`,
    panelUrl: `http://127.0.0.1:3200/laboratorio/encomendas/${number}`,
  };
}

/* Recibos de exemplo, para ver o recibo sem passar pela sacola. Os tokens
 * seguem o formato do SDK (16 caracteres, sem i, l, o, u). */
export const RECIBOS_DE_EXEMPLO = {
  novo: 'rec1b0n0v0000001',
  emAtendimento: 'rec1b0emandament',
  naoEncontrado: 'rec1b0zzzzzzzzzz',
};

function exemplo(token: string): PublicOrderReceiptData | null {
  const linha = (slug: string, quantidade: number) => {
    const p = produtos.find((x) => x.slug === slug)!;
    return {
      productId: p.id, name: p.name, brand: p.brand, saleMode: p.saleMode, sizeLabel: p.sizeLabel,
      unitPriceCents: p.priceCents!, quantity: quantidade,
      lineTotalCents: lineTotalCents({ saleMode: p.saleMode, priceCents: p.priceCents! }, quantidade),
    };
  };
  const itens = [linha('parmigiano-reggiano-24-meses', 300), linha('jamon-iberico-de-bellota', 150), linha('fettuccine-rustichella', 2), linha('chianti-classico-2021', 1)];
  if (token === RECIBOS_DE_EXEMPLO.novo) return montarRecibo(1042, token, 'new', '2026-11-12T13:40:00.000Z', 'Marina', 'Jamón fatiado bem fino, por favor.', itens);
  if (token === RECIBOS_DE_EXEMPLO.emAtendimento) return montarRecibo(1038, token, 'in_progress', '2026-11-10T18:05:00.000Z', 'Rafael', null, itens.slice(1));
  return null;
}

export async function lookupPublicOrder(input: Base & { token: string }): Promise<PublicOrderReceiptData | null> {
  await esperar(400);
  if (cenarioAtual() === 'falha') throw new RestaurantsOrderError('Serviço indisponível.', 503, 'TEMPORARY', null, null, null);
  return ler<Record<string, Guardado>>('enviados', {})[input.token]?.recibo ?? exemplo(input.token);
}

/* Sacolas de exemplo para o painel do laboratório: ids e quantidades, como a sacola guarda. */
export function sacolaDeExemplo(tipo: 'cheia' | 'com-avisos') {
  const id = (slug: string) => produtos.find((p) => p.slug === slug)!.id;
  const linhas = [
    { id: id('parmigiano-reggiano-24-meses'), q: 300 },
    { id: id('jamon-iberico-de-bellota'), q: 150 },
    { id: id('fettuccine-rustichella'), q: 2 },
    { id: id('chianti-classico-2021'), q: 1 },
  ];
  if (tipo === 'com-avisos') {
    linhas.push({ id: id('comte-18-meses'), q: 200 });
    linhas.push({ id: '5a1a0000-0000-4000-8000-0000000fffff', q: 1 });
  }
  return linhas;
}
