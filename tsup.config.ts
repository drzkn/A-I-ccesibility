import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  dts: true,
  splitting: false,
  treeshake: true,
  minify: false,
  shims: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  define: {
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
  esbuildOptions(options) {
    options.alias = {
      '@/types': './src/types',
      '@/tools': './src/tools',
      '@/adapters': './src/adapters',
      '@/normalizers': './src/normalizers',
      '@/utils': './src/utils',
      '@/data': './src/data',
      '@/prompts': './src/prompts',
      '@/shared': './src/shared',
    };
  },
});
