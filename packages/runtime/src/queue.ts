// eslint-disable-next-line @typescript-eslint/ban-types
export interface Task extends Function {}

const queue: Task[] = [];
let flushIndex = -1;

const promise = Promise.resolve();
let currPromise: Promise<void> | null = null;

export const nextTick = () => {
  return currPromise ?? promise;
};

export function queueTask(task: Task): void {
  queue.push(task);

  queueFlush();
}

function queueFlush() {
  if (!currPromise) {
    currPromise = promise.then(flush);
  }
}

function flush() {
  console.log('flush');
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const task = queue[flushIndex];
      task();
    }
  } finally {
    flushIndex = -1;
    currPromise = null;
    queue.length = 0;
  }
}
