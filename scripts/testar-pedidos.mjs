#!/usr/bin/env node
/*
 * Teste de Pedidos (sacola e recibo) contra o Engine de staging, pelo mesmo SDK
 * que a sacola usa (src/engine/sdk-0.7.0), saindo com a origem do laboratório
 * (http://127.0.0.1:5183), como o navegador. Casa `bistro-teste`.
 *
 * Confere conforme o estado da casa no staging:
 *  - recebendo: pedido de ponta a ponta (recibo com número, itens, total e o
 *    WhatsApp com o link /pedido#<token>); clique duplo e reenvio com a mesma
 *    chave não duplicam; preço alterado entre a sacola e o envio (a sacola
 *    mostrou o total antigo) é recusado com as linhas e o total novo; recibo
 *    pelo token, com o token só no corpo; token desconhecido é "não encontrado";
 *  - pausada (o repouso do staging): o /config diz que não recebe, sem
 *    WhatsApp, e o envio é recusado com `not_accepting`.
 * Para provar os dois, rode com a casa retomada (Configurações → Encomendas no
 * painel de staging) e de novo depois de pausar.
 *
 * O build de produção contra a `nicolini` (Pedidos apagado) é conferido em
 * testar-rotas.mjs e testar-catalogo.mjs.
 *
 * Cada execução com a casa recebendo faz 4 envios. O Engine limita por IP
 * (6 a cada 10 min, 20 por dia) e, fora da Vercel, todo visitante é um IP só:
 * repetir muitas vezes seguidas dá 429 (o teste avisa).
 */
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const staging = (process.env.ENGINE_STAGING || 'http://127.0.0.1:3280').replace(/\/$/, '');
const casa = process.env.PEDIDOS_CASA || 'bistro-teste';
const origem = 'http://127.0.0.1:5183';

const sdk = await import(pathToFileURL(join(raiz, 'src/engine/sdk-0.7.0/index.js')).href);
const { RestaurantsOrderError, createOrderAttempt, createOrderToken, createPublicOrder, fetchPublicOrderConfig, fetchPublicProducts, fetchPublicProductsByIds, lineTotalCents, lookupPublicOrder, orderRefusalLines } = sdk;

/* O navegador do laboratório manda a origem dele; aqui ela é posta à mão. Guarda os endereços chamados. */
const enderecos = [];
const fetchOriginal = globalThis.fetch;
globalThis.fetch = (url, init = {}) => {
  enderecos.push(String(url));
  return fetchOriginal(url, { ...init, headers: { ...(init.headers ?? {}), origin: origem } });
};

let falhas = 0;
let total = 0;
const conferir = (nome, ok, detalhe = '') => {
  total++;
  if (ok) console.log(`  ok    ${nome}`);
  else {
    falhas++;
    console.log(`  FALHA ${nome}${detalhe ? `  (${detalhe})` : ''}`);
  }
};
const base = { apiBaseUrl: staging, restaurantKey: casa };
const recusa = async (promessa) => {
  try {
    await promessa;
    return null;
  } catch (erro) {
    if (erro instanceof RestaurantsOrderError) return erro;
    throw erro;
  }
};

let config;
try {
  config = await fetchPublicOrderConfig(base);
} catch (e) {
  console.error(`Engine de staging fora do ar em ${staging} (${e.message}). Suba-o ou use ENGINE_STAGING.`);
  process.exit(1);
}
if (!config) {
  console.error(`A casa ${casa} não tem Encomendas no staging (404 no /orders/config).`);
  process.exit(1);
}

