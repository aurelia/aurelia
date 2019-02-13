import { expect } from 'chai';
import { spy } from 'sinon';
import { QueuedBrowserHistory } from './../../src/index';

describe('QueuedBrowserHistory', function () {
  this.timeout(30000);
  let qbh;
  let callbackCount = 0;
  const callback = ((info) => {
    callbackCount++;
  });
  class MockWindow {
    public addEventListener(event, handler, preventDefault) { return; }
    public removeEventListener(handler) { return; }
  }

  beforeEach(function () {
    qbh = new QueuedBrowserHistory();
    // qbh.window = new MockWindow();
    callbackCount = 0;
  });

  it('can be created', function () {
    expect(qbh).not.to.equal(null);
  });

  it('can be activated', function () {
    const callbackSpy = spy(qbh.window, 'addEventListener');
    qbh.activate(callback);

    expect(qbh.isActive).to.equal(true);
    expect(callbackSpy.calledOnce).to.equal(true);

    qbh.deactivate();
  });

  it('can be deactivated', function () {
    const callbackSpy = spy(qbh.window, 'removeEventListener');

    qbh.activate(callback);
    expect(qbh.isActive).to.equal(true);

    qbh.deactivate();

    expect(qbh.isActive).to.equal(false);
    expect(callbackSpy.calledOnce).to.equal(true);
  });

  it('throws when activated while active', function () {
    qbh.activate(callback);

    expect(qbh.isActive).to.equal(true);

    let err;
    try {
      qbh.activate(callback);
    } catch (e) {
      err = e;
    }
    expect(err.message).to.contain('Queued browser history has already been activated');

    qbh.deactivate();
  });

  it('queues consecutive calls', async function () {
    const callbackSpy = spy(qbh, 'dequeue');
    qbh.activate(callback);

    const length = qbh.length;
    qbh.pushState({}, null, '#one');
    qbh.replaceState("test", null, '#two');
    qbh.back();
    qbh.forward();
    expect(callbackSpy.callCount).to.equal(0);
    expect(qbh.length).to.equal(length);
    expect(qbh.queue.length).to.equal(4);
    await wait();

    qbh.deactivate();
  });

  it('awaits go', async function () {
    let counter = 0;
    qbh.activate(function () {
      counter++;
    });

    await qbh.pushState('one', null, '#one');
    expect(qbh.history.state).to.equal('one');
    await qbh.pushState('two', null, '#two');
    expect(qbh.history.state).to.equal('two');
    await qbh.go(-1);
    await Promise.resolve();
    expect(qbh.history.state).to.equal('one');

    expect(counter).to.equal(1);

    qbh.deactivate();
  });

  it('suppresses popstate event callback', async function () {
    let counter = 0;
    qbh.activate(function () {
      counter++;
    });

    await qbh.pushState('one', null, '#one');
    expect(qbh.history.state).to.equal('one');
    await qbh.pushState('two', null, '#two');
    expect(qbh.history.state).to.equal('two');
    await qbh.go(-1, true);
    await Promise.resolve();
    expect(qbh.history.state).to.equal('one');

    expect(counter).to.equal(0);

    qbh.deactivate();
  });
});

const wait = async (time = 100) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
