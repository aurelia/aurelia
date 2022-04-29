import { skip, take, delay } from "rxjs/operators";

import type { Store } from './store';

export type StepFn<T> = (res: T) => void;

export async function executeSteps<T>(store: Store<T>, shouldLogResults: boolean, ...steps: StepFn<T>[]) {
  const logStep = (step: StepFn<T>, stepIdx: number) => (res: T) => {
    if (shouldLogResults) {
      console.group(`Step ${stepIdx}`);
      console.log(res);
      console.groupEnd();
    }
    step(res);
  };

  const tryStep = (step: StepFn<T>, reject: (reason?: unknown) => void) =>
    (res: T) => {
      try {
        step(res);
      } catch (err) {
        reject(err);
      }
    };

  const lastStep = (step: StepFn<T>, resolve: (value?: unknown) => void) =>
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
