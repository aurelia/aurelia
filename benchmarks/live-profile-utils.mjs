const profilerFrames = new Set(['(idle)', '(program)', '(root)']);

export function parseProfileMode(value) {
  if (value === undefined || value === '') return undefined;
  if (value !== 'startup' && value !== 'refresh') {
    throw new Error(`Unknown live profile mode "${value}". Expected startup or refresh.`);
  }
  return value;
}

export function parseProfileIterations(value, mode) {
  if (mode === undefined) return undefined;
  if (value === undefined) return mode === 'startup' ? 1 : 50;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error('AURELIA_LIVE_PROFILE_ITERATIONS must be a positive integer.');
  }
  return parsed;
}

export function summarizeCpuProfile(profile, bundleUrlFragment, limit = 50) {
  if (!Array.isArray(profile?.nodes) || !Array.isArray(profile?.samples) || !Array.isArray(profile?.timeDeltas)) {
    throw new Error('Chrome returned an invalid CPU profile.');
  }
  if (profile.samples.length !== profile.timeDeltas.length) {
    throw new Error('Chrome CPU profile samples and time deltas have different lengths.');
  }

  const nodes = new Map(profile.nodes.map(node => [node.id, node]));
  const parents = new Map();
  for (const node of profile.nodes) {
    for (const child of node.children ?? []) parents.set(child, node.id);
  }

  const frames = new Map();
  let sampledMicroseconds = 0;
  for (let index = 0; index < profile.samples.length; ++index) {
    const delta = profile.timeDeltas[index];
    if (!Number.isFinite(delta) || delta < 0) continue;
    sampledMicroseconds += delta;

    const sampledNode = nodes.get(profile.samples[index]);
    if (sampledNode === undefined) continue;
    const selfFrame = getFrame(frames, sampledNode.callFrame);
    selfFrame.selfMicroseconds += delta;
    ++selfFrame.samples;

    const inclusiveFrames = new Set();
    let node = sampledNode;
    while (node !== undefined) {
      const frame = getFrame(frames, node.callFrame);
      if (!inclusiveFrames.has(frame.key)) {
        frame.totalMicroseconds += delta;
        inclusiveFrames.add(frame.key);
      }
      node = nodes.get(parents.get(node.id));
    }
  }

  const ranked = [...frames.values()]
    .filter(frame => !profilerFrames.has(frame.functionName))
    .sort((left, right) => right.selfMicroseconds - left.selfMicroseconds)
    .map(frame => ({
      functionName: frame.functionName,
      url: frame.url,
      line: frame.line,
      column: frame.column,
      selfMilliseconds: toMilliseconds(frame.selfMicroseconds),
      totalMilliseconds: toMilliseconds(frame.totalMicroseconds),
      selfPercent: sampledMicroseconds === 0 ? 0 : round(frame.selfMicroseconds / sampledMicroseconds * 100),
      samples: frame.samples,
    }));

  return {
    sampledMilliseconds: toMilliseconds(sampledMicroseconds),
    sampleCount: profile.samples.length,
    topFunctions: ranked.slice(0, limit),
    topBundleFunctions: ranked.filter(frame => frame.url.includes(bundleUrlFragment)).slice(0, limit),
  };
}

function getFrame(frames, callFrame = {}) {
  const functionName = callFrame.functionName || '(anonymous)';
  const url = callFrame.url || '';
  const line = Number.isInteger(callFrame.lineNumber) ? callFrame.lineNumber + 1 : 0;
  const column = Number.isInteger(callFrame.columnNumber) ? callFrame.columnNumber + 1 : 0;
  const key = `${functionName}\u0000${url}\u0000${line}\u0000${column}`;
  let frame = frames.get(key);
  if (frame === undefined) {
    frame = { key, functionName, url, line, column, selfMicroseconds: 0, totalMicroseconds: 0, samples: 0 };
    frames.set(key, frame);
  }
  return frame;
}

function toMilliseconds(microseconds) {
  return round(microseconds / 1000);
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}
