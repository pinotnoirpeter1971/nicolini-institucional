import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { eventIsUpcoming } from '../../../../src/engine/sdk-0.7.0/index.js';
import { hojeNaCasa } from '../../../../src/engine/formato';
import { descricaoDaMateria } from '../../../../src/ui/descricao';
import { imagemDaCapa, metadadosDaPagina } from '../../../../src/metadados';
import { indiceDoBlog, materia as lerMateria, materias } from '../../../../src/engine/fonte';
import { caminhoDaPaginaPropria } from '../../../../src/ui/CartaoDeMateria';
import { PaginaDoEvento } from '../../../../src/paginas/Blog';

type Props = { params: Promise<{ slug: string }> };

/* Como /blog/[slug]: guardada por 60 s, slug fora do índice é 404 barato. */
export const revalidate = 60;

export async function generateStaticParams() {
  return ((await indiceDoBlog()) ?? [])
    .filter((m) => m.kind === 'event')
    .slice(0, 20)
    .map((m) => ({ slug: m.slug }));
}

async function noAr(slug: string) {
  const indice = await indiceDoBlog();
  return indice?.some((m) => m.slug === slug) ? lerMateria(slug) : null;
}

export async function generateMetadata({ params }: Props) {
  const m = await noAr((await params).slug);
  if (!m || m.kind !== 'event') return {};
  return metadadosDaPagina({ caminho: `/eventos/${m.slug}`, titulo: m.title, descricao: descricaoDaMateria(m), imagem: imagemDaCapa(m.slug, m.cover) });
}

export default async function Pagina({ params }: Props) {
  const m = await noAr((await params).slug);
  if (!m) notFound();
  if (m.kind === 'article') permanentRedirect(`/blog/${m.slug}`);
  /* Evento com página própria (a Rustichella): o endereço leva direto a ela. */
  const propria = caminhoDaPaginaPropria(m.event);
  if (propria) redirect(propria);
  const passado = !eventIsUpcoming(m.event!, hojeNaCasa());
  const proximos = await materias({ kind: 'event', when: 'upcoming', limit: 4 });
  return <PaginaDoEvento evento={m} passado={passado} outros={proximos.items.filter((x) => x.id !== m.id).slice(0, 2)} />;
}
