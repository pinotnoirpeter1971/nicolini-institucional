'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { casa } from '../data/casa';
import {
  CATEGORIAS_NA_LINHA,
  areaDoEndereco,
  casaDaArea,
  casaDoSite,
  faixa,
  itensAcesos,
  lojaFisica,
  modulos,
  navegacaoDaArea,
  paginasComAbertura,
  pecasDeLoja,
  todosOsProdutos,
  type ItemDoMenu,
} from '../menu-do-site';
import { abrirPainel, useSacola } from '../sacola/armazem';
import { Busca, Fechar, Menu, Pin, Sacola } from '../components/Icons';
import { CampoDeBusca, FaixaDeAnuncio, IconeConta, IconeCurtidos } from './Guardadas';
import { useAbertura } from './abertura';

/*
 * O header (desenho do protótipo do e-commerce, decisão de Pedro de 12/11/2026,
 * com o comportamento "1+" de 19/11/2026; protótipo em Site Nicolini/mockups/header).
 *
 * Duas linhas, brancas, presas no topo. Em cima: logo, busca, "Visite-nos ↗"
 * (no lugar do CEP, que a casa não vai ter), conta e curtidos travados, sacola.
 * Embaixo, a linha é de quem está na página (src/menu-do-site.ts): à esquerda,
 * Departamentos e as categorias (do Engine) ou a navegação do Bistrô e das
 * landings de evento; à direita, na cor da área, a casa toda (Empório · Bistrô
 * · Eventos · Blog), com a parte atual sublinhada.
 *
 * Nas páginas que abrem com foto ou vídeo inteiro (`paginasComAbertura`), o
 * header começa curto e sem fundo sobre a abertura: logo, a casa, lupa e
 * sacola. Ao rolar nada some do lugar: a lupa vira a barra de busca, a casa
 * desce para a ponta direita da linha de baixo e fica na cor da área, os ícones
 * entram ao lado da sacola e os setores surgem embaixo. A lupa clicada no topo
 * abre o header ali mesmo, com o cursor na busca. Sem animação para quem pede
 * menos movimento no sistema. No celular: menu, logo e sacola, a busca
 * embaixo, e o menu escuro com o bloco da área primeiro.
 */

const EASE = 'cubic-bezier(.22, 1, .36, 1)';
const ICONE_NA_BARRA = 25; /* centro do ícone dentro da barra de busca (16 de recuo + 9) */

type Medida = { rect: DOMRect; recuo: number };

const medir = (els: Iterable<HTMLElement>) =>
  new Map([...els].map((el) => [el.getAttribute('href') ?? '', { rect: el.getBoundingClientRect(), recuo: parseFloat(getComputedStyle(el).paddingLeft) || 0 }]));

/* A barra parte do lugar da lupa recortada num círculo, sem fundo, e abre até o tamanho e a cor de sempre. */
function quadrosDaBusca(lupa: DOMRect, barra: DOMRect, raio: string, tinta: string): [Keyframe, Keyframe] {
  return [
    {
      transform: `translate(${lupa.left + lupa.width / 2 - (barra.left + ICONE_NA_BARRA)}px, ${lupa.top + lupa.height / 2 - (barra.top + barra.height / 2)}px)`,
      clipPath: `inset(0px ${Math.max(0, barra.width - barra.height)}px 0px 0px round ${barra.height / 2}px)`,
      backgroundColor: 'rgba(238, 236, 232, 0)',
      color: '#ffffff',
    },
    { transform: 'translate(0px, 0px)', clipPath: `inset(0px 0px 0px 0px round ${raio})`, backgroundColor: '#eeece8', color: tinta },
  ];
}

function ContadorDaSacola() {
  const linhas = useSacola();
  const n = linhas.length;
  return (
    <button type="button" className="cabecalho__sacola" onClick={abrirPainel} aria-label={n ? `Abrir a sacola, ${n} ${n === 1 ? 'item' : 'itens'}` : 'Abrir a sacola, vazia'}>
      <Sacola />
      {n > 0 && (
        <span className="cabecalho__contagem" aria-hidden="true">
          {n}
        </span>
      )}
    </button>
  );
}

