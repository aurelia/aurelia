import { skip, take, delay } from "rxjs/operators";

import type { Store } from './store';

export type StepFn<T> = (res: T | undefined) => void | Promise<void>;

export async function executeSteps<T>(store: Store<T>, shouldLogResults: boolean, ...steps: StepFn<T>[]) {
  const logStep = (step: StepFn<T>, stepIdx: number) => async (res: T | undefined) => {
    if (shouldLogResults) {
      console.group(`Step ${stepIdx}`);
      console.log(res);
      console.groupEnd();
    }
    await step(res);
  };

  const tryStep = (step: StepFn<T>, reject: (reason?: unknown) => void) =>
    async (res: T | undefined) => {
      try {
        await step(res);
      } catch (err) {
        reject(err);
      }
    };

  const lastStep = (step: StepFn<T>, resolve: (value?: unknown) => void) =>
    async (res: T | undefined) => {
      await step(res);
      resolve();
    };

  return new Promise((resolve, reject) => {
    let currentStep = 0;

    steps.slice(0, -1).forEach((step) => {
      store.state.pipe(
        skip(currentStep),
        take(1),
        delay(0)
      ).subscribe(void tryStep(logStep(step, currentStep), reject));
      currentStep++;
    });

    store.state.pipe(
      skip(currentStep),
      take(1)
    ).subscribe(
      void lastStep(tryStep(logStep(steps[steps.length - 1], currentStep), reject), resolve));
  });
}
