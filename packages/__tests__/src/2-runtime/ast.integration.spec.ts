import {
  AccessScopeExpression,
  ConditionalExpression,
} from '@aurelia/runtime';
import {
  BindingMode,
  IPlatform,
  LetBinding,
  PropertyBinding,
} from '@aurelia/runtime-html';
import {
  assert,
  createContainer,
  createFixture,
  createObserverLocator,
  createScopeForTest,
} from '@aurelia/testing';

describe('2-runtime/ast.integration.spec.ts', function () {
  describe('[[AccessScope]]', function () {
    describe('PropertyBinding', function () {
      it('auto connects when evaluates', function () {
        const container = createContainer();
        const observerLocator = createObserverLocator(container);
        const accessScopeExpr = new AccessScopeExpression('name', 0);

        const source = { name: 'hello' };
        const target = { name: '' };
        const binding = new PropertyBinding(
          { state: 0 },
          container,
          observerLocator,
          {} as any,
          accessScopeExpr,
          target,
          'name',
          BindingMode.toView,
        );

        binding.bind(createScopeForTest(source));

        assert.strictEqual(target.name, 'hello');

        Array.from({ length: 5 }).forEach(idx => {
          source.name = `${idx}`;
          assert.strictEqual(target.name, `${idx}`);
        });
      });

      it('auto connects with ternary', function () {
        const container = createContainer();
        const observerLocator = createObserverLocator(container);
        const conditionalExpr = new ConditionalExpression(
          new AccessScopeExpression('checked'),
          new AccessScopeExpression('yesMessage'),
          new AccessScopeExpression('noMessage'),
        );

        const source = { checked: false, yesMessage: 'yes', noMessage: 'no' };
        const target = { value: '' };
        const scope = createScopeForTest(target, source);
        const binding = new PropertyBinding(
          { state: 0 },
          container,
          observerLocator,
          container.get(IPlatform).domWriteQueue,
          conditionalExpr,
          target,
          'value',
          BindingMode.toView,
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

        Array.from({ length: 5 }).forEach(idx => {
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
        const accessScopeExpr = new AccessScopeExpression('name', 0);

        const source = { value: '' };
        const oc = { name: 'hello' };
        const scope = createScopeForTest(source, oc);
        const binding = new LetBinding(
          container,
          observerLocator,
          accessScopeExpr,
          'value',
          true
        );

        binding.bind(scope);

        assert.strictEqual(source.value, 'hello');

        Array.from({ length: 5 }).forEach(idx => {
          oc.name = `${idx}`;
          assert.strictEqual(source.value, `${idx}`);
        });
      });

      it('auto connects with ternary', function () {
        const container = createContainer();
        const observerLocator = createObserverLocator(container);
        const conditionalExpr = new ConditionalExpression(
          new AccessScopeExpression('checked'),
          new AccessScopeExpression('yesMessage'),
          new AccessScopeExpression('noMessage'),
        );

        const source = { value: '' };
        const oc = { checked: false, yesMessage: 'yes', noMessage: 'no' };
        const scope = createScopeForTest(source, oc);
        const binding = new LetBinding(
          container,
          observerLocator,
          conditionalExpr,
          'value',
          true,
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
      const { trigger, assertText, flush } = createFixture
        .component({ items: [1, 2] })
        .html`
          <button click.trigger="items.length = 0">item count: \${items.length}</button>
        `
        .build();
      trigger.click('button');
      flush();
      assertText('button', 'item count: 0');
    });
  });

  describe('[[AccessKey]]', function () {
    it('notifies when assigning to array index', function () {
      const { trigger, assertText, flush } = createFixture
        .component({ items: [1, 2] })
        .html`
          <button click.trigger="items[1] = 0">item at [1]: \${items[1]}</button>
        `
        .build();
      trigger.click('button');
      flush();
      assertText('button', 'item at [1]: 0');
    });

    it('notifies when binding two way with array index', function () {
      const { getAllBy, type, flush } = createFixture
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
      flush();

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
