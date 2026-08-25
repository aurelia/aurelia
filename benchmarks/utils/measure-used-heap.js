const browserEnvironment = {
  collectGarbage: globalThis.gc,
  yieldTask: () => new Promise(resolve => setTimeout(resolve, 0)),
  readUsedJsHeap: () => performance.memory?.usedJSHeapSize,
};
const asyncMajorGc = { type: 'major', execution: 'async' };

export async function measureUsedJsHeapAfterGc(environment = browserEnvironment) {
  if (typeof environment.collectGarbage !== 'function') {
    throw new Error('After-GC heap benchmarks require Chrome with --js-flags=--expose-gc.');
  }

  // Async major GC runs from a separate V8 task that does not conservatively retain pointers from
  // the current embedder stack. The second pass collects cleanup made unreachable by the first.
  await environment.yieldTask();
  await environment.collectGarbage(asyncMajorGc);
  await environment.yieldTask();
  await environment.collectGarbage(asyncMajorGc);
  await environment.yieldTask();

  const bytes = environment.readUsedJsHeap();
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new Error(`Chrome returned an invalid used JS heap value: ${bytes}.`);
  }
  return bytes;
}
