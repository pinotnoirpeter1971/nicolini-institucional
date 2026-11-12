import { notFound } from 'next/navigation';
import { metadadosDaPagina } from '../../../src/metadados';
import { modulos } from '../../../src/menu-do-site';
import { PaginaDoRecibo } from '../../../src/sacola/PaginaDoRecibo';

/* Uma página estática só: o token vem no fragmento (/pedido#<token>) e nunca
 * chega ao servidor. `Referrer-Policy: no-referrer` está no next.config.ts. */
export const metadata = metadadosDaPagina({
  caminho: '/pedido',
  titulo: 'Pedido',
  descricao: 'O recibo do seu pedido na Nicolini.',
  privada: true,
});

export default function Pagina() {
  if (!modulos.pedidos) notFound();
  return <PaginaDoRecibo />;
}
