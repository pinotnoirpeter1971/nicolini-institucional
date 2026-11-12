import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../src/metadados';
import { indiceDoBlog, materias } from '../../../src/engine/fonte';
import { PaginaDeEventos } from '../../../src/paginas/Blog';

/* Guardada por 60 s. Blog desligado no Engine: 404. */
export const revalidate = 60;

export const metadata = metadadosDaPagina({
  caminho: '/eventos',
  titulo: 'Eventos',
  descricao: 'Jantares, degustações e visitas de produtores no Empório e no Bistrô Nicolini.',
});

const REALIZADOS_POR_PAGINA = 6;

export default async function Pagina() {
  if (!(await indiceDoBlog())) notFound();
  const [proximos, realizados] = await Promise.all([
    materias({ kind: 'event', when: 'upcoming', limit: 12 }),
    materias({ kind: 'event', when: 'past', limit: REALIZADOS_POR_PAGINA }),
  ]);
  return <PaginaDeEventos proximos={proximos.items} realizados={realizados.items} cursorRealizados={realizados.nextCursor} limite={REALIZADOS_POR_PAGINA} />;
}
