import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../../src/metadados';
import { PRODUTOS_POR_PAGINA, categoriasDeProdutos, cenarioDoLaboratorio, produtos } from '../../../../src/engine/fonte';
import { PaginaDaCategoria } from '../../../../src/paginas/Produtos';

type Props = { params: Promise<{ categoria: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

/*
 * Guardada por 60 s. As categorias que existem nascem no build; as demais
 * nascem na primeira visita (`dynamicParams`), mas só se estiverem na lista de
 * categorias, guardada e compartilhada por 60 s: endereço inventado é 404 sem
 * chamada nova ao Engine (SPEC-SITE §3.3). Não lê `searchParams` em produção.
 */
export const revalidate = 60;

export async function generateStaticParams() {
  return ((await categoriasDeProdutos()) ?? []).map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { categoria } = await params;
  const c = (await categoriasDeProdutos())?.find((x) => x.slug === categoria);
  if (!c) return {};
  return metadadosDaPagina({ caminho: `/produtos/${c.slug}`, titulo: c.name, descricao: c.description ?? `${c.name} na seleção da Nicolini.` });
}

export default async function Pagina({ params, searchParams }: Props) {
  const { categoria } = await params;
  const categorias = await categoriasDeProdutos();
  const atual = categorias?.find((c) => c.slug === categoria);
  if (!categorias || !atual) notFound();
  const pagina = await produtos({ category: atual.slug, limit: PRODUTOS_POR_PAGINA }, await cenarioDoLaboratorio(searchParams));
  return <PaginaDaCategoria categoria={atual} categorias={categorias} itens={pagina.items} cursor={pagina.nextCursor} limite={PRODUTOS_POR_PAGINA} />;
}
