// // @ts-check
import pkg from './package.json';
import { getRollupConfig } from '../rollup-utils';

export default getRollupConfig(pkg, (config, dev, envVars) => {
  if (envVars.NO_MINIFIED === 'true') {
    (Array.isArray(config.output) ? config.output : [config.output])
      .forEach(output => output.plugins = []);
  }
  return config;
});
