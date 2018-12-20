import { LinkHandler } from './../../src/link-handler';
import { expect } from 'chai';
import { spy, SinonSpy } from 'sinon';

describe('LinkHandler', () => {
  let linkHandler;
  let callback = ((info) => { });
  class MockDocument {
    addEventListener(event, handler, preventDefault) {}
    removeEventListener(handler) {}
  }

  beforeEach(() => {
    linkHandler = new LinkHandler();
    linkHandler.document = new MockDocument();
  });

  it('can be created', () => {
    expect(linkHandler).to.not.be.null;
  });

  it('can be activated', () => {
    const callbackSpy = spy(linkHandler.document, 'addEventListener');
    linkHandler.activate({ callback: callback});

    expect(linkHandler.isActive).to.be.true;
    expect(callbackSpy.calledOnce).to.be.true;
  });

  it('can be deactivated', () => {
    const callbackSpy = spy(linkHandler.document, 'removeEventListener');
    linkHandler.deactivate();

    expect(linkHandler.isActive).to.be.false;
    expect(callbackSpy.calledOnce).to.be.true;
  });

  it('throws when activated while active', () => {
    const callbackSpy = spy(linkHandler.document, 'addEventListener');
    linkHandler.activate({ callback: callback});

    expect(linkHandler.isActive).to.be.true;
    expect(callbackSpy.calledOnce).to.be.true;

    let err;
    try {
      linkHandler.activate({ callback: callback});
    } catch(e) {
      err = e;
    }
    expect(err.message).to.contain('LinkHandler has already been activated');
  });

});
