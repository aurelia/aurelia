import { Scheduler, TaskQueue, IScheduler, ITask } from '@aurelia/scheduler';

export function ensureSchedulerEmpty(scheduler?: IScheduler): void {
  if (!scheduler) {
    scheduler = Scheduler.get(globalThis) as IScheduler;
  }
  const $scheduler = scheduler as Scheduler;

  // canceling pending heading to remove the sticky tasks

  const renderQueue = $scheduler['render'] as TaskQueue;
  renderQueue.flush();
  renderQueue['pending'].forEach((x: ITask) => x.cancel());

  const macroQueue = $scheduler['macroTask'] as TaskQueue;
  macroQueue.flush();
  renderQueue['pending'].forEach((x: ITask) => x.cancel());

  const postRenderQueue = $scheduler['postRender'] as TaskQueue;
  postRenderQueue.flush();
  renderQueue['pending'].forEach((x: ITask) => x.cancel());
}
