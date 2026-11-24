'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Arrow, Chevron } from '../components/Icons';
import type { AberturaDaHome } from '../engine/fonte';
import { Foto } from './Foto';

/*
 * A abertura da home (Engine D-152): a de sempre (o vídeo) e as fotos que a
 * casa escolhe no painel, uma de cada vez, na ordem de lá. Com uma só, é a
 * abertura de antes, sem nada a mais. Com mais de uma, só duas coisas novas:
 * chevrons soltos nas laterais (sem fundo; somem no toque, onde se passa com o
 * dedo) e bolinhas embaixo, como no Instagram.
 *
 * Passa sozinha a cada TEMPO_MS, com troca suave; para enquanto o mouse está
 * sobre ela, com o foco dentro, com a aba escondida ou depois que a pessoa
 * passa à mão, e não passa sozinha com movimento reduzido.
 */
const TEMPO_MS = 7000;

type Props = { aberturas: AberturaDaHome[]; ctaPadrao: boolean };

function Botao({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith('/'))
    return (
      <Link className="botao botao--claro" href={href}>
        {children} <Arrow />
      </Link>
    );
  return (
    <a className="botao botao--claro" href={href} target="_blank" rel="noreferrer">
      {children} <Arrow direction="upRight" />
    </a>
  );
}

/* O título: `h1` na primeira (a página tem um só), `h2` com a mesma cara nas outras. */
function Titulo({ primeira, children }: { primeira: boolean; children: ReactNode }) {
  return primeira ? (
    <h1 className="hero__titulo hero__reveal" style={{ '--d': '150ms' } as React.CSSProperties}>{children}</h1>
  ) : (
    <h2 className="hero__titulo hero__reveal" style={{ '--d': '150ms' } as React.CSSProperties}>{children}</h2>
  );
}

function Padrao({ primeira, ctaPadrao }: { primeira: boolean; ctaPadrao: boolean }) {
  return (
    <>
      <div className="hero__media">
        <video autoPlay muted loop playsInline poster="/media/hero-fatiando-presunto-poster.jpg" preload={primeira ? 'auto' : 'metadata'}>
          <source src="/media/hero-fatiando-presunto.webm" type="video/webm" />
          <source src="/media/hero-fatiando-presunto.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero__scrim" />
      <div className="hero__inner">
        <Titulo primeira={primeira}>
          O melhor da
          <br />
          <em>alta gastronomia.</em>
        </Titulo>
        <p className="hero__sub hero__reveal" style={{ '--d': '270ms' } as React.CSSProperties}>
          A seleção de ingredientes da Nicolini é curada a dedo, com produtos de todo o mundo.
        </p>
        {ctaPadrao && (
          <div className="hero__cta hero__reveal" style={{ '--d': '360ms' } as React.CSSProperties}>
            <Botao href="/produtos">Explorar a seleção</Botao>
          </div>
        )}
      </div>
    </>
  );
}

function FotoDaCasa({ abertura, primeira }: { abertura: Extract<AberturaDaHome, { kind: 'photo' }>; primeira: boolean }) {
  return (
    <>
      <div className="hero__media">
        <Foto foto={abertura.photo} sizes="100vw" prioridade={primeira} />
      </div>
      <div className="hero__scrim" />
      <div className="hero__inner">
        {abertura.eyebrow && (
          <p className="eyebrow hero__eyebrow hero__reveal" style={{ '--d': '80ms' } as React.CSSProperties}>
            {abertura.eyebrow}
          </p>
        )}
        <Titulo primeira={primeira}>
          {abertura.title}
          {abertura.titleEmphasis && (
            <>
              <br />
              <em>{abertura.titleEmphasis}</em>
            </>
          )}
        </Titulo>
        {abertura.subtitle && (
          <p className="hero__sub hero__reveal" style={{ '--d': '270ms' } as React.CSSProperties}>
            {abertura.subtitle}
          </p>
        )}
        {abertura.cta && (
          <div className="hero__cta hero__reveal" style={{ '--d': '360ms' } as React.CSSProperties}>
            <Botao href={abertura.cta.href}>{abertura.cta.label}</Botao>
          </div>
        )}
      </div>
    </>
  );
}

