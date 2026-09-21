import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: parseInt(process.env.PORT || 5183) },
  build: {
    /*
     * Duas entradas para o mesmo aplicativo. `rustichella.html` existe so para
     * servir os metadados de previa do evento aos robos do WhatsApp e das
     * redes, que nao executam JavaScript; o script que ele carrega e o mesmo,
     * entao nao ha duplicacao de bundle. Ver o comentario no proprio arquivo.
     */
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        rustichella: resolve(import.meta.dirname, 'rustichella.html'),
      },
    },
  },
});
