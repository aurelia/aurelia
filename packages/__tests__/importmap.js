// eslint-disable-next-line
document.write(`<script type="importmap">${JSON.stringify({
  imports: {
    ...([
      'addons',
      'aurelia',
      'platform',
      'platform-browser',
      'metadata',
      'kernel',
      'runtime',
      'runtime-html',
      'route-recognizer',
      'fetch-client',
      'state',
      'store-v1',
      'i18n',
      'router',
      'router-lite',
      'testing',
      'validation',
      'validation-html',
      'validation-i18n',
    ].reduce((map, pkg) => {
      map[`@aurelia/${pkg}`] = `/base/packages/${pkg}/dist/esm/index.mjs`;
      return map;
    }, {})),
    'i18next': '/base/node_modules/i18next/dist/esm/i18next.js',
    'rxjs': '/base/node_modules/rxjs/_esm5/index.js',
    'rxjs/operators': '/base/node_modules/rxjs/_esm5/operators/index.js',
    'tslib': '/base/node_modules/tslib/tslib.es6.js',
    ...([
      'typeof',
      'objectSpread',
      'classCallCheck',
      'createClass',
      'possibleConstructorReturn',
      'getPrototypeOf',
      'assertThisInitialized',
      'inherits',
      'toConsumableArray',
      'slicedToArray',
    ].reduce((map, babelHelper) => {
      map[`@babel/runtime/helpers/esm/${babelHelper}`]
        = `/base/node_modules/@babel/runtime/helpers/esm/${babelHelper}.js`;
      map[`@babel/runtime/${babelHelper}`]
        = `/base/node_modules/@babel/runtime/helpers/esm/${babelHelper}.js`;
      return map;
    }, {})),
    // '@babel/runtime/helpers/esm/typeof': '/base/node_modules/@babel/runtime/esm/typeof.js',
    // '@babel/runtime/helpers/esm/objectSpread': '/base/node_modules/@babel/runtime/esm/objectSpread.js',
    // '@babel/runtime/helpers/esm/classCallCheck': '/base/node_modules/@babel/runtime/esm/classCallCheck.js',
    // '@babel/runtime/helpers/esm/createClass': '/base/node_modules/@babel/runtime/esm/createClass.js',
    // '@babel/runtime/helpers/esm/possibleConstructorReturn': '/base/node_modules/@babel/runtime/esm/possibleConstructorReturn.js',
    // '@babel/runtime/helpers/esm/getPrototypeOf': '/base/node_modules/@babel/runtime/esm/getPrototypeOf.js',
    // '@babel/runtime/helpers/esm/assertThisInitialized': '/base/node_modules/@babel/runtime/esm/assertThisInitialized.js',
    // '@babel/runtime/helpers/esm/inherits': '/base/node_modules/@babel/runtime/esm/inherits.js',
    // '@babel/runtime/helpers/esm/toConsumableArray': '/base/node_modules/@babel/runtime/esm/toConsumableArray.js',
    // '@babel/runtime/helpers/esm/slicedToArray': '/base/node_modules/@babel/runtime/esm/slicedToArray.js',
  }
})}</script>`);
