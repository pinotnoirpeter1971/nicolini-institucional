import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../src/metadados';
import { modulos } from '../../../src/menu-do-site';
import { categoriasDeProdutos, produtos } from '../../../src/engine/fonte';
import { PaginaDeProdutos } from '../../../src/paginas/Produtos';

/* Módulo apagado (hoje, em produção): 404 já no build, sem chamada nenhuma.
 * ETAPA 3: `export const revalidate = 60` ao ligar ao Engine. */
export const metadata = metadadosDaPagina({
  caminho: '/produtos',
  titulo: 'Produtos',
  descricao: 'Queijos, embutidos, massas, vinhos e conservas escolhidos um por um. Monte a sacola e envie o pedido pelo WhatsApp.',
});

export default async function Pagina() {
  if (!modulos.produtos) notFound();
  const [categorias, destaques] = await Promise.all([categoriasDeProdutos(), produtos({ featured: true, limit: 8 })]);
  return <PaginaDeProdutos categorias={categorias} destaques={destaques.items} />;
}
