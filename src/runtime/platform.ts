const global = (function() {
  // Workers don’t have `window`, only `self`
  if (typeof self !== 'undefined') {
    return self;
  }

  if (typeof global !== 'undefined') {
    return global;
  }

  // Not all environments allow eval and Function
  // Use only as a last resort:
  return new Function('return this')();
})();

export const PLATFORM = {
  global: global,
  emptyArray: <Array<any>>Object.freeze([]),
  emptyObject: Object.freeze({}),
  noop: function() {},

  now(): number {
    return performance.now();
  },

  requestAnimationFrame(callback: (time: number) => void): number {
    return requestAnimationFrame(callback);
  },

  createTaskFlushRequester(onFlush: () => void) {
    return function requestFlush() {
      // We dispatch a timeout with a specified delay of 0 for engines that
      // can reliably accommodate that request. This will usually be snapped
      // to a 4 milisecond delay, but once we're flushing, there's no delay
      // between events.
      const timeoutHandle = setTimeout(handleFlushTimer, 0);
      
      // However, since this timer gets frequently dropped in Firefox
      // workers, we enlist an interval handle that will try to fire
      // an event 20 times per second until it succeeds.
      const intervalHandle = setInterval(handleFlushTimer, 50);
  
      function handleFlushTimer() {
        // Whichever timer succeeds will cancel both timers and request the
        // flush.
        clearTimeout(timeoutHandle);
        clearInterval(intervalHandle);
        onFlush();
      }
    };
  },

  createMicroTaskFlushRequestor(onFlush:  () => void): () => void {
    const observer = new MutationObserver(onFlush);
    const node = document.createTextNode('');
    const values = Object.create(null);
    let val = 'a';
    
    values.a = 'b';
    values.b = 'a';
    observer.observe(node, { characterData: true });

    return function requestFlush() {
      node.data = val = values[val];
    };
  }
};