export function Abertura({ aberturas, ctaPadrao }: Props) {
  const total = aberturas.length;
  const [atual, setAtual] = useState(0);
  const [parada, setParada] = useState(false);
  const [tocada, setTocada] = useState(false);
  const raiz = useRef<HTMLElement>(null);
  const toque = useRef<{ x: number; y: number } | null>(null);

  const ir = useCallback((indice: number, aMao = true) => {
    setAtual(((indice % total) + total) % total);
    if (aMao) setTocada(true);
  }, [total]);

  /* Passa sozinha: nunca com movimento reduzido, com a aba escondida, parada ou depois da mão. */
  useEffect(() => {
    if (total < 2 || parada || tocada) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') setAtual((i) => (i + 1) % total);
    }, TEMPO_MS);
    return () => window.clearInterval(id);
  }, [total, parada, tocada]);

  /* O vídeo só roda quando a abertura dele está na tela. */
  useEffect(() => {
    raiz.current?.querySelectorAll<HTMLElement>('.hero__slide').forEach((slide, i) => {
      const video = slide.querySelector('video');
      if (!video) return;
      if (i === atual) void video.play().catch(() => {});
      else video.pause();
    });
  }, [atual]);

  const teclas = (evento: KeyboardEvent) => {
    if (evento.key === 'ArrowRight') ir(atual + 1);
    else if (evento.key === 'ArrowLeft') ir(atual - 1);
  };

  const varias = total > 1;
  return (
    <section
      ref={raiz}
      className={`hero hero--casa hero--carrossel${varias ? ' tem-varias' : ''}`}
      aria-roledescription={varias ? 'carrossel' : undefined}
      aria-label={varias ? 'Destaques da casa' : undefined}
      onMouseEnter={() => setParada(true)}
      onMouseLeave={() => setParada(false)}
      onFocus={() => setParada(true)}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) setParada(false);
      }}
      onKeyDown={varias ? teclas : undefined}
      onTouchStart={(evento) => {
        const t = evento.touches[0];
        toque.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(evento) => {
        const inicio = toque.current;
        toque.current = null;
        if (!inicio || !varias) return;
        const t = evento.changedTouches[0];
        const dx = t.clientX - inicio.x;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(t.clientY - inicio.y) * 1.4) ir(atual + (dx < 0 ? 1 : -1));
      }}
    >
      {aberturas.map((abertura, i) => {
        const ativa = i === atual;
        return (
          <div
            key={abertura.kind === 'photo' ? abertura.id : 'padrao'}
            className={`hero__slide${ativa ? ' is-ativa' : ''}`}
            role={varias ? 'group' : undefined}
            aria-roledescription={varias ? 'slide' : undefined}
            aria-label={varias ? `${i + 1} de ${total}` : undefined}
            aria-hidden={ativa ? undefined : true}
            inert={!ativa}
          >
            {abertura.kind === 'photo' ? <FotoDaCasa abertura={abertura} primeira={i === 0} /> : <Padrao primeira={i === 0} ctaPadrao={ctaPadrao} />}
          </div>
        );
      })}

      {varias && (
        <>
          <button type="button" className="hero__seta hero__seta--anterior" aria-label="Anterior" onClick={() => ir(atual - 1)}>
            <Chevron direction="left" />
          </button>
          <button type="button" className="hero__seta hero__seta--proxima" aria-label="Próxima" onClick={() => ir(atual + 1)}>
            <Chevron />
          </button>
          <div className="hero__pontos">
            {aberturas.map((abertura, i) => (
              <button
                key={abertura.kind === 'photo' ? abertura.id : 'padrao'}
                type="button"
                className={`hero__ponto${i === atual ? ' is-ativo' : ''}`}
                aria-label={`Ir para ${i + 1} de ${total}`}
                aria-current={i === atual ? 'true' : undefined}
                onClick={() => ir(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
