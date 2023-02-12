import chalk from 'chalk';
import log from 'fancy-log';

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
