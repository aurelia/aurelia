import { AnchorEventInfo, LinkHandler } from '@aurelia/router';
import { assert, createSpy, TestContext } from '@aurelia/testing';
import { Writable } from '@aurelia/kernel';

describe('LinkHandler', function () {
  const callback = ((info) => { return; });
  function setup() {
    const ctx = TestContext.createHTMLTestContext();
    const { container, doc } = ctx;

    const sut = container.get(LinkHandler);

    function tearDown() { }

    return { addEventListener, removeEventListener, sut, tearDown, ctx };
  }

  it('can be created', function () {
    const { sut, tearDown } = setup();

    assert.notStrictEqual(sut, null, `sut`);

    tearDown();
  });

  it('can be activated', function () {
    const { sut, tearDown, ctx } = setup();

    const addEventListener = createSpy(ctx.doc, 'addEventListener');

    sut.activate({ callback: callback });

    assert.strictEqual(sut['isActive'], true, `linkHandler.isActive`);

    assert.deepStrictEqual(
      addEventListener.calls,
      [
        ['click', sut['handler'], true],
      ],
      `addEventListener.calls`,
    );

    addEventListener.restore();

    tearDown();
  });

  it('can be deactivated', function () {
    const { sut, tearDown, ctx } = setup();

    const removeEventListener = createSpy(ctx.doc, 'removeEventListener');

    sut.activate({ callback: callback });

    sut.deactivate();

    assert.strictEqual(sut['isActive'], false, `linkHandler.isActive`);

    assert.deepStrictEqual(
      removeEventListener.calls,
      [
        ['click', sut['handler'], true],
      ],
      `removeEventListener.calls`,
    );

    removeEventListener.restore();

    tearDown();
  });

  it('throws when activated while active', function () {
    const { sut, tearDown, ctx } = setup();

    const addEventListener = createSpy(ctx.doc, 'addEventListener');

    sut.activate({ callback: callback });

    assert.strictEqual(sut['isActive'], true, `linkHandler.isActive`);

    assert.deepStrictEqual(
      addEventListener.calls,
      [
        ['click', sut['handler'], true],
      ],
      `addEventListener.calls`,
    );

    let err;
    try {
      sut.activate({ callback: callback });
    } catch (e) {
      err = e;
    }
    assert.includes(err.message, 'Link handler has already been activated', `err.message`);

    addEventListener.restore();

    tearDown();
  });

  it('throws when deactivated while not active', function () {
    const { sut, tearDown } = setup();

    let err;
    try {
      sut.deactivate();
    } catch (e) {
      err = e;
    }
    assert.includes(err.message, 'Link handler has not been activated', `err.message`);

    tearDown();
  });

  it('returns the right href', function () {
    const { sut, tearDown, ctx } = setup();
    const { doc } = ctx;

    const tests = [
      { useHref: true, href: true, auHref: true, result: 'au-href' },
      { useHref: true, href: false, auHref: true, result: 'au-href' },
      { useHref: true, href: true, auHref: false, result: 'href' },
      { useHref: true, href: false, auHref: false, result: null },

      { useHref: false, href: true, auHref: true, result: 'au-href' },
      { useHref: false, href: false, auHref: true, result: 'au-href' },
      { useHref: false, href: true, auHref: false, result: null },
      { useHref: false, href: false, auHref: false, result: null },
    ];

    for (const test of tests) {
      const anchor = ctx.doc.createElement('a');
      if (test.href) {
        anchor.setAttribute('href', 'href');
      }
      if (test.auHref) {
        anchor.setAttribute('au-href', 'au-href');
      }
      doc.body.append(anchor);

      const evt = new MouseEvent('click', { cancelable: true });
      let info: AnchorEventInfo | null = { shouldHandleEvent: false, href: null, anchor: null };

      const origHandler = sut['handler'];
      (sut as Writable<typeof sut>)['handler'] = ev => {
        origHandler(ev);
        ev.preventDefault();
      };

      sut.activate({
        callback: (clickInfo) => info = clickInfo,
        useHref: test.useHref
      });
      anchor.dispatchEvent(evt);

      assert.strictEqual(info.shouldHandleEvent, test.result !== null, `LinkHandler.AnchorEventInfo.shouldHandleEvent`);
      assert.strictEqual(info.href, test.result, `LinkHandler.AnchorEventInfo.href`);

      sut.deactivate();
      (sut as Writable<typeof sut>)['handler'] = origHandler;

      anchor.remove();
    }

    tearDown();
  });
});
