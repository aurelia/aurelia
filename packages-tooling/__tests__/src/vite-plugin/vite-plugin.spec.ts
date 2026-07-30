import { strict as assert } from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import au, { cssInjectPlugin } from '@aurelia/vite-plugin';

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

  function runCssInject(plugin = cssInjectPlugin()) {
    const bundle = {
      'assets/app.css': {
        type: 'asset',
        source: '.app { color: red; }',
      },
      'assets/ignored.txt': {
        type: 'asset',
        source: 'ignored',
      },
      'main.js': {
        type: 'chunk',
        isEntry: true,
        code: 'console.log("main");',
      },
      'lazy.js': {
        type: 'chunk',
        isEntry: false,
        code: 'console.log("lazy");',
      },
    } as Record<string, any>;

    getHook(plugin.generateBundle as any)?.call({}, {}, bundle, false);

    return {
      bundle,
      entryCode: bundle['main.js'].code as string,
      lazyCode: bundle['lazy.js'].code as string,
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

  it('adds the css injection plugin when configured', function () {
    const plugins = au({ cssInject: true });

    assert.equal(plugins.length, 3);
    assert.equal(plugins[2].name, 'aurelia:css-inject');
  });

  it('injects css assets into entry chunks and removes the emitted css assets', function () {
    const { bundle, entryCode, lazyCode } = runCssInject();

    assert.equal(bundle['assets/app.css'], void 0);
    assert.notEqual(bundle['assets/ignored.txt'], void 0);
    assert.match(entryCode, /style\.textContent = "\.app \{ color: red; \}";/);
    assert.match(entryCode, /const target = document\.head;/);
    assert.match(entryCode, /target\.appendChild\(style\);/);
    assert.equal(lazyCode, 'console.log("lazy");');
  });

  it('can inject css into a configured document selector', function () {
    const { entryCode } = runCssInject(cssInjectPlugin({ injectSelector: 'my-app' }));

    assert.match(entryCode, /const target = document\.querySelector\("my-app"\);/);
    assert.doesNotMatch(entryCode, /document\.head/);
  });

  it('can inject css into an open shadow root through a configured selector', function () {
    const { entryCode } = runCssInject(cssInjectPlugin({ injectSelector: 'my-app#shadowRoot' }));

    assert.match(entryCode, /const host = document\.querySelector\("my-app"\);/);
    assert.match(entryCode, /const target = host == null \? null : host\.shadowRoot;/);
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
