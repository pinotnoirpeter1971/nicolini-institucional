import { notFound } from 'next/navigation';
import { casa } from '../../../src/data/casa';
import { metadadosDaPagina } from '../../../src/metadados';
import { modulos } from '../../../src/menu-do-site';
import { Migalhas } from '../../../src/ui/Migalhas';

/*
 * Política de privacidade (DESIGN-BRIEF §9, pergunta A8 do núcleo). Texto de
 * partida, curto, para Pedro e a casa revisarem antes da ativação: acende junto
 * com Pedidos (src/menu-do-site.ts). Declara o que o site faz hoje e o que o
 * pedido acrescenta.
 */
export const metadata = metadadosDaPagina({
  caminho: '/politica-de-privacidade',
  titulo: 'Política de privacidade',
  descricao: 'O que o site da Nicolini guarda, por quanto tempo e com quem fala.',
});

export default function Pagina() {
  if (!modulos.privacidade) notFound();
  return (
    <article className="texto-legal wrap">
      <Migalhas itens={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Política de privacidade' }]} />
      <p className="eyebrow">Nicolini</p>
      <h1>
        Política de <em>privacidade.</em>
      </h1>
      <div className="texto-legal__corpo">
        <p className="texto-legal__lede">O site da Nicolini pede o mínimo: não tem conta, não tem cadastro e não usa cookies de rastreio.</p>

        <h2>O que fica no seu navegador</h2>
        <p>
          A sacola guarda só os produtos e as quantidades que você escolheu, no próprio navegador. Os últimos pedidos feitos neste aparelho também ficam
          ali, para você reencontrar o recibo. Nada disso sai do aparelho até você enviar um pedido, e você pode apagar quando quiser.
        </p>

        <h2>O que vai para a loja</h2>
        <p>
          Ao enviar um pedido, mandamos à loja os itens, o seu nome e a observação, se houver. Não pedimos telefone, e-mail nem endereço: a conversa
          continua pelo WhatsApp, que você mesmo abre. O recibo fica acessível pelo link por 60 dias. Depois de um prazo, o nome e a observação são
          apagados do pedido.
        </p>

        <h2>Com quem o site fala</h2>
        <p>
          As fontes e as fotos saem do próprio site. Nas matérias com vídeo, a imagem de capa pode vir do YouTube, e o player só é carregado se você
          tocar nele, no modo sem cookies de rastreio. As páginas com mapa mostram o Google Maps. Não usamos ferramentas de métricas nem de anúncios.
        </p>

        <h2>Dúvidas</h2>
        <p>
          Escreva para <a href={`mailto:${casa.email}`}>{casa.email}</a> ou fale com a loja.
        </p>
        <p className="texto-legal__responsavel">
          {casa.razaoSocial} · CNPJ {casa.cnpj}
        </p>
      </div>
    </article>
  );
}
