#!/usr/bin/env node
/*
 * Teste unitário da lógica pura da sacola, em Node puro e sem servidor:
 * a assinatura do envio, a chave da tentativa (que muda se o total muda) e a
 * `aplicarRecusa`. Importa o TypeScript direto (o Node tira os tipos); um gancho
 * mínimo completa o `.ts` dos imports sem extensão.
 */
import { register } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

register(
  'data:text/javascript,' +
    encodeURIComponent(`export async function resolve(spec, ctx, next) {
      try { return await next(spec, ctx); } catch (e) {
        if (spec.startsWith('.') && !/\\.[a-z]+$/.test(spec)) return next(spec + '.ts', ctx);
        throw e;
      }
    }`),
);

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const carregar = (caminho) => import(pathToFileURL(join(raiz, caminho)).href);

/* localStorage de mentira, para ver o que o navegador guardaria. */
const guardado = new Map();
globalThis.localStorage = { getItem: (k) => guardado.get(k) ?? null, setItem: (k, v) => guardado.set(k, String(v)), removeItem: (k) => guardado.delete(k) };

const { assinaturaDoEnvio } = await carregar('src/sacola/envio.ts');
const { tentativaPara } = await carregar('src/sacola/aparelho.ts');
const { aplicarRecusa } = await carregar('src/sacola/recusa.ts');
const { RestaurantsOrderError } = await carregar('src/engine/sdk-0.7.0/index.js');

let falhas = 0;
const conferir = (nome, ok, detalhe = '') => {
  if (ok) console.log(`  ok    ${nome}`);
  else {
    falhas++;
    console.log(`  FALHA ${nome}${detalhe ? `  (${detalhe})` : ''}`);
  }
};

console.log('\nAssinatura e chave da tentativa');
const itens = [{ productId: 'a', quantity: 2 }];
const a1 = await assinaturaDoEnvio(itens, 'Maria da Silva', 'sem cebola', 1000);
conferir('mesma entrada, mesma assinatura', a1 === (await assinaturaDoEnvio(itens, 'Maria da Silva', 'sem cebola', 1000)));
conferir('total diferente, assinatura diferente', a1 !== (await assinaturaDoEnvio(itens, 'Maria da Silva', 'sem cebola', 1100)));
conferir('nome, observação e quantidade diferentes, assinaturas diferentes', new Set([a1, await assinaturaDoEnvio(itens, 'Maria', 'sem cebola', 1000), await assinaturaDoEnvio(itens, 'Maria da Silva', null, 1000), await assinaturaDoEnvio([{ productId: 'a', quantity: 3 }], 'Maria da Silva', 'sem cebola', 1000)]).size === 4);
conferir('a assinatura não leva o nome nem a observação em texto', !/Maria|cebola/.test(a1));
const t1 = tentativaPara(a1);
conferir('mesma assinatura reaproveita chave e token', JSON.stringify(tentativaPara(a1)) === JSON.stringify(t1));
const t2 = tentativaPara(await assinaturaDoEnvio(itens, 'Maria da Silva', 'sem cebola', 1100));
conferir('total diferente nasce com outra chave e outro token', t2.idempotencyKey !== t1.idempotencyKey && t2.token !== t1.token);
conferir('o localStorage não guarda nome nem observação', ![...guardado.values()].some((v) => /Maria|cebola/.test(v)));

console.log('\naplicarRecusa');
const erro = (reason, details) => new RestaurantsOrderError('recusa', 409, 'CONFLICT', reason, details, null);
const linha = (id, p, q = 1) => ({ productId: id, name: id, brand: null, saleMode: 'unit', sizeLabel: null, stepGrams: null, minGrams: null, unitPriceCents: p, quantity: q, lineTotalCents: p * q });
const antes = [
  { id: 'a', q: 2, produto: { name: 'Queijo', priceCents: 1000 }, estado: 'ok', problema: null, totalCents: 2000 },
  { id: 'b', q: 1, produto: { name: 'Vinho', priceCents: 5000 }, estado: 'ok', problema: null, totalCents: 5000 },
  { id: 'c', q: 150, produto: { name: 'Presunto', priceCents: 9000 }, estado: 'ok', problema: null, totalCents: 1350 },
];
conferir('erro que não é de linhas: null', aplicarRecusa(erro('not_accepting', null), antes) === null);
const r = aplicarRecusa(
  erro('items_changed', {
    lines: [linha('a', 1200, 2)],
    estimatedTotalCents: 2400,
    currency: 'BRL',
    rejected: [
      { productId: 'b', why: 'unavailable', message: 'x' },
      { productId: 'c', why: 'quantity', message: 'passo mudou', saleMode: 'weight', stepGrams: 100, minGrams: 200, unitPriceCents: 9000 },
    ],
  }),
  antes,
);
conferir('preço que mudou é marcado na linha', /Preço mudou/.test(r?.porLinha.a ?? ''), JSON.stringify(r?.porLinha));
conferir('item indisponível sai, com o motivo', r?.sairam.length === 1 && r.sairam[0].nome === 'Vinho' && r.sairam[0].motivo === 'ficou indisponível');
conferir('quantidade volta para dentro da regra (150 g → 200 g)', r?.guardadas.find((g) => g.id === 'c')?.q === 200 && /Quantidade ajustada/.test(r.porLinha.c ?? ''));
conferir('a sacola guardada tem as linhas da resposta e a ajustada', r?.guardadas.map((g) => g.id).join() === 'a,c');

console.log(falhas ? `\n${falhas} falha(s)` : '\nTudo certo.');
process.exit(falhas ? 1 : 0);
