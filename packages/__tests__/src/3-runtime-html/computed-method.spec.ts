import { computed } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/computed-method.spec.ts', function () {
  it('should throw if applied to non-method', function () {
    assert.throws(() => class Test {
      @computed()
      public property: string = 'test';
    });
  });

  it('should add tracking metadata to the method', function () {
    class Test {
      @computed()
      public method() {
        return 'test';
      }
    }

    assert.strictEqual((Test.prototype.method as any)['__computed__']?.deps, void 0);
  });

  it('tracks property reads in call scope when used in template', async function () {
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      prop1 = 'value1';
      @computed
      public method() {
        return this.prop1;
      }
    });

    assertText('value1');

    component.prop1 = 'value2';
    await Promise.resolve();
    assertText('value2');
  });

  it('tracks property reads in call scope when used with @computed()', async function () {
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      prop1 = 'value1';
      @computed()
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

        @computed
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

      @computed
      public method1() {
        return this.method2();
      }
      @computed
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
      @computed
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

      @computed
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

      @computed
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

      @computed({ deps: ['prop1'] })
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

  it('tracks computed method reads when method is called inside getter used by template', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${value}</div>', class {
      prop1 = 'value1';

      @computed
      public method() {
        callCount++;
        return this.prop1;
      }

      public get value() {
        return this.method();
      }
    });

    assertText('value1');
    assert.strictEqual(callCount, 1);

    component.prop1 = 'value2';
    await Promise.resolve();
    assertText('value2');
    assert.strictEqual(callCount, 2);
  });

  it('tracks computed method parameter reads through getter proxy observation context', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${value}</div>', class {
      obj = {
        prop1: 'obj1'
      };

      @computed
      public method(arg: { prop1: string }) {
        callCount++;
        return arg.prop1;
      }

      public get value() {
        return this.method(this.obj);
      }
    });

    assertText('obj1');
    assert.strictEqual(callCount, 1);

    component.obj.prop1 = 'obj2';
    await Promise.resolve();
    assertText('obj2');
    assert.strictEqual(callCount, 2);
  });

  it('getter observation respects computed deps mode when calling method', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${value}</div>', class {
      prop1 = 'value1';
      unrelated = 'u1';

      @computed({ deps: ['prop1'] })
      public method() {
        callCount++;
        return `${this.prop1}-${this.unrelated}`;
      }

      public get value() {
        return this.method();
      }
    });

    assertText('value1-u1');
    assert.strictEqual(callCount, 1);

    component.unrelated = 'u2';
    await Promise.resolve();
    assertText('value1-u1');
    assert.strictEqual(callCount, 1);

    component.prop1 = 'value2';
    await Promise.resolve();
    assertText('value2-u2');
    assert.strictEqual(callCount, 2);
  });

  it('getter observation respects computed function deps mode when calling method', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${value}</div>', class App {
      prop1 = 's1';
      prop2 = 's2';
      v = 'd1';

      @computed({ deps: (vm: App) => vm.prop2 })
      public method() {
        callCount++;
        return `${this.prop1}-${this.v}`;
      }

      public get value() {
        return this.method();
      }
    });

    assertText('s1-d1');
    assert.strictEqual(callCount, 1);

    component.v = 'd2';
    await Promise.resolve();
    assertText('s1-d1');
    assert.strictEqual(callCount, 1);

    component.prop2 = 's3';
    await Promise.resolve();
    assertText('s1-d2');
    assert.strictEqual(callCount, 2);
  });

  it('tracks configured string dependency via @computed', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      nested = { prop: 'value1' };

      @computed('nested.prop')
      public method() {
        callCount++;
        return 'ok';
      }
    });

    assertText('ok');
    assert.strictEqual(callCount, 1);

    component.nested.prop = 'value2';
    await Promise.resolve();
    assertText('ok');
    assert.strictEqual(callCount, 2);
  });

  it('disables tracking when deps is an empty array', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      prop = 'value1';

      @computed({ deps: [] })
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

  it('does not track declared dependencies during method call', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      nested = { prop: 'value1' };
      unrelated = 'u1';

      @computed('nested.prop')
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

  it('tracks configured function dependency via @computed', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      prop = 'value1';
      prop2 = 'value2';

      @computed((vm: { prop: string; prop2: string }) => vm.prop + vm.prop2)
      public method() {
        callCount++;
        return 'ok';
      }
    });

    assertText('ok');
    assert.strictEqual(callCount, 1);

    component.prop = 'next';
    await Promise.resolve();
    assertText('ok');
    assert.strictEqual(callCount, 2);
  });

  it('getter dependency mode does not auto-track method reads', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      prop = 'value1';
      prop2 = 'value2';
      unrelated = 'u1';

      @computed((vm: { prop: string; prop2: string }) => vm.prop + vm.prop2)
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

  it('stacked decorators override previous deps instead of merging', async function () {
    let callCount = 0;
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      a = 'a1';
      b = 'b1';

      @computed('a')
      @computed('b')
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
