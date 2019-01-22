import { PLATFORM } from '@aurelia/kernel';
import { HttpClient } from '../../src/http-client';
import { HttpClientConfiguration } from '../../src/http-client-configuration';
import { Interceptor } from '../../src/interfaces';
import { retryStrategy } from '../../src/retry-interceptor';
import { json } from '../../src/util';

describe('HttpClient', () => {
  let originalFetch = window.fetch;
  let client;
  let fetch: jasmine.Spy;

  function setUpTests() {
    beforeEach(() => {
      client = new HttpClient();
      fetch = window.fetch = jasmine.createSpy('fetch');
    });

    afterEach(() => {
      fetch = window.fetch = originalFetch as any;
    });
  }

  setUpTests();

  it('errors on missing fetch implementation', () => {
    window.fetch = undefined;
    expect(() => new HttpClient()).toThrow();
  });

  describe('configure', () => {
    it('accepts plain objects', () => {
      let defaults = {};
      client.configure(defaults);

      expect(client.isConfigured).toBe(true);
      expect(client.defaults).toBe(defaults);
    });

    it('accepts configuration callbacks', () => {
      let defaults = { foo: true };
      let baseUrl = '/test';
      let interceptor = {};

      client.configure(config => {
        expect(config).toEqual(jasmine.any(HttpClientConfiguration));

        return config
          .withDefaults(defaults)
          .withBaseUrl(baseUrl)
          .withInterceptor(interceptor);
      });

      expect(client.isConfigured).toBe(true);
      expect(client.defaults.foo).toBe(true);
      expect(client.baseUrl).toBe(baseUrl);
      expect(client.interceptors.indexOf(interceptor)).toBe(0);
    });

    it('accepts configuration override', () => {
      let defaults = { foo: true };

      client.configure(config => config.withDefaults(defaults));


      client.configure(config => {
        expect(config.defaults.foo).toBe(true);
      });
    });

    it('rejects invalid configs', () => {
      expect(() => client.configure(1)).toThrow();
    });

    it('applies standard configuration', () => {
      client.configure(config => config.useStandardConfiguration());

      expect(client.defaults.credentials).toBe('same-origin');
      expect(client.interceptors.length).toBe(1);
    });

    it('rejects error responses', () => {
      client.configure(config => config.rejectErrorResponses());

      expect(client.interceptors.length).toBe(1);
    });
  });

  describe('fetch', () => {
    it('makes requests with string inputs', (done) => {
      fetch.and.returnValue(emptyResponse(200));

      client
        .fetch('http://example.com/some/cool/path')
        .then(result => {
          expect(result.ok).toBe(true);
        })
        .catch(result => {
          expect(result).not.toBe(result);
        })
        .then(() => {
          expect(fetch).toHaveBeenCalled();
          done();
        });
    });

    it('makes proper requests with json() inputs', (done) => {
      fetch.and.returnValue(emptyResponse(200));

      client
        .fetch('http://example.com/some/cool/path', {
          method: 'post',
          body: json({ test: 'object' })
        })
        .then(result => {
          expect(result.ok).toBe(true);
        })
        .catch(result => {
          expect(result).not.toBe(result);
        })
        .then(() => {
          expect(fetch).toHaveBeenCalled();
          let [request] = fetch.calls.first().args;
          expect(request.headers.has('content-type')).toBe(true);
          expect(request.headers.get('content-type')).toMatch(/application\/json/);
          done();
        });
    });

    it('makes proper requests with JSON.stringify inputs', (done) => {
      fetch.and.returnValue(emptyResponse(200));

      client
        .fetch('http://example.com/some/cool/path', {
          method: 'post',
          body: JSON.stringify({ test: 'object' })
        })
        .then(result => {
          expect(result.ok).toBe(true);
        })
        .catch(result => {
          expect(result).not.toBe(result);
        })
        .then(() => {
          expect(fetch).toHaveBeenCalled();
          let [request] = fetch.calls.first().args;
          expect(request.headers.has('content-type')).toBe(true);
          expect(request.headers.get('content-type')).toMatch(/application\/json/);
          done();
        });
    });

    it('makes requests with null RequestInit', (done) => {
      fetch.and.returnValue(emptyResponse(200));

      client
        .fetch('http://example.com/some/cool/path', null)
        .then(result => {
          expect(result.ok).toBe(true);
        })
        .catch(result => {
          expect(result).not.toBe(result);
        })
        .then(() => {
          expect(fetch).toHaveBeenCalled();
          done();
        });
    });

    it('makes requests with Request inputs', (done) => {
      fetch.and.returnValue(emptyResponse(200));

      client
        .fetch(new Request('http://example.com/some/cool/path'))
        .then(result => {
          expect(result.ok).toBe(true);
        })
        .catch(result => {
          expect(result).not.toBe(result);
        })
        .then(() => {
          expect(fetch).toHaveBeenCalled();
          done();
        });
    });

    it('makes requests with Request inputs when configured', (done) => {
      fetch.and.returnValue(emptyResponse(200));

      client.configure(config => config.withBaseUrl('http://example.com/'));

      client
        .fetch(new Request('some/cool/path'))
        .then(result => {
          expect(result.ok).toBe(true);
        })
        .catch(result => {
          expect(result).not.toBe(result);
        })
        .then(() => {
          expect(fetch).toHaveBeenCalled();
          done();
        });
    });

    it('makes request and aborts with an AbortController signal', (done) => {
      fetch = window.fetch = originalFetch as any;

      const controller = new AbortController();

      client
        .fetch('http://jsonplaceholder.typicode.com/users', { signal: controller.signal })
        .then(result => {
          expect(result).not.toBe(result);
        })
        .catch(result => {
          expect(result instanceof Error).toBe(true);
          expect(result.name).toBe('AbortError');
        })
        .then(() => {
          done();
        });

      controller.abort();
    });
  });

  describe('get', () => {
    it('passes-through to fetch', (done) => {
      fetch.and.returnValue(emptyResponse(200));

      client
        .get('http://example.com/some/cool/path')
        .then(result => {
          expect(result.ok).toBe(true);
        })
        .catch(result => {
          expect(result).not.toBe(result);
        })
        .then(() => {
          expect(fetch).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('post', () => {
    it('sets method to POST and body of request and calls fetch', (done) => {
      fetch.and.returnValue(emptyResponse(200));

      client
        .post('http://example.com/some/cool/path', JSON.stringify({ test: 'object' }))
        .then(result => {
          expect(result.ok).toBe(true);
        })
        .catch(result => {
          expect(result).not.toBe(result);
        })
        .then(() => {
          expect(fetch).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('put', () => {
    it('sets method to PUT and body of request and calls fetch', (done) => {
      fetch.and.returnValue(emptyResponse(200));

      client
        .put('http://example.com/some/cool/path', JSON.stringify({ test: 'object' }))
        .then(result => {
          expect(result.ok).toBe(true);
        })
        .catch(result => {
          expect(result).not.toBe(result);
        })
        .then(() => {
          expect(fetch).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('patch', () => {
    it('sets method to PATCH and body of request and calls fetch', (done) => {
      fetch.and.returnValue(emptyResponse(200));

      client
        .patch('http://example.com/some/cool/path', JSON.stringify({ test: 'object' }))
        .then(result => {
          expect(result.ok).toBe(true);
        })
        .catch(result => {
          expect(result).not.toBe(result);
        })
        .then(() => {
          expect(fetch).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('delete', () => {
    it('sets method to DELETE and body of request and calls fetch', (done) => {
      fetch.and.returnValue(emptyResponse(200));

      client
        .delete('http://example.com/some/cool/path', JSON.stringify({ test: 'object' }))
        .then(result => {
          expect(result.ok).toBe(true);
        })
        .catch(result => {
          expect(result).not.toBe(result);
        })
        .then(() => {
          expect(fetch).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('interceptors', () => {
    setUpTests();

    it('run on request', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      let interceptor = { request(r) { return r; }, requestError(r) { throw r; } };
      spyOn(interceptor, 'request').and.callThrough();
      spyOn(interceptor, 'requestError').and.callThrough();

      client.interceptors.push(interceptor);

      client.fetch('path')
        .then(() => {
          expect(interceptor.request).toHaveBeenCalledWith(jasmine.any(Request), client);
          expect(interceptor.requestError).not.toHaveBeenCalled();
          done();
        });
    });

    it('run on request error', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      let interceptor = { request(r) { return r; }, requestError(r) { throw r; } };
      spyOn(interceptor, 'request').and.callThrough();
      spyOn(interceptor, 'requestError').and.callThrough();

      client.interceptors.push({ request() { return Promise.reject(new Error('test')); } });
      client.interceptors.push(interceptor);

      client.fetch()
        .catch(() => {
          expect(interceptor.request).not.toHaveBeenCalled();
          expect(interceptor.requestError).toHaveBeenCalledWith(jasmine.any(Error), client);
          done();
        });
    });

    it('run on response', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      let interceptor = { response(r) { return r; }, responseError(r) { throw r; } };
      spyOn(interceptor, 'response').and.callThrough();
      spyOn(interceptor, 'responseError').and.callThrough();

      client.interceptors.push(interceptor);

      client.fetch('path')
        .then(() => {
          expect(interceptor.response).toHaveBeenCalledWith(jasmine.any(Response), jasmine.any(Request), client);
          expect(interceptor.responseError).not.toHaveBeenCalled();
          done();
        });
    });

    it('run on response error', (done) => {
      fetch.and.returnValue(Promise.reject(new Response(null, { status: 500 })));
      let interceptor = { response(r) { return r; }, responseError(r) { throw r; } };
      spyOn(interceptor, 'response').and.callThrough();
      spyOn(interceptor, 'responseError').and.callThrough();

      client.interceptors.push(interceptor);

      client.fetch('path')
        .catch(() => {
          expect(interceptor.response).not.toHaveBeenCalled();
          expect(interceptor.responseError).toHaveBeenCalledWith(jasmine.any(Response), jasmine.any(Request), client);
          done();
        });
    });

    it('forward requests', (done) => {
      const path = 'retry';
      let retry = 3;
      fetch.and.returnValue(Promise.reject(new Response(null, { status: 500 })));
      let interceptor: Interceptor = {
        response(r) { return r; },
        responseError(r) {
          if (retry--) {
            let request = client.buildRequest(path);
            return request;
          } else {
            throw r;
          }
        }
      };
      spyOn(interceptor, 'response').and.callThrough();
      spyOn(interceptor, 'responseError').and.callThrough();

      client.interceptors.push(interceptor);

      client.fetch(path)
        .catch(() => {
          expect(interceptor.response).not.toHaveBeenCalled();
          expect(interceptor.responseError).toHaveBeenCalledWith(jasmine.any(Response), jasmine.any(Request), client);
          expect(fetch).toHaveBeenCalledTimes(4);
          done();
        });
    });

    it('normalizes input for interceptors', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      let request;
      client.interceptors.push({ request(r) { request = r; return r; } });

      client
        .fetch('http://example.com/some/cool/path')
        .then(() => {
          expect(request instanceof Request).toBe(true);
          done();
        });
    });

    it('runs multiple interceptors', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      let first = { request(r) { return r; } };
      let second = { request(r) { return r; } };
      spyOn(first, 'request').and.callThrough();
      spyOn(second, 'request').and.callThrough();

      client.interceptors.push(first);
      client.interceptors.push(second);

      client.fetch('path')
        .then(() => {
          expect(first.request).toHaveBeenCalledWith(jasmine.any(Request), client);
          expect(second.request).toHaveBeenCalledWith(jasmine.any(Request), client);
          done();
        });
    });

    it('request interceptors can modify request', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      let interceptor = { request() { return new Request('http://aurelia.io/'); } };

      client.interceptors.push(interceptor);

      client.fetch('first')
        .then(() => {
          expect(fetch.calls.mostRecent().args[0].url).toBe('http://aurelia.io/');
          done();
        });
    });

    it('request interceptors can short circuit request', (done) => {
      let response = new Response();
      let interceptor = { request() { return response; } };

      client.interceptors.push(interceptor);

      client.fetch('path')
        .then((r) => {
          expect(r).toBe(response);
          expect(fetch).not.toHaveBeenCalled();
          done();
        });
    });

    it('doesn\'t reject unsuccessful responses', (done) => {
      let response = new Response(null, { status: 500 });
      fetch.and.returnValue(Promise.resolve(response));

      client.fetch('path')
        .catch((r) => {
          expect(r).not.toBe(response);
        })
        .then((r) => {
          expect(r.ok).toBe(false);
          done();
        });
    });

    describe('rejectErrorResponses', () => {
      it('can reject error responses', (done) => {
        let response = new Response(null, { status: 500 });
        fetch.and.returnValue(Promise.resolve(response));

        client.configure(config => config.rejectErrorResponses());
        client.fetch('path')
          .then((r) => {
            expect(r).not.toBe(r);
          })
          .catch((r) => {
            expect(r).toBe(response);
            done();
          });
      });

      it('resolves successful requests', (done) => {
        fetch.and.returnValue(emptyResponse(200));

        client.configure(config => config.rejectErrorResponses());
        client.fetch('path')
          .catch((r) => {
            expect(r).not.toBe(r);
          })
          .then((r) => {
            expect(r.ok).toBe(true);
            done();
          });
      });
    });
  });

  describe('default request parameters', () => {
    setUpTests();

    it('applies baseUrl to requests', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      client.baseUrl = 'http://aurelia.io/';

      client.fetch('path')
        .then(() => {
          let [request] = fetch.calls.first().args;
          expect(request.url).toBe('http://aurelia.io/path');
          done();
        });
    });

    it('doesn\'t apply baseUrl to absolute URLs', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      client.baseUrl = 'http://aurelia.io/';

      client.fetch('https://example.com/test')
        .then(() => {
          let [request] = fetch.calls.first().args;
          expect(request.url).toBe('https://example.com/test');
          done();
        });
    });

    it('applies default headers to requests with no headers', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      client.defaults = { headers: { 'x-foo': 'bar' } };

      client.fetch('path')
        .then(() => {
          let [request] = fetch.calls.first().args;
          expect(request.headers.has('x-foo')).toBe(true);
          expect(request.headers.get('x-foo')).toBe('bar');
          done();
        });
    });

    it('applies default headers to requests with other headers', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      client.defaults = { headers: { 'x-foo': 'bar' } };

      client.fetch('path', { headers: { 'x-baz': 'bat' } })
        .then(() => {
          let [request] = fetch.calls.first().args;
          expect(request.headers.has('x-foo')).toBe(true);
          expect(request.headers.has('x-baz')).toBe(true);
          expect(request.headers.get('x-foo')).toBe('bar');
          expect(request.headers.get('x-baz')).toBe('bat');
          done();
        });
    });

    it('applies default headers to requests using Headers instance', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      client.defaults = { headers: { 'x-foo': 'bar' } };

      client.fetch('path', { headers: new Headers({ 'x-baz': 'bat' }) })
        .then(() => {
          let [request] = fetch.calls.first().args;
          expect(request.headers.has('x-foo')).toBe(true);
          expect(request.headers.has('x-baz')).toBe(true);
          expect(request.headers.get('x-foo')).toBe('bar');
          expect(request.headers.get('x-baz')).toBe('bat');
          done();
        });
    });

    it('does not overwrite request headers with default headers', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      client.defaults = { headers: { 'x-foo': 'bar' } };

      client.fetch('path', { headers: { 'x-foo': 'baz' } })
        .then(() => {
          let [request] = fetch.calls.first().args;
          expect(request.headers.has('x-foo')).toBe(true);
          expect(request.headers.get('x-foo')).toBe('baz');
          done();
        });
    });

    it('evaluates default header function values with no headers', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      client.defaults = { headers: { 'x-foo': () => 'bar' } };

      client.fetch('path')
        .then(() => {
          let [request] = fetch.calls.first().args;
          expect(request.headers.has('x-foo')).toBe(true);
          expect(request.headers.get('x-foo')).toBe('bar');
          done();
        });
    });

    it('evaluates default header function values with other headers', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      client.defaults = { headers: { 'x-foo': () => 'bar' } };

      client.fetch('path', { headers: { 'x-baz': 'bat' } })
        .then(() => {
          let [request] = fetch.calls.first().args;
          expect(request.headers.has('x-foo')).toBe(true);
          expect(request.headers.has('x-baz')).toBe(true);
          expect(request.headers.get('x-foo')).toBe('bar');
          expect(request.headers.get('x-baz')).toBe('bat');
          done();
        });
    });

    it('evaluates default header function values on each request', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      let value = 0;
      client.defaults = {
        headers: {
          'x-foo': () => {
            value++;
            return value;
          }
        }
      };

      let promises = [];
      promises.push(client.fetch('path1'));
      promises.push(client.fetch('path2'));

      Promise.all(promises)
        .then(() => {
          let [request1] = fetch.calls.first().args;
          let [request2] = fetch.calls.mostRecent().args;
          expect(request1.headers.has('x-foo')).toBe(true);
          expect(request1.headers.get('x-foo')).toBe('1');
          expect(request2.headers.has('x-foo')).toBe(true);
          expect(request2.headers.get('x-foo')).toBe('2');
          done();
        });
    });

    it('uses default content-type header', (done) => {
      fetch.and.returnValue(emptyResponse(200));
      let contentType = 'application/octet-stream';
      client.defaults = { method: 'post', body: '{}', headers: { 'content-type': contentType } };

      client.fetch('path')
        .then(() => {
          let [request] = fetch.calls.first().args;
          expect(request.headers.has('content-type')).toBe(true);
          expect(request.headers.get('content-type')).toBe(contentType);
          done();
        });
    });
  });

  describe('retry', () => {
    const originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    beforeEach(() => {
      client = new HttpClient();
      // fetch = window.fetch = jasmine.createSpy('fetch');
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    afterEach(() => {
      // fetch = window.fetch = originalFetch as any;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('fails if multiple RetryInterceptors are defined', () => {
      const configure = () => {
        client.configure(config => config.withRetry().withRetry());
      };

      expect(configure).toThrowError('Only one RetryInterceptor is allowed.');
    });

    it('fails if RetryInterceptor is not last interceptor defined', () => {
      const configure = () => {
        client.configure(config => config.withRetry().rejectErrorResponses());
      };

      expect(configure).toThrowError('The retry interceptor must be the last interceptor defined.');
    });

    it('retries the specified number of times', (done) => {
      let response = new Response(null, { status: 500 });
      fetch.and.returnValue(Promise.resolve(response));

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 3,
        interval: 10
      }));
      client.fetch('path')
        .then((r) => {
          done.fail('fetch did not error');
        })
        .catch((r) => {
          // 1 original call plus 3 retries
          expect(fetch).toHaveBeenCalledTimes(4);
          done();
        });
    });

    it('continues with retry when doRetry returns true', (done) => {
      let response = new Response(null, { status: 500 });
      fetch.and.returnValue(Promise.resolve(response));

      let doRetryCallback = jasmine.createSpy('doRetry').and.returnValue(true);

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 2,
        interval: 10,
        doRetry: doRetryCallback
      }));
      client.fetch('path')
        .then((r) => {
          done.fail('fetch did not error');
        })
        .catch((r) => {
          // 1 original call plus 2 retries
          expect(fetch).toHaveBeenCalledTimes(3);
          // only called on retries
          expect(doRetryCallback).toHaveBeenCalledTimes(2);
          done();
        });
    });

    it('does not retry when doRetry returns false', (done) => {
      let response = new Response(null, { status: 500 });
      fetch.and.returnValue(Promise.resolve(response));

      let doRetryCallback = jasmine.createSpy('doRetry').and.returnValue(false);

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 2,
        interval: 10,
        doRetry: doRetryCallback
      }));
      client.fetch('path')
        .then((r) => {
          done.fail('fetch did not error');
        })
        .catch((r) => {
          // 1 original call plus 0 retries
          expect(fetch).toHaveBeenCalledTimes(1);
          // only called on retries
          expect(doRetryCallback).toHaveBeenCalledTimes(1);
          done();
        });
    });

    it('calls beforeRetry callback when specified', (done) => {
      let response = new Response(null, { status: 500 });
      fetch.and.returnValue(Promise.resolve(response));

      let beforeRetryCallback = jasmine.createSpy('beforeRetry').and.returnValue(new Request('path'));

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 2,
        interval: 10,
        beforeRetry: beforeRetryCallback
      }));
      return client
        .fetch('path')
        .then(
          () => done.fail('fetch did not error'),
          () => {
            // 1 original call plus 2 retries
            expect(fetch).toHaveBeenCalledTimes(3);
            // only called on retries
            expect(beforeRetryCallback).toHaveBeenCalledTimes(2);
            done();
          });
    });

    it('calls custom retry strategy callback when specified', (done) => {
      let response = new Response(null, { status: 500 });
      fetch.and.returnValue(Promise.resolve(response));

      let strategyRetryCallback = jasmine.createSpy('strategy').and.returnValue(10);

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 2,
        strategy: strategyRetryCallback
      }));
      return client.fetch('path')
        .then(
          () => done.fail('fetch did not error'),
          () => {
            // 1 original call plus 2 retries
            expect(fetch).toHaveBeenCalledTimes(3);
            // only called on retries
            expect(strategyRetryCallback).toHaveBeenCalledTimes(2);
            done();
          });
    });

    it('waits correct number amount of time with fixed retry strategy', (done) => {
      let response = new Response(null, { status: 500 });
      fetch.and.returnValue(Promise.resolve(response));

      spyOn(PLATFORM.global, 'setTimeout').and.callThrough();

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 2,
        interval: 250,
        strategy: retryStrategy.fixed
      }));
      return client.fetch('path')
        .then(
          () => done.fail('fetch did not error'),
          () => {
            // setTimeout is called when request starts and end, so those args need to filtered out
            const callArgs = (PLATFORM.global.setTimeout as jasmine.Spy).calls.allArgs().filter(args => args[1] > 1);
            // only called on retries
            expect(callArgs[0]).toEqual([jasmine.any(Function), 250]);
            expect(callArgs[1]).toEqual([jasmine.any(Function), 250]);
            done();
          });
    });

    it('waits correct number amount of time with incremental retry strategy', (done) => {
      let response = new Response(null, { status: 500 });
      fetch.and.returnValue(Promise.resolve(response));

      spyOn(PLATFORM.global, 'setTimeout').and.callThrough();

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 2,
        interval: 250,
        strategy: retryStrategy.incremental
      }));
      return client
        .fetch('path')
        .then(
          () => done.fail('fetch did not error'),
          () => {
            // setTimeout is called when request starts and end, so those args need to filtered out
            const callArgs = (PLATFORM.global.setTimeout as jasmine.Spy).calls.allArgs().filter(args => args[1] > 1);
            // only called on retries
            expect(callArgs.length).toBe(2);
            expect(callArgs[0]).toEqual([jasmine.any(Function), 250]);
            expect(callArgs[1]).toEqual([jasmine.any(Function), 500]);
            done();
          });
    });

    it('waits correct number amount of time with exponential retry strategy', (done) => {
      let response = new Response(null, { status: 500 });
      fetch.and.returnValue(Promise.resolve(response));

      spyOn(PLATFORM.global, 'setTimeout').and.callThrough();

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 2,
        interval: 2000,
        strategy: retryStrategy.exponential
      }));
      return client
        .fetch('path')
        .then(
          () => done.fail('fetch did not error'),
          () => {
            // setTimeout is called when request starts and end, so those args need to filtered out
            const callArgs = (PLATFORM.global.setTimeout as jasmine.Spy).calls.allArgs().filter(args => args[1] > 1);
            // only called on retries
            expect(callArgs.length).toBe(2);
            expect(callArgs[0]).toEqual([jasmine.any(Function), 2000]);
            expect(callArgs[1]).toEqual([jasmine.any(Function), 4000]);
            done();
          });
    });

    it('waits correct number amount of time with random retry strategy', (done) => {
      let response = new Response(null, { status: 500 });
      const firstRandom = 0.1;
      const secondRandom = 0.4;

      fetch.and.returnValue(Promise.resolve(response));

      spyOn(PLATFORM.global, 'setTimeout').and.callThrough();
      spyOn(Math, 'random').and.returnValues(firstRandom, secondRandom);

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 2,
        interval: 2000,
        strategy: retryStrategy.random,
        minRandomInterval: 1000,
        maxRandomInterval: 3000
      }));

      const firstInterval = firstRandom * (3000 - 1000) + 1000;
      const secondInterval = secondRandom * (3000 - 1000) + 1000;

      return client
        .fetch('path')
        .then(
          () => done.fail('fetch did not error'),
          () => {
            // setTimeout is called when request starts and end, so those args need to filtered out
            const callArgs = (PLATFORM.global.setTimeout as jasmine.Spy).calls.allArgs().filter(args => args[1] > 1);
            // only called on retries
            expect(callArgs[0]).toEqual([jasmine.any(Function), firstInterval]);
            expect(callArgs[1]).toEqual([jasmine.any(Function), secondInterval]);
            done();
          }
        );
    });

    it('successfully returns without error if a retry succeeds', (done) => {
      let firstResponse = new Response(null, { status: 500 });
      let secondResponse = new Response(null, { status: 200 });

      fetch.and.returnValues(Promise.resolve(firstResponse), Promise.resolve(secondResponse));

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 3,
        interval: 1,
        strategy: retryStrategy.fixed
      }));

      return client.fetch('path')
        .then(
          (r) => {
            // 1 original call plus 1 retry
            expect(fetch).toHaveBeenCalledTimes(2);
            expect(r).toEqual(secondResponse);
            done();
          },
          () => done.fail('retry was unsuccessful'));
    });
  });

  describe('isRequesting', () => {
    it('is set to true when starting a request', (done) => {
      fetch.and.returnValue(emptyResponse(200));

      expect(client.isRequesting).withContext('Before start').toBe(false);
      let request = client.fetch('http://example.com/some/cool/path');
      expect(client.isRequesting).withContext('When started').toBe(true);
      request.then(() => {
        expect(fetch).toHaveBeenCalled();
        done();
      });
    });
    it('is set to false when request is finished', (done) => {
      fetch.and.returnValue(emptyResponse(200));

      expect(client.isRequesting).withContext('Before start').toBe(false);
      let request = client.fetch('http://example.com/some/cool/path');
      expect(client.isRequesting).withContext('When started').toBe(true);
      request.then(() => {
        expect(client.isRequesting).withContext('When finished').toBe(false);
      }).then(() => {
        expect(fetch).toHaveBeenCalled();
        done();
      });
    });
    it('is still true when a request is still in progress', (done) => {
      let firstResponse = emptyResponse(200)
      let secondResponse = new Promise((resolve) => {
        setTimeout(() => {
          resolve(emptyResponse(200));
        }, 200)
      });

      fetch.and.returnValues(firstResponse, secondResponse);
      expect(client.isRequesting).withContext('Before start').toBe(false);

      let request1 = client.fetch('http://example.com/some/cool/path');
      let request2 = client.fetch('http://example.com/some/cool/path');
      expect(client.isRequesting).withContext('When started').toBe(true);
      request1.then(() => {
        expect(client.isRequesting).withContext('When request 1 is completed').toBe(true);
      });
      setTimeout(() => {
        expect(client.isRequesting).withContext('After 100ms').toBe(true);
      }, 100);
      request2.then(() => {
        expect(client.isRequesting).withContext('When all requests are finished').toBe(false);
      }).then(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
        done();
      });
    });
    it('is set to false when request is rejected', (done) => {
      fetch.and.returnValue(Promise.reject(new Error('Failed to fetch')));

      expect(client.isRequesting).withContext('Before start').toBe(false);
      client.fetch('http://example.com/some/cool/path').then(result => {
        expect(result).not.toBe(result);
      }).catch((result) => {
        expect(result instanceof Error).toBe(true);
        expect(result.message).toBe('Failed to fetch');
        expect(client.isRequesting).withContext('When finished').toBe(false);
        return Promise.resolve();
      }).then(() => {
        expect(fetch).toHaveBeenCalled();
        done();
      })
    });

    it('stays true during a series of retries', (done) => {
      let response = new Response(null, { status: 500 });
      fetch.and.returnValue(Promise.resolve(response));

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 3,
        interval: 100
      }));

      expect(client.isRequesting).withContext('Before start').toBe(false);
      let request = client.fetch('path');
      expect(client.isRequesting).withContext('When started').toBe(true);
      setTimeout(() => {
        expect(client.isRequesting).withContext('After 100ms').toBe(true);
      }, 100);
      setTimeout(() => {
        expect(client.isRequesting).withContext('After 200ms').toBe(true);
      }, 200);
      request.then((result) => {
        done.fail('fetch did not error');
      }).catch((r) => {
        // 1 original call plus 3 retries
        expect(fetch).toHaveBeenCalledTimes(4);
        done();
      });
    });
    it('is set to false after a series of retry that fail', (done) => {
      let response = new Response(null, { status: 500 });
      fetch.and.returnValue(Promise.resolve(response));

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 3,
        interval: 100
      }));

      expect(client.isRequesting).withContext('Before start').toBe(false);
      let request = client.fetch('path');
      expect(client.isRequesting).withContext('When started').toBe(true);
      request.then((result) => {
        done.fail('fetch did not error');
      }).catch(() => {
        // 1 original call plus 3 retries
        expect(fetch).toHaveBeenCalledTimes(4);
        expect(client.isRequesting).withContext('When finished').toBe(false);
        done();
      });
    });
    it('is set to false after a series of retry that fail that succeed', (done) => {
      let firstResponse = new Response(null, { status: 500 });
      let secondResponse = new Response(null, { status: 200 });

      fetch.and.returnValues(Promise.resolve(firstResponse), Promise.resolve(secondResponse));

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 3,
        interval: 1,
        strategy: retryStrategy.fixed
      }));

      expect(client.isRequesting).withContext('Before start').toBe(false);
      let request = client.fetch('path');
      expect(client.isRequesting).withContext('When started').toBe(true);
      request.then(() => {
        // 1 original call plus 1 retry
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(client.isRequesting).withContext('When finished').toBe(false);
        done();
      }).catch((result) => {
        done.fail('fetch did error');
      });
    });
    it('forward requests', (done) => {
      const path = 'retry';
      let retry = 3;
      fetch.and.returnValue(Promise.reject(new Response(null, { status: 500 })));
      let interceptor: Interceptor = {
        response(r) { return r; },
        responseError(r) {
          if (retry--) {
            let request = client.buildRequest(path);
            return request;
          } else {
            throw r;
          }
        }
      };
      spyOn(interceptor, 'response').and.callThrough();
      spyOn(interceptor, 'responseError').and.callThrough();

      client.interceptors.push(interceptor);

      // add check before fetch, this one passes.
      expect(client.isRequesting).toBe(false);

      client.fetch(path)
        .catch(() => {
          expect(interceptor.response).not.toHaveBeenCalled();
          expect(interceptor.responseError).toHaveBeenCalledWith(jasmine.any(Response), jasmine.any(Request), client);
          expect(fetch).toHaveBeenCalledTimes(4);
          expect(client.activeRequestCount).toBe(0);
          expect(client.isRequesting).toBe(false);
          done();
        });
    });
  });
});

function emptyResponse(status: number) {
  return Promise.resolve(new Response(null, { status }));
}
