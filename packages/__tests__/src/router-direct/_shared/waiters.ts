import { IContainer, ILogger } from '@aurelia/kernel';
import { IPlatform } from '@aurelia/runtime-html';

export function setTimeoutWaiter(
  container: IContainer,
  ms: number,
  traceLabel: string,
): Promise<void> {
  const platform = container.get(IPlatform);
  const logger = container.get(ILogger).scopeTo(traceLabel);

  logger.trace(`setTimeout(ms:${ms}) - queueing`);

  return new Promise(function (resolve) {
    platform.setTimeout(function () {
      logger.trace(`setTimeout(ms:${ms}) - resolving`);

      resolve();
    }, ms);
  });
}
