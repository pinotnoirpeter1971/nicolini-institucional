import Rustichella from '../../src/paginas/Rustichella';
import { metadados } from '../../src/metadados';

/*
 * Título, descrição e imagem de compartilhamento próprios: é o link que vai na
 * bio do Instagram e no impresso. Vinham do antigo rustichella.html.
 */
export const metadata = metadados({
  caminho: '/rustichella',
  titulo: 'Bistrô Nicolini & Rustichella d’Abruzzo',
  descricao:
    'Bistrô Nicolini & Rustichella d’Abruzzo: cinco tempos servidos em três noites, 8, 9 e 10 de outubro, em Caxias do Sul.',
  ogTitulo: 'Bistrô Nicolini & Rustichella d’Abruzzo — 8, 9 e 10 de outubro',
  ogDescricao: 'A casa de Abruzzo desembarca em Caxias do Sul: cinco tempos, três noites, lugares limitados.',
  ogImagem: '/media/rustichella/og-rustichella.jpg',
});

export default function Pagina() {
  return <Rustichella />;
}
