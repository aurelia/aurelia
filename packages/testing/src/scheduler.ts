import { getRecurringTasks, runTasks } from '@aurelia/runtime';

export function ensureTaskQueuesEmpty(): void {
  try {
    runTasks();
  } catch {
    // ignore
  }
  getRecurringTasks().forEach(t => t.cancel());
}
