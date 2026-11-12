'use client';

import { useState } from 'react';
import { lineTotalCents, type PublicProductData } from '../engine/sdk-0.7.0/index.js';
import { dinheiro, gramas } from '../engine/formato';
import { abrirPainel, adicionar } from '../sacola/armazem';
import { Sacola } from '../components/Icons';
import { Quantidade, limites } from './Quantidade';

/*
 * Quantidade e "Adicionar à sacola" na página do produto. Por peso, a
 * quantidade é em gramas e o valor aparece como estimado: a loja confirma o
 * peso real (DESIGN-BRIEF §9).
 */
export function Comprar({ produto }: { produto: PublicProductData }) {
  const { minimo, maximo } = limites(produto);
  const [q, setQ] = useState(minimo);
  const [aviso, setAviso] = useState<string | null>(null);
  const preco = produto.priceCents!;
  const estimado = lineTotalCents({ saleMode: produto.saleMode, priceCents: preco }, q);
  return (
    <div className="comprar">
      <div className="comprar__linha">
        <Quantidade regra={produto} valor={q} aoMudar={setQ} nome={produto.name} grande />
        <button
          type="button"
          className="botao botao--escuro comprar__botao"
          onClick={() => {
            if (adicionar(produto.id, q, maximo) === 'cheia') setAviso('A sacola chegou a 40 itens. Envie este pedido e faça outro.');
            else abrirPainel();
          }}
        >
          Adicionar à sacola <Sacola />
        </button>
      </div>
      {produto.saleMode === 'weight' ? (
        <p className="comprar__estimado">
          {gramas(q)} ≈ <b>{dinheiro(estimado, produto.currency)}</b>. Valor estimado: a loja confirma o peso na hora de cortar.
        </p>
      ) : q > 1 ? (
        <p className="comprar__estimado">
          {q} unidades: <b>{dinheiro(estimado, produto.currency)}</b>
        </p>
      ) : null}
      {aviso && (
        <p className="comprar__aviso" role="status">
          {aviso}
        </p>
      )}
    </div>
  );
}
