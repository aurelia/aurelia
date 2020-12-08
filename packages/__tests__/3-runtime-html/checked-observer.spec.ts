import {
  Constructable
} from '@aurelia/kernel';
import {
  IObserver,
} from '@aurelia/runtime';
import {
  enableArrayObservation,
  LifecycleFlags as LF,
  CustomElement,
  Aurelia,
  CheckedObserver,
  IInputElement,
} from '@aurelia/runtime-html';
import {
  _,
  assert,
  createSpy,
  eachCartesianJoin,
  TestContext,
} from '@aurelia/testing';

describe('3-runtime-html/checked-observer.spec.ts', function () {

  const testCases: ITestCase[] = [
    {
      title: '[Checkbox] basic scenario with array',
      template: '<input type=checkbox repeat.for="i of 10" model.bind=i checked.bind=selected >',
      ViewModel: class {
        public selected: any[] = [];
      },
      assertFn: (ctx, host, $component) => {
        const component = $component as IApp & { selected: any[] };
        const inputEls = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(inputEls.length, 10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all checkbox NOT checked');

        component.selected.push(0);
        assert.strictEqual(inputEls[0].checked, true, 'after push(0), 1st checkbox should be checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.length, 0, 'after unticking 1st checkbox, selected length should be 0');

        component.selected.push(10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'After push(10), no checkbox should be checked');

        component.selected = Array.from({ length: 10 }, (_, i) => i);
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(inputEls.every(el => el.checked), true, 'after assigning new array, all checkboxes should be checked');
      }
    },
    {
      title: '[Checkbox] basic scenario with Set',
      template: '<input type=checkbox repeat.for="i of 10" model.bind=i checked.bind=selected >',
      ViewModel: class {
        public selected: Set<any> = new Set();
      },
      assertFn: (ctx, host, $component) => {
        const component = $component as IApp & { selected: Set<any> };
        const inputEls = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(inputEls.length, 10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all checkbox NOT checked');

        component.selected.add(0);
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.size, 0);

        component.selected.add(10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = new Set(Array.from({ length: 10 }, (_, i) => i));
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(inputEls.every(el => el.checked), true, 'new Set(), all checked');
      }
    },
    {
      title: '[Checkbox] basic scenario with Map',
      template: '<input type=checkbox repeat.for="i of 10" model.bind=i checked.bind=selected >',
      ViewModel: class {
        public selected: Map<any, any> = new Map();
      },
      assertFn: (ctx, host, $component) => {
        const component = $component as IApp & { selected: Map<any, any> };
        const inputEls = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(inputEls.length, 10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all checkbox NOT checked');

        component.selected.set(0, true);
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.size, 1);

        component.selected.set(10, true);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = new Map(Array.from({ length: 10 }, (_, i) => [i, true]));
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(inputEls.every(el => el.checked), true, 'new Set(), all checked');
      }
    },
    {
      title: '[Checkbox] matcher scenario with Array',
      template: '<input type=checkbox repeat.for="i of items" model.bind=i checked.bind=selected matcher.bind="matchItems">',
      ViewModel: class {
        public items: any[] = createItems(10);
        public selected: any[] = [];

        public matchItems(itemA: IAppItem, itemB: IAppItem): boolean {
          return itemA.name === itemB.name;
        }
      },
      assertFn: (ctx, host, $component) => {
        const component = $component as IApp & { selected: IAppItem[] };
        const inputEls = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(inputEls.length, 10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all checkbox NOT checked');

        component.selected.push({ name: 'item 0', value: 0 });
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.length, 0);

        component.selected.push({ name: 'item 10', value: 10 });
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = createItems(10);
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(inputEls.every(el => el.checked), true, 'new [], all checked');
      }
    },
    {
      title: '[Checkbox] matcher scenario with Set',
      template: '<input type=checkbox repeat.for="i of items" model.bind=i checked.bind=selected matcher.bind="matchItems">',
      ViewModel: class {
        public items: any[] = createItems(10);
        public selected: Set<any> = new Set();

        public matchItems(itemA: IAppItem, itemB: IAppItem): boolean {
          return itemA.name === itemB.name;
        }
      },
      assertFn: (ctx, host, $component) => {
        const component = $component as IApp & { selected: Set<IAppItem> };
        const inputEls = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(inputEls.length, 10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all checkbox NOT checked');

        component.selected.add({ name: 'item 0', value: 0 });
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.size, 0);

        component.selected.add({ name: 'item 10', value: 10 });
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = new Set(createItems(10));
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(inputEls.every(el => el.checked), true, 'new Set, all checked');
      }
    },
    {
      title: '[Checkbox] matcher scenario with Map',
      template: '<input type=checkbox repeat.for="i of items" model.bind=i checked.bind=selected matcher.bind="matchItems">',
      ViewModel: class {
        public items: any[] = createItems(10);
        public selected: Map<any, any> = new Map();

        public matchItems(itemA: IAppItem, itemB: IAppItem): boolean {
          return itemA.name === itemB.name;
        }
      },
      assertFn: (ctx, host, $component) => {
        const component = $component as IApp & { selected: Map<IAppItem, boolean> };
        const inputEls = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(inputEls.length, 10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all checkbox NOT checked');

        const firstItemValue = { name: 'item 0', value: 0 };
        component.selected.set(firstItemValue, true);
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.size, 1, 'unchecked');
        assert.strictEqual(component.selected.get(firstItemValue), false);

        component.selected.set({ name: 'item 10', value: 10 }, true);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = new Map(Array.from(createItems(10), item => [item, true]));
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(inputEls.every(el => el.checked), true, 'new Map, all checked');
      }
    },
    {
      title: '[Radio] matcher scenario',
      template: '<input type=radio repeat.for="i of items" name="bb" model.bind=i checked.bind=selected matcher.bind="matchItems">',
      ViewModel: class {
        public items: any[] = createItems(10);
        public selected: any = {};

        public matchItems(itemA: IAppItem, itemB: IAppItem): boolean {
          return itemA.name === itemB.name;
        }
      },
      assertFn: (ctx, host, $component) => {
        const component = $component as IApp & { selected: any };
        const inputEls = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(inputEls.length, 10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all radio NOT checked');

        component.selected = createItems(1)[0];
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(inputEls[0].checked, true);

        simulateStateChange(ctx, inputEls[1], true);
        assert.deepEqual(component.selected, createItems(2)[1]);

        component.selected = { name: 'item 10', value: 10 };
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(inputEls.every(el => !el.checked), true);

        for (let i = 0; 10 > i; ++i) {
          component.selected = { name: `item ${i}`, value: i };
          ctx.platform.domWriteQueue.flush();
          assert.strictEqual(inputEls[i].checked, true);
        }
      }
    },
  ];

  function simulateStateChange(ctx: TestContext, input: HTMLInputElement, checked: boolean): void {
    input.checked = checked;
    input.dispatchEvent(new ctx.CustomEvent('change', { bubbles: true }));
  }

  eachCartesianJoin(
    [testCases],
    (testCase, callIndex) => {
      const { title, template, ViewModel, assertFn, only } = testCase;
      // eslint-disable-next-line mocha/no-exclusive-tests
      const $it = (title_: string, fn: Mocha.Func) => only ? it.only(title_, fn) : it(title_, fn);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      $it(title, async function () {
        const { ctx, component, testHost, tearDown } = await createFixture<any>(
          template,
          ViewModel,
        );
        await assertFn(ctx, testHost, component);
        // test cases could be sharing the same context document
        // so wait a bit before running the next test
        await tearDown();
      });
    }
  );

  interface ITestCase<T extends IApp = IApp> {
    title: string;
    template: string;
    ViewModel?: Constructable<T>;
    assertFn: AssertionFn;
    only?: boolean;
  }

  interface AssertionFn<T extends IApp = IApp> {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    (ctx: TestContext, testHost: HTMLElement, component: T): void | Promise<void>;
  }

  interface IApp {
    [key: string]: any;
    selected: any[] | Set<any> | Map<any, any>;
  }

  interface IAppItem {
    name: string;
    value: number;
    isDone?: boolean;
  }

  function createItems(count: number): IAppItem[] {
    return Array.from({ length: count }, (_, i) => ({
      name: `item ${i}`,
      value: i,
    }));
  }

  async function createFixture<T>(template: string | Node, $class: Constructable | null, ...registrations: any[]) {
    const ctx = TestContext.create();
    const { container, lifecycle, observerLocator } = ctx;
    registrations = Array.from(new Set([...registrations]));
    container.register(...registrations);
    const testHost = ctx.createElement('div');
    const appHost = testHost.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template }, $class);
    const component = new App();

    au.app({ host: appHost, component });
    await au.start();

    return {
      ctx,
      au,
      container,
      lifecycle,
      testHost,
      appHost,
      component: component as T,
      observerLocator,
      tearDown: async () => {
        await au.stop();
        testHost.remove();
      }
    };
  }
});

type ObservedInputElement = HTMLInputElement & {
  $observers: Record<string, IObserver>;
  model: any;
  children: HTMLCollectionOf<ObservedInputElement>;
  matcher(a: any, b: any): boolean;
};

const eventDefaults = { bubbles: true };

describe('[UNIT] 3-runtime/checked-observer.spec.ts/CheckedObserver', function () {

  // eslint-disable-next-line mocha/no-hooks
  before(function () {
    enableArrayObservation();
  });

  describe('setValue() - primitive - type="checkbox"', function () {
    function createFixture(hasSubscriber: boolean) {
      const ctx = TestContext.create();
      const { container, lifecycle, observerLocator, platform } = ctx;
      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as IInputElement;
      ctx.doc.body.appendChild(el);

      const sut = ctx.observerLocator.getObserver(el, 'checked') as CheckedObserver;
      ctx.observerLocator.getObserver(el, 'value');

      const subscriber = { handleChange: createSpy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, container, lifecycle, observerLocator, el, sut, subscriber, platform };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(el);
    }

    for (const hasSubscriber of [true, false]) {
      for (const checkedBefore of [true, false]) {
        for (const checkedAfter of [true, false]) {
          for (const uncheckedValue of (!(checkedBefore && checkedAfter)) ? [false, '', undefined, null, 0, 1, 'true'] : [null]) {
            for (const checkedValue of ((checkedBefore || checkedAfter) ? [true] : [null])) {

              const propValue = checkedBefore ? checkedValue : uncheckedValue;
              const newValue = checkedAfter ? checkedValue : uncheckedValue;

              it(_`hasSubscriber=${hasSubscriber}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, propValue=${propValue}, newValue=${newValue}`, function () {

                // const expectedPropValue = propValue === undefined ? null : propValue;
                // const expectedNewValue = newValue === undefined ? null : newValue;

                // const changeCountBefore = expectedPropValue !== null ? 1 : 0;
                // const changeCountAfter = expectedPropValue !== expectedNewValue ? 1 : 0;

                const { ctx, sut, lifecycle, el, subscriber } = createFixture(hasSubscriber);

                sut.setValue(propValue, LF.none);
                // assert.strictEqual(lifecycle.flushCount, changeCountBefore, 'lifecycle.flushCount 1');
                assert.strictEqual(el.checked, checkedBefore, 'el.checked 1');
                assert.strictEqual(sut.getValue(), propValue, 'sut.getValue() 1');

                sut.setValue(newValue, LF.none);
                assert.strictEqual(el.checked, checkedAfter, 'el.checked 2');
                assert.strictEqual(sut.getValue(), newValue, 'sut.getValue() 2');
                // assert.strictEqual(lifecycle.flushCount, changeCountAfter, 'lifecycle.flushCount 2');

                if (hasSubscriber) {
                  const allCallArguments = [];
                  if (propValue !== undefined) {
                    allCallArguments.push([propValue, void 0, /* flags */0]);
                  }
                  if (newValue !== propValue) {
                    allCallArguments.push([newValue, propValue, /* flags */0]);
                  }
                  assert.deepStrictEqual(
                    subscriber.handleChange.calls,
                    allCallArguments,
                    `subscriber.handleChange`,
                  );
                } else {
                  assert.deepStrictEqual(
                    subscriber.handleChange.calls,
                    [],
                    `NO subscriber.handleChange()`,
                  );
                }

                tearDown({ ctx, sut, lifecycle, el });
              });
            }
          }
        }
      }
    }
  });

  describe('handleEvent() - primitive - type="checkbox"', function () {
    function createFixture() {
      const ctx = TestContext.create();
      const { container, lifecycle, observerLocator, platform } = ctx;
      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as IInputElement;
      ctx.doc.body.appendChild(el);

      const sut = ctx.observerLocator.getObserver(el, 'checked') as CheckedObserver;

      const subscriber = { handleChange: createSpy() };
      sut.subscribe(subscriber);

      return { ctx, container, lifecycle, observerLocator, el, sut, subscriber, platform };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(el);
    }

    for (const checkedBefore of [true, false]) {
      for (const checkedAfter of [true, false]) {
        for (const event of ['change', 'input']) {
          it(_`checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, function () {

            const { ctx, sut, el, subscriber } = createFixture();

            el.checked = checkedBefore;
            el.dispatchEvent(new ctx.Event(event, eventDefaults));
            assert.strictEqual(sut.getValue(), checkedBefore, 'sut.getValue() 1');
            assert.deepStrictEqual(
              subscriber.handleChange.calls,
              [
                [checkedBefore, undefined, LF.none],
              ],
              `subscriber.handleChange (1)`,
            );

            el.checked = checkedAfter;
            el.dispatchEvent(new ctx.Event(event, eventDefaults));
            assert.strictEqual(sut.getValue(), checkedAfter, 'sut.getValue() 2');

            assert.deepStrictEqual(
              subscriber.handleChange.calls,
              [
                [checkedBefore, undefined, LF.none],
                [checkedAfter, checkedBefore, LF.none],
              ],
              `subscriber.handleChange (2)`,
            );

            tearDown({ ctx, sut, el });
          });
        }
      }
    }
  });

  describe('setValue() - primitive - type="radio"', function () {
    function createFixture(hasSubscriber: boolean) {
      const ctx = TestContext.create();
      const { container, lifecycle, observerLocator, platform } = ctx;

      const elA = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="A"/>`) as ObservedInputElement;
      const elB = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="B"/>`) as ObservedInputElement;
      const elC = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="C"/>`) as ObservedInputElement;
      ctx.doc.body.appendChild(elA);
      ctx.doc.body.appendChild(elB);
      ctx.doc.body.appendChild(elC);
      const sutA = observerLocator.getObserver(elA, 'checked') as CheckedObserver;
      const sutB = observerLocator.getObserver(elB, 'checked') as CheckedObserver;
      const sutC = observerLocator.getObserver(elC, 'checked') as CheckedObserver;
      observerLocator.getObserver(elA, 'value');
      observerLocator.getObserver(elB, 'value');
      observerLocator.getObserver(elC, 'value');

      const subscriberA = { handleChange: createSpy() };
      const subscriberB = { handleChange: createSpy() };
      const subscriberC = { handleChange: createSpy() };
      if (hasSubscriber) {
        sutA.subscribe(subscriberA);
        sutB.subscribe(subscriberB);
        sutC.subscribe(subscriberC);
      }

      return { ctx, container, lifecycle, observerLocator, platform, elA, elB, elC, sutA, sutB, sutC, subscriberA, subscriberB, subscriberC };
    }

    function tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(elA);
      ctx.doc.body.removeChild(elB);
      ctx.doc.body.removeChild(elC);
    }

    for (const hasSubscriber of [true, false]) {
      for (const checkedBefore of ['A', 'B', 'C', null, undefined]) {
        for (const checkedAfter of ['A', 'B', 'C', null, undefined]) {

          it(_`hasSubscriber=${hasSubscriber}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}`, function () {

            // const expectedPropValue = checkedBefore === undefined ? null : checkedBefore;
            // const expectedNewValue = checkedAfter === undefined ? null : checkedAfter;

            // const changeCountBefore = expectedPropValue != null ? 3 : 0;
            // const changeCountAfter = expectedPropValue !== expectedNewValue ? 3 : 0;

            const { ctx, sutA, sutB, sutC, elA, elB, elC, lifecycle, subscriberA, subscriberB, subscriberC } = createFixture(hasSubscriber);

            sutA.setValue(checkedBefore, LF.none);
            sutB.setValue(checkedBefore, LF.none);
            sutC.setValue(checkedBefore, LF.none);
            // assert.strictEqual(lifecycle.flushCount, changeCountBefore, 'lifecycle.flushCount 1');

            assert.strictEqual(elA.checked, checkedBefore === 'A', 'elA.checked 1');
            assert.strictEqual(elB.checked, checkedBefore === 'B', 'elB.checked 1');
            assert.strictEqual(elC.checked, checkedBefore === 'C', 'elC.checked 1');
            assert.strictEqual(sutA.getValue(), checkedBefore, 'sutA.getValue() 1');
            assert.strictEqual(sutB.getValue(), checkedBefore, 'sutB.getValue() 1');
            assert.strictEqual(sutC.getValue(), checkedBefore, 'sutC.getValue() 1');

            sutA.setValue(checkedAfter, LF.none);
            sutB.setValue(checkedAfter, LF.none);
            sutC.setValue(checkedAfter, LF.none);
            assert.strictEqual(elA.checked, checkedAfter === 'A', 'elA.checked 2');
            assert.strictEqual(elB.checked, checkedAfter === 'B', 'elB.checked 2');
            assert.strictEqual(elC.checked, checkedAfter === 'C', 'elC.checked 2');
            assert.strictEqual(sutA.getValue(), checkedAfter, 'sutA.getValue() 2');
            assert.strictEqual(sutB.getValue(), checkedAfter, 'sutB.getValue() 2');
            assert.strictEqual(sutC.getValue(), checkedAfter, 'sutC.getValue() 2');
            // assert.strictEqual(lifecycle.flushCount, changeCountAfter, 'lifecycle.flushCount 2');

            if (hasSubscriber) {
              const allSubACallArguments = [];
              const allSubBCallArguments = [];
              const allSubCCallArguments = [];
              if (checkedBefore !== undefined) {
                allSubACallArguments.push([checkedBefore, void 0, 0]);
                allSubBCallArguments.push([checkedBefore, void 0, 0]);
                allSubCCallArguments.push([checkedBefore, void 0, 0]);
              }
              if (checkedAfter !== checkedBefore) {
                allSubACallArguments.push([checkedAfter, checkedBefore, 0]);
                allSubBCallArguments.push([checkedAfter, checkedBefore, 0]);
                allSubCCallArguments.push([checkedAfter, checkedBefore, 0]);
              }
              assert.deepStrictEqual(
                subscriberA.handleChange.calls,
                allSubACallArguments,
                `subscriberA.handleChange`,
              );
              assert.deepStrictEqual(
                subscriberB.handleChange.calls,
                allSubBCallArguments,
                `subscriberB.handleChange`,
              );
              assert.deepStrictEqual(
                subscriberC.handleChange.calls,
                allSubCCallArguments,
                `subscriberC.handleChange`,
              );
            } else {
              assert.deepStrictEqual(subscriberA.handleChange.calls, [], `subscriberA.handleChange`);
              assert.deepStrictEqual(subscriberB.handleChange.calls, [], `subscriberB.handleChange`);
              assert.deepStrictEqual(subscriberC.handleChange.calls, [], `subscriberC.handleChange`);
            }

            tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC, lifecycle });
          });
        }
      }
    }
  });

  describe('handleEvent() - primitive - type="radio"', function () {
    function createFixture() {
      const ctx = TestContext.create();
      const { container, lifecycle, observerLocator, platform } = ctx;

      const elA = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="A"/>`) as ObservedInputElement;
      const elB = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="B"/>`) as ObservedInputElement;
      const elC = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="C"/>`) as ObservedInputElement;
      ctx.doc.body.appendChild(elA);
      ctx.doc.body.appendChild(elB);
      ctx.doc.body.appendChild(elC);
      const sutA = observerLocator.getObserver(elA, 'checked') as CheckedObserver;
      const sutB = observerLocator.getObserver(elB, 'checked') as CheckedObserver;
      const sutC = observerLocator.getObserver(elC, 'checked') as CheckedObserver;
      const subscriberA = { handleChange: createSpy() };
      const subscriberB = { handleChange: createSpy() };
      const subscriberC = { handleChange: createSpy() };
      sutA.subscribe(subscriberA);
      sutB.subscribe(subscriberB);
      sutC.subscribe(subscriberC);

      return { ctx, container, lifecycle, observerLocator, platform, elA, elB, elC, sutA, sutB, sutC, subscriberA, subscriberB, subscriberC };
    }

    function tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(elA);
      ctx.doc.body.removeChild(elB);
      ctx.doc.body.removeChild(elC);
    }

    for (const checkedBefore of ['A', 'B', 'C']) {
      for (const checkedAfter of ['A', 'B', 'C']) {
        for (const event of ['change', 'input']) {

          it(_`checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, function () {

            const { ctx, sutA, sutB, sutC, elA, elB, elC } = createFixture();

            elA.checked = checkedBefore === 'A';
            elB.checked = checkedBefore === 'B';
            elC.checked = checkedBefore === 'C';
            elA.dispatchEvent(new ctx.Event(event, eventDefaults));
            elB.dispatchEvent(new ctx.Event(event, eventDefaults));
            elC.dispatchEvent(new ctx.Event(event, eventDefaults));
            assert.strictEqual(sutA.getValue(), checkedBefore === 'A' ? 'A' : undefined, 'sutA.getValue() 1');
            assert.strictEqual(sutB.getValue(), checkedBefore === 'B' ? 'B' : undefined, 'sutB.getValue() 1');
            assert.strictEqual(sutC.getValue(), checkedBefore === 'C' ? 'C' : undefined, 'sutC.getValue() 1');
            assert.strictEqual(elA.checked, checkedBefore === 'A', 'elA.checked 1');
            assert.strictEqual(elB.checked, checkedBefore === 'B', 'elB.checked 1');
            assert.strictEqual(elC.checked, checkedBefore === 'C', 'elC.checked 1');

            elA.checked = checkedAfter === 'A';
            elB.checked = checkedAfter === 'B';
            elC.checked = checkedAfter === 'C';
            elA.dispatchEvent(new ctx.Event(event, eventDefaults));
            elB.dispatchEvent(new ctx.Event(event, eventDefaults));
            elC.dispatchEvent(new ctx.Event(event, eventDefaults));
            assert.strictEqual(sutA.getValue(), checkedBefore === 'A' || checkedAfter === 'A' ? 'A' : undefined, 'sutA.getValue() 2');
            assert.strictEqual(sutB.getValue(), checkedBefore === 'B' || checkedAfter === 'B' ? 'B' : undefined, 'sutB.getValue() 2');
            assert.strictEqual(sutC.getValue(), checkedBefore === 'C' || checkedAfter === 'C' ? 'C' : undefined, 'sutC.getValue() 2');
            assert.strictEqual(elA.checked, checkedAfter === 'A', 'elA.checked 2');
            assert.strictEqual(elB.checked, checkedAfter === 'B', 'elB.checked 2');
            assert.strictEqual(elC.checked, checkedAfter === 'C', 'elC.checked 2');

            tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC });
          });
        }
      }
    }
  });

  describe.skip('setValue() - array - type="checkbox"', function () {
    function createFixture(hasSubscriber: boolean, value: any, prop: string) {
      const ctx = TestContext.create();
      const { container, lifecycle, observerLocator, platform } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      el[prop] = value;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(el, 'checked') as CheckedObserver;
      observerLocator.getObserver(el, prop);

      const subscriber = { handleChange: createSpy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, value, container, lifecycle, observerLocator, platform, el, sut, subscriber };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(el);
    }

    for (const hasSubscriber of [true, false]) {
      for (const prop of ['value', 'model']) {
        for (const value of ['foo', 'bar', 42, null, undefined, '']) {

          const valueCanBeChecked = prop === 'model' || (typeof value !== 'number' && value !== undefined);

          for (const checkedBefore of [true, false]) {
            for (const checkedAfter of [true, false]) {
              for (const uncheckedValue of (!(checkedBefore && checkedAfter)) ? [[], [!value ? 'foo' : '']] : [[]]) {
                for (const checkedValue of ((checkedBefore || checkedAfter) ? [[value, '']] : [[]])) {

                  const propValue = checkedBefore ? checkedValue : uncheckedValue;
                  const newValue = checkedAfter ? checkedValue : uncheckedValue;

                  it(_`hasSubscriber=${hasSubscriber}, ${prop}=${value}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, propValue=${propValue}, newValue=${newValue}`, function () {

                    const changeCountBefore = 1;
                    const changeCountAfter = checkedBefore !== checkedAfter ? 1 : 0;

                    const { ctx, sut, lifecycle, el, subscriber, platform } = createFixture(hasSubscriber, value, prop);

                    sut.setValue(propValue, LF.none);
                    // assert.strictEqual(lifecycle.flushCount, changeCountBefore, 'lifecycle.flushCount 1');

                    assert.strictEqual(el.checked, valueCanBeChecked && checkedBefore, 'el.checked 1');
                    assert.strictEqual(sut.getValue(), propValue, 'sut.getValue() 1');

                    sut.setValue(newValue, LF.none);
                    assert.strictEqual(el.checked, valueCanBeChecked && checkedBefore, 'el.checked 2');
                    assert.strictEqual(sut.getValue(), newValue, 'sut.getValue() 2');
                    // assert.strictEqual(lifecycle.flushCount, changeCountAfter, 'lifecycle.flushCount 2');

                    assert.strictEqual(el.checked, valueCanBeChecked && checkedAfter, 'el.checked 3');
                    assert.deepStrictEqual(
                      subscriber.handleChange,
                      [],
                      `subscriber.handleChange`,
                    );

                    tearDown({ ctx, sut, lifecycle, el });
                  });
                }
              }
            }
          }
        }
      }
    }
  });

  describe('mutate collection - array - type="checkbox"', function () {
    function createFixture(hasSubscriber: boolean, value: any, prop: string) {
      const ctx = TestContext.create();
      const { container, lifecycle, observerLocator, platform } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      el[prop] = value;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(el, 'checked') as CheckedObserver;
      observerLocator.getObserver(el, prop);

      const subscriber = { handleChange: createSpy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, value, container, lifecycle, observerLocator, platform, el, sut, subscriber };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(el);
    }

    for (const hasSubscriber of [true, false]) {
      for (const prop of ['value', 'model']) {
        for (const value of ['foo', 'bar', 42, null, undefined, '']) {

          const valueCanBeChecked = prop === 'model' || (typeof value !== 'number' && value != null);

          it(_`hasSubscriber=${hasSubscriber}, ${prop}=${value}`, function () {

            const array = [];

            const { ctx, sut, lifecycle, el, subscriber, platform } = createFixture(hasSubscriber, value, prop);

            sut.setValue(array, LF.none);

            assert.strictEqual(el.checked, false, 'el.checked 1');
            assert.strictEqual(sut.getValue(), array, 'sut.getValue() 1');

            array.push(value);
            assert.strictEqual(el.checked, valueCanBeChecked, 'el.checked 2');

            array.pop();
            assert.strictEqual(el.checked, false, 'el.checked 3');

            if (hasSubscriber) {
              assert.deepStrictEqual(
                subscriber.handleChange.calls,
                [
                  [[], undefined, 0],
                ],
                `subscriber.handleChange`,
              );
            } else {
              assert.deepStrictEqual(
                subscriber.handleChange.calls,
                [],
                `subscriber.handleChange`,
              );
            }

            tearDown({ ctx, sut, lifecycle, el });
          });
        }
      }
    }
  });

  describe('handleEvent() - array - type="checkbox"', function () {
    function createFixture(value: any, prop: string) {
      const ctx = TestContext.create();
      const { container, observerLocator, platform } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      el[prop] = value;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(el, 'checked') as CheckedObserver;

      const subscriber = { handleChange: createSpy() };
      sut.subscribe(subscriber);

      return { ctx, value, container, observerLocator, el, sut, subscriber, platform };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(el);
    }

    for (const prop of ['value', 'model']) {
      for (const value of ['foo', 'bar', 42, null, undefined, '']) {

        for (const checkedBefore of [true, false]) {
          for (const checkedAfter of [true, false]) {
            for (const event of ['change', 'input']) {

              it(_`${prop}=${value}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, function () {

                const { ctx, sut, el, subscriber } = createFixture(value, prop);
                const checkboxValue = prop === 'model'
                  ? value
                  : value === null
                    ? ''
                    : String(value);
                const array = [];
                sut.setValue(array, LF.none);
                // 1. at this point, the array is still empty
                assert.deepStrictEqual(
                  subscriber.handleChange.calls,
                  [
                    [[], undefined, 0],
                  ],
                  `subscriber.handleChange (1)`,
                );
                el.checked = checkedBefore;
                el.dispatchEvent(new ctx.Event(event, eventDefaults));
                if (checkedBefore) {
                  assert.deepStrictEqual(
                    // 2. at this point, it's still the same array above,
                    // though the array has been mutated with the value of the input
                    subscriber.handleChange.calls,
                    [
                      [[checkboxValue], undefined, 0],
                    ],
                    `subscriber.handleChange (2)`,
                  );
                }
                let actual = sut.getValue() as IInputElement[];

                if (checkedBefore) {
                  assert.strictEqual(actual[0], prop === 'value' ? (value !== null ? `${value}` : '') : value, `actual[0]`); // TODO: maybe we should coerce value in the observer
                } else {
                  assert.strictEqual(actual, array, `actual`);
                }

                el.checked = checkedAfter;
                el.dispatchEvent(new ctx.Event(event, eventDefaults));
                actual = sut.getValue() as IInputElement[];
                if (checkedAfter) {
                  assert.strictEqual(actual[0], prop === 'value' ? (value !== null ? `${value}` : '') : value, `actual[0]`); // TODO: maybe we should coerce value in the observer
                } else {
                  assert.strictEqual(actual, array, `actual`);
                }
                // 3. if the checkbox is unchecked
                // then the value of the checkbox should be removed from the array
                // and vice versa
                if (checkedAfter) {
                  assert.deepStrictEqual(
                    subscriber.handleChange.calls,
                    [
                      [[checkboxValue], undefined, 0],
                    ],
                    `subscriber.handleChange (3)`,
                  );
                } else {
                  assert.deepStrictEqual(
                    subscriber.handleChange.calls,
                    [
                      [[], undefined, 0],
                    ],
                    `subscriber.handleChange (3)`,
                  );
                }
                tearDown({ ctx, sut, el });
              });
            }
          }
        }
      }
    }
  });

  describe.skip('SelectValueObserver.setValue() - array - type="checkbox"', function () {
    function createFixture(hasSubscriber: boolean, value: any, prop: string) {
      const ctx = TestContext.create();
      const { container, lifecycle, observerLocator, platform } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(el, 'checked') as CheckedObserver;
      const valueOrModelObserver = observerLocator.getObserver(el, prop) as IObserver;

      const subscriber = { handleChange: createSpy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, value, container, observerLocator, platform, el, sut, subscriber, valueOrModelObserver, lifecycle };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(el);
    }

    for (const hasSubscriber of [true, false]) {
      for (const prop of ['value', 'model']) {
        for (const value of ['foo', 'bar', 42, null, undefined, '']) {

          const valueCanBeChecked = prop === 'model' || (typeof value !== 'number' && value != null);

          for (const checkedBefore of [true, false]) {
            for (const checkedAfter of [true, false]) {
              for (const uncheckedValue of (!(checkedBefore && checkedAfter)) ? [[], [!value ? 'foo' : '']] : [[]]) {
                for (const checkedValue of ((checkedBefore || checkedAfter) ? [[value, '']] : [[]])) {

                  const propValue = checkedBefore ? checkedValue : uncheckedValue;
                  const newValue = checkedAfter ? checkedValue : uncheckedValue;

                  it(_`hasSubscriber=${hasSubscriber}, ${prop}=${value}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, propValue=${propValue}, newValue=${newValue}`, function () {

                    const { ctx, sut, el, subscriber, valueOrModelObserver, lifecycle, platform } = createFixture(hasSubscriber, value, prop);

                    sut.setValue(propValue, LF.none);

                    assert.strictEqual(sut.getValue(), propValue, 'sut.getValue() 1');

                    assert.strictEqual(el.checked, prop === 'model' && value === undefined && propValue === checkedValue, 'el.checked 1');
                    valueOrModelObserver.setValue(value, LF.none);
                    assert.strictEqual(el.checked, valueCanBeChecked && checkedBefore, 'el.checked 2');

                    assert.strictEqual(el.checked, valueCanBeChecked && checkedBefore, 'el.checked 3');

                    sut.setValue(newValue, LF.none);

                    assert.strictEqual(sut.getValue(), newValue, 'sut.getValue() 2');

                    valueOrModelObserver.setValue(value, LF.none);
                    assert.strictEqual(el.checked, valueCanBeChecked && checkedAfter, 'el.checked 4');

                    assert.strictEqual(el.checked, valueCanBeChecked && checkedAfter, 'el.checked 5');
                    assert.deepStrictEqual(
                      subscriber.handleChange,
                      [],
                      `subscriber.handleChange`,
                    );

                    tearDown({ ctx, sut, el });
                  });
                }
              }
            }
          }
        }
      }
    }
  });
});
