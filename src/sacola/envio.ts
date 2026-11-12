/*
 * A assinatura de uma tentativa de envio (SPEC-SITE §7): um resumo do corpo,
 * para o navegador não guardar nome nem observação em texto puro. Muda se mudar
 * a sacola, o nome, a observação ou o total mostrado.
 */

/* Sem `crypto.subtle` (página fora de contexto seguro, como o laboratório pelo IP da rede), um resumo simples. */
function resumoSimples(texto: string) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < texto.length; i++) {
    const c = texto.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `s:${(h2 >>> 0).toString(16)}${(h1 >>> 0).toString(16)}`;
}

export async function assinaturaDoEnvio(itens: Array<{ productId: string; quantity: number }>, nome: string, nota: string | null, totalCents: number) {
  const texto = JSON.stringify([itens, nome, nota, totalCents]);
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return resumoSimples(texto);
  const resumo = await subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return `h:${Array.from(new Uint8Array(resumo), (b) => b.toString(16).padStart(2, '0')).join('')}`;
}
