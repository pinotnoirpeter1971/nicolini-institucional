import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../../src/metadados';
import { indiceDeProdutos, produto as lerProduto, produtos } from '../../../../src/engine/fonte';
import { PaginaDoProduto } from '../../../../src/paginas/Produtos';
import { dadosEstruturadosDoProduto } from '../../../../src/ui/DadosEstruturados';

type Props = { params: Promise<{ slug: string }> };

/*
 * Guardada por 60 s. Os produtos do índice nascem no build; os demais, na
 * primeira visita, mas `lerProduto` só vai ao Engine se o slug estiver no
 * índice (guardado e compartilhado): endereço inventado é 404 sem chamada nova.
 */
export const revalidate = 60;

export async function generateStaticParams() {
  return (await indiceDeProdutos()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
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
  const p = await lerProduto((await params).slug);
  if (!p) notFound();
  const vizinhos = await produtos({ category: p.categorySlug, limit: 5 });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: dadosEstruturadosDoProduto(p) }} />
      <PaginaDoProduto produto={p} relacionados={vizinhos.items.filter((x) => x.id !== p.id).slice(0, 4)} />
    </>
  );
}
