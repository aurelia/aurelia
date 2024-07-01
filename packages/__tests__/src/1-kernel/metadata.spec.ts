import { Metadata } from '@aurelia/metadata';
import { assert } from '@aurelia/testing';

describe('1-kernel/metadata.spec.ts', function () {
  it('defines metadata for every type - static block - explicit class name', function () {
    class Parent {
      static {
        Metadata.define('parent', Parent, 'foo');
      }
    }
    class Child extends Parent {
      static {
        Metadata.define('child', Child, 'foo');
      }
    }

    assert.strictEqual(Metadata.get('foo', Parent), 'parent', 'parent');
    assert.strictEqual(Metadata.get('foo', Child), 'child', 'child');
  });

  it('defines metadata for every type - static block - this', function () {
    class Parent {
      static {
        Metadata.define('parent', this, 'foo');
      }
    }
    class Child extends Parent {
      static {
        Metadata.define('child', this, 'foo');
      }
    }

    assert.strictEqual(Metadata.get('foo', Parent), 'parent', 'parent');
    assert.strictEqual(Metadata.get('foo', Child), 'child', 'child');
  });

  it('defines metadata for every type - without static block - parent then child', function () {
    class Parent { }
    class Child extends Parent { }
    Metadata.define('parent', Parent, 'foo');
    Metadata.define('child', Child, 'foo');

    assert.strictEqual(Metadata.get('foo', Parent), 'parent', 'parent');
    assert.strictEqual(Metadata.get('foo', Child), 'child', 'child');
  });

  it('defines metadata for every type - without static block - child then parent', function () {
    class Parent { }
    class Child extends Parent { }
    Metadata.define('parent', Parent, 'foo');
    Metadata.define('child', Child, 'foo');

    assert.strictEqual(Metadata.get('foo', Parent), 'parent', 'parent');
    assert.strictEqual(Metadata.get('foo', Child), 'child', 'child');
  });
});
