'use client';

import { useState } from 'react';
import type { PublicProductCardData } from '../engine/sdk-0.7.0/index.js';
import { modulos } from '../menu-do-site';
import { abrirPainel, adicionar } from '../sacola/armazem';
import { Sacola } from '../components/Icons';
import { Quantidade, limites } from './Quantidade';

/*
 * A ação do cartão: quantidade e "Adicionar", como no e-commerce. Indisponível
 * e sob consulta não têm botão de adicionar (DESIGN-BRIEF §9). Sem Pedidos
 * ligado, o cartão não oferece ação nenhuma.
 */
export function AcaoDoCartao({ produto }: { produto: PublicProductCardData }) {
  const { minimo, maximo } = limites(produto);
  const [q, setQ] = useState(minimo);
  const [cheia, setCheia] = useState(false);
  if (!modulos.pedidos) return null;
  if (!produto.available) return <p className="produto-cartao__estado">Indisponível no momento</p>;
  if (produto.priceCents === null) return <p className="produto-cartao__estado">Valor e disponibilidade com a casa</p>;
  return (
    <div className="produto-cartao__acao">
      <Quantidade regra={produto} valor={q} aoMudar={setQ} nome={produto.name} />
      <button
        type="button"
        className="botao botao--marca produto-cartao__adicionar"
        onClick={() => {
          if (adicionar(produto.id, q, maximo) === 'cheia') setCheia(true);
          else abrirPainel();
        }}
      >
        <Sacola /> Adicionar
      </button>
      {cheia && (
        <p className="produto-cartao__estado" role="status">
          A sacola chegou a 40 itens.
        </p>
      )}
    </div>
  );
}