if (!config.accepting) {
  console.log(`\nCasa pausada (${casa}): não envia e mantém a sacola`);
  conferir('/config diz que não recebe e não leva o WhatsApp', config.accepting === false && !Object.keys(config).some((k) => /whatsapp/i.test(k)) && !/wa\.me|api\.whatsapp/i.test(JSON.stringify(config)), JSON.stringify(config));
  const { items } = await fetchPublicProducts({ ...base, limit: 48 });
  const p = items.find((x) => x.available && x.priceCents !== null && x.saleMode === 'unit');
  const tentativa = createOrderAttempt();
  const erro = await recusa(createPublicOrder({ ...base, order: { ...tentativa, customerName: 'Teste do site', items: [{ productId: p.id, quantity: 1 }], expectedTotalCents: p.priceCents } }));
  conferir('envio recusado com not_accepting (409), sem número nem linhas', erro?.status === 409 && erro.reason === 'not_accepting' && !orderRefusalLines(erro), erro ? `${erro.status} ${erro.reason}` : 'foi aceito');
  conferir('o recibo desse envio não existe', (await lookupPublicOrder({ ...base, token: tentativa.token })) === null);
  conferir('token desconhecido: não encontrado', (await lookupPublicOrder({ ...base, token: createOrderToken() })) === null);
  console.log('\n(Casa pausada: o envio de ponta a ponta roda com a casa retomada.)');
} else {
  console.log(`\nCasa recebendo (${casa}): pedido de ponta a ponta`);
  /* Uma sacola como a do site: um produto por unidade e um por peso, relidos pelos ids (sem cache). */
  const { items } = await fetchPublicProducts({ ...base, limit: 48 });
  const un = items.find((x) => x.available && x.priceCents !== null && x.saleMode === 'unit');
  const peso = items.find((x) => x.available && x.priceCents !== null && x.saleMode === 'weight');
  if (!un || !peso) {
    console.error('O staging precisa de um produto por unidade e um por peso, no ar e com preço (pnpm staging:seed:produtos).');
    process.exit(1);
  }
  const gramas = Math.max(peso.minGrams ?? 100, peso.stepGrams ?? 100) + (peso.stepGrams ?? 100);
  const sacola = [{ productId: un.id, quantity: 2 }, { productId: peso.id, quantity: gramas }];
  const atuais = await fetchPublicProductsByIds({ ...base, ids: sacola.map((l) => l.productId) });
  conferir('a sacola relê os produtos pelos ids', atuais.length === 2);
  const totalCents = sacola.reduce((s, l) => {
    const p = atuais.find((x) => x.id === l.productId);
    return s + lineTotalCents({ saleMode: p.saleMode, priceCents: p.priceCents }, l.quantity);
  }, 0);
  const dados = { customerName: 'Teste do site', note: 'Conferência automática do site (pode cancelar).' };

  /* Preço alterado entre a sacola e o envio: o Engine confere o total que o cliente viu. */
  const antiga = createOrderAttempt();
  const erro = await recusa(createPublicOrder({ ...base, order: { ...antiga, ...dados, items: sacola, expectedTotalCents: totalCents - 150 } }));
  if (erro?.status === 429) {
    console.error(`\nLimite de pedidos por IP atingido no staging (espere ${erro.retryAfterSeconds ?? '?'} s ou zere os contadores do staging).`);
    process.exit(1);
  }
  const linhas = orderRefusalLines(erro);
  conferir(
    'preço alterado: recusa total_changed com as linhas atuais e o total novo, sem pedido',
    erro?.reason === 'total_changed' && linhas?.estimatedTotalCents === totalCents && linhas.lines.length === 2 && linhas.lines.every((l) => typeof l.unitPriceCents === 'number' && l.lineTotalCents > 0),
    erro ? `${erro.status} ${erro.reason} ${linhas?.estimatedTotalCents}` : 'foi aceito',
  );
  conferir('o recibo do envio recusado não existe', (await lookupPublicOrder({ ...base, token: antiga.token })) === null);

  /* Confirmado o total novo, nascem chave e token novos (o corpo mudou). Clique duplo: os dois envios saem juntos. */
  const tentativa = createOrderAttempt();
  const pedido = { ...tentativa, ...dados, items: sacola, expectedTotalCents: linhas?.estimatedTotalCents ?? totalCents };
  const [a, b] = await Promise.all([createPublicOrder({ ...base, order: pedido }), createPublicOrder({ ...base, order: pedido })]);
  conferir('envio devolve o recibo: número, situação nova, itens e total estimado', Number.isInteger(a.number) && a.status === 'new' && a.items.length === 2 && a.estimatedTotalCents === totalCents, `${a.number} ${a.status} ${a.estimatedTotalCents}`);
  const texto = a.whatsappUrl ? decodeURIComponent(a.whatsappUrl) : '';
  conferir(
    'o WhatsApp vem montado com o número do pedido e o link /pedido#<token> do site',
    /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(a.whatsappUrl ?? '') && texto.includes(`${origem}/pedido#${tentativa.token}`) && texto.includes(String(a.number)),
    a.whatsappUrl,
  );
  conferir('clique duplo: os dois envios dão o mesmo pedido', b.number === a.number, `${a.number} e ${b.number}`);
  const reenvio = await createPublicOrder({ ...base, order: pedido });
  conferir('reenvio com a mesma chave (recarregar a página): o mesmo pedido', reenvio.number === a.number, `${reenvio.number}`);

  const recibo = await lookupPublicOrder({ ...base, token: tentativa.token });
  conferir(
    'recibo pelo token: o mesmo pedido, itens, total, nome e observação',
    recibo?.number === a.number && recibo.items.length === 2 && recibo.estimatedTotalCents === totalCents && recibo.customerName === dados.customerName && recibo.note === dados.note && recibo.whatsappUrl === a.whatsappUrl,
  );
  conferir('o token nunca vai no endereço (só no corpo)', !enderecos.some((u) => u.includes(tentativa.token) || u.includes(antiga.token)));
  conferir('token desconhecido: não encontrado', (await lookupPublicOrder({ ...base, token: createOrderToken() })) === null);
  console.log(`\nPedido de teste criado no staging: nº ${a.number} (Encomendas de ${casa}).`);
}

console.log(`\n${total - falhas}/${total} verificações passaram${falhas ? `, ${falhas} falharam` : ''}.`);
process.exit(falhas ? 1 : 0);
