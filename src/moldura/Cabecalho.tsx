'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { casa } from '../data/casa';
import { categoriasNoMenu, itensAcesos, lojaFisica, menuPrincipal, modulos, pecasDeLoja, todosOsProdutos } from '../menu-do-site';
import { abrirPainel, useSacola } from '../sacola/armazem';
import { Arrow, Fechar, Menu, Pin, Sacola } from '../components/Icons';
import { BotaoCep, BotaoDepartamentos, CampoDeBusca, IconeConta, IconeCurtidos } from './Guardadas';

/*
 * O header do protótipo do e-commerce, como ele é (decisão de Pedro,
 * 12/11/2026): branco, preso no topo ao rolar, em duas linhas. Em cima o logo,
 * a busca, "Receba em", conta, curtidos e a sacola; embaixo "Departamentos", as
 * categorias, as páginas da casa e "Loja física" à direita. Busca, CEP, conta,
 * curtidos e o mega menu ficam à vista mas travados (src/menu-do-site.ts). No
 * celular: menu, logo e sacola, a busca embaixo, e o menu escuro do e-commerce.
 */

function ContadorDaSacola() {
  const linhas = useSacola();
  const n = linhas.length;
  return (
    <button type="button" className="cabecalho__sacola" onClick={abrirPainel} aria-label={n ? `Abrir a sacola, ${n} ${n === 1 ? 'item' : 'itens'}` : 'Abrir a sacola, vazia'}>
      <Sacola />
      {n > 0 && (
        <span className="cabecalho__contagem" aria-hidden="true">
          {n}
        </span>
      )}
    </button>
  );
}

export function Cabecalho() {
  const pathname = (usePathname() ?? '/').toLowerCase();
  const [rolado, setRolado] = useState(false);
  const [aberto, setAberto] = useState(false);
  const categorias = itensAcesos(categoriasNoMenu);
  const paginas = itensAcesos(menuPrincipal);
  const ativo = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const travada = (peca: keyof typeof pecasDeLoja) => pecasDeLoja[peca] === 'travada';

  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  useEffect(() => {
    const atualizar = () => setRolado(window.scrollY > 8);
    atualizar();
    window.addEventListener('scroll', atualizar, { passive: true });
    return () => window.removeEventListener('scroll', atualizar);
  }, []);

  /* Menu do celular aberto: Esc fecha. */
  useEffect(() => {
    if (!aberto) return undefined;
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [aberto]);

  const link = (item: { href: string; rotulo: string }, classe?: string) => (
    <Link
      key={item.href}
      href={item.href}
      className={[classe, ativo(item.href) && 'is-ativo'].filter(Boolean).join(' ') || undefined}
      aria-current={ativo(item.href) ? 'page' : undefined}
    >
      {item.rotulo}
    </Link>
  );

  return (
    <header className={['cabecalho', rolado && 'is-rolado', aberto && 'is-aberto'].filter(Boolean).join(' ')}>
      <div className="wrap cabecalho__linha">
        <button
          type="button"
          className="cabecalho__abrir"
          aria-label={aberto ? 'Fechar o menu' : 'Abrir o menu'}
          aria-expanded={aberto}
          aria-controls="menu-do-celular"
          onClick={() => setAberto((a) => !a)}
        >
          {aberto ? <Fechar /> : <Menu />}
        </button>

        <Link href="/" className="cabecalho__logo" aria-label="Nicolini, página inicial">
          {casa.marca}
        </Link>

        {travada('busca') && <CampoDeBusca />}

        <div className="cabecalho__ferramentas">
          {travada('cep') && <BotaoCep />}
          {travada('conta') && <IconeConta />}
          {travada('curtidos') && <IconeCurtidos />}
          {modulos.pedidos && <ContadorDaSacola />}
        </div>
      </div>

      <nav className="cabecalho__nav" aria-label="Navegação principal">
        <div className="wrap cabecalho__nav-linha">
          {travada('megaMenu') && <BotaoDepartamentos />}
          {categorias.map((item) => link(item))}
          {paginas.map((item) => link(item))}
          <Link href={lojaFisica.href} className={`cabecalho__loja ${ativo(lojaFisica.href) ? 'is-ativo' : ''}`} aria-current={ativo(lojaFisica.href) ? 'page' : undefined}>
            <Pin /> {lojaFisica.rotulo}
          </Link>
        </div>
      </nav>

      <nav id="menu-do-celular" className="cabecalho__gaveta" aria-label="Navegação no celular" hidden={!aberto}>
        <div className="wrap cabecalho__gaveta-lista">
          {todosOsProdutos.aceso && (
            <Link href={todosOsProdutos.href} className="cabecalho__gaveta-todos">
              {todosOsProdutos.rotulo} <Arrow />
            </Link>
          )}
          {[...categorias, ...paginas, lojaFisica].map((item) => link(item))}
          {travada('curtidos') && <IconeCurtidos comRotulo />}
          {travada('conta') && <IconeConta comRotulo />}
        </div>
      </nav>
    </header>
  );
}
