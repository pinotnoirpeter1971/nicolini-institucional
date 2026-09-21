import { useEffect, useRef } from 'react';

/*
 * Um unico gesto de entrada para a pagina inteira, disparado uma vez so.
 * O threshold e zero com margem negativa embaixo para que blocos mais altos
 * que a tela tambem apareçam — threshold alto nunca dispara nesses casos.
 */
export function Reveal({ as: Tag = 'div', delay = 0, className, children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible');
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: '0px 0px -12% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} data-reveal="" className={className} style={{ '--d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
