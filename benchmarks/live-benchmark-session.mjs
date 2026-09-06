// One browser workload owns the active files at a time. New builds replace only
// the pending snapshot; a fixture edit also retires the comparison baseline.
export function createLiveBenchmarkSession(run, onError) {
  let baseline;
  let pending;
  let active;
  let lastKey;
  let stopped = false;
  let settled = Promise.resolve();

  async function drain() {
    while (pending !== undefined && !stopped) {
      const candidate = pending;
      pending = undefined;
      baseline ??= candidate;
      const controller = active = new AbortController();
      try {
        await run({ base: baseline, candidate }, controller.signal);
      } catch (error) {
        if (!controller.signal.aborted) onError(error);
        // Failed startup cannot establish a useful baseline. A later successful
        // build can retry even if its executable bytes happen to be unchanged.
        if (baseline === candidate) baseline = undefined;
        if (lastKey === candidate.key) lastKey = undefined;
      } finally {
        active = undefined;
      }
    }
  }

  function invalidate() {
    baseline = pending = lastKey = undefined;
    active?.abort();
  }

  return {
    submit(snapshot) {
      if (stopped || snapshot.key === lastKey) return settled;
      lastKey = snapshot.key;
      pending = snapshot;
      if (active === undefined) settled = drain();
      return settled;
    },
    invalidate,
    stop() {
      stopped = true;
      invalidate();
      return settled;
    },
  };
}
