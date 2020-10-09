import {
  enableArrayObservation,
  IBindingTargetObserver,
  LifecycleFlags as LF,
  CustomElement,
  Aurelia,
  BindingStrategy,
  ProxyObserver,
} from '@aurelia/runtime';
import {
  Constructable
} from '@aurelia/kernel';
import {
  CheckedObserver,
  IInputElement,
} from '@aurelia/runtime-html';
import {
  _,
  TestContext,
  assert,
  createSpy,
  eachCartesianJoin,
  HTMLTestContext,
} from '@aurelia/testing';

describe('checked-observer.spec.ts', function () {

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
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls[0].checked, true, 'after push(0), 1st checkbox should be checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.length, 0, 'after unticking 1st checkbox, selected length should be 0');

        component.selected.push(10);
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'After push(10), no checkbox should be checked');

        component.selected = Array.from({ length: 10 }, (_, i) => i);
        ctx.scheduler.getRenderTaskQueue().flush();
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
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.size, 0);

        component.selected.add(10);
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = new Set(Array.from({ length: 10 }, (_, i) => i));
        ctx.scheduler.getRenderTaskQueue().flush();
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
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.size, 1);

        component.selected.set(10, true);
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = new Map(Array.from({ length: 10 }, (_, i) => [i, true]));
        ctx.scheduler.getRenderTaskQueue().flush();
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
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.length, 0);

        component.selected.push({ name: 'item 10', value: 10 });
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = createItems(10);
        ctx.scheduler.getRenderTaskQueue().flush();
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
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.size, 0);

        component.selected.add({ name: 'item 10', value: 10 });
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = new Set(createItems(10));
        ctx.scheduler.getRenderTaskQueue().flush();
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
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.size, 1, 'unchecked');
        assert.strictEqual(component.selected.get(firstItemValue), false);

        component.selected.set({ name: 'item 10', value: 10 }, true);
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = new Map(Array.from(createItems(10), item => [item, true]));
        ctx.scheduler.getRenderTaskQueue().flush();
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
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls[0].checked, true);

        simulateStateChange(ctx, inputEls[1], true);
        assert.deepEqual(component.selected, createItems(2)[1]);

        component.selected = { name: 'item 10', value: 10 };
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => !el.checked), true);

        for (let i = 0; 10 > i; ++i) {
          component.selected = { name: `item ${i}`, value: i };
          ctx.scheduler.getRenderTaskQueue().flush();
          assert.strictEqual(inputEls[i].checked, true);
        }
      }
    },
  ];

  function simulateStateChange(ctx: HTMLTestContext, input: HTMLInputElement, checked: boolean): void {
    input.checked = checked;
    input.dispatchEvent(new ctx.CustomEvent('change', { bubbles: true }));
  }

  eachCartesianJoin(
    [testCases],
    (testCase, callIndex) => {
      for (const strategy of [
        // todo: enable this
        // BindingStrategy.proxies,
        BindingStrategy.getterSetter,
      ]) {
        const { title, template, ViewModel, assertFn, only } = testCase;
        // eslint-disable-next-line mocha/no-exclusive-tests
        const $it = (title_: string, fn: Mocha.Func) => only ? it.only(title_, fn) : it(title_, fn);
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        $it(`<Strategy: ${strategy === BindingStrategy.getterSetter ? 'Getter/Setter' : 'Proxies'}> ${title}`, async function () {
          const { ctx, component, testHost, tearDown } = await createFixture<any>(
            template,
            ViewModel,
            strategy,
          );
          await assertFn(ctx, testHost, component);
          // test cases could be sharing the same context document
          // so wait a bit before running the next test
          await tearDown();
        });
      }
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
    (ctx: HTMLTestContext, testHost: HTMLElement, component: T): void | Promise<void>;
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

  async function createFixture<T>(template: string | Node, $class: Constructable | null, bindingStrategy: BindingStrategy, ...registrations: any[]) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, observerLocator } = ctx;
    registrations = Array.from(new Set([...registrations]));
    container.register(...registrations);
    const testHost = ctx.createElement('div');
    const appHost = testHost.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template }, $class);
    const component = new App();

    au.app({ host: appHost, component, strategy: bindingStrategy });
    await au.start().wait();

    return {
      ctx,
      au,
      container,
      lifecycle,
      testHost,
      appHost,
      // todo: keeping ProxyObserver.getProxyOrSelf as a reminder of what will need to be done to make the tests behave as expected
      component: ProxyObserver.getProxyOrSelf(component) as T,
      observerLocator,
      tearDown: async () => {
        await au.stop().wait();
        testHost.remove();
      }
    };
  }
});

