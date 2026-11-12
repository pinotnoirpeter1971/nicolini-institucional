/*
 * Como o site escreve preço, peso e data. Dinheiro chega em centavos inteiros
 * (núcleo §4.1); a conta da linha é sempre a do SDK (`lineTotalCents`).
 */

const moedas = new Map<string, Intl.NumberFormat>();

export function dinheiro(centavos: number, moeda = 'BRL') {
  let f = moedas.get(moeda);
  if (!f) {
    f = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda });
    moedas.set(moeda, f);
  }
  /* O Intl separa "R$" do número com espaço inquebrável; mantém. */
  return f.format(centavos / 100);
}

/** 250 → "250 g"; 1000 → "1 kg"; 1250 → "1,25 kg". */
export function gramas(g: number) {
  if (g < 1000) return `${g} g`;
  const kg = g / 1000;
  return `${kg.toLocaleString('pt-BR', { maximumFractionDigits: 3 })} kg`;
}

/** A quantidade de uma linha: unidades ou gramas. */
export function quantidade(saleMode: 'unit' | 'weight', q: number) {
  if (saleMode === 'weight') return gramas(q);
  return q === 1 ? '1 unidade' : `${q} unidades`;
}

const meses = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
const mesesCurtos = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/* Datas do Engine em AAAA-MM-DD (ou ISO completo): lidas como data de calendário,
 * sem passar por fuso, para "8 de outubro" não virar "7 de outubro". */
function partes(data: string) {
  const [a, m, d] = data.slice(0, 10).split('-').map(Number);
  return { a, m, d };
}

/** "12 de novembro de 2026". */
export function dataPorExtenso(data: string) {
  const { a, m, d } = partes(data);
  return `${d} de ${meses[m - 1]} de ${a}`;
}

/** "8 a 10 de outubro de 2026", "30 de outubro a 2 de novembro de 2026" ou só o dia. */
export function periodo(inicio: string, fim: string | null) {
  if (!fim || fim === inicio) return dataPorExtenso(inicio);
  const i = partes(inicio);
  const f = partes(fim);
  if (i.a === f.a && i.m === f.m) return `${i.d} a ${f.d} de ${meses[f.m - 1]} de ${f.a}`;
  if (i.a === f.a) return `${i.d} de ${meses[i.m - 1]} a ${f.d} de ${meses[f.m - 1]} de ${f.a}`;
  return `${dataPorExtenso(inicio)} a ${dataPorExtenso(fim)}`;
}

/** Dia e mês curto, para o bloco de data do cartão de evento. */
export function diaEMes(data: string) {
  const { d, m } = partes(data);
  return { dia: String(d).padStart(2, '0'), mes: mesesCurtos[m - 1] };
}

/** Hoje (AAAA-MM-DD) no fuso da casa, para separar próximos de realizados. */
export function hojeNaCasa(fuso = 'America/Sao_Paulo') {
  return new Intl.DateTimeFormat('en-CA', { timeZone: fuso, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

/** "12/11/2026, 14:05", para o recibo (que traz `createdAt` em ISO). */
export function dataEHora(iso: string, fuso = 'America/Sao_Paulo') {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: fuso,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}
