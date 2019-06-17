import { LinkHandler } from '@aurelia/router';
import { assert, createSpy } from '@aurelia/testing';
import { DOM } from '@aurelia/runtime-html';
import { Writable } from '@aurelia/kernel';

describe('LinkHandler', function () {
  const callback = ((info) => { return; });
  interface MockDocument extends Document {}
  class MockDocument {
    public addEventListener(event, handler, preventDefault) { return; }
    public removeEventListener(handler) { return; }
  }

  function setup() {
    const mockDoc = new MockDocument();
    const addEventListener = createSpy(mockDoc, 'addEventListener');
    const removeEventListener = createSpy(mockDoc, 'removeEventListener');

    const originalDoc = DOM.document;
    (DOM as Writable<typeof DOM>).document = mockDoc;

    const sut = new LinkHandler();

    function tearDown() {
      (DOM as Writable<typeof DOM>).document = originalDoc;
    }

    return { addEventListener, removeEventListener, sut, tearDown };
  }

  it('can be activated', function () {
    const { sut, tearDown, addEventListener } = setup();

    sut.activate({ callback: callback});

    tearDown();

    assert.strictEqual(sut['isActive'], true, `linkHandler.isActive`);

    assert.deepStrictEqual(
      addEventListener.calls,
      [
        ['click', sut['handler'], true],
      ],
      `addEventListener.calls`,
    );
  });

  it('can be deactivated', function () {
    const { sut, tearDown, removeEventListener } = setup();

    sut.activate({ callback: callback});

    sut.deactivate();

    tearDown();

    assert.strictEqual(sut['isActive'], false, `linkHandler.isActive`);

    assert.deepStrictEqual(
      removeEventListener.calls,
      [
        ['click', sut['handler'], true],
      ],
      `removeEventListener.calls`,
    );
  });

  it('throws when activated while active', function () {
    const { sut, tearDown, addEventListener } = setup();

    sut.activate({ callback: callback});

    tearDown();

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
      sut.activate({ callback: callback});
    } catch (e) {
      err = e;
    }
    assert.includes(err.message, 'Link handler has already been activated', `err.message`);
  });

});
