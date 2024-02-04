// @ts-check
import pkg from './package.json' assert { type: 'json' };
import { getRollupConfig } from '../rollup-utils.mjs';

export default getRollupConfig(pkg,
  config => {
    config.external = Object.keys(pkg.dependencies).concat('rxjs/operators');
    return config;
  },
  // () => ({
  //   mangle: {
  //     properties: {
  //       regex: /^_/,
  //       reserved: ['__esModule', '_stateSubscriptions', '_state', '__REDUX_DEVTOOLS_EXTENSION__']
  //     }
  //   }
  // })
);
