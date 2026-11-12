import Link from 'next/link';
import type { BlogCardData, BlogCategoryData, BlogPostData } from '../engine/sdk-0.7.0/index.js';
import { dataPorExtenso, periodo } from '../engine/formato';
import { casa } from '../data/casa';
import { siteUrl } from '../site';
import { Arrow } from '../components/Icons';
import { Reveal } from '../components/Reveal';
import { Blocos } from '../ui/Blocos';
import { DadosEstruturados } from '../ui/DadosEstruturados';
import { CartaoDeEvento, CartaoDeMateria } from '../ui/CartaoDeMateria';
import { Foto } from '../ui/Foto';
import { Migalhas } from '../ui/Migalhas';
import { MaisMaterias } from '../ui/VerMais';
import { VideoDoYoutube } from '../ui/VideoDoYoutube';

/*
 * Blog, matéria e eventos: a lista e a matéria do e-commerce, com a redação do
 * site no ar. Evento é uma matéria de tipo `event` (SPEC D3) e tem a página
 * "no estilo do blog".
 */

function NavDeCategorias({ categorias, atual }: { categorias: BlogCategoryData[]; atual?: string }) {
  return (
    <nav className="categorias-atalho categorias-atalho--blog" aria-label="Categorias do blog">
      <ul className="wrap">
        <li>
          <Link href="/blog" aria-current={!atual ? 'page' : undefined}>
            Todas
          </Link>
        </li>
        {categorias.map((c) => (
          <li key={c.slug}>
            <Link href={`/blog/categoria/${c.slug}`} aria-current={c.slug === atual ? 'page' : undefined}>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SemMaterias({ categoria }: { categoria?: string }) {
  return (
    <div className="vazio">
      <span className="vazio__marca" aria-hidden="true">
        N
      </span>
      <h2>
        {categoria ? 'Nenhuma matéria' : 'O blog ainda'}
        <br />
        {categoria ? <em>nesta categoria.</em> : <em>está em preparo.</em>}
      </h2>
      <p>
        {categoria
          ? `Ainda não publicamos em ${categoria}. As outras histórias da casa continuam no blog.`
          : 'As primeiras histórias da casa chegam em breve. Enquanto isso, a loja e o bistrô continuam abertos.'}
      </p>
      <div className="acoes">
        <Link className="botao botao--escuro" href={categoria ? '/blog' : '/'}>
          {categoria ? 'Ver todas as matérias' : 'Voltar ao início'} <Arrow />
        </Link>
      </div>
    </div>
  );
}

export function PaginaDoBlog({
  categorias,
  itens,
  cursor,
  limite,
  categoria,
}: {
  categorias: BlogCategoryData[];
  itens: BlogCardData[];
  cursor: string | null;
  limite: number;
  categoria?: BlogCategoryData;
}) {
  const [primeira, ...resto] = itens;
  return (
    <>
      <section className="topo-de-pagina topo-de-pagina--suave">
        <div className="wrap">
          <Migalhas itens={categoria ? [{ rotulo: 'Blog', href: '/blog' }, { rotulo: categoria.name }] : [{ rotulo: 'Início', href: '/' }, { rotulo: 'Blog' }]} />
          <Reveal className="topo-de-pagina__texto">
            <p className="eyebrow">{categoria ? 'Blog Nicolini' : 'Blog Nicolini'}</p>
            {categoria ? (
              <h1>
                {categoria.name.split(' ').slice(0, -1).join(' ')} <em>{categoria.name.split(' ').at(-1)}.</em>
              </h1>
            ) : (
              <h1>
                Você cozinha,
                <br />
                com mais <em>repertório.</em>
              </h1>
            )}
            <p>
              {categoria
                ? `${categoria.count} ${categoria.count === 1 ? 'matéria' : 'matérias'} em ${categoria.name}.`
                : 'Histórias de origem, ideias para cozinhar, produtos que merecem contexto e conversas que continuam depois da sobremesa.'}
            </p>
          </Reveal>
        </div>
      </section>

      {categorias.length > 0 && <NavDeCategorias categorias={categorias} atual={categoria?.slug} />}

      <section className="lista-do-blog wrap">
        {primeira ? (
          <>
            <CartaoDeMateria materia={primeira} destaque />
            <div className="grade-de-materias">
              {resto.map((m) => (
                <CartaoDeMateria key={m.id} materia={m} />
              ))}
              <MaisMaterias kind="article" categoria={categoria?.slug} cursor={cursor} limite={limite} />
            </div>
          </>
        ) : (
          <SemMaterias categoria={categoria?.name} />
        )}
      </section>
    </>
  );
}

/* A capa da matéria: foto, ou o vídeo (imagem com o botão, player no clique). */
function Capa({ materia }: { materia: BlogPostData }) {
  const capa = materia.cover;
  if (!capa) return null;
  return (
    <div className="materia__capa wrap">
      {capa.type === 'photo' ? (
        <Foto foto={capa.photo} sizes="(max-width: 760px) 100vw, 1360px" prioridade />
      ) : (
        <VideoDoYoutube videoId={capa.videoId} titulo={materia.title} foto={capa.photo} sizes="(max-width: 760px) 100vw, 1360px" prioridade />
      )}
    </div>
  );
}

function Compartilhar({ caminho, titulo }: { caminho: string; titulo: string }) {
  const texto = `${titulo} ${siteUrl}${caminho}`;
  return (
    <p className="materia__compartilhar">
      <a className="link" href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noreferrer">
        Mandar para alguém pelo WhatsApp <Arrow direction="upRight" />
      </a>
    </p>
  );
}

export function PaginaDaMateria({ materia, outras }: { materia: BlogPostData; outras: BlogCardData[] }) {
  const caminho = `/blog/${materia.slug}`;
  return (
    <>
      <DadosEstruturados materia={materia} />
      <article className="materia-pagina">
        <header className="materia__cabeca wrap">
          <Migalhas
            itens={[{ rotulo: 'Blog', href: '/blog' }, ...(materia.category ? [{ rotulo: materia.category.name, href: `/blog/categoria/${materia.category.slug}` }] : [])]}
          />
          <p className="eyebrow">{materia.category?.name ?? 'Blog Nicolini'}</p>
          <h1>{materia.title}</h1>
          <p className="materia__linha-fina">{materia.excerpt}</p>
          <p className="materia__meta">
            <time dateTime={materia.date}>{dataPorExtenso(materia.date)}</time> · {materia.readingMinutes} min de leitura
          </p>
        </header>
        <Capa materia={materia} />
        <div className="materia__corpo">
          <Blocos blocos={materia.blocks} />
          <Compartilhar caminho={caminho} titulo={materia.title} />
        </div>
      </article>

      {outras.length > 0 && (
        <section className="section relacionados" aria-labelledby="continue-lendo">
          <div className="wrap">
            <div className="cabeca-de-secao">
              <div>
                <p className="eyebrow">Continue lendo</p>
                <h2 id="continue-lendo">
                  Mais histórias
                  <br />
                  <em>da casa.</em>
                </h2>
              </div>
              <Link className="link" href="/blog">
                Ver todas as matérias <Arrow />
              </Link>
            </div>
            <div className="grade-de-materias">
              {outras.map((m) => (
                <CartaoDeMateria key={m.id} materia={m} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export function PaginaDeEventos({
  proximos,
  realizados,
  cursorRealizados,
  limite,
}: {
  proximos: BlogCardData[];
  realizados: BlogCardData[];
  cursorRealizados: string | null;
  limite: number;
}) {
  return (
    <>
      <section className="topo-de-pagina topo-de-pagina--suave">
        <div className="wrap">
          <Migalhas itens={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Eventos' }]} />
          <Reveal className="topo-de-pagina__texto">
            <p className="eyebrow">Eventos Nicolini</p>
            <h1>
              Encontros em volta
              <br />
              da <em>mesa.</em>
            </h1>
            <p>Jantares, degustações e visitas de produtores, no empório e no bistrô.</p>
          </Reveal>
        </div>
      </section>

      <section className="eventos wrap" aria-labelledby="proximos">
        <h2 className="eventos__titulo" id="proximos">
          Próximos
        </h2>
        {proximos.length ? (
          <div className="grade-de-eventos">
            {proximos.map((e) => (
              <CartaoDeEvento key={e.id} evento={e} />
            ))}
          </div>
        ) : (
          <div className="eventos__vazio">
            <p>Nenhum evento marcado agora. O próximo é anunciado aqui e no Instagram da casa.</p>
            <a className="link" href={`https://instagram.com/${casa.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
              {casa.instagram} <Arrow direction="upRight" />
            </a>
          </div>
        )}
      </section>

      <section className="eventos wrap" aria-labelledby="realizados">
        <h2 className="eventos__titulo" id="realizados">
          Realizados
        </h2>
        {realizados.length ? (
          <div className="grade-de-eventos grade-de-eventos--passados">
            {realizados.map((e) => (
              <CartaoDeEvento key={e.id} evento={e} passado />
            ))}
            <MaisMaterias kind="event" quando="past" cursor={cursorRealizados} limite={limite} />
          </div>
        ) : (
          <div className="eventos__vazio">
            <p>Os eventos que acontecerem ficam guardados aqui.</p>
          </div>
        )}
      </section>
    </>
  );
}

export function PaginaDoEvento({ evento, passado, outros }: { evento: BlogPostData; passado: boolean; outros: BlogCardData[] }) {
  const quando = evento.event!;
  const conversa = `https://wa.me/${casa.whatsapp.link}?text=${encodeURIComponent(`Olá! Quero saber do evento ${evento.title}.`)}`;
  return (
    <>
      <DadosEstruturados materia={evento} />
      <article className="materia-pagina">
        <header className="materia__cabeca wrap">
          <Migalhas itens={[{ rotulo: 'Eventos', href: '/eventos' }, { rotulo: evento.title }]} />
          <p className="eyebrow">{passado ? 'Evento realizado' : 'Próximo evento'}</p>
          <h1>{evento.title}</h1>
          <p className="materia__linha-fina">{evento.excerpt}</p>
          <dl className="evento__ficha">
            <div>
              <dt>Quando</dt>
              <dd>{periodo(quando.startsOn, quando.endsOn)}</dd>
            </div>
            <div>
              <dt>Onde</dt>
              <dd>{quando.place}</dd>
            </div>
          </dl>
          {!passado && (
            <div className="acoes evento__acoes">
              <a className="botao botao--escuro" href={conversa} target="_blank" rel="noreferrer">
                Falar com a casa <Arrow direction="upRight" />
              </a>
            </div>
          )}
        </header>
        <Capa materia={evento} />
        <div className="materia__corpo">
          <Blocos blocos={evento.blocks} />
          <Compartilhar caminho={`/eventos/${evento.slug}`} titulo={evento.title} />
        </div>
      </article>

      {outros.length > 0 && (
        <section className="section relacionados" aria-labelledby="outros-eventos">
          <div className="wrap">
            <div className="cabeca-de-secao">
              <div>
                <p className="eyebrow">Na agenda</p>
                <h2 id="outros-eventos">
                  Outros
                  <br />
                  <em>encontros.</em>
                </h2>
              </div>
              <Link className="link" href="/eventos">
                Todos os eventos <Arrow />
              </Link>
            </div>
            <div className="grade-de-eventos">
              {outros.map((e) => (
                <CartaoDeEvento key={e.id} evento={e} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
