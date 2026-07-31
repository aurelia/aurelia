import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';

export default defineConfig(({ isSsrBuild }) => ({
  server: {
    port: Number(process.env.APP_PORT ?? 5173),
    strictPort: true,
  },
  build: {
    target: 'es2022',
  },
  ssr: isSsrBuild
    ? {
      // Exercise the most restrictive SSR policy: decorator helpers must
      // remain in the output when Vite externalizes every dependency.
      external: true,
    }
    : undefined,
  plugins: [
    aurelia(),
  ],
}));
