import { onResolve } from '@aurelia/kernel';
import { tasksSettled } from '@aurelia/runtime';
import { completeApplicationStart } from './complete-application-start.mjs';

export { tasksSettled };

export function startApplication(au) {
  return completeApplicationStart(au, onResolve, tasksSettled);
}
