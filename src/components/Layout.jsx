import { Fragment, useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { casa, navEmporio, redes, secoes } from '../data/casa';
import { Arrow, IconeRede, WhatsappGlyph } from './Icons';

function irPara(id) {
  const alvo = document.getElementById(id);
  if (!alvo) return false;
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  alvo.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' });
  window.history.replaceState(null, '', `#${id}`);
  return true;
}

function useSecaoAtiva(ativo, ids) {
  const [atual, setAtual] = useState(null);
  /* A lista chega como array novo a cada render do Header; sem serializar, o
   * efeito remontaria os listeners de scroll em todo render. */
  const chave = ids.join(',');

  useEffect(() => {
    if (!ativo) {
      setAtual(null);
      return undefined;
    }

    let frame = 0;

    const atualizar = () => {
      frame = 0;
      const marco = window.innerHeight * 0.42;
      const secaoAtual = chave
        .split(',')
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .filter((secao) => secao.getBoundingClientRect().top <= marco)
        .at(-1);

      setAtual(secaoAtual?.id ?? null);
    };

    const agendarAtualizacao = () => {
      if (!frame) frame = window.requestAnimationFrame(atualizar);
    };

    atualizar();
    window.addEventListener('scroll', agendarAtualizacao, { passive: true });
    window.addEventListener('resize', agendarAtualizacao);
    return () => {
      window.removeEventListener('scroll', agendarAtualizacao);
      window.removeEventListener('resize', agendarAtualizacao);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ativo, chave]);

  return atual;
}

/*
 * `nav` e a navegacao da pagina atual e `ancorasLocais` diz se as ancoras dessa
 * lista vivem aqui. Quando nao vivem — a pagina da loja usa a navegacao do
 * emporio — elas viram link para a home com o hash, em vez de rolagem local.
 */
function Header({ overlay = false, nav = navEmporio, ancorasLocais = false }) {
  const { pathname } = useLocation();
  const [solid, setSolid] = useState(!overlay);
  const [menuAberto, setMenuAberto] = useState(false);
  /* O logo leva para a home; estando nela, rola para o topo em vez de navegar. */
  const naHome = pathname === '/';
  const ancoras = nav.filter((item) => item.tipo === 'ancora');
  const secaoAtiva = useSecaoAtiva(
    ancorasLocais,
    ancoras.map((item) => item.id),
  );

  useEffect(() => {
    if (!overlay) {
      setSolid(true);
      return undefined;
    }

    const atualizar = () => {
      const hero = document.querySelector('[data-header-hero]');
      if (!hero) return;
      setSolid(hero.getBoundingClientRect().bottom <= 118);
    };

    atualizar();
    window.addEventListener('scroll', atualizar, { passive: true });
    window.addEventListener('resize', atualizar);
    return () => {
      window.removeEventListener('scroll', atualizar);
      window.removeEventListener('resize', atualizar);
    };
  }, [overlay, pathname]);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  const clicar = useCallback(
    (evento, id) => {
      setMenuAberto(false);
      if (!ancorasLocais) return;
      evento.preventDefault();
      irPara(id);
    },
    [ancorasLocais],
  );

  return (
    <header
      className={`header ${solid ? 'is-solid' : ''} ${menuAberto ? 'is-menu-open' : ''}`}
    >
      <div className="header__inner">
        <Link
          to="/"
          className="logo"
          onClick={(evento) => naHome && clicar(evento, 'topo')}
        >
          {casa.marca}
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label={menuAberto ? 'Fechar navegação' : 'Abrir navegação'}
          aria-expanded={menuAberto}
          aria-controls="navegacao-principal"
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          <span />
          <span />
        </button>

        <nav
          id="navegacao-principal"
          className={`nav ${menuAberto ? 'is-open' : ''}`}
          aria-label="Navegação principal"
        >
          {nav.map((item, indice) => {
            /* O fio entra antes da primeira rota: a esquerda dele e a pagina
             * em que voce esta, a direita e a casa vizinha. */
            const abreAsRotas =
              item.tipo === 'rota' && nav.findIndex((n) => n.tipo === 'rota') === indice;

            if (item.tipo === 'rota') {
              return (
                <Fragment key={item.to}>
                  {abreAsRotas && <span className="nav__fio" aria-hidden="true" />}
                  <Link
                    to={item.to}
                    className={pathname === item.to ? 'is-active' : undefined}
                    aria-current={pathname === item.to ? 'page' : undefined}
                    onClick={() => setMenuAberto(false)}
                  >
                    {item.rotulo}
                  </Link>
                </Fragment>
              );
            }

            return ancorasLocais ? (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(evento) => clicar(evento, item.id)}
                className={secaoAtiva === item.id ? 'is-active' : undefined}
                aria-current={secaoAtiva === item.id ? 'true' : undefined}
              >
                {item.rotulo}
              </a>
            ) : (
              <Link key={item.id} to={`/#${item.id}`} onClick={() => setMenuAberto(false)}>
                {item.rotulo}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function Redes({ comRotulo = false }) {
  return (
    <ul className={`redes ${comRotulo ? 'redes--rotulo' : ''}`}>
      {redes.map((rede) => (
        <li key={rede.id}>
          <a href={rede.href} target="_blank" rel="noreferrer" aria-label={rede.rotulo}>
            <IconeRede nome={rede.icone} />
            {comRotulo && <span>{rede.exibicao}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Footer() {
  const { endereco } = casa;
  const { pathname } = useLocation();
  const naHome = pathname === '/';

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__brand">
            <p className="footer__mark">{casa.marca}</p>
            <p>{casa.descricao}.</p>
          </div>

          <div className="footer__address">
            <p className="eyebrow">Endereço</p>
            <address>
              {endereco.linha1}
              <br />
              {endereco.bairro} · {endereco.cidade} · {endereco.estado}
              <br />
              CEP {endereco.cep}
            </address>
          </div>

          <div className="footer__nav">
            <p className="eyebrow">Navegar</p>
            {secoes.map((secao) =>
              naHome ? (
                <a
                  key={secao.id}
                  href={`#${secao.id}`}
                  onClick={(evento) => {
                    evento.preventDefault();
                    irPara(secao.id);
                  }}
                >
                  {secao.rotulo}
                </a>
              ) : (
                <Link key={secao.id} to={`/#${secao.id}`}>
                  {secao.rotulo}
                </Link>
              ),
            )}
            <Link to="/a-loja">A loja física</Link>
            <Link to="/bistro">Bistrô Nicolini</Link>
            {/* Temporario: sai do rodape depois de outubro de 2026. */}
            <Link to="/rustichella">Jantar Rustichella</Link>
          </div>
        </div>

        <div className="footer__legal">
          <p>
            {casa.razaoSocial} · CNPJ {casa.cnpj}
          </p>
          <p>
            Endereço, contato e CNPJ obtidos de registros públicos.
          </p>
        </div>
      </div>
    </footer>
  );
}

/*
 * FAB de WhatsApp — vive em toda a casa, no canto inferior esquerdo. O fundo
 * aponta para `--marca`, entao ele nasce vermelho no emporio e no marrom quente
 * do bistro sem saber em que pagina esta; no hover vai para o verde do WhatsApp.
 * O href e um `wa.me` sem numero, de propósito — o numero entra quando houver
 * um canal de WhatsApp confirmado para o atendimento.
 */
function WhatsappFab() {
  return (
    <a
      className="whatsapp-fab"
      href="https://wa.me/"
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
    >
      <WhatsappGlyph />
    </a>
  );
}

/*
 * `tema` troca a familia de cor da pagina inteira — header e rodape inclusos,
 * por isso a classe fica em volta dos tres e nao so do `main`. O resto do
 * sistema (tipografia, grade, componentes) nao muda: ver `.tema--bistro`.
 */
export function Layout({ overlay = false, tema, nav, ancorasLocais = false, children }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const alvo = document.querySelector(hash);
      if (alvo) {
        alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);

  return (
    <div className={tema ? `tema tema--${tema}` : undefined}>
      <Header overlay={overlay} nav={nav} ancorasLocais={ancorasLocais} />
      <main id="topo">{children}</main>
      <Footer />
      <WhatsappFab />
    </div>
  );
}

export { Arrow };
