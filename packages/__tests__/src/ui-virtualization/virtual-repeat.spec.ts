import { createFixture, assert } from '@aurelia/testing';
import { DefaultVirtualizationConfiguration, VirtualRepeat, VIRTUAL_REPEAT_NEAR_BOTTOM, VIRTUAL_REPEAT_NEAR_TOP, type IVirtualRepeatNearBottomEvent, type IVirtualRepeatNearTopEvent } from '@aurelia/ui-virtualization';
import { isNode } from '../util.js';

describe('ui-virtualization/virtual-repeat.spec.ts', function () {
  if (isNode()) {
    return;
  }
  const virtualRepeatDeps = [DefaultVirtualizationConfiguration];
  const virtualRepeats: VirtualRepeat[] = [];

  this.beforeAll(function () {
    VirtualRepeat.prototype.created = function () {
      virtualRepeats.push(this);
    };
  });

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
    const { scrollBy, flush } = createFixture(
      createScrollerTemplate('<div virtual-repeat.for="item of items" style="height: 50px">${item.name}</div>'),
      class App { items = createItems(); },
      virtualRepeatDeps
    );

    scrollBy('#scroller', 400);
    flush();

    const virtualRepeat = virtualRepeats[0];
    const firstView = virtualRepeat.getViews()[0];
    assert.deepStrictEqual(virtualRepeat.getDistances(), [400, /* whole thing - top distance */4600 - /* rendered view (24 items * 50px) */1200]);
    assert.strictEqual(firstView.nodes.firstChild.textContent, `item-8`);
  });

  describe('mutation', function () {
    it('rerenders when removed at the start', function () {
      const { component, flush } = createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items" style="height: 50px">${item.name}</div>'),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      component.items.splice(0, 10);
      flush();
      assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, (90 - (600 / 50) * 2) * 50]);

      const virtualRepeat = virtualRepeats[0];
      const firstView = virtualRepeat.getViews()[0];
      assert.strictEqual(firstView.nodes.firstChild.textContent, `item-10`);
    });

    it('rerenders when removed at the end', function () {
      const { component, flush } = createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items" style="height: 50px">${item.name}</div>'),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      component.items.splice(90, 10);
      flush();
      assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, (90 - (600 / 50) * 2) * 50]);
      const virtualRepeat = virtualRepeats[0];
      const firstView = virtualRepeat.getViews()[0];
      assert.strictEqual(firstView.nodes.firstChild.textContent, `item-0`);
    });

    it('rerenders when removed in the middle', function () {
      const { component, flush } = createFixture(
        createScrollerTemplate('<div virtual-repeat.for="item of items" style="height: 50px">${item.name}</div>'),
        class App { items = createItems(); },
        virtualRepeatDeps
      );

      component.items.splice(10, 10);
      flush();
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
  });

  describe('infinite scroll', function () {
    it('triggers near-bottom event when scrolling to the end', function (done) {
      const { scrollBy, flush } = createFixture(
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
      flush();
    });

    it('triggers near-top event when scrolling back to top', function (done) {
      const { scrollBy, flush } = createFixture(
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
      flush();

      scrollBy('#scroller', -5000);
      flush();
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

  function createItems(count = 100) {
    return Array.from({ length: count }, (_, idx) => {
      return { idx, name: `item-${idx}` };
    });
  }
});
