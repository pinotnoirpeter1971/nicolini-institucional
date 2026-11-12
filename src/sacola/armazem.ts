'use client';

import { useSyncExternalStore } from 'react';

/*
 * A sacola no navegador (SPEC-SITE §6). Guarda SÓ o id do produto e a
 * quantidade (unidades, ou gramas no produto por peso), numa chave versionada.
 * Nome e preço vêm sempre do Engine quando a sacola abre. A observação do
 * pedido fica numa chave ao lado, até o envio dar certo. Conteúdo inválido ou
 * de versão antiga é descartado sem quebrar a página. Abas diferentes ficam
 * iguais pelo evento `storage`.
 *
 * Este arquivo é o único pedaço da sacola que vai a toda página (o contador do
 * header): o painel e a página da sacola carregam o resto sob demanda.
 */

export type LinhaGuardada = { id: string; q: number };

const CHAVE = 'nicolini:sacola:v1';
export const LIMITE_DE_LINHAS = 40;
const MUDOU = 'nicolini:sacola-mudou';
export const ABRIR_PAINEL = 'nicolini:abrir-sacola';

const valida = (l: unknown): l is LinhaGuardada =>
  typeof l === 'object' && l !== null &&
  typeof (l as LinhaGuardada).id === 'string' && /^[0-9a-f-]{8,64}$/i.test((l as LinhaGuardada).id) &&
  Number.isInteger((l as LinhaGuardada).q) && (l as LinhaGuardada).q > 0 && (l as LinhaGuardada).q <= 100_000;

function lerCru(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function interpretar(cru: string | null): LinhaGuardada[] {
  if (!cru) return [];
  try {
    const dado = JSON.parse(cru);
    if (dado?.v !== 1 || !Array.isArray(dado.linhas)) return [];
    const vistos = new Set<string>();
    return dado.linhas.filter((l: unknown) => valida(l) && !vistos.has(l.id) && vistos.add(l.id)).slice(0, LIMITE_DE_LINHAS);
  } catch {
    return [];
  }
}

/* O snapshot precisa ser o mesmo objeto enquanto o texto guardado não muda. */
let ultimoCru: string | null | undefined;
let ultimasLinhas: LinhaGuardada[] = [];
function lerLinhas(): LinhaGuardada[] {
  const cru = lerCru();
  if (cru !== ultimoCru) {
    ultimoCru = cru;
    ultimasLinhas = interpretar(cru);
  }
  return ultimasLinhas;
}

const VAZIA: LinhaGuardada[] = [];

function gravar(linhas: LinhaGuardada[]) {
  try {
    if (linhas.length) localStorage.setItem(CHAVE, JSON.stringify({ v: 1, linhas: linhas.slice(0, LIMITE_DE_LINHAS) }));
    else localStorage.removeItem(CHAVE);
  } catch {
    /* Sem armazenamento (aba anônima cheia, bloqueio): a sacola só não persiste. */
  }
  window.dispatchEvent(new Event(MUDOU));
}

function assinar(aviso: () => void) {
  const naOutraAba = (e: StorageEvent) => {
    if (e.key === null || e.key === CHAVE) aviso();
  };
  window.addEventListener('storage', naOutraAba);
  window.addEventListener(MUDOU, aviso);
  return () => {
    window.removeEventListener('storage', naOutraAba);
    window.removeEventListener(MUDOU, aviso);
  };
}

export function useSacola(): LinhaGuardada[] {
  return useSyncExternalStore(assinar, lerLinhas, () => VAZIA);
}

export const linhasDaSacola = () => lerLinhas();

/** Soma à linha que já existe; `maximo` é o teto do produto (99 unidades ou 20 kg). */
export function adicionar(id: string, q: number, maximo: number): 'ok' | 'cheia' {
  const linhas = lerLinhas();
  const atual = linhas.find((l) => l.id === id);
  if (!atual && linhas.length >= LIMITE_DE_LINHAS) return 'cheia';
  gravar(atual ? linhas.map((l) => (l.id === id ? { id, q: Math.min(maximo, l.q + q) } : l)) : [...linhas, { id, q }]);
  return 'ok';
}

export function definir(id: string, q: number) {
  gravar(lerLinhas().map((l) => (l.id === id ? { id, q } : l)));
}

export function remover(ids: string | string[]) {
  const fora = new Set(Array.isArray(ids) ? ids : [ids]);
  gravar(lerLinhas().filter((l) => !fora.has(l.id)));
}

export function substituir(linhas: LinhaGuardada[]) {
  gravar(linhas.filter(valida));
}

export function esvaziar() {
  gravarObservacao('');
  gravar([]);
}

/* A observação do pedido também fica no navegador, ao lado da sacola, até o envio dar certo. */
const OBSERVACAO = 'nicolini:sacola-observacao:v1';
export function lerObservacao(): string {
  try {
    return (localStorage.getItem(OBSERVACAO) ?? '').slice(0, 2000);
  } catch {
    return '';
  }
}
export function gravarObservacao(texto: string) {
  try {
    if (texto) localStorage.setItem(OBSERVACAO, texto);
    else localStorage.removeItem(OBSERVACAO);
  } catch {
    /* sem armazenamento: só não lembra */
  }
}

export function abrirPainel() {
  window.dispatchEvent(new Event(ABRIR_PAINEL));
}
