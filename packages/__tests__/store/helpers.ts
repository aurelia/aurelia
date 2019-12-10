import {
  Store,
  StoreOptions,
  StateHistory
} from '@aurelia/store';

import { delay, skip, take } from 'rxjs/operators';

import { SinonStub } from 'sinon';

export type testState = {
  foo: string;
};

export function createTestStore() {
  const initialState = { foo: 'bar' };
  const store: Store<testState> = new Store(initialState);

  return { initialState, store };
}

export function createUndoableTestStore() {
  // tslint:disable-next-line:no-object-literal-type-assertion
  const initialState = {
    past: [],
    present: { foo: 'bar' },
    future: []
  } as StateHistory<testState>;
  const options = { history: { undoable: true } };
  const store = new Store(initialState, options);

  return { initialState, store };
}

export function createStoreWithState<T>(state: T, withUndo = false) {
  const options = withUndo ? { history: { undoable: true } } : {};
  return new Store<T>(state, options);
}

export function createStoreWithStateAndOptions<T>(state: T, options: Partial<StoreOptions>) {
  return new Store<T>(state, options);
}

export type Spied<T> = {
  [Method in keyof T]: T[Method] & SinonStub;
};

export type StepFn<T> = (res: T) => void;

export async function executeSteps<T>(store: Store<T>, shouldLogResults: boolean, ...steps: StepFn<T>[]) {
  const logStep = (step: StepFn<T>, stepIdx: number) => (res: T) => {
    if (shouldLogResults) {
      console.group(`Step ${stepIdx}`)
      console.log(res);
      console.groupEnd();
    }
    step(res);
  };

  // tslint:disable-next-line:no-any
  const tryStep = (step: StepFn<T>, reject: (reason?: any) => void) =>
    (res: T) => {
      try {
        step(res);
      } catch (err) {
        reject(err);
      }
    };

  const lastStep = (step: StepFn<T>, resolve: () => void) =>
    (res: T) => {
      step(res);
      resolve();
    };

  return new Promise((resolve, reject) => {
    let currentStep = 0;

    steps.slice(0, -1).forEach((step) => {
      store.state.pipe(
        skip(currentStep),
        take(1),
        delay(0)
      ).subscribe(tryStep(logStep(step, currentStep), reject));
      currentStep++;
    });

    store.state.pipe(
      skip(currentStep),
      take(1)
    ).subscribe(
      lastStep(tryStep(logStep(steps[steps.length - 1], currentStep), reject), resolve));
  });
}
