import { expect } from 'chai';
import { spy } from 'sinon';
import { LinkHandler } from './../../src/index';

describe('LinkHandler', function () {
  let linkHandler;
  const callback = ((info) => { return; });
  class MockDocument {
    public addEventListener(event, handler, preventDefault) { return; }
    public removeEventListener(handler) { return; }
  }

  beforeEach(function () {
    linkHandler = new LinkHandler();
    linkHandler.document = new MockDocument();
  });

  it('can be created', function () {
    expect(linkHandler).not.to.equal(null);
  });

  it('can be activated', function () {
    const callbackSpy = spy(linkHandler.document, 'addEventListener');
    linkHandler.activate({ callback: callback });

    expect(linkHandler.isActive).to.equal(true);
    expect(callbackSpy.calledOnce).to.equal(true);
  });

  it('can be deactivated', function () {
    const callbackSpy = spy(linkHandler.document, 'removeEventListener');

    linkHandler.activate({ callback: callback });
    expect(linkHandler.isActive).to.equal(true);

    linkHandler.deactivate();
    expect(linkHandler.isActive).to.equal(false);
    expect(callbackSpy.calledOnce).to.equal(true);
  });

  it('throws when activated while active', function () {
    const callbackSpy = spy(linkHandler.document, 'addEventListener');
    linkHandler.activate({ callback: callback });

    expect(linkHandler.isActive).to.equal(true);
    expect(callbackSpy.calledOnce).to.equal(true);

    let err;
    try {
      linkHandler.activate({ callback: callback });
    } catch (e) {
      err = e;
    }
    expect(err.message).to.contain('Link handler has already been activated');
  });

  it('throws when deactivated while not active', function () {
    let err;
    try {
      linkHandler.deactivate();
    } catch (e) {
      err = e;
    }
    expect(err.message).to.contain('Link handler has not been activated');
  });

});
