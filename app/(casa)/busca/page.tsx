import type { Metadata } from 'next';
import { Suspense } from 'react';
import { metadadosDaPagina } from '../../../src/metadados';
import { ResultadoDaBusca, TopoDaBusca } from '../../../src/paginas/Busca';

/*
 * PROVISÓRIO (demonstração, 12/11/2026; Pedro desfaz depois): a busca do header, `/busca?q=<termo>`.
 * Página estática: o termo é lido e filtrado no navegador (src/paginas/Busca.tsx), sobre o catálogo
 * de `/busca/catalogo.json`. Assim `/produtos` segue guardada por 60 s e nenhuma pesquisa roda
 * função na Vercel. Fora do sitemap e do Google.
 */
export const metadata: Metadata = {
  ...metadadosDaPagina({
    caminho: '/busca',
    titulo: 'Busca',
    descricao: 'Busque queijos, embutidos, massas, vinhos e conservas da Nicolini.',
  }),
  robots: { index: false, follow: true },
};

export default function Pagina() {
  return (
    <Suspense fallback={<TopoDaBusca />}>
      <ResultadoDaBusca />
    </Suspense>
  );
}
