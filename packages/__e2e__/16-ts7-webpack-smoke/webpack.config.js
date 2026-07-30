const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const tsPackageJsonPath = path.resolve(__dirname, 'node_modules/typescript/package.json');
const tsVersion = require(tsPackageJsonPath).version;

console.log(`[16-ts7-webpack-smoke] using TypeScript ${tsVersion} from ${tsPackageJsonPath}`);

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
      alias: {
        'typescript/package.json$': tsPackageJsonPath,
      },
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
    plugins: [new HtmlWebpackPlugin({ template: 'index.ejs' })],
  };
};
