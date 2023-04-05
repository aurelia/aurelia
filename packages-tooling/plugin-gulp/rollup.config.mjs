import { getRollupConfig } from '../rollup-utils.mjs';
import { createRequire } from 'node:module';

const pkg = createRequire(import.meta.url)('./package.json');

export default getRollupConfig(pkg);