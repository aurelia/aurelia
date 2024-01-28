import { nodeResolve } from '@rollup/plugin-node-resolve';

/** @type {import('rollup').RollupOptions} */
export default {
    input: './app',
    output: {
        file: 'dist/bundle.js',
        sourcemap: true
    },
    plugins: [nodeResolve()]
}
