import {PLATFORM} from './platform';

const queue = [];              // the connect queue
const queued = {};             // tracks whether a binding with a particular id is in the queue
let nextId = 0;                // next available id that can be assigned to a binding for queue tracking purposes
const minimumImmediate = 100;  // number of bindings we should connect immediately before resorting to queueing
const frameBudget = 15;        // milliseconds allotted to each frame for flushing queue

let isFlushRequested = false;  // whether a flush of the connect queue has been requested
let immediate = 0;             // count of bindings that have been immediately connected

function flush(animationFrameStart) {
  const length = queue.length;
  let i = 0;
  while (i < length) {
    const binding = queue[i];
    queued[binding.__connectQueueId] = false;
    binding.connect(true);
    i++;
    // periodically check whether the frame budget has been hit.
    // this ensures we don't call performance.now a lot and prevents starving the connect queue.
    if (i % 100 === 0 && PLATFORM.performance.now() - animationFrameStart > frameBudget) {
      break;
    }
  }
  queue.splice(0, i);

  if (queue.length) {
    PLATFORM.requestAnimationFrame(flush);
  } else {
    isFlushRequested = false;
    immediate = 0;
  }
}

export function enqueueBindingConnect(binding) {
  if (immediate < minimumImmediate) {
    immediate++;
    binding.connect(false);
  } else {
    // get or assign the binding's id that enables tracking whether it's been queued.
    let id = binding.__connectQueueId;
    if (id === undefined) {
      id = nextId;
      nextId++;
      binding.__connectQueueId = id;
    }
    // enqueue the binding.
    if (!queued[id]) {
      queue.push(binding);
      queued[id] = true;
    }
  }
  if (!isFlushRequested) {
    isFlushRequested = true;
    PLATFORM.requestAnimationFrame(flush);
  }
}
