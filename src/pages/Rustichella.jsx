import { useEffect, useRef, useState } from 'react';
import { Layout, Arrow } from '../components/Layout';
import { Chevron } from '../components/Icons';
import { CasaFotos } from '../components/CasaFotos';
import { Reveal } from '../components/Reveal';
import { casa } from '../data/casa';
import { bistro } from '../data/bistro';
import {
  aberturaFotos,
  creditoFotos,
  delegacao,
  evento,
  fatos,
  navEvento,
  sangria,
  tempos,
  tira,
} from '../data/rustichella';

const reservaWhats = `https://wa.me/${bistro.whatsapp.link}?text=${encodeURIComponent(
  'Olá! Gostaria de reservar uma mesa no jantar Nicolini & Rustichella d’Abruzzo.',
)}`;

/*
 * `*assim*` vira italico. E a mesma marcacao que o cliente escreve a mao no
 * `TEXTOS-RUSTICHELLA.md`, entao o texto chega do doc para o dado sem tradutor
 * no meio — e sem guardar HTML dentro de `data/`, que e onde ele viraria uma
 * segunda linguagem de template.
 *
 * `split` com grupo de captura devolve os pedacos fora e dentro dos asteriscos
 * alternados, entao o indice impar e sempre o que estava marcado.
 */
function comEnfase(texto) {
  return texto
    .split(/\*([^*]+)\*/g)
    .map((parte, posicao) => (posicao % 2 ? <i key={posicao}>{parte}</i> : parte));
}

/*
 * A espiga e um `span` mascarado, nao um `img`: o PNG carrega so o canal alfa e
 * a cor sai de `currentColor`. E o que permite a mesma peca aparecer verde
 * sobre o creme e clara sobre a faixa escura sem duas versoes do arquivo.
 */
function Espiga({ className }) {
  return <span className={`espiga ${className || ''}`} aria-hidden="true" />;
}

/*
 * O hero do evento nao repete a paralaxe do bistro. La o assunto e a casa e o
 * movimento sugere que a camera anda pelo salao; aqui o assunto e um campo
 * parado ao fim da tarde, e o mesmo gesto so daria inquietacao a uma foto que
 * vive de calma.
 *
 * O que se mantem e a ordem de entrada: a foto pinta, as marcas acendem, os
 * links vem por ultimo. Quem libera tudo e o `onLoad`, nao um atraso fixo —
 * numa conexao lenta um tempo cego mostraria as marcas sobre um retangulo
 * escuro vazio. `complete` cobre o caso de a foto vir do cache, em que o
 * evento ja passou antes deste efeito rodar.
 */
