'use client';

import { useEffect, useState } from 'react';
import { MARCA_DO_LABORATORIO } from '../engine/simulado/dados';
import { CENARIOS, RECIBOS_DE_EXEMPLO, cenarioAtual, escolherCenario, recomecar, sacolaDeExemplo, type NomeDoCenario } from '../engine/simulado/navegador';
import { abrirPainel, esvaziar, substituir } from '../sacola/armazem';

/*
 * SÓ NO LABORATÓRIO (`next dev`). Um atalho para as telas e os estados do
 * DESIGN-BRIEF §9, com dados simulados. No build de produção este arquivo nem
 * entra no pacote (src/moldura/Hospedes.tsx).
 *
 * Também lê o endereço, para as capturas: `?sacola=cheia|com-avisos|vazia`,
 * `?simular=<cenário do envio>` e `?painel=sacola`.
 */

const TELAS: Array<[string, string]> = [
  ['Home', '/'],
  ['Produtos', '/produtos'],
  ['Categoria (com "ver mais")', '/produtos/queijos'],
  ['Categoria vazia', '/produtos/queijos?simular=vazio'],
  ['Produto por unidade', '/produto/fettuccine-rustichella'],
  ['Produto por peso', '/produto/parmigiano-reggiano-24-meses'],
  ['Produto indisponível', '/produto/comte-18-meses'],
  ['Produto sob consulta', '/produto/barolo-docg-2018'],
  ['Produto sem foto', '/produto/guanciale-curado'],
  ['Blog', '/blog'],
  ['Blog vazio', '/blog?simular=vazio'],
  ['Categoria "Receita do mês"', '/blog/categoria/receita-do-mes'],
  ['Matéria com vídeo (capa e corpo)', '/blog/rigatoni-ao-ragu-branco'],
  ['Matéria com foto', '/blog/jamon-de-bellota'],
  ['Eventos', '/eventos'],
  ['Eventos sem nenhum', '/eventos?simular=vazio'],
  ['Evento com página própria (Rustichella)', '/eventos/nicolini-e-rustichella'],
  ['Evento próximo', '/eventos/noite-de-queijos-franceses'],
  ['Sacola cheia', '/sacola?sacola=cheia&simular=normal'],
  ['Sacola com avisos', '/sacola?sacola=com-avisos'],
  ['Sacola vazia', '/sacola?sacola=vazia'],
  ['Envio: preço mudou', '/sacola?sacola=cheia&simular=preco-mudou'],
  ['Envio: item saiu', '/sacola?sacola=cheia&simular=item-saiu'],
  ['Envio: casa pausada', '/sacola?sacola=cheia&simular=pausada'],
  ['Envio: limite atingido', '/sacola?sacola=cheia&simular=limite'],
  ['Envio: falha', '/sacola?sacola=cheia&simular=falha'],
  ['Casa não recebe pedidos', '/sacola?sacola=cheia&simular=nao-recebe'],
  ['Recibo não enviado', `/pedido?simular=normal#${RECIBOS_DE_EXEMPLO.novo}`],
  ['Recibo em atendimento', `/pedido#${RECIBOS_DE_EXEMPLO.emAtendimento}`],
  ['Recibo não encontrado', `/pedido#${RECIBOS_DE_EXEMPLO.naoEncontrado}`],
  ['Política de privacidade', '/politica-de-privacidade'],
  ['Bistrô', '/bistro'],
  ['Loja física', '/a-loja'],
  ['404', '/nao-existe'],
];

/* O estilo mora aqui, e não no CSS do site, para nada do laboratório ir ao build de produção. */
const ESTILO = `
.laboratorio { position: fixed; z-index: 90; right: 14px; bottom: 14px; font: 13px/1.4 var(--sans); }
.laboratorio__botao { padding: 7px 12px; border: 1px dashed #b07a1e; border-radius: 999px; color: #6b4a10; background: #fff6df; font-size: 12px; font-weight: 600; }
.laboratorio__caixa { position: absolute; right: 0; bottom: 42px; width: min(340px, calc(100vw - 28px)); max-height: 72vh; overflow: auto; padding: 14px; border: 1px solid #e1d6bd; background: #fffdf7; box-shadow: 0 18px 40px rgba(0,0,0,.18); }
.laboratorio__nota { margin-bottom: 10px; color: #8a7a55; font-size: 12px; }
.laboratorio__titulo { margin: 12px 0 6px; font-weight: 650; }
.laboratorio select { width: 100%; padding: 6px; }
.laboratorio__acoes { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.laboratorio__acoes button { padding: 5px 9px; border: 1px solid #d9cfb8; background: #fff; font-size: 12px; }
.laboratorio ul { margin: 0; padding: 0; list-style: none; }
.laboratorio li a { display: block; padding: 5px 0; border-bottom: 1px solid #f0e9d8; color: #2b2418; }
.laboratorio li a:hover { color: var(--marca); }
@media (max-width: 760px) { .laboratorio { bottom: 84px; } body:has(.barra-de-envio) .laboratorio { bottom: 96px; } }
`;

export default function PainelDoLaboratorio() {
  const [aberto, setAberto] = useState(false);
  const [cenario, setCenario] = useState<NomeDoCenario>('normal');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sacola = params.get('sacola');
    const simular = params.get('simular') as NomeDoCenario | null;
    if (sacola === 'vazia') esvaziar();
    if (sacola === 'cheia' || sacola === 'com-avisos') {
      recomecar();
      substituir(sacolaDeExemplo(sacola));
    }
    if (simular && simular in CENARIOS) escolherCenario(simular);
    setCenario(cenarioAtual());
    if (params.get('painel') === 'sacola') abrirPainel();
  }, []);

  return (
    <div className="laboratorio" data-fonte={MARCA_DO_LABORATORIO}>
      <style>{ESTILO}</style>
      <button type="button" className="laboratorio__botao" onClick={() => setAberto((a) => !a)} aria-expanded={aberto}>
        Laboratório · dados simulados
      </button>
      {aberto && (
        <div className="laboratorio__caixa" role="dialog" aria-label="Laboratório">
          <p className="laboratorio__nota">Só no `next dev`. Nada daqui vai ao ar.</p>
          <p className="laboratorio__titulo">Próximo envio da sacola</p>
          <select
            value={cenario}
            onChange={(e) => {
              const v = e.target.value as NomeDoCenario;
              escolherCenario(v);
              setCenario(v);
            }}
          >
            {Object.entries(CENARIOS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <div className="laboratorio__acoes">
            <button type="button" onClick={() => { recomecar(); substituir(sacolaDeExemplo('cheia')); setCenario('normal'); }}>
              Encher a sacola
            </button>
            <button type="button" onClick={() => { recomecar(); substituir(sacolaDeExemplo('com-avisos')); setCenario('normal'); }}>
              Sacola com avisos
            </button>
            <button type="button" onClick={() => esvaziar()}>
              Esvaziar
            </button>
          </div>
          <p className="laboratorio__titulo">Telas e estados</p>
          <ul>
            {TELAS.map(([rotulo, href]) => (
              <li key={href}>
                {/* Página inteira (não navegação do Next), para o endereço valer de novo. */}
                <a href={href}>{rotulo}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
