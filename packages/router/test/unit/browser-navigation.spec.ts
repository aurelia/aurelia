import { expect } from 'chai';
import { spy } from 'sinon';
import { INavigationState } from './../../src/browser-navigation';
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

  it('queues consecutive calls', async function () {
    await browserNavigation.activate(callback);

    const length = browserNavigation.pendingCalls.length;
    browserNavigation.push(navigationState('one'));
    browserNavigation.replace(navigationState('two'));
    browserNavigation.go(-1);
    browserNavigation.go(1);
    // expect(browserNavigation.pendingCalls.length).to.equal(length + 8 - browserNavigation.allowedNoOfExecsWithinTick);
    await wait();

    browserNavigation.deactivate();
  });

  it('awaits go', async function () {
    let counter = 0;
    await browserNavigation.activate(
      // Called once as part of activation and then for each url/location change
      function () {
        counter++;
      });

    await browserNavigation.push(navigationState('one'));
    expect(browserNavigation.history.state.NavigationEntry.instruction).to.equal('one');
    await browserNavigation.push(navigationState('two'));
    expect(browserNavigation.history.state.NavigationEntry.instruction).to.equal('two');
    await browserNavigation.go(-1);
    await Promise.resolve();
    expect(browserNavigation.history.state.NavigationEntry.instruction).to.equal('one');

    expect(counter).to.equal(2); // Initial + above 'go'

    browserNavigation.deactivate();
  });

  it('can be created', function () {
    expect(browserNavigation).not.to.equal(null);
  });

  it('can be activated', async function () {
    const callbackSpy = spy(browserNavigation.window, 'addEventListener');
    await browserNavigation.activate(callback);

    expect(browserNavigation.isActive).to.equal(true);
    expect(callbackSpy.calledOnce).to.equal(true);

    browserNavigation.deactivate();
  });

  it('can be deactivated', async function () {
    const callbackSpy = spy(browserNavigation.window, 'removeEventListener');

    await browserNavigation.activate(callback);
    expect(browserNavigation.isActive).to.equal(true);

    browserNavigation.deactivate();

    expect(browserNavigation.isActive).to.equal(false);
    expect(callbackSpy.calledOnce).to.equal(true);
  });

  it('throws when activated while active', async function () {
    await browserNavigation.activate(callback);

    expect(browserNavigation.isActive).to.equal(true);

    let err;
    try {
      await browserNavigation.activate(callback);
    } catch (e) {
      err = e;
    }
    expect(err.message).to.be.oneOf(['Browser navigation has already been activated', 'Code 2003']);

    browserNavigation.deactivate();
  });

  it('suppresses popstate event callback', async function () {
    let counter = 0;
    await browserNavigation.activate(
      // Called once as part of activation and then for each url/location change
      function () {
        counter++;
      });

    await browserNavigation.push(navigationState('one'));
    expect(browserNavigation.history.state.NavigationEntry.instruction).to.equal('one');
    await browserNavigation.push(navigationState('two'));
    expect(browserNavigation.history.state.NavigationEntry.instruction).to.equal('two');
    await browserNavigation.go(-1, true);
    await Promise.resolve();
    expect(browserNavigation.history.state.NavigationEntry.instruction).to.equal('one');

    expect(counter).to.equal(1); // Initial (and not + the above 'go')

    browserNavigation.deactivate();
  });
});

const navigationState = (instruction: string): INavigationState => {
  return {
    NavigationEntries: [],
    NavigationEntry: {
      instruction: instruction,
      fullStateInstruction: null,
      path: instruction,
    }
  };
};

const wait = async (time = 100) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
