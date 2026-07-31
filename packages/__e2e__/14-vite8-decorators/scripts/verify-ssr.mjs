import { readFile } from 'node:fs/promises';

const outputUrl = new URL('../dist/ssr/decorated-ssr.mjs', import.meta.url);
const output = await readFile(outputUrl, 'utf8');

if (output.includes('@swc/helpers')) {
  throw new Error('The SSR bundle contains an external @swc/helpers import.');
}

const { ssrResult } = await import(outputUrl.href);
const expected = JSON.stringify({ initialized: true, value: 2 });
const actual = JSON.stringify(ssrResult);

if (actual !== expected) {
  throw new Error(`Unexpected SSR decorator result: ${actual}`);
}
