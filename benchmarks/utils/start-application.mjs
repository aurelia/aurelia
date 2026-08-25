export function startSynchronousApplication(au) {
  if (typeof au.start()?.then === 'function') {
    throw new Error('Benchmark application startup must remain synchronous.');
  }
  return au;
}
