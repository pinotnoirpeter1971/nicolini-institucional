import { catalogoParaBusca, categoriasDeProdutos } from '../../../../src/engine/fonte';

/*
 * PROVISÓRIO (busca do header, 12/11/2026): o catálogo que a /busca filtra no navegador, com o nome
 * da categoria em cada produto. Guardado por 60 s, como as páginas: uma pesquisa não roda função
 * nem chama o Engine. Produtos desligado no Engine: 404 (também guardado).
 */
export const revalidate = 60;

export async function GET() {
  const categorias = await categoriasDeProdutos();
  if (!categorias) return Response.json({ itens: [] }, { status: 404 });
  const nomes = new Map(categorias.map((c) => [c.slug, c.name]));
  const itens = (await catalogoParaBusca()).map((p) => ({ ...p, categoryName: nomes.get(p.categorySlug) ?? null }));
  return Response.json({ itens });
}
