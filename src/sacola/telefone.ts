/*
 * O WhatsApp do cliente na sacola. A conferência de verdade é a do Engine
 * (`normalizeReservationPhone`, que devolve o número na forma guardada); esta
 * é a mesma regra, só para avisar o cliente antes de enviar: DDD e número
 * brasileiros (com ou sem 55), ou um número internacional com "+".
 */

export function telefoneValido(valor: string) {
  const texto = valor.trim();
  if (!/^\+?[\d\s().-]+$/.test(texto)) return false;
  const digitos = texto.replace(/\D/g, '');
  const internacional = texto.startsWith('+');
  const comPais = digitos.startsWith('55') && (internacional || digitos.length === 12 || digitos.length === 13);
  const nacional = comPais ? digitos.slice(2) : digitos;
  if (!internacional || digitos.startsWith('55')) return /^[1-9]\d(?:[2-9]\d{7}|9\d{8})$/.test(nacional);
  return /^[1-9]\d{7,14}$/.test(digitos);
}

/**
 * Arruma o número quando o cliente sai do campo: "(54) 99999-1234". Só mexe no
 * que é um número brasileiro válido (tirando o 55 da frente, como o Engine);
 * o resto fica como foi digitado, para o aviso de erro mostrar o que ele escreveu.
 */
export function mascararTelefone(valor: string) {
  const texto = valor.trim();
  if (!telefoneValido(texto)) return valor;
  const digitos = texto.replace(/\D/g, '');
  if (texto.startsWith('+') && !digitos.startsWith('55')) return texto;
  const d = digitos.startsWith('55') && digitos.length >= 12 ? digitos.slice(2) : digitos;
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}
