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
