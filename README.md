# Institucional Nicolini

Site da loja física. Sem venda, catálogo, busca, sacola, CEP, checkout ou conta.
Fica no ar enquanto o e-commerce é construído.

Inclui, no mesmo app:

- `/` — home institucional (casa, balcões, galeria, Blog).
- `/a-loja` — endereço, horários, contato, fotos, mapa.
- `/bistro` — vitrine do Bistrô (≠ web app de cardápio/reservas, que é `apps/webapp-bistro`).
- `/rustichella` — landing do evento Bistrô Nicolini × Rustichella d'Abruzzo (temporária).

**Contexto detalhado, dados e limites:** [`CONTEXTO.md`](CONTEXTO.md).
**Direção visual e plano:** [`../../docs/DIRECAO_E_PLANO_INSTITUCIONAL.md`](../../docs/DIRECAO_E_PLANO_INSTITUCIONAL.md).

## Rodar

Na raiz do monorepo:

```bash
npm run dev:institucional   # http://localhost:5183
npm run build:institucional
```

Conteúdo provisório vive em `src/data/casa.js`, `src/data/bistro.js` e
`src/data/rustichella.js`. Substituir tudo antes de publicar.