export function Cabecalho({ categorias, comBlog }: { categorias: ItemDoMenu[]; comBlog: boolean }) {
  const pathname = (usePathname() ?? '/').toLowerCase();
  const [rolado, setRolado] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [deptos, setDeptos] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [faixaVisivel, setFaixaVisivel] = useState(false);
  const [faixaFechada, setFaixaFechada] = useState(false);
  const refHeader = useRef<HTMLElement>(null);
  const refDeptos = useRef<HTMLDivElement>(null);
  const antes = useRef<{ lupa?: DOMRect; casa?: Map<string, Medida> }>({});
  const animacoes = useRef<Animation[]>([]);
  const focarBusca = useRef(false);

  const naLinha = categorias.slice(0, CATEGORIAS_NA_LINHA);
  const ativo = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const travada = (peca: keyof typeof pecasDeLoja) => pecasDeLoja[peca] === 'travada';
  const ativa = (peca: keyof typeof pecasDeLoja) => pecasDeLoja[peca] === 'ativa';
  const departamentos = todosOsProdutos.aceso && categorias.length > 0;
  const temBusca = ativa('busca') || travada('busca');

  const area = areaDoEndereco(pathname);
  const daArea = navegacaoDaArea[area];
  const aqui = casaDaArea[area];
  /* O Blog só entra com ele ligado no Engine (Moldura.tsx): desligado, /blog é 404. */
  const casaAcesa = itensAcesos(casaDoSite).filter((item) => comBlog || item.href !== '/blog');
  const abertura = paginasComAbertura.includes(pathname);

  const parar = () => {
    animacoes.current.forEach((a) => a.cancel());
    animacoes.current = [];
  };

  /* Com o header ainda no estado antigo: de onde sai cada peça que vai se mover. */
  const antesDeMudar = useCallback((paraTopo: boolean) => {
    const h = refHeader.current;
    if (!h) return;
    parar();
    antes.current = paraTopo
      ? { casa: medir(h.querySelectorAll<HTMLElement>('.cabecalho__casa')) }
      : { lupa: h.querySelector('.cabecalho__lupa')?.getBoundingClientRect(), casa: medir(h.querySelectorAll<HTMLElement>('.cabecalho__casa-topo a')) };
  }, []);

  const { topo: topoDaRolagem, animar, abrirPelaLupa, soltar } = useAbertura(abertura, antesDeMudar);
  const topo = abertura && topoDaRolagem;

  /* As transições só valem depois da primeira pintura (nada anima ao carregar). */
  useEffect(() => {
    const quadro = window.requestAnimationFrame(() => setPronto(true));
    return () => window.cancelAnimationFrame(quadro);
  }, []);

  /* A troca de estado: a lupa vira a barra (e volta) e a casa desce para a linha de baixo (e sobe). */
  useLayoutEffect(() => {
    const h = refHeader.current;
    const busca = h?.querySelector<HTMLElement>('.cabecalho__busca');
    if (!h || !animar.current) {
      antes.current = {};
      return;
    }
    animar.current = false;
    const deAntes = antes.current;
    antes.current = {};
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!semMovimento) {
      const estilo = getComputedStyle(h);
      const tinta = estilo.getPropertyValue('--ink').trim() || '#161514';
      const marca = estilo.getPropertyValue('--marca').trim();
      const lupa = h.querySelector<HTMLElement>('.cabecalho__lupa');
      const lista: Animation[] = [];
      const pontoDaLupa = topo ? lupa?.getBoundingClientRect() : deAntes.lupa;
      if (busca && lupa && pontoDaLupa) {
        const [fechado, aberto] = quadrosDaBusca(pontoDaLupa, busca.getBoundingClientRect(), getComputedStyle(busca).borderTopLeftRadius, tinta);
        if (topo) {
          const visivel = { visibility: 'visible', opacity: 1 };
          lista.push(busca.animate([{ ...aberto, ...visivel }, { ...fechado, ...visivel }], { duration: 360, easing: EASE }));
          lista.push(lupa.animate([{ opacity: 0 }, { opacity: 0, offset: 0.8 }, { opacity: 1 }], { duration: 360 }));
        } else {
          lista.push(busca.animate([fechado, aberto], { duration: 480, easing: EASE }));
        }
      }
      if (deAntes.casa && window.matchMedia('(min-width: 761px)').matches) {
        const destinos = [...h.querySelectorAll<HTMLElement>(topo ? '.cabecalho__casa-topo a' : '.cabecalho__casa')];
        destinos.forEach((el, i) => {
          const origem = deAntes.casa?.get(el.getAttribute('href') ?? '');
          if (!origem) return;
          const r = el.getBoundingClientRect();
          const dx = origem.rect.left + origem.recuo - (r.left + (parseFloat(getComputedStyle(el).paddingLeft) || 0));
          const dy = origem.rect.top + origem.rect.height / 2 - (r.top + r.height / 2);
          lista.push(
            el.animate(
              [
                { transform: `translate(${dx}px, ${dy}px)`, color: topo ? marca : '#ffffff' },
                { transform: 'translate(0px, 0px)', color: topo ? '#ffffff' : marca },
              ],
              { duration: topo ? 360 : 480, delay: i * 24, easing: EASE, fill: 'backwards' },
            ),
          );
        });
      }
      animacoes.current = lista;
    }
    if (!topo && focarBusca.current) busca?.querySelector('input')?.focus({ preventScroll: true });
    focarBusca.current = false;
  }, [topo, animar]);

  useEffect(() => () => parar(), []);

  useEffect(() => {
    setAberto(false);
    setDeptos(false);
  }, [pathname]);

  /* Departamentos aberto: Esc ou clique fora fecham. */
  useEffect(() => {
    if (!deptos) return undefined;
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && setDeptos(false);
    const fora = (e: MouseEvent) => !refDeptos.current?.contains(e.target as Node) && setDeptos(false);
    document.addEventListener('keydown', tecla);
    document.addEventListener('mousedown', fora);
    return () => {
      document.removeEventListener('keydown', tecla);
      document.removeEventListener('mousedown', fora);
    };
  }, [deptos]);

  /* Header aberto pela lupa: Esc ou um clique fora dele devolvem ao topo. */
  useEffect(() => {
    if (!abertura) return undefined;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && soltar()) (document.activeElement as HTMLElement | null)?.blur();
    };
    const fora = (e: PointerEvent) => {
      if (!refHeader.current?.contains(e.target as Node)) soltar();
    };
    document.addEventListener('keydown', tecla);
    document.addEventListener('pointerdown', fora);
    return () => {
      document.removeEventListener('keydown', tecla);
      document.removeEventListener('pointerdown', fora);
    };
  }, [abertura, soltar]);

  useEffect(() => {
    const atualizar = () => setRolado(window.scrollY > 8);
    atualizar();
    window.addEventListener('scroll', atualizar, { passive: true });
    return () => window.removeEventListener('scroll', atualizar);
  }, []);

  /* Menu do celular aberto: Esc fecha. */
  useEffect(() => {
    if (!aberto) return undefined;
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [aberto]);

  /*
   * A tarja (desligada hoje; `faixa` em src/menu-do-site.ts). Nas páginas com
   * abertura ela aparece 5 s depois de o header ficar completo ("empurra":
   * desce empurrando o header; "flutuante": embaixo, com ✕) e sai quando a
   * pessoa volta ao topo. Nas outras, o header não sai do lugar: a tarja vem
   * por cima dele, rolando com a página, ou flutuando.
   */
  const modoDaFaixa = faixa.modo === 'desligada' ? null : faixa.modo === 'empurra' && !abertura ? 'rola' : faixa.modo;
  useEffect(() => {
    if (!modoDaFaixa || modoDaFaixa === 'rola' || topo) {
      setFaixaVisivel(false);
      return undefined;
    }
    const relogio = window.setTimeout(() => setFaixaVisivel(true), 5000);
    return () => window.clearTimeout(relogio);
  }, [modoDaFaixa, topo]);

  const link = (item: { href: string; rotulo: string }, classe?: string, estilo?: CSSProperties) => (
    <Link
      key={item.href}
      href={item.href}
      className={[classe, ativo(item.href) && 'is-ativo'].filter(Boolean).join(' ') || undefined}
      aria-current={ativo(item.href) ? 'page' : undefined}
      style={estilo}
    >
      {item.rotulo}
    </Link>
  );
  const ordem = (i: number) => ({ '--i': i }) as CSSProperties;
  const daCasa = (item: ItemDoMenu, classe?: string, estilo?: CSSProperties) => (
    <Link key={item.href} href={item.href} className={[classe, aqui === item.href && 'is-ativo'].filter(Boolean).join(' ') || undefined} aria-current={aqui === item.href ? 'page' : undefined} style={estilo}>
      {item.rotulo}
    </Link>
  );
  const esquerda = daArea ? daArea.itens.length : (ativa('megaMenu') && departamentos ? 1 : 0) + naLinha.length;

  const classes = [
    'cabecalho',
    abertura && 'cabecalho--abertura',
    topo && 'is-topo',
    pronto && 'is-pronto',
    rolado && !topo && 'is-rolado',
    aberto && 'is-aberto',
    modoDaFaixa === 'empurra' && faixaVisivel && 'com-faixa',
  ];

  return (
    <>
      {modoDaFaixa && (
        <FaixaDeAnuncio modo={modoDaFaixa} visivel={modoDaFaixa === 'rola' || (faixaVisivel && !faixaFechada)} onFechar={() => setFaixaFechada(true)} />
      )}
      <header ref={refHeader} className={classes.filter(Boolean).join(' ')}>
        <div className="wrap cabecalho__linha">
          <button
            type="button"
            className="cabecalho__abrir"
            aria-label={aberto ? 'Fechar o menu' : 'Abrir o menu'}
            aria-expanded={aberto}
            aria-controls="menu-do-celular"
            onClick={() => setAberto((a) => !a)}
          >
            {aberto ? <Fechar /> : <Menu />}
          </button>

          <Link href="/" className="cabecalho__logo" aria-label="Nicolini, página inicial">
            {casa.marca}
          </Link>

          {/* A casa no topo, sobre a abertura; ao rolar, desce para a linha de baixo. */}
          {abertura && (
            <nav className="cabecalho__casa-topo" aria-label="A casa" hidden={!topo}>
              {casaAcesa.map((item) => daCasa(item))}
            </nav>
          )}

          {temBusca && <CampoDeBusca />}

          <div className="cabecalho__ferramentas">
            <a className="cabecalho__cep cabecalho__visite" href={casa.mapsBusca} target="_blank" rel="noreferrer" aria-label="Visite-nos: o Empório e o Bistrô no mapa (abre em outra aba)">
              <Pin />
              <span>
                <small>Empório e Bistrô</small>
                <b>
                  Visite-nos <i className="cabecalho__seta" aria-hidden="true">↗</i>
                </b>
              </span>
            </a>
            {travada('conta') && <IconeConta />}
            {travada('curtidos') && <IconeCurtidos />}
            {abertura && temBusca && (
              <button
                type="button"
                className="cabecalho__lupa"
                aria-label="Buscar produtos"
                tabIndex={topo ? 0 : -1}
                onClick={() => {
                  focarBusca.current = true;
                  abrirPelaLupa();
                }}
              >
                <Busca />
              </button>
            )}
            {modulos.pedidos && <ContadorDaSacola />}
          </div>
        </div>

        <nav className="cabecalho__nav" aria-label="Navegação principal">
          <div className="wrap cabecalho__nav-linha">
            {daArea ? (
              daArea.itens.map((item, i) => (
                <a key={item.href} href={item.href} className="cabecalho__da-area" style={ordem(i)}>
                  {item.rotulo}
                </a>
              ))
            ) : (
              <>
                {ativa('megaMenu') && departamentos && (
                  <div className="cabecalho__deptos" ref={refDeptos} style={ordem(0)}>
                    <button type="button" className="cabecalho__departamentos" aria-expanded={deptos} aria-controls="lista-de-departamentos" onClick={() => setDeptos((d) => !d)}>
                      <Menu /> Departamentos
                    </button>
                    <ul id="lista-de-departamentos" className="cabecalho__deptos-lista" hidden={!deptos}>
                      {[...categorias, todosOsProdutos].map((item) => (
                        <li key={item.href}>{link(item)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {naLinha.map((item, i) => link(item, 'cabecalho__categoria', ordem(i + 1)))}
              </>
            )}
            {casaAcesa.map((item, i) => daCasa(item, `cabecalho__casa${i === 0 ? ' cabecalho__casa--primeira' : ''}`, ordem(esquerda + i)))}
          </div>
        </nav>

        <nav id="menu-do-celular" className="cabecalho__gaveta" aria-label="Navegação no celular" hidden={!aberto}>
          <div className="wrap cabecalho__gaveta-lista">
            {daArea && (
              <>
                <p className="cabecalho__gaveta-titulo">{daArea.titulo}</p>
                {daArea.itens.map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setAberto(false)}>
                    {item.rotulo}
                  </a>
                ))}
              </>
            )}
            <p className={`cabecalho__gaveta-titulo${daArea ? ' cabecalho__gaveta-titulo--dept' : ''}`}>A casa</p>
            {[...casaAcesa, lojaFisica].map((item) => link(item))}
            {ativa('megaMenu') && departamentos && (
              <>
                <p className="cabecalho__gaveta-titulo cabecalho__gaveta-titulo--dept">Departamentos</p>
                {link(todosOsProdutos, 'cabecalho__gaveta-todos')}
                {categorias.map((item) => link(item))}
              </>
            )}
            {travada('curtidos') && <IconeCurtidos comRotulo />}
            {travada('conta') && <IconeConta comRotulo />}
          </div>
        </nav>
      </header>
    </>
  );
}
