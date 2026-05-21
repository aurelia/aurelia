import { strict as assert } from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
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
});
