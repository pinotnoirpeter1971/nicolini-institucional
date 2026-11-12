import Loja from '../../src/paginas/Loja';
import { emporio, metadados } from '../../src/metadados';

/* Antes, toda rota da SPA respondia com os metadados da home; ficam os mesmos. */
export const metadata = metadados({ caminho: '/a-loja', ...emporio });

export default function Pagina() {
  return <Loja />;
}
