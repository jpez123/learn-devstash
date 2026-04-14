import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    exclude: ['src/generated/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/actions/**'],
      exclude: ['src/lib/prisma.ts', 'src/lib/resend.ts', 'src/lib/mock-data.ts', 'src/generated/**'],
      reporter: ['text', 'lcov'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
