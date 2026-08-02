const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');

// TypeScript 7 has no compiler API, so webpack uses its official TypeScript 6 compatibility package.
const tsCompilerPath = require.resolve('typescript', { paths: [__dirname] });
const tsApiVersion = require(tsCompilerPath).version;
const tsCliPackageJsonPath = require.resolve('@typescript/native/package.json', { paths: [__dirname] });
const tsCliVersion = require(tsCliPackageJsonPath).version;

if (!tsApiVersion.startsWith('6.')) {
  throw new Error(`Expected the TypeScript 6 compatibility API, but resolved ${tsApiVersion} from ${tsCompilerPath}`);
}
if (!tsCliVersion.startsWith('7.0.')) {
  throw new Error(`Expected the TypeScript 7.0 CLI, but resolved ${tsCliVersion} from ${tsCliPackageJsonPath}`);
}

console.log(`[16-ts7-webpack-smoke] ts-loader compiler API: TypeScript ${tsApiVersion} from ${tsCompilerPath}`);
console.log(`[16-ts7-webpack-smoke] application CLI: TypeScript ${tsCliVersion} from ${tsCliPackageJsonPath}`);

/**
 * @return {import('webpack').Configuration}
 */
module.exports = function (env, { mode }) {
  const production = mode === 'production';
  return {
    mode: production ? 'production' : 'development',
    entry: './src/index.ts',
    devtool: false,
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      mainFields: ['module', 'main'],
    },
    devServer: {
      hot: false,
      port: process.env.APP_PORT ?? 9016,
      historyApiFallback: true,
      open: !process.env.CI,
    },
    stats: 'errors-only',
    module: {
      rules: [
        {
          test: /\.ts$/i,
          use: [
            {
              loader: 'ts-loader',
              options: {
                compiler: tsCompilerPath,
                transpileOnly: false,
              },
            },
            '@aurelia/webpack-loader',
          ],
          exclude: /node_modules/,
        },
        { test: /\.html$/i, use: '@aurelia/webpack-loader', exclude: /node_modules/ },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'index.ejs' }),
      new DefinePlugin({
        __TS_API_VERSION__: JSON.stringify(tsApiVersion),
        __TS_CLI_VERSION__: JSON.stringify(tsCliVersion),
      }),
    ],
  };
};
