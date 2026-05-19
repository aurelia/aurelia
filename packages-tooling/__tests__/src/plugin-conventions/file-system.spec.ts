import * as path from 'path';
import { createMemoryFileSystem } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';

describe('memory file system', function () {
  it('resolves relative paired files from the unit path', function () {
    const root = path.resolve('virtual-root');
    const sut = createMemoryFileSystem({
      'src/foo-bar.html': '<template>Hello</template>',
      'src/foo-bar.css': '.foo {}',
      'src/dep.ts': 'export const dep = 1;',
    }, root);
    const unit = {
      base: root,
      path: path.join('src', 'foo-bar.ts'),
      contents: 'export class FooBar {}',
    };

    assert.equal(sut.exists(unit, './foo-bar.html'), true);
    assert.equal(sut.exists(unit, './foo-bar.css'), true);
    assert.equal(sut.exists(unit, './dep.ts'), true);
    assert.equal(sut.read(unit, './foo-bar.html'), '<template>Hello</template>');
  });

  it('supports absolute memory file entries', function () {
    const htmlPath = path.resolve('absolute-root', 'src', 'foo-bar.html');
    const sut = createMemoryFileSystem({
      [htmlPath]: '<template>Absolute</template>',
    });
    const unit = {
      path: path.resolve('absolute-root', 'src', 'foo-bar.ts'),
      contents: 'export class FooBar {}',
    };

    assert.equal(sut.exists(unit, './foo-bar.html'), true);
    assert.equal(sut.read(unit, './foo-bar.html'), '<template>Absolute</template>');
  });
});
