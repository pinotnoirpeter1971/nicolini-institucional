import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Arrow } from '../components/Layout';
import { GaleriaBistro } from '../components/GaleriaBistro';
import { Chevron } from '../components/Icons';
import { Reveal } from '../components/Reveal';
import { casa } from '../data/casa';
import { bistro, navBistro, pratos } from '../data/bistro';

const reservaWhats = `https://wa.me/${bistro.whatsapp.link}?text=${encodeURIComponent(
  'Olá! Gostaria de reservar uma mesa no Bistrô Nicolini.',
)}`;

/*
 * Paralaxe: o fundo sobe a uma fracao da rolagem enquanto o hero esta em cena.
 * O curso e limitado a folga que `.hero--bistro .hero__media` reserva em cima e
 * embaixo, entao a foto nunca descobre a borda. Fica em rAF pelo mesmo motivo
 * dos outros listeners da casa — ler `scrollY` a cada evento forca layout.
 */
function useParalaxe(referencia) {
  useEffect(() => {
    const el = referencia.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let frame = 0;

    const atualizar = () => {
      frame = 0;
      const altura = el.offsetHeight;
      /* Passado o hero o valor congela: continuar somando so gastaria pintura
       * numa faixa que ja saiu da tela. */
      const avanco = Math.min(window.scrollY, altura);
      el.style.setProperty('--paralaxe', `${(avanco * 0.12).toFixed(1)}px`);
    };

    const agendar = () => {
      if (!frame) frame = window.requestAnimationFrame(atualizar);
    };

    atualizar();
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
    return () => {
      window.removeEventListener('scroll', agendar);
      window.removeEventListener('resize', agendar);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [referencia]);
}

/*
 * O header continua sendo o da Nicolini, entao quem anuncia a casa e a marca do
 * bistro no centro da foto — sozinha, sem linha de apoio.
 *
 * Dois links, nao dois botoes: a acao aqui e discreta de proposito, para nao
 * competir com a marca. "Conheca" so desce a pagina (ancora de verdade, com a
 * rolagem suave que ja vem do `html`) e "Reservas" abre o WhatsApp — dai a seta
 * `upRight`, a mesma que o site usa em todo link que sai do site.
 *
 * A marca so aparece depois que a foto pinta. E o `onLoad` que decide, e nao um
 * atraso fixo: numa conexao lenta um tempo cego mostraria o logo sobre um
 * retangulo escuro vazio. `complete` cobre o caso de a foto vir do cache, em
 * que o evento ja passou antes deste efeito rodar.
 */
function Hero() {
  const secao = useRef(null);
  const foto = useRef(null);
  const [pronto, setPronto] = useState(false);
  useParalaxe(secao);

  useEffect(() => {
    if (foto.current?.complete) setPronto(true);
  }, []);

  return (
    <section
      className={`hero hero--bistro ${pronto ? 'esta-pronto' : ''}`}
      data-header-hero
      ref={secao}
    >
      <div className="hero__media">
        <img
          ref={foto}
          src={bistro.hero.foto}
          alt={bistro.hero.alt}
          fetchPriority="high"
          onLoad={() => setPronto(true)}
          /* Sem isto, uma foto que falha deixaria a marca invisivel para sempre. */
          onError={() => setPronto(true)}
        />
      </div>
      <div className="hero__scrim" />

      <div className="hero__inner">
        <img
          className="hero__marca"
          src={bistro.logo}
          alt={bistro.nome}
          width="515"
          height="268"
        />
        <div className="hero__acoes">
          <a className="link" href="#o-bistro">
            Conheça <Chevron direction="down" />
          </a>
          <a className="link" href={reservaWhats} target="_blank" rel="noreferrer">
            Reservas <Arrow direction="upRight" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Bistro() {
  const { endereco } = casa;

  return (
    <Layout overlay tema="bistro" nav={navBistro} ancorasLocais>
      <Hero />

      <section id="o-bistro" className="band band--paper section">
        <Reveal className="manifesto">
          <h2>
            O empório
            <br />
            <em>ganha forma.</em>
          </h2>
          <div className="prose">
            <p>
              O Bistrô Nicolini fica localizado em nosso mezanino. É onde o
              produto sai das nossas prateleiras e vira um prato único. O
              queijo que você prova no balcão é o mesmo que sai do ralador e
              recai no nhoque; o vinho da nossa adega, é o que servimos na sua
              mesa.
            </p>
            <p>
              Nossa cozinha valoriza os ingredientes individualmente, e a
              sazonalidade. Nossos pratos variam da inspiração francesa até a
              italiana.
            </p>
          </div>
        </Reveal>
      </section>

      {/* A galeria nasce colada no manifesto de proposito — a faixa de fotos e
          a continuacao do texto, nao uma secao nova —, entao so ha respiro
          embaixo. */}
      <section className="band band--paper secao--galeria">
        <Reveal>
          <GaleriaBistro />
        </Reveal>
      </section>

      <section className="band band--soft section">
        <div className="wrap">
          <Reveal className="secao__head">
            <div>
              <p className="eyebrow">O cardápio</p>
              <h2>
                Alguns pratos
                <br />
                da <em>casa.</em>
              </h2>
            </div>
            <p className="secao__head-nota">
              Nosso menu, que muda com a estação e com o que chega no Empório.
            </p>
          </Reveal>

          <div className="pratos">
            {pratos.map((prato, indice) => (
              <Reveal
                as="article"
                className="prato"
                key={prato.id}
                delay={60 + indice * 80}
              >
                <figure className="prato__figure">
                  <img src={prato.foto} alt={prato.nome} loading="lazy" />
                </figure>
                <h3>{prato.nome}</h3>
                <p>{prato.descricao}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="cardapio__rodape" delay={120}>
            <a className="link" href={reservaWhats} target="_blank" rel="noreferrer">
              Pedir o cardápio completo no WhatsApp <Arrow direction="upRight" />
            </a>
          </Reveal>
        </div>
      </section>

      <section className="cozinha">
        <img src="/media/bistro/fogo.jpg" alt="Fogo alto na cozinha do bistrô" loading="lazy" />
        <Reveal className="cozinha__copy">
          <p className="eyebrow" style={{ color: 'var(--marca-tint)' }}>
            A cozinha
          </p>
          <h2>
            Onde cada prato é
            <br />
            <em>desenvolvido.</em>
          </h2>
        </Reveal>
      </section>

      <section className="band band--paper section">
        <div className="emporio">
          <Reveal className="emporio__figure">
            <img
              src="/media/bistro/placa.jpg"
              alt="Placa do Bistrô Nicolini na entrada da casa"
              loading="lazy"
            />
          </Reveal>

          <Reveal delay={90}>
            <p className="eyebrow">A mesma Nicolini</p>
            <h2>
              Da prateleira
              <br />
              para a <em>cozinha.</em>
            </h2>
            <div className="prose" style={{ marginTop: 24 }}>
              <p>
                O bistrô e o empório moram no mesmo endereço. Quem almoça aqui
                costuma sair com um queijo na sacola. E quem compra aqui,
                costuma ficar para o almoço.
              </p>
            </div>
            <div className="acoes" style={{ marginTop: 26 }}>
              <Link className="link" to="/">
                Conhecer o empório <Arrow />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="como-chegar" className="band band--ink section">
        <div className="wrap reserva__grid">
          <Reveal>
            <h2>Reserva</h2>
            <div className="prose">
              <p>
                Reservamos por WhatsApp e por telefone.
              </p>
              <div>
                <a className="link" href={reservaWhats} target="_blank" rel="noreferrer">
                  {bistro.whatsapp.exibicao} <Arrow direction="upRight" />
                </a>
              </div>
              <div>
                <a className="link" href={`tel:${bistro.telefone.link}`}>
                  {bistro.telefone.exibicao}
                </a>
              </div>
              {/* Sem as redes da casa aqui: o WhatsApp do emporio apareceria
                  logo abaixo do WhatsApp do bistro, com numero diferente, e a
                  coluna de reserva passaria a oferecer dois contatos que nao
                  sao a mesma coisa. As redes ficam no rodape. */}
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h2>Horários</h2>
            <dl className="horarios">
              {bistro.horarios.map((item) => (
                <div key={item.dia} className={item.fechado ? 'is-fechado' : undefined}>
                  <dt>{item.dia}</dt>
                  <dd>{item.hora}</dd>
                </div>
              ))}
            </dl>
            <div className="prose" style={{ marginTop: 22 }}>
              <p>A cozinha fecha 30 minutos antes do salão.</p>
            </div>
          </Reveal>

          <Reveal delay={180}>
            <h2>Onde fica</h2>
            <div className="prose">
              <address style={{ fontStyle: 'normal' }}>
                {endereco.linha1}
                <br />
                {endereco.bairro} · {endereco.cidade} · {endereco.estado}
                <br />
                CEP {endereco.cep}
              </address>
              <p>No mezanino do empório, na mesma casa.</p>
              <div>
                <a className="link" href={casa.mapsBusca} target="_blank" rel="noreferrer">
                  Abrir no Google Maps <Arrow direction="upRight" />
                </a>
              </div>
            </div>
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
