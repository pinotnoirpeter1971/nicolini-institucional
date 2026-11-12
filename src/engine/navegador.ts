/*
 * A camada única entre o navegador e o Engine: sacola, envio, recibo e o "ver
 * mais" das listas (SPEC-SITE §3.2 e §3.5: o navegador fala direto com o
 * Engine, para o limite por IP valer por visitante).
 *
 * O "ver mais" do Blog e os Produtos e Pedidos (Etapa 3): direto no Engine pelo
 * SDK. Só o laboratório (`next dev`) responde com os dados simulados de
 * Produtos e Pedidos, e só se `NEXT_PUBLIC_SITE_DADOS` não for `engine`. No
 * build de produção o módulo Pedidos está apagado (`modulos.pedidos` em
 * src/menu-do-site.ts) e nada chama estas funções até a ativação.
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
import {
  createPublicOrder,
  fetchBlogPosts,
  fetchPublicOrderConfig,
  fetchPublicProducts,
  fetchPublicProductsByIds,
  lookupPublicOrder,
} from './sdk-0.7.0/index.js';
import { casaNoEngine, engineUrl } from '../site';

type Simulado = typeof import('./simulado/navegador');

async function api(): Promise<Simulado> {
  /* A condição precisa estar escrita aqui (e não vir de outro módulo) para o
   * build de produção, que a troca por `false`, cortar o import simulado. */
  if (process.env.NODE_ENV === 'development') return import('./simulado/navegador');
  throw new Error('Módulo do Engine apagado neste build: ligar a fonte é a Etapa 3 (src/engine/navegador.ts).');
}

/* O simulado, só no `next dev` sem `NEXT_PUBLIC_SITE_DADOS=engine`; senão `null` e vale o SDK. */
async function simulado(): Promise<Simulado | null> {
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SITE_DADOS !== 'engine') return import('./simulado/navegador');
  return null;
}

const base = { apiBaseUrl: engineUrl, restaurantKey: casaNoEngine };
/* Leitura curta; o envio espera mais (reenviar a mesma chave não duplica). */
const sinal = (ms = 8000) => AbortSignal.timeout(ms);

export async function maisProdutos(filtro: { category?: string; featured?: boolean; cursor: string; limit?: number }): Promise<PublicProductPageData> {
  const s = await simulado();
  if (s) return s.fetchPublicProducts({ ...base, ...filtro });
  return fetchPublicProducts({ ...base, ...filtro });
}

export async function maisMaterias(filtro: { kind: BlogPostKind; category?: string; when?: 'upcoming' | 'past'; cursor: string; limit?: number }): Promise<BlogPostsPage> {
  return fetchBlogPosts({ ...base, ...filtro });
}

/** Os produtos da sacola, com o preço de agora (sem cache). Id ausente: saiu do site. */
export async function produtosPorIds(ids: string[]): Promise<PublicProductCardData[]> {
  if (!ids.length) return [];
  const s = await simulado();
  if (s) return s.fetchPublicProductsByIds({ ...base, ids });
  return fetchPublicProductsByIds({ ...base, ids, signal: sinal() });
}

/** Se a casa recebe pedidos, o aviso e os limites. `null`: a casa não tem Pedidos. */
export async function configDePedidos(): Promise<PublicOrderConfigData | null> {
  const s = await simulado();
  if (s) return s.fetchPublicOrderConfig(base);
  return fetchPublicOrderConfig({ ...base, signal: sinal() });
}

export async function enviarPedido(order: CreatePublicOrderInput): Promise<PublicOrderReceiptData> {
  const s = await simulado();
  if (s) return s.createPublicOrder({ ...base, order });
  return createPublicOrder({ ...base, order, signal: sinal(20000) });
}

/** O recibo pelo token, ou `null` (token errado ou vencido respondem igual). O token vai no corpo. */
export async function lerRecibo(token: string): Promise<PublicOrderReceiptData | null> {
  const s = await simulado();
  if (s) return s.lookupPublicOrder({ ...base, token });
  return lookupPublicOrder({ ...base, token, signal: sinal() });
}
