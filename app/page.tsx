import Home from '../src/paginas/Home';
import { emporio, metadados } from '../src/metadados';

export const metadata = metadados({ caminho: '/', ...emporio });

export default function Pagina() {
  return <Home />;
}
