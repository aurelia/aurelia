import { DI } from '@aurelia/kernel';
import {
  createScopeForTest,
  createObserverLocator,
  assert
} from '@aurelia/testing';
import {
  AccessScopeExpression,
  PropertyBinding,
  ConditionalExpression,
  BindingMode,
  LifecycleFlags,
  LetBinding,
} from '@aurelia/runtime';

describe('2-runtime/ast.integration.spec.ts', function () {
  describe('[[AccessScope]]', function () {
    describe('PropertyBinding', function () {
      it('auto connects when evaluates', function () {
        const container = DI.createContainer();
        const observerLocator = createObserverLocator(container);
        const accessScopeExpr = new AccessScopeExpression('name', 0);
        // disable connect to verifies evaluate works
        accessScopeExpr.connect = () => {/* empty */};

        const source = { name: 'hello' };
        const target = { name: '' };
        const binding = new PropertyBinding(accessScopeExpr, target, 'name', BindingMode.toView, observerLocator, container);

        binding.$bind(LifecycleFlags.none, createScopeForTest(source), null);

        assert.strictEqual(target.name, 'hello');

        Array.from({ length: 5 }).forEach(idx => {
          source.name = idx + '';
          assert.strictEqual(target.name, idx + '');
        });

        binding.dispose();
      });

      it('auto connects with ternary', function () {
        const container = DI.createContainer();
        const observerLocator = createObserverLocator(container);
        const conditionalExpr = new ConditionalExpression(
          new AccessScopeExpression('checked'),
          new AccessScopeExpression('yesMessage'),
          new AccessScopeExpression('noMessage'),
        );

        // disable connect to verifies evaluate works
        conditionalExpr.connect = () => {/* empty */};

        const source = { checked: false, yesMessage: 'yes', noMessage: 'no' };
        const target = { value: '' };
        const scope = createScopeForTest(target, source);
        const binding = new PropertyBinding(conditionalExpr, target, 'value', BindingMode.toView, observerLocator, container);

        binding.$bind(LifecycleFlags.none, scope, null);

        assert.strictEqual(target.value, 'no');

        Array.from({ length: 5 }).forEach(idx => {
          source.checked = !source.checked;
          assert.strictEqual(target.value, source.checked ? 'yes' : 'no');
          if (source.checked) {
            source.yesMessage = `yes ${idx}`;
            assert.strictEqual(target.value, `yes ${idx}`);
            // assert the binding has dropped the old observers of the inactive branch in conditional
            source.noMessage = `no ${idx}`;
            assert.strictEqual(target.value, `yes ${idx}`);
            // revert it back for next assertion
            source.noMessage = 'no';
          } else {
            source.noMessage = `no ${idx}`;
            assert.strictEqual(target.value, `no ${idx}`);
            // assert the binding has dropped the old observers of the inactive branch in conditional
            source.yesMessage = `yes ${idx}`;
            assert.strictEqual(target.value, `no ${idx}`);
            // revert it back to normal for next assertion
            source.yesMessage = 'yes';
          }
        });

        binding.dispose();
      });
    });

    describe('LetBinding', function () {
      it('auto connects when evaluates', function () {
        const container = DI.createContainer();
        const observerLocator = createObserverLocator(container);
        const accessScopeExpr = new AccessScopeExpression('name', 0);

        // disable connect to verifies evaluate works
        accessScopeExpr.connect = () => {/* empty */};

        const source = { value: '' };
        const oc = { name: 'hello' };
        const scope = createScopeForTest(source, oc);
        const binding = new LetBinding(accessScopeExpr, 'value', observerLocator, container, true);

        binding.$bind(LifecycleFlags.none, scope, null);

        assert.strictEqual(source.value, 'hello');

        Array.from({ length: 5 }).forEach(idx => {
          oc.name = idx + '';
          assert.strictEqual(source.value, idx + '');
        });

        binding.dispose();
      });

      it('auto connects with ternary', function () {
        const container = DI.createContainer();
        const observerLocator = createObserverLocator(container);
        const conditionalExpr = new ConditionalExpression(
          new AccessScopeExpression('checked'),
          new AccessScopeExpression('yesMessage'),
          new AccessScopeExpression('noMessage'),
        );

        // disable connect to verifies evaluate works
        conditionalExpr.connect = () => {/* empty */};

        const source = { value: '' };
        const oc = { checked: false, yesMessage: 'yes', noMessage: 'no' };
        const scope = createScopeForTest(source, oc);
        const binding = new LetBinding(conditionalExpr, 'value', observerLocator, container, true);

        binding.$bind(LifecycleFlags.none, scope, null);

        assert.strictEqual(source.value, 'no');

        Array.from({ length: 5 }).forEach(idx => {
          oc.checked = !oc.checked;
          assert.strictEqual(source.value, oc.checked ? 'yes' : 'no');
          if (oc.checked) {
            oc.yesMessage = `yes ${idx}`;
            assert.strictEqual(source.value, `yes ${idx}`);
            // assert the binding has dropped the old observers of the inactive branch in conditional
            oc.noMessage = `no ${idx}`;
            assert.strictEqual(source.value, `yes ${idx}`);
            // revert it back for next assertion
            oc.noMessage = 'no';
          } else {
            oc.noMessage = `no ${idx}`;
            assert.strictEqual(source.value, `no ${idx}`);
            // assert the binding has dropped the old observers of the inactive branch in conditional
            oc.yesMessage = `no ${idx}`;
            assert.strictEqual(source.value, `no ${idx}`);
            // revert it back for next assertion
            oc.yesMessage = 'yes';

          }
        });

        binding.dispose();
      });
    });
  });
});
