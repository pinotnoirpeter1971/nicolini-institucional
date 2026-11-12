/*
 * A camada única entre o navegador e o Engine: sacola, envio, recibo e o "ver
 * mais" das listas (SPEC-SITE §3.2 e §3.5: o navegador fala direto com o
 * Engine, para o limite por IP valer por visitante).
 *
 * O "ver mais" do Blog já fala com o Engine pelo SDK. O resto (produtos, sacola
 * e pedido) hoje: no laboratório responde com os dados simulados; no build de
 * produção os módulos estão apagados e nada chama estas funções. ETAPA 3: trocar o ramo de
 * produção de `api()` pelo SDK (`./sdk-0.7.0/index.js`, mesmas funções).
 */
import type {
  BlogPostKind,
  BlogPostsPage,
  CreatePublicOrderInput,
  PublicOrderConfigData,
  PublicOrderReceiptData,
  PublicProductCardData,
  PublicProductPageData,
} from './sdk-0.7.0/index.js';
import { fetchBlogPosts } from './sdk-0.7.0/index.js';
import { casaNoEngine, engineUrl } from '../site';

type Simulado = typeof import('./simulado/navegador');

async function api(): Promise<Simulado> {
  /* A condição precisa estar escrita aqui (e não vir de outro módulo) para o
   * build de produção, que a troca por `false`, cortar o import simulado. */
  if (process.env.NODE_ENV === 'development') return import('./simulado/navegador');
  throw new Error('Módulo do Engine apagado neste build: ligar a fonte é a Etapa 3 (src/engine/navegador.ts).');
}

const base = { apiBaseUrl: engineUrl, restaurantKey: casaNoEngine };

export async function maisProdutos(filtro: { category?: string; featured?: boolean; cursor: string; limit?: number }): Promise<PublicProductPageData> {
  return (await api()).fetchPublicProducts({ ...base, ...filtro });
}

export async function maisMaterias(filtro: { kind: BlogPostKind; category?: string; when?: 'upcoming' | 'past'; cursor: string; limit?: number }): Promise<BlogPostsPage> {
  return fetchBlogPosts({ ...base, ...filtro });
}

/** Os produtos da sacola, com o preço de agora (sem cache). Id ausente: saiu do site. */
export async function produtosPorIds(ids: string[]): Promise<PublicProductCardData[]> {
  if (!ids.length) return [];
  return (await api()).fetchPublicProductsByIds({ ...base, ids });
}

/** Se a casa recebe pedidos, o aviso e os limites. `null`: a casa não tem Pedidos. */
export async function configDePedidos(): Promise<PublicOrderConfigData | null> {
  return (await api()).fetchPublicOrderConfig(base);
}

export async function enviarPedido(order: CreatePublicOrderInput): Promise<PublicOrderReceiptData> {
  return (await api()).createPublicOrder({ ...base, order });
}

/** O recibo pelo token, ou `null` (token errado ou vencido respondem igual). */
export async function lerRecibo(token: string): Promise<PublicOrderReceiptData | null> {
  return (await api()).lookupPublicOrder({ ...base, token });
}
