import { watch, IDepCollectionFn, customElement, bindable, ComputedWatcher, ICustomElementViewModel, customAttribute } from '@aurelia/runtime';
import { assert, createFixture, HTMLTestContext } from '@aurelia/testing';

describe('3-runtime-html/decorator-watch.spec.ts', function () {
  it('typings work', function () {
    const symbolMethod = Symbol();
    @watch<App>(app => app.col.has(Symbol), 5)
    @watch<App>(app => app.col.has(Symbol), 'someMethod')
    @watch<App>(app => app.col.has(Symbol), symbolMethod)
    @watch<App>(app => app.col.has(Symbol), (v, o, a) => a.someMethod(v, o, a))
    @watch((app: App) => app.col.has(Symbol), 5)
    @watch((app: App) => app.col.has(Symbol), 'someMethod')
    @watch((app: App) => app.col.has(Symbol), symbolMethod)
    @watch((app: App) => app.col.has(Symbol), (v, o, a) => a.someMethod(v, o, a))
    @watch<App>('some.expression', 5)
    @watch<App>('some.expression', 'someMethod')
    @watch<App>('some.expression', symbolMethod)
    @watch<App>('some.expression', (v, o, a) => a.someMethod(v, o, a))
    @watch<App>('some.expression', function (v, o, a) { a.someMethod(v, o, a); })
    @watch<App>(Symbol(), 5)
    @watch<App>(Symbol(), 'someMethod')
    @watch<App>(Symbol(), symbolMethod)
    @watch<App>(Symbol(), (v, o, a) => a.someMethod(v, o, a))
    @watch<App>(Symbol(), function (v, o, a) { a.someMethod(v, o, a); })
    class App {
      public col: Map<unknown, unknown>;

      @watch<App>(app => app.col.has(Symbol))
      @watch((app: App) => app.col.has(Symbol))
      @watch('some.expression')
      @watch(Symbol())
      @watch(5)
      public someMethod(n: unknown, o: unknown, app: App) {/* empty */}
      public [symbolMethod](n: unknown, o: unknown, app: App) {/* empty */}
      public [5](n: unknown, o: unknown, app: App) {/* empty */}
    }

    const app = new App();
    assert.strictEqual(app.col, undefined);
  });

  for (const methodName of [Symbol('method'), 'bla', 5]) {
    it(`validates method "${String(methodName)}" not found when decorating on class`, function () {
      assert.throws(() => {
        @watch('..', methodName as any)
        class App {}

        return new App();
      }, /Invalid change handler config/);
    });
  }

  it('works in basic scenario', function () {
    let callCount = 0;
    class App {
      public person = {
        first: 'bi',
        last: 'go',
        phone: '0134',
        address: '1/34'
      };
      public name = '';

      @watch((test: App) => test.person.phone)
      public phoneChanged(phoneValue: string) {
        callCount++;
        this.name = phoneValue;
      }
    }
    const { ctx, component, appHost, tearDown } = createFixture(`\${name}`, App);

    // with TS, initialization of class field are in constructor
    assert.strictEqual(callCount, 0);
    component.person.first = 'bi ';
    assert.strictEqual(callCount, 0);
    ctx.scheduler.getRenderTaskQueue().flush();
    assert.strictEqual(appHost.textContent, '');
    component.person.phone = '0413';
    assert.strictEqual(callCount, 1);
    assert.strictEqual(appHost.textContent, '');
    ctx.scheduler.getRenderTaskQueue().flush();
    assert.strictEqual(appHost.textContent, '0413');

    tearDown();
  });

  it('watches deep', function () {
    let callCount = 0;
    class App {
      public person = {
        first: 'bi',
        last: 'go',
        phone: '0134',
        addresses: [
          {
            primary: false,
            number: 3,
            strName: 'Aus',
            state: 'ACT'
          },
          {
            primary: true,
            number: 3,
            strName: 'Aus',
            state: 'VIC'
          }
        ]
      };
      public name = '';

      @watch((app: App) => app.person.addresses.find(addr => addr.primary).strName)
      public phoneChanged(strName: string) {
        callCount++;
        this.name = strName;
      }
    }
    const { ctx, component, appHost, tearDown } = createFixture(`<div>\${name}</div>`, App);

    const textNode = appHost.querySelector('div');

    // with TS, initialization of class field are in constructor
    assert.strictEqual(callCount, 0);
    component.person.addresses[1].state = 'QLD';
    assert.strictEqual(callCount, 0);
    component.person.addresses[1].strName = '3cp';
    assert.strictEqual(callCount, 1);
    assert.strictEqual(textNode.textContent, '');
    ctx.scheduler.getRenderTaskQueue().flush();
    assert.strictEqual(textNode.textContent, '3cp');

    tearDown();

    component.person.addresses[1].strName = 'Chunpeng Huo';
    assert.strictEqual(textNode.textContent, '3cp');
    ctx.scheduler.getRenderTaskQueue().flush();
    assert.strictEqual(textNode.textContent, '3cp');
  });

  describe('timing', function () {
    it('ensures proper timing with custom elements', async function () {
      let childBeforeBindCallCount = 0;
      let childAfterBindCallCount = 0;
      let childBeforeUnbindCallCount = 0;
      let childAfterUnbindCallCount = 0;
      let appBeforeBindCallCount = 0;
      let appAfterBindCallCount = 0;
      let appBeforeUnbindCallCount = 0;
      let appAfterUnbindCallCount = 0;

      @customElement({ name: 'child', template: '${prop}' })
      class Child {
        @bindable()
        public prop = 0;
        public logCallCount = 0;

        @watch((child: Child) => child.prop)
        public log(): void {
          this.logCallCount++;
        }

        public beforeBind(): void {
          childBeforeBindCallCount++;
          assert.strictEqual(this.logCallCount, 0);
          this.prop++;
          assert.strictEqual(this.logCallCount, 0);
        }

        public afterBind(): void {
          childAfterBindCallCount++;
          assert.strictEqual(this.logCallCount, 0);
          this.prop++;
          assert.strictEqual(this.logCallCount, 1);
        }

        public beforeUnbind(): void {
          childBeforeUnbindCallCount++;
          // test body prop changed, callCount++
          // parent prop changed, callCount++
          assert.strictEqual(this.logCallCount, 3);
          this.prop++;
          assert.strictEqual(this.logCallCount, 4);
        }

        public afterUnbind(): void {
          childAfterUnbindCallCount++;
          assert.strictEqual(this.logCallCount, 4);
          this.prop++;
          assert.strictEqual(this.logCallCount, 4);
        }
      }

      class App {
        public child: Child;

        @bindable()
        public prop = 1;
        public logCallCount = 0;

        @watch((child: App) => child.prop)
        public log(): void {
          this.logCallCount++;
        }

        public beforeBind(): void {
          appBeforeBindCallCount++;
          assert.strictEqual(this.logCallCount, 0);
          this.prop++;
          assert.strictEqual(this.logCallCount, 0);
        }

        public afterBind(): void {
          appAfterBindCallCount++;
          assert.strictEqual(this.logCallCount, 0);
          assert.strictEqual(this.child.logCallCount, 0);
          this.prop++;
          assert.strictEqual(this.logCallCount, 1);
          // child after bind hasn't been called yet,
          // so watcher won't be activated and thus, no log call
          assert.strictEqual(this.child.logCallCount, 0);
        }

        public beforeUnbind(): void {
          appBeforeUnbindCallCount++;
          // already got the modification in the code below, so it starts at 2
          assert.strictEqual(this.logCallCount, 2);
          assert.strictEqual(this.child.logCallCount, 2);
          this.prop++;
          assert.strictEqual(this.logCallCount, 3);
        }

        public afterUnbind(): void {
          appAfterUnbindCallCount++;
          assert.strictEqual(this.logCallCount, 3);
          this.prop++;
          assert.strictEqual(this.logCallCount, 3);
        }
      }

      const { component, startPromise, tearDown } = createFixture('<child view-model.ref="child" prop.bind=prop>', App, [Child]);

      await startPromise;
      assert.strictEqual(appBeforeBindCallCount, 1);
      assert.strictEqual(appAfterBindCallCount, 1);
      assert.strictEqual(appBeforeUnbindCallCount, 0);
      assert.strictEqual(appAfterUnbindCallCount, 0);
      assert.strictEqual(childBeforeBindCallCount, 1);
      assert.strictEqual(childAfterBindCallCount, 1);

      assert.strictEqual(component.logCallCount, 1);
      assert.strictEqual(component.child.logCallCount, 1);
      component.prop++;
      assert.strictEqual(component.logCallCount, 2);
      assert.strictEqual(component.child.logCallCount, 2);

      const bindings = component.$controller!.bindings;
      assert.strictEqual(bindings.length, 3);
      // watcher should be created before all else
      assert.instanceOf(bindings[0], ComputedWatcher);

      const child = component.child;
      const childBindings = (child as ICustomElementViewModel).$controller!.bindings;
      assert.strictEqual(childBindings.length, 2);
      // watcher should be created before all else
      assert.instanceOf(childBindings[0], ComputedWatcher);
      await tearDown();

      assert.strictEqual(appBeforeBindCallCount, 1);
      assert.strictEqual(appAfterBindCallCount, 1);
      assert.strictEqual(appBeforeUnbindCallCount, 1);
      assert.strictEqual(appAfterUnbindCallCount, 1);
      assert.strictEqual(childBeforeBindCallCount, 1);
      assert.strictEqual(childAfterBindCallCount, 1);
      assert.strictEqual(childBeforeUnbindCallCount, 1);
      assert.strictEqual(childAfterUnbindCallCount, 1);

      assert.strictEqual(component.logCallCount, 3);
      assert.strictEqual(child.logCallCount, 4);
      component.prop++;
      assert.strictEqual(component.logCallCount, 3);
      assert.strictEqual(child.logCallCount, 4);
    });

    it('ensures proper timing with custom attribute', async function () {
      let childBeforeBindCallCount = 0;
      let childAfterBindCallCount = 0;
      let childBeforeUnbindCallCount = 0;
      let childAfterUnbindCallCount = 0;
      let appBeforeBindCallCount = 0;
      let appAfterBindCallCount = 0;
      let appBeforeUnbindCallCount = 0;
      let appAfterUnbindCallCount = 0;

      @customAttribute({ name: 'child' })
      class Child {
        @bindable()
        public prop = 0;
        public logCallCount = 0;

        @watch((child: Child) => child.prop)
        public log(): void {
          this.logCallCount++;
        }

        public beforeBind(): void {
          childBeforeBindCallCount++;
          assert.strictEqual(this.logCallCount, 0);
          this.prop++;
          assert.strictEqual(this.logCallCount, 0);
        }

        public afterBind(): void {
          childAfterBindCallCount++;
          assert.strictEqual(this.logCallCount, 0);
          this.prop++;
          assert.strictEqual(this.logCallCount, 1);
        }

        public beforeUnbind(): void {
          childBeforeUnbindCallCount++;
          // test body prop changed, callCount++
          // parent prop changed, callCount++
          assert.strictEqual(this.logCallCount, 3);
          this.prop++;
          assert.strictEqual(this.logCallCount, 4);
        }

        public afterUnbind(): void {
          childAfterUnbindCallCount++;
          assert.strictEqual(this.logCallCount, 4);
          this.prop++;
          assert.strictEqual(this.logCallCount, 4);
        }
      }

      class App {
        public child: Child;

        @bindable()
        public prop = 1;
        public logCallCount = 0;

        @watch((child: App) => child.prop)
        public log(): void {
          this.logCallCount++;
        }

        public beforeBind(): void {
          appBeforeBindCallCount++;
          assert.strictEqual(this.logCallCount, 0);
          this.prop++;
          assert.strictEqual(this.logCallCount, 0);
        }

        public afterBind(): void {
          appAfterBindCallCount++;
          assert.strictEqual(this.logCallCount, 0);
          assert.strictEqual(this.child.logCallCount, 0);
          this.prop++;
          assert.strictEqual(this.logCallCount, 1);
          // child after bind hasn't been called yet,
          // so watcher won't be activated and thus, no log call
          assert.strictEqual(this.child.logCallCount, 0);
        }

        public beforeUnbind(): void {
          appBeforeUnbindCallCount++;
          // already got the modification in the code below, so it starts at 2
          assert.strictEqual(this.logCallCount, 2);
          assert.strictEqual(this.child.logCallCount, 2);
          this.prop++;
          assert.strictEqual(this.logCallCount, 3);
        }

        public afterUnbind(): void {
          appAfterUnbindCallCount++;
          assert.strictEqual(this.logCallCount, 3);
          this.prop++;
          assert.strictEqual(this.logCallCount, 3);
        }
      }

      const { component, startPromise, tearDown } = createFixture('<div child.bind="prop" child.ref="child">', App, [Child]);

      await startPromise;
      assert.strictEqual(appBeforeBindCallCount, 1);
      assert.strictEqual(appAfterBindCallCount, 1);
      assert.strictEqual(appBeforeUnbindCallCount, 0);
      assert.strictEqual(appAfterUnbindCallCount, 0);
      assert.strictEqual(childBeforeBindCallCount, 1);
      assert.strictEqual(childAfterBindCallCount, 1);

      assert.strictEqual(component.logCallCount, 1);
      assert.strictEqual(component.child.logCallCount, 1);
      component.prop++;
      assert.strictEqual(component.logCallCount, 2);
      assert.strictEqual(component.child.logCallCount, 2);

      const bindings = component.$controller!.bindings;
      assert.strictEqual(bindings.length, 3);
      // watcher should be created before all else
      assert.instanceOf(bindings[0], ComputedWatcher);

      const child = component.child;
      const childBindings = (child as ICustomElementViewModel).$controller!.bindings;
      assert.strictEqual(childBindings.length, 1);
      // watcher should be created before all else
      assert.instanceOf(childBindings[0], ComputedWatcher);
      await tearDown();

      assert.strictEqual(appBeforeBindCallCount, 1);
      assert.strictEqual(appAfterBindCallCount, 1);
      assert.strictEqual(appBeforeUnbindCallCount, 1);
      assert.strictEqual(appAfterUnbindCallCount, 1);
      assert.strictEqual(childBeforeBindCallCount, 1);
      assert.strictEqual(childAfterBindCallCount, 1);
      assert.strictEqual(childBeforeUnbindCallCount, 1);
      assert.strictEqual(childAfterUnbindCallCount, 1);

      assert.strictEqual(component.logCallCount, 3);
      assert.strictEqual(child.logCallCount, 4);
      component.prop++;
      assert.strictEqual(component.logCallCount, 3);
      assert.strictEqual(child.logCallCount, 4);
    });
  });

  it('observes collection', function () {
    let callCount = 0;

    class PostOffice {
      public storage: IDelivery[] = [
        { id: 1, name: 'box', delivered: false },
        { id: 2, name: 'toy', delivered: true },
        { id: 3, name: 'letter', delivered: false },
      ];

      public deliveries: IDelivery[];

      public constructor() {
        (this.deliveries = [this.storage[1]]).toString = function () {
          return json(this);
        };
      }

      public newDelivery(delivery: IDelivery) {
        this.storage.push(delivery);
      }

      public delivered(id: number): void {
        const delivery = this.storage.find(delivery => delivery.id === id);
        if (delivery != null) {
          delivery.delivered = true;
        }
      }

      @watch((postOffice: PostOffice) => postOffice.storage.filter(d => d.delivered))
      public onDelivered(deliveries: IDelivery[]) {
        callCount++;
        deliveries.toString = function () {
          return json(this);
        };
        this.deliveries = deliveries;
      }
    }

    const { ctx, component, appHost, tearDown } = createFixture(`<div>\${deliveries}</div>`, PostOffice);

    const textNode = appHost.querySelector('div');
    assert.strictEqual(callCount, 0);
    assert.strictEqual(textNode.textContent, json([{ id: 2, name: 'toy', delivered: true }]));

    component.newDelivery({ id: 4, name: 'cookware', delivered: false });
    assert.strictEqual(callCount, 1);
    ctx.scheduler.getRenderTaskQueue().flush();
    assert.strictEqual(textNode.textContent, json([{ id: 2, name: 'toy', delivered: true }]));

    component.delivered(1);
    assert.strictEqual(callCount, 2);
    assert.strictEqual(textNode.textContent, json([{ id: 2, name: 'toy', delivered: true }]));
    ctx.scheduler.getRenderTaskQueue().flush();
    assert.strictEqual(
      textNode.textContent,
      json([
        { id: 1, name: 'box', delivered: true },
        { id: 2, name: 'toy', delivered: true }
      ])
    );

    tearDown();
    assert.strictEqual(appHost.textContent, '');
    component.newDelivery({ id: 5, name: 'gardenware', delivered: true });
    component.delivered(3);
    assert.strictEqual(
      textNode.textContent,
      json([
        { id: 1, name: 'box', delivered: true },
        { id: 2, name: 'toy', delivered: true }
      ])
    );
    ctx.scheduler.getRenderTaskQueue().flush();
    assert.strictEqual(
      textNode.textContent,
      json([
        { id: 1, name: 'box', delivered: true },
        { id: 2, name: 'toy', delivered: true }
      ])
    );
    assert.strictEqual(appHost.textContent, '');
  });

  it('observes chain lighting', function () {
    let callCount = 0;

    class PostOffice {
      public storage: IDelivery[] = [
        { id: 1, name: 'box', delivered: false },
        { id: 2, name: 'toy', delivered: true },
        { id: 3, name: 'letter', delivered: false },
      ];

      public deliveries: number;

      public constructor() {
        this.deliveries = 0;
      }

      public newDelivery(delivery: IDelivery) {
        this.storage.push(delivery);
      }

      public delivered(id: number): void {
        const delivery = this.storage.find(delivery => delivery.id === id);
        if (delivery != null) {
          delivery.delivered = true;
        }
      }

      @watch((postOffice: PostOffice) =>
        postOffice
          .storage
          .filter(d => d.delivered)
          .filter(d => d.name === 'box')
          .length
      )
      public boxDelivered(deliveries: number) {
        callCount++;
        this.deliveries = deliveries;
      }
    }

    const { ctx, component, appHost, tearDown } = createFixture(`<div>\${deliveries}</div>`, PostOffice);

    const textNode = appHost.querySelector('div');
    assert.strictEqual(callCount, 0);
    assert.strictEqual(textNode.textContent, '0');

    component.newDelivery({ id: 4, name: 'cookware', delivered: false });
    assert.strictEqual(callCount, 0);
    ctx.scheduler.getRenderTaskQueue().flush();
    assert.strictEqual(textNode.textContent, '0');

    component.delivered(1);
    assert.strictEqual(callCount, 1);
    assert.strictEqual(textNode.textContent, '0');
    ctx.scheduler.getRenderTaskQueue().flush();
    assert.strictEqual(textNode.textContent, '1');

    tearDown();

    component.newDelivery({ id: 5, name: 'gardenware', delivered: true });
    component.delivered(3);
    assert.strictEqual(textNode.textContent, '1');
    assert.strictEqual(callCount, 1);
    ctx.scheduler.getRenderTaskQueue().flush();
    assert.strictEqual(textNode.textContent, '1');
    component.newDelivery({ id: 6, name: 'box', delivered: true });
    ctx.scheduler.getRenderTaskQueue().flush();
    assert.strictEqual(textNode.textContent, '1');
  });

  describe('Erray', function () {
    const testCases: ITestCase[] = [
      {
        title: 'observes .filter()',
        init: () => Array.from(
          { length: 3 },
          (_, idx) => ({ id: idx + 1, name: `box ${idx + 1}`, delivered: false })
        ),
        get: post => post.packages.filter(d => d.delivered).length,
        created: post => {
          const decoratorCount = post.decoratorCount;
          assert.strictEqual(post.callCount, 0);
          post.newDelivery(4, 'box 4'); assert.strictEqual(post.callCount, 0);
          post.delivered(1);            assert.strictEqual(post.callCount, 1 * decoratorCount);
          post.delivered(4);            assert.strictEqual(post.callCount, 2 * decoratorCount);
          post.newDelivery(5, 'box 5'); assert.strictEqual(post.callCount, 2 * decoratorCount);
        },
        disposed: post => {
          const decoratorCount = post.decoratorCount;
          assert.strictEqual(post.callCount, 2 * decoratorCount);
          post.delivered(2);            assert.strictEqual(post.callCount, 2 * decoratorCount);
        }
      },
      {
        title: 'observes .find()',
        init: () => Array.from(
          { length: 3 },
          (_, idx) => ({ id: idx + 1, name: `box ${idx + 1}`, delivered: false })
        ),
        get: post => post.packages.find(d => d.delivered),
        created: post => {
          const decoratorCount = post.decoratorCount;
          assert.strictEqual(post.callCount, 0);
          post.newDelivery(4, 'box 4'); assert.strictEqual(post.callCount, 0);
          post.delivered(1);            assert.strictEqual(post.callCount, 1 * decoratorCount);
          post.delivered(4);            assert.strictEqual(post.callCount, 1 * decoratorCount);
          post.undelivered(4);          assert.strictEqual(post.callCount, 1 * decoratorCount);
          post.undelivered(1);          assert.strictEqual(post.callCount, 2 * decoratorCount);
        },
        disposed: post => {
          const decoratorCount = post.decoratorCount;
          assert.strictEqual(post.callCount, 2 * decoratorCount);
          post.delivered(1);            assert.strictEqual(post.callCount, 2 * decoratorCount);
        }
      },
      {
        title: 'observes .indexOf()',
        init: () => Array.from(
          { length: 3 },
          (_, idx) => ({ id: idx + 1, name: `box ${idx + 1}`, delivered: false })
        ),
        get: post => post.packages.indexOf(post.selected),
        created: post => {
          const decoratorCount = post.decoratorCount;
          assert.strictEqual(post.callCount, 0);
          post.selected = post.packages[2];     assert.strictEqual(post.callCount, 1 * decoratorCount);
          post.selected = post.packages[1];     assert.strictEqual(post.callCount, 2 * decoratorCount);
          post.selected = null;                 assert.strictEqual(post.callCount, 3 * decoratorCount);
        },
        disposed: post => {
          const decoratorCount = post.decoratorCount;
          assert.strictEqual(post.callCount, 3 * decoratorCount);
          post.selected = post.packages[1];     assert.strictEqual(post.callCount, 3 * decoratorCount);
        }
      },
      {
        title: 'observes .findIndex()',
        init: () => Array.from(
          { length: 3 },
          (_, idx) => ({ id: idx + 1, name: `box ${idx + 1}`, delivered: false })
        ),
        get: post => post.packages.findIndex(v => v === post.selected),
        created: post => {
          const decoratorCount = post.decoratorCount;
          assert.strictEqual(post.callCount, 0);
          post.selected = post.packages[2];     assert.strictEqual(post.callCount, 1 * decoratorCount);
          post.selected = post.packages[1];     assert.strictEqual(post.callCount, 2 * decoratorCount);
          post.selected = null;                 assert.strictEqual(post.callCount, 3 * decoratorCount);
        },
        disposed: post => {
          const decoratorCount = post.decoratorCount;
          assert.strictEqual(post.callCount, 3 * decoratorCount);
          post.selected = post.packages[1];     assert.strictEqual(post.callCount, 3 * decoratorCount);
        }
      },
      {
        title: 'observes .some()',
        init: () => Array.from(
          { length: 3 },
          (_, idx) => ({ id: idx + 1, name: `box ${idx + 1}`, delivered: false })
        ),
        get: post => post.packages.some(d => d.delivered),
        created: post => {
          const decoratorCount = post.decoratorCount;
          assert.strictEqual(post.callCount, 0);
          post.newDelivery(4, 'box 4'); assert.strictEqual(post.callCount, 0);
          post.delivered(1);            assert.strictEqual(post.callCount, 1 * decoratorCount);
          post.delivered(4);            assert.strictEqual(post.callCount, 1 * decoratorCount);
          post.undelivered(4);          assert.strictEqual(post.callCount, 1 * decoratorCount);
          post.undelivered(1);          assert.strictEqual(post.callCount, 2 * decoratorCount);
        },
        disposed: post => {
          const decoratorCount = post.decoratorCount;
          assert.strictEqual(post.callCount, 2 * decoratorCount);
          post.delivered(1);            assert.strictEqual(post.callCount, 2 * decoratorCount);
        }
      },
    ];

    for (const { title, only, init, get, created, disposed } of testCases) {
      const $it = only ? it.only : it;
      $it(`${title} on class`, async function () {
        @watch(get, 'log')
        class App implements IPostOffice {
          public decoratorCount: number = 1;
          public packages: IDelivery[] = init?.() ?? [];
          public selected: IDelivery;
          public counter: number = 0;
          public callCount: number = 0;

          public delivered(id: number): void {
            const p = this.packages.find(p => p.id === id);
            if (p) {
              p.delivered = true;
            }
          }

          public undelivered(id: number): void {
            const p = this.packages.find(p => p.id === id);
            if (p) {
              p.delivered = false;
            }
          }

          public newDelivery(id: number, name: string, delivered = false): void {
            this.packages.push({ id, name, delivered });
          }

          public log(): void {
            this.callCount++;
          }
        }

        const { component, ctx, startPromise, tearDown } = createFixture('', App);

        await startPromise;
        created(component, ctx, 1);
        await tearDown();
        disposed?.(component, ctx, 1);
      });

      $it(`${title} on method`, async function () {
        class App implements IPostOffice {
          public decoratorCount: number = 1;
          public packages: IDelivery[] = init?.() ?? [];
          public selected: IDelivery;
          public counter: number = 0;
          public callCount: number = 0;

          public delivered(id: number): void {
            const p = this.packages.find(p => p.id === id);
            if (p) {
              p.delivered = true;
            }
          }

          public undelivered(id: number): void {
            const p = this.packages.find(p => p.id === id);
            if (p) {
              p.delivered = false;
            }
          }

          public newDelivery(id: number, name: string, delivered = false): void {
            this.packages.push({ id, name, delivered });
          }

          @watch(get)
          public log(): void {
            this.callCount++;
          }
        }

        const { component, ctx, startPromise, tearDown } = createFixture('', App);

        await startPromise;
        created(component, ctx, 1);
        await tearDown();
        disposed?.(component, ctx, 1);
      });

      $it(`${title} on both class and method`, async function () {
        @watch(get, 'log')
        class App implements IPostOffice {
          public decoratorCount: number = 2;
          public packages: IDelivery[] = init?.() ?? [];
          public selected: IDelivery;
          public counter: number = 0;
          public callCount: number = 0;

          public delivered(id: number): void {
            const p = this.packages.find(p => p.id === id);
            if (p) {
              p.delivered = true;
            }
          }

          public undelivered(id: number): void {
            const p = this.packages.find(p => p.id === id);
            if (p) {
              p.delivered = false;
            }
          }

          public newDelivery(id: number, name: string, delivered = false): void {
            this.packages.push({ id, name, delivered });
          }

          @watch(get)
          public log(): void {
            this.callCount++;
          }
        }

        const { component, ctx, startPromise, tearDown } = createFixture('', App);

        await startPromise;
        created(component, ctx, 1);
        await tearDown();
        disposed?.(component, ctx, 1);
      });
    }

    interface IPostOffice {
      decoratorCount: number;
      packages: IDelivery[];
      selected: IDelivery;
      counter: number;
      callCount: number;

      newDelivery(id: number, name: string, delivered?: boolean): void;
      delivered(id: number): void;
      undelivered(id: number): void;
      log(): void;
    }

    interface ITestCase {
      title: string;
      only?: boolean;
      init?: () => IDelivery[];
      get: IDepCollectionFn<IPostOffice>;
      created: (post: IPostOffice, ctx: HTMLTestContext, decoratorCount: number) => any;
      disposed?: (post: IPostOffice, ctx: HTMLTestContext, decoratorCount: number) => any;
    }
  });

  describe('Map/Set', function () {
    const symbol = Symbol();

    const testCases: ITestCase[] = [
      {
        title: 'observes .get()',
        get: (app) => app.map.get(symbol),
        created: (app) => {
          app.map.set(symbol, 0);
          assert.strictEqual(app.callCount, 1 * app.decoratorCount);
          app.map.delete(symbol);
          assert.strictEqual(app.callCount, 2 * app.decoratorCount);
        },
        disposed: (app) => {
          app.map.set(symbol, 'a');
          assert.strictEqual(app.callCount, 2 * app.decoratorCount, 'after disposed');
        },
      },
      {
        title: 'observes .has()',
        // also asserts that mutation during getter run won't cause infinite run
        get: app => app.map.has(symbol) ? ++app.counter : 0,
        created: (app, _, decoratorCount) => {
          assert.strictEqual(app.counter, 0);
          assert.strictEqual(app.callCount, 0);
          app.map.set(symbol, '');
          // eslint-disable-next-line
          app.map.set(symbol, '');
          assert.strictEqual(app.counter, decoratorCount === 2 ? 3 : 1);
          assert.strictEqual(app.callCount, decoratorCount === 2 ? 3 : 1);
        },
        disposed: (app, _, decoratorCount) => {
          assert.strictEqual(app.counter,  decoratorCount === 2 ? 3 : 1);
          assert.strictEqual(app.callCount,  decoratorCount === 2 ? 3 : 1);
          app.map.set(symbol, '');
          assert.strictEqual(app.counter, decoratorCount === 2 ? 3 : 1);
          assert.strictEqual(app.callCount, decoratorCount === 2 ? 3 : 1);
        },
      },
      {
        title: 'observes .keys()',
        get: app => Array.from(app.map.keys()).filter(k => k === symbol).length,
        created: app => {
          assert.strictEqual(app.callCount, 0);
          app.map.set('a', 2);          assert.strictEqual(app.callCount, 0);
          app.map.set(symbol, '1');     assert.strictEqual(app.callCount, 1 * app.decoratorCount);
        },
      },
      {
        title: 'observers .values()',
        get: app => Array.from(app.map.values()).filter(v => v === symbol).length,
        created: app => {
          assert.strictEqual(app.callCount, 0);
          // mutate                     // assert the effect
          app.map.set('a', 2);          assert.strictEqual(app.callCount, 0);
          app.map.set('a', symbol);     assert.strictEqual(app.callCount, 1 * app.decoratorCount);
          app.map.set('b', symbol);     assert.strictEqual(app.callCount, 2 * app.decoratorCount);
        },
      },
      {
        title: 'observers @@Symbol.iterator',
        get: app => {
          let count = 0;
          for (const [, value] of app.map) {
            if (value === symbol) count++;
          }
          return count;
        },
        created: app => {
          assert.strictEqual(app.callCount, 0);
          // mutate                     // assert the effect
          app.map.set('a', 2);          assert.strictEqual(app.callCount, 0);
          app.map.set('a', symbol);     assert.strictEqual(app.callCount, 1 * app.decoratorCount);
          app.map.set('b', symbol);     assert.strictEqual(app.callCount, 2 * app.decoratorCount);
        },
      },
      {
        title: 'observers .entries()',
        get: app => {
          let count = 0;
          for (const [, value] of app.map) {
            if (value === symbol) count++;
          }
          return count;
        },
        created: app => {
          assert.strictEqual(app.callCount, 0);
          // mutate                     // assert the effect
          app.map.set('a', 2);          assert.strictEqual(app.callCount, 0);
          app.map.set('a', symbol);     assert.strictEqual(app.callCount, 1 * app.decoratorCount);
          app.map.set('b', symbol);     assert.strictEqual(app.callCount, 2 * app.decoratorCount);
        },
      },
      {
        title: 'does not observe mutation by .set()',
        get: app => app.map.set(symbol, 1),
        created: app => {
          assert.strictEqual(app.callCount, 0);
          app.map.set(symbol, 2);
          app.map.set(1, symbol);
          assert.strictEqual(app.callCount, 0);
        },
      },
      {
        title: 'does not observe mutation by .delete()',
        get: app => app.map.delete(symbol),
        created: app => {
          assert.strictEqual(app.callCount, 0);
          app.map.set(symbol, 2);       assert.strictEqual(app.callCount, 0);
          app.map.set(1, 2);            assert.strictEqual(app.callCount, 0);
          app.map.set(1, symbol);       assert.strictEqual(app.callCount, 0);
        },
      },
      {
        title: 'does not observe mutation by .clear()',
        get: app => app.map.clear(),
        created: app => {
          assert.strictEqual(app.callCount, 0);
          app.map.set(symbol, 2);       assert.strictEqual(app.callCount, 0);
          app.map.set(1, 2);            assert.strictEqual(app.callCount, 0);
          app.map.set(1, symbol);       assert.strictEqual(app.callCount, 0);
        },
      },
      {
        title: 'watcher callback is not invoked when getter throws error',
        get: app => {
          if (app.decoratorCount === 2) {
            if (app.counter++ <= 2) {
              return 0;
            }
          } else {
            if (app.counter++ === 0) {
              return 0;
            }
          }
          throw new Error('err');
        },
        created: app => {
          assert.strictEqual(app.callCount, 0);
          let ex: Error;
          try {
            if (app.decoratorCount === 2) {
              app.counter = 0;
            } else {
              app.counter++;
            }
          } catch (e) {
            ex = e;
          }
          assert.strictEqual(app.callCount, 0);
          assert.instanceOf(ex, Error);
          assert.strictEqual(ex.message, 'err');
        },
      },
      {
        title: 'works with ===',
        get: app => {
          let has = false;
          app.map.forEach(v => {
            if (v === app.selectedItem) {
              has = true;
            }
          });
          return has;
        },
        created: app => {
          assert.strictEqual(app.callCount, 0);
          const item1 = {};
          const item2 = {};
          app.map = new Map([[1, item1], [2, item2]]);
          assert.strictEqual(app.callCount, 0);
          app.selectedItem = item1;
          assert.strictEqual(app.callCount, 1 * app.decoratorCount);
        },
      },
      {
        title: 'works with Object.is()',
        get: app => {
          let has = false;
          app.map.forEach(v => {
            if (Object.is(v, app.selectedItem)) {
              has = true;
            }
          });
          return has;
        },
        created: app => {
          assert.strictEqual(app.callCount, 0);
          const item1 = {};
          const item2 = {};
          app.map = new Map([[1, item1], [2, item2]]);
          assert.strictEqual(app.callCount, 0);
          app.selectedItem = item1;
          assert.strictEqual(app.callCount, 1 * app.decoratorCount);
        },
      }
    ];

    for (const { title, only = false, get, created, disposed } of testCases) {
      const $it = only ? it.only : it;
      $it(`${title} on method`, async function () {
        class App implements IApp {
          public decoratorCount: number = 1;
          public map: Map<unknown, unknown> = new Map();
          public selectedItem: unknown = void 0;
          public counter: number = 0;
          public callCount = 0;

          @watch(get)
          public log() {
            this.callCount++;
          }
        }

        const { ctx, component, startPromise, tearDown } = createFixture('', App);
        await startPromise;
        created(component, ctx, 1);
        await tearDown();
        disposed?.(component, ctx, 1);
      });

      $it(`${title} on class`, async function () {
        @watch(get, (v, o, a) => a.log())
        class App implements IApp {
          public decoratorCount: number = 1;
          public map: Map<unknown, unknown> = new Map();
          public selectedItem: unknown;
          public counter: number = 0;
          public callCount = 0;

          public log() {
            this.callCount++;
          }
        }

        const { ctx, component, tearDown, startPromise } = createFixture('', App);
        await startPromise;
        created(component, ctx, 1);
        await tearDown();
        disposed?.(component, ctx, 1);
      });

      $it(`${title} on both class and method`, async function () {
        @watch(get, (v, o, a) => a.log())
        class App implements IApp {
          public decoratorCount: number = 2;
          public map: Map<unknown, unknown> = new Map();
          public selectedItem: unknown;
          public counter: number = 0;
          public callCount = 0;

          @watch(get)
          public log(): void {
            this.callCount++;
          }
        }

        const { ctx, component, startPromise, tearDown } = createFixture('', App);
        await startPromise;
        created(component, ctx, 2);
        await tearDown();
        disposed?.(component, ctx, 2);
      });
    }

    interface IApp {
      decoratorCount: number;
      map: Map<unknown, unknown>;
      selectedItem: unknown;
      counter: number;
      callCount: number;
      log(): void;
    }

    interface ITestCase {
      title: string;
      only?: boolean;
      get: IDepCollectionFn<IApp>;
      created: (app: IApp, ctx: HTMLTestContext, decoratorCount: number) => any;
      disposed?: (app: IApp, ctx: HTMLTestContext, decoratorCount: number) => any;
    }
  });

  interface IDelivery {
    id: number; name: string; delivered: boolean;
  }

  function json(d: any) {
    return JSON.stringify(d);
  }
});
