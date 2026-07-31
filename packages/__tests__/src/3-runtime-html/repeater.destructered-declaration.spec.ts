import {
  Class,
  Registration,
} from '@aurelia/kernel';
import {
  batch,
  BindingContext,
  type ISubscriberCollection,
  Scope,
  tasksSettled,
} from '@aurelia/runtime';
import {
  Aurelia,
  CustomElement,
  type IBinding,
  IPlatform,
  ISSRContext,
  Repeat,
  type ISyntheticView,
  type ISSRScope,
} from '@aurelia/runtime-html';
import {
  assert,
  createFixture,
  TestContext
} from '@aurelia/testing';
import {
  createSpecFunction,
  TestExecutionContext,
  TestFunction,
} from '../util.js';
import {
  Person,
} from '../validation/_test-resources.js';

describe('3-runtime-html/repeater.destructered-declaration.spec.ts', function () {
  interface TestSetupContext<TApp> {
    template: string;
    registrations: any[];
    app: Class<TApp>;
  }
  const $it = createSpecFunction(testRepeatForCustomElement);
  async function testRepeatForCustomElement<TApp extends object>(
    testFunction: TestFunction<TestExecutionContext<TApp>>,
    {
      template,
      registrations = [],
      app,
    }: Partial<TestSetupContext<TApp>>
  ) {
    const ctx = TestContext.create();
    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const container = ctx.container;

    const au = new Aurelia(container);
    await au.register(...registrations)
      .app({
        host,
        component: CustomElement.define({ name: 'app', template }, app ?? class { })
      })
      .start();
    const component = au.root.controller.viewModel as any;

    await testFunction({ app: component, container, ctx, host, platform: container.get(IPlatform) });

    await au.stop();

    assert.strictEqual(host.textContent, '', `host.textContent`);

    ctx.doc.body.removeChild(host);
  }

  async function changeAndAssert(ctx: TestExecutionContext<any>, change: () => void, expectedHtml: string) {
    change();
    await tasksSettled();
    assert.html.innerEqual(ctx.host, expectedHtml);
  }

  {
    class App {
      public map: Map<string, number> = new Map<string, number>([['a', 1], ['b', 2], ['c', 3]]);
    }
    $it('[k,v] of Map<string, number>', async function (ctx: TestExecutionContext<App>) {
      let expected: string;
      assert.html.innerEqual(ctx.host, expected = '<div>a - 1</div><div>b - 2</div><div>c - 3</div>');
      let map = ctx.app.map;
      await changeAndAssert(ctx, () => map.set('d', 4), `${expected}<div>d - 4</div>`);
      await changeAndAssert(ctx, () => map.set('d', 44), `${expected}<div>d - 44</div>`);
      await changeAndAssert(ctx, () => map.delete('d'), expected);
      await changeAndAssert(ctx, () => map.clear(), '');
      await changeAndAssert(ctx, () => { map = ctx.app.map = new Map<string, number>([['e', 5], ['f', 6]]); }, expected = '<div>e - 5</div><div>f - 6</div>');
      await changeAndAssert(ctx, () => map.set('d', 4), `${expected}<div>d - 4</div>`);
      await changeAndAssert(ctx, () => map.set('d', 44), `${expected}<div>d - 44</div>`);
      await changeAndAssert(ctx, () => map.delete('d'), expected);
    }, { app: App, template: `<div repeat.for="[k,v] of map">\${k} - \${v}</div>` });
  }

  {
    class App {
      public map: Map<string, Person> = new Map([
        ['a', new Person('a', 1)],
        ['b', new Person('b', 2)],
      ]);
    }
    $it('change-handling on non-destructured object is operational - [k,p] of Map<string, Person>', async function (ctx: TestExecutionContext<App>) {
      assert.html.innerEqual(ctx.host, '<div>a - a - 1</div><div>b - b - 2</div>');
      const map = ctx.app.map;
      // mutation of value
      await changeAndAssert(ctx, () => map.get('b').age = 42, '<div>a - a - 1</div><div>b - b - 42</div>');
      // mutation of map
      await changeAndAssert(ctx, () => map.set('b', new Person('c', 3)), '<div>a - a - 1</div><div>b - c - 3</div>');
    }, { app: App, template: `<div repeat.for="[k,p] of map">\${k} - \${p.name} - \${p.age}</div>` });
  }

  {
    class App {
      public map: Map<string, Person[]> = new Map([
        ['81', [new Person('81743d187e', 1)]],
        ['4b', [new Person('4bdcb4c20d', 84), new Person('4b65b7e361', 73)]],
        ['6b', [new Person('6ba7254daa', 74)]],
        ['85', [new Person('85112abda4', 61), new Person('851774ec0e', 33), new Person('853b9b43e5', 81)]],
      ]);
    }
    $it('change-handling on non-destructured array is operational - [k,ps] of Map<string, Person[]>', async function (ctx: TestExecutionContext<App>) {
      assert.html.innerEqual(ctx.host, '<div>81: 817-1</div><div>4b: 4bd-84 4b6-73</div><div>6b: 6ba-74</div><div>85: 851-61 851-33 853-81</div>');
      const map = ctx.app.map;
      // mutation of value
      await changeAndAssert(
        ctx,
        () => map.get('81').push(new Person('81843d187e', 11)),
        '<div>81: 817-1 818-11</div><div>4b: 4bd-84 4b6-73</div><div>6b: 6ba-74</div><div>85: 851-61 851-33 853-81</div>'
      );
      // mutation of map
      await changeAndAssert(
        ctx,
        () => map.set('3a', [new Person('3adcb4c20d', 84)]),
        '<div>81: 817-1 818-11</div><div>4b: 4bd-84 4b6-73</div><div>6b: 6ba-74</div><div>85: 851-61 851-33 853-81</div><div>3a: 3ad-84</div>'
      );
    }, { app: App, template: `<div repeat.for="[k,ps] of map">\${k}:<template repeat.for="p of ps"> \${p.name.slice(0,3)}-\${p.age}</div>` });
  }

  describe('object binding patterns', function () {
    it('projects shorthand and aliased locals before the repeated body binds', function () {
      const { assertText, getAllBy } = createFixture(
        `<div repeat.for="{ id: orderId, name } of orders"><span data-id.one-time="orderId">\${id}/\${orderId}/\${name}</span></div>`,
        class App {
          public id = 'parent';
          public orders = [
            { id: 1, name: 'Coffee' },
            { id: 2, name: 'Tea' },
          ];
        },
      );

      // `id` remains a lookup into the parent scope because the source property
      // was explicitly aliased to `orderId`.
      assertText('parent/1/Coffeeparent/2/Tea');
      assert.deepStrictEqual(
        getAllBy('span').map(element => element.dataset.id),
        ['1', '2'],
        '.one-time bindings see the projected locals during their initial bind',
      );
    });

    it('allows reserved source property names when they are given safe aliases', function () {
      const { assertText } = createFixture(
        `<div repeat.for="{ $index: itemIndex, $item: sourceItem, constructor: ctor } of items">\${itemIndex}/\${sourceItem}/\${ctor}</div>`,
        class App {
          public items = [
            { $index: 'source-index', $item: 'source-item', constructor: 'source-constructor' },
          ];
        },
      );

      assertText('source-index/source-item/source-constructor');
    });

    it('hydrates SSR-adopted rows with reactive object-pattern locals', async function () {
      let currentOrders = [{ id: 1, name: 'Server' }];
      class App {
        public orderId = 'parent';
        public name = 'parent';
        public orders = currentOrders;
      }
      const AppElement = CustomElement.define({
        name: 'app',
        // Keep this as one interpolation so this regression remains isolated
        // from hydration's handling of literal separators between markers.
        template: `<div class="order" repeat.for="{ id: orderId, name } of orders"><span data-id.one-time="orderId">\${orderId + ':' + name}</span></div>`,
      }, App);

      const serverCtx = TestContext.create();
      serverCtx.container.register(Registration.instance(ISSRContext, { preserveMarkers: true }));
      const serverHost = serverCtx.doc.body.appendChild(serverCtx.createElement('app'));
      const serverAu = new Aurelia(serverCtx.container).app({ host: serverHost, component: AppElement });
      let ssrMarkup: string;
      try {
        await serverAu.start();
        ssrMarkup = serverHost.innerHTML;
      } finally {
        await serverAu.stop(true);
        serverAu.dispose();
        serverHost.remove();
      }

      currentOrders = [{ id: 2, name: 'Client' }];
      const clientCtx = TestContext.create();
      const clientHost = clientCtx.doc.body.appendChild(clientCtx.createElement('app'));
      clientHost.innerHTML = ssrMarkup;
      const ssrRow = clientHost.querySelector('.order');
      assert.notStrictEqual(ssrRow, null);
      assert.strictEqual(ssrRow!.textContent, '1:Server');

      const ssrScope: ISSRScope = {
        name: 'app',
        children: [{ type: 'repeat', views: [{ nodeCount: 1, children: [] }] }],
      };
      const clientAu = new Aurelia(clientCtx.container);
      try {
        const root = await clientAu.hydrate({ host: clientHost, component: AppElement, ssrScope });
        try {
          const hydratedRow = clientHost.querySelector('.order');
          assert.strictEqual(hydratedRow, ssrRow, 'the SSR row is adopted, not cloned');
          assert.strictEqual(clientHost.textContent, '2:Client');
          assert.strictEqual(hydratedRow!.querySelector('span')!.dataset.id, '2', '.one-time binds after locals are projected');

          currentOrders[0].id = 3;
          currentOrders[0].name = 'Updated';
          await tasksSettled();
          assert.strictEqual(clientHost.textContent, '3:Updated');
          assert.strictEqual(hydratedRow!.querySelector('span')!.dataset.id, '2', '.one-time remains frozen');
        } finally {
          await root.deactivate();
          root.dispose();
        }
      } finally {
        clientAu.dispose();
        clientHost.remove();
      }
    });

    it('reacts to selected properties and dependencies of selected getters', async function () {
      let labelReads = 0;
      class Order {
        public constructor(
          public firstName: string,
          public lastName: string,
        ) {}

        public get label(): string {
          ++labelReads;
          return `${this.firstName} ${this.lastName}`;
        }
      }

      const order = Object.assign(new Order('Ada', 'Lovelace'), { status: 'pending' });
      const { assertText, component } = createFixture(
        `<div repeat.for="{ label, status } of orders">\${label} — \${status}</div>`,
        class App {
          public orders = [order];
        },
      );

      assertText('Ada Lovelace — pending');
      assert.strictEqual(labelReads, 1, 'the selected getter is evaluated once during row activation');

      order.firstName = 'Grace';
      await tasksSettled();
      assertText('Grace Lovelace — pending');
      assert.strictEqual(labelReads, 2, 'a dependency change reevaluates the selected getter once');

      order.status = 'complete';
      await tasksSettled();
      assertText('Grace Lovelace — complete');
      assert.strictEqual(labelReads, 2, 'another selected property reuses the computed value');

      // A newly inserted row must receive the same declaration binding as the
      // views created during the repeat's initial activation.
      component.orders.push(Object.assign(new Order('Katherine', 'Johnson'), { status: 'ready' }));
      await tasksSettled();
      assertText('Grace Lovelace — completeKatherine Johnson — ready');
    });

    it('reuses keyed views while reconnecting their locals to replacement objects', async function () {
      const oldOrders = [
        { id: 1, name: 'Coffee' },
        { id: 2, name: 'Tea' },
      ];
      const { assertText, component, getAllBy, observerLocator } = createFixture(
        `<div class="order" repeat.for="{ id: orderId, name } of orders; key.bind: orderId">\${orderId}:\${name}</div>`,
        class App {
          public orders = oldOrders;
        },
      );
      const oldNameObserver = observerLocator.getObserver(oldOrders[0], 'name') as unknown as ISubscriberCollection;
      const originalElements = getAllBy('.order');

      assertText('1:Coffee2:Tea');
      assert.strictEqual(oldNameObserver.subs.count, 1, 'the selected source property is observed once');

      const replacementOrders = [
        { id: 2, name: 'Green tea' },
        { id: 1, name: 'Espresso' },
      ];
      component.orders = replacementOrders;
      await tasksSettled();

      const reorderedElements = getAllBy('.order');
      assertText('2:Green tea1:Espresso');
      assert.strictEqual(reorderedElements[0], originalElements[1], 'the row keyed by 2 is moved, not recreated');
      assert.strictEqual(reorderedElements[1], originalElements[0], 'the row keyed by 1 is moved, not recreated');
      assert.strictEqual(oldNameObserver.subs.count, 0, 'the replaced source is disconnected');
      assert.strictEqual(
        (observerLocator.getObserver(replacementOrders[1], 'name') as unknown as ISubscriberCollection).subs.count,
        1,
        'the replacement source is observed once',
      );

      oldOrders[0].name = 'stale';
      replacementOrders[1].name = 'Ristretto';
      await tasksSettled();
      assertText('2:Green tea1:Ristretto');

      const removedNameObserver = observerLocator.getObserver(replacementOrders[0], 'name') as unknown as ISubscriberCollection;
      component.orders.shift();
      await tasksSettled();

      assertText('1:Ristretto');
      assert.strictEqual(removedNameObserver.subs.count, 0, 'a deleted keyed row releases its replacement source');
    });

    it('keeps destructured locals one-way when a body binding assigns them', async function () {
      const order = { name: 'Coffee' };
      const { assertValue, component, type } = createFixture(
        `<input repeat.for="{ name } of orders" value.two-way="name">`,
        class App {
          public orders = [order];
        },
      );

      assertValue('input', 'Coffee');
      type('input', 'Draft');
      assert.strictEqual(order.name, 'Coffee', 'assigning the local does not write through to the source');
      assertValue('input', 'Draft');

      component.orders[0].name = 'Published';
      await tasksSettled();
      assertValue('input', 'Published');
    });

    it('publishes all locals from a batched source change as a consistent snapshot', async function () {
      const order = { first: 'Ada', last: 'Lovelace' };
      const { assertText, component } = createFixture(
        // A <let> binding reevaluates synchronously, so it exposes a torn
        // first/last projection that a queued DOM interpolation would hide.
        `<div repeat.for="{ first, last } of orders"><let snapshot.bind="capture(first, last)"></let>\${snapshot}</div>`,
        class App {
          public orders = [order];
          public snapshots: string[] = [];

          public capture(first: string, last: string): string {
            const snapshot = `${first}/${last}`;
            this.snapshots.push(snapshot);
            return snapshot;
          }
        },
      );

      assertText('Ada/Lovelace');
      component.snapshots.length = 0;

      batch(() => {
        order.first = 'Grace';
        order.last = 'Hopper';
      });
      await tasksSettled();

      assertText('Grace/Hopper');
      assert.ok(component.snapshots.length > 0, 'the body binding reevaluates');
      assert.ok(
        component.snapshots.every(snapshot => snapshot === 'Grace/Hopper'),
        `body bindings must not observe a partially projected pattern: ${component.snapshots.join(', ')}`,
      );
    });

    it('installs the declaration binding when the repeated body has no other bindings', function () {
      const order = { name: 'Coffee' };
      const { observerLocator } = createFixture(
        `<div repeat.for="{ name } of orders"></div>`,
        class App {
          public orders = [order];
        },
      );

      const nameObserver = observerLocator.getObserver(order, 'name') as unknown as ISubscriberCollection;
      assert.strictEqual(nameObserver.subs.count, 1, 'the declaration binding is installed and connected');
    });

    it('handles duplicate installation, rebinding, and late lifecycle calls safely', function () {
      const order = { name: 'Coffee' };
      const { au, observerLocator, platform } = createFixture(
        `<div repeat.for="{ name } of orders">\${name}</div>`,
        class App {
          public orders = [order];
        },
      );

      // Normal controller sequencing avoids duplicate calls. Exercise the row
      // binding directly so its defensive IBinding contract remains explicit.
      let repeat: Repeat | undefined;
      au.root.controller.accept(controller => {
        if (controller.viewModel instanceof Repeat) {
          repeat = controller.viewModel;
          return true;
        }
      });
      assert.notStrictEqual(repeat, void 0, 'the repeat controller is present');

      const view = repeat!.views[0];
      const scope = view.scope!;
      const binding = view.bindings![0] as IBinding & {
        handleChange(): void;
        handleCollectionChange(): void;
      };
      const pattern = (repeat as unknown as {
        _objectBindingPattern: {
          ensureViewBinding(view: ISyntheticView): void;
          initialize(scope: Scope, source: unknown): void;
        };
      })._objectBindingPattern;
      const orderObserver = observerLocator.getObserver(order, 'name') as unknown as ISubscriberCollection;

      const bindingCount = view.bindings!.length;
      pattern.ensureViewBinding(view);
      assert.strictEqual(view.bindings!.length, bindingCount, 'the same view receives one declaration binding');

      binding.bind(scope);
      assert.strictEqual(orderObserver.subs.count, 1, 'rebinding the same scope does not reconnect');
      assert.strictEqual(binding.get(IPlatform), platform, 'the binding resolves services through its row controller');

      const replacement = { name: 'Tea' };
      const replacementScope = Scope.create(new BindingContext());
      const replacementObserver = observerLocator.getObserver(replacement, 'name') as unknown as ISubscriberCollection;
      pattern.initialize(replacementScope, replacement);
      binding.bind(replacementScope);

      assert.strictEqual(orderObserver.subs.count, 0, 'rebinding disconnects the previous scope');
      assert.strictEqual(replacementObserver.subs.count, 1, 'rebinding connects the replacement scope');
      assert.strictEqual(replacementScope.bindingContext.name, 'Tea');

      replacementScope.bindingContext.name = 'stale';
      binding.handleCollectionChange();
      assert.strictEqual(replacementScope.bindingContext.name, 'Tea', 'a collection notification refreshes the local');

      binding.unbind();
      replacement.name = 'Green tea';
      binding.handleChange();
      binding.unbind();

      assert.strictEqual(replacementObserver.subs.count, 0, 'repeated unbinds leave no source subscription');
      assert.strictEqual(replacementScope.bindingContext.name, 'Tea', 'a late source notification is ignored');

      binding.bind(scope);
      assert.strictEqual(orderObserver.subs.count, 1, 'the fixture binding is restored for normal teardown');
    });

    it('disconnects removed and stopped rows and reconnects them exactly once', async function () {
      const first = { name: 'Coffee' };
      const { assertText, au, component, observerLocator, stop } = createFixture(
        `<div repeat.for="{ name } of orders">\${name}</div>`,
        class App {
          public orders = [first];
        },
      );
      const firstObserver = observerLocator.getObserver(first, 'name') as unknown as ISubscriberCollection;

      assertText('Coffee');
      assert.strictEqual(firstObserver.subs.count, 1, 'the active row is connected once');

      component.orders.pop();
      await tasksSettled();
      assert.strictEqual(firstObserver.subs.count, 0, 'a removed row releases its source observer');

      const second = { name: 'Tea' };
      component.orders.push(second);
      await tasksSettled();
      const secondObserver = observerLocator.getObserver(second, 'name') as unknown as ISubscriberCollection;
      assertText('Tea');
      assert.strictEqual(secondObserver.subs.count, 1, 'the inserted row connects once');

      await stop();
      assert.strictEqual(secondObserver.subs.count, 0, 'application stop disconnects the row');

      second.name = 'Green tea';
      await au.start();
      assertText('Green tea');
      assert.strictEqual(secondObserver.subs.count, 1, 'the row after restart connects once');

      await stop(true);
      assert.strictEqual(secondObserver.subs.count, 0, 'disposal leaves no source subscription');
    });

    it('throws when a repeated item cannot be object-destructured', function () {
      assert.throws(
        () => createFixture(
          `<div repeat.for="{ name } of orders">\${name}</div>`,
          class App {
            public orders = [null];
          },
        ),
        /AUR0112/,
      );
    });
  });
});
