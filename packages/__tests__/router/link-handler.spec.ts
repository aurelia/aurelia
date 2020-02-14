import { AnchorEventInfo, LinkHandler, GotoCustomAttribute, HrefCustomAttribute } from '@aurelia/router';
import { assert, createSpy, TestContext } from '@aurelia/testing';
import { Writable, IRegistry, PLATFORM } from '@aurelia/kernel';
import { CustomElement, Aurelia } from '@aurelia/runtime';

describe('LinkHandler', function () {
  function createFixture() {
    const ctx = TestContext.createHTMLTestContext();
    const { container } = ctx;

    const sut = container.get(LinkHandler);

    return { sut, ctx };
  }

  async function setupApp(App) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, doc } = ctx;

    const host = doc.createElement('div');
    doc.body.appendChild(host as any);

    const au = new Aurelia(container)
      .register(GotoCustomAttribute as unknown as IRegistry, HrefCustomAttribute as unknown as IRegistry)
      .app({ host, component: App });

    await au.start().wait();

    const sut = container.get(LinkHandler);

    async function tearDown() {
      await au.stop().wait();
      doc.body.removeChild(host);
    }

    return { sut, au, container, host, ctx, tearDown };
  }

  it('can be created', function () {
    const { sut } = createFixture();

    assert.notStrictEqual(sut, null, `sut`);
  });

  it('can be activated', function () {
    const { sut, ctx } = createFixture();

    const addEventListener = createSpy(ctx.doc, 'addEventListener');

    sut.activate({ callback: info => console.log('can be activated', info) });

    assert.strictEqual(sut['isActive'], true, `linkHandler.isActive`);

    // assert.deepStrictEqual(
    //   addEventListener.calls,
    //   [
    //     ['click', sut['handler'], true],
    //   ],
    //   `addEventListener.calls`,
    // );

    addEventListener.restore();

    sut.deactivate();
  });

  it('can be deactivated', function () {
    const { sut } = createFixture();

    sut.activate({ callback: info => console.log('can be deactivated', info) });

    assert.strictEqual(sut['isActive'], true, `linkHandler.isActive`);

    sut.deactivate();

    assert.strictEqual(sut['isActive'], false, `linkHandler.isActive`);
  });

  it('throws when activated while active', function () {
    const { sut, ctx } = createFixture();

    const addEventListener = createSpy(ctx.doc, 'addEventListener');

    sut.activate({ callback: info => console.log('throws when activated while active', info) });

    assert.strictEqual(sut['isActive'], true, `linkHandler.isActive`);

    // assert.deepStrictEqual(
    //   addEventListener.calls,
    //   [
    //     ['click', sut['handler'], true],
    //   ],
    //   `addEventListener.calls`,
    // );

    let err;
    try {
      sut.activate({ callback: info => console.log('throws when activated AGAIN while active', info) });
    } catch (e) {
      err = e;
    }
    assert.includes(err.message, 'Link handler has already been activated', `err.message`);

    addEventListener.restore();

    sut.deactivate();
  });

  it('throws when deactivated while not active', function () {
    const { sut } = createFixture();

    let err;
    try {
      sut.deactivate();
    } catch (e) {
      err = e;
    }
    assert.includes(err.message, 'Link handler has not been activated', `err.message`);
  });

  if (PLATFORM.isBrowserLike) {
    // TODO: figure out why it doesn't work in nodejs and fix it
    const tests = [
      { useHref: true, href: true, goto: true, result: 'goto' },
      { useHref: true, href: false, goto: true, result: 'goto' },
      { useHref: true, href: true, goto: false, result: 'href' },
      { useHref: true, href: false, goto: false, result: null },

      { useHref: false, href: true, goto: true, result: 'goto' },
      { useHref: false, href: false, goto: true, result: 'goto' },
      { useHref: false, href: true, goto: false, result: null },
      { useHref: false, href: false, goto: false, result: null },
    ];

    for (const test of tests) {
      it(`returns the right instruction${test.useHref ? ' using href' : ''}:${test.href ? ' href' : ''}${test.goto ? ' goto' : ''}`, async function () {
        const App = CustomElement.define({
          name: 'app',
          template: `<a ${test.href ? 'href="href"' : ''} ${test.goto ? 'goto="goto"' : ''}>Link</a>`
        });

        const { sut, tearDown, ctx } = await setupApp(App);
        const { doc } = ctx;

        const anchor = doc.getElementsByTagName('A')[0];

        const evt = new MouseEvent('click', { cancelable: true });
        let info: AnchorEventInfo | null = { shouldHandleEvent: false, instruction: null, anchor: null };

        const origHandler = sut['handler'];
        (sut as Writable<typeof sut>)['handler'] = ev => {
          origHandler(ev);
          ev.preventDefault();
        };

        const prevent = (ev => ev.preventDefault());
        doc.addEventListener('click', prevent, true);

        sut.activate({
          callback: (clickInfo) => info = clickInfo,
          useHref: test.useHref
        });
        anchor.dispatchEvent(evt);

        assert.strictEqual(info.shouldHandleEvent, test.result !== null, `LinkHandler.AnchorEventInfo.shouldHandleEvent`);
        assert.strictEqual(info.instruction, test.result, `LinkHandler.AnchorEventInfo.instruction`);

        sut.deactivate();
        doc.removeEventListener('click', prevent, true);
        (sut as Writable<typeof sut>)['handler'] = origHandler;

        await tearDown();
      });
    }
  }
});
