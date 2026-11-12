import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../src/metadados';
import { modulos } from '../../../src/menu-do-site';
import { cenarioDoLaboratorio, materias } from '../../../src/engine/fonte';
import { PaginaDeEventos } from '../../../src/paginas/Blog';

/* Módulo apagado (hoje, em produção): 404 já no build. ETAPA 3: `revalidate = 60`. */
export const metadata = metadadosDaPagina({
  caminho: '/eventos',
  titulo: 'Eventos',
  descricao: 'Jantares, degustações e visitas de produtores no Empório e no Bistrô Nicolini.',
});

const REALIZADOS_POR_PAGINA = 6;

export default async function Pagina({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!modulos.eventos) notFound();
  const cenario = await cenarioDoLaboratorio(searchParams);
  const [proximos, realizados] = await Promise.all([
    materias({ kind: 'event', when: 'upcoming', limit: 12 }, cenario),
    materias({ kind: 'event', when: 'past', limit: REALIZADOS_POR_PAGINA }, cenario),
  ]);
  return <PaginaDeEventos proximos={proximos.items} realizados={realizados.items} cursorRealizados={realizados.nextCursor} limite={REALIZADOS_POR_PAGINA} />;
}
