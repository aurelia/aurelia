import { Reporter } from './reporter';
import { TaskQueue } from './task-queue';
import { IContainer } from '../runtime/di';

export function register(container: IContainer) {
  Reporter.write(2);
  TaskQueue.longStacks = true;
}
