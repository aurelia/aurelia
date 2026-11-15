import { performance } from 'node:perf_hooks';

let sink = 0;

export function compareVariants(baseSetup, candidateSetup, run, options = {}) {
  const warmups = options.warmups ?? 3;
  const samples = options.samples ?? 11;
  const scale = options.scale ?? 1;
  const base = [];
  const candidate = [];

  for (let i = 0; i < warmups; ++i) {
    measure(baseSetup, run, scale);
    measure(candidateSetup, run, scale);
  }

  for (let i = 0; i < samples; ++i) {
    if ((i & 1) === 0) {
      base.push(measure(baseSetup, run, scale));
      candidate.push(measure(candidateSetup, run, scale));
    } else {
      candidate.push(measure(candidateSetup, run, scale));
      base.push(measure(baseSetup, run, scale));
    }
  }

  const baseMedian = median(base);
  const candidateMedian = median(candidate);
  return {
    base: baseMedian,
    candidate: candidateMedian,
    change: (candidateMedian / baseMedian - 1) * 100,
    baseRange: [Math.min(...base), Math.max(...base)],
    candidateRange: [Math.min(...candidate), Math.max(...candidate)],
  };
}

function measure(setup, run, scale) {
  const state = setup();
  const start = performance.now();
  const value = run(state);
  const duration = performance.now() - start;
  sink ^= Number(value) | 0;
  return duration * scale;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[sorted.length >> 1];
}

export function consumeSink() {
  return sink;
}
