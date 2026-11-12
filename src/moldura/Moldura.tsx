import type { ReactNode } from 'react';
import { categoriasDeProdutos } from '../engine/fonte';
import { modulos, pecasDeLoja, type ItemDoMenu } from '../menu-do-site';
import { laboratorio } from '../site';
import { WhatsappGlyph } from '../components/Icons';
import { Cabecalho } from './Cabecalho';
import { FaixaDeAnuncio } from './Guardadas';
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
async function categoriasDoHeader(): Promise<ItemDoMenu[]> {
  if (!modulos.produtos) return [];
  try {
    const categorias = await categoriasDeProdutos();
    return (categorias ?? []).map((c) => ({ rotulo: c.name, href: `/produtos/${c.slug}`, aceso: true }));
  } catch (erro) {
    console.error('Header: categorias do Engine indisponíveis', erro);
    return [];
  }
}

export async function Moldura({ tema, children }: { tema?: 'bistro' | 'rustichella'; children: ReactNode }) {
  return (
    <div className={tema ? `tema tema--${tema}` : undefined}>
      <a className="pular-para-o-conteudo" href="#topo">
        Pular para o conteúdo
      </a>
      {/* A faixa do e-commerce rola junto; o header fica preso no topo. */}
      {pecasDeLoja.faixaDeAnuncio === 'travada' && <FaixaDeAnuncio />}
      <Cabecalho categorias={await categoriasDoHeader()} />
      <main id="topo">{children}</main>
      <Rodape />
      {/*
       * O número entra quando houver um canal de WhatsApp confirmado para o
       * atendimento (como no site no ar). Some na sacola e no recibo, onde o
       * WhatsApp é o do pedido.
       */}
      <a className="whatsapp-fab" href="https://wa.me/" target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp">
        <WhatsappGlyph />
      </a>
      {modulos.pedidos && <HospedeDaSacola />}
      {laboratorio && <HospedeDoLaboratorio />}
    </div>
  );
}
