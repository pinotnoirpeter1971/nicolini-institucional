'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * O header 1+ (Pedro, 19/11/2026): nas páginas que abrem com foto ou vídeo na
 * tela inteira, ele começa curto e sem fundo ("topo") e fica completo ao rolar.
 *
 * Folga: fica completo só depois de ABRE px de rolagem e só volta a ser curto
 * perto do topo (FECHA), para não abrir e fechar sem parar no meio do caminho
 * (trackpad, rolagem que continua sozinha). A lupa do topo abre o header ali
 * mesmo, sem rolar ("forçado"); Esc ou um clique fora devolvem.
 *
 * `antesDeMudar` é chamado com o header ainda no estado antigo, para o
 * Cabecalho medir de onde cada peça sai antes da animação.
 */
const ABRE = 96;
const FECHA = 24;

export function useAbertura(comAbertura: boolean, antesDeMudar: (paraTopo: boolean) => void) {
  const [topo, setTopo] = useState(comAbertura);
  const atual = useRef(comAbertura);
  const forcado = useRef(false);
  const animar = useRef(false);
  const avisar = useRef(antesDeMudar);
  avisar.current = antesDeMudar;

  const decidir = useCallback(() => {
    const y = window.scrollY;
    if (forcado.current && y >= ABRE) forcado.current = false;
    const quer = comAbertura && !forcado.current && y < (atual.current ? ABRE : FECHA);
    if (quer === atual.current) return;
    avisar.current(quer);
    animar.current = true;
    atual.current = quer;
    setTopo(quer);
  }, [comAbertura]);

  /* Ao entrar na página (ou trocar de página no mesmo layout): o estado certo, sem animação. */
  useEffect(() => {
    forcado.current = false;
    animar.current = false;
    atual.current = comAbertura && window.scrollY < ABRE;
    setTopo(atual.current);
  }, [comAbertura]);

  useEffect(() => {
    if (!comAbertura) return undefined;
    let quadro = 0;
    const agendar = () => {
      if (!quadro) {
        quadro = window.requestAnimationFrame(() => {
          quadro = 0;
          decidir();
        });
      }
    };
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
    return () => {
      window.removeEventListener('scroll', agendar);
      window.removeEventListener('resize', agendar);
      if (quadro) window.cancelAnimationFrame(quadro);
    };
  }, [comAbertura, decidir]);

  const abrirPelaLupa = useCallback(() => {
    forcado.current = true;
    decidir();
  }, [decidir]);

  /* Devolve o header ao topo se ele foi aberto pela lupa; diz se devolveu. */
  const soltar = useCallback(() => {
    if (!forcado.current) return false;
    forcado.current = false;
    decidir();
    return true;
  }, [decidir]);

  return { topo, animar, abrirPelaLupa, soltar };
}
