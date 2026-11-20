import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../../src/metadados';
import { PRODUTOS_POR_PAGINA, categoriasDeProdutos, cenarioDoLaboratorio, localizarCategoria, produtos } from '../../../../src/engine/fonte';
import { PaginaDaCategoria } from '../../../../src/paginas/Produtos';

type Props = { params: Promise<{ categoria: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

/*
 * Guardada por 60 s. Serve os departamentos e as categorias de dentro deles
 * (D-141; os slugs são únicos na casa). As que existem nascem no build; as
 * demais nascem na primeira visita (`dynamicParams`), mas só se estiverem na
 * lista de categorias, guardada e compartilhada por 60 s: endereço inventado é
 * 404 sem chamada nova ao Engine (SPEC-SITE §3.3). Não lê `searchParams` em produção.
 */
export const revalidate = 60;

export async function generateStaticParams() {
  return ((await categoriasDeProdutos()) ?? []).flatMap((d) => [d.slug, ...(d.children ?? []).map((c) => c.slug)]).map((categoria) => ({ categoria }));
}

export async function generateMetadata({ params }: Props) {
  const achada = await localizarCategoria((await params).categoria);
  if (!achada) return {};
  const atual = achada.filha ?? achada.departamento;
  const titulo = achada.filha ? `${atual.name} · ${achada.departamento.name}` : atual.name;
  return metadadosDaPagina({ caminho: `/produtos/${atual.slug}`, titulo, descricao: atual.description ?? `${atual.name} na seleção da Nicolini.` });
}

export default async function Pagina({ params, searchParams }: Props) {
  const achada = await localizarCategoria((await params).categoria);
  if (!achada) notFound();
  const atual = achada.filha ?? achada.departamento;
  const pagina = await produtos({ category: atual.slug, limit: PRODUTOS_POR_PAGINA }, await cenarioDoLaboratorio(searchParams));
  return (
    <PaginaDaCategoria
      departamento={achada.departamento}
      filha={achada.filha}
      origem={null}
      categorias={achada.categorias}
      itens={pagina.items}
      cursor={pagina.nextCursor}
      limite={PRODUTOS_POR_PAGINA}
    />
  );
}
