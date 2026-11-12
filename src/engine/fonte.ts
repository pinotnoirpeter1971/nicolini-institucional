/*
 * A camada única entre as páginas e o Engine, no servidor (SPEC-SITE §3.1).
 * Nenhuma página chama o Engine por conta própria: passa por aqui.
 *
 * Blog e eventos: lidos do Engine pelo SDK, no laboratório e em produção (o
 * laboratório aponta para o staging por NEXT_PUBLIC_ENGINE_URL e
 * NEXT_PUBLIC_ENGINE_CASA).
 *
 * Produtos (Etapa 3, catálogo): lê do Engine pelo SDK, com tempo limite, o
 * índice e as categorias guardados por 60 s e compartilhados (404 barato,
 * SPEC-SITE §3.3). Só o laboratório (`next dev`) responde com dados simulados,
 * e só se `NEXT_PUBLIC_SITE_DADOS` não for `engine` (com `engine`, o `next dev`
 * lê o Engine de verdade, como o build). Módulo desligado (404 do Engine) vira
 * `null`/lista vazia: a página dá 404.
 */
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import type {
  BlogPostData,
  BlogPostKind,
  BlogPostsPage,
  PublicProductCategoryData,
  PublicProductData,
  PublicProductIndexEntry,
  PublicProductPageData,
} from './sdk-0.7.0/index.js';
import {
  RestaurantsPublicError,
  fetchBlogCategories,
  fetchBlogIndex,
  fetchBlogPost,
  fetchBlogPosts,
  fetchPublicProduct,
  fetchPublicProductCategories,
  fetchPublicProductIndex,
  fetchPublicProducts,
} from './sdk-0.7.0/index.js';
import { casaNoEngine, engineUrl, laboratorio } from '../site';

export type Cenario = { vazio?: boolean };
type Simulado = typeof import('./simulado/servidor');

async function api(): Promise<Simulado> {
  /* A condição precisa estar escrita aqui (e não vir de outro módulo) para o
   * build de produção, que a troca por `false`, cortar o import simulado. */
  if (process.env.NODE_ENV === 'development') return import('./simulado/servidor');
  throw new Error('Módulo do Engine apagado neste build: ligar a fonte é a Etapa 3 (src/engine/fonte.ts).');
}

const base = { apiBaseUrl: engineUrl, restaurantKey: casaNoEngine };

/** O `?simular=` do laboratório. No build de produção nem lê o endereço (a página continua estática). */
export async function cenarioDoLaboratorio(searchParams: Promise<Record<string, string | string[] | undefined>>): Promise<Cenario> {
  if (!laboratorio) return {};
  const { simular } = await searchParams;
  return { vazio: simular === 'vazio' };
}

/* ── Produtos ─────────────────────────────────────────────────────────────── */

/** Itens por página na grade da categoria; o resto entra pelo "ver mais". */
export const PRODUTOS_POR_PAGINA = 12;

/* No laboratório com dados simulados (o padrão do `next dev`). A condição
 * precisa estar escrita aqui para o build de produção cortar o import. */
async function simulado(): Promise<Simulado | null> {
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SITE_DADOS !== 'engine') return import('./simulado/servidor');
  return null;
}

const TEMPO_LIMITE_MS = 5000;
const sinal = () => AbortSignal.timeout(TEMPO_LIMITE_MS);

/* Módulo desligado ou casa inexistente: o Engine responde 404. */
async function ou404<T>(leitura: Promise<T>): Promise<T | null> {
  try {
    return await leitura;
  } catch (erro) {
    if (erro instanceof RestaurantsPublicError && erro.status === 404) return null;
    throw erro;
  }
}

/* O build não depende do Engine (SPEC-SITE §3.3): se ele não responder durante
 * o build, a página nasce como "módulo desligado" e se refaz na primeira
 * visita depois de 60 s. Em execução o erro sobe: a página mantém a última
 * versão boa e o erro não é guardado. */
async function tolerandoOBuild<T>(leitura: Promise<T | null>): Promise<T | null> {
  try {
    return await leitura;
  } catch (erro) {
    if (process.env.NEXT_PHASE === 'phase-production-build') return null;
    throw erro;
  }
}

const chaveDoCache = [engineUrl, casaNoEngine];

