const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');

// Passing the fixture-local compiler prevents workspace hoisting from silently selecting the repository's version.
const tsCompilerPath = require.resolve('typescript', { paths: [__dirname] });
const tsVersion = require(tsCompilerPath).version;

if (!tsVersion.startsWith('6.')) {
  throw new Error(`Expected the TypeScript 6 compiler, but resolved ${tsVersion} from ${tsCompilerPath}`);
}

console.log(`[15-ts6-webpack-smoke] ts-loader compiler: TypeScript ${tsVersion} from ${tsCompilerPath}`);

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
      port: process.env.APP_PORT ?? 9015,
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
        __TS_VERSION__: JSON.stringify(tsVersion),
      }),
    ],
  };
};
