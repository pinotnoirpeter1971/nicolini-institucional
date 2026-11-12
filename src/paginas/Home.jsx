import Link from 'next/link';
import { Arrow } from '../components/Icons';
import { Balcoes } from '../components/Balcoes';
import { CasaFotos } from '../components/CasaFotos';
import { Reveal } from '../components/Reveal';
import { casa } from '../data/casa';
import { modulos } from '../menu-do-site';
import { CartaoDeProduto } from '../ui/CartaoDeProduto';
import { CapaNoCartao, enderecoDaMateria } from '../ui/CartaoDeMateria';

/*
 * A home (DESIGN-BRIEF §7). A abertura é a do site no ar (hero, "A casa" e
 * "Nossos produtos"); depois entram o destaque de produtos e o bloco vermelho
 * do e-commerce, o Blog (agora real, com link) e o fechamento. O destaque e o
 * Blog só aparecem com o módulo aceso e com conteúdo; a página não pede nada
 * ao Engine quando eles estão apagados.
 */

function Hero() {
  return (
    <section className="hero hero--casa">
      <div className="hero__media">
        <video autoPlay muted loop playsInline poster="/media/hero-fatiando-presunto-poster.jpg">
          <source src="/media/hero-fatiando-presunto.webm" type="video/webm" />
          <source src="/media/hero-fatiando-presunto.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero__scrim" />

      <div className="hero__inner">
        <p className="eyebrow hero__reveal" style={{ '--d': '60ms', color: 'rgba(255, 255, 255, 0.72)' }}>
          O EMPÓRIO NICOLINI
        </p>
        <h1 className="hero__reveal" style={{ '--d': '150ms' }}>
          O melhor da
          <br />
          <em>alta gastronomia.</em>
        </h1>
        <p className="hero__sub hero__reveal" style={{ '--d': '270ms' }}>
          A seleção de ingredientes da Nicolini é curada a dedo, com produtos de todo o mundo.
        </p>
        {modulos.produtos && (
          <div className="hero__cta hero__reveal" style={{ '--d': '360ms' }}>
            <Link className="botao botao--claro" href="/produtos">
              Explorar a seleção <Arrow />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* O bloco vermelho do e-commerce: a exceção de cor, uma por página (§10). */
function TabuaDeFrios() {
  const conversa = `https://wa.me/${casa.whatsapp.link}?text=${encodeURIComponent('Olá! Quero saber da tábua de frios da Nicolini.')}`;
  return (
    <section className="destaque-vermelho" aria-labelledby="tabua-de-frios">
      <div className="wrap destaque-vermelho__grade">
        <Reveal className="destaque-vermelho__foto">
          <img src="/media/blog/cestas.jpg" alt="Caixa vermelha da Nicolini com a seleção de frios" width="1000" height="1500" loading="lazy" decoding="async" />
        </Reveal>
        <Reveal className="destaque-vermelho__texto" delay={90}>
          <p className="eyebrow">Seleção de frios</p>
          <h2 id="tabua-de-frios">
            Conheça nossa
            <br />
            selecionada
            <br />
            <em>tábua de frios.</em>
          </h2>
          <p>Monte sua caixa sob medida ou escolha o padrão da casa. Com aparência Nicolini.</p>
          <div className="acoes">
            <a className="botao botao--claro" href={conversa} target="_blank" rel="noreferrer">
              Fale com a casa <Arrow direction="upRight" />
            </a>
            {modulos.produtos && (
              <Link className="link" href="/produtos/charcutaria">
                Ver a charcutaria <Arrow />
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * @param {{
 *   destaques?: import('../engine/sdk-0.7.0/index.js').PublicProductCardData[],
 *   recentes?: import('../engine/sdk-0.7.0/index.js').BlogCardData[],
 * }} props
 */
export default function Home({ destaques = [], recentes = [] }) {
  return (
    <>
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
                A Nicolini foi criada para quem aprecia a boa cozinha e busca pelos melhores ingredientes. Nossa seleção
                reúne produtos renomados dos quatro cantos do mundo, cada um com uma história única e o melhor padrão de
                qualidade.
              </p>
              <p>
                É onde você pode descobrir produtos, aprender mais sobre cada um e levar para casa aquilo um pouco de cada
                canto do mundo.
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
            {modulos.produtos && (
              <Link className="link secao__head-acao" href="/produtos">
                Ver todos os produtos <Arrow />
              </Link>
            )}
          </Reveal>
        </div>

        <Reveal delay={80}>
          <Balcoes comLinks={modulos.produtos} />
        </Reveal>
      </section>

      {destaques.length > 0 && (
        <section className="band band--paper section secao-destaques" aria-labelledby="selecao-da-semana">
          <div className="wrap">
            <Reveal className="cabeca-de-secao">
              <div>
                <p className="eyebrow">Seleção da semana</p>
                <h2 id="selecao-da-semana">
                  O que a casa
                  <br />
                  <em>recomenda.</em>
                </h2>
              </div>
              <Link className="link" href="/produtos">
                Ver todos os produtos <Arrow />
              </Link>
            </Reveal>
            <div className="grade-de-produtos grade-de-produtos--quatro">
              {destaques.map((produto) => (
                <CartaoDeProduto key={produto.id} produto={produto} />
              ))}
            </div>
          </div>
        </section>
      )}

      <TabuaDeFrios />

      {recentes.length > 0 && (
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
                Histórias de origem, ideias para cozinhar, produtos que merecem contexto e conversas que continuam depois
                da sobremesa.
              </p>
              <Link className="link blog__todas" href="/blog">
                Ver todas as matérias <Arrow />
              </Link>
            </Reveal>

            {recentes.map((materia, indice) => (
              <Reveal as="article" className="materia" key={materia.id} delay={80 + indice * 100}>
                <Link href={enderecoDaMateria(materia)} className="materia__link">
                  <div className="materia__figure">
                    <CapaNoCartao capa={materia.cover} sizes="(max-width: 760px) 100vw, 30vw" />
                  </div>
                  <p className="eyebrow">{materia.category?.name ?? 'Blog Nicolini'}</p>
                  <h3>{materia.title}</h3>
                  <p className="materia__resumo">{materia.excerpt}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Fechamento: a fachada e o convite do site no ar. Contato, horários e
          endereço passaram ao rodapé de cinco colunas, e o mapa mora na página
          da loja física: a home não repete os dois. */}
      <section className="band band--paper section">
        <div className="emporio">
          <Reveal className="emporio__figure">
            <img src="/media/loja/fachada.jpg" alt="Fachada de entrada do Empório Nicolini" loading="lazy" decoding="async" />
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
                A Nicolini é um lugar para descobrir, perguntar, provar e levar para casa aquilo que muda uma receita ou
                um encontro.
              </p>
              <p>
                {casa.endereco.linha1}, {casa.endereco.bairro}. {casa.horarios.map((h) => `${h.dia}: ${h.hora.toLowerCase()}`).join('; ')}.
              </p>
            </div>
            <div className="acoes" style={{ marginTop: 26 }}>
              <Link className="link" href="/a-loja">
                A loja física <Arrow />
              </Link>
              <a className="link" href={casa.mapsBusca} target="_blank" rel="noreferrer">
                Abrir no Google Maps <Arrow direction="upRight" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
