import { strict as assert } from 'node:assert';
import * as path from 'node:path';
import { createMemoryFileSystem } from '@aurelia/plugin-conventions';
import au from '@aurelia/vite-plugin';

describe('vite-plugin', function () {
  // eslint-disable-next-line
  function getHook<T extends Function>(hook: T | { handler: T } | undefined): T | undefined {
    if (hook == null) return void 0;
    return typeof hook === 'function' ? hook : hook.handler;
  }

  function createFixture(rootName: string = 'au-vite-plugin') {
    const root = path.resolve(rootName);
    const srcDir = path.join(root, 'src');
    const tsFile = path.join(srcDir, 'foo-bar.ts');
    const htmlFile = path.join(srcDir, 'foo-bar.html');
    return { root, srcDir, tsFile, htmlFile };
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
    const [, resourcePlugin] = au({
      include: '**/*.{ts,js,html}',
      fileSystem: createMemoryFileSystem({
        'src/foo-bar.html': '<template>Hello</template>',
      }, fixture.root)
    });

    const result = await getHook(resourcePlugin.transform)?.call({}, 'export class FooBar {}\n', fixture.tsFile);
    const code = typeof result === 'string' ? result : result?.code;

    assert.ok(code?.includes(`import * as __au2ViewDef from './foo-bar.html?au-view';`));
  });

  it('resolves relative ?au-view ids against the importer', function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au();
    const resolved = getHook(resourcePlugin.resolveId)?.call(
      { meta: { watchMode: false } },
      './foo-bar.html?au-view',
      fixture.tsFile,
    );

    assert.equal(resolved, `${fixture.htmlFile}?au-view`);
  });

  it('loads ?au-view as raw html from the configured file system', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({
      include: /\.(ts|js|html)$/,
      fileSystem: createMemoryFileSystem({
        [fixture.htmlFile]: '<template><div>Hello</div></template>',
      })
    });

    const result = await getHook(resourcePlugin.load)?.call({}, `${fixture.htmlFile}?au-view`);

    assert.equal(result, '<template><div>Hello</div></template>');
  });

  it('does not preprocess bare html modules in the resource transform', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({
      include: '**/*.{ts,js,html}',
      fileSystem: createMemoryFileSystem({
        'src/foo-bar.html': '<template>Hello</template>',
      }, fixture.root)
    });

    const result = await getHook(resourcePlugin.transform)?.call({}, '<template>Hello</template>', fixture.htmlFile);

    assert.equal(result, void 0);
  });

  it('compiles ?au-view during the post-phase view transform', async function () {
    const fixture = createFixture();
    const [, , viewPlugin] = au({
      include: '**/*.{ts,js,html}',
    });

    const result = await getHook(viewPlugin.transform)?.call(
      {},
      '<template><div data-probe="yes">Hello</div></template>',
      `${fixture.htmlFile}?au-view`
    );
    const code = typeof result === 'string' ? result : result?.code;

    assert.match(String(code), /export const template = "<template><div data-probe=\\"yes\\">Hello<\/div><\/template>";/);
    assert.match(String(code), /export default template;/);
  });
});