function Hero() {
  const foto = useRef(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (foto.current?.complete) setPronto(true);
  }, []);

  return (
    <section className={`hero hero--evento ${pronto ? 'esta-pronto' : ''}`} data-header-hero>
      <div className="hero__media">
        <img
          ref={foto}
          src={evento.hero.foto}
          alt={evento.hero.alt}
          fetchPriority="high"
          onLoad={() => setPronto(true)}
          /* Sem isto, uma foto que falha deixaria as marcas invisiveis para sempre. */
          onError={() => setPronto(true)}
        />
      </div>
      <div className="hero__scrim" />

      <div className="hero__inner">
        {/*
         * As marcas entram como sobrescrito — o lugar onde antes havia uma
         * linha em caixa alta. Assinam de quem e o jantar e saem da frente do
         * titulo, que e quem fala.
         *
         * Sem conjuncao entre elas: neste tamanho um "&" pesaria mais que os
         * proprios logos, e sobrescrito nao e frase — e credito. O "&" que
         * importa esta no titulo, logo abaixo.
         */}
        <p className="evento__marcas">
          <img
            className="evento__logo evento__logo--bistro"
            /* Compacta, nao a completa: a legenda "ALTA GASTRONOMIA" sob o
               arabesco nao sobrevive a este tamanho sobre a foto. */
            src={bistro.logoCompacta}
            alt={bistro.nome}
            width="515"
            height="223"
          />
          <img
            className="evento__logo evento__logo--rustichella"
            src={evento.logo}
            alt={evento.convidada}
            width="900"
            height="514"
          />
        </p>

        {/*
         * O titulo e o encontro das duas casas, escrito por extenso. Prefere
         * uma linha so; quando nao couber, quebra depois do "&" e nunca dentro
         * de um dos dois nomes — ver `.evento__titulo em` no CSS.
         */}
        <h1 className="evento__titulo">
          {evento.titulo.casa}&nbsp;&amp; <em>{evento.titulo.convidada}</em>
        </h1>

        {/* Quem chega pela bio do Instagram pode nunca ter ouvido o nome
            Rustichella: a linha diz o que o titulo, sozinho, nao diz. */}
        <p className="evento__resumo">{evento.resumo}</p>

        <p className="evento__datas">
          {evento.datas} de {evento.ano} · {evento.horario}
        </p>

        <div className="hero__acoes">
          <a className="link" href="#o-menu">
            Ver o menu <Chevron direction="down" />
          </a>
          <a className="link" href={reservaWhats} target="_blank" rel="noreferrer">
            Reservar <Arrow direction="upRight" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* No celular, os pontos deixam claro que a sequencia continua. Eles tambem
 * permitem saltar para qualquer foto sem cobrir a imagem com controles. */
function TiraRustichella() {
  const trilho = useRef(null);
  const [ativa, setAtiva] = useState(0);

  useEffect(() => {
    const el = trilho.current;
    if (!el) return undefined;

    const atualizarAtiva = () => {
      const itens = Array.from(el.children);
      if (!itens.length) return;

      const proxima = itens.reduce((melhor, item, indice) => {
        const distanciaAtual = Math.abs(item.offsetLeft - el.scrollLeft);
        const distanciaMelhor = Math.abs(itens[melhor].offsetLeft - el.scrollLeft);
        return distanciaAtual < distanciaMelhor ? indice : melhor;
      }, 0);

      setAtiva(proxima);
    };

    atualizarAtiva();
    el.addEventListener('scroll', atualizarAtiva, { passive: true });
    return () => el.removeEventListener('scroll', atualizarAtiva);
  }, []);

  const irPara = (indice) => {
    const el = trilho.current;
    const item = el?.children[indice];
    if (!item) return;

    item.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  };

  return (
    <>
      <div className="tira" ref={trilho}>
        {tira.map((item, indice) => (
          <Reveal
            as="figure"
            className="tira__item"
            key={item.id}
            delay={40 + indice * 60}
          >
            <img src={item.foto} alt={item.alt} loading="lazy" />
            <figcaption>
              <h3>{item.titulo}</h3>
              <p>{comEnfase(item.descricao)}</p>
            </figcaption>
          </Reveal>
        ))}
      </div>

      <nav className="tira__paginacao" aria-label="Navegação pelas fotos da Rustichella">
        {tira.map((item, indice) => (
          <button
            type="button"
            className={indice === ativa ? 'esta-ativa' : undefined}
            aria-label={`Ver foto ${indice + 1}: ${item.titulo}`}
            aria-current={indice === ativa ? 'true' : undefined}
            key={item.id}
            onClick={() => irPara(indice)}
          />
        ))}
      </nav>
    </>
  );
}

export default function Rustichella() {
  const { endereco } = casa;

  return (
    <Layout overlay tema="rustichella" nav={navEvento} ancorasLocais>
      <Hero />

      {/*
       * Abertura: fotos a esquerda, texto e selo a direita, espiga de marca
       * d'agua atras.
       *
       * O sobrescrito "O jantar" saiu e o selo cresceu para ocupar o lugar
       * dele: um e outro diziam a mesma coisa no mesmo ponto da pagina, e entre
       * um rotulo generico e a marca da convidada, quem assina melhor a secao e
       * a marca.
       */}
      <section id="o-jantar" className="band band--paper section secao--historia">
        <Espiga className="espiga--historia" />

        <div className="wrap historia">
          {/*
           * Tres fotos na mesma moldura, uma de cada vez, com legenda e
           * contador. Volta a ser trilho a pedido do cliente, mas o de
           * `CasaFotos`: anda so quando alguem manda, ao contrario do carrossel
           * antigo, que trocava sozinho a cada cinco segundos.
           */}
          <CasaFotos
            fotos={aberturaFotos}
            rotulo="Fotos do pastifício Rustichella d’Abruzzo"
            className="quadro-evento"
          />

          <Reveal className="historia__copy" delay={90}>
            {/*
             * O selo assina a secao no lugar do sobrescrito. Logo nao e
             * fotografia: dentro do carrossel ele precisava de padding,
             * `contain` e fundo proprio — excecao no CSS para metade do
             * conteudo e sinal de que a moldura estava errada.
             */}
            <img
              className="historia__selo"
              src={evento.logo}
              alt={evento.convidada}
              width="900"
              height="514"
            />
            <h2>
              Uma das grandes
              <br />
              <em>massas do mundo.</em>
            </h2>
            <div className="prose">
              <p>
                Fundada em 1924, em Abruzzo, a Rustichella d’Abruzzo é uma das
                grandes referências italianas em massa seca. Construiu reputação
                entre chefs e restaurantes de alta gastronomia com uma produção
                orientada menos pela escala e mais pela qualidade do que chega
                ao prato.
              </p>
              <p>
                À primeira vista os ingredientes são simples: sêmola e água. A
                diferença está em detalhes que costumam passar despercebidos.
                Sêmolas selecionadas de trigo duro, água pura de montanha do
                Abruzzo, matrizes de bronze e uma secagem lenta, de até 50
                horas, a no máximo 40 °C. É o que preserva o aroma do próprio
                trigo, a estrutura e a textura.
              </p>
              <p>
                Em outubro a casa atravessa o Atlântico. Maria Stefania Peduzzi,
                proprietária da Rustichella, e o chef Emmanuel Di Liddo, Chef
                Ambassador da marca, desembarcam em Caxias do Sul para cozinhar
                três noites no Bistrô Nicolini.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/*
       * A virada entre "o jantar" e os convidados, no lugar onde havia uma
       * faixa que esticava uma foto de 905px de ponta a ponta da tela.
       *
       * Aqui e a propria delegacao, e a foto foi cortada para sangrar. Nao tem
       * `h2` de proposito: e uma fotografia com legenda, nao uma secao.
       *
       * O scrim corre da esquerda para a direita, e nao de baixo para cima como
       * o de `.cozinha`: sao duas sangrias na mesma pagina, e escurecidas pelo
       * mesmo lado a segunda pareceria repeticao da primeira.
       */}
      <section className="sangria">
        <img src={sangria.foto} alt={sangria.alt} loading="lazy" />
        <Reveal className="sangria__copy">
          <p className="sangria__linha">{sangria.linha}</p>
          <p className="sangria__legenda">{sangria.legenda}</p>
          <p className="credito">{creditoFotos}</p>
        </Reveal>
      </section>

      {/* Os convidados entram como uma apresentacao curta, seguida pelos dois
          retratos na medida de retrato. A descricao e provisoria ate a casa
          aprovar a apresentacao editorial definitiva. */}
      <section className="band band--paper section convidados">
        <div className="wrap">
          <Reveal className="convidados__head">
            <h2>Os convidados</h2>
            <p>
              Da Itália para Caxias do Sul, a liderança da Rustichella d’Abruzzo e seu
              Chef Ambassador chegam ao Bistrô Nicolini para três noites dedicadas às massas.
            </p>
          </Reveal>

          <div className="delegacao">
            {delegacao.map((pessoa, indice) => (
              <Reveal
                as="article"
                className="pessoa"
                key={pessoa.id}
                delay={60 + indice * 80}
              >
                {/*
                 * O lugar de quem ainda nao tem retrato ja fica reservado, com
                 * a mesma proporcao dos outros. Assim a pagina nao muda de
                 * forma quando a foto chegar — so troca o conteudo da moldura.
                 */}
                <figure className={`pessoa__figure ${pessoa.semRetrato ? 'esta-vazia' : ''}`}>
                  {pessoa.semRetrato ? (
                    <span className="pessoa__vazio">Retrato a caminho</span>
                  ) : (
                    <img src={pessoa.foto} alt={pessoa.alt} loading="lazy" />
                  )}
                </figure>
                <h3>{pessoa.nome}</h3>
                <p className="pessoa__papel">{pessoa.papel}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/*
       * A tira. Cinco fotos com legenda que respondem, em ordem, a pergunta do
       * titulo: o grao, o bronze, a secagem, o resultado no prato e quem
       * reconhece. E o argumento do release em cinco imagens.
       *
       * Fica ANTES do menu porque e ela que explica por que esta massa merece
       * um jantar — e a carta, logo abaixo, e a resposta pratica disso.
       */}
      <section className="band band--soft section">
        {/* A cabeca fica na medida de leitura e as fotos na medida larga. E o
            mesmo desencontro proposital do trilho dos balcoes na home. */}
        <div className="wrap">
          <Reveal className="secao__head">
            <div>
              <p className="eyebrow">{evento.convidada}</p>
              <h2>
                O que a torna
                <br />
                <em>tão especial?</em>
              </h2>
            </div>
            <p className="secao__head-nota">
              Nem toda massa é igual: algumas são feitas com técnicas milenares e
              se tornam protagonistas.
            </p>
          </Reveal>
        </div>

        <TiraRustichella />
      </section>

      {/*
       * A carta. Saiu do quase-preto e entrou no vermelho da casa: o cliente
       * pediu para rever a cor escura, e o vermelho do institucional era a
       * terceira cor que ele mesmo propos para a pagina. Sobre creme e verde,
       * ele fecha o unico trio que faz sentido aqui.
       *
       * E ficou curta. Os rotulos de etapa por extenso ("Terceiro prato")
       * dobravam a altura de cada tempo sem dizer nada que o numeral ja nao
       * dissesse, e a nota de abertura repetia o que os fatos rapidos afirmam
       * mais abaixo.
       */}
      <section id="o-menu" className="band band--vinho section">
        <div className="wrap carta">
          <Reveal className="carta__head">
            <Espiga className="espiga--carta" />
            <p className="eyebrow">O menu</p>
            <h2>
              Cinco <em>tempos.</em>
            </h2>
          </Reveal>

          {/*
           * Sem foto nenhuma: os cinco pratos ainda nao foram executados aqui,
           * e fotos genericas de massa mentiriam sobre o prato agora e seriam
           * trocadas na primeira semana depois do evento. O que sustenta a
           * secao e a composicao — eixo central, espiga na cabeca, numeral em
           * italico na frente de cada nome.
           */}
          <ol className="tempos">
            {tempos.map((tempo, indice) => (
              <Reveal
                as="li"
                className={`tempo ${tempo.aDefinir ? 'tempo--aberto' : ''}`}
                key={tempo.id}
                delay={40 + indice * 60}
              >
                <h3>
                  <span className="tempo__ordem">{tempo.ordem}</span>
                  {tempo.nome}
                </h3>
                <p className="tempo__descricao">{tempo.descricao}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/*
       * Onde acontece. A foto e vertical e a faixa e larga, entao a banda vem
       * mais alta que a do bistro e o enquadramento sobe: assim sobram as vigas
       * e as luminarias, e nao so os tampos das mesas.
       */}
      <section className="cozinha cozinha--local">
        <img src={evento.local.foto} alt={evento.local.alt} loading="lazy" />
        <Reveal className="cozinha__copy">
          <p className="eyebrow" style={{ color: 'var(--marca-tint)' }}>
            Localização
          </p>
          <h2>
            No Bistrô do
            <br />
            <em>Empório Nicolini.</em>
          </h2>
          <p>
            O jantar é servido no mezanino do empório, que já inclui a
            Rustichella d’Abruzzo em sua curadoria de produtos.
          </p>
        </Reveal>
      </section>

      {/*
       * As quatro perguntas que chegam por WhatsApp: quando, que horas, o que
       * se come e se ainda tem lugar.
       *
       * Ficava logo abaixo do hero, onde repetia as datas a menos de uma tela
       * de onde o proprio hero as diz. Desceu para encostar na reserva — e no
       * momento de decidir que a resposta rapida vale, nao na chegada.
       */}
      <section className="band band--soft fatos">
        <div className="wrap fatos__grid">
          {fatos.map((fato, indice) => (
            <Reveal className="fato" key={fato.rotulo} delay={indice * 70}>
              <p className="eyebrow">{fato.rotulo}</p>
              <p className="fato__valor">{fato.valor}</p>
              <p className="fato__nota">{fato.nota}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/*
       * A reserva virou uma tarja de uma linha. Era uma grade de tres colunas
       * que repetia, no mesmo rolar de tela, as datas da faixa de fatos logo
       * acima e o endereco do mapa logo abaixo. Aqui sobra so o que nao esta em
       * nenhum outro lugar: o numero para onde escrever.
       */}
      <section id="reserva" className="band band--vinho reserva-faixa">
        <div className="wrap reserva-faixa__inner">
          <Reveal as="p" className="reserva-faixa__texto">
            Faça sua reserva pelo nosso WhatsApp, vagas limitadas.
          </Reveal>
          <Reveal delay={90}>
            <a className="link" href={reservaWhats} target="_blank" rel="noreferrer">
              {bistro.whatsapp.exibicao} <Arrow direction="upRight" />
            </a>
          </Reveal>
        </div>
      </section>

      <section className="mapa" aria-label="Mapa com a localização do Bistrô Nicolini">
        <iframe
          src={casa.mapsEmbed}
          title="Mapa com a localização do Bistrô Nicolini"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="mapa__card">
          <p className="eyebrow">Como chegar</p>
          <address>
            {endereco.linha1}
            <br />
            {endereco.bairro} · {endereco.cidade}
          </address>
          <a className="link" href={casa.mapsBusca} target="_blank" rel="noreferrer">
            Traçar rota <Arrow direction="upRight" />
          </a>
        </div>
      </section>
    </Layout>
  );
}
