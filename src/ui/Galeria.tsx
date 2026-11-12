'use client';

import { useState } from 'react';
import type { PublicMediaData } from '../engine/sdk-0.7.0/index.js';
import { Foto } from './Foto';

/* As fotos do produto: a principal numa moldura fixa e as miniaturas embaixo, como no e-commerce. */
export function Galeria({ fotos, nome }: { fotos: PublicMediaData[]; nome: string }) {
  const [atual, setAtual] = useState(0);
  if (!fotos.length) {
    return (
      <div className="galeria">
        <div className="galeria__principal">
          <span className="sem-foto">Nicolini</span>
        </div>
      </div>
    );
  }
  return (
    <div className="galeria">
      <div className="galeria__principal">
        <Foto foto={fotos[atual]} sizes="(max-width: 760px) 100vw, 50vw" prioridade={atual === 0} />
      </div>
      {fotos.length > 1 && (
        <ul className="galeria__miniaturas" aria-label={`Fotos de ${nome}`}>
          {fotos.map((foto, i) => (
            <li key={`${foto.url}-${i}`}>
              <button type="button" onClick={() => setAtual(i)} aria-pressed={i === atual} aria-label={`Foto ${i + 1} de ${fotos.length}`}>
                <Foto foto={foto} sizes="96px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
