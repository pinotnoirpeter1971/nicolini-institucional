/*
 * LABORATÓRIO: as leituras de Blog e Produtos do SDK, respondidas com os dados
 * simulados. Mesmos nomes, mesmas entradas e mesmas saídas das funções do SDK
 * (src/engine/sdk-0.7.0), inclusive o 404 como `RestaurantsPublicError`.
 * O `cenario` é só do laboratório (`?simular=vazio`): o SDK não tem.
 */
import {
  RestaurantsPublicError,
  eventIsUpcoming,
  type BlogCardData,
  type BlogPostData,
  type BlogPostKind,
  type BlogPostsPage,
  type PublicProductCardData,
  type PublicProductData,
  type PublicProductPageData,
} from '../sdk-0.7.0/index.js';
import { hojeNaCasa } from '../formato';
import { categoriasDeProdutos, categoriasDoBlog, materias, produtos } from './dados';

export type Cenario = { vazio?: boolean };
type Base = { apiBaseUrl: string; restaurantKey: string; signal?: AbortSignal };

/* O cursor do laboratório é só a posição; o do Engine é opaco. */
function pagina<T>(lista: T[], cursor: string | null | undefined, limite: number) {
  const inicio = cursor ? Number(cursor.replace(/^p/, '')) || 0 : 0;
  const fim = inicio + limite;
  return { items: lista.slice(inicio, fim), nextCursor: fim < lista.length ? `p${fim}` : null };
}

const ordemPt = new Intl.Collator('pt-BR');

export function cartao(produto: PublicProductData): PublicProductCardData {
  const { description: _d, origin: _o, photos: _p, category: _c, ...cartao } = produto;
  return cartao;
}

export function cartaoDeMateria(m: BlogPostData): BlogCardData {
  const { blocks: _b, publishedAt: _p, updatedAt: _u, ...cartao } = m;
  return cartao;
}

/* ── Produtos ─────────────────────────────────────────────────────────────── */

export async function fetchPublicProducts(
  input: Base & { category?: string; featured?: boolean; cursor?: string | null; limit?: number },
  cenario: Cenario = {},
): Promise<PublicProductPageData> {
  if (input.category && !categoriasDeProdutos.some((c) => c.slug === input.category))
    throw new RestaurantsPublicError('Categoria não encontrada.', 404);
  if (cenario.vazio) return { items: [], nextCursor: null };
  const lista = produtos
    .filter((p) => (!input.category || p.categorySlug === input.category) && (!input.featured || p.featured))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || ordemPt.compare(a.name, b.name))
    .map(cartao);
  return pagina(lista, input.cursor, Math.min(input.limit ?? 24, 48));
}

export async function fetchPublicProduct(input: Base & { slug: string }): Promise<PublicProductData | null> {
  return produtos.find((p) => p.slug === input.slug) ?? null;
}

export async function fetchPublicProductCategories(_input: Base) {
  return categoriasDeProdutos.filter((c) => c.count > 0);
}

export async function fetchPublicProductIndex(_input: Base) {
  return produtos.map((p) => ({ slug: p.slug, category: p.categorySlug, updatedAt: '2026-11-10T12:00:00.000Z' }));
}

/* ── Blog ─────────────────────────────────────────────────────────────────── */

export async function fetchBlogPosts(
  input: Base & { kind: BlogPostKind; category?: string; when?: 'upcoming' | 'past'; cursor?: string; limit?: number },
  cenario: Cenario = {},
): Promise<BlogPostsPage> {
  if (input.category && !categoriasDoBlog.some((c) => c.slug === input.category))
    throw new RestaurantsPublicError('Categoria não encontrada.', 404);
  if (cenario.vazio) return { items: [], nextCursor: null };
  const hoje = hojeNaCasa();
  let lista = materias.filter((m) => m.kind === input.kind && (!input.category || m.category?.slug === input.category));
  if (input.kind === 'event' && input.when) {
    lista = lista.filter((m) => eventIsUpcoming(m.event!, hoje) === (input.when === 'upcoming'));
    lista.sort((a, b) =>
      input.when === 'upcoming' ? a.event!.startsOn.localeCompare(b.event!.startsOn) : b.event!.startsOn.localeCompare(a.event!.startsOn),
    );
  } else {
    lista.sort((a, b) => b.date.localeCompare(a.date));
  }
  return pagina(lista.map(cartaoDeMateria), input.cursor, Math.min(input.limit ?? 12, 48));
}

export async function fetchBlogPost(input: Base & { slug: string }): Promise<BlogPostData | null> {
  return materias.find((m) => m.slug === input.slug) ?? null;
}

export async function fetchBlogCategories(_input: Base) {
  return categoriasDoBlog.filter((c) => c.count > 0);
}

export async function fetchBlogIndex(_input: Base) {
  return materias.map((m) => ({ kind: m.kind, slug: m.slug, updatedAt: m.updatedAt }));
}
