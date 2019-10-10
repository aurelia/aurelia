const { resolve } = require('path');

const loadPostCssPlugins = function() {
  return [
    require("autoprefixer")({ browsers: ["last 2 versions"] })
  ];
};

const load = {
  style: { loader: "style-loader" },
  postCss: { loader: "postcss-loader", options: { plugins: loadPostCssPlugins } },
  sass: { loader: "sass-loader" },
  html: { loader: "html-loader" },
  ts: { loader: "ts-loader" }
};

module.exports = function(env, { mode }) {
  const production = mode === 'production';
  return {
    target: 'web',
    mode: production ? 'production' : 'development',
    entry: {
      app: ['./src/startup.ts']
    },
    output: {
      path: resolve(__dirname, 'dist'),
      filename: 'bundle.js'
    },
    watch: mode === 'development',
    devtool: production ? 'source-map' : 'eval-source-map',
    resolve: {
      extensions: ['.ts', '.js'],
      modules: ['src', 'node_modules']
    },
    devServer: {
      publicPath: '/dist/',
      contentBase: resolve(__dirname, 'src'),
      watchContentBase: true,
      port: 9000
    },
    module: {
      rules: [
        { test: /\.scss$/i, use: [load.style, load.postCss, load.sass] },
        { test: /\.css$/i, use: [load.style, load.postCss] },
        { test: /\.html$/i, use: [load.html] },
        { test: /\.ts$/, use: [load.ts] }
      ]
    }
  };
};
