/*
 * A camada única entre as páginas e o Engine, no servidor (SPEC-SITE §3.1).
 * Nenhuma página chama o Engine por conta própria: passa por aqui.
 *
 * Hoje: no laboratório (`next dev`), responde com os dados simulados; no build
 * de produção os módulos estão apagados (src/menu-do-site.ts) e as páginas dão
 * 404 antes de chegar aqui. ETAPA 3: trocar o ramo de produção de `api()` pelo
 * SDK (`./sdk-0.7.0/index.js`, mesmas funções e tipos), com o índice para o
 * 404 barato e o tempo limite do SPEC-SITE §3.3. As páginas não mudam.
 */
import type {
  BlogCategoryData,
  BlogIndexEntry,
  BlogPostData,
  BlogPostKind,
  BlogPostsPage,
  PublicProductCategoryData,
  PublicProductData,
  PublicProductIndexEntry,
  PublicProductPageData,
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

export async function categoriasDoBlog(): Promise<BlogCategoryData[]> {
  return (await api()).fetchBlogCategories(base);
}

export async function materias(
  filtro: { kind: BlogPostKind; category?: string; when?: 'upcoming' | 'past'; cursor?: string; limit?: number },
  cenario?: Cenario,
): Promise<BlogPostsPage> {
  return (await api()).fetchBlogPosts({ ...base, ...filtro }, cenario);
}

export async function materia(slug: string): Promise<BlogPostData | null> {
  return (await api()).fetchBlogPost({ ...base, slug });
}

export async function indiceDoBlog(): Promise<BlogIndexEntry[]> {
  return (await api()).fetchBlogIndex(base);
}
