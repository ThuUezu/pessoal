import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon.png', 'theme-init.js'],
      manifest: {
        name: 'Cuidar da Analy',
        short_name: 'Analy',
        description: 'Lembretes e um registro de tudo que ela gosta.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#eef4ff',
        theme_color: '#eef4ff',
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Offline básico: o "casco" do app abre sem internet. Dados e login SEMPRE vão à rede (/api nunca é cacheado).
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,webmanifest}'],
        // As telas de abertura do iOS são grandes e só servem na instalação: não entram no cache offline.
        globIgnores: ['**/splash-*.png'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        // Por padrão o Workbox ignora ?utm_...; aqui também o ?erro= do login volta para o index.html.
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^erro$/],
      },
    }),
  ],
  build: {
    // iOS 16.7 = Safari 16. Nada de sintaxe que ele não entenda.
    target: 'safari16',
    cssTarget: 'safari16',
  },
  server: {
    port: 5173,
    // Em desenvolvimento o Vite faz o papel do rewrite do Netlify: mesmo domínio para app e API.
    proxy: { '/api': { target: 'http://localhost:3000' } },
  },
});
