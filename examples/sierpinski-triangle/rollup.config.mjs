import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

/** @type {import('rollup').RollupOptions} */
export default {
    input: './app.js',
    output: {
        file: 'dist/bundle.js',
        format: 'esm'
    },
    plugins: [nodeResolve(), terser()]
}
