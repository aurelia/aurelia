import { getRollupConfig } from '../rollup-utils.js';
import pkg from './package.json';

export default getRollupConfig(pkg);
// export default {
//   input: 'src/index.ts',
//   external: Object.keys(pkg.dependencies)
//     .concat(Object.keys(pkg.devDependencies))
//     .concat('os', 'path', 'fs', 'http', 'https', 'http2', 'url', 'stream'),
//   output: [
//     {
//       file: 'dist/esm/index.mjs',
//       format: 'es',
//       sourcemap: true
//     },
//     {
//       file: 'dist/cjs/index.cjs',
//       format: 'cjs',
//       sourcemap: true,
//       exports: 'named'
//     },
//   ],
//   plugins: [
//     typescript({
//       tsconfig: 'tsconfig.build.json',
//       inlineSources: true,
//     })
//   ],
//   onwarn: (warning, warn) => {
//     if (warning.code === 'CIRCULAR_DEPENDENCY') return;
//     warn(warning)
//   }
// };
