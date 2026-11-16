import { defineConfig } from 'vitest/config';

// Config separada para não carregar os plugins de PWA/React nos testes de funções puras.
export default defineConfig({ test: { environment: 'node', include: ['src/**/*.test.ts'] } });
