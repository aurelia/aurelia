# `aurelia`

This project is bootstrapped by [aurelia-cli](https://github.com/aurelia/cli).

For more information, go to https://aurelia.io/docs/cli/webpack

## Run dev app

Run `npm start`, then open `http://localhost:8080`

You can change the standard webpack configurations from CLI easily with something like this: `npm start -- --open --port 8888`. However, it is better to change the respective npm scripts or `webpack.config.js` with these options, as per your need.

To enable Webpack Bundle Analyzer, do `npm run analyze` (production build).

To enable hot module reload, do `npm start -- --env.hmr`.

To change dev server port, do `au run --port 8888`.

To change dev server host, do `au run --host 127.0.0.1`

**PS:** You could mix all the flags as well, `au run --host 127.0.0.1 --port 7070 --open --env.hmr`

## Build for production

Run `npm run build`.
