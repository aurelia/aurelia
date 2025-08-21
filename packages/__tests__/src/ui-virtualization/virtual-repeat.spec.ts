import { createFixture, assert } from '@aurelia/testing';
import { DefaultVirtualizationConfiguration, VirtualRepeat, VIRTUAL_REPEAT_NEAR_BOTTOM, VIRTUAL_REPEAT_NEAR_TOP, type IVirtualRepeatNearBottomEvent, type IVirtualRepeatNearTopEvent } from '@aurelia/ui-virtualization';
import { isNode } from '../util.js';
import { runTasks, tasksSettled } from '@aurelia/runtime';
import { LifecycleHooks } from '@aurelia/runtime-html';

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

  // describe.only('scroller resizing', function () {
  //   it('resizes when scroller height changes', async function () {
  //     const { component, getBy, getAllBy, scrollBy } = createFixture(
  //       `<div id="scroller" style="height: 0; overflow: auto; background-color: lightgray;">
  //         <div virtual-repeat.for="item of items" style="height: 50px">\${item.name}</div>
  //       </div>`,
  //       class App { items = createItems(); },
  //       virtualRepeatDeps
  //     );

  //     await tasksSettled();

  //     getBy('#scroller').style.height = '600px';
  //     // console.log(getBy('#scroller').getBoundingClientRect().height);
  //     // getBy('#scroller').style.width = '600px';

  //     // await new Promise(r => setTimeout(r, 350));
  //     await tasksSettled();
  //     assert.strictEqual(getAllBy('div').length, 24 + 2 /* buffers */);
  //     // await new Promise(r => setTimeout(r, 50000));
  //     // scrollBy('main', 400);
  //     debugger;
  //   });
  // });

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
