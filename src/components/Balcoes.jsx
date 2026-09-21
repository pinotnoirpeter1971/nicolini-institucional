import { useEffect, useRef, useState } from 'react';
import { setores } from '../data/casa';

/*
 * Arrastar com o mouse quando o trilho passa da largura da tela. No toque o
 * scroll nativo ja resolve e e melhor que qualquer implementacao em JS.
 */
export function useArrasto() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let ativo = false;
    let inicioX = 0;
    let inicioScroll = 0;

    const aoDescer = (evento) => {
      if (evento.pointerType === 'touch') return;
      if (el.scrollWidth <= el.clientWidth) return;
      ativo = true;
      inicioX = evento.clientX;
      inicioScroll = el.scrollLeft;
      el.setPointerCapture(evento.pointerId);
    };

    const aoMover = (evento) => {
      if (!ativo) return;
      const delta = evento.clientX - inicioX;
      if (Math.abs(delta) > 4) el.classList.add('is-dragging');
      el.scrollLeft = inicioScroll - delta;
    };

    const aoSoltar = (evento) => {
      if (!ativo) return;
      ativo = false;
      el.classList.remove('is-dragging');
      if (el.hasPointerCapture?.(evento.pointerId)) {
        el.releasePointerCapture(evento.pointerId);
      }
    };

    el.addEventListener('pointerdown', aoDescer);
    el.addEventListener('pointermove', aoMover);
    el.addEventListener('pointerup', aoSoltar);
    el.addEventListener('pointercancel', aoSoltar);

    return () => {
      el.removeEventListener('pointerdown', aoDescer);
      el.removeEventListener('pointermove', aoMover);
      el.removeEventListener('pointerup', aoSoltar);
      el.removeEventListener('pointercancel', aoSoltar);
    };
  }, []);

  return ref;
}

/*
 * Os cinco balcoes numa faixa horizontal: todas as fotos visiveis ao mesmo
 * tempo. A descricao longa entra por cima da foto no hover e, no toque, no
 * clique — por isso cada item e um botao de verdade, com aria-expanded.
 * No celular o trilho vira rolagem lateral e a linha curta fica sempre visivel.
 */
export function Balcoes() {
  const [aberto, setAberto] = useState(null);
  const trilho = useArrasto();

  return (
    <div className="rail" ref={trilho}>
      {setores.map((setor) => (
        <button
          type="button"
          key={setor.id}
          className={`balcao ${aberto === setor.id ? 'is-open' : ''}`}
          aria-expanded={aberto === setor.id}
          onClick={() => setAberto((atual) => (atual === setor.id ? null : setor.id))}
        >
          <span className="balcao__foto">
            <img src={setor.foto} alt={setor.nome} loading="lazy" draggable="false" />
            <span className="balcao__scrim" aria-hidden="true" />
            <span className="balcao__destaque">{setor.destaque}</span>
          </span>
          <span className="balcao__nome">{setor.nome}</span>
          <span className="balcao__texto">{setor.texto}</span>
        </button>
      ))}
    </div>
  );
}
