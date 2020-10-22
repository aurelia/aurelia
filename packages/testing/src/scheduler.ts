import { Scheduler, TaskQueue, IScheduler } from '@aurelia/scheduler';

export function ensureSchedulerEmpty(scheduler?: IScheduler): void {
  if (!scheduler) {
    scheduler = Scheduler.get(globalThis) as IScheduler;
  }
  const $scheduler = scheduler as Scheduler;

  // canceling pending heading to remove the sticky tasks

  const microQueue = $scheduler['microtask'] as TaskQueue;
  microQueue.flush();
  microQueue['pendingHead']?.cancel();

  const renderQueue = $scheduler['render'] as TaskQueue;
  renderQueue.flush();
  renderQueue['pendingHead']?.cancel();

  const macroQueue = $scheduler['macroTask'] as TaskQueue;
  macroQueue.flush();
  macroQueue['pendingHead']?.cancel();

  const postRenderQueue = $scheduler['postRender'] as TaskQueue;
  postRenderQueue.flush();
  postRenderQueue['pendingHead']?.cancel();
}
