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
    const htmlModuleFile = path.join(srcDir, 'foo-bar.html.au.ts');
    return { root, srcDir, tsFile, htmlFile, htmlModuleFile };
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

  it('rewrites conventional html imports to .html.au.ts in production', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({
      include: '**/*.{ts,js,html}',
      fileSystem: createMemoryFileSystem({
        'src/foo-bar.html': '<template>Hello</template>',
      }, fixture.root)
    });

    const result = await getHook(resourcePlugin.transform)?.call({}, 'export class FooBar {}\n', fixture.tsFile);
    const code = typeof result === 'string' ? result : result?.code;

    assert.ok(code?.includes(`import * as __au2ViewDef from './foo-bar.html.au.ts';`));
  });

  it('resolves relative .html.au.ts ids against the importer', function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au();
    const resolved = getHook(resourcePlugin.resolveId)?.call(
      { meta: { watchMode: false } },
      './foo-bar.html.au.ts',
      fixture.tsFile,
    );

    assert.equal(resolved, fixture.htmlModuleFile);
  });

  it('loads .html.au.ts from the configured file system using the source html path', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({
      include: /\.(ts|js|html)$/,
      fileSystem: createMemoryFileSystem({
        [fixture.htmlFile]: '<template><div>Hello</div></template>',
      })
    });

    const result = await getHook(resourcePlugin.load)?.call({}, fixture.htmlModuleFile);

    assert.equal(result, '<template><div>Hello</div></template>');
  });

  it('strips metadata from bare html modules during the resource transform', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({
      include: '**/*.{ts,js,html}',
    });

    const result = await getHook(resourcePlugin.transform)?.call(
      {},
      '<import from="./dep.html"></import><bindable name="message"></bindable><template bindable="title"><div>Hello</div></template>',
      fixture.htmlFile
    );

    assert.equal(result, '<template ><div>Hello</div></template>');
  });

  it('compiles .html.au.ts as an aurelia view module that imports the clean html', async function () {
    const fixture = createFixture();
    const [, resourcePlugin] = au({
      include: '**/*.{ts,js,html}',
    });

    const result = await getHook(resourcePlugin.transform)?.call(
      {},
      '<import from="./dep.html"></import><bindable name="message"></bindable><template><div>Hello</div></template>',
      fixture.htmlModuleFile
    );
    const code = typeof result === 'string' ? result : result?.code;

    assert.match(String(code), /import \* as __au2Template from "\.\/foo-bar\.html";/);
    assert.match(String(code), /import \* as d0 from "\.\/dep\.html\.au\.ts";/);
    assert.match(String(code), /export const template = __au2Template\.default;/);
    assert.match(String(code), /export const bindables = \{"message":\{"name":"message"\}\};/);
  });

  it('wraps bare html as a default string export during the post-phase html transform', async function () {
    const fixture = createFixture();
    const [, , htmlModulePlugin] = au({
      include: '**/*.{ts,js,html}',
    });

    const result = await getHook(htmlModulePlugin.transform)?.call(
      {},
      '<template><div data-probe="yes">Hello</div></template>',
      fixture.htmlFile
    );

    assert.equal(result, 'export default "<template><div data-probe=\\"yes\\">Hello</div></template>";\n');
  });
});
