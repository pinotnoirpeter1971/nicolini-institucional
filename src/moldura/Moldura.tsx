import type { ReactNode } from 'react';
import { modulos, pecasDeLoja } from '../menu-do-site';
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
 * O layout raiz não chama o Engine (SPEC-SITE §1.6): os itens do menu vêm de
 * src/menu-do-site.ts.
 */
export function Moldura({ tema, children }: { tema?: 'bistro' | 'rustichella'; children: ReactNode }) {
  return (
    <div className={tema ? `tema tema--${tema}` : undefined}>
      <a className="pular-para-o-conteudo" href="#topo">
        Pular para o conteúdo
      </a>
      {/* A faixa do e-commerce rola junto; o header fica preso no topo. */}
      {pecasDeLoja.faixaDeAnuncio === 'travada' && <FaixaDeAnuncio />}
      <Cabecalho />
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
