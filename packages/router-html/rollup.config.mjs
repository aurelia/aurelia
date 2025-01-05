// // @ts-check
import pkg from './package.json' assert { type: 'json' };
import { getRollupConfig } from '../rollup-utils.mjs';

export default getRollupConfig(pkg);
