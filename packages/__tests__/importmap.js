// eslint-disable-next-line
document.write(`<script type="importmap">${JSON.stringify({
  imports: [
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
  }, {
    'i18next': '/base/node_modules/i18next/dist/esm/i18next.js',
    'rxjs': '/base/node_modules/rxjs/_esm5/index.js',
    'rxjs/operators': '/base/node_modules/rxjs/_esm5/operators/index.js',
  })
})}</script>`);
