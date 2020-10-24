import { TaskQueue } from './task-queue';
import { Task } from './task';
import { IPlatform } from '@aurelia/kernel';

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
      const processing = obj['processingSize'];
      const pending = obj['pendingSize'];
      const delayed = obj['delayedSize'];
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
      const status = obj['_status'];

      const info = `id=${id} created=${created} queue=${queue} preempt=${preempt} persistent=${persistent} reusable=${reusable} status=${status} suspend=${suspend}`;
      this.console.log(`${prefix}[T.${method}] ${info}`);
    }
  }
}
