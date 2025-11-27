const fs = require('fs');
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const localNodeModules = path.resolve(__dirname, 'node_modules');
const workspaceNodeModules = path.resolve(__dirname, '../../node_modules');
const hasLocalDevBuild = fs.existsSync(path.join(localNodeModules, '@aurelia', 'runtime-html', 'dist', 'esm', 'index.mjs'));
const aureliaModuleRoot = hasLocalDevBuild ? localNodeModules : workspaceNodeModules;
if (!hasLocalDevBuild) {
    // Keep CI using published @aurelia/* packages (installed in benchmarks/latest),
    // but fall back to workspace builds for local workflows when the dev packages
    // are not installed to avoid hard failures.
    // eslint-disable-next-line no-console
    console.warn('[benchmarks/latest] Falling back to workspace @aurelia/* builds; run `npm i` in benchmarks/latest to use published dev packages.');
}

/** @type {import('webpack').Configuration} */
module.exports = {
    mode: 'production',
    entry: '../app.js',
    experiments: {
        outputModule: true,
    },
    optimization: {
        concatenateModules: false
    },
    resolve: {
        alias: {
            ...[
                'kernel',
                'metadata',
                'expression-parser',
                'runtime',
                'template-compiler',
                'runtime-html',
                'platform',
                'platform-browser',
            ].reduce((map, name) => {
                map[`@aurelia/${name}`] = path.resolve(aureliaModuleRoot, `@aurelia/${name}/dist/esm/index.mjs`);
                return map;
            }, {})
        }
    },
    output: {
        library: {
            type: 'module',
        },
        filename: 'app.latest.js',
    },
    plugins: [
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: true
        })
    ]
}
