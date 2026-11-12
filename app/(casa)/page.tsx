import { preload } from 'react-dom';
import Home from '../../src/paginas/Home';
import { emporio, metadados } from '../../src/metadados';
import { modulos } from '../../src/menu-do-site';
import { indiceDoBlog, materias, produtos } from '../../src/engine/fonte';

export const metadata = metadados({ caminho: '/', ...emporio });

/*
 * O destaque de produtos só existe com o módulo aceso; o bloco do Blog existe
 * quando o Engine tem matéria no ar (desligado ou vazio: some). Se o Engine
 * falhar, o bloco some e a home abre do mesmo jeito (SPEC-SITE §3.3). A home é
 * guardada por 60 s.
 */
export const revalidate = 60;

async function recentesDoBlog() {
  if (!(await indiceDoBlog())) return [];
  return (await materias({ kind: 'article', limit: 2 })).items;
}

async function seAcesso<T>(aceso: boolean, ler: () => Promise<T[]>): Promise<T[]> {
  if (!aceso) return [];
  try {
    return await ler();
  } catch {
    return [];
  }
}

export default async function Pagina() {
  /* O pôster do vídeo é a primeira imagem da home: pré-carga com prioridade,
   * já que <video poster> não entra na pré-carga automática do React. */
  preload('/media/hero-fatiando-presunto-poster.jpg', { as: 'image', fetchPriority: 'high' });
  const [destaques, recentes] = await Promise.all([
    seAcesso(modulos.produtos, async () => (await produtos({ featured: true, limit: 4 })).items),
    seAcesso(true, recentesDoBlog),
  ]);
  return <Home destaques={destaques} recentes={recentes} />;
}
