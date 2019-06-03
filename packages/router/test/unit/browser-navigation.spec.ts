import { expect } from 'chai';
import { spy } from 'sinon';
import { BrowserNavigation } from './../../src/index';

describe('BrowserNavigation', function () {
  this.timeout(30000);
  let browserNavigation;
  let callbackCount = 0;
  const callback = ((info) => {
    callbackCount++;
  });
  class MockWindow {
    public addEventListener(event, handler, preventDefault) { return; }
    public removeEventListener(handler) { return; }
  }

  beforeEach(function () {
    browserNavigation = new BrowserNavigation();
    // browserNavigation.window = new MockWindow();
    callbackCount = 0;
  });

  it('can be created', function () {
    expect(browserNavigation).not.to.equal(null);
  });

  it('can be activated', function () {
    const callbackSpy = spy(browserNavigation.window, 'addEventListener');
    browserNavigation.activate(callback);

    expect(browserNavigation.isActive).to.equal(true);
    expect(callbackSpy.calledOnce).to.equal(true);

    browserNavigation.deactivate();
  });

  it('can be deactivated', function () {
    const callbackSpy = spy(browserNavigation.window, 'removeEventListener');

    browserNavigation.activate(callback);
    expect(browserNavigation.isActive).to.equal(true);

    browserNavigation.deactivate();

    expect(browserNavigation.isActive).to.equal(false);
    expect(callbackSpy.calledOnce).to.equal(true);
  });

  it('throws when activated while active', function () {
    browserNavigation.activate(callback);

    expect(browserNavigation.isActive).to.equal(true);

    let err;
    try {
      browserNavigation.activate(callback);
    } catch (e) {
      err = e;
    }
    expect(err.message).to.contain('Browser navigation has already been activated');

    browserNavigation.deactivate();
  });

  it('queues consecutive calls', async function () {
    const callbackSpy = spy(browserNavigation, 'dequeue');
    browserNavigation.activate(callback);

    const length = browserNavigation.length;
    browserNavigation.push({}, null, '#one');
    browserNavigation.replace("test", null, '#two');
    browserNavigation.back();
    browserNavigation.forward();
    expect(callbackSpy.callCount).to.equal(0);
    expect(browserNavigation.length).to.equal(length);
    expect(browserNavigation.queue.length).to.equal(4);
    await wait();

    browserNavigation.deactivate();
  });

  it('awaits go', async function () {
    let counter = 0;
    browserNavigation.activate(function () {
      counter++;
    });

    await browserNavigation.push('one', null, '#one');
    expect(browserNavigation.history.state).to.equal('one');
    await browserNavigation.push('two', null, '#two');
    expect(browserNavigation.history.state).to.equal('two');
    await browserNavigation.go(-1);
    await Promise.resolve();
    expect(browserNavigation.history.state).to.equal('one');

    expect(counter).to.equal(1);

    browserNavigation.deactivate();
  });

  it('suppresses popstate event callback', async function () {
    let counter = 0;
    browserNavigation.activate(function () {
      counter++;
    });

    await browserNavigation.push('one', null, '#one');
    expect(browserNavigation.history.state).to.equal('one');
    await browserNavigation.push('two', null, '#two');
    expect(browserNavigation.history.state).to.equal('two');
    await browserNavigation.go(-1, true);
    await Promise.resolve();
    expect(browserNavigation.history.state).to.equal('one');

    expect(counter).to.equal(0);

    browserNavigation.deactivate();
  });
});

const wait = async (time = 100) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
