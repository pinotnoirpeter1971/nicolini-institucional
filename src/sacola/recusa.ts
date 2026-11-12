import { orderRefusalLines, type OrderCurrentLineData, type OrderRejectedItem, type RestaurantsOrderError } from '../engine/sdk-0.7.0/index.js';
import { dinheiro, gramas, limites } from '../engine/formato';
import type { Linha } from './linhas';
import type { LinhaGuardada } from './armazem';

/* A parte pura da recusa do Engine (sem React): o que a sacola vira depois de uma recusa com motivo. */

export const MOTIVO: Record<OrderRejectedItem['why'], string> = {
  gone: 'saiu do site',
  unavailable: 'ficou indisponível',
  no_price: 'ficou sob consulta',
  quantity: 'a quantidade mudou de regra',
};

/* Quantidade dentro da regra atual (passo, mínimo e teto), a mais próxima da pedida. */
export function ajustar(q: number, regra: Pick<OrderRejectedItem, 'saleMode' | 'stepGrams' | 'minGrams'>) {
  const { passo, minimo, maximo } = limites({ saleMode: regra.saleMode ?? 'unit', stepGrams: regra.stepGrams ?? null, minGrams: regra.minGrams ?? null });
  return Math.min(maximo, Math.max(minimo, Math.round(q / passo) * passo));
}

export const precoDaLinha = (l: { saleMode: 'unit' | 'weight'; unitPriceCents: number }) =>
  l.saleMode === 'weight' ? `${dinheiro(l.unitPriceCents)} o quilo` : dinheiro(l.unitPriceCents);

/** `null`: a recusa não traz linhas (não é uma recusa com motivo). */
export function aplicarRecusa(err: RestaurantsOrderError, antes: Linha[]) {
  const det = orderRefusalLines(err);
  if (!det) return null;
  const porLinha: Record<string, string> = {};
  const sairam: Array<{ nome: string; motivo: string }> = [];
  const atuais: OrderCurrentLineData[] = [...det.lines];
  const guardadas: LinhaGuardada[] = det.lines.map((l) => ({ id: l.productId, q: l.quantity }));
  for (const r of det.rejected ?? []) {
    const velha = antes.find((l) => l.id === r.productId);
    const nomeDoItem = velha?.produto?.name ?? 'Um item';
    if (r.why === 'quantity' && r.saleMode && r.unitPriceCents !== undefined && velha) {
      const q = ajustar(velha.q, r);
      guardadas.push({ id: r.productId, q });
      atuais.push({
        productId: r.productId, name: nomeDoItem, brand: velha.produto?.brand ?? null, saleMode: r.saleMode, sizeLabel: velha.produto?.sizeLabel ?? null,
        stepGrams: r.stepGrams ?? null, minGrams: r.minGrams ?? null, unitPriceCents: r.unitPriceCents, quantity: q, lineTotalCents: 0,
      });
      porLinha[r.productId] = `Quantidade ajustada para ${r.saleMode === 'weight' ? gramas(q) : q}: ${r.message}`;
    } else {
      sairam.push({ nome: nomeDoItem, motivo: MOTIVO[r.why] });
    }
  }
  for (const l of det.lines) {
    const velha = antes.find((x) => x.id === l.productId);
    if (velha?.produto?.priceCents != null && velha.produto.priceCents !== l.unitPriceCents)
      porLinha[l.productId] = `Preço mudou: de ${precoDaLinha({ saleMode: l.saleMode, unitPriceCents: velha.produto.priceCents })} para ${precoDaLinha(l)}.`;
  }
  return { atuais, guardadas, porLinha, sairam };
}
