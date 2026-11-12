import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow } from '../src/components/Icons';
import { Moldura } from '../src/moldura/Moldura';
import { modulos } from '../src/menu-do-site';

/*
 * Endereço inexistente responde 404 com esta página. Desenho do e-commerce
 * (centrado, ação sólida), redação do site no ar. Também é a resposta das
 * páginas de módulo apagado.
 */
export const metadata: Metadata = {
  title: 'Página não encontrada — Nicolini',
  robots: { index: false, follow: true },
};

export default function NaoEncontrada() {
  return (
    <Moldura>
      <section className="pagina-404">
        <div className="wrap">
          <p className="eyebrow">Página não encontrada</p>
          <h1>
            Este endereço
            <br />
            não está <em>na casa.</em>
          </h1>
          <p>O link pode ter mudado ou saído do ar. A loja, o bistrô e o cardápio continuam aqui.</p>
          <div className="acoes">
            <Link className="botao botao--escuro" href="/">
              Voltar ao início <Arrow />
            </Link>
            {modulos.produtos && (
              <Link className="link" href="/produtos">
                Ver os produtos <Arrow />
              </Link>
            )}
            <Link className="link" href="/bistro">
              Bistrô Nicolini <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </Moldura>
  );
}
