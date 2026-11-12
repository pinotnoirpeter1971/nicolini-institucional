import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow, Layout } from '../src/components/Layout';
import { Reveal } from '../src/components/Reveal';

/*
 * Endereço inexistente responde 404 com esta página (antes caía na home).
 * Mesma linguagem da página da loja: só classes que já existem no CSS.
 */
export const metadata: Metadata = {
  title: 'Página não encontrada — Nicolini',
  robots: { index: false, follow: true },
};

export default function NaoEncontrada() {
  return (
    /* Props explícitas: o TypeScript infere os tipos dos componentes JSX sem os padrões. */
    <Layout tema={undefined} nav={undefined}>
      <section className="band band--paper page-top">
        <div className="wrap">
          <Reveal className={undefined}>
            <p className="eyebrow">Página não encontrada</p>
            <h1>
              Este endereço
              <br />
              não está <em>na casa.</em>
            </h1>
            <p>
              O link pode ter mudado ou saído do ar. A loja, o bistrô e o
              cardápio continuam aqui.
            </p>
            <div className="acoes">
              <Link className="link" href="/">
                Voltar ao início <Arrow />
              </Link>
              <Link className="link" href="/bistro">
                Bistrô Nicolini <Arrow />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
}
