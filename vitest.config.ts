import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: 'react',
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**', 'src/store/**', 'src/components/ui/select.tsx', 'src/components/categories/**'],
      exclude: ['src/test/**', '**/*.d.ts'],
    },
    // 让 useEffect cleanup 不报警
    onConsoleLog: (log) => {
      if (log.includes('not wrapped in act')) return;
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
