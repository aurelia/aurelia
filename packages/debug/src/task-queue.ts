import { IContainer } from '@aurelia/kernel';
import { ITaskQueue } from '@aurelia/runtime';

export function enableImprovedTaskQueueDebugging(container: IContainer) {
  container.registerTransformer(ITaskQueue, taskQueue => {
    const stackSeparator = '\nEnqueued in TaskQueue by:\n';
    const microStackSeparator = '\nEnqueued in MicroTaskQueue by:\n';
    const originalOnError = (<any>taskQueue).onError.bind(taskQueue);

    return Object.assign(taskQueue, {
      longStacks: true,

      prepareTaskStack(): string {
        return this.prepareStack(stackSeparator);
      },
    
      prepareMicroTaskStack(): string {
        return this.prepareStack(microStackSeparator);
      },
    
      prepareStack(separator: string): string {
        let stack = separator + filterQueueStack(captureStack());
    
        if (typeof this.stack === 'string') {
          stack = filterFlushStack(stack) + this.stack;
        }
    
        return stack;
      },
    
      onError(error: any, task: any) {
        if (this.longStacks && task.stack && typeof error === 'object' && error !== null) {
          // Note: IE sets error.stack when throwing but does not override a defined .stack.
          error.stack = filterFlushStack(error.stack) + task.stack;
        }
      
        originalOnError(error, task);
      }
    });
  });
}

function captureStack() {
  let error = new Error();

  // Firefox, Chrome, Edge all have .stack defined by now, IE has not.
  if (error.stack) {
    return error.stack;
  }

  try {
    throw error;
  } catch (e) {
    return e.stack;
  }
}

function filterQueueStack(stack: string) {
  // Remove everything (error message + top stack frames) up to the topmost queueTask or queueMicroTask call
  return stack.replace(/^[\s\S]*?\bqueue(Micro)?Task\b[^\n]*\n/, '');
}

function filterFlushStack(stack: string) {
  // Remove bottom frames starting with the last flushTaskQueue or flushMicroTaskQueue
  let index = stack.lastIndexOf('flushMicroTaskQueue');

  if (index < 0) {
    index = stack.lastIndexOf('flushTaskQueue');
    if (index < 0) {
      return stack;
    }
  }

  index = stack.lastIndexOf('\n', index);

  return index < 0 ? stack : stack.substr(0, index);
  // The following would work but without regex support to match from end of string,
  // it's hard to ensure we have the last occurrence of "flushTaskQueue".
  // return stack.replace(/\n[^\n]*?\bflush(Micro)?TaskQueue\b[\s\S]*$/, "");
}
