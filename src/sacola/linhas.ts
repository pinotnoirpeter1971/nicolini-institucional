'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  lineTotalCents,
  orderQuantityProblem,
  type OrderCurrentLineData,
  type PublicProductCardData,
} from '../engine/sdk-0.7.0/index.js';
import { produtosPorIds } from '../engine/navegador';
import { remover, useSacola } from './armazem';

/*
 * As linhas da sacola com o produto de agora (SPEC-SITE §6): o painel e a
 * página /sacola usam este mesmo gancho. Ao abrir, pede ao Engine os produtos
 * pelos ids guardados (leitura sem cache); id que não volta saiu do site e a
 * linha é retirada, com aviso. O valor de cada linha é o `lineTotalCents` do
 * SDK, a mesma conta do Engine.
 */

export type EstadoDaLinha = 'carregando' | 'ok' | 'indisponivel' | 'sem-preco' | 'quantidade';

export type Linha = {
  id: string;
  q: number;
  produto: PublicProductCardData | null;
  estado: EstadoDaLinha;
  problema: string | null;
  totalCents: number | null;
};

/** Teto de uma linha: 99 unidades ou 20 kg (as regras do pedido). */
export const maximoDaLinha = (p: Pick<PublicProductCardData, 'saleMode'>) => (p.saleMode === 'weight' ? 20_000 : 99);

export function useLinhasDaSacola() {
  const guardadas = useSacola();
  const [produtos, setProdutos] = useState<Map<string, PublicProductCardData>>(() => new Map());
  const [erro, setErro] = useState(false);
  const [saiuDoSite, setSaiuDoSite] = useState(0);
  const pedidos = useRef(new Set<string>());
  const [tentativa, setTentativa] = useState(0);
  const produtosRef = useRef(produtos);
  produtosRef.current = produtos;

  const ids = guardadas.map((l) => l.id);
  const chave = ids.join(',');

  useEffect(() => {
    const faltam = chave ? chave.split(',').filter((id) => !pedidos.current.has(id)) : [];
    if (!faltam.length) return undefined;
    let vivo = true;
    faltam.forEach((id) => pedidos.current.add(id));
    setErro(false);
    produtosPorIds(faltam)
      .then((lista) => {
        if (!vivo) return;
        setProdutos((atual) => {
          const novo = new Map(atual);
          lista.forEach((p) => novo.set(p.id, p));
          return novo;
        });
        const voltaram = new Set(lista.map((p) => p.id));
        const sairam = faltam.filter((id) => !voltaram.has(id));
        if (sairam.length) {
          setSaiuDoSite((n) => n + sairam.length);
          remover(sairam);
        }
      })
      .catch(() => {
        if (!vivo) return;
        faltam.forEach((id) => pedidos.current.delete(id));
        setErro(true);
      });
    return () => {
      vivo = false;
      faltam.forEach((id) => {
        if (!produtosRef.current.has(id)) pedidos.current.delete(id);
      });
    };
  }, [chave, tentativa]);

  const linhas: Linha[] = useMemo(
    () =>
      guardadas.map(({ id, q }) => {
        const produto = produtos.get(id) ?? null;
        if (!produto) return { id, q, produto, estado: 'carregando', problema: null, totalCents: null };
        if (!produto.available) return { id, q, produto, estado: 'indisponivel', problema: 'Indisponível no momento.', totalCents: null };
        if (produto.priceCents === null) return { id, q, produto, estado: 'sem-preco', problema: 'Agora é sob consulta.', totalCents: null };
        const problema = orderQuantityProblem(produto, q);
        if (problema) return { id, q, produto, estado: 'quantidade', problema, totalCents: null };
        return { id, q, produto, estado: 'ok', problema: null, totalCents: lineTotalCents({ saleMode: produto.saleMode, priceCents: produto.priceCents }, q) };
      }),
    [guardadas, produtos],
  );

  /*
   * Recusa do envio (`items_changed`, `total_changed`): as linhas da resposta
   * são a fonte de verdade. Atualiza o preço e as regras dos produtos que
   * continuam, sem reler nada (SPEC-SITE §7.4).
   */
  const aplicarLinhasAtuais = useCallback((atuais: OrderCurrentLineData[]) => {
    setProdutos((antes) => {
      const novo = new Map(antes);
      for (const l of atuais) {
        const p = antes.get(l.productId);
        novo.set(l.productId, {
          ...(p ?? { id: l.productId, slug: '', photo: null, featured: false, categorySlug: '', currency: 'BRL' }),
          name: l.name,
          brand: l.brand,
          saleMode: l.saleMode,
          sizeLabel: l.sizeLabel,
          stepGrams: l.stepGrams,
          minGrams: l.minGrams,
          priceCents: l.unitPriceCents,
          available: true,
        });
      }
      return novo;
    });
  }, []);

  const carregando = linhas.some((l) => l.estado === 'carregando') && !erro;
  const totalCents = linhas.reduce((s, l) => s + (l.totalCents ?? 0), 0);
  const bloqueadas = linhas.filter((l) => l.estado !== 'ok' && l.estado !== 'carregando');

  return {
    linhas,
    totalCents,
    carregando,
    erro,
    saiuDoSite,
    esquecerAviso: () => setSaiuDoSite(0),
    bloqueadas,
    tentarDeNovo: () => setTentativa((t) => t + 1),
    aplicarLinhasAtuais,
    produtos,
  };
}
