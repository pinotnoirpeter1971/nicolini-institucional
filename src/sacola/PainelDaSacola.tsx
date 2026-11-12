'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { dinheiro } from '../engine/formato';
import { Arrow, Fechar } from '../components/Icons';
import { LinhaDaSacola } from './LinhaDaSacola';
import { useLinhasDaSacola } from './linhas';

export const FRASE_DO_ESTIMADO = 'Valores estimados. A loja confirma disponibilidade, peso e valor final pelo WhatsApp.';

/*
 * O painel lateral da sacola, do e-commerce. Carregado só quando abre; a cada
 * abertura relê os produtos (preço de agora). O envio acontece na página
 * /sacola, onde cabem o nome, a observação e os avisos.
 */
export default function PainelDaSacola({ aberto, fechar }: { aberto: boolean; fechar: () => void }) {
  const pathname = usePathname();
  const inicio = useRef(pathname);
  useEffect(() => {
    if (pathname !== inicio.current) fechar();
  }, [pathname, fechar]);
  if (!aberto) return null;
  return <Caixa fechar={fechar} />;
}

function Caixa({ fechar }: { fechar: () => void }) {
  const s = useLinhasDaSacola();
  const botaoFechar = useRef<HTMLButtonElement>(null);
  const caixa = useRef<HTMLElement>(null);

  useEffect(() => {
    const antes = document.activeElement as HTMLElement | null;
    caixa.current?.focus();
    document.documentElement.classList.add('sem-rolagem');
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar();
      /* O foco fica dentro do painel enquanto ele está aberto. */
      if (e.key === 'Tab' && caixa.current) {
        const focaveis = caixa.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault();
          ultimo?.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primeiro?.focus();
        }
      }
    };
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('keydown', tecla);
      document.documentElement.classList.remove('sem-rolagem');
      antes?.focus?.();
    };
  }, [fechar]);

  const n = s.linhas.length;
  return (
    <div className="painel">
      <div className="painel__fundo" onClick={fechar} aria-hidden="true" />
      <aside className="painel__caixa" role="dialog" aria-modal="true" aria-labelledby="painel-titulo" ref={caixa} tabIndex={-1}>
        <header className="painel__cabeca">
          <div>
            <p className="eyebrow">Sua seleção</p>
            <h2 id="painel-titulo">
              Sacola <span>{n ? `${n} ${n === 1 ? 'item' : 'itens'}` : ''}</span>
            </h2>
          </div>
          <button type="button" className="painel__fechar" onClick={fechar} ref={botaoFechar} aria-label="Fechar a sacola">
            <Fechar />
          </button>
        </header>

        <div className="painel__corpo">
          {s.saiuDoSite > 0 && (
            <p className="aviso aviso--suave" role="status">
              {s.saiuDoSite === 1 ? 'Um item saiu do site e foi tirado da sacola.' : `${s.saiuDoSite} itens saíram do site e foram tirados da sacola.`}
            </p>
          )}
          {s.erro && (
            <div className="aviso aviso--estado" role="alert">
              <p>Não foi possível conferir os preços agora.</p>
              <button type="button" className="link" onClick={s.tentarDeNovo}>
                Tentar de novo
              </button>
            </div>
          )}
          {n === 0 ? (
            <div className="vazio vazio--compacto">
              <span className="vazio__marca" aria-hidden="true">
                N
              </span>
              <h3>
                A sua sacola
                <br />
                ainda está <em>vazia.</em>
              </h3>
              <p>Há muitas escolhas esperando por você.</p>
              <Link className="botao botao--escuro" href="/produtos" onClick={fechar}>
                Explorar produtos <Arrow />
              </Link>
            </div>
          ) : (
            <ul className="linhas">
              {s.linhas.map((l) => (
                <LinhaDaSacola key={l.id} linha={l} />
              ))}
            </ul>
          )}
        </div>

        {n > 0 && (
          <footer className="painel__pe">
            <div className="total">
              <span>Total estimado</span>
              <strong aria-live="polite">{s.carregando ? '…' : dinheiro(s.totalCents)}</strong>
            </div>
            <p className="total__nota">{FRASE_DO_ESTIMADO}</p>
            <Link className="botao botao--marca botao--largo" href="/sacola" onClick={fechar}>
              Revisar e enviar o pedido <Arrow />
            </Link>
            <button type="button" className="link painel__continuar" onClick={fechar}>
              Continuar escolhendo
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
