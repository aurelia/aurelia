import { delay, skip } from 'rxjs/operators';
import { stub } from 'sinon';

import { PLATFORM } from '@aurelia/kernel';
import { expect } from 'chai';
import { DevToolsOptions } from '../../src/devtools';
import { Store } from '../../src/store';
import {
  createTestStore,
  testState
} from './helpers';

class DevToolsMock {
  // tslint:disable-next-line
  public subscriptions = [] as Function[];
  public init = stub();
  public subscribe = stub().callsFake((cb: (message: any) => void) => this.subscriptions.push(cb));
  public send = stub();

  constructor(public devToolsOptions: DevToolsOptions) {}
}

function createDevToolsMock() {
  PLATFORM.global.devToolsExtension = {};
  PLATFORM.global.__REDUX_DEVTOOLS_EXTENSION__ = {
    connect: (devToolsOptions?: DevToolsOptions) => new DevToolsMock(devToolsOptions)
  };
}

describe('redux devtools', () => {

  beforeEach(() => {
    delete PLATFORM.global.devToolsExtension;
  });

  it('should setup devtools on construction by default', () => {
    const spy = stub(Store.prototype as any, 'setupDevTools');
    new Store<testState>({ foo: 'bar ' });

    expect(spy).to.have.callCount(1);
    spy.reset();
    spy.restore();
  });

  it('should not setup devtools if disabled via options', () => {
    const spy = stub(Store.prototype as any, 'setupDevTools');
    const theStore = new Store<testState>({ foo: 'bar '}, { devToolsOptions: { disable: true } });

    expect(spy).not.to.have.callCount(1);
    expect((theStore as any).devToolsAvailable).to.equal(false);
    spy.reset();
    spy.restore();
  });

  it('should init devtools if available', () => {
    createDevToolsMock();
    const store = new Store<testState>({ foo: 'bar ' });

    expect((store as any).devToolsAvailable).to.equal(true);
    expect((store as any).devTools.init).to.have.callCount(1);
  });

  it('should use DevToolsOptions if available', () => {
    createDevToolsMock();
    const store = new Store<testState>({ foo: 'bar ' }, { devToolsOptions: { serialize: false } });

    expect((store as any).devTools.devToolsOptions).not.to.be.undefined;
  });

  it('should receive time-travel notification from devtools', () => {
    createDevToolsMock();

    const store = new Store<testState>({ foo: 'bar ' });
    const devtools = ((store as any).devTools as DevToolsMock);
    const expectedStateChange = 'from-redux-devtools';

    expect(devtools.subscriptions.length).to.equal(1);

    devtools.subscriptions[0]({ state: JSON.stringify({ foo: expectedStateChange }) });

    expect(devtools.subscribe).to.have.callCount(1);
  });

  it('should update state when receiving DISPATCH message', (done) => {
    createDevToolsMock();

    const store = new Store<testState>({ foo: 'bar ' });
    const devtools = ((store as any).devTools as DevToolsMock);
    const expectedStateChange = 'from-redux-devtools';

    expect(devtools.subscriptions.length).to.equal(1);

    devtools.subscriptions[0]({ type: 'DISPATCH', state: JSON.stringify({ foo: expectedStateChange }) });

    store.state.subscribe((timeTravelledState) => {
      expect(timeTravelledState.foo).to.equal(expectedStateChange);
      done();
    });
  });

  it('should update Redux DevTools', done => {
    createDevToolsMock();

    const { store } = createTestStore();
    const devtools = ((store as any).devTools as DevToolsMock);

    const fakeAction = (currentState: testState, foo: string) => {
      return {...currentState,  foo};
    };

    store.registerAction('FakeAction', fakeAction);
    store.dispatch(fakeAction, 'bert');

    store.state.pipe(
      skip(1),
      delay(1)
    ).subscribe(() => {
      expect(devtools.send).to.have.callCount(1);
      expect(devtools.send).calledWith({
        params: ['bert'], type: 'FakeAction'},
                                       { foo: 'bert' }
      );

      done();
    });
  });

  it('should send the newly dispatched actions to the devtools if available', done => {
    const { store } = createTestStore();
    (store as any).devToolsAvailable = true;
    const spy = stub();
    (store as any).devTools = { send: spy };

    const modifiedState = { foo: 'bert' };
    const fakeAction = (currentState: testState) => {
      return {...currentState, ...modifiedState};
    };

    store.registerAction('FakeAction', fakeAction);
    store.dispatch(fakeAction);

    store.state.pipe(
      skip(1),
      delay(1)
    ).subscribe(() => {
      expect(spy).to.have.callCount(1);

      spy.reset();
      done();
    });
  });
});
