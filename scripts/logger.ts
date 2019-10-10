import * as c from 'chalk';
import * as l from 'fancy-log';

const chalk = (c.default || c) as import('chalk').Chalk;
const log = (l.default || l) as typeof import('fancy-log');

export function createLogger(name: string): typeof log {
  const prefix = `> ${chalk.green(name)} `;
  const logger: typeof log = log.bind(log, prefix);
  logger.info = log.info.bind(log, prefix);
  logger.dir = log.dir.bind(log, prefix);
  logger.warn = log.warn.bind(log, prefix);
  logger.error = log.error.bind(log, prefix);
  return logger;
}

export { chalk as c };
