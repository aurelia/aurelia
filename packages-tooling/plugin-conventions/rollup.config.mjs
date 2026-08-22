import { getRollupConfig } from '../rollup-utils.mjs';
import { createRequire } from 'node:module';

const pkg = createRequire(import.meta.url)('./package.json');

export default getRollupConfig(pkg, config => {
  config.input = {
    index: 'src/index.ts',
    node: 'src/node.ts',
  };
  for (const output of config.output) {
    output.entryFileNames = output.format === 'es' ? 'esm/[name].mjs' : 'cjs/[name].cjs';
  }
  return config;
});
