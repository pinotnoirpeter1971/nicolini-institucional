import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { eventIsUpcoming } from '../../../../src/engine/sdk-0.7.0/index.js';
import { hojeNaCasa } from '../../../../src/engine/formato';
import { metadadosDaPagina } from '../../../../src/metadados';
import { modulos } from '../../../../src/menu-do-site';
import { indiceDoBlog, materia as lerMateria, materias } from '../../../../src/engine/fonte';
import { PaginaDoEvento } from '../../../../src/paginas/Blog';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  if (!modulos.eventos) return [];
  return (await indiceDoBlog()).map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props) {
  if (!modulos.eventos) return {};
  const m = await lerMateria((await params).slug);
  if (!m || m.kind !== 'event') return {};
  const capa = m.cover?.photo;
  return metadadosDaPagina({ caminho: `/eventos/${m.slug}`, titulo: m.title, descricao: m.excerpt, imagem: capa && capa.kind === 'image' ? capa : null });
}

export default async function Pagina({ params }: Props) {
  if (!modulos.eventos) notFound();
  const m = await lerMateria((await params).slug);
  if (!m) notFound();
  if (m.kind === 'article') permanentRedirect(`/blog/${m.slug}`);
  /* Evento com página própria (a Rustichella): o endereço leva direto a ela. */
  if (m.event?.landingPath) redirect(m.event.landingPath);
  const passado = !eventIsUpcoming(m.event!, hojeNaCasa());
  const proximos = await materias({ kind: 'event', when: 'upcoming', limit: 4 });
  return <PaginaDoEvento evento={m} passado={passado} outros={proximos.items.filter((x) => x.id !== m.id).slice(0, 2)} />;
}
