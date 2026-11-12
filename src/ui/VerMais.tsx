'use client';

import { useState } from 'react';
import type { BlogCardData, BlogPostKind, PublicProductCardData } from '../engine/sdk-0.7.0/index.js';
import { maisMaterias, maisProdutos } from '../engine/navegador';
import { CartaoDeProduto } from './CartaoDeProduto';
import { CartaoDeEvento, CartaoDeMateria } from './CartaoDeMateria';

/*
 * "Ver mais" (SPEC-SITE §3.4): a primeira página vem pronta na página
 * guardada; o resto o navegador busca direto no Engine, com o cursor. Sem
 * número de página nem cursor no endereço.
 */
function useMais<T>(cursorInicial: string | null, buscar: (cursor: string) => Promise<{ items: T[]; nextCursor: string | null }>) {
  const [itens, setItens] = useState<T[]>([]);
  const [cursor, setCursor] = useState(cursorInicial);
  const [estado, setEstado] = useState<'parado' | 'carregando' | 'erro'>('parado');
  const carregar = async () => {
    if (!cursor) return;
    setEstado('carregando');
    try {
      const pagina = await buscar(cursor);
      setItens((antes) => [...antes, ...pagina.items]);
      setCursor(pagina.nextCursor);
      setEstado('parado');
    } catch {
      setEstado('erro');
    }
  };
  return { itens, cursor, estado, carregar };
}

function Botao({ estado, carregar, rotulo }: { estado: 'parado' | 'carregando' | 'erro'; carregar: () => void; rotulo: string }) {
  return (
    <div className="ver-mais">
      {estado === 'erro' && (
        <p className="ver-mais__erro" role="status">
          Não foi possível carregar agora.
        </p>
      )}
      <button type="button" className="botao botao--contorno" onClick={carregar} disabled={estado === 'carregando'} aria-busy={estado === 'carregando'}>
        {estado === 'carregando' ? 'Carregando…' : estado === 'erro' ? 'Tentar de novo' : rotulo}
      </button>
    </div>
  );
}

export function MaisProdutos({ categoria, cursor, limite }: { categoria: string; cursor: string | null; limite: number }) {
  const mais = useMais<PublicProductCardData>(cursor, (c) => maisProdutos({ category: categoria, cursor: c, limit: limite }));
  return (
    <>
      {mais.itens.map((p) => (
        <CartaoDeProduto key={p.id} produto={p} />
      ))}
      {mais.cursor && (
        <div className="grade__rodape">
          <Botao estado={mais.estado} carregar={mais.carregar} rotulo="Ver mais produtos" />
        </div>
      )}
    </>
  );
}

export function MaisMaterias({
  kind,
  categoria,
  quando,
  cursor,
  limite,
}: {
  kind: BlogPostKind;
  categoria?: string;
  quando?: 'upcoming' | 'past';
  cursor: string | null;
  limite: number;
}) {
  const mais = useMais<BlogCardData>(cursor, (c) => maisMaterias({ kind, category: categoria, when: quando, cursor: c, limit: limite }));
  return (
    <>
      {mais.itens.map((m) =>
        kind === 'event' ? <CartaoDeEvento key={m.id} evento={m} passado={quando === 'past'} /> : <CartaoDeMateria key={m.id} materia={m} />,
      )}
      {mais.cursor && (
        <div className="grade__rodape">
          <Botao estado={mais.estado} carregar={mais.carregar} rotulo={kind === 'event' ? 'Ver mais eventos' : 'Ver mais matérias'} />
        </div>
      )}
    </>
  );
}
