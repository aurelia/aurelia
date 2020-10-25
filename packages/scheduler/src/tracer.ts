import { TaskQueue } from './task-queue';
import { Task, TaskStatus } from './task';
import { IPlatform } from '@aurelia/kernel';

function taskStatus(status: TaskStatus): 'pending' | 'running' | 'canceled' | 'completed' {
  switch (status) {
    case TaskStatus.pending: return 'pending';
    case TaskStatus.running: return 'running';
    case TaskStatus.canceled: return 'canceled';
    case TaskStatus.completed: return 'completed';
  }
}

export class Tracer {
  public enabled: boolean = false;
  private depth: number = 0;
  public constructor(private readonly console: IPlatform['console']) {}

  public enter(obj: TaskQueue | Task, method: string): void {
    this.log(`${'  '.repeat(this.depth++)}> `, obj, method);
  }
  public leave(obj: TaskQueue | Task, method: string): void {
    this.log(`${'  '.repeat(--this.depth)}< `, obj, method);
  }
  public trace(obj: TaskQueue | Task, method: string): void {
    this.log(`${'  '.repeat(this.depth)}- `, obj, method);
  }

  private log(prefix: string, obj: TaskQueue | Task, method: string): void {
    if (obj instanceof TaskQueue) {
      const processing = obj['processing'].length;
      const pending = obj['pending'].length;
      const delayed = obj['delayed'].length;
      const flushReq = obj['flushRequested'];
      const prio = obj['priority'];
      const susTask = !!obj['suspenderTask'];

      const info = `processing=${processing} pending=${pending} delayed=${delayed} flushReq=${flushReq} prio=${prio} susTask=${susTask}`;
      this.console.log(`${prefix}[Q.${method}] ${info}`);
    } else {
      const id = obj['id'];
      const created = Math.round(obj['createdTime'] * 10) / 10;
      const queue = Math.round(obj['queueTime'] * 10) / 10;
      const preempt = obj['preempt'];
      const reusable = obj['reusable'];
      const persistent = obj['persistent'];
      const suspend = obj['suspend'];
      const status = taskStatus(obj['_status']);

      const info = `id=${id} created=${created} queue=${queue} preempt=${preempt} persistent=${persistent} reusable=${reusable} status=${status} suspend=${suspend}`;
      this.console.log(`${prefix}[T.${method}] ${info}`);
    }
  }
}
