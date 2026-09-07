import { computed, ISubscriberCollection, runTasks } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/computed-method.spec.ts', function () {
  it('should throw if applied to non-method', function () {
    assert.throws(() => class Test {
      // @ts-expect-error - should error because it's not a method
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

  for (const expression of ['model.format(item)', 'model[action](item)']) {
    for (const tracking of ['proxy', 'strings', 'function'] as const) {
      it(`preserves ${tracking} dependencies and receiver lifetime in ${expression}`, async function () {
        let callCount = 0;
        class Model {
          constructor(public label: string) {}

          @computed({
            deps: tracking === 'proxy'
              ? void 0
              : tracking === 'strings'
                ? ['label']
                : (model: Model) => model.label,
          })
          public format(item: { label: string }) {
            callCount++;
            return `${this.label}: ${item.label}`;
          }
        }

        const { component, assertText, tearDown } = createFixture(
          `<div if.bind="show">\${${expression}}</div>`,
          class {
            show = true;
            model = new Model('summary');
            action = 'format';
            item = { label: 'draft' };
          },
        );

        assertText('summary: draft');
        assert.strictEqual(callCount, 1);

        // Only proxy tracking follows reads inside parameter objects. Explicit dependencies
        // belong to the receiver and must keep the same contract for keyed calls.
        component.item.label = 'ready';
        await Promise.resolve();
        assertText(tracking === 'proxy' ? 'summary: ready' : 'summary: draft');
        assert.strictEqual(callCount, tracking === 'proxy' ? 2 : 1);

        component.model.label = 'details';
        await Promise.resolve();
        assertText('details: ready');
        assert.strictEqual(callCount, tracking === 'proxy' ? 3 : 2);

        const previous = component.model;
        component.model = new Model('replacement');
        await Promise.resolve();
        assertText('replacement: ready');
        const replacementCalls = callCount;

        previous.label = 'unused';
        await Promise.resolve();
        assertText('replacement: ready');
        assert.strictEqual(callCount, replacementCalls, 'the previous receiver is no longer observed');

        component.model.label = 'current';
        await Promise.resolve();
        assertText('current: ready');
        assert.strictEqual(callCount, replacementCalls + 1);

        component.show = false;
        await Promise.resolve();
        assertText('');

        component.model.label = 'hidden';
        component.item.label = 'hidden';
        await Promise.resolve();
        assert.strictEqual(callCount, replacementCalls + 1, 'unmounting releases the method dependencies');

        await tearDown();
      });
    }
  }

  it('replaces computed dependencies when the selected method changes', async function () {
    let callCount = 0;
    class Model {
      summary = 'summary';
      description = 'description';

      @computed
      public compact() {
        callCount++;
        return this.summary;
      }

      @computed
      public expanded() {
        callCount++;
        return this.description;
      }
    }

    const { component, assertText, tearDown } = createFixture(
      '<div>${model[action]()}</div>',
      class {
        model = new Model();
        action = 'compact';
      },
    );

    assertText('summary');
    assert.strictEqual(callCount, 1);

    component.action = 'expanded';
    await Promise.resolve();
    assertText('description');
    assert.strictEqual(callCount, 2);

    component.model.summary = 'unused';
    await Promise.resolve();
    assertText('description');
    assert.strictEqual(callCount, 2, 'the previous method dependencies are no longer observed');

    component.model.description = 'updated description';
    await Promise.resolve();
    assertText('updated description');
    assert.strictEqual(callCount, 3);

    await tearDown();
  });

  it('reconnects computed dependencies when the function at the selected key is replaced', async function () {
    let callCount = 0;
    class Model {
      summary = 'summary';
      description = 'description';
      format = this.compact;

      @computed
      public compact() {
        callCount++;
        return this.summary;
      }

      @computed
      public expanded() {
        callCount++;
        return this.description;
      }
    }

    const { component, assertText, tearDown } = createFixture(
      '<div>${model[action]()}</div>',
      class {
        model = new Model();
        action = 'format';
      },
    );

    assertText('summary');
    assert.strictEqual(callCount, 1);

    // The key and receiver stay the same: replacing a configurable formatter must
    // reconnect both the function property and the dependencies of its new value.
    component.model.format = component.model.expanded;
    await Promise.resolve();
    assertText('description');
    assert.strictEqual(callCount, 2);

    component.model.summary = 'unused';
    await Promise.resolve();
    assertText('description');
    assert.strictEqual(callCount, 2);

    component.model.description = 'updated description';
    await Promise.resolve();
    assertText('updated description');
    assert.strictEqual(callCount, 3);

    await tearDown();
  });

  for (const expression of ['method()', 'value']) {
    it(`tracks a symbol dependency through ${expression} without collecting incidental reads`, async function () {
      const status = Symbol('status');
      const incidental = Symbol('status');
      let calls = 0;
      const { component, assertText, tearDown } = createFixture(
        `\${${expression}}`,
        class {
          [status] = 'draft';
          [incidental] = 'summary';

          @computed(status)
          public method() {
            calls++;
            return `${this[status]}: ${this[incidental]}`;
          }

          public get value() {
            return this.method();
          }
        },
      );

      assertText('draft: summary');
      assert.strictEqual(calls, 1);

      // The dependency is the symbol itself, not its description. Explicit tracking
      // must also stay explicit when a getter invokes the method through a proxy.
      component[incidental] = 'details';
      runTasks();
      assertText('draft: summary');
      assert.strictEqual(calls, 1);

      component[status] = 'ready';
      runTasks();
      assertText('ready: details');
      assert.strictEqual(calls, 2);

      await tearDown();
    });
  }

  for (const expression of ['model.format()', 'model[action]()', 'value']) {
    it(`reconnects mixed symbol and string dependencies through ${expression}`, async function () {
      const status = Symbol('status');
      let calls = 0;
      class Model {
        [status] = 'draft';
        details = { label: 'summary' };

        @computed({ deps: [status, 'details.label'] })
        public format() {
          calls++;
          return `${this[status]}: ${this.details.label}`;
        }
      }

      const { component, assertText, observerLocator, tearDown } = createFixture(
        `\${${expression}}`,
        class {
          model = new Model();
          action = 'format';

          public get value() {
            return this.model.format();
          }
        },
      );
      const previous = component.model;
      const previousStatus = observerLocator.getObserver(previous, status) as unknown as ISubscriberCollection;
      const previousLabel = observerLocator.getObserver(previous.details, 'label') as unknown as ISubscriberCollection;

      assertText('draft: summary');
      assert.strictEqual(calls, 1);
      assert.strictEqual(previousStatus.subs.count, 1);
      assert.strictEqual(previousLabel.subs.count, 1);

      component.model[status] = 'ready';
      runTasks();
      assertText('ready: summary');
      assert.strictEqual(calls, 2);

      component.model.details.label = 'details';
      runTasks();
      assertText('ready: details');
      assert.strictEqual(calls, 3);

      component.model = new Model();
      runTasks();
      assertText('draft: summary');
      assert.strictEqual(calls, 4);
      assert.strictEqual(previousStatus.subs.count, 0, 'replacement releases the previous symbol dependency');
      assert.strictEqual(previousLabel.subs.count, 0, 'replacement releases the previous string dependency');

      previous[status] = 'unused';
      previous.details.label = 'unused';
      runTasks();
      assertText('draft: summary');
      assert.strictEqual(calls, 4);

      component.model[status] = 'current';
      runTasks();
      assertText('current: summary');
      assert.strictEqual(calls, 5);

      const currentStatus = observerLocator.getObserver(component.model, status) as unknown as ISubscriberCollection;
      const currentLabel = observerLocator.getObserver(component.model.details, 'label') as unknown as ISubscriberCollection;
      await tearDown();
      assert.strictEqual(currentStatus.subs.count, 0, 'unbind releases the symbol dependency');
      assert.strictEqual(currentLabel.subs.count, 0, 'unbind releases the string dependency');

      component.model[status] = 'stopped';
      component.model.details.label = 'stopped';
      runTasks();
      assert.strictEqual(calls, 5);
    });
  }

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
