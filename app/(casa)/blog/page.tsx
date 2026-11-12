import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../src/metadados';
import { modulos } from '../../../src/menu-do-site';
import { MATERIAS_NA_PRIMEIRA_PAGINA, MATERIAS_POR_PAGINA, categoriasDoBlog, cenarioDoLaboratorio, materias } from '../../../src/engine/fonte';
import { PaginaDoBlog } from '../../../src/paginas/Blog';

/* Módulo apagado (hoje, em produção): 404 já no build. ETAPA 3: `revalidate = 60`. */
export const metadata = metadadosDaPagina({
  caminho: '/blog',
  titulo: 'Blog',
  descricao: 'Histórias de origem, ideias para cozinhar, produtos que merecem contexto e conversas que continuam depois da sobremesa.',
});

export default async function Pagina({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!modulos.blog) notFound();
  const cenario = await cenarioDoLaboratorio(searchParams);
  const [categorias, pagina] = await Promise.all([categoriasDoBlog(), materias({ kind: 'article', limit: MATERIAS_NA_PRIMEIRA_PAGINA }, cenario)]);
  return <PaginaDoBlog categorias={cenario.vazio ? [] : categorias} itens={pagina.items} cursor={pagina.nextCursor} limite={MATERIAS_POR_PAGINA} />;
}
