import {
  CustomAttribute,
  CustomElement,
  ICustomElementViewModel,
  IHydratedController,
  customAttribute,
  customElement,
} from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
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
      const { appHost, component, tearDown } = await createFixture(
        `<div if="value.bind: condition; cache: false" abc>hello`,
        class App {
          public condition: unknown = true;
        },
        [CustomAttribute.define('abc', class Abc {
          public constructor() {
            callCount++;
          }
        })]
      ).started;

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
        const { appHost, component, tearDown } = await createFixture(
          `<div if="value.bind: condition; cache.bind: ${falsyValue}" abc>hello`,
          class App {
            public condition: unknown = true;
          },
          [CustomAttribute.define('abc', class Abc {
            public constructor() {
              callCount++;
            }
          })]
      ).started;

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
      const { appHost, component, tearDown } = await createFixture(
        `<div if="value.bind: condition; cache: false" abc>hello</div><div else abc>world</div>`,
        class App {
          public condition: unknown = true;
        },
        [CustomAttribute.define('abc', class Abc {
          public constructor() {
            callCount++;
          }
        })]
      ).started;

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
      const { appHost, component, tearDown } = await createFixture(
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
      ).started;

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
      const { appHost, component, tearDown } = await createFixture(
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
      ).started;

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

    it('works with interpolation as only child of <template>', async function () {
      const { assertText, component, tearDown } = createFixture(
        '<div><template if.bind="on">${name}</template>',
        { on: false, name: 'a' }
      );

      assertText('');

      component.on = true;
      await tasksSettled();
      assertText('a');

      void tearDown();

      assertText('');
    });

    it('works with interpolation + leading + trailing text inside template', async function () {
      const { assertText, component, tearDown } = createFixture(
        '<div><template if.bind="on">hey ${name}</template>',
        { on: false, name: 'a' }
      );

      assertText('');

      component.on = true;
      await tasksSettled();
      assertText('hey a');

      void tearDown();

      assertText('');
    });

    it('works with interpolation as only child of <template> + else', async function () {
      const { assertText, component, tearDown } = createFixture(
        '<template if.bind="on">${name}</template><template else>${name + 1}</template>',
        { on: false, name: 'a' }
      );

      assertText('a1');

      component.on = true;
      await tasksSettled();
      assertText('a');

      void tearDown();

      assertText('');
    });

    it('supports else-if chains followed by else', function () {
      const { assertText, component } = createFixture(
        [
          '<div if.bind="step === 0">a</div>',
          '<div else if.bind="step === 1">b</div>',
          '<div else if.bind="step === 2">c</div>',
          '<div else>d</div>',
        ].join(''),
        { step: 0 }
      );

      assertText('a');

      component.step = 1;
      assertText('b');

      component.step = 2;
      assertText('c');

      component.step = 3;
      assertText('d');

      component.step = 0;
      assertText('a');
    });

    it('supports else-if when a plain attribute is between else and if on the same element', function () {
      const { appHost, component } = createFixture(
        [
          '<div if.bind="step === 0">a</div>',
          '<div else data-branch="b" if.bind="step === 1">b</div>',
          '<div else>c</div>',
        ].join(''),
        { step: 0 }
      );

      assert.visibleTextEqual(appHost, 'a');

      component.step = 1;
      assert.visibleTextEqual(appHost, 'b');

      component.step = 2;
      assert.visibleTextEqual(appHost, 'c');
    });

    it('supports else-if when a non-template custom attribute is between else and if on the same element', function () {
      @customAttribute('marker')
      class Marker {}

      const { appHost, component } = createFixture(
        [
          '<div if.bind="step === 0">a</div>',
          '<div else marker if.bind="step === 1">b</div>',
          '<div else>c</div>',
        ].join(''),
        { step: 0 },
        [Marker]
      );

      assert.visibleTextEqual(appHost, 'a');

      component.step = 1;
      assert.visibleTextEqual(appHost, 'b');

      component.step = 2;
      assert.visibleTextEqual(appHost, 'c');
    });

    it('evaluates and activates long else-if chains as expected', function () {
      const evalCounts = { a: 0, b: 0, c: 0 };
      const createdCounts = { a: 0, b: 0, c: 0, d: 0 };
      const attachingCounts = { a: 0, b: 0, c: 0, d: 0 };

      const BranchA = CustomElement.define({ name: 'count-a', template: 'a' }, class {
        public created() { createdCounts.a++; }
        public attaching() { attachingCounts.a++; }
      });
      const BranchB = CustomElement.define({ name: 'count-b', template: 'b' }, class {
        public created() { createdCounts.b++; }
        public attaching() { attachingCounts.b++; }
      });
      const BranchC = CustomElement.define({ name: 'count-c', template: 'c' }, class {
        public created() { createdCounts.c++; }
        public attaching() { attachingCounts.c++; }
      });
      const BranchD = CustomElement.define({ name: 'count-d', template: 'd' }, class {
        public created() { createdCounts.d++; }
        public attaching() { attachingCounts.d++; }
      });

      class App {
        public step = 0;

        public get isA() {
          evalCounts.a++;
          return this.step === 0;
        }

        public get isB() {
          evalCounts.b++;
          return this.step === 1;
        }

        public get isC() {
          evalCounts.c++;
          return this.step === 2;
        }
      }

      const { appHost, component } = createFixture(
        [
          '<template if.bind="isA"><count-a></count-a></template>',
          '<template else if.bind="isB"><count-b></count-b></template>',
          '<template else if.bind="isC"><count-c></count-c></template>',
          '<template else><count-d></count-d></template>',
        ].join(''),
        App,
        [BranchA, BranchB, BranchC, BranchD]
      );

      assert.visibleTextEqual(appHost, 'a');
      assert.deepStrictEqual(evalCounts, { a: 1, b: 0, c: 0 });
      assert.deepStrictEqual(createdCounts, { a: 1, b: 0, c: 0, d: 0 });
      assert.deepStrictEqual(attachingCounts, { a: 1, b: 0, c: 0, d: 0 });

      component.step = 1;
      assert.visibleTextEqual(appHost, 'b');

      component.step = 2;
      assert.visibleTextEqual(appHost, 'c');

      component.step = 3;
      assert.visibleTextEqual(appHost, 'd');

      component.step = 1;
      assert.visibleTextEqual(appHost, 'b');

      component.step = 0;
      assert.visibleTextEqual(appHost, 'a');

      assert.deepStrictEqual(createdCounts, { a: 1, b: 1, c: 1, d: 1 });
      assert.deepStrictEqual(attachingCounts, { a: 2, b: 2, c: 1, d: 1 });
    });

    it('waits for async custom element branch lifecycle on long jumps', async function () {
      let resolveCurrent: (() => void) | null = null;
      const logs: string[] = [];
      const createDeferred = () => new Promise<void>(resolve => { resolveCurrent = resolve; });

      const JumpA = CustomElement.define({ name: 'jump-a', template: 'a' }, class {
        public detaching() {
          logs.push('a:detaching');
          return createDeferred();
        }
      });
      const JumpB = CustomElement.define({ name: 'jump-b', template: 'b' }, class {
        public attaching() {
          logs.push('b:attaching');
        }
      });
      const JumpC = CustomElement.define({ name: 'jump-c', template: 'c' }, class {
        public attaching() {
          logs.push('c:attaching');
        }
      });
      const JumpD = CustomElement.define({ name: 'jump-d', template: 'd' }, class {
        public attaching() {
          logs.push('d:attaching');
        }
      });

      class App {
        public step = 0;
      }

      const { appHost, component } = createFixture(
        [
          '<template if.bind="step === 0"><jump-a></jump-a></template>',
          '<template else if.bind="step === 1"><jump-b></jump-b></template>',
          '<template else if.bind="step === 2"><jump-c></jump-c></template>',
          '<template else><jump-d></jump-d></template>',
        ].join(''),
        App,
        [JumpA, JumpB, JumpC, JumpD]
      );

      assert.visibleTextEqual(appHost, 'a');

      component.step = 3;
      assert.visibleTextEqual(appHost, 'a');
      assert.deepStrictEqual(logs, ['a:detaching']);

      resolveCurrent!();
      await tasksSettled();
      assert.visibleTextEqual(appHost, 'd');
      assert.deepStrictEqual(logs, ['a:detaching', 'd:attaching']);

      component.step = 1;
      assert.visibleTextEqual(appHost, 'b');
      assert.deepStrictEqual(logs, ['a:detaching', 'd:attaching', 'b:attaching']);
    });

    it('throws when else has no preceding if', function () {
      assert.throws(() => createFixture(`
        <div else>b</div>
      `), /AUR0810/);
    });

    it('throws when else follows a plain else', function () {
      assert.throws(() => createFixture(`
        <div if.bind="true">a</div>
        <div else>b</div>
        <div else>c</div>
      `), /AUR0810/);
    });

    it('throws when else follows a non-if template controller', function () {
      assert.throws(() => createFixture(`
        <div if.bind="true">a</div>
        <div else repeat.for="i of 1">b</div>
        <div else>c</div>
      `), /AUR0810/);
    });

    it('throws when another template controller is between else and if on the same element', function () {
      assert.throws(() => createFixture(`
        <div if.bind="true">a</div>
        <div else repeat.for="i of 1" if.bind="false">b</div>
        <div else>c</div>
      `), /AUR0810/);
    });

    it('throws when another template controller precedes if after else on the same element', function () {
      assert.throws(() => createFixture(`
        <div if.bind="true">a</div>
        <div else with.bind="{ value: 1 }" if.bind="false">b</div>
        <div else>c</div>
      `), /AUR0810/);
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
          await tasksSettled();
          assert.html.textContent(appHost, '', `round#${round} - c-1 deactivation - DOM`);
          assert.deepStrictEqual(eventLog.events, [], `round#${round} - c-1 deactivation - log`);
        }

        async function activateC1(success: boolean, round: number) {
          try {
            eventLog.events.length = 0;
            component.showC1 = true;
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
          await tasksSettled();
          assert.html.textContent(appHost, 'c-2', `round#${round} - c-1 deactivation - DOM`);
          assert.deepStrictEqual(eventLog.events, [], `round#${round} - c-1 deactivation - log`);
        }

        async function activateC1(success: boolean, round: number) {
          try {
            eventLog.events.length = 0;
            component.showC1 = true;
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
