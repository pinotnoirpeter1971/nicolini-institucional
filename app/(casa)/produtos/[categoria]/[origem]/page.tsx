import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../../../src/metadados';
import { PRODUTOS_POR_PAGINA, localizarCategoria, produtos } from '../../../../../src/engine/fonte';
import { PaginaDaCategoria } from '../../../../../src/paginas/Produtos';

type Props = { params: Promise<{ categoria: string; origem: string }> };

/*
 * Um departamento filtrado pelo país de origem (/produtos/queijos/italia),
 * para onde leva a coluna "Origem" do menu suspenso. Guardada por 60 s e
 * criada na primeira visita, só se o país estiver entre as origens do
 * departamento (lista guardada): endereço inventado é 404 sem chamada ao Engine.
 */
export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

async function achar(params: Props['params']) {
  const { categoria, origem } = await params;
  const achada = await localizarCategoria(categoria);
  if (!achada || achada.filha) return null;
  const pais = (achada.departamento.origins ?? []).find((o) => o.slug === origem);
  return pais ? { ...achada, pais } : null;
}

export async function generateMetadata({ params }: Props) {
  const achada = await achar(params);
  if (!achada) return {};
  const { departamento, pais } = achada;
  return metadadosDaPagina({
    caminho: `/produtos/${departamento.slug}/${pais.slug}`,
    titulo: `${departamento.name} · ${pais.name}`,
    descricao: `${departamento.name} · ${pais.name}, na seleção da Nicolini.`,
  });
}

export default async function Pagina({ params }: Props) {
  const achada = await achar(params);
  if (!achada) notFound();
  const { categorias, departamento, pais } = achada;
  const pagina = await produtos({ category: departamento.slug, origin: pais.slug, limit: PRODUTOS_POR_PAGINA });
  return (
    <PaginaDaCategoria
      departamento={departamento}
      filha={null}
      origem={pais}
      categorias={categorias}
      itens={pagina.items}
      cursor={pagina.nextCursor}
      limite={PRODUTOS_POR_PAGINA}
    />
  );
}
