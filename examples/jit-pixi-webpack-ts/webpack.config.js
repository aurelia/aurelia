const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = function(env, { mode }) {
  const production = mode === 'production';
  return {
    mode: production ? 'production' : 'development',
    entry: './src/startup.ts',
    devtool: production ? 'source-map' : 'eval-source-map',
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'node_modules')
      ]
    },
    devServer: {
      port: 9000,
      historyApiFallback: true,
      open: true,
      lazy: false,
      contentBase: '/'
    },
    module: {
      rules: [
        { test: /\.ts$/i, loader: 'ts-loader' },
        { test: /\.html$/i, loader: 'html-loader' },
        { test: /\.(jpe?g|png|gif|svg)$/i, loader: 'file-loader' }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'index.ejs' })
    ]
  };
};
