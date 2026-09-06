import {
  CustomExpression,
  createAccessScopeExpression,
  createConditionalExpression,
} from '@aurelia/expression-parser';
import {
  BindingMode,
  LetBinding,
  PropertyBinding,
} from '@aurelia/runtime-html';
import { runTasks, tasksSettled } from '@aurelia/runtime';
import {
  assert,
  createContainer,
  createFixture,
  createObserverLocator,
  createScopeForTest,
} from '@aurelia/testing';

describe('2-runtime/ast.integration.spec.ts', function () {
  // well maybe should just delete these tests
  (PropertyBinding as any).mix();
  (LetBinding as any).mix();

  describe('keyed method receivers', function () {
    for (const keyed of [false, true]) {
      it(`calls a string method with its receiver (keyed=${keyed})`, async function () {
        const { component, assertText, tearDown } = createFixture(
          keyed ? '${text[method]()}' : '${text.toUpperCase()}',
          { text: 'label', method: 'toUpperCase' },
        );

        try {
          assertText('LABEL');

          component.text = 'updated';
          await tasksSettled();
          assertText('UPDATED');

          if (keyed) {
            component.method = 'toLowerCase';
            await tasksSettled();
            assertText('updated');
          }
        } finally {
          await tearDown();
        }
      });

      for (const call of [false, true]) {
        it(`dispatches an action on its model (keyed=${keyed}, call=${call})`, async function () {
          const action = keyed ? 'model[action]' : 'model.add';
          const { component, trigger, assertText, tearDown } = createFixture(
            `<button click.trigger="${action}${call ? '()' : ''}">add</button><span>\${model.items.join(',')}</span>`,
            {
              action: 'add',
              model: {
                items: [] as string[],
                add() {
                  this.items.push('item');
                },
              },
            },
          );

          try {
            trigger.click('button');
            await tasksSettled();
            assert.deepStrictEqual(component.model.items, ['item']);
            assertText('additem');
          } finally {
            await tearDown();
          }
        });
      }

      it(`observes an array method through mutations and replacement (keyed=${keyed})`, async function () {
        const { component, assertText, tearDown } = createFixture(
          keyed ? '${items[method](", ")}' : '${items.join(", ")}',
          { items: ['a'], method: 'join' },
        );

        try {
          assertText('a');

          component.items.push('b');
          await tasksSettled();
          assertText('a, b');

          component.items.splice(0, 1);
          await tasksSettled();
          assertText('b');

          const previous = component.items;
          component.items = ['c'];
          await tasksSettled();
          assertText('c');

          previous.push('old');
          component.items.push('d');
          await tasksSettled();
          assertText('c, d');
        } finally {
          await tearDown();
        }
      });

      it(`updates a filtered repeat after source changes (keyed=${keyed})`, async function () {
        const filter = keyed ? 'items[method]' : 'items.filter';
        const { component, assertText, tearDown } = createFixture(
          `<span repeat.for="item of ${filter}(item => item.visible)">\${item.label}</span>`,
          {
            items: [
              { label: 'a', visible: true },
              { label: 'b', visible: false },
            ],
            method: 'filter',
          },
        );

        try {
          assertText('a');

          component.items[1].visible = true;
          await tasksSettled();
          assertText('ab');

          component.items.push({ label: 'c', visible: true });
          await tasksSettled();
          assertText('abc');

          component.items.splice(0, 1);
          await tasksSettled();
          assertText('bc');

          component.items = [{ label: 'd', visible: true }];
          await tasksSettled();
          assertText('d');
        } finally {
          await tearDown();
        }
      });
    }
  });

  describe('[[AccessScope]]', function () {
    describe('PropertyBinding', function () {
      it('binds and unbinds a custom expression', function () {
        class TestExpression extends CustomExpression {
          public bindCallCount = 0;
          public unbindCallCount = 0;

          public override bind(): void {
            ++this.bindCallCount;
          }

          public override unbind(): void {
            ++this.unbindCallCount;
          }
        }

        const container = createContainer();
        const expression = new TestExpression('custom value');
        const target = { value: '' };
        const binding = new PropertyBinding(
          { state: 0 },
          container,
          createObserverLocator(container),
          expression,
          target,
          'value',
          BindingMode.toView,
          false,
        );

        binding.bind(createScopeForTest({}));
        assert.strictEqual(expression.bindCallCount, 1);
        assert.strictEqual(target.value, 'custom value');

        binding.unbind();
        assert.strictEqual(expression.unbindCallCount, 1);
      });

      it('auto connects when evaluates', function () {
        const container = createContainer();
        const observerLocator = createObserverLocator(container);
        const accessScopeExpr = createAccessScopeExpression('name', 0);

        const source = { name: 'hello' };
        const target = { name: '' };
        const binding = new PropertyBinding(
          { state: 0 },
          container,
          observerLocator,
          accessScopeExpr,
          target,
          'name',
          BindingMode.toView,
          false,
        );

        binding.bind(createScopeForTest(source));

        assert.strictEqual(target.name, 'hello');

        Array.from({ length: 5 }).forEach((_, idx) => {
          source.name = `${idx}`;
          assert.strictEqual(target.name, `${idx}`);
        });
      });

      it('auto connects with ternary', function () {
        const container = createContainer();
        const observerLocator = createObserverLocator(container);
        const conditionalExpr = createConditionalExpression(
          createAccessScopeExpression('checked'),
          createAccessScopeExpression('yesMessage'),
          createAccessScopeExpression('noMessage'),
        );

        const source = { checked: false, yesMessage: 'yes', noMessage: 'no' };
        const target = { value: '' };
        const scope = createScopeForTest(target, source);
        const binding = new PropertyBinding(
          { state: 0 },
          container,
          observerLocator,
          conditionalExpr,
          target,
          'value',
          BindingMode.toView,
          false,
        );

        let handleChangeCallCount = 0;
        binding.handleChange = (handleChange => {
          return function (...args: unknown[]) {
            handleChangeCallCount++;
            return handleChange.apply(this, args);
          };
        })(binding.handleChange);
        binding.bind(scope);

        assert.strictEqual(target.value, 'no');

        Array.from({ length: 5 }).forEach((_, idx) => {
          const $count = handleChangeCallCount;
          source.checked = !source.checked;
          assert.strictEqual(target.value, source.checked ? 'yes' : 'no');
          assert.strictEqual(handleChangeCallCount, $count + 1);
          if (source.checked) {
            source.yesMessage = `yes ${idx}`;
            assert.strictEqual(target.value, `yes ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // assert the binding has dropped the old observers of the inactive branch in conditional
            source.noMessage = `no ${idx}`;
            assert.strictEqual(target.value, `yes ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // revert it back for next assertion
            source.noMessage = 'no';
            assert.strictEqual(handleChangeCallCount, $count + 2);
          } else {
            source.noMessage = `no ${idx}`;
            assert.strictEqual(target.value, `no ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // assert the binding has dropped the old observers of the inactive branch in conditional
            source.yesMessage = `yes ${idx}`;
            assert.strictEqual(target.value, `no ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // revert it back to normal for next assertion
            source.yesMessage = 'yes';
            assert.strictEqual(handleChangeCallCount, $count + 2);
          }
        });
      });
    });

    describe('LetBinding', function () {
      it('auto connects when evaluates', function () {
        const container = createContainer();
        const observerLocator = createObserverLocator(container);
        const accessScopeExpr = createAccessScopeExpression('name', 0);

        const source = { value: '' };
        const oc = { name: 'hello' };
        const scope = createScopeForTest(source, oc);
        const binding = new LetBinding(
          { state: 0 },
          container,
          observerLocator,
          accessScopeExpr,
          'value',
          true,
          false,
        );

        binding.bind(scope);

        assert.strictEqual(source.value, 'hello');

        Array.from({ length: 5 }).forEach((_, idx) => {
          oc.name = `${idx}`;
          assert.strictEqual(source.value, `${idx}`);
        });
      });

      it('auto connects with ternary', function () {
        const container = createContainer();
        const observerLocator = createObserverLocator(container);
        const conditionalExpr = createConditionalExpression(
          createAccessScopeExpression('checked'),
          createAccessScopeExpression('yesMessage'),
          createAccessScopeExpression('noMessage'),
        );

        const source = { value: '' };
        const oc = { checked: false, yesMessage: 'yes', noMessage: 'no' };
        const scope = createScopeForTest(source, oc);
        const binding = new LetBinding(
          { state: 0 },
          container,
          observerLocator,
          conditionalExpr,
          'value',
          true,
          false,
        );

        let handleChangeCallCount = 0;
        binding.handleChange = (handleChange => {
          return function (...args: unknown[]) {
            handleChangeCallCount++;
            return handleChange.apply(this, args);
          };
        })(binding.handleChange);
        binding.bind(scope);

        assert.strictEqual(source.value, 'no');
        assert.strictEqual(handleChangeCallCount, 0);

        Array.from({ length: 5 }).forEach((_, idx) => {
          const $count = handleChangeCallCount;
          oc.checked = !oc.checked;
          assert.strictEqual(source.value, oc.checked ? 'yes' : 'no');
          assert.strictEqual(handleChangeCallCount, $count + 1);
          if (oc.checked) {
            oc.yesMessage = `yes ${idx}`;
            assert.strictEqual(source.value, `yes ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // assert the binding has dropped the old observers of the inactive branch in conditional
            oc.noMessage = `no ${idx}`;
            assert.strictEqual(source.value, `yes ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // revert it back for next assertion
            oc.noMessage = 'no';
            assert.strictEqual(handleChangeCallCount, $count + 2);
          } else {
            oc.noMessage = `no ${idx}`;
            assert.strictEqual(source.value, `no ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // assert the binding has dropped the old observers of the inactive branch in conditional
            oc.yesMessage = `no ${idx}`;
            assert.strictEqual(source.value, `no ${idx}`);
            assert.strictEqual(handleChangeCallCount, $count + 2);
            // revert it back for next assertion
            oc.yesMessage = 'yes';
            assert.strictEqual(handleChangeCallCount, $count + 2);
          }
        });
      });
    });
  });

  describe('[[AccessMember]]', function () {
    it('notifies when binding with .length', function () {
      const { trigger, assertText } = createFixture
        .component({ items: [1, 2] })
        .html`
          <button click.trigger="items.length = 0">item count: \${items.length}</button>
        `
        .build();
      trigger.click('button');
      runTasks();
      assertText('button', 'item count: 0');
    });
  });

  describe('[[AccessKey]]', function () {
    it('notifies when assigning to array index', function () {
      const { trigger, assertText } = createFixture
        .component({ items: [1, 2] })
        .html`
          <button click.trigger="items[1] = 0">item at [1]: \${items[1]}</button>
        `
        .build();
      trigger.click('button');
      runTasks();
      assertText('button', 'item at [1]: 0');
    });

    it('notifies when binding two way with array index', function () {
      const { getAllBy, type } = createFixture
        .component({ items: [1, 2] })
        .html`
          <button click.trigger="items[1] = 0">item at [1]: \${items[1]}</button>
          <ul>
            <li repeat.for="i of items"><input value.bind="items[$index]"/>item at \${$index}: \${items[$index]}</li>
          </ul>
        `
        .build();

      const inputs = getAllBy('input');
      type(inputs[0], '3');
      runTasks();

      assert.strictEqual(getAllBy('li')[0].textContent, 'item at 0: 3');
    });
  });

  describe('[[AccessBoundary]]', function () {
    it('retrieves binding from component boundary in single repeat', async function () {
      const { assertText } = createFixture
        .html`<div repeat.for="name of ['bar', 'baz']">(\${this.name + name})</div>`
        .component({ name: 'foo' })
        .build();

      assertText('(foobar)(foobaz)');
    });

    it('retrieves binding from component boundary in nested repeat', async function () {
      const { assertText } = createFixture
        .html`<div repeat.for="name of ['bar', 'baz']"><div repeat.for="name of ['qux']">(\${this.name + $parent.name + name})</div></div>`
        .component({ name: 'foo' })
        .build();

      assertText('(foobarqux)(foobazqux)');
    });
  });
});
