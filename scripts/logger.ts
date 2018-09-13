import * as l from 'fancy-log';
const log = <typeof import('fancy-log')>(<any>(<any>l).default || l);
import * as c from 'chalk';
const chalk = <import('chalk').Chalk>(c.default || c);

export function createLogger(name: string): typeof log {
  const prefix = `> ${chalk.green(name)} `;
  const logger = <typeof log>log.bind(log, prefix);
  logger.info = log.info.bind(log, prefix);
  logger.dir = log.dir.bind(log, prefix);
  logger.warn = log.warn.bind(log, prefix);
  logger.error = log.error.bind(log, prefix);
  return logger;
}

export { chalk as c };
