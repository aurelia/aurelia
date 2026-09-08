import { readFileSync } from 'node:fs';

// Build, preview, and development tests select the same Vite package. This lets
// both supported majors exercise one fixture without swapping workspace installs.
const vite = await import(process.env.VITE_PACKAGE ?? 'vite');
const { port } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
await vite[process.argv[2]]({ preview: { host: '127.0.0.1', port, strictPort: true } });
