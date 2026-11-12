import type { BlogPostData } from '../engine/sdk-0.7.0/index.js';

/** A descrição da matéria para busca e compartilhamento: o resumo; sem ele, o início do primeiro parágrafo. */
export function descricaoDaMateria(m: Pick<BlogPostData, 'excerpt' | 'blocks' | 'title'>) {
  if (m.excerpt.trim()) return m.excerpt.trim();
  const texto = m.blocks
    .flatMap((b) => (b.type === 'paragraph' ? [b.text.map((t) => t.text).join('')] : []))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!texto) return m.title;
  return texto.length <= 160 ? texto : `${texto.slice(0, 157).replace(/\s+\S*$/, '')}…`;
}
