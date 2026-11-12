'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { PublicProductCardData } from '../engine/sdk-0.7.0/index.js';
import { Arrow } from '../components/Icons';
import { CartaoDeProduto } from '../ui/CartaoDeProduto';
import { Migalhas } from '../ui/Migalhas';

/*
 * PROVISÓRIO (demonstração, 12/11/2026; Pedro desfaz depois): o resultado da busca do header,
 * `/busca?q=<termo>`. A página é estática; o filtro roda aqui, no navegador, sobre o catálogo de
 * `/busca/catalogo.json` (guardado por 60 s). Uma pesquisa não roda função nem chama o Engine.
 * Procura cada palavra no nome, na marca e na categoria, sem acento nem caixa.
 */
type Item = PublicProductCardData & { categoryName: string | null };
type Estado = { fase: 'lendo' } | { fase: 'pronto'; itens: Item[] } | { fase: 'desligado' } | { fase: 'erro' };

const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/* Uma leitura por visita, dividida entre as pesquisas; falha não fica guardada. */
let catalogo: Promise<Item[] | null> | null = null;
function lerCatalogo(): Promise<Item[] | null> {
  catalogo ??= fetch('/busca/catalogo.json', { headers: { accept: 'application/json' } }).then(async (r) => {
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`catálogo ${r.status}`);
    return ((await r.json()) as { itens: Item[] }).itens;
  });
  catalogo.catch(() => {
    catalogo = null;
  });
  return catalogo;
}

export function TopoDaBusca() {
  return (
    <section className="topo-de-pagina topo-de-pagina--suave">
      <div className="wrap">
        <Migalhas itens={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Produtos', href: '/produtos' }, { rotulo: 'Busca' }]} />
        <h1>Busca</h1>
      </div>
    </section>
  );
}

export function ResultadoDaBusca() {
  const router = useRouter();
  const termo = (useSearchParams().get('q') ?? '').trim().slice(0, 80);
  const [estado, setEstado] = useState<Estado>({ fase: 'lendo' });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!termo) {
      router.replace('/produtos');
      return;
    }
    let vivo = true;
    lerCatalogo().then(
      (itens) => vivo && setEstado(itens ? { fase: 'pronto', itens } : { fase: 'desligado' }),
      () => vivo && setEstado({ fase: 'erro' }),
    );
    return () => {
      vivo = false;
    };
  }, [termo, tentativa, router]);

  const palavras = semAcento(termo).split(/\s+/).filter(Boolean);
  const achados =
    estado.fase === 'pronto'
      ? estado.itens.filter((p) => {
          const texto = semAcento(`${p.name} ${p.brand ?? ''} ${p.categoryName ?? ''}`);
          return palavras.every((palavra) => texto.includes(palavra));
        })
      : [];

  return (
    <>
      <TopoDaBusca />
      <section className="catalogo wrap" aria-label="Resultado da busca">
        {estado.fase === 'lendo' || !termo ? (
          <p className="catalogo__contagem" role="status">
            Buscando…
          </p>
        ) : estado.fase === 'pronto' ? (
          <>
            <p className="catalogo__contagem" role="status">
              {achados.length} {achados.length === 1 ? 'resultado' : 'resultados'} para &lsquo;{termo}&rsquo;
            </p>
            {achados.length ? (
              <div className="grade-de-produtos">
                {achados.map((p) => (
                  <CartaoDeProduto key={p.id} produto={p} />
                ))}
              </div>
            ) : (
              <Vazio titulo="com esse nome." texto="Confira a grafia ou tente uma palavra mais curta. Também dá para navegar pelas categorias." />
            )}
          </>
        ) : estado.fase === 'erro' ? (
          <div className="vazio" role="status">
            <h2>
              A busca não respondeu
              <br />
              <em>agora.</em>
            </h2>
            <p>Confira a internet e tente de novo, ou navegue pelas categorias.</p>
            <div className="acoes">
              <button type="button" className="botao botao--escuro" onClick={() => {
                  setEstado({ fase: 'lendo' });
                  setTentativa((t) => t + 1);
                }}>
                Tentar de novo
              </button>
            </div>
          </div>
        ) : (
          <Vazio titulo="no momento." texto="Os produtos ainda não estão no site. Fale com a loja pelo WhatsApp." />
        )}
      </section>
    </>
  );
}

function Vazio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="vazio">
      <h2>
        Nada por aqui
        <br />
        <em>{titulo}</em>
      </h2>
      <p>{texto}</p>
      <div className="acoes">
        <Link className="botao botao--escuro" href="/produtos">
          Ver todas as categorias <Arrow />
        </Link>
      </div>
    </div>
  );
}
