import { createFixture, assert } from '@aurelia/testing';
import { DefaultVirtualRepeatConfiguration, VirtualRepeat } from '@aurelia/ui-virtualization';

describe('virtual-repeat', function () {
  const virtualRepeatDeps = [DefaultVirtualRepeatConfiguration];
  const virtualRepeats: VirtualRepeat[] = [];

  this.beforeAll(function () {
    VirtualRepeat.prototype.created = function () {
      virtualRepeats.push(this);
    };
  });

  this.beforeEach(function () {
    virtualRepeats.length = 0;
  });

  it('renders', async function () {
    await createFixture(
      '<div style="height: 600px; overflow: auto;"><div virtual-repeat.for="item of items" style="height: 50px">${item}</div></div>',
      class App {
        items = Array.from({ length: 100 }, (_, idx) => {
          return { idx, name: `item${idx}` };
        });
      },
      virtualRepeatDeps
    ).started;

    assert.deepStrictEqual(virtualRepeats[0].getDistances(), [0, (100 - (600 / 50) * 2) * 50]);
  });

  it('rerenders when scrolled', async function () {
    const { scrollBy, ctx } = await createFixture(
      '<div id=scroller style="height: 600px; overflow: auto;"><div virtual-repeat.for="item of items" style="height: 50px">${item.name}</div></div>',
      class App {
        items = Array.from({ length: 100 }, (_, idx) => {
          return { idx, name: `item${idx}` };
        });
      },
      virtualRepeatDeps
    ).started;

    scrollBy('#scroller', 400);
    ctx.platform.domWriteQueue.flush();

    const virtualRepeat = virtualRepeats[0];
    const firstView = virtualRepeat.getViews()[0];
    assert.deepStrictEqual(virtualRepeat.getDistances(), [400, /* whole thing - top distance */4600 - /* rendered view (24 items * 50px) */1200]);
    assert.strictEqual(firstView.nodes.firstChild.textContent, `item8`);
  });
});
