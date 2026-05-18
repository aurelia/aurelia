import { strict as assert } from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import au from '@aurelia/vite-plugin';

describe('vite-plugin', function () {
  // eslint-disable-next-line
  function getHook<T extends Function>(hook: T | { handler: T } | undefined): T | undefined {
    if (hook == null) return void 0;
    return typeof hook === 'function' ? hook : hook.handler;
  }

  function createFixture() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'au-vite-plugin-'));
    const srcDir = path.join(root, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    const tsFile = path.join(srcDir, 'foo-bar.ts');
    const htmlFile = path.join(srcDir, 'foo-bar.html');
    fs.writeFileSync(tsFile, 'export class FooBar {}\n', 'utf8');
    fs.writeFileSync(htmlFile, '<template>Hello</template>', 'utf8');
    return { root, srcDir, tsFile, htmlFile };
  }

  function cleanupFixture(root: string) {
    fs.rmSync(root, { recursive: true, force: true });
  }

  it('adds development condition by default for non-production mode', function () {
    const [devPlugin] = au();
    const config = { mode: 'development', resolve: { conditions: [] as string[] } };

    getHook(devPlugin.config)?.call(
      {},
      config,
      { command: 'serve', mode: 'development', isSsrBuild: false, isPreview: false }
    );

    assert.deepEqual(config.resolve.conditions, ['development']);
  });

  it('rewrites conventional html imports to ?au-view in production', async function () {
      const fixture = createFixture();
    try {
      const [, auPlugin] = au({ include: '**/*.{ts,js,html}' });
      getHook(auPlugin.configResolved)?.call({}, { mode: 'production', root: fixture.root });

      const result = await getHook(auPlugin.transform)?.call({}, 'export class FooBar {}\n', fixture.tsFile);
      const code = typeof result === 'string' ? result : result?.code;

      assert.ok(code?.includes(`import * as __au2ViewDef from './foo-bar.html?au-view';`));
    } finally {
      cleanupFixture(fixture.root);
    }
  });

  it('resolves relative ?au-view ids against the importer', function () {
    const fixture = createFixture();
    try {
      const [, auPlugin] = au();
      const resolved = getHook(auPlugin.resolveId)?.call(
        { meta: { watchMode: false } },
        './foo-bar.html?au-view',
        fixture.tsFile,
      );

      assert.equal(resolved, `${fixture.htmlFile}?au-view`);
    } finally {
      cleanupFixture(fixture.root);
    }
  });

  it('loads ?au-view as a proxy module to the original html module inside root', async function () {
    const fixture = createFixture();
    try {
      const [, auPlugin] = au();
      getHook(auPlugin.configResolved)?.call({}, { mode: 'development', root: fixture.root });

      const result = await getHook(auPlugin.load)?.call({}, `${fixture.htmlFile}?au-view`);

      assert.equal(
        result,
        'export * from "/src/foo-bar.html";\nexport { default } from "/src/foo-bar.html";\n'
      );
    } finally {
      cleanupFixture(fixture.root);
    }
  });

  it('loads ?au-view as a proxy module to an /@fs html url outside root', async function () {
    const fixture = createFixture();
    try {
      const [, auPlugin] = au();
      getHook(auPlugin.configResolved)?.call(
        {},
        { mode: 'development', root: path.join(fixture.root, 'nested-root') }
      );

      const result = await getHook(auPlugin.load)?.call({}, `${fixture.htmlFile}?au-view`);
      const normalizedHtmlFile = fixture.htmlFile.replace(/\\/g, '/');

      assert.equal(
        result,
        `export * from "/@fs/${normalizedHtmlFile}";\nexport { default } from "/@fs/${normalizedHtmlFile}";\n`
      );
    } finally {
      cleanupFixture(fixture.root);
    }
  });
});