type ObservedInputElement = HTMLInputElement & {
  $observers: Record<string, IBindingTargetObserver>;
  model: any;
  children: HTMLCollectionOf<ObservedInputElement>;
  matcher(a: any, b: any): boolean;
};

const eventDefaults = { bubbles: true };

describe.skip('CheckedObserver', function () {

  // eslint-disable-next-line mocha/no-hooks
  before(function () {
    enableArrayObservation();
  });

  describe('setValue() - primitive - type="checkbox"', function () {
    function createFixture(hasSubscriber: boolean) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator, scheduler } = ctx;
      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as IInputElement;
      ctx.doc.body.appendChild(el);

      const sut = ctx.observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;
      ctx.observerLocator.getObserver(LF.none, el, 'value');

      const subscriber = { handleChange: createSpy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, container, lifecycle, observerLocator, el, sut, subscriber, scheduler };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind(LF.none);
    }

    for (const hasSubscriber of [true, false]) {
      for (const checkedBefore of [true, false]) {
        for (const checkedAfter of [true, false]) {
          for (const uncheckedValue of (!(checkedBefore && checkedAfter)) ? [false, '', undefined, null, 0, 1, 'true'] : [null]) {
            for (const checkedValue of ((checkedBefore || checkedAfter) ? [true] : [null])) {

              const propValue = checkedBefore ? checkedValue : uncheckedValue;
              const newValue = checkedAfter ? checkedValue : uncheckedValue;

              it(_`hasSubscriber=${hasSubscriber}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, propValue=${propValue}, newValue=${newValue}`, function () {

                const expectedPropValue = propValue === undefined ? null : propValue;
                const expectedNewValue = newValue === undefined ? null : newValue;

                const changeCountBefore = expectedPropValue !== null ? 1 : 0;
                const changeCountAfter = expectedPropValue !== expectedNewValue ? 1 : 0;

                const { ctx, sut, lifecycle, el, subscriber, scheduler } = createFixture(hasSubscriber);

                sut.setValue(propValue, LF.none);
                // assert.strictEqual(lifecycle.flushCount, changeCountBefore, 'lifecycle.flushCount 1');
                scheduler.getRenderTaskQueue().flush();
                assert.strictEqual(el.checked, checkedBefore, 'el.checked 1');
                assert.strictEqual(sut.getValue(), expectedPropValue, 'sut.getValue() 1');

                sut.setValue(newValue, LF.none);
                assert.strictEqual(el.checked, checkedBefore, 'el.checked 2');
                assert.strictEqual(sut.getValue(), expectedNewValue, 'sut.getValue() 2');
                // assert.strictEqual(lifecycle.flushCount, changeCountAfter, 'lifecycle.flushCount 2');
                scheduler.getRenderTaskQueue().flush();

                assert.strictEqual(el.checked, checkedAfter, 'el.checked 3');
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
  });

  describe('handleEvent() - primitive - type="checkbox"', function () {
    function createFixture() {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator, scheduler } = ctx;
      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as IInputElement;
      ctx.doc.body.appendChild(el);

      const sut = ctx.observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;

      const subscriber = { handleChange: createSpy() };
      sut.subscribe(subscriber);

      return { ctx, container, lifecycle, observerLocator, el, sut, subscriber, scheduler };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind(LF.none);
    }

    for (const checkedBefore of [true, false]) {
      for (const checkedAfter of [true, false]) {
        for (const event of ['change', 'input']) {
          it(_`checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, function () {

            const { ctx, sut, el, subscriber, scheduler } = createFixture();

            el.checked = checkedBefore;
            el.dispatchEvent(new ctx.Event(event, eventDefaults));
            assert.strictEqual(sut.getValue(), checkedBefore, 'sut.getValue() 1');
            assert.deepStrictEqual(
              subscriber.handleChange,
              [
                [checkedBefore, null, LF.none],
              ],
              `subscriber.handleChange`,
            );

            el.checked = checkedAfter;
            el.dispatchEvent(new ctx.Event(event, eventDefaults));
            assert.strictEqual(sut.getValue(), checkedAfter, 'sut.getValue() 2');

            if (checkedBefore !== checkedAfter) {
              assert.deepStrictEqual(
                subscriber.handleChange,
                [
                  [checkedBefore, null, LF.none],
                  [checkedAfter, checkedBefore, LF.none],
                ],
                `subscriber.handleChange`,
              );
            } else {
              assert.deepStrictEqual(
                subscriber.handleChange,
                [
                  [checkedBefore, null, LF.none],
                ],
                `subscriber.handleChange`,
              );
            }

            tearDown({ ctx, sut, el });
          });
        }
      }
    }
  });

  describe('setValue() - primitive - type="radio"', function () {
    function createFixture(hasSubscriber: boolean) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator, scheduler } = ctx;

      const elA = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="A"/>`) as ObservedInputElement;
      const elB = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="B"/>`) as ObservedInputElement;
      const elC = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="C"/>`) as ObservedInputElement;
      ctx.doc.body.appendChild(elA);
      ctx.doc.body.appendChild(elB);
      ctx.doc.body.appendChild(elC);
      const sutA = observerLocator.getObserver(LF.none, elA, 'checked') as CheckedObserver;
      const sutB = observerLocator.getObserver(LF.none, elB, 'checked') as CheckedObserver;
      const sutC = observerLocator.getObserver(LF.none, elC, 'checked') as CheckedObserver;
      observerLocator.getObserver(LF.none, elA, 'value');
      observerLocator.getObserver(LF.none, elB, 'value');
      observerLocator.getObserver(LF.none, elC, 'value');

      const subscriberA = { handleChange: createSpy() };
      const subscriberB = { handleChange: createSpy() };
      const subscriberC = { handleChange: createSpy() };
      if (hasSubscriber) {
        sutA.subscribe(subscriberA);
        sutB.subscribe(subscriberB);
        sutC.subscribe(subscriberC);
      }

      return { ctx, container, lifecycle, observerLocator, scheduler, elA, elB, elC, sutA, sutB, sutC, subscriberA, subscriberB, subscriberC };
    }

    function tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(elA);
      ctx.doc.body.removeChild(elB);
      ctx.doc.body.removeChild(elC);
      sutA.unbind(LF.none);
      sutB.unbind(LF.none);
      sutC.unbind(LF.none);
    }

    for (const hasSubscriber of [true, false]) {
      for (const checkedBefore of ['A', 'B', 'C', null, undefined]) {
        for (const checkedAfter of ['A', 'B', 'C', null, undefined]) {

          it(_`hasSubscriber=${hasSubscriber}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}`, function () {

            const expectedPropValue = checkedBefore === undefined ? null : checkedBefore;
            const expectedNewValue = checkedAfter === undefined ? null : checkedAfter;

            const changeCountBefore = expectedPropValue != null ? 3 : 0;
            const changeCountAfter = expectedPropValue !== expectedNewValue ? 3 : 0;

            const { ctx, sutA, sutB, sutC, elA, elB, elC, lifecycle, scheduler, subscriberA, subscriberB, subscriberC } = createFixture(hasSubscriber);

            sutA.setValue(checkedBefore, LF.none);
            sutB.setValue(checkedBefore, LF.none);
            sutC.setValue(checkedBefore, LF.none);
            // assert.strictEqual(lifecycle.flushCount, changeCountBefore, 'lifecycle.flushCount 1');
            scheduler.getRenderTaskQueue().flush();
            assert.strictEqual(elA.checked, checkedBefore === 'A', 'elA.checked 1');
            assert.strictEqual(elB.checked, checkedBefore === 'B', 'elB.checked 1');
            assert.strictEqual(elC.checked, checkedBefore === 'C', 'elC.checked 1');
            assert.strictEqual(sutA.getValue(), expectedPropValue, 'sutA.getValue() 1');
            assert.strictEqual(sutB.getValue(), expectedPropValue, 'sutB.getValue() 1');
            assert.strictEqual(sutC.getValue(), expectedPropValue, 'sutC.getValue() 1');

            sutA.setValue(checkedAfter, LF.none);
            sutB.setValue(checkedAfter, LF.none);
            sutC.setValue(checkedAfter, LF.none);
            assert.strictEqual(elA.checked, checkedBefore === 'A', 'elA.checked 2');
            assert.strictEqual(elB.checked, checkedBefore === 'B', 'elB.checked 2');
            assert.strictEqual(elC.checked, checkedBefore === 'C', 'elC.checked 2');
            assert.strictEqual(sutA.getValue(), expectedNewValue, 'sutA.getValue() 2');
            assert.strictEqual(sutB.getValue(), expectedNewValue, 'sutB.getValue() 2');
            assert.strictEqual(sutC.getValue(), expectedNewValue, 'sutC.getValue() 2');
            // assert.strictEqual(lifecycle.flushCount, changeCountAfter, 'lifecycle.flushCount 2');
            scheduler.getRenderTaskQueue().flush();

            assert.strictEqual(elA.checked, checkedAfter === 'A', 'elA.checked 3');
            assert.strictEqual(elB.checked, checkedAfter === 'B', 'elB.checked 3');
            assert.strictEqual(elC.checked, checkedAfter === 'C', 'elC.checked 3');

            assert.deepStrictEqual(
              subscriberA.handleChange,
              [],
              `subscriberA.handleChange`,
            );
            assert.deepStrictEqual(
              subscriberB.handleChange,
              [],
              `subscriberB.handleChange`,
            );
            assert.deepStrictEqual(
              subscriberC.handleChange,
              [],
              `subscriberC.handleChange`,
            );

            tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC, lifecycle });
          });
        }
      }
    }
  });

  describe('handleEvent() - primitive - type="radio"', function () {
    function createFixture() {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator, scheduler } = ctx;

      const elA = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="A"/>`) as ObservedInputElement;
      const elB = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="B"/>`) as ObservedInputElement;
      const elC = ctx.createElementFromMarkup(`<input name="foo" type="radio" value="C"/>`) as ObservedInputElement;
      ctx.doc.body.appendChild(elA);
      ctx.doc.body.appendChild(elB);
      ctx.doc.body.appendChild(elC);
      const sutA = observerLocator.getObserver(LF.none, elA, 'checked') as CheckedObserver;
      const sutB = observerLocator.getObserver(LF.none, elB, 'checked') as CheckedObserver;
      const sutC = observerLocator.getObserver(LF.none, elC, 'checked') as CheckedObserver;
      const subscriberA = { handleChange: createSpy() };
      const subscriberB = { handleChange: createSpy() };
      const subscriberC = { handleChange: createSpy() };
      sutA.subscribe(subscriberA);
      sutB.subscribe(subscriberB);
      sutC.subscribe(subscriberC);

      return { ctx, container, lifecycle, observerLocator, scheduler, elA, elB, elC, sutA, sutB, sutC, subscriberA, subscriberB, subscriberC };
    }

    function tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(elA);
      ctx.doc.body.removeChild(elB);
      ctx.doc.body.removeChild(elC);
      sutA.unbind(LF.none);
      sutB.unbind(LF.none);
      sutC.unbind(LF.none);
    }

    for (const checkedBefore of ['A', 'B', 'C']) {
      for (const checkedAfter of ['A', 'B', 'C']) {
        for (const event of ['change', 'input']) {

          it(_`checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, function () {

            const { ctx, scheduler, sutA, sutB, sutC, elA, elB, elC } = createFixture();

            elA.checked = checkedBefore === 'A';
            elB.checked = checkedBefore === 'B';
            elC.checked = checkedBefore === 'C';
            elA.dispatchEvent(new ctx.Event(event, eventDefaults));
            elB.dispatchEvent(new ctx.Event(event, eventDefaults));
            elC.dispatchEvent(new ctx.Event(event, eventDefaults));
            assert.strictEqual(sutA.getValue(), checkedBefore === 'A' ? 'A' : null, 'sutA.getValue() 1');
            assert.strictEqual(sutB.getValue(), checkedBefore === 'B' ? 'B' : null, 'sutB.getValue() 1');
            assert.strictEqual(sutC.getValue(), checkedBefore === 'C' ? 'C' : null, 'sutC.getValue() 1');
            assert.strictEqual(elA.checked, checkedBefore === 'A', 'elA.checked 1');
            assert.strictEqual(elB.checked, checkedBefore === 'B', 'elB.checked 1');
            assert.strictEqual(elC.checked, checkedBefore === 'C', 'elC.checked 1');

            elA.checked = checkedAfter === 'A';
            elB.checked = checkedAfter === 'B';
            elC.checked = checkedAfter === 'C';
            elA.dispatchEvent(new ctx.Event(event, eventDefaults));
            elB.dispatchEvent(new ctx.Event(event, eventDefaults));
            elC.dispatchEvent(new ctx.Event(event, eventDefaults));
            assert.strictEqual(sutA.getValue(), checkedBefore === 'A' || checkedAfter === 'A' ? 'A' : null, 'sutA.getValue() 2');
            assert.strictEqual(sutB.getValue(), checkedBefore === 'B' || checkedAfter === 'B' ? 'B' : null, 'sutB.getValue() 2');
            assert.strictEqual(sutC.getValue(), checkedBefore === 'C' || checkedAfter === 'C' ? 'C' : null, 'sutC.getValue() 2');
            assert.strictEqual(elA.checked, checkedAfter === 'A', 'elA.checked 2');
            assert.strictEqual(elB.checked, checkedAfter === 'B', 'elB.checked 2');
            assert.strictEqual(elC.checked, checkedAfter === 'C', 'elC.checked 2');

            tearDown({ ctx, sutA, sutB, sutC, elA, elB, elC });
          });
        }
      }
    }
  });

  describe('setValue() - array - type="checkbox"', function () {
    function createFixture(hasSubscriber: boolean, value: any, prop: string) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator, scheduler } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      el[prop] = value;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;
      observerLocator.getObserver(LF.none, el, prop);

      const subscriber = { handleChange: createSpy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, value, container, lifecycle, observerLocator, scheduler, el, sut, subscriber };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind(LF.none);
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

                    const { ctx, sut, lifecycle, el, subscriber, scheduler } = createFixture(hasSubscriber, value, prop);

                    sut.setValue(propValue, LF.none);
                    // assert.strictEqual(lifecycle.flushCount, changeCountBefore, 'lifecycle.flushCount 1');
                    scheduler.getRenderTaskQueue().flush();
                    assert.strictEqual(el.checked, valueCanBeChecked && checkedBefore, 'el.checked 1');
                    assert.strictEqual(sut.getValue(), propValue, 'sut.getValue() 1');

                    sut.setValue(newValue, LF.none);
                    assert.strictEqual(el.checked, valueCanBeChecked && checkedBefore, 'el.checked 2');
                    assert.strictEqual(sut.getValue(), newValue, 'sut.getValue() 2');
                    // assert.strictEqual(lifecycle.flushCount, changeCountAfter, 'lifecycle.flushCount 2');
                    scheduler.getRenderTaskQueue().flush();

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
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator, scheduler } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      el[prop] = value;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;
      observerLocator.getObserver(LF.none, el, prop);

      const subscriber = { handleChange: createSpy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, value, container, lifecycle, observerLocator, scheduler, el, sut, subscriber };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind(LF.none);
    }

    for (const hasSubscriber of [true, false]) {
      for (const prop of ['value', 'model']) {
        for (const value of ['foo', 'bar', 42, null, undefined, '']) {

          const valueCanBeChecked = prop === 'model' || (typeof value !== 'number' && value != null);

          it(_`hasSubscriber=${hasSubscriber}, ${prop}=${value}`, function () {

            const array = [];

            const { ctx, sut, lifecycle, el, subscriber, scheduler } = createFixture(hasSubscriber, value, prop);

            sut.setValue(array, LF.none);
            // assert.strictEqual(lifecycle.flushCount, 1, 'lifecycle.flushCount 1');
            scheduler.getRenderTaskQueue().flush();
            assert.strictEqual(el.checked, false, 'el.checked 1');
            assert.strictEqual(sut.getValue(), array, 'sut.getValue() 1');

            array.push(value);
            assert.strictEqual(el.checked, false, 'el.checked 2');
            // assert.strictEqual(lifecycle.flushCount, 1, 'lifecycle.flushCount 2');
            scheduler.getRenderTaskQueue().flush();
            assert.strictEqual(el.checked, valueCanBeChecked, 'el.checked 3');

            array.pop();
            assert.strictEqual(el.checked, valueCanBeChecked, 'el.checked 4');
            // assert.strictEqual(lifecycle.flushCount, 1, 'lifecycle.flushCount 3');
            scheduler.getRenderTaskQueue().flush();
            assert.strictEqual(el.checked, false, 'el.checked 5');
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
  });

  describe('handleEvent() - array - type="checkbox"', function () {
    function createFixture(value: any, prop: string) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, observerLocator, scheduler } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      el[prop] = value;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;

      const subscriber = { handleChange: createSpy() };
      sut.subscribe(subscriber);

      return { ctx, value, container, observerLocator, el, sut, subscriber, scheduler };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind(LF.none);
    }

    for (const prop of ['value', 'model']) {
      for (const value of ['foo', 'bar', 42, null, undefined, '']) {

        for (const checkedBefore of [true, false]) {
          for (const checkedAfter of [true, false]) {
            for (const event of ['change', 'input']) {

              it(_`${prop}=${value}, checkedBefore=${checkedBefore}, checkedAfter=${checkedAfter}, event=${event}`, function () {

                const { ctx, sut, el, subscriber, scheduler } = createFixture(value, prop);

                const array = [];
                sut.setValue(array, LF.none);
                el.checked = checkedBefore;
                el.dispatchEvent(new ctx.Event(event, eventDefaults));
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
  });

  describe('SelectValueObserver.setValue() - array - type="checkbox"', function () {
    function createFixture(hasSubscriber: boolean, value: any, prop: string) {
      const ctx = TestContext.createHTMLTestContext();
      const { container, lifecycle, observerLocator, scheduler } = ctx;

      const el = ctx.createElementFromMarkup(`<input type="checkbox"/>`) as ObservedInputElement;
      ctx.doc.body.appendChild(el);

      const sut = observerLocator.getObserver(LF.none, el, 'checked') as CheckedObserver;
      const valueOrModelObserver = observerLocator.getObserver(LF.none, el, prop) as IBindingTargetObserver;

      const subscriber = { handleChange: createSpy() };
      if (hasSubscriber) {
        sut.subscribe(subscriber);
      }

      return { ctx, value, container, observerLocator, scheduler, el, sut, subscriber, valueOrModelObserver, lifecycle };
    }

    function tearDown({ ctx, sut, el }: Partial<ReturnType<typeof createFixture>>) {
      ctx.doc.body.removeChild(el);
      sut.unbind(LF.none);
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

                    const { ctx, sut, el, subscriber, valueOrModelObserver, lifecycle, scheduler } = createFixture(hasSubscriber, value, prop);

                    sut.setValue(propValue, LF.none);
                    scheduler.getRenderTaskQueue().flush();
                    assert.strictEqual(sut.getValue(), propValue, 'sut.getValue() 1');

                    assert.strictEqual(el.checked, prop === 'model' && value === undefined && propValue === checkedValue, 'el.checked 1');
                    valueOrModelObserver.setValue(value, LF.none);
                    assert.strictEqual(el.checked, valueCanBeChecked && checkedBefore, 'el.checked 2');
                    scheduler.getRenderTaskQueue().flush();
                    assert.strictEqual(el.checked, valueCanBeChecked && checkedBefore, 'el.checked 3');

                    sut.setValue(newValue, LF.none);
                    scheduler.getRenderTaskQueue().flush();
                    assert.strictEqual(sut.getValue(), newValue, 'sut.getValue() 2');

                    valueOrModelObserver.setValue(value, LF.none);
                    assert.strictEqual(el.checked, valueCanBeChecked && checkedAfter, 'el.checked 4');
                    scheduler.getRenderTaskQueue().flush();
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
