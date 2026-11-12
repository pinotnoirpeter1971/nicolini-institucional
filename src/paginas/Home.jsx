import { Layout, Arrow, Redes } from '../components/Layout';
import { Balcoes } from '../components/Balcoes';
import { CasaFotos } from '../components/CasaFotos';
import { Reveal } from '../components/Reveal';
import { casa, materias } from '../data/casa';

function Hero() {
  return (
    <section className="hero" data-header-hero>
      <div className="hero__media">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero-fatiando-presunto-poster.jpg"
        >
          <source src="/media/hero-fatiando-presunto.webm" type="video/webm" />
          <source src="/media/hero-fatiando-presunto.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero__scrim" />

      <div className="hero__inner">
        <p
          className="eyebrow hero__reveal"
          style={{ '--d': '60ms', color: 'rgba(255, 255, 255, 0.72)' }}
        >
          O EMPÓRIO NICOLINI
        </p>
        <h1 className="hero__reveal" style={{ '--d': '150ms' }}>
          O melhor da
          <br />
          <em>alta gastronomia.</em>
        </h1>
        <p className="hero__sub hero__reveal" style={{ '--d': '270ms' }}>
          A seleção de ingredientes da Nicolini é curada a dedo, com produtos
          de todo o mundo.
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  const { endereco } = casa;

  return (
    <Layout overlay ancorasLocais>
      <Hero />

      <section id="a-casa" className="band band--paper section section--casa">
        <div className="casa">
          <Reveal className="casa__media">
            <CasaFotos />
          </Reveal>

          <Reveal className="casa__copy" delay={90}>
            <h2>
              Para nós, a boa
              <br />
              gastronomia começa
              <br />
              <em>pelo ingrediente.</em>
            </h2>
            <div className="prose">
              <p>
                A Nicolini foi criada para quem aprecia a boa cozinha e busca
                pelos melhores ingredientes. Nossa seleção reúne produtos
                renomados dos quatro cantos do mundo, cada um com uma história
                única e o melhor padrão de qualidade.
              </p>
              <p>
                É onde você pode descobrir produtos, aprender mais sobre cada
                um e levar para casa aquilo um pouco de cada canto do mundo.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="o-que-encontra" className="band band--ink section section--balcoes">
        <div className="wrap">
          <Reveal className="secao__head">
            <div>
              <p className="eyebrow">Nossos produtos</p>
              <h2>
                A Nicolini tem tudo que você <em>busca.</em>
              </h2>
            </div>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <Balcoes />
        </Reveal>
      </section>

      {/* Texto de um lado, duas materias simetricas do outro — a mesma logica
          do bloco editorial do e-commerce, so que com o grid e os componentes
          do institucional. Antes eram tres blocos empilhados (cabecalho,
          grade assimetrica com uma materia "lead" maior, e uma terceira tira
          "tambem no blog"); agora e uma linha so. */}
      <section id="blog" className="band band--soft section section--blog">
        <div className="wrap blog__layout">
          <Reveal className="blog__intro">
            <p className="eyebrow">Blog Nicolini</p>
            <h2>
              Você cozinha,
              <br />
              com mais <em>repertório.</em>
            </h2>
            <p>
              Histórias de origem, ideias para cozinhar, produtos que merecem
              contexto e conversas que continuam depois da sobremesa.
            </p>
          </Reveal>

          {materias.slice(0, 2).map((materia, indice) => (
            <Reveal
              as="article"
              className="materia"
              key={materia.slug}
              delay={80 + indice * 100}
            >
              <div className="materia__figure">
                <img src={materia.foto} alt="" loading="lazy" />
              </div>
              <p className="eyebrow">{materia.assunto}</p>
              <h3>{materia.titulo}</h3>
              <p className="materia__resumo">{materia.resumo}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Antes disto era uma unica faixa vermelha, cheia (foto grande + titulo
          enorme + grade de horario/contato + dois botoes de estilos
          diferentes brigando entre si). Trocado pelo mesmo desenho de
          fechamento do Bistro — ver `como-chegar`/`mapa` em Bistro.jsx —, com
          os mesmos componentes (`.emporio`, `.reserva__grid`, `.horarios`,
          `.mapa`): uma foto e um convite curto, depois os dados em texto
          discreto, e o mapa sangrando no fim. */}
      <section className="band band--paper section">
        <div className="emporio">
          <Reveal className="emporio__figure">
            <img
              src="/media/loja/fachada.jpg"
              alt="Fachada de entrada do Empório Nicolini"
              loading="lazy"
            />
          </Reveal>

          <Reveal delay={90}>
            <p className="eyebrow">Uma casa em Caxias do Sul</p>
            <h2>
              Mais do que
              <br />
              uma <em>prateleira.</em>
            </h2>
            <div className="prose" style={{ marginTop: 24 }}>
              <p>
                A Nicolini é um lugar para descobrir, perguntar, provar e levar
                para casa aquilo que muda uma receita ou um encontro.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="contato" className="band band--ink section">
        <div className="wrap reserva__grid">
          <Reveal>
            <h2>Contato</h2>
            <div className="prose">
              <div>
                <a
                  className="link"
                  href={`https://wa.me/${casa.whatsapp.link}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {casa.whatsapp.exibicao} <Arrow direction="upRight" />
                </a>
              </div>
              <div>
                <a className="link" href={`tel:${casa.telefone.link}`}>
                  {casa.telefone.exibicao}
                </a>
              </div>
              <div>
                <a className="link" href={`mailto:${casa.email}`}>
                  {casa.email}
                </a>
              </div>
              <Redes />
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h2>Horários</h2>
            <dl className="horarios">
              {casa.horarios.map((item) => (
                <div key={item.dia} className={item.fechado ? 'is-fechado' : undefined}>
                  <dt>{item.dia}</dt>
                  <dd>{item.hora}</dd>
                </div>
              ))}
            </dl>
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
              <div>
                <a className="link" href={casa.mapsBusca} target="_blank" rel="noreferrer">
                  Abrir no Google Maps <Arrow direction="upRight" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mapa" aria-label="Mapa com a localização do Empório Nicolini">
        <iframe
          src={casa.mapsEmbed}
          title="Mapa com a localização do Empório Nicolini"
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
