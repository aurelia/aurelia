const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

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
                'runtime-html',
                'platform',
                'platform-browser',
            ].reduce((map, name) => {
                map[`@aurelia/${name}`] = path.resolve(__dirname, `node_modules/@aurelia/${name}/dist/esm/index.mjs`);
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
