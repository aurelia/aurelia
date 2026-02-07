import { astTracked } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';

describe('ast-tracked-decorator.spec.ts', function () {
  it('should throw if applied to non-method', function () {
    assert.throws(() => class Test {
      // @ts-expect-error - just an assertion
      @astTracked()
      public property: string = 'test';
    });
  });

  it('should add tracking metadata to the method', function () {
    class Test {
      @astTracked({ useProxy: true })
      public method() {
        return 'test';
      }
    }

    assert.strictEqual((Test.prototype.method as any)['__astt__']?.useProxy, true);
  });

  it('tracks property reads in call scope when used in template', async function () {
    const { component, assertText } = createFixture('<div>${method()}</div>', class {
      prop1 = 'value1';
      @astTracked({ useProxy: true })
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

        @astTracked({ useProxy: true })
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

      @astTracked({ useProxy: true })
      public method1() {
        return this.method2();
      }
      @astTracked({ useProxy: true })
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
      @astTracked({ useProxy: true })
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

      @astTracked({ useProxy: true })
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
});
