export const Arrow = ({ direction = 'right' }) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{
    transform: direction === 'upRight' ? 'rotate(-45deg)' : 'none',
  }}>
    <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const giroDoChevron = { left: 'rotate(180deg)', down: 'rotate(90deg)' };

export const Chevron = ({ direction = 'right' }) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{
    transform: giroDoChevron[direction] ?? 'none',
  }}>
    <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Pin = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 14.5s5-4.2 5-8a5 5 0 1 0-10 0c0 3.8 5 8 5 8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <circle cx="8" cy="6.4" r="1.8" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

export const Plus = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

/*
 * Redes sociais: mesmo tracado das outras (contorno de 1.3, viewBox 16) para
 * que convivam com Arrow e Pin sem parecer coladas de outra biblioteca.
 */
const Instagram = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2.1" y="2.1" width="11.8" height="11.8" rx="3.6" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="8" cy="8" r="2.9" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="11.5" cy="4.6" r="0.85" fill="currentColor" />
  </svg>
);

const WhatsApp = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M2.6 13.4l.8-2.7a5.6 5.6 0 1 1 2.1 2l-2.9.7Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M6.2 6c.2-.5.5-.5.8-.4.2 0 .4.7.5.9.1.2 0 .3-.1.4l-.3.3c-.1.1-.2.2 0 .5.3.5.9 1 1.3 1.2.2.1.3.1.4 0l.4-.4c.1-.2.3-.1.4 0l.9.5c.1.1.2.2.1.4-.2.6-.8.9-1.3.8-1.4-.2-3-1.8-3.2-3.2 0-.3 0-.7.1-1Z"
      fill="currentColor"
    />
  </svg>
);

const Facebook = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2.1" y="2.1" width="11.8" height="11.8" rx="3.6" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M9.9 5.3h-.8c-.7 0-1.1.4-1.1 1.1v1.1h1.8l-.3 1.8H8v3.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M6.4 7.5H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

/*
 * Marca do WhatsApp preenchida, para o FAB flutuante: ali o icone aparece
 * sozinho e grande, e o contorno fino das redes do rodape nao aguenta. Uma peca
 * so, em `currentColor` — branca dentro do botao.
 */
export const WhatsappGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M.06 24l1.68-6.13A11.83 11.83 0 0 1 .16 11.9C.16 5.34 5.5 0 12.06 0a11.82 11.82 0 0 1 8.4 3.49 11.75 11.75 0 0 1 3.48 8.42c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 0 1-5.69-1.45L.06 24zM6.6 20.2l.36.22c1.5.9 3.23 1.37 4.99 1.37h.01c5.45 0 9.89-4.43 9.89-9.88a9.8 9.8 0 0 0-2.9-6.99 9.8 9.8 0 0 0-6.98-2.9c-5.46 0-9.9 4.43-9.9 9.88 0 1.87.53 3.7 1.52 5.28l.24.38-1 3.63 3.76-.7zm11.02-5.55c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42z" />
  </svg>
);

const desenhos = { instagram: Instagram, whatsapp: WhatsApp, facebook: Facebook };

/* Escolhe o desenho pela chave vinda de data/casa.js. */
export const IconeRede = ({ nome }) => {
  const Desenho = desenhos[nome];
  return Desenho ? <Desenho /> : null;
};
