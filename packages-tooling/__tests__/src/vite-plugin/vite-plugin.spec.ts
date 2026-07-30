import { strict as assert } from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { build as viteBuild } from 'vite';
import au from '@aurelia/vite-plugin';

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

  function createConfig(mode: string) {
    return {
      mode,
      resolve: { alias: [], dedupe: [], conditions: [] },
    } as unknown as import('vite').UserConfig;
  }

  function createPluginContext() {
    return {
      meta: { watchMode: false },
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
        '</template>',
      ].join('\n'),
      'utf8'
    );

    try {
      getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('production'));
      const result = await getHook(resourcePlugin.load)?.call(createPluginContext(), fixture.htmlFile.replace(/\.html$/, '.$au.ts'));
      const code = typeof result === 'string' ? result : result?.code;

      assert.match(String(code), /import __auViteAsset0 from "\.\/logo\.png";/);
      assert.match(String(code), /import __auViteAsset1 from "\.\.\/shared\/shared-logo\.png";/);
      assert.match(String(code), /import __auViteAsset2 from "\.\/nested\/nested-logo\.png";/);
      assert.match(String(code), /import __auViteAsset3 from "\.\/larger\.png";/);
      assert.match(String(code), /export const template = .*__auViteAsset0.*__auViteAsset1.*__auViteAsset2.*__auViteAsset0.*__auViteAsset3/s);
      assert.match(String(code), /src\.bind=\\"dynamicLogo\\"/);
      assert.match(String(code), /src=\\"\/public-logo\.png\\"/);
      assert.match(String(code), /src=\\"\.\/missing\.png\\"/);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('imports Vue-style static template asset attributes during production builds', async function () {
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
        '</template>',
      ].join('\n'),
      'utf8'
    );

    try {
      getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('production'));
      const result = await getHook(resourcePlugin.load)?.call(createPluginContext(), fixture.htmlFile.replace(/\.html$/, '.$au.ts'));
      const code = typeof result === 'string' ? result : result?.code;

      assert.match(String(code), /import __auViteAsset0 from "\.\/clip\.mp4";/);
      assert.match(String(code), /import __auViteAsset1 from "\.\/poster\.png";/);
      assert.match(String(code), /import __auViteAsset2 from "\.\/source\.webm";/);
      assert.match(String(code), /import __auViteAsset3 from "\.\/source-2x\.webm";/);
      assert.match(String(code), /import __auViteAsset4 from "\.\/image\.svg";/);
      assert.match(String(code), /import __auViteAsset5 from "\.\/symbol\.svg";/);
      assert.match(String(code), /export const template = .*__auViteAsset0.*__auViteAsset1.*__auViteAsset2.*__auViteAsset2.*__auViteAsset3.*__auViteAsset4.*__auViteAsset4.*__auViteAsset5.*__auViteAsset5/s);
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
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
      await viteBuild({
        root: fixture.root,
        configFile: false,
        logLevel: 'silent',
        build: {
          assetsInlineLimit: 0,
          minify: false,
        },
        plugins: au() as unknown as import('vite').PluginOption[],
      });

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
        '<img vite-ignore src="./ignored.png">',
        '<img src="/public-logo.png">',
        '<img src="https://example.com/logo.png">',
        '<img src="//example.com/logo.png">',
        '<img src="data:image/png;base64,AA==">',
        '<img src="#symbol">',
        '<img src="${logoUrl}">',
        '</template>',
      ].join('\n'),
      'utf8'
    );

    try {
      getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('production'));
      const result = await getHook(resourcePlugin.load)?.call(createPluginContext(), fixture.htmlFile.replace(/\.html$/, '.$au.ts'));
      const code = String(typeof result === 'string' ? result : result?.code);

      assert.doesNotMatch(code, /__auViteAsset/);
      assert.match(code, /src=\\"\.\/ignored\.png\\"/);
      assert.match(code, /src=\\"\/public-logo\.png\\"/);
      assert.match(code, /src=\\"https:\/\/example\.com\/logo\.png\\"/);
      assert.match(code, /src=\\"\/\/example\.com\/logo\.png\\"/);
      assert.match(code, /src=\\"data:image\/png;base64,AA==\\"/);
      assert.match(code, /src=\\"#symbol\\"/);
      assert.ok(code.includes('src=\\"${logoUrl}\\"'));
    } finally {
      fs.rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it('does not import static relative template assets during dev server transforms', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({ include: /\.(ts|js|html)$/ });

    fs.mkdirSync(fixture.srcDir, { recursive: true });
    fs.writeFileSync(path.join(fixture.srcDir, 'logo.png'), 'logo', 'utf8');
    fs.writeFileSync(fixture.htmlFile, '<img src="./logo.png" alt="Logo">', 'utf8');

    try {
      getHook(resourcePlugin.configResolved)?.call({}, createResolvedConfig('development', 'serve'));
      const result = await getHook(resourcePlugin.transform)?.call({}, '<img src="./logo.png" alt="Logo">', fixture.htmlFile);
      const code = typeof result === 'string' ? result : result?.code;

      assert.doesNotMatch(String(code), /__auViteAsset/);
      assert.match(String(code), /export const template = "<img src=\\"\.\/logo\.png\\" alt=\\"Logo\\">";/);
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
