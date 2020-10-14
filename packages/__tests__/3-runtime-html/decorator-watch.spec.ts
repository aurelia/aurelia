import { watch } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/decorator-watch.spec.ts', function () {
  it('typings work', function () {
    const symbolMethod = Symbol();
    @watch<App>(app => app.col.has(Symbol), 5)
    @watch<App>(app => app.col.has(Symbol), 'someMethod')
    @watch<App>(app => app.col.has(Symbol), symbolMethod)
    @watch<App>(app => app.col.has(Symbol), (value, oldValue, app) => {})
    @watch<App>('some.expression', 5)
    @watch<App>('some.expression', 'someMethod')
    @watch<App>('some.expression', symbolMethod)
    @watch<App>('some.expression', (v, o, a) => {/* empty */})
    @watch<App>('some.expression', function(v, o, a) {/* some callback */})
    @watch<App>(Symbol(), 5)
    @watch<App>(Symbol(), 'someMethod')
    @watch<App>(Symbol(), symbolMethod)
    @watch<App>(Symbol(), (v, o, a) => {})
    @watch<App>(Symbol(), function(v, o, a) {/* some callback */})
    class App {
      public col: Map<unknown, unknown>

      @watch<App>(app => app.col.has(Symbol))
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

  it('observes collection', function () {
    let callCount = 0;
    let latestDelivered: IDelivery[] = [];
    interface IDelivery {
      id: number; name: string; delivered: boolean;
    }
    class PostOffice {
      public storage: IDelivery[] = [
        { id: 1, name: 'box', delivered: false },
        { id: 2, name: 'toy', delivered: true },
        { id: 3, name: 'letter', delivered: false },
      ];

      public deliveries: IDelivery[];

      public constructor() {
        (this.deliveries = [this.storage[1]]).toString = function() {
          return JSON.stringify(this);
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
        deliveries.toString = function() {
          return JSON.stringify(this);
        };
        latestDelivered = this.deliveries = deliveries;
      }
    }

    const { ctx, component, appHost, tearDown } = createFixture(`<div>\${deliveries}</div>`, PostOffice);

    const textNode = appHost.querySelector('div');
    assert.strictEqual(callCount, 0);
    assert.strictEqual(textNode.textContent, JSON.stringify([{ id: 2, name: 'toy', delivered: true }]));

    component.newDelivery({ id: 4, name: 'cookware', delivered: false });
    assert.strictEqual(callCount, 1);
    ctx.scheduler.getRenderTaskQueue().flush();
    assert.strictEqual(textNode.textContent, JSON.stringify([{ id: 2, name: 'toy', delivered: true }]));

    component.delivered(1);
    assert.strictEqual(callCount, 2);
    assert.strictEqual(textNode.textContent, JSON.stringify([{ id: 2, name: 'toy', delivered: true }]));
    ctx.scheduler.getRenderTaskQueue().flush();
    assert.strictEqual(
      textNode.textContent,
      JSON.stringify([
        { id: 1, name: 'box', delivered: true },
        { id: 2, name: 'toy', delivered: true }
      ])
    );

    tearDown();
    component.newDelivery({ id: 5, name: 'gardenware', delivered: true });
    component.delivered(3);
    assert.strictEqual(
      textNode.textContent,
      JSON.stringify([
        { id: 1, name: 'box', delivered: true },
        { id: 2, name: 'toy', delivered: true }
      ])
    );
    ctx.scheduler.getRenderTaskQueue().flush();
    assert.strictEqual(
      textNode.textContent,
      JSON.stringify([
        { id: 1, name: 'box', delivered: true },
        { id: 2, name: 'toy', delivered: true }
      ])
    );
  });

  it('observes chain lighting', function () {
    let callCount = 0;
    let latestDelivered: IDelivery[] = [];
    interface IDelivery {
      id: number; name: string; delivered: boolean;
    }
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
  });

  describe('Map/Set', function () {
    const symbol = Symbol();
    interface IApp {
      col: Map<unknown, unknown>;
      symbols: number;
    }

    for (const [fn] of [
      [(app: IApp) => Array.from(app.col.values()).filter(v => v === symbol).length],
      // [(app: IApp) => app.col.has(symbol) ? app.symbols++ : 0]
    ]) {
      it('observes when declared on method', function () {
        let callCount = 0;
        class App implements IApp {
          public col: Map<unknown, unknown> = new Map();
          public symbols: number = 0;
  
          @watch(fn as any)
          public log(symbols: number) {
            callCount++;
            this.symbols = symbols;
          }
        }

        const { component, tearDown } = createFixture('', App);

        assert.strictEqual(callCount, 0);
        component.col.set('a', 1);
        assert.strictEqual(callCount, 0);
        component.col.set('b', symbol);
        assert.strictEqual(callCount, 1);
        component.col.set('a', 2);
        assert.strictEqual(callCount, 1);
  
        tearDown();
        component.col.set('a', symbol);
        assert.strictEqual(callCount, 1);
      });
    }

    it('observes', function () {
      let callCount = 0;
      const symbol = Symbol();
      class App {
        public col: Map<unknown, unknown> = new Map();
        public symbols: number = 0;

        @watch((app: App) => Array.from(app.col.values()).filter(v => v === symbol).length)
        public log(symbols: number) {
          callCount++;
          this.symbols = symbols;
        }
      }

      const { component, tearDown } = createFixture('', App);

      assert.strictEqual(callCount, 0);
      component.col.set('a', 1);
      assert.strictEqual(callCount, 0);
      component.col.set('b', symbol);
      assert.strictEqual(callCount, 1);
      component.col.set('a', 2);
      assert.strictEqual(callCount, 1);

      tearDown();
      component.col.set('a', symbol);
      assert.strictEqual(callCount, 1);
    });
  });
});
