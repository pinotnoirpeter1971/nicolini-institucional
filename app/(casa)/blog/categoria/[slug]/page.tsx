import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../../../src/metadados';
import { modulos } from '../../../../../src/menu-do-site';
import { MATERIAS_NA_PRIMEIRA_PAGINA, MATERIAS_POR_PAGINA, categoriasDoBlog, cenarioDoLaboratorio, materias } from '../../../../../src/engine/fonte';
import { PaginaDoBlog } from '../../../../../src/paginas/Blog';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

/* Só as categorias do índice; o resto é 404 estático. ETAPA 3: ver produtos/[categoria]. */
export const dynamicParams = false;

export async function generateStaticParams() {
  if (!modulos.blog) return [];
  return (await categoriasDoBlog()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  if (!modulos.blog) return {};
  const { slug } = await params;
  const c = (await categoriasDoBlog()).find((x) => x.slug === slug);
  if (!c) return {};
  return metadadosDaPagina({ caminho: `/blog/categoria/${c.slug}`, titulo: `${c.name} · Blog`, descricao: `Matérias de ${c.name} no Blog Nicolini.` });
}

export default async function Pagina({ params, searchParams }: Props) {
  if (!modulos.blog) notFound();
  const { slug } = await params;
  const categorias = await categoriasDoBlog();
  const categoria = categorias.find((c) => c.slug === slug);
  if (!categoria) notFound();
  const pagina = await materias({ kind: 'article', category: slug, limit: MATERIAS_NA_PRIMEIRA_PAGINA }, await cenarioDoLaboratorio(searchParams));
  return <PaginaDoBlog categorias={categorias} categoria={categoria} itens={pagina.items} cursor={pagina.nextCursor} limite={MATERIAS_POR_PAGINA} />;
}
