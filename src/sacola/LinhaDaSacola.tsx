'use client';

import Link from 'next/link';
import { dinheiro, gramas } from '../engine/formato';
import { Fechar } from '../components/Icons';
import { Quantidade } from '../ui/Quantidade';
import { Foto } from '../ui/Foto';
import { definir, remover } from './armazem';
import type { Linha } from './linhas';

/* Uma linha da sacola, no painel e na página: foto, marca, nome, quantidade, valor ou o estado que impede o envio. */
export function LinhaDaSacola({ linha, mudou, travada = false }: { linha: Linha; mudou?: string; travada?: boolean }) {
  const p = linha.produto;
  if (!p) {
    return (
      <li className="linha linha--carregando" aria-busy="true">
        <span className="linha__foto" />
        <span className="linha__texto">
          <span className="linha__esqueleto" />
          <span className="linha__esqueleto linha__esqueleto--curto" />
        </span>
      </li>
    );
  }
  const porPeso = p.saleMode === 'weight';
  const bloqueada = linha.estado !== 'ok';
  return (
    <li className={`linha ${bloqueada ? 'is-bloqueada' : ''} ${mudou ? 'is-mudou' : ''}`}>
      <span className="linha__foto">{p.photo ? <Foto foto={p.photo} sizes="88px" /> : <span className="sem-foto">N</span>}</span>
      <div className="linha__texto">
        {p.brand && <p className="linha__marca">{p.brand}</p>}
        <p className="linha__nome">{p.slug ? <Link href={`/produto/${p.slug}`}>{p.name}</Link> : p.name}</p>
        <p className="linha__medida">
          {porPeso ? `${p.priceCents !== null ? `${dinheiro(p.priceCents, p.currency)} o quilo` : 'Por peso'}` : p.sizeLabel}
        </p>
        {mudou && <p className="linha__mudou">{mudou}</p>}
        {linha.problema && <p className="linha__problema">{linha.problema}</p>}
        <div className="linha__controles">
          {linha.estado === 'ok' || linha.estado === 'quantidade' ? (
            <Quantidade regra={p} valor={linha.q} aoMudar={(q) => definir(linha.id, q)} nome={p.name} />
          ) : (
            <span className="linha__quantidade">{porPeso ? gramas(linha.q) : `${linha.q} un.`}</span>
          )}
          <button type="button" className="linha__remover" onClick={() => remover(linha.id)} disabled={travada} aria-label={`Tirar ${p.name} da sacola`}>
            <Fechar /> <span>Tirar</span>
          </button>
        </div>
      </div>
      <p className="linha__valor">
        {linha.totalCents !== null ? (
          <>
            {porPeso && <span className="linha__aprox">≈ </span>}
            {dinheiro(linha.totalCents, p.currency)}
          </>
        ) : (
          '—'
        )}
      </p>
    </li>
  );
}
