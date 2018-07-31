import * as path from 'path';
import { configureKarma, IKarmaConfig } from '../../scripts/karma.conf';

export default (config: IKarmaConfig): void => {
  config.basePath = path.resolve(__dirname);
  configureKarma(config);
};
