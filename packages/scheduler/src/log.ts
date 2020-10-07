import { TaskQueue } from './task-queue';
import { Task } from './task';

// TODO(fkleuver): get rid of this whole file and do logging/tracing via a framework api
declare const console: {
  log(msg: string): void;
};

export const {
  enter,
  leave,
  trace,
} = (function () {
  const enabled = false;
  let depth = 0;

  function round(num: number) {
    return ((num * 10 + .5) | 0) / 10;
  }

  function log(prefix: string, obj: TaskQueue | Task, method: string) {
    if (obj instanceof TaskQueue) {
      const processing = obj['processingSize'];
      const pending = obj['pendingSize'];
      const delayed = obj['delayedSize'];
      const flushReq = obj['flushRequested'];
      const prio = obj['priority'];
      const procAsync = !!obj['processingAsync'];

      const info = `processing=${processing} pending=${pending} delayed=${delayed} flushReq=${flushReq} prio=${prio} procAsync=${procAsync}`;
      console.log(`${prefix}[Q.${method}] ${info}`);
    } else {
      const id = obj['id'];
      const created = round(obj['createdTime']);
      const queue = round(obj['queueTime']);
      const preempt = obj['preempt'];
      const reusable = obj['reusable'];
      const persistent = obj['persistent'];
      const async = obj['async'];
      const status = obj['_status'];

      const info = `id=${id} created=${created} queue=${queue} preempt=${preempt} persistent=${persistent} reusable=${reusable} status=${status} async=${async}`;
      console.log(`${prefix}[T.${method}] ${info}`);
    }
  }

  function $enter(obj: TaskQueue | Task, method: string) {
    if (enabled) {
      log(`${'  '.repeat(depth++)}> `, obj, method);
    }
  }

  function $leave(obj: TaskQueue | Task, method: string) {
    if (enabled) {
      log(`${'  '.repeat(--depth)}< `, obj, method);
    }
  }

  function $trace(obj: TaskQueue | Task, method: string) {
    if (enabled) {
      log(`${'  '.repeat(depth)}- `, obj, method);
    }
  }

  return {
    enter: $enter,
    leave: $leave,
    trace: $trace,
  };
})();
