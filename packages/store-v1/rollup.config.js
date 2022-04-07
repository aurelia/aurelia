// @ts-check
import pkg from './package.json';
import { getRollupConfig, rollupTerser } from '../rollup-utils';

export default getRollupConfig(pkg, (config) => {
  const terserConfig = rollupTerser({
    mangle: {
      properties: {
        regex: /^_/,
        reserved: ['__esModule', '_stateSubscriptions', '_state', '__REDUX_DEVTOOLS_EXTENSION__']
      }
    }
  });
  config.external = Object.keys(pkg.dependencies).concat('rxjs/operators');
  if (Array.isArray(config.output)) {
    config.output.forEach(output => {
      if (output.plugins) output.plugins = [terserConfig];
    });
  } else {
    if (config.output.plugins) {
      config.output.plugins = [terserConfig];
    }
  }
  return config;
});
