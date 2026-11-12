import { notFound, permanentRedirect } from 'next/navigation';
import { descricaoDaMateria } from '../../../../src/ui/descricao';
import { metadadosDaPagina } from '../../../../src/metadados';
import { indiceDoBlog, materia as lerMateria, materias } from '../../../../src/engine/fonte';
import { PaginaDaMateria } from '../../../../src/paginas/Blog';

type Props = { params: Promise<{ slug: string }> };

/* Guardada por 60 s. Matéria nova nasce na primeira visita (as mais recentes já saem prontas do build);
 * slug fora do índice (guardado) é 404 sem chamar o Engine (SPEC-SITE §3.3). */
export const revalidate = 60;

export async function generateStaticParams() {
  return ((await indiceDoBlog()) ?? [])
    .filter((m) => m.kind === 'article')
    .slice(0, 20)
    .map((m) => ({ slug: m.slug }));
}

async function noAr(slug: string) {
  const indice = await indiceDoBlog();
  return indice?.some((m) => m.slug === slug) ? lerMateria(slug) : null;
}

export async function generateMetadata({ params }: Props) {
  const m = await noAr((await params).slug);
  if (!m || m.kind !== 'article') return {};
  const capa = m.cover?.photo;
  return metadadosDaPagina({ caminho: `/blog/${m.slug}`, titulo: m.title, descricao: descricaoDaMateria(m), imagem: capa && capa.kind === 'image' ? capa : null });
}

export default async function Pagina({ params }: Props) {
  const m = await noAr((await params).slug);
  if (!m) notFound();
  /* Evento aberto pela rota do blog vai para a rota certa (SPEC-SITE §2). */
  if (m.kind === 'event') permanentRedirect(`/eventos/${m.slug}`);
  const recentes = await materias({ kind: 'article', limit: 4 });
  return <PaginaDaMateria materia={m} outras={recentes.items.filter((x) => x.id !== m.id).slice(0, 3)} />;
}
