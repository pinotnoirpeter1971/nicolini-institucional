/*
 * A camada única entre as páginas e o Engine, no servidor (SPEC-SITE §3.1).
 * Nenhuma página chama o Engine por conta própria: passa por aqui.
 *
 * Blog e eventos: lidos do Engine pelo SDK, no laboratório e em produção (o
 * laboratório aponta para o staging por NEXT_PUBLIC_ENGINE_URL e
 * NEXT_PUBLIC_ENGINE_CASA). Produtos: ainda simulados (ETAPA 3, trilha do
 * catálogo): `api()` troca pelo SDK.
 */
import type {
  BlogPostData,
  BlogPostKind,
  BlogPostsPage,
  PublicProductCategoryData,
  PublicProductData,
  PublicProductIndexEntry,
  PublicProductPageData,
} from './sdk-0.7.0/index.js';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { RestaurantsPublicError, fetchBlogCategories, fetchBlogIndex, fetchBlogPost, fetchBlogPosts } from './sdk-0.7.0/index.js';
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

export async function categoriasDeProdutos(): Promise<PublicProductCategoryData[]> {
  return (await api()).fetchPublicProductCategories(base);
}

export async function produtos(
  filtro: { category?: string; featured?: boolean; cursor?: string | null; limit?: number },
  cenario?: Cenario,
): Promise<PublicProductPageData> {
  return (await api()).fetchPublicProducts({ ...base, ...filtro }, cenario);
}

export async function produto(slug: string): Promise<PublicProductData | null> {
  return (await api()).fetchPublicProduct({ ...base, slug });
}

export async function indiceDeProdutos(): Promise<PublicProductIndexEntry[]> {
  return (await api()).fetchPublicProductIndex(base);
}

/* ── Blog e eventos ───────────────────────────────────────────────────────── */

export const MATERIAS_NA_PRIMEIRA_PAGINA = 7;
export const MATERIAS_POR_PAGINA = 6;

/* Quanto o servidor espera o Engine (SPEC-SITE §3.3) e por quanto tempo guarda o índice e as categorias. */
const TEMPO_LIMITE_MS = 5000;
const GUARDA_S = 60;
const emBuild = process.env.NEXT_PHASE === 'phase-production-build';

const doBlog = () => ({ ...base, signal: AbortSignal.timeout(TEMPO_LIMITE_MS) });

/* 404 do Engine (módulo desligado, casa ou item inexistente) vira `null`: é resposta, não falha. */
async function ou404<T>(ler: () => Promise<T>): Promise<T | null> {
  try {
    return await ler();
  } catch (erro) {
    if (erro instanceof RestaurantsPublicError && erro.status === 404) return null;
    throw erro;
  }
}

/* O `null` do 404 também é guardado: com o Blog desligado, endereço inventado não vira chamada nova ao Engine. */
const indiceGuardado = unstable_cache(() => ou404(() => fetchBlogIndex(doBlog())), ['blog-indice', engineUrl, casaNoEngine], { revalidate: GUARDA_S });
const categoriasGuardadas = unstable_cache(() => ou404(() => fetchBlogCategories(doBlog())), ['blog-categorias', engineUrl, casaNoEngine], {
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
