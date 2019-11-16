import { DI, LoggerConfiguration, LogLevel, ColorOptions, Registration } from '@aurelia/kernel';
import { IFileSystem, NodeFileSystem, IOptions, Realm, FileKind } from '@aurelia/aot';
import { VirtualFileSystem } from './virtual-file-system';
import { assert } from '@aurelia/testing';
import { $Number } from '@aurelia/aot/dist/vm/types/number';
import { $Null } from '@aurelia/aot/dist/vm/types/null';

// NOTE: These tests are not meant to be even close to exhaustive. That's what the 262 test suite is for.
// These tests exist solely for having an easy way to quickly test some high-level things when a feature is not yet ready for exposure to the 262 test suite.

describe('AOT (smoke tests)', function () {
  async function setup(content: string) {
    const container = DI.createContainer();
    container.register(
      LoggerConfiguration.create(console, LogLevel.debug, ColorOptions.colors),
      Registration.singleton(IFileSystem, VirtualFileSystem),
      Registration.instance(IOptions, { rootDir: 'c:' }),
    );

    const realm = Realm.Create(container);
    const mod = await realm.loadFile({
      shortName: '',
      shortPath: '',
      kind: FileKind.Script,
      path: '',
      dir: '',
      rootlessPath: '',
      name: '',
      ext: '',
      async getContent() {
        return content;
      },
      getContentSync() {
        return content;
      },
    });

    return { realm, mod };
  }

  it('simple return statement with binary expression', async function () {
    const { realm, mod } = await setup(`
      return 1 + 1;
    `);

    mod.Instantiate();

    const result = mod.Evaluate();

    assert.strictEqual(result['[[Value]]'], 2);
  });

  it('simple if statement with binary expression', async function () {
    const { realm, mod } = await setup(`
      if (true) {
        return 1 + 1;
      }
    `);

    mod.Instantiate();

    const result = mod.Evaluate();

    assert.strictEqual(result['[[Value]]'], 2);
  });

  it('simple if/else statement with binary expression', async function () {
    const { realm, mod } = await setup(`
      if (false) {
        return 1 + 1;
      } else {
        return 5;
      }
    `);

    mod.Instantiate();

    const result = mod.Evaluate();

    assert.strictEqual(result['[[Value]]'], 5);
  });

  it('simple function declaration with binary expression', async function () {
    const { realm, mod } = await setup(`
      function foo() {
        return 1 + 1;
      }
      return foo();
    `);

    mod.Instantiate();

    const result = mod.Evaluate();

    assert.strictEqual(result['[[Value]]'], 2);
  });
});
