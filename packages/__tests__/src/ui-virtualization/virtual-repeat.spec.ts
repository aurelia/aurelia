import { createFixture, assert } from '@aurelia/testing';
import { DefaultVirtualizationConfiguration, VirtualRepeat, VIRTUAL_REPEAT_NEAR_BOTTOM, VIRTUAL_REPEAT_NEAR_TOP, type IVirtualRepeatNearBottomEvent, type IVirtualRepeatNearTopEvent } from '@aurelia/ui-virtualization';
import { isNode } from '../util.js';
import { IObserverLocator, type ISubscriberCollection, runTasks, tasksSettled } from '@aurelia/runtime';
import { CustomElement, If, LifecycleHooks, ValueConverter } from '@aurelia/runtime-html';

describe('ui-virtualization/virtual-repeat.spec.ts', function () {
  if (isNode()) {
    return;
  }

  const virtualRepeatDeps = [
    LifecycleHooks.define({}, class Hook {
      created(vm: unknown) {
        if (vm instanceof VirtualRepeat) {
          virtualRepeats.push(vm);
        }
      }
    }),
    DefaultVirtualizationConfiguration
  ];
  const virtualRepeats: VirtualRepeat[] = [];

  this.beforeEach(function () {
    virtualRepeats.length = 0;
  });

  it('renders', function () {
    createFixture(
      createScrollerTemplate('<div virtual-repeat.for="item of items" style="height: 50px">${item}</div>'),
      class App { items = createItems(); },
      virtualRepeatDeps
    );

    assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, (100 - (600 / 50) * 2) * 50]);
  });

  it('understands scroller container border', function () {
    createFixture(
      createScrollerTemplate('<div virtual-repeat.for="item of items" style="height: 50px">${item}</div>', { border: 30 }),
      class App { items = createItems(); },
      virtualRepeatDeps
    );

    assert.deepStrictEqual(
      virtualRepeats[0].getDistances(),
      [
        0,
        (100 - /* 600px but 30px padding (top + bot) = 540px / 50px each item then + 1 to ensure covers the viewport */11 * 2) * 50
      ]
    );
  });

  it('understands scroller container padding', function () {
    createFixture(
      createScrollerTemplate('<div virtual-repeat.for="item of items" style="height: 50px">${item}</div>', { padding: 30 }),
      class App { items = createItems(); },
      virtualRepeatDeps
    );

    assert.deepStrictEqual(
      virtualRepeats[0].getDistances(),
      [
        0,
        (100 - /* 600px but 30px padding (top + bot) = 540px / 50px each item then + 1 to ensure covers the viewport */11 * 2) * 50
      ]
    );
  });

  it('understands non borderbox box-sizing', function () {
    createFixture(
      createScrollerTemplate('<div virtual-repeat.for="item of items" style="height: 50px">${item}</div>', { padding: 30, boxSizing: 'content-box' }),
      class App { items = createItems(); },
      virtualRepeatDeps
    );

    assert.deepStrictEqual(
      virtualRepeats[0].getDistances(),
      [
        0,
        // 600px (because of content-box) / 50px each
        (100 - 12 * 2) * 50
      ]
    );
  });

  it('rerenders when scrolled', function () {
    const { scrollBy } = createFixture(
      createScrollerTemplate('<div virtual-repeat.for="item of items" style="height: 50px">${item.name}</div>'),
      class App { items = createItems(); },
      virtualRepeatDeps
    );

    scrollBy('#scroller', 400);
    runTasks();

    const virtualRepeat = virtualRepeats[0];
    const firstView = virtualRepeat.getViews()[0];
    assert.deepStrictEqual(virtualRepeat.getDistances(), [400, /* whole thing - top distance */4600 - /* rendered view (24 items * 50px) */1200]);
    assert.strictEqual(firstView.nodes.firstChild.textContent, `item-8`);
  });

  it('works with a value converter that returns a cloned array', async function () {
    const { trigger, component } = createFixture(
      createScrollerTemplate(`
        <button click.trigger="addItem()">Add item</button>
        <div virtual-repeat.for="item of items | cloneItems" style="height: 50px">\${item.name}</div>
      `),
      class App {
        items = createItems(2);

        public addItem() {
          this.items.push({ idx: this.items.length, name: `item-${this.items.length}` });
        }
      },
      [
        ...virtualRepeatDeps,
        ValueConverter.define('cloneItems', class {
          public toView(value: any[]) {
            return [...value];
          }
        })
      ]
    );

    assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, 0]);
    assert.strictEqual(virtualRepeats[0].getViews()[0].nodes.firstChild.textContent, 'item-0');

    trigger('button', 'click');
    await tasksSettled();

    assert.strictEqual(component.items.length, 3);
    assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, 0]);
    assert.strictEqual(virtualRepeats[0].getViews().length, 3);
    assert.strictEqual(virtualRepeats[0].getViews()[2].nodes.firstChild.textContent, 'item-2');
  });

  it('rerenders when scrolled with gap', function () {
    const { scrollBy } = createFixture(
      createScrollerTemplate('<div virtual-repeat.for="item of items; item-height: 50; gap: 10" style="height: 50px">${item.name}</div>'),
      class App { items = createItems(); },
      virtualRepeatDeps
    );

    scrollBy('#scroller', 420);
    runTasks();

    const virtualRepeat = virtualRepeats[0];
    const firstView = virtualRepeat.getViews()[0];
    assert.deepStrictEqual(virtualRepeat.getDistances(), [420, (100 * 50 + 99 * 10) - 420 - (20 * 50 + 19 * 10)]);
    assert.strictEqual(firstView.nodes.firstChild.textContent, 'item-7');
  });

  describe('scroller resizing', function () {
    it('works with dynamic height scroller', async function () {
      const {getAllBy } = createFixture(
        `<main style="max-height: 300px; width: 300px; overflow: auto; background-color: lightgray;">
          <div virtual-repeat.for="item of items" style="height: 50px">\${item.name}</div>
        </main>`,
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      // probably about 1 animation frame though 30ms to be sure
      await new Promise(r => setTimeout(r, 30));
      assert.strictEqual(getAllBy('div').length, 12 /* 6 min = 12 required */ + 2 /* buffers */);
    });

    it('works with container starting with 0 height', async function () {
      const { getAllBy, getBy } = createFixture(
        `<main style="height: 0px; width: 300px; overflow: auto; background-color: lightgray;">
          <div virtual-repeat.for="item of items" style="height: 50px">\${item.name}</div>
        </main>`,
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      // probably about 1 animation frame though 30ms to be sure
      await new Promise(r => setTimeout(r, 30));
      assert.strictEqual(getAllBy('div').length, 2);

      getBy('main').style.height = '300px';
      // probably about 1 animation frame though 30ms to be sure
      await new Promise(r => setTimeout(r, 30));
      assert.strictEqual(getAllBy('div').length, 12 + 2);
    });

    it('works with dynamic width scroller', async function () {
      const {getAllBy } = createFixture(
        [
          `<main style="max-width: 300px; height: 100px; overflow: auto; background-color: lightgray; white-space: nowrap;">`,
            `<div virtual-repeat.for="item of items" style="display: inline-block; width: 50px">\${item.name}</div>,
          </main>`
        ].join(''),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      // probably about 1 animation frame though 30ms to be sure
      await new Promise(r => setTimeout(r, 30));
      assert.strictEqual(getAllBy('div').length, 12 /* 6 min = 12 required */ + 2 /* buffers */);
    });

    it('works with container starting with 0 width', async function () {
      const { getAllBy, getBy } = createFixture(
        [
          `<main style="width: 0; height: 100px; overflow: auto; background-color: lightgray; white-space: nowrap;">`,
            `<div virtual-repeat.for="item of items" style="display: inline-block; width: 50px">\${item.name}</div>,
          </main>`
        ].join(''),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      // probably about 1 animation frame though 30ms to be sure
      await new Promise(r => setTimeout(r, 30));
      assert.strictEqual(getAllBy('div').length, 12 + 2);

      getBy('main').style.width = '300px';
      // probably about 1 animation frame though 30ms to be sure
      await new Promise(r => setTimeout(r, 30));
      assert.strictEqual(getAllBy('div').length, 12 + 2);
    });
  });

  describe('mutation', function () {
    // TODO: check why this fails
    it('rerenders when removed at the start', async function () {
      const { component } = createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items" style="height: 50px">${item.name}</div>'),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      component.items.splice(0, 10);
      await tasksSettled();
      assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, (90 - (600 / 50) * 2) * 50]);

      const virtualRepeat = virtualRepeats[0];
      const firstView = virtualRepeat.getViews()[0];
      assert.strictEqual(firstView.nodes.firstChild.textContent, `item-10`);
    });

    it('rerenders when removed at the end', async function () {
      const { component } = createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items" style="height: 50px">${item.name}</div>'),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      component.items.splice(90, 10);
      await tasksSettled();
      assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, (90 - (600 / 50) * 2) * 50]);
      const virtualRepeat = virtualRepeats[0];
      const firstView = virtualRepeat.getViews()[0];
      assert.strictEqual(firstView.nodes.firstChild.textContent, `item-0`);
    });

    it('rerenders when removed in the middle', async function () {
      const { component } = createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items" style="height: 50px">${item.name}</div>'),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      component.items.splice(10, 10);
      await tasksSettled();
      assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, (90 - (600 / 50) * 2) * 50]);
      const virtualRepeat = virtualRepeats[0];
      const firstView = virtualRepeat.getViews()[10];
      assert.strictEqual(firstView.nodes.firstChild.textContent, `item-20`);
    });
  });

  describe('configuration', function () {
    it('accepts item-height configuration', function () {
      createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items; item-height: 30" style="height: 30px">${item}</div>'),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      // With item height 30px and viewport 600px, minViews = 20, rendered views = 40, bottom buffer = (100-40)*30 = 1800
      assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, (100 - (600 / 30) * 2) * 30]);
    });

    it('accepts buffer-size configuration', function () {
      createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items; buffer-size: 4" style="height: 50px">${item}</div>'),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      // Default itemHeight = 50, viewport 600 => minViews = 12; buffer-size 4 => views = 48, bottom = (100-48)*50
      assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, (100 - (600 / 50) * 4) * 50]);
    });

    it('accepts multiple configuration values', function () {
      createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items; item-height: 40; buffer-size: 3; min-views: 5" style="height: 40px">${item}</div>'),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      // With explicit itemHeight 40, minViews=5, buffer=3 => 15 rendered views, bottom buffer=(100-15)*40
      assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, (100 - 15) * 40]);
    });

    it('accepts gap configuration', function () {
      createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items; item-height: 50; gap: 10" style="height: 50px">${item}</div>'),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, (100 - Math.ceil(600 / 60) * 2) * 60]);
    });

    it('accepts horizontal layout with item-width configuration', function () {
      createFixture(
        createHorizontalScrollerTemplate('<div virtual-repeat.for="item of items; layout: horizontal; item-width: 100" style="width: 100px; height: 50px; display: inline-block">${item}</div>'),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      // With horizontal layout, item width 100px and viewport 600px, minViews = 6, rendered views = 12, right buffer = (100-12)*100 = 8800
      assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, (100 - (600 / 100) * 2) * 100]);
    });
  });

  describe('horizontal scrolling', function () {
    it('renders horizontally with layout configuration', function () {
      createFixture(
        createHorizontalScrollerTemplate('<div virtual-repeat.for="item of items; layout: horizontal; item-width: 80" style="width: 80px; height: 50px; display: inline-block">${item.name}</div>'),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      // With horizontal layout, item width 80px and viewport 600px, minViews = 8 (rounded up from 7.5), rendered views = 16, right buffer = (100-16)*80 = 6720
      assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, (100 - Math.ceil(600 / 80) * 2) * 80]);
    });

    it('rerenders when scrolled horizontally', function () {
      const { scrollBy } = createFixture(
        createHorizontalScrollerTemplate('<div virtual-repeat.for="item of items; layout: horizontal; item-width: 80" style="width: 80px; height: 50px; display: inline-block">${item.name}</div>'),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      scrollBy('#scroller', { left: 400 }); // scroll horizontally by 400px
      runTasks();

      const virtualRepeat = virtualRepeats[0];
      const firstView = virtualRepeat.getViews()[0];
      const expectedFirstIndex = Math.floor(400 / 80); // Should be index 5 (400/80 = 5)
      assert.strictEqual(firstView.nodes.firstChild.textContent, `item-${expectedFirstIndex}`);
    });

    it('accounts for gap when scrolled horizontally', function () {
      const { scrollBy } = createFixture(
        createHorizontalScrollerTemplate('<div virtual-repeat.for="item of items; layout: horizontal; item-width: 80; gap: 20" style="width: 80px; height: 50px; display: inline-block">${item.name}</div>'),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      scrollBy('#scroller', { left: 420 });
      runTasks();

      const virtualRepeat = virtualRepeats[0];
      const firstView = virtualRepeat.getViews()[0];
      assert.strictEqual(firstView.nodes.firstChild.textContent, 'item-4');
    });
  });

  describe('infinite scroll', function () {
    it('triggers near-bottom event when scrolling to the end', function (done) {
      const { scrollBy } = createFixture(
        `<div
          id="scroller"
          style="box-sizing: border-box; height: 600px; border: 0px solid black; padding: 0px; overflow: auto;"
          ${VIRTUAL_REPEAT_NEAR_BOTTOM}.trigger="nearBottom($event)"
        >
          <div virtual-repeat.for="item of items" style="height: 50px">\${item.name}</div>
        </div>`,
        class App {
          public items = createItems(100);
          private fired = false;
          public nearBottom(event: IVirtualRepeatNearBottomEvent) {
            if (this.fired) { return; }
            this.fired = true;
            assert.ok(event.detail.lastVisibleIndex >= 0, 'event should contain lastVisibleIndex');
            assert.ok(event.detail.itemCount === 100, 'event should contain correct itemCount');
            assert.ok(true, 'near-bottom event triggered');
            done();
          }
        },
        virtualRepeatDeps
      );

      // scroll to bottom
      scrollBy('#scroller', 5000);
      runTasks();
    });

    it('triggers near-top event when scrolling back to top', function (done) {
      const { scrollBy } = createFixture(
        `<div
          id="scroller"
          style="box-sizing: border-box; height: 600px; border: 0px solid black; padding: 0px; overflow: auto;"
          ${VIRTUAL_REPEAT_NEAR_TOP}.trigger="nearTop($event)"
        >
          <div virtual-repeat.for="item of items" style="height: 50px">\${item.name}</div>
        </div>`,
        class App {
          public items = createItems(100);
          private fired = false;
          public nearTop(event: IVirtualRepeatNearTopEvent) {
            if (this.fired) { return; }
            this.fired = true;
            assert.ok(event.detail.firstVisibleIndex >= 0, 'event should contain firstVisibleIndex');
            assert.ok(event.detail.itemCount === 100, 'event should contain correct itemCount');
            assert.ok(true, 'near-top event triggered');
            done();
          }
        },
        virtualRepeatDeps
      );

      scrollBy('#scroller', 5000);
      runTasks();

      scrollBy('#scroller', -5000);
      runTasks();
    });
  });

  describe('variable sizing', function () {
    it('renders with variable height enabled', function () {
      createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items; variable-height: true" style="height: ${item.height}px">${item.name}</div>'),
        class App { items = createVariableItems(); },
        virtualRepeatDeps
      );

      // Should have views rendered
      assert.ok(virtualRepeats[0].getViews().length > 0, 'Should have views rendered');
    });

    it('renders with variable width enabled in horizontal layout', function () {
      createFixture(
        createHorizontalScrollerTemplate('<div virtual-repeat.for="item of items; layout: horizontal; variable-width: true" style="width: ${item.width}px; height: 50px; display: inline-block">${item.name}</div>'),
        class App { items = createVariableItems(); },
        virtualRepeatDeps
      );

      // Should have views rendered
      assert.ok(virtualRepeats[0].getViews().length > 0, 'Should have views rendered');
    });

    it('scrolls correctly with variable height', function () {
      const { scrollBy } = createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items; variable-height: true" style="height: ${item.height}px">${item.name}</div>'),
        class App { items = createVariableItems(); },
        virtualRepeatDeps
      );

      const initialFirstItem = virtualRepeats[0].getViews()[0].nodes.firstChild.textContent;

      // Scroll down
      scrollBy('#scroller', 500);
      runTasks();

      const scrolledFirstItem = virtualRepeats[0].getViews()[0].nodes.firstChild.textContent;

      // First item should have changed after scrolling
      assert.notStrictEqual(initialFirstItem, scrolledFirstItem, 'First item should change after scrolling');
    });

    it('scrolls correctly with variable width in horizontal layout', function () {
      const { scrollBy } = createFixture(
        createHorizontalScrollerTemplate('<div virtual-repeat.for="item of items; layout: horizontal; variable-width: true" style="width: ${item.width}px; height: 50px; display: inline-block">${item.name}</div>'),
        class App { items = createVariableItems(); },
        virtualRepeatDeps
      );

      const initialFirstItem = virtualRepeats[0].getViews()[0].nodes.firstChild.textContent;

      // Scroll horizontally
      scrollBy('#scroller', { left: 500 });
      runTasks();

      const scrolledFirstItem = virtualRepeats[0].getViews()[0].nodes.firstChild.textContent;

      // First item should have changed after scrolling
      assert.notStrictEqual(initialFirstItem, scrolledFirstItem, 'First item should change after horizontal scrolling');
    });

    it('handles mutation with variable height', function () {
      const { component } = createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items; variable-height: true" style="height: ${item.height}px">${item.name}</div>'),
        class App { items = createVariableItems(); },
        virtualRepeatDeps
      );

      const initialViewCount = virtualRepeats[0].getViews().length;

      // Remove some items
      component.items.splice(0, 5);
      runTasks();

      // Should still have views rendered
      assert.ok(virtualRepeats[0].getViews().length > 0, 'Should still have views after mutation');

      // View count may have changed
      const finalViewCount = virtualRepeats[0].getViews().length;
      assert.ok(finalViewCount <= initialViewCount, 'View count should not increase after removing items');
    });
  });

  describe('GH #2350 - attached lifecycle', function () {
    it('calls attached only once when items are assigned in attached hook', async function () {
      let attachedCallCount = 0;

      const { tearDown } = createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items" style="height: 50px">${item.name}</div>'),
        class App {
          items: { idx: number; name: string }[] | undefined;

          attached() {
            attachedCallCount++;
            this.items = createItems(10);
          }
        },
        virtualRepeatDeps
      );

      // Allow time for virtual-repeat to process items
      await tasksSettled();
      await new Promise(r => setTimeout(r, 50));

      assert.strictEqual(attachedCallCount, 1, 'attached() should only be called once');

      await tearDown();
    });

    it('calls attached only once when items are assigned in async attached hook', async function () {
      let attachedCallCount = 0;

      const { tearDown } = createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items" style="height: 50px">${item.name}</div>'),
        class App {
          items: { idx: number; name: string }[] | undefined;

          async attached() {
            attachedCallCount++;
            await Promise.resolve();
            this.items = createItems(10);
          }
        },
        virtualRepeatDeps
      );

      // Allow time for async attached and virtual-repeat to process items
      await tasksSettled();
      await new Promise(r => setTimeout(r, 50));

      assert.strictEqual(attachedCallCount, 1, 'attached() should only be called once even with async assignment');

      await tearDown();
    });
  });

  describe('GH #2550 - row views are deactivated with the repeat', function () {
    type Item = { idx: number; name: string };

    function createRowTracking() {
      const calls = { attached: 0, detaching: 0, unbinding: 0, evaluated: 0, disposed: 0 };
      const disposedRows = new Set<object>();
      const Row = CustomElement.define({
        name: 'row-el',
        template: '${item.name | track}',
        bindables: ['item'],
      }, class {
        public attached(): void { ++calls.attached; }
        public detaching(): void { ++calls.detaching; }
        public unbinding(): void { ++calls.unbinding; }
        public dispose(): void {
          ++calls.disposed;
          disposedRows.add(this);
        }
      });
      const Track = ValueConverter.define('track', class {
        public toView(value: unknown) {
          ++calls.evaluated;
          return value;
        }
      });
      return { calls, disposedRows, deps: [...virtualRepeatDeps, Row, Track] };
    }

    const listTemplate = createScrollerTemplate(
      '<div virtual-repeat.for="x of store.items" style="height: 50px"><row-el item.bind="x"></row-el></div>'
    );

    function renderedItems(): Item[] {
      return virtualRepeats[0].getViews().map(view => view.scope.bindingContext.x as Item);
    }

    function subscriberCount(observerLocator: IObserverLocator, items: readonly Item[]): number {
      return items.reduce(
        (count, item) => count + (observerLocator.getObserver(item, 'name') as unknown as ISubscriberCollection).subs.count,
        0,
      );
    }

    for (const cache of [true, false]) {
      it(`deactivates rows when an if hides the list and activates them again when shown (cache: ${cache})`, async function () {
        const { calls, deps } = createRowTracking();
        const store = { items: createItems() };
        const { component, appHost, container, stop } = createFixture(
          `<div if="value.bind: show; cache: ${cache}">${listTemplate}</div>`,
          class App { show = true; store = store; },
          deps,
        );
        const observerLocator = container.get(IObserverLocator);

        try {
          const shown = renderedItems();
          assert.strictEqual(shown.length, 24);
          assert.strictEqual(calls.attached, 24);
          assert.strictEqual(subscriberCount(observerLocator, shown), 24);

          component.show = false;
          await tasksSettled();

          assert.strictEqual(calls.detaching, 24, 'every row is detached');
          assert.strictEqual(calls.unbinding, 24, 'every row is unbound');
          assert.strictEqual(subscriberCount(observerLocator, shown), 0, 'hidden rows no longer observe their items');
          assert.strictEqual(appHost.querySelectorAll('row-el').length, 0);

          const evaluated = calls.evaluated;
          store.items[0].name = 'changed-0';
          store.items[1].name = 'changed-1';
          runTasks();
          assert.strictEqual(calls.evaluated, evaluated, 'hidden rows are not re-evaluated');

          component.show = true;
          await tasksSettled();

          const rows = appHost.querySelectorAll('row-el');
          assert.strictEqual(rows.length, 24, 'each item is rendered once');
          assert.strictEqual(rows[0].textContent, 'changed-0');
          assert.strictEqual(rows[1].textContent, 'changed-1');
          assert.strictEqual(calls.attached, 48, 'rows are attached again');
          assert.strictEqual(subscriberCount(observerLocator, shown), 24);
        } finally {
          await stop(true);
        }
      });
    }

    it('renders the current collection when it changes while an if hides the list', async function () {
      const { calls, deps } = createRowTracking();
      const store = { items: createItems() };
      const { component, appHost, stop } = createFixture(
        `<div if.bind="show">${listTemplate}</div>`,
        class App { show = true; store = store; },
        deps,
      );

      try {
        component.show = false;
        await tasksSettled();
        store.items = createItems(5);
        component.show = true;
        await tasksSettled();

        let rows = appHost.querySelectorAll('row-el');
        assert.deepStrictEqual(Array.from(rows, row => row.textContent), ['item-0', 'item-1', 'item-2', 'item-3', 'item-4']);
        assert.strictEqual(calls.attached - calls.detaching, 5, 'only the rendered rows are active');

        component.show = false;
        await tasksSettled();
        store.items = [];
        component.show = true;
        await tasksSettled();
        assert.strictEqual(appHost.querySelectorAll('row-el').length, 0);

        store.items = createItems();
        await tasksSettled();
        rows = appHost.querySelectorAll('row-el');
        assert.strictEqual(rows.length, 24);
        assert.strictEqual(rows[0].textContent, 'item-0');
        assert.strictEqual(calls.attached - calls.detaching, 24);
      } finally {
        await stop(true);
      }
    });

    it('deactivates rows when the app stops', async function () {
      const { calls, deps } = createRowTracking();
      const store = { items: createItems() };
      const { container, stop } = createFixture(
        listTemplate,
        class App { store = store; },
        deps,
      );
      const observerLocator = container.get(IObserverLocator);
      const shown = renderedItems();

      await stop(true);

      assert.strictEqual(calls.detaching, 24);
      assert.strictEqual(calls.unbinding, 24);
      assert.strictEqual(subscriberCount(observerLocator, shown), 0);

      const evaluated = calls.evaluated;
      store.items[0].name = 'changed-0';
      runTasks();
      assert.strictEqual(calls.evaluated, evaluated, 'rows of a stopped app are not re-evaluated');
    });

    for (const boundary of ['if', 'app'] as const) {
      it(`${boundary} teardown waits for async row detaching and unbinding`, async function () {
        let finishDetaching!: () => void;
        let finishUnbinding!: () => void;
        const detaching = new Promise<void>(resolve => { finishDetaching = resolve; });
        const unbinding = new Promise<void>(resolve => { finishUnbinding = resolve; });
        const calls = { detaching: 0, unbinding: 0 };
        let owningIf!: If;
        const CaptureIf = LifecycleHooks.define({}, class {
          public created(vm: unknown): void {
            if (vm instanceof If) owningIf = vm;
          }
        });
        const Row = CustomElement.define({
          name: 'row-el',
          template: '${item.name}',
          bindables: ['item'],
        }, class {
          public detaching(): Promise<void> {
            ++calls.detaching;
            return detaching;
          }
          public unbinding(): Promise<void> {
            ++calls.unbinding;
            return unbinding;
          }
        });
        const { component, au, appHost, container, stop } = createFixture(
          boundary === 'if' ? `<div if.bind="show">${listTemplate}</div>` : listTemplate,
          class App { show = true; store = { items: createItems() }; },
          [...virtualRepeatDeps, Row, CaptureIf],
        );
        const shown = renderedItems();
        let settled = false;
        let completion: Promise<void> | undefined;

        try {
          // The row controllers are not normal children. Their initiator must
          // nevertheless keep the owning transition open through both phases.
          if (boundary === 'if') {
            component.show = false;
            runTasks();
            // tasksSettled only drains scheduled work; the if owns this
            // lifecycle promise rather than registering it with the scheduler.
            completion = Promise.resolve((owningIf as unknown as { pending: void | Promise<void> }).pending);
          } else {
            completion = Promise.resolve(au.stop());
          }
          completion = completion.then(() => { settled = true; });
          assert.strictEqual(calls.detaching, 24);
          // Keep each gate closed for a task turn so an early completion has
          // time to reach its promise callbacks before we check it.
          await new Promise<void>(resolve => setTimeout(resolve, 0));
          assert.strictEqual(settled, false, 'owner waits for row detaching');
          assert.strictEqual(calls.unbinding, 0);
          assert.strictEqual(appHost.querySelectorAll('row-el').length, 24);

          finishDetaching();
          await new Promise<void>(resolve => setTimeout(resolve, 0));
          assert.strictEqual(calls.unbinding, 24);
          assert.strictEqual(settled, false, 'owner waits for row unbinding');

          finishUnbinding();
          await completion;
          assert.strictEqual(appHost.querySelectorAll('row-el').length, 0);
          assert.strictEqual(subscriberCount(container.get(IObserverLocator), shown), 0);
        } finally {
          finishDetaching();
          finishUnbinding();
          try {
            await completion;
          } finally {
            await stop(true);
          }
        }
      });
    }

    it('app restart reuses detached rows and final disposal reaches them once', async function () {
      const { calls, disposedRows, deps } = createRowTracking();
      const store = { items: createItems() };
      const { au, appHost, container, stop } = createFixture(
        listTemplate,
        class App { store = store; },
        deps,
      );
      const repeat = virtualRepeats[0];
      const views = repeat.getViews().slice();
      const observerLocator = container.get(IObserverLocator);
      const shown = renderedItems();

      try {
        await au.stop();
        assert.strictEqual(calls.disposed, 0, 'stop retains row controllers');
        assert.strictEqual(subscriberCount(observerLocator, shown), 0);
        store.items[0].name = 'updated while stopped';

        await au.start();
        await tasksSettled();
        assert.strictEqual(virtualRepeats[0], repeat);
        assert.strictEqual(repeat.getViews().length, views.length);
        views.forEach((view, i) => assert.strictEqual(repeat.getViews()[i], view));
        assert.strictEqual(appHost.querySelector('row-el')!.textContent, 'updated while stopped');
        assert.strictEqual(calls.attached, 48);
        assert.strictEqual(subscriberCount(observerLocator, shown), 24);
      } finally {
        await stop(true);
      }
      assert.strictEqual(calls.disposed, 24);
      assert.strictEqual(disposedRows.size, 24, 'each row is disposed exactly once');
      assert.strictEqual(repeat.getViews().length, 0);
    });

    it('a non-cached if disposes rows once per removed list', async function () {
      const { calls, disposedRows, deps } = createRowTracking();
      const { component, stop } = createFixture(
        `<div if="value.bind: show; cache: false">${listTemplate}</div>`,
        class App { show = true; store = { items: createItems() }; },
        deps,
      );
      try {
        component.show = false;
        await tasksSettled();
        assert.strictEqual(calls.disposed, 24);
        assert.strictEqual(disposedRows.size, 24);
        assert.strictEqual(virtualRepeats[0].getViews().length, 0);
        component.show = true;
        await tasksSettled();
        assert.strictEqual(calls.attached, 48);
        assert.strictEqual(calls.disposed, 24);
      } finally {
        await stop(true);
      }
      assert.strictEqual(calls.disposed, 48);
      assert.strictEqual(disposedRows.size, 48, 'both lists dispose each row exactly once');
    });

    it('deactivates rows when an ancestor component is removed', async function () {
      const { calls, deps } = createRowTracking();
      const store = { items: createItems() };
      const ListHost = CustomElement.define({
        name: 'list-host',
        template: listTemplate,
        bindables: ['store'],
      });
      const { component, appHost, container, stop } = createFixture(
        '<list-host if.bind="show" store.bind="store"></list-host>',
        class App { show = true; store = store; },
        [...deps, ListHost],
      );
      const observerLocator = container.get(IObserverLocator);

      try {
        const shown = renderedItems();
        assert.strictEqual(appHost.querySelectorAll('row-el').length, 24);

        component.show = false;
        await tasksSettled();

        assert.strictEqual(calls.detaching, 24);
        assert.strictEqual(calls.unbinding, 24);
        assert.strictEqual(subscriberCount(observerLocator, shown), 0);
        assert.strictEqual(appHost.querySelectorAll('list-host').length, 0);

        component.show = true;
        await tasksSettled();

        assert.strictEqual(appHost.querySelectorAll('row-el').length, 24);
        assert.strictEqual(calls.attached, 48);
      } finally {
        await stop(true);
      }
    });
  });

  function createScrollerTemplate(content: string, styles?: { height?: number | string; padding?: number | string; border?: number | string; boxSizing?: string }) {
    let {
      height = 600,
      padding = 0,
      border = 0,
      // eslint-disable-next-line prefer-const
      boxSizing = 'border-box',
    } = styles ?? {};

    height = typeof height === 'number' ? `${height}px` : height;
    padding = typeof padding === 'number' ? `${padding}px` : padding;
    border = typeof border === 'number' ? `${border}px solid black` : border;
    return `<div id=scroller style="box-sizing: ${boxSizing}; height: ${height}; border: ${border}; padding: ${padding}; overflow: auto;">${content}</div>`;
  }

  function createHorizontalScrollerTemplate(content: string, styles?: { width?: number | string; height?: number | string; padding?: number | string; border?: number | string; boxSizing?: string }) {
    let {
      width = 600,
      height = 100,
      padding = 0,
      border = 0,
      // eslint-disable-next-line prefer-const
      boxSizing = 'border-box',
    } = styles ?? {};

    width = typeof width === 'number' ? `${width}px` : width;
    height = typeof height === 'number' ? `${height}px` : height;
    padding = typeof padding === 'number' ? `${padding}px` : padding;
    border = typeof border === 'number' ? `${border}px solid black` : border;
    return `<div id=scroller style="box-sizing: ${boxSizing}; width: ${width}; height: ${height}; border: ${border}; padding: ${padding}; overflow: auto; white-space: nowrap;">${content}</div>`;
  }

  function createItems(count = 100) {
    return Array.from({ length: count }, (_, idx) => {
      return { idx, name: `item-${idx}` };
    });
  }

  function createVariableItems() {
    return Array.from({ length: 100 }, (_, idx) => {
      return {
        idx,
        name: `item-${idx}`,
        height: 40 + (idx % 5) * 20, // Heights vary from 40px to 120px
        width: 80 + (idx % 4) * 30   // Widths vary from 80px to 170px
      };
    });
  }
});
