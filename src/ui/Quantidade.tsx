'use client';

import { gramas, limites } from '../engine/formato';
import { Minus, Plus } from '../components/Icons';

export { limites };

type Regra = Parameters<typeof limites>[0];

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
