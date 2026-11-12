import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../src/metadados';
import { categoriasDeProdutos, produtos } from '../../../src/engine/fonte';
import { PaginaDeBusca, PaginaDeProdutos } from '../../../src/paginas/Produtos';

/* Página guardada por 60 s (SPEC-SITE §3.2). Módulo desligado: o Engine
 * responde 404 e a página repassa. */
export const revalidate = 60;


export const metadata = metadadosDaPagina({
  caminho: '/produtos',
  titulo: 'Produtos',
  descricao: 'Queijos, embutidos, massas, vinhos e conservas escolhidos um por um. Monte a sacola e envie o pedido pelo WhatsApp.',
});

/* PROVISÓRIO (demonstração, 12/11/2026; Pedro desfaz depois): `?busca=` filtra por nome e marca no servidor.
 * O SDK não tem busca: lê as listas por categoria e filtra aqui. */
const semAcento = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

async function buscar(termo: string, categorias: { slug: string }[]) {
  const listas = await Promise.all(
    categorias.map(async (c) => {
      const achados = [];
      let cursor: string | null = null;
      for (let i = 0; i < 8; i++) {
        const pagina: Awaited<ReturnType<typeof produtos>> = await produtos({ category: c.slug, limit: 48, cursor });
        achados.push(...pagina.items);
        if (!pagina.nextCursor) break;
        cursor = pagina.nextCursor;
      }
      return achados;
    }),
  );
  const alvo = semAcento(termo);
  return listas.flat().filter((p) => semAcento(`${p.name} ${p.brand ?? ''}`).includes(alvo));
}

export default async function Pagina({ searchParams }: { searchParams: Promise<{ busca?: string | string[] }> }) {
  const categorias = await categoriasDeProdutos();
  if (!categorias) notFound();
  const bruto = (await searchParams).busca;
  const termo = (Array.isArray(bruto) ? bruto[0] : bruto)?.trim().slice(0, 80);
  if (termo) return <PaginaDeBusca termo={termo} itens={await buscar(termo, categorias)} />;
  const destaques = categorias.length ? await produtos({ featured: true, limit: 8 }) : { items: [] };
  return <PaginaDeProdutos categorias={categorias} destaques={destaques.items} />;
}
