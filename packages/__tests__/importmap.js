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
    'router',
    'testing',
    'validation',
    'validation-html',
    'validation-i18n',
  ].reduce((map, pkg) => {
    map[`@aurelia/${pkg}`] = `/base/packages/${pkg}/dist/esm/index.js`;
    return map;
  }, {
    'rxjs': '/base/node_modules/rxjs/_esm5/index.js',
    'rxjs/operators': '/base/node_modules/rxjs/_esm5/operators/index.js',
  })
})}</script>`);
