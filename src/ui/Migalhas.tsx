import Link from 'next/link';

/* O caminho de navegação do e-commerce: rótulo pequeno, a página atual em negrito. */
export function Migalhas({ itens }: { itens: Array<{ rotulo: string; href?: string }> }) {
  return (
    <nav className="migalhas" aria-label="Caminho">
      <ol>
        {itens.map((item) => (
          <li key={item.rotulo}>
            {item.href ? <Link href={item.href}>{item.rotulo}</Link> : <span aria-current="page">{item.rotulo}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
