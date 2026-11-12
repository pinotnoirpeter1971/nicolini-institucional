import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../src/metadados';
import { MATERIAS_NA_PRIMEIRA_PAGINA, MATERIAS_POR_PAGINA, categoriasDoBlog, indiceDoBlog, materias } from '../../../src/engine/fonte';
import { PaginaDoBlog } from '../../../src/paginas/Blog';

/* Guardada por 60 s (SPEC-SITE §3.2). Blog desligado no Engine: 404. */
export const revalidate = 60;

export const metadata = metadadosDaPagina({
  caminho: '/blog',
  titulo: 'Blog',
  descricao: 'Histórias de origem, ideias para cozinhar, produtos que merecem contexto e conversas que continuam depois da sobremesa.',
});

export default async function Pagina() {
  if (!(await indiceDoBlog())) notFound();
  const [categorias, pagina] = await Promise.all([categoriasDoBlog(), materias({ kind: 'article', limit: MATERIAS_NA_PRIMEIRA_PAGINA })]);
  return <PaginaDoBlog categorias={categorias ?? []} itens={pagina.items} cursor={pagina.nextCursor} limite={MATERIAS_POR_PAGINA} />;
}
