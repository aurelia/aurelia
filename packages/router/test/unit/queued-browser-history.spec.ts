import { expect } from 'chai';
import { spy } from 'sinon';
import { QueuedBrowserHistory } from './../../src/index';

describe('QueuedBrowserHistory', function() {
  let qbh;
  const callback = ((info) => { return; });
  class MockWindow {
    public addEventListener(event, handler, preventDefault) { return; }
    public removeEventListener(handler) { return; }
  }

  beforeEach(function() {
    qbh = new QueuedBrowserHistory();
    qbh.window = new MockWindow();
  });

  it('can be created', function() {
    expect(qbh).not.to.equal(null);
  });

  it('can be activated', function() {
    const callbackSpy = spy(qbh.window, 'addEventListener');
    qbh.activate({ callback: callback});

    expect(qbh.isActive).to.equal(true);
    expect(callbackSpy.calledOnce).to.equal(true);
  });

  it('can be deactivated', function() {
    const callbackSpy = spy(qbh.window, 'removeEventListener');
    qbh.deactivate();

    expect(qbh.isActive).to.equal(false);
    expect(callbackSpy.calledOnce).to.equal(true);
  });

  it('throws when activated while active', function() {
    const callbackSpy = spy(qbh.window, 'addEventListener');
    qbh.activate({ callback: callback});

    expect(qbh.isActive).to.equal(true);
    expect(callbackSpy.calledOnce).to.equal(true);

    let err;
    try {
      qbh.activate({ callback: callback});
    } catch (e) {
      err = e;
    }
    expect(err.message).to.contain('Queued browser history has already been activated');
  });

  it('queues consecutive calls', async function() {
    const callbackSpy = spy(qbh, 'dequeue');
    qbh.activate({ callback: callback});

    const length = qbh.length;
    qbh.pushState({}, null, '#one');
    qbh.replaceState("test", null, '#two');
    qbh.back();
    qbh.forward();
    expect(callbackSpy.callCount).to.equal(0);
    expect(qbh.length).to.equal(length);
    expect(qbh.queue.length).to.equal(4);
  });
});
