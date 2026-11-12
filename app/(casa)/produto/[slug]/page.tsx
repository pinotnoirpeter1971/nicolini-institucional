import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../../src/metadados';
import { modulos } from '../../../../src/menu-do-site';
import { indiceDeProdutos, produto as lerProduto, produtos } from '../../../../src/engine/fonte';
import { PaginaDoProduto } from '../../../../src/paginas/Produtos';

type Props = { params: Promise<{ slug: string }> };

/* Ver a categoria: mesma regra (404 estático com o módulo apagado). */
export const dynamicParams = false;

export async function generateStaticParams() {
  if (!modulos.produtos) return [];
  return (await indiceDeProdutos()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  if (!modulos.produtos) return {};
  const p = await lerProduto((await params).slug);
  if (!p) return {};
  const foto = p.photos[0];
  return metadadosDaPagina({
    caminho: `/produto/${p.slug}`,
    titulo: p.name,
    descricao: p.description ?? `${p.name} na seleção da Nicolini.`,
    imagem: foto && foto.kind === 'image' ? foto : null,
  });
}

export default async function Pagina({ params }: Props) {
  if (!modulos.produtos) notFound();
  const p = await lerProduto((await params).slug);
  if (!p) notFound();
  const vizinhos = await produtos({ category: p.categorySlug, limit: 5 });
  return <PaginaDoProduto produto={p} relacionados={vizinhos.items.filter((x) => x.id !== p.id).slice(0, 4)} />;
}
