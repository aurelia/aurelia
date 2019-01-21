import { PLATFORM } from '@aurelia/kernel';
import { Interceptor, RetryConfiguration } from './interfaces';
import { HttpClient } from './http-client';

export const retryStrategy: {
  fixed: 0;
  incremental: 1;
  exponential: 2;
  random: 3;
} = {
  fixed: 0,
  incremental: 1,
  exponential: 2,
  random: 3
};

const defaultRetryConfig: RetryConfiguration = {
  maxRetries: 3,
  interval: 1000,
  strategy: retryStrategy.fixed
};

export class RetryInterceptor implements Interceptor {
  retryConfig: RetryConfiguration;

  constructor(retryConfig?: RetryConfiguration) {
    this.retryConfig = Object.assign({}, defaultRetryConfig, retryConfig || {});

    if (this.retryConfig.strategy === retryStrategy.exponential &&
      this.retryConfig.interval <= 1000) {
      throw new Error('An interval less than or equal to 1 second is not allowed when using the exponential retry strategy');
    }
  }

  request(request: Request): Request {
    let $r = request as Request & { retryConfig?: RetryConfiguration };
    if (!$r.retryConfig) {
      $r.retryConfig = Object.assign({}, this.retryConfig);
      $r.retryConfig.counter = 0;
    }

    // do this on every request
    $r.retryConfig.requestClone = request.clone();

    return request;
  }

  response(response: Response, request: Request): Response {
    // retry was successful, so clean up after ourselves
    delete (request as any).retryConfig;
    return response;
  }

  responseError(error: Response, request: Request, httpClient: HttpClient) {
    const { retryConfig } = request as Request & { retryConfig: RetryConfiguration };
    const { requestClone } = retryConfig;
    return Promise.resolve().then(() => {
      if (retryConfig.counter < retryConfig.maxRetries) {
        const result = retryConfig.doRetry ? retryConfig.doRetry(error, request) : true;

        return Promise.resolve(result).then(doRetry => {
          if (doRetry) {
            retryConfig.counter++;
            return new Promise(resolve => PLATFORM.global.setTimeout(resolve, calculateDelay(retryConfig) || 0))
              .then(() => {
                let newRequest = requestClone.clone();
                if (typeof (retryConfig.beforeRetry) === 'function') {
                  return retryConfig.beforeRetry(newRequest, httpClient);
                }
                return newRequest;
              })
              .then(newRequest => {
                return httpClient.fetch(Object.assign(newRequest, { retryConfig }));
              });
          }

          // no more retries, so clean up
          delete (request as any).retryConfig;
          throw error;
        });
      }
      // no more retries, so clean up
      delete (request as any).retryConfig;
      throw error;
    });
  }
}

function calculateDelay(retryConfig: RetryConfiguration) {
  const { interval, strategy, minRandomInterval, maxRandomInterval, counter } = retryConfig;

  if (typeof (strategy) === 'function') {
    return (retryConfig.strategy as Function)(counter);
  }

  switch (strategy) {
    case (retryStrategy.fixed):
      return retryStrategies[retryStrategy.fixed](interval);
    case (retryStrategy.incremental):
      return retryStrategies[retryStrategy.incremental](counter, interval);
    case (retryStrategy.exponential):
      return retryStrategies[retryStrategy.exponential](counter, interval);
    case (retryStrategy.random):
      return retryStrategies[retryStrategy.random](counter, interval, minRandomInterval, maxRandomInterval);
    default:
      throw new Error('Unrecognized retry strategy');
  }
}

const retryStrategies = [
  // fixed
  interval => interval,

  // incremental
  (retryCount, interval) => interval * retryCount,

  // exponential
  (retryCount, interval) => retryCount === 1 ? interval : Math.pow(interval, retryCount) / 1000,

  // random
  (retryCount, interval, minRandomInterval = 0, maxRandomInterval = 60000) => {
    return Math.random() * (maxRandomInterval - minRandomInterval) + minRandomInterval;
  }
] as [
    (interval: number) => number,
    (retryCount: number, interval: number) => number,
    (retryCount: number, interval: number) => number,
    (retryCount: number, interval: number, minRandomInterval?: number, maxRandomInterval?: number) => number
  ];
