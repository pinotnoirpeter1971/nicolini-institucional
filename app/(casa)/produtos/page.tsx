import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../src/metadados';
import { categoriasDeProdutos, produtos } from '../../../src/engine/fonte';
import { PaginaDeProdutos } from '../../../src/paginas/Produtos';

/* Página guardada por 60 s (SPEC-SITE §3.2). Módulo desligado: o Engine
 * responde 404 e a página repassa. */
export const revalidate = 60;

export const metadata = metadadosDaPagina({
  caminho: '/produtos',
  titulo: 'Produtos',
  descricao: 'Queijos, embutidos, massas, vinhos e conservas escolhidos um por um. Monte a sacola e envie o pedido pelo WhatsApp.',
});

export default async function Pagina() {
  const categorias = await categoriasDeProdutos();
  if (!categorias) notFound();
  const destaques = categorias.length ? await produtos({ featured: true, limit: 8 }) : { items: [] };
  return <PaginaDeProdutos categorias={categorias} destaques={destaques.items} />;
}
