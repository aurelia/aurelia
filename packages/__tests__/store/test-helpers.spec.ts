import { expect } from 'chai';
import { stub } from 'sinon';
import { executeSteps } from './helpers';
import { Reporter } from '@aurelia/kernel';
import {
  createTestStore,
  testState
} from './helpers';

describe('test helpers', () => {
  it('should provide easy means to test sequences', async () => {
    const { store } = createTestStore();

    const actionA = (_: testState) => Promise.resolve({ foo: 'A' });
    const actionB = (_: testState) => Promise.resolve({ foo: 'B' });
    const actionC = (_: testState) => Promise.resolve({ foo: 'C' });
    store.registerAction('Action A', actionA);
    store.registerAction('Action B', actionB);
    store.registerAction('Action C', actionC);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res) => {
        expect(res.foo).to.equal('A');
        store.dispatch(actionB);
      },
      (res) => {
        expect(res.foo).to.equal('B');
        store.dispatch(actionC); },
      (res) => expect(res.foo).to.equal('C')
    );
  });

  it('should reject with error if step fails', async () => {
    const { store } = createTestStore();

    const actionA = (_: testState) => Promise.resolve({ foo: 'A' });
    const actionB = (_: testState) => Promise.resolve({ foo: 'B' });
    const actionC = (_: testState) => Promise.resolve({ foo: 'C' });
    store.registerAction('Action A', actionA);
    store.registerAction('Action B', actionB);
    store.registerAction('Action C', actionC);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res) => {
        expect(res.foo).to.equal('A');
        store.dispatch(actionB); },
      (res) => {
        expect(res.foo).to.equal('B');
        store.dispatch(actionC);
        throw Error('on purpose');
      },
      (res) => expect(res.foo).to.equal('C')
    ).catch((e: Error) => {
      expect(e.message).to.equal('on purpose');
    });
  });

  it('should set values during executeSteps', async () => {
    const { store } = createTestStore();

    stub(Reporter, 'write');

    const actionA = (_: testState) => Promise.resolve({ foo: 'A' });
    const actionB = (_: testState) => Promise.resolve({ foo: 'B' });
    const actionC = (_: testState) => Promise.resolve({ foo: 'C' });
    store.registerAction('Action A', actionA);
    store.registerAction('Action B', actionB);
    store.registerAction('Action C', actionC);

    await executeSteps(
      store,
      true,
      () => store.dispatch(actionA),
      (res) => {
        expect(res.foo).to.equal('A');
        store.dispatch(actionB);
      },
      (res) => {
        expect(res.foo).to.equal('B');
        store.dispatch(actionC);
      },
      (res) => expect(res.foo).to.equal('C')
    );
  });
});
