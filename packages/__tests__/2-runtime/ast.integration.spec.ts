import {
  AccessScopeExpression,
  ConditionalExpression,
  LifecycleFlags
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

        binding.$bind(LifecycleFlags.none, createScopeForTest(source));

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
        binding.$bind(LifecycleFlags.none, scope);

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

        binding.$bind(LifecycleFlags.none, scope);

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
          true
        );

        let handleChangeCallCount = 0;
        binding.handleChange = (handleChange => {
          return function (...args: unknown[]) {
            handleChangeCallCount++;
            return handleChange.apply(this, args);
          };
        })(binding.handleChange);
        binding.$bind(LifecycleFlags.none, scope);

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
});
