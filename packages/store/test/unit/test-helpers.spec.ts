import { expect } from 'chai';
import chaiCounter from 'chai-counter';
import { stub } from 'sinon';
import { executeSteps } from '../../src/test-helpers';
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
    chaiCounter.expect(4);
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

  it('should provide console information during executeSteps', async () => {
    chaiCounter.expect(6);
    const { store } = createTestStore();

    ['log', 'group', 'groupEnd'].forEach((fct) => {
      (global.console as any)[fct] = stub();
    });

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

    ['log', 'group', 'groupEnd'].forEach((fct) => {
      expect((global.console as any)[fct]).to.have.been.called;

      ((global.console as any)[fct] as any).reset();
      ((global.console as any)[fct] as any).restore();
    });
  });
});
