import { onResolve } from '@aurelia/kernel';
import { tasksSettled } from '@aurelia/runtime';

export { tasksSettled };

export function startApplication(au) {
  // Begin observing queued work in the lifecycle completion callback. This keeps synchronous and
  // asynchronous starts on the same observable boundary without leaving a turn between them.
  return onResolve(au.start(), () => onResolve(tasksSettled(), () => au));
}
