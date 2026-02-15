import { astTrack } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/ast-track-decorator.spec.ts', function () {
  it('should throw if applied to non-method', function () {
    assert.throws(() => class Test {
      // @ts-expect-error - just an assertion
      @astTrack()
      public property: string = 'test';
    });
  });

  it('should add tracking metadata to the method', function () {
    class Test {
      @astTrack()
      public method() {
        return 'test';
      }
    }

    assert.strictEqual((Test.prototype.method as any)['__astt__']?.deps, void 0);
  });

  it('tracks property reads in call scope when used in template', async function () {
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      prop1 = 'value1';
      @astTrack
      public method() {
        return this.prop1;
      }
    });

    assertText('value1');

    component.prop1 = 'value2';
    await Promise.resolve();
    assertText('value2');
  });

  it('tracks property reads in call scope when used with @astTrack()', async function () {
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      prop1 = 'value1';
      @astTrack()
      public method() {
        return this.prop1;
      }
    });

    assertText('value1');

    component.prop1 = 'value2';
    await Promise.resolve();
    assertText('value2');
  });

  it('tracks property reads in call member when used in template', async function () {
    const { component, assertText } = createFixture('<div>${obj.method().length}</div>', class App {
      prop1 = 'value1';

      obj = new (class {
        constructor(private parent: App) {}

        @astTrack
        public method() {
          return this.parent.prop1;
        }
      })(this);
    });

    assertText('6');

    component.prop1 = 'v';
    await Promise.resolve();
    assertText('1');
  });

  it('tracks property reads in call scope when used in template with nested calls', async function () {
    const { component, assertText } = createFixture('<div>${method1()}</div>', class {
      prop1 = 'value1';

      @astTrack
      public method1() {
        return this.method2();
      }
      @astTrack
      public method2() {
        return this.prop1;
      }
    });

    assertText('value1');
    component.prop1 = 'value2';
    await Promise.resolve();
    assertText('value2');
  });

  it('stops tracking when unmounted', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div if.bind="show">${method()}</div>', class {
      show = true;
      prop1 = 'value1';
      @astTrack
      public method() {
        callCount++;
        return this.prop1;
      }
    });

    assertText('value1');
    assert.strictEqual(callCount, 1);

    component.show = false;
    await Promise.resolve();
    assert.strictEqual(callCount, 1);

    component.prop1 = 'value2';
    await Promise.resolve();
    assert.strictEqual(callCount, 1);
  });

  it('tracks all property reads in call scope when used in template', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      prop1 = 'value1';
      prop2 = 'value2';
      prop3 = 'value3';

      @astTrack
      public method() {
        callCount++;
        return `${this.prop1}-${this.prop2}-${this.prop3}`;
      }
    });

    assertText('value1-value2-value3');
    assert.strictEqual(callCount, 1);

    component.prop1 = 'v1';
    await Promise.resolve();
    assertText('v1-value2-value3');
    assert.strictEqual(callCount, 2);

    component.prop2 = 'v2';
    await Promise.resolve();
    assertText('v1-v2-value3');
    assert.strictEqual(callCount, 3);

    component.prop3 = 'v3';
    await Promise.resolve();
    assertText('v1-v2-v3');
    assert.strictEqual(callCount, 4);
  });

  it('tracks parameter property reads when use proxy', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${method(obj)}</div>', class {
      prop1 = 'value1';

      obj = {
        prop1: 'obj1'
      };

      @astTrack
      public method(arg: { prop1: string }) {
        callCount++;
        return `${arg.prop1}-${this.prop1}`;
      }
    });

    assertText('obj1-value1');
    assert.strictEqual(callCount, 1);

    component.obj.prop1 = 'obj2';
    await Promise.resolve();
    assertText('obj2-value1');
    assert.strictEqual(callCount, 2);
  });

  it('does not track parameter property reads in deps mode', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${method(obj)}</div>', class {
      prop1 = 'value1';

      obj = {
        prop1: 'obj1'
      };

      @astTrack({ deps: ['prop1'] })
      public method(arg: { prop1: string }) {
        callCount++;
        return `${arg.prop1}-${this.prop1}`;
      }
    });

    assertText('obj1-value1');
    assert.strictEqual(callCount, 1);

    component.obj.prop1 = 'obj2';
    await Promise.resolve();
    assertText('obj1-value1');
    assert.strictEqual(callCount, 1);

    component.prop1 = 'value2';
    await Promise.resolve();
    assertText('obj2-value2');
    assert.strictEqual(callCount, 2);
  });

  it('tracks configured string dependency via @astTrack', async function () {
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      nested = { prop: 'value1' };

      @astTrack('nested.prop')
      public method() {
        return 'ok';
      }
    });

    assertText('ok');

    component.nested.prop = 'value2';
    await Promise.resolve();
    assertText('ok');
  });

  it('disables tracking when deps is an empty array', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      prop = 'value1';

      @astTrack({ deps: [] })
      public method() {
        callCount++;
        return this.prop;
      }
    });

    assertText('value1');
    assert.strictEqual(callCount, 1);

    component.prop = 'value2';
    await Promise.resolve();
    assertText('value1');
    assert.strictEqual(callCount, 1);
  });

  it('string dependency mode does not auto-track method reads', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      nested = { prop: 'value1' };
      unrelated = 'u1';

      @astTrack('nested.prop')
      public method() {
        callCount++;
        return `${this.unrelated}-${this.nested.prop}`;
      }
    });

    assertText('u1-value1');
    assert.strictEqual(callCount, 1);

    component.unrelated = 'u2';
    await Promise.resolve();
    assertText('u1-value1');
    assert.strictEqual(callCount, 1);

    component.nested.prop = 'value2';
    await Promise.resolve();
    assertText('u2-value2');
    assert.strictEqual(callCount, 2);
  });

  it('tracks configured function dependency via @astTrack', async function () {
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      prop = 'value1';
      prop2 = 'value2';

      @astTrack((vm: { prop: string; prop2: string }) => vm.prop + vm.prop2)
      public method() {
        return 'ok';
      }
    });

    assertText('ok');

    component.prop = 'next';
    await Promise.resolve();
    assertText('ok');
  });

  it('getter dependency mode does not auto-track method reads', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      prop = 'value1';
      prop2 = 'value2';
      unrelated = 'u1';

      @astTrack((vm: { prop: string; prop2: string }) => vm.prop + vm.prop2)
      public method() {
        callCount++;
        return `${this.unrelated}-${this.prop}-${this.prop2}`;
      }
    });

    assertText('u1-value1-value2');
    assert.strictEqual(callCount, 1);

    component.unrelated = 'u2';
    await Promise.resolve();
    assertText('u1-value1-value2');
    assert.strictEqual(callCount, 1);

    component.prop = 'next';
    await Promise.resolve();
    assertText('u2-next-value2');
    assert.strictEqual(callCount, 2);
  });

  it('supports mixed deps in options object', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${method()}</div>', class App {
      nested = { prop: 'value1' };
      prop2 = 'v2';
      unrelated = 'u1';

      @astTrack({ deps: ['nested.prop', (instance: App) => instance.prop2] })
      public method() {
        callCount++;
        return `${this.unrelated}-${this.nested.prop}-${this.prop2}`;
      }
    });

    assertText('u1-value1-v2');
    assert.strictEqual(callCount, 1);

    component.unrelated = 'u2';
    await Promise.resolve();
    assertText('u1-value1-v2');
    assert.strictEqual(callCount, 1);

    component.nested.prop = 'value2';
    await Promise.resolve();
    assertText('u2-value2-v2');
    assert.strictEqual(callCount, 2);

    component.prop2 = 'v3';
    await Promise.resolve();
    assertText('u2-value2-v3');
    assert.strictEqual(callCount, 3);
  });

  it('stacked decorators override previous deps instead of merging', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      a = 'a1';
      b = 'b1';

      @astTrack('a')
      @astTrack('b')
      public method() {
        callCount++;
        return `${this.a}-${this.b}`;
      }
    });

    assertText('a1-b1');
    assert.strictEqual(callCount, 1);

    component.b = 'b2';
    await Promise.resolve();
    assertText('a1-b1');
    assert.strictEqual(callCount, 1);

    component.a = 'a2';
    await Promise.resolve();
    assertText('a2-b2');
    assert.strictEqual(callCount, 2);
  });

});
