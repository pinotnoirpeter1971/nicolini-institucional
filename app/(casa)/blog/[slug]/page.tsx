import { notFound, permanentRedirect } from 'next/navigation';
import { metadadosDaPagina } from '../../../../src/metadados';
import { modulos } from '../../../../src/menu-do-site';
import { indiceDoBlog, materia as lerMateria, materias } from '../../../../src/engine/fonte';
import { PaginaDaMateria } from '../../../../src/paginas/Blog';

type Props = { params: Promise<{ slug: string }> };

/* Só os slugs do índice (o 404 barato do SPEC-SITE §3.3); com o módulo apagado, nenhum. */
export const dynamicParams = false;

export async function generateStaticParams() {
  if (!modulos.blog) return [];
  return (await indiceDoBlog()).map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props) {
  if (!modulos.blog) return {};
  const m = await lerMateria((await params).slug);
  if (!m || m.kind !== 'article') return {};
  const capa = m.cover?.photo;
  return metadadosDaPagina({ caminho: `/blog/${m.slug}`, titulo: m.title, descricao: m.excerpt, imagem: capa && capa.kind === 'image' ? capa : null });
}

export default async function Pagina({ params }: Props) {
  if (!modulos.blog) notFound();
  const m = await lerMateria((await params).slug);
  if (!m) notFound();
  /* Evento aberto pela rota do blog vai para a rota certa (SPEC-SITE §2). */
  if (m.kind === 'event') permanentRedirect(`/eventos/${m.slug}`);
  const recentes = await materias({ kind: 'article', limit: 4 });
  return <PaginaDaMateria materia={m} outras={recentes.items.filter((x) => x.id !== m.id).slice(0, 3)} />;
}
