import path from 'node:path';
import { resolveLiveBenchmarkConfig } from './live-benchmark-utils.mjs';

export function createLiveBenchmarkControl(benchmarkRoot, configPath) {
  return {
    config: path.relative(benchmarkRoot, configPath).replace(/\\/gu, '/'),
  };
}

export function parseLiveBenchmarkControl(benchmarkRoot, contents) {
  let control;
  try {
    control = JSON.parse(contents);
  } catch (error) {
    throw new Error(`Live benchmark control must contain valid JSON: ${error.message}`);
  }
  if (control === null || Array.isArray(control) || typeof control !== 'object') {
    throw new Error('Live benchmark control must be a JSON object.');
  }
  if (typeof control.config !== 'string') {
    throw new Error('Live benchmark control must contain a string "config" property.');
  }
  return resolveLiveBenchmarkConfig(benchmarkRoot, control.config);
}
