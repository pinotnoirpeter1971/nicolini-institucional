import { useEffect } from 'react';

/*
 * Move a hero's media by a restrained fraction of the scroll distance. The
 * caller reserves overscan in CSS so the transform never exposes the edge.
 */
export function useParalaxe(referencia, fator = 0.12) {
  useEffect(() => {
    const el = referencia.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let frame = 0;

    const atualizar = () => {
      frame = 0;
      const altura = el.offsetHeight;
      /* Once past the hero, the value freezes to avoid painting off-screen. */
      const avanco = Math.min(window.scrollY, altura);
      el.style.setProperty('--paralaxe', `${(avanco * fator).toFixed(1)}px`);
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
  }, [fator, referencia]);
}
