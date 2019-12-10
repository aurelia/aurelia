import {
  applyLimits,
  jump,
  nextStateHistory,
  StateHistory
} from '@aurelia/store';

import {
  createStoreWithStateAndOptions,
  createUndoableTestStore,
  executeSteps,
  testState
} from './helpers';

import { expect } from 'chai';

describe('an undoable store', () => {
  it('should return state as is if not matching type of StateHistory', () => {
    const simpleState: testState = {
      foo: 'Bar'
    };

    expect(jump(simpleState, 0)).to.equal(simpleState);
  });

  it('should return state as is from applyLimits if not matching type of StateHistory', () => {
    const simpleState: testState = {
      foo: 'Bar'
    };

    expect(applyLimits(simpleState, 0)).to.equal(simpleState);
  });

  it('should jump back and forth in time', async () => {
    const { store } = createUndoableTestStore();

    const actionA = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: 'A' }));
    const actionB = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: 'B' }));
    const actionC = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: 'C' }));
    store.registerAction('Action A', actionA);
    store.registerAction('Action B', actionB);
    store.registerAction('Action C', actionC);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res) => {
        expect(res.present.foo).to.equal('A');
        store.dispatch(actionB);
      },
      (res) => {
        expect(res.present.foo).to.equal('B');
        store.dispatch(actionC); },
      (res) => {
        expect(res.present.foo).to.equal('C');
        store.dispatch((jump as any), -1); },
      (res) => {
        expect(res.present.foo).to.equal('B');
        store.dispatch((jump as any), 1); },
      (res) => expect(res.present.foo).to.equal('C')
    );
  });

  it('should return the same state if jumping zero times', async () => {
    const { store } = createUndoableTestStore();
    const actionA = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: 'A' }));
    const actionB = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: 'B' }));

    store.registerAction('Action A', actionA);
    store.registerAction('Action B', actionB);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res) => {
        expect(res.present.foo).to.equal('A');
        store.dispatch(actionB); },
      (res) => {
        expect(res.present.foo).to.equal('B');
        store.dispatch((jump as any), 0); },
      (res) => expect(res.present.foo).to.equal('B')
    );
  });

  it('should return the same state if jumping too far into future', async () => {
    const { store } = createUndoableTestStore();
    const actionA = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: 'A' }));
    const actionB = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: 'B' }));

    store.registerAction('Action A', actionA);
    store.registerAction('Action B', actionB);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res) => {
        expect(res.present.foo).to.equal('A');
        store.dispatch(actionB); },
      (res) => {
        expect(res.present.foo).to.equal('B');
        store.dispatch((jump as any), 3); },
      (res) => expect(res.present.foo).to.equal('B')
    );
  });

  it('should return the same state if jumping too far into past', async () => {
    const { store } = createUndoableTestStore();
    const actionA = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: 'A' }));
    const actionB = (currentState: StateHistory<testState>) => Promise.resolve(nextStateHistory(currentState, { foo: 'B' }));

    store.registerAction('Action A', actionA);
    store.registerAction('Action B', actionB);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res) => {
        expect(res.present.foo).to.equal('A');
        store.dispatch(actionB); },
      (res) => {
        expect(res.present.foo).to.equal('B');
        store.dispatch((jump as any), -3); },
      (res) => expect(res.present.foo).to.equal('B')
    );
  });

  it('should limit the resulting states past if option is passed', async () => {
    const initialState: StateHistory<testState> = {
      past: [],
      present: { foo: 'bar' },
      future: []
    };
    const limit = 3;
    const store = createStoreWithStateAndOptions(initialState, { history: { undoable: true, limit } });
    const fakeAction = (currentState: StateHistory<testState>, idx: number) => Promise.resolve(nextStateHistory(currentState, { foo: idx.toString() }));

    store.registerAction('FakeAction', fakeAction);

    await executeSteps(
      store,
      false,
      ...Array.from(new Array(limit + limit)).map((_, idx) => {
        return (res: StateHistory<testState>) => {
          store.dispatch(fakeAction, idx + 1);

          expect(res.past.length).to.equal(idx >= limit ? limit : idx);
        };
      }),
      (res) => {
        expect(res.past.length).to.equal(limit);
        expect(res.past.map(i => i.foo)).to.have.all.members(Array.from(new Array(limit)).map((_, idx) => (limit + idx).toString()));
      }
    );
  });

  it('should limit the resulting states future if option is passed', async () => {
    const initialState: StateHistory<testState> = {
      past: [],
      present: { foo: 'bar' },
      future: []
    };
    const limit = 3;
    const store = createStoreWithStateAndOptions(initialState, { history: { undoable: true, limit } });
    const stateAfterInitial = {
      past: Array.from(new Array(limit)).map((_, idx) => ({ foo: idx.toString() })),
      present: { foo: 'x' },
      future: Array.from(new Array(limit)).map((_, idx) => ({ foo: (limit + idx).toString() }))
    };

    const fakeAction = (_: StateHistory<testState>) => {
      return Promise.resolve(stateAfterInitial);
    };

    store.registerAction('FakeAction', fakeAction);

    await executeSteps(
      store,
      false,
      () => store.dispatch(fakeAction),
      (res) => {
        expect(res).to.equal(stateAfterInitial);
        store.dispatch((jump as any), - limit); },
      (res) => {
        expect(res.future.length).to.equal(limit);
        expect(res.present).to.equal(stateAfterInitial.past[0]);
        expect(res.past.length).to.eq(0);
        expect(res.future).to.have.all.members([ ...stateAfterInitial.past.slice(1), stateAfterInitial.present]);
      }
    );
  });
});
