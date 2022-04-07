// eslint-disable-next-line
document.write(`<script type="importmap">${JSON.stringify({
  imports: [
    'aurelia',
    'platform',
    'platform-browser',
    'metadata',
    'kernel',
    'runtime',
    'runtime-html',
    'route-recognizer',
    'fetch-client',
    'store-v1',
    'i18n',
<<<<<<< HEAD
    'router',
=======
    'router-lite',
>>>>>>> local-aurelia/jwx-router-return
    'testing',
    'validation',
    'validation-html',
    'validation-i18n',
  ].reduce((map, pkg) => {
<<<<<<< HEAD
    map[`@aurelia/${pkg}`] = `/base/node_modules/@aurelia/${pkg}/dist/esm/index.js`;
    return map;
  }, {
    'aurelia-direct-router': `/base/packages/router/dist/esm/index.js`
=======
    map[`@aurelia/${pkg}`] = `/base/packages/${pkg}/dist/esm/index.js`;
    return map;
  }, {
    'rxjs': '/base/node_modules/rxjs/_esm5/index.js',
    'rxjs/operators': '/base/node_modules/rxjs/_esm5/operators/index.js',
>>>>>>> local-aurelia/jwx-router-return
  })
})}</script>`);
