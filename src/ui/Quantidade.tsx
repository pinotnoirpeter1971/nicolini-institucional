'use client';

import { gramas } from '../engine/formato';
import { Minus, Plus } from '../components/Icons';

type Regra = { saleMode: 'unit' | 'weight'; stepGrams: number | null; minGrams: number | null };

/** O passo, o mínimo e o máximo de uma quantidade, nas regras do pedido. */
export function limites(regra: Regra) {
  if (regra.saleMode === 'weight') {
    const passo = regra.stepGrams ?? 100;
    return { passo, minimo: regra.minGrams ?? passo, maximo: 20_000 };
  }
  return { passo: 1, minimo: 1, maximo: 99 };
}

/*
 * O seletor de quantidade do e-commerce: menos, o valor, mais. Por peso anda no
 * passo do produto e mostra gramas. Teclado: os dois botões são botões de
 * verdade; o valor é anunciado a cada mudança.
 */
export function Quantidade({
  regra,
  valor,
  aoMudar,
  nome,
  grande = false,
}: {
  regra: Regra;
  valor: number;
  aoMudar: (q: number) => void;
  nome: string;
  grande?: boolean;
}) {
  const { passo, minimo, maximo } = limites(regra);
  const texto = regra.saleMode === 'weight' ? gramas(valor) : String(valor);
  return (
    <div className={`quantidade ${grande ? 'quantidade--grande' : ''}`} role="group" aria-label={`Quantidade de ${nome}`}>
      <button type="button" onClick={() => aoMudar(Math.max(minimo, valor - passo))} disabled={valor <= minimo} aria-label={regra.saleMode === 'weight' ? `Menos ${passo} g` : 'Menos um'}>
        <Minus />
      </button>
      <span aria-live="polite" aria-atomic="true">
        {texto}
      </span>
      <button type="button" onClick={() => aoMudar(Math.min(maximo, valor + passo))} disabled={valor + passo > maximo} aria-label={regra.saleMode === 'weight' ? `Mais ${passo} g` : 'Mais um'}>
        <Plus />
      </button>
    </div>
  );
}
