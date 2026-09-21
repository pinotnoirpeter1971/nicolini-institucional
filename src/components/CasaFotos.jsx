import { useEffect, useRef, useState } from 'react';
import { Chevron } from './Icons';
import { fotosDaCasa } from '../data/casa';

/*
 * Fotos dentro de um quadro so, uma de cada vez, em vez de virarem um bloco
 * proprio de galeria. Nada de bolinhas nem regua: no mouse os dois chevrons
 * aparecem no hover, embaixo ficam a legenda e o contador.
 *
 * O mecanismo continua sendo um container de scroll com snap — assim o gesto
 * lateral no toque funciona sozinho, sem nenhuma implementacao em JS, e os
 * botoes so empurram esse mesmo scroll.
 *
 * Nasceu para a home e hoje serve tambem a abertura do jantar Rustichella, que
 * pediu a mesma moldura com outras fotos e outra proporcao. Por isso as fotos
 * entram por prop: duas copias do mesmo carrossel seriam duas chances de
 * corrigir um bug pela metade. A proporcao vem do CSS, pela `className` — ver
 * `.quadro-evento` em `styles.css`.
 */
export function CasaFotos({
  fotos = fotosDaCasa,
  rotulo = 'Fotos da loja Nicolini',
  className = '',
  autoPlay = fotos === fotosDaCasa,
}) {
  const [indice, setIndice] = useState(0);
  const trilho = useRef(null);

  /* offsetLeft de dois irmaos tem sempre o mesmo offsetParent, entao a
   * diferenca vale como passo sem depender de quem esta posicionado. */
  const medirPasso = (el) =>
    el.children.length > 1 ? el.children[1].offsetLeft - el.children[0].offsetLeft : 0;

  useEffect(() => {
    const el = trilho.current;
    if (!el) return undefined;

    /* Em cache porque ler `offsetLeft` a cada evento de scroll forca layout. */
    let passo = 0;
    const medir = () => {
      passo = medirPasso(el);
    };

    const aoRolar = () => {
      if (passo <= 0) medir();
      if (passo <= 0) return;
      const atual = Math.round(el.scrollLeft / passo);
      setIndice(Math.max(0, Math.min(el.children.length - 1, atual)));
    };

    medir();
    el.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', medir);

    return () => {
      el.removeEventListener('scroll', aoRolar);
      window.removeEventListener('resize', medir);
    };
  }, []);

  const irPara = (alvo) => {
    const el = trilho.current;
    if (!el) return;
    const passo = medirPasso(el);
    if (passo <= 0) return;
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: passo * alvo, behavior: suave ? 'smooth' : 'auto' });
  };

  const total = fotos.length;
  const atual = fotos[indice] ?? fotos[0];

  useEffect(() => {
    if (!autoPlay || total < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      irPara((indice + 1) % total);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [autoPlay, indice, total]);

  return (
    <figure className={`casa__figure ${className}`}>
      <div className="casa-fotos__quadro">
        <div className="casa-fotos" ref={trilho} role="group" aria-label={rotulo}>
          {fotos.map((foto, posicao) => (
            <img
              key={foto.src}
              src={foto.src}
              alt={foto.alt}
              /* A primeira abre a secao; as outras so quando o trilho anda. */
              loading={posicao === 0 ? 'eager' : 'lazy'}
              style={foto.foco ? { objectPosition: foto.foco } : undefined}
              draggable="false"
            />
          ))}
        </div>

        <button
          type="button"
          className="casa-fotos__seta casa-fotos__seta--anterior"
          onClick={() => irPara(indice - 1)}
          disabled={indice === 0}
          aria-label="Foto anterior"
        >
          <Chevron direction="left" />
        </button>

        <button
          type="button"
          className="casa-fotos__seta casa-fotos__seta--proxima"
          onClick={() => irPara(indice + 1)}
          disabled={indice === total - 1}
          aria-label="Próxima foto"
        >
          <Chevron />
        </button>
      </div>

      <figcaption className="casa-fotos__rodape">
        <span className="casa-fotos__legenda">{atual.legenda}</span>
        {/* Posicao e um dado visual: quem usa leitor de tela ja recebe todas as
            imagens com seus alts. */}
        <span className="casa-fotos__contador" aria-hidden="true">
          {`${String(indice + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`}
        </span>
      </figcaption>
    </figure>
  );
}
