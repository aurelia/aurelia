import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { runInNewContext } from 'node:vm';
import au from '@aurelia/vite-plugin';
import { JSDOM } from 'jsdom';

describe('vite-plugin', function () {
  function getHook<T extends Function>(hook: T | { handler: T } | undefined): T | undefined {
    if (hook == null) return void 0;
    return typeof hook === 'function' ? hook : hook.handler;
  }

  function createFixture() {
    const root = fs.mkdtempSync(path.join(fs.realpathSync.native(path.resolve('.')), '.tmp-au-vite-plugin-'));
    const srcDir = path.join(root, 'src');
    const tsFile = path.join(srcDir, 'foo-bar.ts');
    const htmlFile = path.join(srcDir, 'foo-bar.html');
    return { root, srcDir, tsFile, htmlFile };
  }

  function createResolvedConfig(mode: string, command: 'build' | 'serve' = 'build') {
    return {
      mode,
      command,
      root: path.resolve('.'),
      base: '/',
      publicDir: '',
      cacheDir: '',
      resolve: { alias: [], dedupe: [], conditions: [] },
      plugins: [],
      server: {},
      build: {},
      preview: {},
      optimizeDeps: {},
      env: {},
      assetsInclude: () => false,
      logger: {} as import('vite').Logger,
      packageCache: new Map(),
      worker: { format: 'es', plugins: [] },
      appType: 'spa',
      experimental: {},
      ssr: {},
      isWorker: false,
      mainConfig: null,
      isProduction: command === 'build',
      commandLine: {},
      configFile: void 0,
      configFileDependencies: [],
      inlineConfig: {},
      envDir: path.resolve('.'),
      envFile: false,
    } as unknown as import('vite').ResolvedConfig;
  }

  function createConfig(mode?: string) {
    return {
      ...(mode === void 0 ? {} : { mode }),
      resolve: { alias: [], dedupe: [], conditions: [] },
    } as unknown as import('vite').UserConfig;
  }

  function createConfigEnv(mode: string, command: 'build' | 'serve' = 'build') {
    return {
      mode,
      command,
      isSsrBuild: false,
      isPreview: false,
    } as import('vite').ConfigEnv;
  }

  function createPluginContext() {
    const warnings: string[] = [];
    return {
      warnings,
      meta: { watchMode: false },
      warn(message: string) {
        warnings.push(message);
      },
      error(message: string): never {
        throw new Error(message);
      },
      async resolve(id: string) {
        return { id: `/resolved/${id}` };
      },
    };
  }

  it('does not mutate global resolve conditions when useDev is enabled', function () {
    const [devPlugin] = au({ useDev: true });
    const config = createConfig('development');

    getHook(devPlugin.config)?.call({}, config);

    assert.deepEqual(config.resolve?.conditions, []);
  });

  it('rewrites root Aurelia package imports to the development subpath when useDev is enabled', async function () {
    const [devPlugin, resourcePlugin] = au({ useDev: true });
    getHook(devPlugin.config)?.call({}, createConfig('development'));

    const resolved = await getHook(resourcePlugin.resolveId)?.call(createPluginContext(), '@aurelia/kernel', '/src/app.ts', {});
    assert.equal(resolved, '/resolved/@aurelia/kernel/development');
  });

  it('does not rewrite non-Aurelia or subpath imports when useDev is enabled', async function () {
    const [devPlugin, resourcePlugin] = au({ useDev: true });
    getHook(devPlugin.config)?.call({}, createConfig('development'));

    const pluginContext = createPluginContext();
    const thirdParty = await getHook(resourcePlugin.resolveId)?.call(pluginContext, 'typesense', '/src/app.ts', {});
    const subpath = await getHook(resourcePlugin.resolveId)?.call(pluginContext, '@aurelia/router/lite', '/src/app.ts', {});

    assert.equal(thirdParty, null);
    assert.equal(subpath, null);
  });

  it('does not rewrite Aurelia package imports for production builds when config.mode is omitted', async function () {
    const [devPlugin, resourcePlugin] = au();
    getHook(devPlugin.config)?.call({}, createConfig(), createConfigEnv('production'));

    const resolved = await getHook(resourcePlugin.resolveId)?.call(createPluginContext(), '@aurelia/kernel', '/src/app.ts', {});
    assert.equal(resolved, null);
  });

  it('rewrites conventional html imports for literal production mode', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({ include: /\.(ts|js|html)$/ });

    fs.mkdirSync(fixture.srcDir, { recursive: true });
    fs.writeFileSync(fixture.htmlFile, '<template>Hello</template>', 'utf8');

    try {
      getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('production'));
      const result = await getHook(resourcePlugin.transform)?.call({}, 'export class FooBar {}\n', fixture.tsFile);
      const code = typeof result === 'string' ? result : result?.code;

      assert.match(String(code), /import \* as __au2ViewDef from '\.\/foo-bar\.\$au\.ts';/);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('rewrites conventional html imports for build mode even when the mode name is custom', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({ include: /\.(ts|js|html)$/ });

    fs.mkdirSync(fixture.srcDir, { recursive: true });
    fs.writeFileSync(fixture.htmlFile, '<template>Hello</template>', 'utf8');

    try {
      getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('prod'));
      const result = await getHook(resourcePlugin.transform)?.call({}, 'export class FooBar {}\n', fixture.tsFile);
      const code = typeof result === 'string' ? result : result?.code;

      assert.match(String(code), /import \* as __au2ViewDef from '\.\/foo-bar\.\$au\.ts';/);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('imports static relative template assets during production builds', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({ include: /\.(ts|js|html)$/ });

    fs.mkdirSync(fixture.srcDir, { recursive: true });
    fs.mkdirSync(path.join(fixture.srcDir, 'nested'), { recursive: true });
    fs.mkdirSync(path.join(fixture.root, 'shared'), { recursive: true });
    fs.writeFileSync(path.join(fixture.srcDir, 'logo.png'), 'logo', 'utf8');
    fs.writeFileSync(path.join(fixture.srcDir, 'larger.png'), 'larger', 'utf8');
    fs.writeFileSync(path.join(fixture.srcDir, 'nested', 'nested-logo.png'), 'nested-logo', 'utf8');
    fs.writeFileSync(path.join(fixture.root, 'shared', 'shared-logo.png'), 'shared-logo', 'utf8');
    fs.writeFileSync(
      fixture.htmlFile,
      [
        '<template>',
        '<img src="./logo.png" alt="Logo">',
        '<img src="../shared/shared-logo.png" alt="Shared logo">',
        '<img src="nested/nested-logo.png" alt="Nested logo">',
        '<img srcset="./logo.png 1x, ./larger.png 2x">',
        '<img src.bind="dynamicLogo">',
        '<img src="/public-logo.png">',
        '<img src="./missing.png">',
        '<img src="./missing.png?size=2">',
        '</template>',
      ].join('\n'),
      'utf8'
    );

    try {
      getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('production'));
      const context = createPluginContext();
      const result = await getHook(resourcePlugin.load)?.call(context, fixture.htmlFile.replace(/\.html$/, '.$au.ts'));
      const code = typeof result === 'string' ? result : result?.code;

      assert.match(String(code), /import __auViteAsset0 from "\.\/logo\.png\?url";/);
      assert.match(String(code), /import __auViteAsset1 from "\.\.\/shared\/shared-logo\.png\?url";/);
      assert.match(String(code), /import __auViteAsset2 from "\.\/nested\/nested-logo\.png\?url";/);
      assert.match(String(code), /import __auViteAsset3 from "\.\/larger\.png\?url";/);
      assert.match(String(code), /export const template = .*__auViteAsset0.*__auViteAsset1.*__auViteAsset2.*__auViteAsset0.*__auViteAsset3/s);
      assert.match(String(code), /src\.bind=\\"dynamicLogo\\"/);
      assert.match(String(code), /src=\\"\/public-logo\.png\\"/);
      assert.match(String(code), /src=\\"\.\/missing\.png\\"/);
      assert.match(String(code), /src=\\"\.\/missing\.png\?size=2\\"/);
      assert.deepEqual(context.warnings, [
        `Unable to resolve template asset "./missing.png" referenced by ${JSON.stringify(fixture.htmlFile)}. The URL will be left unchanged.`,
      ]);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('processes assets after a string transformHtml result', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({
      include: /\.(ts|js|html)$/,
      transformHtml: (html, unit) => {
        assert.equal(unit.path, fixture.htmlFile);
        return html.replace('</template>', '<img src="./logo.png"></template>');
      },
    });

    fs.mkdirSync(fixture.srcDir, { recursive: true });
    fs.writeFileSync(path.join(fixture.srcDir, 'logo.png'), 'logo', 'utf8');
    fs.writeFileSync(fixture.htmlFile, '<template></template>', 'utf8');

    try {
      getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('production'));
      const result = await getHook(resourcePlugin.load)?.call(createPluginContext(), fixture.htmlFile.replace(/\.html$/, '.$au.ts'));
      const code = typeof result === 'string' ? result : result?.code;

      assert.match(String(code), /import __auViteAsset0 from "\.\/logo\.png\?url";/);
      assert.match(String(code), /export const template = .*__auViteAsset0/s);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('imports Vite asset source attributes during production builds', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({ include: /\.(ts|js|html)$/ });

    fs.mkdirSync(fixture.srcDir, { recursive: true });
    [
      'clip.mp4',
      'poster.png',
      'source.webm',
      'source-2x.webm',
      'image.svg',
      'symbol.svg',
      'audio.mp3',
      'embed.svg',
      'input.png',
      'link.png',
      'link-2x.png',
      'object.pdf',
      'track.vtt',
      'meta-name.png',
      'meta-property.png',
      'non-asset-meta.png',
    ].forEach(file => fs.writeFileSync(path.join(fixture.srcDir, file), file, 'utf8'));
    fs.writeFileSync(
      fixture.htmlFile,
      [
        '<template>',
        '<video src="./clip.mp4" poster="./poster.png">',
        '  <source src="./source.webm" srcset="./source.webm 1x, ./source-2x.webm 2x">',
        '</video>',
        '<svg>',
        '  <image href="./image.svg" xlink:href="./image.svg"></image>',
        '  <use href="./symbol.svg" xlink:href="./symbol.svg"></use>',
        '</svg>',
        '<audio src="./audio.mp3"></audio>',
        '<embed src="./embed.svg">',
        '<input type="image" src="./input.png">',
        '<link rel="icon" href="./link.png" imagesrcset="./link.png 1x, ./link-2x.png 2x">',
        '<object data="./object.pdf"></object>',
        '<track src="./track.vtt">',
        '<meta name="twitter:image" content="./meta-name.png">',
        '<meta property="og:image" content="./meta-property.png">',
        '<meta name="description" content="./non-asset-meta.png">',
        '</template>',
      ].join('\n'),
      'utf8'
    );

    try {
      getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('production'));
      const result = await getHook(resourcePlugin.load)?.call(createPluginContext(), fixture.htmlFile.replace(/\.html$/, '.$au.ts'));
      const code = typeof result === 'string' ? result : result?.code;

      assert.match(String(code), /import __auViteAsset0 from "\.\/clip\.mp4\?url";/);
      assert.match(String(code), /import __auViteAsset1 from "\.\/poster\.png\?url";/);
      assert.match(String(code), /import __auViteAsset2 from "\.\/source\.webm\?url";/);
      assert.match(String(code), /import __auViteAsset3 from "\.\/source-2x\.webm\?url";/);
      assert.match(String(code), /import __auViteAsset4 from "\.\/image\.svg\?url";/);
      assert.match(String(code), /import __auViteAsset5 from "\.\/symbol\.svg\?url";/);
      assert.match(String(code), /import __auViteAsset6 from "\.\/audio\.mp3\?url";/);
      assert.match(String(code), /import __auViteAsset7 from "\.\/embed\.svg\?url";/);
      assert.match(String(code), /import __auViteAsset8 from "\.\/input\.png\?url";/);
      assert.match(String(code), /import __auViteAsset9 from "\.\/link\.png\?url";/);
      assert.match(String(code), /import __auViteAsset10 from "\.\/link-2x\.png\?url";/);
      assert.match(String(code), /import __auViteAsset11 from "\.\/object\.pdf\?url";/);
      assert.match(String(code), /import __auViteAsset12 from "\.\/track\.vtt\?url";/);
      assert.match(String(code), /import __auViteAsset13 from "\.\/meta-name\.png\?url";/);
      assert.match(String(code), /import __auViteAsset14 from "\.\/meta-property\.png\?url";/);
      assert.doesNotMatch(String(code), /import .*non-asset-meta/);
      assert.match(String(code), /content=\\"\.\/non-asset-meta\.png\\"/);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  describe('template asset attribute values', function () {
    async function transform(html: string, urls: string[], onMissing: 'ignore' | 'error' = 'error') {
      const fixture = createFixture();
      fs.mkdirSync(fixture.srcDir, { recursive: true });
      for (const file of [
        'logo.svg', 'wide image.svg', 'percent%icon.svg', 'icons,large.svg', 'icon#wide.svg',
        'theme.css', 'manifest.json', 'document.html',
      ]) {
        fs.writeFileSync(path.join(fixture.srcDir, file), '', 'utf8');
      }
      try {
        fs.writeFileSync(fixture.htmlFile, html, 'utf8');
        const [, plugin] = au({ include: /\.(ts|js|html)$/, templateAssets: { onMissing } });
        getHook(plugin.configResolved)?.call({}, createResolvedConfig('production'));
        const code = String(await getHook(plugin.load)?.call(createPluginContext(), fixture.htmlFile.replace(/\.html$/, '.$au.ts')));
        const imports = [...code.matchAll(/import (__auViteAsset\d+) from (".*");/g)];
        assert.equal(imports.length, urls.length);
        // Supply bundler URLs to the actual generated expression, then parse the HTML
        // as the runtime does. Import-string snapshots cannot detect attribute corruption.
        const template = runInNewContext(/export const template = (.*);/.exec(code)![1],
          Object.fromEntries(imports.map((match, i) => [match[1], urls[i]])));
        return { document: JSDOM.fragment(template), specifiers: imports.map(match => JSON.parse(match[2])) };
      } finally {
        fs.rmSync(fixture.root, { recursive: true, force: true });
      }
    }

    for (const quote of ['"', "'", '']) {
      it(`preserves an imported URL in a ${quote === '' ? 'bare' : quote} attribute`, async function () {
        const url = `data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%3e%3ctitle%3eA%20&amp;%20B%3c/title%3e%3c/svg%3e`;
        const { document } = await transform(`<img src=${quote}./logo.svg${quote} alt="logo">`, [url]);
        const img = document.querySelector('img')!;
        assert.equal(img.getAttribute('src'), url);
        assert.deepEqual(img.getAttributeNames(), ['src', 'alt']);
      });
    }

    it('escapes quotes and ampersands supplied by asset plugins', async function () {
      const url = '/assets/logo.svg?label="wide"&amp;variant=1';
      const { document } = await transform('<img src="./logo.svg">', [url]);
      assert.equal(document.querySelector('img')!.getAttribute('src'), url);
    });

    it('handles whitespace around the attribute assignment', async function () {
      const { document } = await transform('<img src = \n \'./logo.svg\'>', ['/assets/logo.svg']);
      assert.equal(document.querySelector('img')!.getAttribute('src'), '/assets/logo.svg');
    });

    for (const url of ['./bad%logo.svg', '?variant=1']) {
      it(`leaves ${url} unchanged when it cannot identify an asset filename`, async function () {
        const { document } = await transform(`<img src="${url}">`, []);
        assert.equal(document.querySelector('img')!.getAttribute('src'), url);
      });
    }

    for (const value of [
      'data:image/png;base64,AA== 1x, ./logo.svg 2x',
      'data:image/png;base64,AA==, ./logo.svg 2x',
      './icons,large.svg 1x, https://example.com/logo.svg 2x',
      './logo.svg, https://example.com/logo.svg 2x',
      'https://example.com/logo.svg?label=&quot;small&quot; 1x, ./logo.svg 2x',
    ]) {
      it(`preserves the candidate boundaries in srcset=${JSON.stringify(value)}`, async function () {
        const url = '/assets/bundled.svg';
        const { document } = await transform(`<img srcset="${value}">`, [url]);
        assert.equal(document.querySelector('img')!.getAttribute('srcset'), value.replace(/\.\/(?:logo|icons,large)\.svg/, url).replace(/&quot;/g, '"'));
      });
    }

    it('leaves a source set of external and data URLs unchanged', async function () {
      const value = 'data:image/png;base64,AA== 1x, https://example.com/large.svg 2x';
      const { document } = await transform(`<img srcset="${value}">`, []);
      assert.equal(document.querySelector('img')!.getAttribute('srcset'), value);
    });

    it('handles a source set ending with a descriptorless candidate', async function () {
      const { document } = await transform(
        '<img srcset="./wide%20image.svg 2x, ./logo.svg">',
        ['/assets/wide.svg', '/assets/logo.svg'],
      );
      assert.equal(document.querySelector('img')!.getAttribute('srcset'), '/assets/wide.svg 2x, /assets/logo.svg');
    });

    it('requests URLs for CSS, JSON and HTML resources', async function () {
      const { specifiers } = await transform(
        '<link rel="stylesheet" href="./theme.css"><link rel="manifest" href="./manifest.json"><object data="./document.html"></object>',
        ['/assets/theme.css', '/assets/manifest.json', '/assets/document.html'],
      );
      assert.deepEqual(specifiers, ['./theme.css?url', './manifest.json?url', './document.html?url']);
    });

    for (const [encoded, decoded] of [['wide%20image', 'wide image'], ['percent%25icon', 'percent%icon']]) {
      it(`decodes ${encoded} once and retains its query and fragment`, async function () {
        const { specifiers, document } = await transform(
          `<img src="./${encoded}.svg?variant=2#icon">`,
          [`/assets/${decoded}.svg?variant=2`],
        );
        assert.deepEqual(specifiers, [`./${decoded}.svg?url&variant=2&no-inline`]);
        assert.equal(document.querySelector('img')!.getAttribute('src'), `/assets/${decoded}.svg?variant=2#icon`);
      });
    }

    it('shares one import for different fragments of the same SVG', async function () {
      const { specifiers, document } = await transform('<svg><use href="./logo.svg#check"></use><use href="./logo.svg#close"></use></svg>', ['/assets/logo.svg']);
      assert.deepEqual(specifiers, ['./logo.svg?url&no-inline']);
      assert.deepEqual([...document.querySelectorAll('use')].map(use => use.getAttribute('href')), ['/assets/logo.svg#check', '/assets/logo.svg#close']);
    });

    for (const query of ['?url', '?no-inline', '?inline', '?raw=true']) {
      it(`preserves explicit Vite flags and ordinary query data in ${query}`, async function () {
        const { specifiers } = await transform(`<img src="./logo.svg${query}">`, ['/assets/logo.svg']);
        assert.deepEqual(specifiers, [`./logo.svg${query === '?url' ? query : `?url&${query.slice(1)}`}`]);
      });
    }

    for (const flag of ['inline', 'no-inline']) {
      it(`preserves an explicit ${flag} choice on an SVG fragment`, async function () {
        const { specifiers, document } = await transform(`<img src="./logo.svg?${flag}#check">`, ['/assets/logo.svg']);
        assert.deepEqual(specifiers, [`./logo.svg?url&${flag}`]);
        assert.equal(document.querySelector('img')!.getAttribute('src'), '/assets/logo.svg#check');
      });
    }

    for (const url of ['./icon%23wide.svg', './logo.svg?raw', './logo.svg?variant=1&raw']) {
      it(`gives actionable guidance for ${url}`, async function () {
        await assert.rejects(transform(`<img src="${url}">`, []), (error: Error) => {
          assert.ok(error.message.includes(JSON.stringify(url)));
          assert.match(error.message, /foo-bar\.html/);
          assert.match(error.message, /Rename the file|Remove "raw"/);
          return true;
        });
      });
    }

    it('preserves server-provided URLs when missing local assets are ignored', async function () {
      const { document, specifiers } = await transform('<img src="./thumbnail?raw"><img src="./remote%23icon.svg">', [], 'ignore');
      assert.deepEqual(specifiers, []);
      assert.deepEqual([...document.querySelectorAll('img')].map(img => img.getAttribute('src')), ['./thumbnail?raw', './remote%23icon.svg']);
    });

    it('preserves line breaks in authored fragments', async function () {
      const { document } = await transform('<img src="./logo.svg#logo\n">', ['/assets/logo.svg']);
      assert.equal(document.querySelector('img')!.getAttribute('src'), '/assets/logo.svg#logo\n');
    });

    it('leaves descriptor parsing to the browser without treating its tokens as URLs', async function () {
      const value = './logo.svg invalid(1, 2), https://example.com/large.svg 2x';
      const { document } = await transform(`<img srcset="${value}">`, ['/assets/logo.svg']);
      assert.equal(document.querySelector('img')!.getAttribute('srcset'), value.replace('./logo.svg', '/assets/logo.svg'));
    });
  });

  it('emits static relative template assets in Vite production builds', async function () {
    const fixture = createFixture();

    fs.mkdirSync(fixture.srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(fixture.root, 'index.html'),
      '<div id="app"></div><script type="module" src="/src/main.ts"></script>',
      'utf8'
    );
    fs.writeFileSync(
      path.join(fixture.srcDir, 'main.ts'),
      [
        'import * as view from "./foo-bar.html";',
        'console.log(view.template);',
      ].join('\n'),
      'utf8'
    );
    fs.writeFileSync(fixture.htmlFile, '<template><img id="logo" src="./logo.svg" alt="Logo"></template>', 'utf8');
    fs.writeFileSync(path.join(fixture.srcDir, 'logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'utf8');

    try {
      execFileSync(process.execPath, [
        '--input-type=module',
        '--eval',
        `import { build } from 'vite';
import au from '@aurelia/vite-plugin';
await build({
  root: process.argv[1],
  configFile: false,
  logLevel: 'silent',
  build: {
    assetsInlineLimit: 0,
    minify: false,
  },
  plugins: au(),
});`,
        fixture.root,
      ], { cwd: process.cwd(), stdio: 'pipe' });

      const distAssets = fs.readdirSync(path.join(fixture.root, 'dist', 'assets'));
      assert.ok(distAssets.some(file => /^logo-.*\.svg$/.test(file)));
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('leaves non-bundleable template asset URLs unchanged during production builds', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({ include: /\.(ts|js|html)$/ });

    fs.mkdirSync(fixture.srcDir, { recursive: true });
    fs.writeFileSync(path.join(fixture.srcDir, 'ignored.png'), 'ignored', 'utf8');
    fs.writeFileSync(
      fixture.htmlFile,
      [
        '<template>',
        '<img au-vite-ignore src="./ignored.png">',
        '<img src="/public-logo.png">',
        '<img src="https://example.com/logo.png">',
        '<img src="//example.com/logo.png">',
        '<img src="data:image/png;base64,AA==">',
        '<img src="#symbol">',
        '<img src="$' + '{logoUrl}">',
        '</template>',
      ].join('\n'),
      'utf8'
    );

    try {
      getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('production'));
      const result = await getHook(resourcePlugin.load)?.call(createPluginContext(), fixture.htmlFile.replace(/\.html$/, '.$au.ts'));
      const code = String(typeof result === 'string' ? result : result?.code);

      assert.doesNotMatch(code, /__auViteAsset/);
      assert.doesNotMatch(code, /au-vite-ignore/);
      assert.match(code, /src=\\"\.\/ignored\.png\\"/);
      assert.match(code, /src=\\"\/public-logo\.png\\"/);
      assert.match(code, /src=\\"https:\/\/example\.com\/logo\.png\\"/);
      assert.match(code, /src=\\"\/\/example\.com\/logo\.png\\"/);
      assert.match(code, /src=\\"data:image\/png;base64,AA==\\"/);
      assert.match(code, /src=\\"#symbol\\"/);
      assert.ok(code.includes('src=\\"$' + '{logoUrl}\\"'));
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('imports static relative template assets during dev server transforms', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({ include: /\.(ts|js|html)$/ });

    fs.mkdirSync(fixture.srcDir, { recursive: true });
    fs.writeFileSync(path.join(fixture.srcDir, 'logo.png'), 'logo', 'utf8');
    fs.writeFileSync(fixture.htmlFile, '<img src="./logo.png" alt="Logo">', 'utf8');

    try {
      getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('development', 'serve'));
      const result = await getHook(resourcePlugin.transform)?.call({}, '<img src="./logo.png" alt="Logo">', fixture.htmlFile);
      const code = typeof result === 'string' ? result : result?.code;

      assert.match(String(code), /import __auViteAsset0 from "\.\/logo\.png\?url";/);
      assert.match(String(code), /export const template = .*__auViteAsset0/s);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('can disable static template asset transforms', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({
      include: /\.(ts|js|html)$/,
      templateAssets: false,
    });

    fs.mkdirSync(fixture.srcDir, { recursive: true });
    fs.writeFileSync(path.join(fixture.srcDir, 'logo.png'), 'logo', 'utf8');
    fs.writeFileSync(fixture.htmlFile, '<img src="./logo.png"><img src="./missing.png">', 'utf8');

    try {
      getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('production'));
      const context = createPluginContext();
      const result = await getHook(resourcePlugin.load)?.call(context, fixture.htmlFile.replace(/\.html$/, '.$au.ts'));
      const code = typeof result === 'string' ? result : result?.code;

      assert.doesNotMatch(String(code), /__auViteAsset/);
      assert.match(String(code), /export const template = "<img src=\\"\.\/logo\.png\\"><img src=\\"\.\/missing\.png\\">";/);
      assert.deepEqual(context.warnings, []);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('can silently preserve missing relative template assets', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({
      include: /\.(ts|js|html)$/,
      templateAssets: { onMissing: 'ignore' },
    });

    fs.mkdirSync(fixture.srcDir, { recursive: true });
    fs.writeFileSync(path.join(fixture.srcDir, 'logo.png'), 'logo', 'utf8');
    fs.writeFileSync(fixture.htmlFile, '<img src="./logo.png"><img src="./missing.png">', 'utf8');

    try {
      getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('production'));
      const context = createPluginContext();
      const result = await getHook(resourcePlugin.load)?.call(context, fixture.htmlFile.replace(/\.html$/, '.$au.ts'));
      const code = String(typeof result === 'string' ? result : result?.code);

      assert.match(code, /import __auViteAsset0 from "\.\/logo\.png\?url";/);
      assert.match(code, /src=\\"\.\/missing\.png\\"/);
      assert.deepEqual(context.warnings, []);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('can fail production builds for missing relative template assets', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({
      include: /\.(ts|js|html)$/,
      templateAssets: { onMissing: 'error' },
    });

    fs.mkdirSync(fixture.srcDir, { recursive: true });
    fs.writeFileSync(fixture.htmlFile, '<img src="./missing.png">', 'utf8');

    try {
      getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('production'));
      const context = createPluginContext();

      await assert.rejects(
        getHook(resourcePlugin.load)?.call(context, fixture.htmlFile.replace(/\.html$/, '.$au.ts')),
        (error: unknown) => {
          assert.ok(error instanceof Error);
          assert.equal(error.message, `Unable to resolve template asset "./missing.png" referenced by ${JSON.stringify(fixture.htmlFile)}.`);
          return true;
        },
      );
      assert.deepEqual(context.warnings, []);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  if (process.platform === 'win32') {
    it('transforms files when Windows drive letter casing differs from cwd casing', async function () {
      const fixture = createFixture();
      const windowsId = fixture.tsFile[0].toLowerCase() + fixture.tsFile.slice(1);
      const originalCwd = process.cwd;
      let resourcePlugin!: ReturnType<typeof au>[1];

      fs.mkdirSync(fixture.srcDir, { recursive: true });
      fs.writeFileSync(fixture.htmlFile, '<template>Hello</template>', 'utf8');

      try {
        Object.defineProperty(process, 'cwd', {
          configurable: true,
          value: () => fixture.root,
        });
        [, resourcePlugin] = au({ include: 'src/**/*.{ts,js,html}' });
        getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('production'));
        const result = await getHook(resourcePlugin.transform)?.call({}, 'export class FooBar {}\n', windowsId);
        const code = typeof result === 'string' ? result : result?.code;

        assert.match(String(code), /import \* as __au2ViewDef from '\.\/foo-bar\.\$au\.ts';/);
      } finally {
        Object.defineProperty(process, 'cwd', {
          configurable: true,
          value: originalCwd,
        });
        fs.rmSync(fixture.root, { recursive: true, force: true });
      }
    });
  }
});
