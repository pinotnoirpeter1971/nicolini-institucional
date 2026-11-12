import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../../../src/metadados';
import { MATERIAS_NA_PRIMEIRA_PAGINA, MATERIAS_POR_PAGINA, categoriasDoBlog, materias } from '../../../../../src/engine/fonte';
import { PaginaDoBlog } from '../../../../../src/paginas/Blog';

type Props = { params: Promise<{ slug: string }> };

/* Categoria nova nasce na primeira visita; a que não está na lista (guardada) é 404 sem chamar o Engine. */
export const revalidate = 60;

export async function generateStaticParams() {
  return ((await categoriasDoBlog()) ?? []).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const c = (await categoriasDoBlog())?.find((x) => x.slug === slug);
  if (!c) return {};
  return metadadosDaPagina({ caminho: `/blog/categoria/${c.slug}`, titulo: `${c.name} · Blog`, descricao: `Matérias de ${c.name} no Blog Nicolini.` });
}

export default async function Pagina({ params }: Props) {
  const { slug } = await params;
  const categorias = await categoriasDoBlog();
  const categoria = categorias?.find((c) => c.slug === slug);
  if (!categorias || !categoria) notFound();
  const pagina = await materias({ kind: 'article', category: slug, limit: MATERIAS_NA_PRIMEIRA_PAGINA });
  return <PaginaDoBlog categorias={categorias} categoria={categoria} itens={pagina.items} cursor={pagina.nextCursor} limite={MATERIAS_POR_PAGINA} />;
}
