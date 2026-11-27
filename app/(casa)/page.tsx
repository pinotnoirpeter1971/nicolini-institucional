import { preload } from 'react-dom';
import Home from '../../src/paginas/Home';
import { emporio, metadados } from '../../src/metadados';
import { modulos } from '../../src/menu-do-site';
import { aberturaDaHome, categoriasDeProdutos, departamentosDaHome, indiceDoBlog, materias, produtos } from '../../src/engine/fonte';

export const metadata = metadados({ caminho: '/', ...emporio });

/*
 * Os departamentos e o destaque de produtos só existem com o módulo aceso
 * (sem ele, a home mostra os balcões da loja); o bloco do Blog existe
 * quando o Engine tem matéria no ar (desligado ou vazio: some). A abertura
 * vem do Engine (D-152) e, sem ele, é a de sempre. Os departamentos da
 * home são os escolhidos no painel (D-154) ou, sem escolha, todos. Se o Engine
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
  const [aberturas, departamentos, escolhidos, destaques, recentes] = await Promise.all([
    aberturaDaHome(),
    seAcesso(modulos.produtos, async () => (await categoriasDeProdutos()) ?? []),
    modulos.produtos ? departamentosDaHome() : null,
    seAcesso(modulos.produtos, async () => (await produtos({ featured: true, limit: 4 })).items),
    seAcesso(true, recentesDoBlog),
  ]);
  /* A primeira imagem da home com pré-carga e prioridade: o pôster do vídeo
   * (<video poster> não entra na pré-carga automática do React) ou a foto que
   * abre o carrossel, na largura que a tela pede. */
  const primeira = aberturas[0];
  if (primeira.kind === 'photo') {
    const { url } = primeira.photo;
    const sources = primeira.photo.kind === 'image' ? primeira.photo.sources : [];
    preload(url, {
      as: 'image',
      fetchPriority: 'high',
      ...(sources.length ? { imageSrcSet: sources.map((s) => `${s.url} ${s.width}w`).join(', '), imageSizes: '100vw' } : {}),
    });
  } else preload('/media/hero-fatiando-presunto-poster.jpg', { as: 'image', fetchPriority: 'high' });
  /* Sem escolha: todos, como sempre. Com escolha: só cartão com página (o
   * escolhido precisa estar entre as categorias no ar; as duas leituras têm
   * memória própria de 60 s) e, com menos de 2, a seção sai (`null`). */
  const naHome = escolhidos?.filter((e) => departamentos.some((d) => d.slug === e.slug));
  const secao = !naHome ? departamentos : naHome.length >= 2 ? naHome : null;
  return <Home departamentos={secao} destaques={destaques} recentes={recentes} aberturas={aberturas} />;
}
