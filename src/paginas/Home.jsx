import Link from 'next/link';
import { Arrow } from '../components/Icons';
import { CasaFotos } from '../components/CasaFotos';
import { Reveal } from '../components/Reveal';
import { casa, setores } from '../data/casa';
import { conteudoAConfirmar, modulos } from '../menu-do-site';
import { CartaoDeProduto } from '../ui/CartaoDeProduto';
import { FotoDoDepartamento } from './Produtos';
import { CapaNoCartao, enderecoDaMateria } from '../ui/CartaoDeMateria';

/*
 * A home (DESIGN-BRIEF §7, refeita em 19/11/2026 no desenho do protótipo do
 * e-commerce, a pedido do cliente). A abertura continua a do site no ar. O
 * destaque e o Blog só aparecem com o módulo aceso e com conteúdo; a página
 * não pede nada ao Engine quando eles estão apagados.
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

/*
 * Os departamentos na home (protótipo: "A casa tem muitos caminhos"): um
 * cartão com foto por departamento, na ordem do painel. Vêm do Engine com o
 * módulo Produtos aceso; sem ele (ou com o Engine fora), os cinco balcões da
 * loja, sem link.
 */
function Departamentos({ departamentos }) {
  const cartoes = departamentos.length
    ? departamentos.map((d) => ({ chave: d.slug, nome: d.name, href: `/produtos/${d.slug}`, foto: <FotoDoDepartamento departamento={d} sizes="(max-width: 760px) 50vw, 16vw" /> }))
    : setores.map((s) => ({ chave: s.id, nome: s.nome, href: null, foto: <img src={s.foto} alt="" loading="lazy" decoding="async" /> }));
  return (
    <section className="home-departamentos" aria-labelledby="nossos-produtos">
      <div className="wrap">
        <Reveal className="home-cabeca">
          <div>
            <p className="eyebrow">Nossos produtos</p>
            <h2 id="nossos-produtos">
              A casa tem muitos <em>caminhos.</em>
            </h2>
          </div>
          <p className="home-cabeca__nota">Para preparar um jantar especial ou encontrar um ingrediente que não se vê por aí.</p>
        </Reveal>
        <Reveal delay={80}>
          <div className="home-departamentos__grade" style={{ '--n': cartoes.length }}>
          {cartoes.map((c, i) => {
            const miolo = (
              <>
                <span className="departamento-cartao__foto">{c.foto}</span>
                <span className="departamento-cartao__numero">{String(i + 1).padStart(2, '0')}</span>
                <h3>{c.nome}</h3>
                {c.href && (
                  <i aria-hidden="true">
                    <Arrow />
                  </i>
                )}
              </>
            );
            return c.href ? (
              <Link key={c.chave} href={c.href} className="departamento-cartao">
                {miolo}
              </Link>
            ) : (
              <div key={c.chave} className="departamento-cartao">
                {miolo}
              </div>
            );
          })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * A home no desenho do protótipo do e-commerce (pedido do cliente, 19/11/2026):
 * a abertura do site no ar (validada com o header 1+), os departamentos, a
 * seleção da semana, a tábua de frios, o Blog e "A loja" em fundo escuro, com
 * o texto e as fotos de "A casa". Destaques e Blog só aparecem com o módulo
 * aceso e com conteúdo.
 *
 * @param {{
 *   departamentos?: import('../engine/sdk-0.8.0/index.js').PublicProductCategoryData[],
 *   destaques?: import('../engine/sdk-0.8.0/index.js').PublicProductCardData[],
 *   recentes?: import('../engine/sdk-0.8.0/index.js').BlogCardData[],
 * }} props
 */
export default function Home({ departamentos = [], destaques = [], recentes = [] }) {
  return (
    <>
      <Hero />
      <Departamentos departamentos={departamentos} />
      {destaques.length > 0 && (
        <section className="home-selecao" aria-labelledby="selecao-da-semana">
          <div className="wrap">
            <Reveal className="home-cabeca">
              <div>
                <p className="eyebrow">Seleção da semana</p>
                <h2 id="selecao-da-semana">
                  O que a casa
                  <br />
                  <em>recomenda.</em>
                </h2>
              </div>
              <Link className="link" href="/produtos">
                Ver a seleção <Arrow />
              </Link>
            </Reveal>
            <div className="grade-de-produtos grade-de-produtos--quatro">
              {destaques.map((produto) => (
                <CartaoDeProduto key={produto.id} produto={produto} />
              ))}
            </div>
            <Link className="link home-selecao__todos" href="/produtos">
              Ver todos os produtos <Arrow />
            </Link>
          </div>
        </section>
      )}
      {conteudoAConfirmar.tabuaDeFrios && <TabuaDeFrios />}
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
      {/* "A loja" do protótipo, com o texto e as fotos de "A casa" do site no ar. */}
      <section id="a-casa" className="home-loja" aria-labelledby="a-loja">
        <div className="wrap home-loja__grade">
          <Reveal className="home-loja__fotos">
            <CasaFotos />
          </Reveal>
          <Reveal className="home-loja__texto" delay={90}>
            <p className="eyebrow">A loja</p>
            <h2 id="a-loja">
              Para nós, a boa
              <br />
              gastronomia começa
              <br />
              <em>pelo ingrediente.</em>
            </h2>
            <p>
              A Nicolini foi criada para quem aprecia a boa cozinha e busca pelos melhores ingredientes. Nossa seleção reúne
              produtos renomados dos quatro cantos do mundo, cada um com uma história única e o melhor padrão de qualidade.
            </p>
            <p className="home-loja__endereco">
              Visite-nos em Caxias do Sul
              <br />
              <span>
                {casa.endereco.linha1}, {casa.endereco.bairro}
              </span>
              {casa.horarios.map((h) => (
                <span key={h.dia}>
                  <br />
                  {h.dia}: {h.hora.toLowerCase()}
                </span>
              ))}
            </p>
            <div className="acoes">
              <Link className="link" href="/a-loja">
                Conhecer a loja <Arrow />
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
