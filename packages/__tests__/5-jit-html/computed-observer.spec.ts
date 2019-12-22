import {
  IObserverLocator,
  IScheduler,
  LifecycleFlags,
  CustomElement,
  Aurelia,
  BindingStrategy,
  GetterObserver,
  SetterObserver,
  MapObserver,
  CustomSetterObserver
} from '@aurelia/runtime';
import {
  Constructable
} from '@aurelia/kernel';
import {
  TestContext,
  assert,
  eachCartesianJoin,
  HTMLTestContext
} from '@aurelia/testing';

describe('simple Computed Observer test case', function () {

  interface IComputedObserverTestCase<T extends IApp = IApp> {
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
    items: IAppItem[];
    readonly total: number;
  }

  interface IAppItem {
    name: string;
    value: number;
    isDone?: boolean;
  }

  const computedObserverTestCases: IComputedObserverTestCase[] = [
    {
      title: 'works in basic scenario',
      template: `\${total}`,
      ViewModel: class TestClass implements IApp {
        public items: IAppItem[] = Array.from({ length: 10 }, (_, idx) => {
          return { name: `i-${idx}`, value: idx + 1 };
        });

        public get total(): number {
          return this.items.reduce((total, item) => total + (item.value > 5 ? item.value : 0), 0);
        }
      },
      assertFn: (ctx, host, component) => {
        assert.strictEqual(host.textContent, '40');
        component.items[0].value = 100;
        assert.strictEqual(host.textContent, '40');
        ctx.container.get(IScheduler).getRenderTaskQueue().flush();
        assert.strictEqual(host.textContent, '140');

        component.items.splice(1, 1, { name: 'item - 1', value: 100 });
        // todo: this scenario
        // component.items[1] = { name: 'item - 1', value: 100 };
        assert.strictEqual(host.textContent, '140');
        ctx.container.get(IScheduler).getRenderTaskQueue().flush();
        assert.strictEqual(host.textContent, '240');
      }
    },
    {
      title: 'works with [].filter https://github.com/aurelia/aurelia/issues/534',
      template: `\${total}`,
      ViewModel: class App {
        public items: IAppItem[] = Array.from({ length: 10 }, (_, idx) => {
          return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
        });

        public get total(): number {
          return this.items.filter(item => item.isDone).length;
        }
      },
      assertFn: (ctx, host, component) => {
        const observer = ctx
          .container
          .get(IObserverLocator)
          .getObserver(
            LifecycleFlags.none,
            component,
            'total'
          ) as GetterObserver;

        assert.strictEqual(observer['propertyDeps']?.length, 12);
        assert.strictEqual(observer['collectionDeps']?.length, 1);

        observer['propertyDeps'].forEach((observerDep: SetterObserver) => {
          return assert.instanceOf(observerDep, SetterObserver);
        });

        assert.strictEqual(host.textContent, '5');
        component.items[1].isDone = true;
        assert.strictEqual(host.textContent, '5');
        ctx.container.get(IScheduler).getRenderTaskQueue().flush();
        assert.strictEqual(host.textContent, '6');
      }
    },
    {
      title: 'works with multiple layers of fn call',
      template: `\${total}`,
      ViewModel: class App {
        public items: IAppItem[] = Array.from({ length: 10 }, (_, idx) => {
          return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
        });

        public get total(): number {
          return this
            .items
            .filter(item => item.isDone)
            .filter(item => item.value > 1)
            .length;
        }
      },
      assertFn: (ctx, host, component) => {
        const observer = ctx
          .container
          .get(IObserverLocator)
          .getObserver(
            LifecycleFlags.none,
            component,
            'total'
          ) as GetterObserver;

        assert.strictEqual(observer['propertyDeps']?.length, 17);
        assert.strictEqual(observer['collectionDeps']?.length, 1);

        observer['propertyDeps'].forEach((observerDep: SetterObserver) => {
          assert.instanceOf(observerDep, SetterObserver);
        });

        assert.html.textContent(host, '4');
        component.items[1].isDone = true;
        assert.html.textContent(host, '4');
        ctx.container.get(IScheduler).getRenderTaskQueue().flush();
        assert.html.textContent(host, '5');
      }
    },
    {
      title: 'works with Map.size',
      template: `\${total}`,
      ViewModel: class App {
        public items: IAppItem[] = Array.from({ length: 10 }, (_, idx) => {
          return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
        });

        public itemMap: Map<any, any> = new Map([1,2,3].map(i => [`item - ${i}`, i]));

        public get total(): number {
          return this.itemMap.size;
        }
      },
      assertFn: (ctx, host, component) => {
        const observer = ctx
          .container
          .get(IObserverLocator)
          .getObserver(
            LifecycleFlags.none,
            component,
            'total'
          ) as GetterObserver;

        assert.strictEqual(observer['propertyDeps']?.length, 1);
        assert.strictEqual(observer['collectionDeps']?.length, 1);

        observer['propertyDeps'].forEach((observerDep: SetterObserver) => {
          assert.instanceOf(observerDep, SetterObserver);
        });
        observer['collectionDeps'].forEach((observerCollectionDep: MapObserver) => {
          assert.instanceOf(observerCollectionDep, MapObserver);
        });

        assert.strictEqual(host.textContent, '3');
        component.itemMap.set(`item - 4`, 10);
        assert.strictEqual(host.textContent, '3');
        ctx.container.get(IScheduler).getRenderTaskQueue().flush();
        assert.strictEqual(host.textContent, '4');
      }
    },
    {
      title: 'works with multiple computed dependencies',
      template: `\${total}`,
      ViewModel: class App {
        public items: IAppItem[] = Array.from({ length: 10 }, (_, idx) => {
          return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
        });

        public get activeItems(): IAppItem[] {
          return this.items.filter(i => !i.isDone);
        }

        public get total(): number {
          return this.activeItems.reduce((total, item) => total + item.value, 0);
        }
      },
      assertFn: (ctx, host, component) => {
        const observerLocator = ctx.container.get(IObserverLocator);
        const totalPropObserver = observerLocator.getObserver(
          LifecycleFlags.none,
          component,
          'total'
        ) as GetterObserver;

        assert.strictEqual(totalPropObserver['propertyDeps']?.length, 7);
        assert.strictEqual(totalPropObserver['collectionDeps']?.length, 1);

        totalPropObserver['propertyDeps'].forEach((observerDep: SetterObserver, idx: number) => {
          if (idx === 0) {
            assert.instanceOf(observerDep, GetterObserver);
          } else {
            assert.instanceOf(observerDep, SetterObserver);
          }
        });

        assert.strictEqual(host.textContent, '30' /* idx 0, 2, 4, 6, 8 only */);
        component.items[0].isDone = false;
        assert.strictEqual(component.activeItems.length, 6);
        assert.strictEqual(host.textContent, '30');
        ctx.container.get(IScheduler).getRenderTaskQueue().flush();
        assert.strictEqual(host.textContent, '31');
      }
    },
    {
      title: 'Works with <let/>',
      template: `<let real-total.bind="total * 2"></let>\${realTotal}`,
      ViewModel: class App {
        public items: IAppItem[] = Array.from({ length: 10 }, (_, idx) => {
          return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
        });

        public get total(): number {
          return this.items.reduce((total, item) => total + item.value, 0);
        }
      },
      assertFn: (ctx, host, component) => {
        assert.strictEqual(host.textContent, '110');
        component.items[0].value = 100;
        assert.strictEqual(host.textContent, '110');
        ctx.container.get(IScheduler).getRenderTaskQueue().flush();
        assert.strictEqual(host.textContent, '308');
      }
    },
    {
      title: 'Works with [repeat]',
      template: `<div repeat.for="item of activeItems">\${item.value}.</div>`,
      ViewModel: class App {
        public items: IAppItem[] = Array.from({ length: 10 }, (_, idx) => {
          return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
        });

        public get activeItems(): IAppItem[] {
          return this.items.filter(i => !i.isDone);
        }

        public get total(): number {
          return this.activeItems.reduce((total, item) => total + item.value, 0);
        }
      },
      assertFn: (ctx, host, component) => {
        assert.strictEqual(host.textContent, '2.4.6.8.10.');
        component.items[1].isDone = true;
        // todo: why so eagerly?
        assert.strictEqual(host.textContent, '4.6.8.10.');
      }
    },
    {
      title: 'Works with set/get (class property)',
      template: `<input value.bind="nameProp.value">\${nameProp.value}`,
      ViewModel: class App {
        public items: IAppItem[] = [];
        public total: number = 0;
        public nameProp: Property = new Property('value', '');
      },
      assertFn: (ctx, host, component) => {
        assert.strictEqual(host.textContent, '');
        const inputEl = host.querySelector('input');
        inputEl.value = '50';
        inputEl.dispatchEvent(new ctx.CustomEvent('input'));
        assert.strictEqual(host.textContent, '');
        ctx.container.get(IScheduler).getRenderTaskQueue().flush();
        assert.strictEqual(host.textContent, '50');
        assert.strictEqual(component.nameProp.value, '50');
        assert.strictEqual(component.nameProp._value, '50');

        const observerLocator = ctx.container.get(IObserverLocator);
        const namePropValueObserver = observerLocator
          .getObserver(
            LifecycleFlags.none,
            component.nameProp,
            'value'
          ) as CustomSetterObserver;

        assert.instanceOf(namePropValueObserver, CustomSetterObserver);
        assert.strictEqual(
          namePropValueObserver['descriptor']?.get,
          Object.getOwnPropertyDescriptor(Property.prototype, 'value').get,
          'It should have kept information about the original descriptor [[get]]'
        );
        assert.strictEqual(
          namePropValueObserver['descriptor']?.set,
          Object.getOwnPropertyDescriptor(Property.prototype, 'value').set,
          'It should have kept information about the original descriptor [[set]]'
        );
      }
    },
    {
      title: 'Works with set/get (object literal property)',
      template: `<input value.bind="nameProp.value">\${nameProp.value}`,
      ViewModel: class App {
        public items: IAppItem[] = [];
        public total: number = 0;
        public nameProp: any = {
          _value: '',
          get value() {
            return this._value;
          },
          set value(v: string) {
            this._value = v;
            this.valueChanged.publish();
          },
          valueChanged: {
            publish() {/*  */}
          }
        };
      },
      assertFn: (ctx, host, component) => {
        assert.strictEqual(host.textContent, '');
        const inputEl = host.querySelector('input');
        inputEl.value = '50';
        inputEl.dispatchEvent(new ctx.CustomEvent('input'));
        assert.strictEqual(host.textContent, '');
        ctx.container.get(IScheduler).getRenderTaskQueue().flush();
        assert.strictEqual(host.textContent, '50');
        assert.strictEqual(component.nameProp.value, '50');
        assert.strictEqual(component.nameProp._value, '50');

        const observerLocator = ctx.container.get(IObserverLocator);
        const namePropValueObserver = observerLocator
          .getObserver(
            LifecycleFlags.none,
            component.nameProp,
            'value'
          ) as CustomSetterObserver;

        assert.instanceOf(namePropValueObserver, CustomSetterObserver);
      }
    }
  ];

  eachCartesianJoin(
    [computedObserverTestCases],
    ({ only, title, template, ViewModel, assertFn }: IComputedObserverTestCase) => {
      // eslint-disable-next-line mocha/no-exclusive-tests
      const $it = (title_: string, fn: Mocha.Func) => only ? it.only(title_, fn) : it(title_, fn);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      $it(title, async function () {
        const { ctx, component, testHost, tearDown } = await createFixture<any>(
          template,
          ViewModel
        );
        await assertFn(ctx, testHost, component);
        // test cases could be sharing the same context document
        // so wait a bit before running the next test
        await tearDown();

        assert.isSchedulerEmpty();
      });
    }
  );

  async function createFixture<T>(template: string | Node, $class: Constructable | null, ...registrations: any[]) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, observerLocator } = ctx;
    registrations = Array.from(new Set([...registrations]));
    container.register(...registrations);
    const testHost = ctx.doc.body.appendChild(ctx.createElement('div'));
    const appHost = testHost.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template, strategy: BindingStrategy.proxies }, $class);
    const component = new App();

    au.app({ host: appHost, component });
    await au.start().wait();

    return {
      ctx: ctx,
      au,
      container,
      lifecycle,
      testHost: testHost,
      appHost,
      component: component as T,
      observerLocator,
      tearDown: async () => {
        await au.stop().wait();
        testHost.remove();
      }
    };
  }

  class Property {
    private _value: string;
    public readonly valueChanged: any;

    public constructor(public readonly name: string, value: string) {
      this._value = value;
      this.valueChanged = {
        publish: () => {
          // todo
        }
      };
    }

    public get value(): string {
      return this._value;
    }

    public set value(value: string) {
      this._value = value;
      this.valueChanged.publish();
    }
  }
});
