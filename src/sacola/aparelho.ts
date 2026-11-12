'use client';

import { createOrderAttempt } from '../engine/sdk-0.7.0/index.js';

/*
 * O que o navegador guarda além da sacola (SPEC-SITE §7):
 * - a tentativa de envio (chave de idempotência e token do recibo), gravada
 *   ANTES de chamar o Engine. Repetir o clique ou recarregar reenvia a mesma
 *   chave; mudou a sacola, o nome ou a observação, nascem outras;
 * - os últimos 10 pedidos feitos neste navegador (número, token e data), por
 *   onde o cliente reencontra o recibo. Não é conta nem histórico no servidor.
 */

const TENTATIVA = 'nicolini:envio:v1';
const PEDIDOS = 'nicolini:pedidos:v1';

type Tentativa = { assinatura: string; idempotencyKey: string; token: string };
export type PedidoDoAparelho = { numero: number; token: string; data: string };

function ler<T>(chave: string): T | null {
  try {
    const cru = localStorage.getItem(chave);
    return cru ? (JSON.parse(cru) as T) : null;
  } catch {
    return null;
  }
}
function gravar(chave: string, valor: unknown) {
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem armazenamento: segue sem lembrar */
  }
}

/** A tentativa para esta sacola, este nome e esta observação; nova se qualquer um mudou. */
export function tentativaPara(assinatura: string): Tentativa {
  const atual = ler<Tentativa>(TENTATIVA);
  if (atual && atual.assinatura === assinatura && atual.idempotencyKey && atual.token) return atual;
  const nova = { assinatura, ...createOrderAttempt() };
  gravar(TENTATIVA, nova);
  return nova;
}

export const esquecerTentativa = () => gravar(TENTATIVA, null);

export function pedidosDoAparelho(): PedidoDoAparelho[] {
  const lista = ler<PedidoDoAparelho[]>(PEDIDOS);
  return Array.isArray(lista) ? lista.filter((p) => p && typeof p.token === 'string' && Number.isInteger(p.numero)).slice(0, 10) : [];
}

export function lembrarPedido(p: PedidoDoAparelho) {
  gravar(PEDIDOS, [p, ...pedidosDoAparelho().filter((x) => x.token !== p.token)].slice(0, 10));
}

export const esquecerPedidos = () => gravar(PEDIDOS, null);
