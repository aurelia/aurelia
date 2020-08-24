import { ContainerTracer, DI, DefaultResolver, IContainer, LogLevel, LoggerConfiguration, singleton } from '@aurelia/kernel';

import { assert } from '@aurelia/testing';

describe('IContainerConfiguration', function () {
  let container0: IContainer;
  let container1: IContainer;
  let container2: IContainer;
  describe('child', function () {
    describe('defaultResolver - none', function () {
      class Alfa {
        public test(): string {
          return 'hello';
        }
      }
      describe('root container', function () {
        // eslint-disable-next-line mocha/no-hooks
        beforeEach(function () {
          container0 = DI.createContainer({
            defaultResolver: DefaultResolver.none
          });

          container1 = container0.createChild();
          container2 = container0.createChild();
        });

        it('class', function () {
          assert.throws(() => container1.get(Alfa), Error, '1');
          assert.throws(() => container2.get(Alfa), Error, '2');
          assert.throws(() => container0.get(Alfa), Error, '0'); // do last so it's not registered in root

        });
      });

      describe('two child container', function () {
        // eslint-disable-next-line mocha/no-hooks
        beforeEach(function () {
          container0 = DI.createContainer();

          container1 = container0.createChild({
            defaultResolver: DefaultResolver.none
          });
          container2 = container0.createChild();
        });

        it('class', function () {
          assert.throws(() => container1.get(Alfa), '1');
          assert.strictEqual(container2.get(Alfa).test(), 'hello', '2');
          assert.strictEqual(container0.has(Alfa, true), true, '0');
        });
      });
    });
  });

  describe('ContainerTracer', function () {
    const container = DI.createContainer({ tracer: ContainerTracer });
    container.register(LoggerConfiguration.create({ level: LogLevel.trace, $console: console }));

    @singleton
    class Alfa {
    }

    @singleton
    class Bravo {
      public constructor(public alfa: Alfa) {
      }
    }

    @singleton
    class Charlie {
      public constructor(public bravo: Bravo) {
      }
    }

    it('container', function () {
      assert.instanceOf(container, ContainerTracer);
    });

    it('single class', function () {
      assert.instanceOf(container.get(Alfa), Alfa);
    });

    it('single dependency', function () {
      const got = container.get(Bravo);
      assert.instanceOf(got, Bravo);
      assert.instanceOf(got.alfa, Alfa);
    });

    it('thrice nested', function () {
      const got = container.get(Charlie);
      assert.instanceOf(got, Charlie);

      assert.instanceOf(got.bravo, Bravo);
      assert.instanceOf(got.bravo.alfa, Alfa);
    });
  });
});
