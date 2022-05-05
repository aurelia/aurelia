import { ComputedObserver, IDirtyChecker, IObserverLocator } from '@aurelia/runtime';
import {
  CustomElement,
  Aurelia,
} from '@aurelia/runtime-html';
import {
  Constructable,
} from '@aurelia/kernel';
import {
  assert,
  eachCartesianJoin,
  TestContext,
} from '@aurelia/testing';

describe('3-runtime-html/computed-observer.spec.ts', function () {
  interface IComputedObserverTestCase<T extends IApp = IApp> {
    title: string;
    template: string;
    ViewModel?: Constructable<T>;
    assertFn: AssertionFn<T>;
    only?: boolean;
  }

  interface AssertionFn<T extends IApp> {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    (ctx: TestContext, testHost: HTMLElement, component: T): void | Promise<void>;
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
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(host.textContent, '140');

        component.items.splice(1, 1, { name: 'item - 1', value: 100 });
        // todo: this scenario
        // component.items[1] = { name: 'item - 1', value: 100 };
        assert.strictEqual(host.textContent, '140');
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(host.textContent, '240');
      },
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
        assert.strictEqual(host.textContent, '5');
        component.items[1].isDone = true;
        assert.strictEqual(host.textContent, '5');
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(host.textContent, '6');
      },
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
        assert.html.textContent(host, '4');
        component.items[1].isDone = true;
        assert.html.textContent(host, '4');
        ctx.platform.domWriteQueue.flush();
        assert.html.textContent(host, '5');
      },
    },
    {
      title: 'works with Map.size',
      template: `\${total}`,
      ViewModel: class App {
        public items: IAppItem[] = Array.from({ length: 10 }, (_, idx) => {
          return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
        });

        public itemMap: Map<any, any> = new Map([1, 2, 3].map(i => [`item - ${i}`, i]));

        public get total(): number {
          return this.itemMap.size;
        }
      },
      assertFn: (ctx, host, component) => {
        assert.strictEqual(host.textContent, '3');
        component.itemMap.set(`item - 4`, 10);
        assert.strictEqual(host.textContent, '3');
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(host.textContent, '4');
      },
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
        assert.strictEqual(host.textContent, '30' /* idx 0, 2, 4, 6, 8 only */);
        component.items[0].isDone = false;
        assert.strictEqual(component.activeItems.length, 6);
        assert.strictEqual(host.textContent, '30');
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(host.textContent, '31');
      },
    },
    {
      title: 'works with array index',
      template: `\${total}`,
      ViewModel: class AppBase implements IApp {
        public items: IAppItem[] = Array.from({ length: 10 }, (_, idx) => {
          return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
        });

        public get total(): number {
          return this.items[0].value;
        }
      },
      assertFn: (ctx, host, component) => {
        const dirtyChecker = ctx.container.get(IDirtyChecker) as any;
        assert.strictEqual((dirtyChecker.tracked as any[]).length, 0, 'Should have had no dirty checking');
        assert.html.textContent(host, '1');
        component.items.splice(0, 1, { name: 'mock', value: 1000 });
        assert.html.textContent(host, '1');
        ctx.platform.domWriteQueue.flush();
        assert.html.textContent(host, '1000');
      },
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
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(host.textContent, '308');
      },
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
      },
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
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(host.textContent, '50');
        assert.strictEqual(component.nameProp.value, '50');
        assert.strictEqual(component.nameProp._value, '50');

        const observerLocator = ctx.container.get(IObserverLocator);
        const namePropValueObserver = observerLocator
          .getObserver(component.nameProp, 'value') as ComputedObserver;

        assert.instanceOf(namePropValueObserver, ComputedObserver);
        assert.strictEqual(
          namePropValueObserver.get,
          Object.getOwnPropertyDescriptor(Property.prototype, 'value').get,
          'It should have kept information about the original descriptor [[get]]',
        );
        assert.strictEqual(
          namePropValueObserver.set,
          Object.getOwnPropertyDescriptor(Property.prototype, 'value').set,
          'It should have kept information about the original descriptor [[set]]',
        );
      },
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
            publish() {/*  */ },
          },
        };
      },
      assertFn: (ctx, host, component) => {
        assert.strictEqual(host.textContent, '');
        const inputEl = host.querySelector('input');
        inputEl.value = '50';
        inputEl.dispatchEvent(new ctx.CustomEvent('input'));
        assert.strictEqual(host.textContent, '');
        ctx.platform.domWriteQueue.flush();
        assert.strictEqual(host.textContent, '50');
        assert.strictEqual(component.nameProp.value, '50');
        assert.strictEqual(component.nameProp._value, '50');

        const observerLocator = ctx.container.get(IObserverLocator);
        const namePropValueObserver = observerLocator
          .getObserver(component.nameProp, 'value',) as ComputedObserver;

        assert.instanceOf(namePropValueObserver, ComputedObserver);
      },
    },
    /* eslint-disable */
    ...(<[string, () => any][]>[
      ['ArrayBuffer', () => new ArrayBuffer(0)],
      ['Boolean', () => new Boolean()],
      ['DataView', () => new DataView(new ArrayBuffer(0))],
      ['Date', () => new Date()],
      ['Error', () => new Error()],
      ['EvalError', () => new EvalError()],
      ['Float32Array', () => new Float32Array()],
      ['Float64Array', () => new Float64Array()],
      ['Function', () => new Function('')],
      ['Int8Array', () => new Int8Array()],
      ['Int16Array', () => new Int16Array()],
      ['Int64Array', () => new Int32Array()],
      ['Number', () => new Number()],
      ['Promise', () => new Promise<void>(r => r())],
      ['RangeError', () => new RangeError()],
      ['ReferenceError', () => new ReferenceError()],
      ['RegExp', () => new RegExp('a')],
      // ideally, properties on Map & Set that are not special (methods & 'size')
      // should be treated as normal properties, and should be observable by getter/setter
      // though probably it's good to start with not observing unless there's a need for it
      // example: Map/Set subclasses that have special properties.
      // todo: add connectable.observe(target, key) in proxy-observation.ts
      ['Map', () => new Map()],
      ['Set', () => new Set()],
      ['SharedArrayBuffer', () => new SharedArrayBuffer(0)],
      ['String', () => new String()],
      ['SyntaxError', () => new SyntaxError()],
      ['TypeError', () => new TypeError()],
      ['Uint8Array', () => new Uint8Array()],
      ['Uint8ClampedArray', () => new Uint8ClampedArray()],
      ['Uint16Array', () => new Uint16Array()],
      ['Uint32Array', () => new Uint32Array()],
      ['URIError', () => new URIError()],
      ['WeakMap', () => new WeakMap()],
      ['WeakSet', () => new WeakSet()],
      ['Math', () => Math],
      ['JSON', () => JSON],
      ['Reflect', () => Reflect],
      ['Atomics', () => Atomics],
    ]).filter(([title, createInstrinsic]) => {
      try {
        switch (Object.prototype.toString.call(createInstrinsic())) {
          case '[object Object]':
          case '[object Array]':
          case '[object Set]':
          case '[object Map]':
            return false;
          default:
            return true;
        }
      } catch {
        return false;
      }
    }).map(([title, createInstrinsic]) => {
      return <IComputedObserverTestCase>{
        title: `does not observe ${title}`,
        template: `<div>\${someProp || 'no value'}</div>`,
        ViewModel: class App {
          public items: IAppItem[] = [];
          public total: number = 0;
          public instrinsic: any = createInstrinsic();

          public get someProp() {
            return this.instrinsic.someProp;
          }
        },
        assertFn: (ctx, host, component: IApp & { instrinsic?: any; someProp?: any }) => {
          assert.strictEqual(host.textContent, 'no value');

          component.instrinsic.someProp = 'value';
          assert.strictEqual(host.textContent, 'no value');
          ctx.platform.domWriteQueue.flush();
          assert.strictEqual(host.textContent, 'no value');

          component.instrinsic = { someProp: 'has value' };
          assert.strictEqual(host.textContent, 'no value');
          ctx.platform.domWriteQueue.flush();
          assert.strictEqual(host.textContent, 'has value');
        },
      }
    }),
    /* eslint-enable */
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
          ViewModel,
        );
        await assertFn(ctx, testHost, component);
        // test cases could be sharing the same context document
        // so wait a bit before running the next test
        await tearDown();
      });
    },
  );

  it('works with two layers of getter', async function () {
    const { appHost, tearDown } = await createFixture(
      `\${msg}`,
      class MyApp {
        public get one() {
          return 'One';
        }
        public get onetwo() {
          return `${this.one} two`;
        }

        public get msg(): string {
          return this.onetwo;
        }
      }
    );

    assert.html.textContent(appHost, 'One two');

    await tearDown();
  });

  it('observers property in 2nd layer getter', async function () {
    const { ctx, component, appHost, tearDown } = await createFixture(
      `\${msg}`,
      class MyApp {
        public message = 'One';
        public get one() {
          return this.message;
        }
        public get onetwo() {
          return `${this.one} two`;
        }

        public get msg(): string {
          return this.onetwo;
        }
      }
    );

    assert.html.textContent(appHost, 'One two');

    component.message = '1';
    ctx.platform.domWriteQueue.flush();
    assert.html.textContent(appHost, '1 two');

    await tearDown();
  });

  async function createFixture<T>(template: string | Node, $class: Constructable<T> | null, ...registrations: any[]) {
    const ctx = TestContext.create();
    const { container, observerLocator } = ctx;
    registrations = Array.from(new Set([...registrations]));
    container.register(...registrations);
    const testHost = ctx.doc.body.appendChild(ctx.createElement('div'));
    const appHost = testHost.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template }, $class);
    const component = new App();

    au.app({ host: appHost, component });
    await au.start();

    return {
      ctx: ctx,
      au,
      container,
      testHost: testHost,
      appHost,
      component: component as T,
      observerLocator,
      tearDown: async () => {
        await au.stop();
        testHost.remove();

        au.dispose();
      },
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
