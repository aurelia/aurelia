[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=shield)](https://circleci.com/gh/aurelia/aurelia)
[![npm](https://img.shields.io/npm/v/aurelia.svg?maxAge=3600)](https://www.npmjs.com/package/aurelia)
# aurelia

This is the cli package for Aurelia 2.


## `dev`

### Start HTTP server

```shell
au dev --scratchdir ./dist/
```

### Start HTTP/2 server
In order to run HTTP/2 server you need SSL. To generate the certs and keys, you may use this [guide](https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/).

Then you can start the HTTP/2 server like this:

```shell
au dev --scratchdir ./dist/ --usehttp2 true --keypath ./key.pem --certpath ./cert.pem
```

The HTTP/2 server will automatically push all the files under the root directory when the `index.html` file is requested.
