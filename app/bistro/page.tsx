import Bistro from '../../src/paginas/Bistro';
import { emporio, metadados } from '../../src/metadados';

/* Antes, toda rota da SPA respondia com os metadados da home; ficam os mesmos. */
export const metadata = metadados({ caminho: '/bistro', ...emporio });

export default function Pagina() {
  return <Bistro />;
}
