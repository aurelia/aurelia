import { expect } from 'chai';
import { spy } from 'sinon';
import { LinkHandler } from './../../src/index';

describe('LinkHandler', () => {
  let linkHandler;
  const callback = ((info) => { return; });
  class MockDocument {
    public addEventListener(event, handler, preventDefault) { return; }
    public removeEventListener(handler) { return; }
  }

  beforeEach(() => {
    linkHandler = new LinkHandler();
    linkHandler.document = new MockDocument();
  });

  it('can be created', () => {
    expect(linkHandler).not.to.equal(null);
  });

  it('can be activated', () => {
    const callbackSpy = spy(linkHandler.document, 'addEventListener');
    linkHandler.activate({ callback: callback});

    expect(linkHandler.isActive).to.equal(true);
    expect(callbackSpy.calledOnce).to.equal(true);
  });

  it('can be deactivated', () => {
    const callbackSpy = spy(linkHandler.document, 'removeEventListener');
    linkHandler.deactivate();

    expect(linkHandler.isActive).to.equal(false);
    expect(callbackSpy.calledOnce).to.equal(true);
  });

  it('throws when activated while active', () => {
    const callbackSpy = spy(linkHandler.document, 'addEventListener');
    linkHandler.activate({ callback: callback});

    expect(linkHandler.isActive).to.equal(true);
    expect(callbackSpy.calledOnce).to.equal(true);

    let err;
    try {
      linkHandler.activate({ callback: callback});
    } catch (e) {
      err = e;
    }
    expect(err.message).to.contain('LinkHandler has already been activated');
  });

});
