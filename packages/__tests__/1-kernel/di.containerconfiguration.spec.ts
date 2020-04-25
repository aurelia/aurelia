import { DefaultContainerConfiguration, DefaultResolver, DI, IContainer, Registration } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';

describe('IContainerConfiguration', function () {
  let container0: IContainer;
  let container1: IContainer;
  let container2: IContainer;
  describe('child', function () {
    describe('defaultResolver - transient', function () {
      describe('root container', function () {
        // eslint-disable-next-line mocha/no-hooks
        beforeEach(function () {
          container0 = DI.createContainer({
            ...DefaultContainerConfiguration,
            defaultResolver: DefaultResolver.transient
          });

          container1 = container0.createChild();
          container2 = container0.createChild();
        });

        it('class', function () {
          class Foo {
            public test(): string {
              return 'hello';
            }
          }
          const foo1 = container1.get(Foo);
          const foo2 = container2.get(Foo);
          assert.strictEqual(foo1.test(), 'hello', 'foo1');
          assert.strictEqual(foo2.test(), 'hello', 'foo2');
          assert.notStrictEqual(container1.get(Foo), foo1, 'same child is different instance');
          assert.notStrictEqual(foo1, foo2, 'different child is different instance');
          assert.strictEqual(container0.has(Foo, true), true, 'root should not have');
        });
      });

      describe('one child container', function () {
        // eslint-disable-next-line mocha/no-hooks
        beforeEach(function () {
          container0 = DI.createContainer();

          container1 = container0.createChild({
            ...DefaultContainerConfiguration,
            defaultResolver: DefaultResolver.transient
          });
          container2 = container0.createChild();
        });

        it('class', function () {
          class Foo {
            public test(): string {
              return 'hello';
            }
          }

          const foo1 = container1.get(Foo);
          const foo2 = container2.get(Foo);
          assert.strictEqual(foo2.test(), 'hello', 'foo0');
          assert.strictEqual(foo1.test(), 'hello', 'foo1');
          assert.notStrictEqual(container1.get(Foo), foo2, 'same child is same instance');
          assert.notStrictEqual(foo1, foo2, 'different child is different instance');
          assert.strictEqual(container0.has(Foo, true), true, 'root should have');
        });
      });
    });

    describe('jitRegisterInRoot', function () {
      describe('root container', function () {
        // eslint-disable-next-line mocha/no-hooks
        beforeEach(function () {
          container0 = DI.createContainer({...DefaultContainerConfiguration, jitRegisterInRoot: false});
          container1 = container0.createChild();
          container2 = container0.createChild();
        });

        it('class', function () {
          class Foo {
            public test(): string {
              return 'hello';
            }
          }

          const foo1 = container1.get(Foo);
          const foo2 = container2.get(Foo);
          assert.strictEqual(foo1.test(), 'hello', 'foo0');
          assert.strictEqual(foo2.test(), 'hello', 'foo1');
          assert.strictEqual(container1.get(Foo), foo1, 'same child is same instance');
          assert.notStrictEqual(foo1, foo2, 'different child is different instance');
          assert.strictEqual(container0.has(Foo, true), false, 'root should not have');
        });
      });

      describe('one child container', function () {
        // eslint-disable-next-line mocha/no-hooks
        beforeEach(function () {
          container0 = DI.createContainer();

          container1 = container0.createChild({...DefaultContainerConfiguration, jitRegisterInRoot: false});
          container2 = container0.createChild();
        });

        it('class', function () {
          class Foo {
            public test(): string {
              return 'hello';
            }
          }

          const foo1 = container1.get(Foo);
          const foo2 = container2.get(Foo);
          assert.strictEqual(foo1.test(), 'hello', 'foo0');
          assert.strictEqual(foo2.test(), 'hello', 'foo1');
          assert.strictEqual(container1.get(Foo), foo1, 'same child is same instance');
          assert.notStrictEqual(foo1, foo2, 'different child is different instance');
          assert.strictEqual(container0.has(Foo, true), true, 'root should have');
        });
      });

      describe('both child containers', function () {
        // eslint-disable-next-line mocha/no-hooks
        beforeEach(function () {
          container0 = DI.createContainer();

          container1 = container0.createChild({...DefaultContainerConfiguration, jitRegisterInRoot: false});
          container2 = container0.createChild({...DefaultContainerConfiguration, jitRegisterInRoot: false});
        });

        it('class', function () {
          class Foo {
            public test(): string {
              return 'hello';
            }
          }

          const foo1 = container1.get(Foo);
          const foo2 = container2.get(Foo);
          assert.strictEqual(foo1.test(), 'hello', 'foo0');
          assert.strictEqual(foo2.test(), 'hello', 'foo1');
          assert.strictEqual(container1.get(Foo), foo1, 'same child is same instance');
          assert.notStrictEqual(foo1, foo2, 'different child is different instance');
          assert.strictEqual(container0.has(Foo, true), false, 'root should not have');
        });
      });
    });

    describe('both child containers with no jit register root', function () {
      // eslint-disable-next-line mocha/no-hooks
      beforeEach(function () {
        container0 = DI.createContainer({
          ...DefaultContainerConfiguration,
          jitRegisterInRoot: false,
        });
        container1 = container0.createChild({
          jitRegisterInRoot: false,
          defaultResolver: DefaultResolver.transient
        });
        container2 = container0.createChild({
          jitRegisterInRoot: false,
          defaultResolver: (key, handler) => {
            return Registration.instance(key, {test() {return 'foo';} }).register(handler, key);
          },
        });
      });

      it('class', function () {
        class Foo {
          public test(): string {
            return 'hello';
          }
        }

        // calling in reverse order to ensure things aren't gotten from the root container
        const foo2 = container2.get(Foo);
        const foo1 = container1.get(Foo);
        const foo0 = container0.get(Foo);

        assert.strictEqual(foo0.test(), 'hello', 'foo0');
        assert.strictEqual(foo1.test(), 'hello', 'foo1');
        assert.strictEqual(foo2.test(), 'foo', 'foo2');

        assert.strictEqual(container0.get(Foo), foo0, 'root container is singletons');
        assert.notStrictEqual(container1.get(Foo), foo1, 'child 1 is transients');
        assert.strictEqual(container2.get(Foo), foo2, 'child 2 returns an instance');

        assert.notStrictEqual(foo0, foo1, 'different child is different instance');
        assert.notInstanceOf(foo2, Foo, 'we are a duck, and we quack');
      });
    });
  });
});
