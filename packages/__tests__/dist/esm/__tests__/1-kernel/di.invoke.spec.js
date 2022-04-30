import { DI } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';
describe('DI.invoke', function () {
    let container;
    // eslint-disable-next-line mocha/no-hooks
    beforeEach(function () {
        container = DI.createContainer();
    });
    it('plain usage', function () {
        let instanceCount = 0;
        class MyClass {
            constructor() {
                instanceCount++;
            }
        }
        const instance1 = container.invoke(MyClass);
        const instance2 = container.invoke(MyClass);
        assert.notStrictEqual(instance1, instance2);
        assert.strictEqual(instanceCount, 2);
        assert.strictEqual(container.has(MyClass, true), false);
    });
    it('with dynamic deps', function () {
        let instanceCount = 0;
        const instanceDeps = [];
        class MyClass {
            constructor(...deps) {
                instanceCount++;
                instanceDeps.push(deps);
            }
        }
        const instance1 = container.invoke(MyClass, ['dep1', 'dep2', 'dep3']);
        const instance2 = container.invoke(MyClass, ['dep4', 'dep5']);
        assert.notStrictEqual(instance1, instance2);
        assert.strictEqual(instanceCount, 2);
        assert.strictEqual(container.has(MyClass, true), false);
        assert.strictEqual(instanceDeps.length, 2);
        assert.deepStrictEqual(instanceDeps[0], ['dep1', 'dep2', 'dep3']);
        assert.deepStrictEqual(instanceDeps[1], ['dep4', 'dep5']);
    });
    it('with @inject + dynamic deps', function () {
        let instanceCount = 0;
        let depCount = 0;
        let depInstance;
        const instanceDeps = [];
        class MyDep {
            constructor() {
                depCount++;
                depInstance = this;
            }
        }
        class MyClass {
            constructor(...deps) {
                instanceCount++;
                instanceDeps.push(deps);
            }
        }
        MyClass.inject = [MyDep];
        const instance1 = container.invoke(MyClass, ['dep1', 'dep2', 'dep3']);
        const instance2 = container.invoke(MyClass, ['dep4', 'dep5']);
        assert.notStrictEqual(instance1, instance2);
        assert.strictEqual(instanceCount, 2);
        assert.strictEqual(container.has(MyClass, true), false);
        assert.strictEqual(depCount, 1);
        assert.strictEqual(instanceDeps.length, 2);
        assert.deepStrictEqual(instanceDeps[0], [depInstance, 'dep1', 'dep2', 'dep3']);
        assert.deepStrictEqual(instanceDeps[1], [depInstance, 'dep4', 'dep5']);
    });
});
//# sourceMappingURL=di.invoke.spec.js.map