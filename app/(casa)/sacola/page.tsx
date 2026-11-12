import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../src/metadados';
import { modulos } from '../../../src/menu-do-site';
import { PaginaDaSacola } from '../../../src/sacola/PaginaDaSacola';

/* Página estática; a sacola vive no navegador e fala direto com o Engine (SPEC-SITE §6 e §7). */
export const metadata = metadadosDaPagina({
  caminho: '/sacola',
  titulo: 'Sacola',
  descricao: 'A sua seleção na Nicolini. Envie o pedido pelo WhatsApp.',
  privada: true,
});

export default function Pagina() {
  if (!modulos.pedidos) notFound();
  return <PaginaDaSacola />;
}