/* Uma chamada por minuto, para todas as páginas e visitantes. */
const categoriasEmCache = unstable_cache(
  () => ou404(fetchPublicProductCategories({ ...base, signal: sinal() })),
  ['produtos-categorias', ...chaveDoCache],
  { revalidate: 60 },
);
const indiceEmCache = unstable_cache(
  () => ou404(fetchPublicProductIndex({ ...base, signal: sinal() })),
  ['produtos-indice', ...chaveDoCache],
  { revalidate: 60 },
);

/** As categorias com produto no ar, ou `null` se o módulo Produtos está desligado. */
export async function categoriasDeProdutos(): Promise<PublicProductCategoryData[] | null> {
  const s = await simulado();
  if (s) return s.fetchPublicProductCategories(base);
  return tolerandoOBuild(categoriasEmCache());
}

export async function produtos(
  filtro: { category?: string; featured?: boolean; cursor?: string | null; limit?: number },
  cenario?: Cenario,
): Promise<PublicProductPageData> {
  const s = await simulado();
  if (s) return s.fetchPublicProducts({ ...base, ...filtro }, cenario);
  /* O `?simular=vazio` só chega aqui no laboratório (em produção `cenario` é sempre vazio). */
  if (cenario?.vazio) return { items: [], nextCursor: null };
  return fetchPublicProducts({ ...base, ...filtro, signal: sinal() });
}

/* O índice é a porta do 404 barato: slug que não está nele não chega ao Engine. */
export const indiceDeProdutos = cache(async (): Promise<PublicProductIndexEntry[]> => {
  const s = await simulado();
  if (s) return s.fetchPublicProductIndex(base);
  return (await tolerandoOBuild(indiceEmCache())) ?? [];
});

export const produto = cache(async (slug: string): Promise<PublicProductData | null> => {
  const s = await simulado();
  if (s) return s.fetchPublicProduct({ ...base, slug });
  if (!(await indiceDeProdutos()).some((p) => p.slug === slug)) return null;
  return fetchPublicProduct({ ...base, slug, signal: sinal() });
});

/* ── Blog e eventos ───────────────────────────────────────────────────────── */

export const MATERIAS_NA_PRIMEIRA_PAGINA = 7;
export const MATERIAS_POR_PAGINA = 6;

/* Por quanto tempo o servidor guarda o índice e as categorias do Blog. */
const GUARDA_S = 60;
const emBuild = process.env.NEXT_PHASE === 'phase-production-build';

const doBlog = () => ({ ...base, signal: sinal() });

/* O `null` do 404 também é guardado: com o Blog desligado, endereço inventado não vira chamada nova ao Engine. */
const indiceGuardado = unstable_cache(() => ou404(fetchBlogIndex(doBlog())), ['blog-indice', engineUrl, casaNoEngine], { revalidate: GUARDA_S });
const categoriasGuardadas = unstable_cache(() => ou404(fetchBlogCategories(doBlog())), ['blog-categorias', engineUrl, casaNoEngine], {
  revalidate: GUARDA_S,
});

/* No build, o Engine fora do ar vale como Blog desligado: o build não depende dele (SPEC-SITE §3.3). A página
 * nasce 404 e a revalidação a corrige; em execução, o erro sobe e o Next segue servindo a última versão boa. */
async function noBuildSemEngine<T>(ler: () => Promise<T | null>): Promise<T | null> {
  try {
    return await ler();
  } catch (erro) {
    if (emBuild) return null;
    throw erro;
  }
}

/** Todas as matérias e eventos no ar. `null`: o Blog está desligado para a casa (a página repassa o 404). */
export const indiceDoBlog = cache(() => noBuildSemEngine(indiceGuardado));

/** As categorias com matéria no ar. `null`: Blog desligado. */
export const categoriasDoBlog = cache(() => noBuildSemEngine(categoriasGuardadas));

export async function materias(filtro: { kind: BlogPostKind; category?: string; when?: 'upcoming' | 'past'; cursor?: string; limit?: number }): Promise<BlogPostsPage> {
  return fetchBlogPosts({ ...doBlog(), ...filtro });
}

/** A matéria inteira (uma chamada por renderização, mesmo lida pelos metadados e pela página). */
export const materia = cache(async (slug: string): Promise<BlogPostData | null> => fetchBlogPost({ ...doBlog(), slug }));
