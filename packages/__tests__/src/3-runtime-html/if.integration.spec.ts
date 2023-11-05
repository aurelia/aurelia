import {
  CustomAttribute, ICustomElementViewModel, IHydratedController, IPlatform, customElement
} from '@aurelia/runtime-html';
import {
  assert, createFixture
} from '@aurelia/testing';

describe(`3-runtime-html/if.integration.spec.ts`, function () {
  class EventLog {
    public readonly events: string[] = [];
    public log(event: string) {
      this.events.push(event);
    }
  }

  describe('with caching', function () {
    it('disables cache with "false" string', async function () {
      let callCount = 0;
      const { appHost, component, startPromise, tearDown } = createFixture(
        `<div if="value.bind: condition; cache: false" abc>hello`,
        class App {
          public condition: unknown = true;
        },
        [CustomAttribute.define('abc', class Abc {
          public constructor() {
            callCount++;
          }
        })]
      );

      await startPromise;
      assert.visibleTextEqual(appHost, 'hello');
      assert.strictEqual(callCount, 1);

      component.condition = false;
      assert.visibleTextEqual(appHost, '');

      component.condition = true;
      assert.visibleTextEqual(appHost, 'hello');
      assert.strictEqual(callCount, 2);

      await tearDown();

      assert.visibleTextEqual(appHost, '');
    });

    for (const falsyValue of [null, undefined, 0, NaN, false]) {
      it(`disables cache with fasly value: "${falsyValue}" string`, async function () {
        let callCount = 0;
        const { appHost, component, startPromise, tearDown } = createFixture(
          `<div if="value.bind: condition; cache.bind: ${falsyValue}" abc>hello`,
          class App {
            public condition: unknown = true;
          },
          [CustomAttribute.define('abc', class Abc {
            public constructor() {
              callCount++;
            }
          })]
        );

        await startPromise;
        assert.visibleTextEqual(appHost, 'hello');
        assert.strictEqual(callCount, 1);

        component.condition = false;
        assert.visibleTextEqual(appHost, '');

        component.condition = true;
        assert.visibleTextEqual(appHost, 'hello');
        assert.strictEqual(callCount, 2);

        await tearDown();

        assert.visibleTextEqual(appHost, '');
      });
    }

    it('disables cache on [else]', async function () {
      let callCount = 0;
      const { appHost, component, startPromise, tearDown } = createFixture(
        `<div if="value.bind: condition; cache: false" abc>hello</div><div else abc>world</div>`,
        class App {
          public condition: unknown = true;
        },
        [CustomAttribute.define('abc', class Abc {
          public constructor() {
            callCount++;
          }
        })]
      );

      await startPromise;
      assert.visibleTextEqual(appHost, 'hello');
      assert.strictEqual(callCount, 1);

      component.condition = false;
      assert.visibleTextEqual(appHost, 'world');
      assert.strictEqual(callCount, 2);

      component.condition = true;
      assert.visibleTextEqual(appHost, 'hello');
      assert.strictEqual(callCount, 3);

      component.condition = false;
      assert.visibleTextEqual(appHost, 'world');
      assert.strictEqual(callCount, 4);

      await tearDown();

      assert.visibleTextEqual(appHost, '');
    });

    it('does not affected nested [if]', async function () {
      let callCount = 0;
      const { appHost, component, startPromise, tearDown } = createFixture(
        `<div if="value.bind: condition; cache: false" abc>hello<span if.bind="condition2" abc> span`,
        class App {
          public condition: unknown = true;
          public condition2: unknown = true;
        },
        [CustomAttribute.define('abc', class Abc {
          public constructor() {
            callCount++;
          }
        })]
      );

      await startPromise;
      assert.visibleTextEqual(appHost, 'hello span');
      assert.strictEqual(callCount, 2);

      // change to false
      component.condition2 = false;
      assert.visibleTextEqual(appHost, 'hello');
      // then true again
      component.condition2 = true;
      assert.visibleTextEqual(appHost, 'hello span');
      // wouldn't create another view
      assert.strictEqual(callCount, 2);

      component.condition = false;
      assert.visibleTextEqual(appHost, '');

      component.condition = true;
      assert.visibleTextEqual(appHost, 'hello span');
      assert.strictEqual(callCount, 4);

      await tearDown();

      assert.visibleTextEqual(appHost, '');
    });

    it('works on subsequent activation when nested inside other [if]', async function () {
      let callCount = 0;
      const { appHost, component, startPromise, tearDown } = createFixture(
        `<div if.bind="condition" abc>hello<span if="value.bind: condition2; cache: false" abc> span`,
        class App {
          public condition: unknown = true;
          public condition2: unknown = true;
        },
        [CustomAttribute.define('abc', class Abc {
          public constructor() {
            callCount++;
          }
        })]
      );

      await startPromise;
      assert.visibleTextEqual(appHost, 'hello span');
      assert.strictEqual(callCount, 2);

      // change to false
      component.condition2 = false;
      assert.visibleTextEqual(appHost, 'hello');
      // then true again
      component.condition2 = true;
      assert.visibleTextEqual(appHost, 'hello span');
      // wouldn't create another view
      assert.strictEqual(callCount, 3);

      component.condition = false;
      assert.visibleTextEqual(appHost, '');

      component.condition = true;
      assert.visibleTextEqual(appHost, 'hello span');
      assert.strictEqual(callCount, 4);

      await tearDown();

      assert.visibleTextEqual(appHost, '');
    });

    it('works with interpolation as only child of <template>', function () {
      const { assertText, component, flush, tearDown } = createFixture(
        '<div><template if.bind="on">${name}</template>',
        { on: false, name: 'a' }
      );

      assertText('');

      component.on = true;
      flush();
      assertText('a');

      void tearDown();

      assertText('');
    });

    it('works with interpolation + leading + trailing text inside template', function () {
      const { assertText, component, flush, tearDown } = createFixture(
        '<div><template if.bind="on">hey ${name}</template>',
        { on: false, name: 'a' }
      );

      assertText('');

      component.on = true;
      flush();
      assertText('hey a');

      void tearDown();

      assertText('');
    });

    it('works with interpolation as only child of <template> + else', function () {
      const { assertText, component, flush, tearDown } = createFixture(
        '<template if.bind="on">${name}</template><template else>${name + 1}</template>',
        { on: false, name: 'a' }
      );

      assertText('a1');

      component.on = true;
      flush();
      assertText('a');

      void tearDown();

      assertText('');
    });

    {
      @customElement({ name: 'c-1', template: 'c-1' })
      class CeOne implements ICustomElementViewModel {

        private static id: number = 0;
        public static inject = [EventLog];
        public constructor(private readonly log: EventLog) { }

        binding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
          this.log.log('c-1 binding enter');
          const id = CeOne.id;
          CeOne.id++;
          if (id % 2 === 0) throw new Error('Synthetic test error');
          this.log.log('c-1 binding leave');
        }
      }

      class Root {
        public showC1: boolean = false;
      }

      it('Once an activation errs, further successful activation of the same elements is still possible - without else', async function () {
        const { component, appHost, container, stop } = createFixture(
          `<c-1 if.bind="showC1"></c-1>`,
          Root,
          [EventLog, CeOne],
        );

        const eventLog = container.get(EventLog);
        const platform = container.get(IPlatform);
        const queue = platform.domWriteQueue;
        queue.flush();

        assert.html.textContent(appHost, '', 'init');
        assert.deepStrictEqual(eventLog.events, [], 'init log');

        // trigger component activation - expect error
        await activateC1(false, 1);

        // deactivate c-1
        await deactivateC1(2);

        // activate c-1 again - expect success
        await activateC1(true, 3);

        // deactivate c-1
        await deactivateC1(4);

        // activate c-1 again - expect error
        await activateC1(false, 5);

        // deactivate c-1
        await deactivateC1(6);

        // activate c-1 again - expect success
        await activateC1(true, 7);

        await stop();

        async function deactivateC1(round: number) {
          eventLog.events.length = 0;
          component.showC1 = false;
          await queue.yield();
          assert.html.textContent(appHost, '', `round#${round} - c-1 deactivation - DOM`);
          assert.deepStrictEqual(eventLog.events, [], `round#${round} - c-1 deactivation - log`);
        }

        async function activateC1(success: boolean, round: number) {
          try {
            eventLog.events.length = 0;
            component.showC1 = true;
            await queue.yield();
            if (!success) assert.fail(`round#${round} - c-1 activation should have failed`);
          } catch (e) {
            if (success) throw e;
          }
          assert.html.textContent(appHost, success ? 'c-1' : '', `round#${round} - c-1 activation triggered - DOM`);
          assert.deepStrictEqual(eventLog.events, ['c-1 binding enter', ...(success ? ['c-1 binding leave'] : [])], `round#${round} - c-1 activation triggered - log`);
        }
      });
    }
    {
      @customElement({ name: 'c-1', template: 'c-1' })
      class CeOne implements ICustomElementViewModel {

        private static id: number = 0;
        public static inject = [EventLog];
        public constructor(private readonly log: EventLog) { }

        binding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
          this.log.log('c-1 binding enter');
          const id = CeOne.id;
          CeOne.id++;
          if (id % 2 === 0) throw new Error('Synthetic test error');
          this.log.log('c-1 binding leave');
        }
      }

      @customElement({ name: 'c-2', template: 'c-2' })
      class CeTwo implements ICustomElementViewModel { }

      class Root {
        public showC1: boolean = false;
      }

      it('Once an activation errs, further successful activation of the same elements is still possible - with else', async function () {
        const { component, appHost, container, stop } = createFixture(
          `<c-1 if.bind="showC1"></c-1><c-2 else></c-2>`,
          Root,
          [EventLog, CeOne, CeTwo],
        );

        const eventLog = container.get(EventLog);
        const platform = container.get(IPlatform);
        const queue = platform.domWriteQueue;
        queue.flush();

        assert.html.textContent(appHost, 'c-2', 'init');
        assert.deepStrictEqual(eventLog.events, [], 'init log');

        // trigger component activation - expect error
        await activateC1(false, 1);

        // deactivate c-1
        await deactivateC1(2);

        // activate c-1 again - expect success
        await activateC1(true, 3);

        // deactivate c-1
        await deactivateC1(4);

        // activate c-1 again - expect error
        await activateC1(false, 5);

        // deactivate c-1
        await deactivateC1(6);

        // activate c-1 again - expect success
        await activateC1(true, 7);

        await stop();

        async function deactivateC1(round: number) {
          eventLog.events.length = 0;
          component.showC1 = false;
          await queue.yield();
          assert.html.textContent(appHost, 'c-2', `round#${round} - c-1 deactivation - DOM`);
          assert.deepStrictEqual(eventLog.events, [], `round#${round} - c-1 deactivation - log`);
        }

        async function activateC1(success: boolean, round: number) {
          try {
            eventLog.events.length = 0;
            component.showC1 = true;
            await queue.yield();
            if (!success) assert.fail(`round#${round} - c-1 activation should have failed`);
          } catch (e) {
            if (success) throw e;
          }
          assert.html.textContent(appHost, success ? 'c-1' : '', `round#${round} - c-1 activation triggered - DOM`);
          assert.deepStrictEqual(eventLog.events, ['c-1 binding enter', ...(success ? ['c-1 binding leave'] : [])], `round#${round} - c-1 activation triggered - log`);
        }
      });
    }
  });
});
