import { preload } from 'react-dom';
import Home from '../src/paginas/Home';
import { emporio, metadados } from '../src/metadados';

export const metadata = metadados({ caminho: '/', ...emporio });

export default function Pagina() {
  /* O pôster do vídeo é a primeira imagem da home: pré-carga com prioridade,
   * já que <video poster> não entra na pré-carga automática do React. */
  preload('/media/hero-fatiando-presunto-poster.jpg', { as: 'image', fetchPriority: 'high' });
  return <Home />;
}
