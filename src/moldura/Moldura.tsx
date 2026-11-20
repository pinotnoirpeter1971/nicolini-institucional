import type { ReactNode } from 'react';
import { categoriasDeProdutos, indiceDoBlog } from '../engine/fonte';
import { bandeiraDoPais, modulos, type DepartamentoDoMenu } from '../menu-do-site';
import { casa } from '../data/casa';
import { laboratorio } from '../site';
import { WhatsappGlyph } from '../components/Icons';
import { Cabecalho } from './Cabecalho';
import { HospedeDaSacola, HospedeDoLaboratorio } from './Hospedes';
import { Rodape } from './Rodape';

/*
 * A moldura do site: header, rodapé, o botão do WhatsApp e o painel da sacola.
 * Mora nos layouts de rota (app/(casa)/layout.tsx, app/bistro/layout.tsx,
 * app/rustichella/layout.tsx), para cada área herdar a mesma moldura. `tema`
 * troca a família de cor da área inteira, header e rodapé inclusos
 * (`.tema--bistro`, `.tema--rustichella`); o resto do sistema não muda.
 *
 * Os itens do menu vêm de src/menu-do-site.ts (SPEC-SITE §1.6), menos as
 * categorias de Produtos, que vêm do Engine (abaixo).
 */

/*
 * As categorias do header: a leitura de /produtos, guardada por 60 s e dividida
 * por todas as páginas (uma chamada ao Engine por minuto, no máximo, para o site
 * inteiro). Por isso toda página com a moldura se refaz a cada 60 s, como
 * /produtos; nenhuma passa a rodar função por visita. Se o Engine falhar, a
 * página sai com o header sem categorias (sem Departamentos) e se corrige na
 * revalidação seguinte: o header nunca derruba a página.
 */
async function categoriasDoHeader(): Promise<DepartamentoDoMenu[]> {
  if (!modulos.produtos) return [];
  try {
    const categorias = await categoriasDeProdutos();
    /* `children` e `origins` vêm do Engine com D-141; um Engine anterior não os manda. */
    return (categorias ?? []).map((c) => ({
      rotulo: c.name,
      href: `/produtos/${c.slug}`,
      aceso: true,
      descricao: c.description,
      filhos: (c.children ?? []).map((f) => ({ rotulo: f.name, href: `/produtos/${f.slug}`, aceso: true })),
      origens: (c.origins ?? []).map((o) => ({ rotulo: o.name, href: `/produtos/${c.slug}/${o.slug}`, aceso: true, bandeira: bandeiraDoPais(o.slug) })),
    }));
  } catch (erro) {
    console.error('Header: categorias do Engine indisponíveis', erro);
    return [];
  }
}

/*
 * O Blog no menu (header e rodapé) só com o Blog ligado no Engine: desligado,
 * /blog dá 404 e nenhuma página aponta para lá. A leitura é a mesma do índice
 * do Blog (/blog e o bloco da home), guardada por 60 s; Engine fora, o link sai.
 */
async function blogNoAr(): Promise<boolean> {
  if (!modulos.blog) return false;
  try {
    return Boolean(await indiceDoBlog());
  } catch (erro) {
    console.error('Menu: índice do Blog indisponível', erro);
    return false;
  }
}

export async function Moldura({ tema, children }: { tema?: 'bistro' | 'rustichella'; children: ReactNode }) {
  const [categorias, comBlog] = await Promise.all([categoriasDoHeader(), blogNoAr()]);
  return (
    <div className={tema ? `tema tema--${tema}` : undefined}>
      <a className="pular-para-o-conteudo" href="#topo">
        Pular para o conteúdo
      </a>
      {/* O header traz a tarja preta, quando ligada (src/menu-do-site.ts, `faixa`). */}
      <Cabecalho categorias={categorias} comBlog={comBlog} />
      <main id="topo">{children}</main>
      <Rodape comBlog={comBlog} />
      {/*
       * Abre o WhatsApp da casa (casa.whatsapp). Some na sacola e no recibo,
       * onde o WhatsApp é o do pedido.
       */}
      <a className="whatsapp-fab" href={`https://wa.me/${casa.whatsapp.link}`} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp">
        <WhatsappGlyph />
      </a>
      {modulos.pedidos && <HospedeDaSacola />}
      {laboratorio && <HospedeDoLaboratorio />}
    </div>
  );
}
