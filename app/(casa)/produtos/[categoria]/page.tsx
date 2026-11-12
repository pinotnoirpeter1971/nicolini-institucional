import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../../src/metadados';
import { modulos } from '../../../../src/menu-do-site';
import { PRODUTOS_POR_PAGINA, categoriasDeProdutos, cenarioDoLaboratorio, produtos } from '../../../../src/engine/fonte';
import { PaginaDaCategoria } from '../../../../src/paginas/Produtos';

type Props = { params: Promise<{ categoria: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

/*
 * Só as categorias que existem (as do índice) viram página; o resto é 404 sem
 * consulta (SPEC-SITE §3.3). Com o módulo apagado a lista é vazia e toda
 * categoria é 404 estático. ETAPA 3: `dynamicParams = true` e `revalidate = 60`
 * se as páginas passarem a nascer na primeira visita.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  if (!modulos.produtos) return [];
  return (await categoriasDeProdutos()).map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { categoria } = await params;
  const c = modulos.produtos ? (await categoriasDeProdutos()).find((x) => x.slug === categoria) : null;
  if (!c) return {};
  return metadadosDaPagina({ caminho: `/produtos/${c.slug}`, titulo: c.name, descricao: c.description ?? `${c.name} na seleção da Nicolini.` });
}

export default async function Pagina({ params, searchParams }: Props) {
  if (!modulos.produtos) notFound();
  const { categoria } = await params;
  const categorias = await categoriasDeProdutos();
  const atual = categorias.find((c) => c.slug === categoria);
  if (!atual) notFound();
  const pagina = await produtos({ category: atual.slug, limit: PRODUTOS_POR_PAGINA }, await cenarioDoLaboratorio(searchParams));
  return <PaginaDaCategoria categoria={atual} categorias={categorias} itens={pagina.items} cursor={pagina.nextCursor} limite={PRODUTOS_POR_PAGINA} />;
}
