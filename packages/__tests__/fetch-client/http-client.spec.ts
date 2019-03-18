import { PLATFORM } from '@aurelia/kernel';
import { expect } from 'chai';
import {
  match,
  SinonStub,
  stub
} from 'sinon';
import {
  HTMLTestContext,
  TestContext
} from '@aurelia/testing';
import {
  HttpClient,
  HttpClientConfiguration,
  Interceptor,
  retryStrategy,
  json
} from '@aurelia/fetch-client';

describe('HttpClient', function () {
  let ctx: HTMLTestContext;
  let originalFetch: (input: string | Request, init?: RequestInit) => Promise<Response>;
  let client: HttpClient;
  let fetch: SinonStub;

  beforeEach(function () {
    ctx = TestContext.createHTMLTestContext();
    originalFetch = ctx.dom.window.fetch;
    client = ctx.container.get(HttpClient);
    fetch = ctx.dom.window.fetch = stub();
  });

  afterEach(function () {
    fetch = ctx.dom.window.fetch = originalFetch as SinonStub;
  });

  it('errors on missing fetch implementation', function () {
    ctx.dom.window.fetch = undefined;
    expect(() => new HttpClient(ctx.dom)).to.throw();
  });

  describe('configure', function () {
    it('accepts plain objects', function () {
      const defaults = {};
      client.configure(defaults);

      expect(client.isConfigured).to.equal(true);
      expect(client.defaults).to.equal(defaults);
    });

    it('accepts configuration callbacks', function () {
      const defaults = { foo: true };
      const baseUrl = '/test';
      const interceptor = {};

      client.configure(config => {
        expect(config).to.be.instanceof(HttpClientConfiguration);

        return config
          .withDefaults(defaults as RequestInit)
          .withBaseUrl(baseUrl)
          .withInterceptor(interceptor);
      });

      expect(client.isConfigured).to.equal(true);
      expect((client.defaults as {foo: boolean}).foo).to.equal(true);
      expect(client.baseUrl).to.equal(baseUrl);
      expect(client.interceptors.indexOf(interceptor)).to.equal(0);
    });

    it('accepts configuration override', function () {
      const defaults = { foo: true };

      client.configure(config => config.withDefaults(defaults as RequestInit));

      client.configure(config => {
        expect((config.defaults as {foo: boolean}).foo).to.equal(true);

        return config;
      });
    });

    it('rejects invalid configs', function () {
      expect(() => client.configure(1 as RequestInit)).to.throw();
    });

    it('applies standard configuration', function () {
      client.configure(config => config.useStandardConfiguration());

      expect(client.defaults.credentials).to.equal('same-origin');
      expect(client.interceptors.length).to.equal(1);
    });

    it('rejects error responses', function () {
      client.configure(config => config.rejectErrorResponses());

      expect(client.interceptors.length).to.equal(1);
    });
  });

  describe('fetch', function () {
    it('makes requests with string inputs', function(done) {
      fetch.returns(emptyResponse(200));

      client
        .fetch('http://example.com/some/cool/path')
        .then(result => {
          expect(result.ok).to.equal(true);
        })
        .catch(result => {
          expect(result).not.to.equal(result);
        })
        .then(() => {
          expect(fetch).to.have.callCount(1);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('makes proper requests with json() inputs', function(done) {
      fetch.returns(emptyResponse(200));

      client
        .fetch('http://example.com/some/cool/path', {
          method: 'post',
          body: json({ test: 'object' })
        })
        .then(result => {
          expect(result.ok).to.equal(true);
        })
        .catch(result => {
          expect(result).not.to.equal(result);
        })
        .then(() => {
          expect(fetch).to.have.callCount(1);
          const [request] = fetch.getCall(0).args;
          expect(request.headers.has('content-type')).to.equal(true);
          expect(request.headers.get('content-type')).to.match(/application\/json/);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('makes proper requests with JSON.stringify inputs', function(done) {
      fetch.returns(emptyResponse(200));

      client
        .fetch('http://example.com/some/cool/path', {
          method: 'post',
          body: JSON.stringify({ test: 'object' })
        })
        .then(result => {
          expect(result.ok).to.equal(true);
        })
        .catch(result => {
          expect(result).not.to.equal(result);
        })
        .then(() => {
          expect(fetch).to.have.callCount(1);
          const [request] = fetch.getCall(0).args;
          expect(request.headers.has('content-type')).to.equal(true);
          expect(request.headers.get('content-type')).to.match(/application\/json/);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('makes requests with null RequestInit', function(done) {
      fetch.returns(emptyResponse(200));

      client
        .fetch('http://example.com/some/cool/path', null)
        .then(result => {
          expect(result.ok).to.equal(true);
        })
        .catch(result => {
          expect(result).not.to.equal(result);
        })
        .then(() => {
          expect(fetch).to.have.callCount(1);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('makes requests with Request inputs', function(done) {
      fetch.returns(emptyResponse(200));

      client
        .fetch(new Request('http://example.com/some/cool/path'))
        .then(result => {
          expect(result.ok).to.equal(true);
        })
        .catch(result => {
          expect(result).not.to.equal(result);
        })
        .then(() => {
          expect(fetch).to.have.callCount(1);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('makes requests with Request inputs when configured', function(done) {
      fetch.returns(emptyResponse(200));

      client.configure(config => config.withBaseUrl('http://example.com/'));

      client
        .fetch(new Request('some/cool/path'))
        .then(result => {
          expect(result.ok).to.equal(true);
        })
        .catch(result => {
          expect(result).not.to.equal(result);
        })
        .then(() => {
          expect(fetch).to.have.callCount(1);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('makes request and aborts with an AbortController signal', function(done) {
      fetch = window.fetch = originalFetch as any;

      const controller = new AbortController();

      client
        .fetch('http://jsonplaceholder.typicode.com/users', { signal: controller.signal })
        .then(result => {
          expect(result).not.to.equal(result);
        })
        .catch(result => {
          expect(result instanceof Error).to.equal(true);
          expect(result.name).to.equal('AbortError');
        })
        .then(() => {
          done();
        }).catch(() => { done('Unexpected catch'); });

      controller.abort();
    });
  });

  describe('get', function () {
    it('passes-through to fetch', function(done) {
      fetch.returns(emptyResponse(200));

      client
        .get('http://example.com/some/cool/path')
        .then(result => {
          expect(result.ok).to.equal(true);
        })
        .catch(result => {
          expect(result).not.to.equal(result);
        })
        .then(() => {
          expect(fetch).to.have.callCount(1);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });
  });

  describe('post', function () {
    it('sets method to POST and body of request and calls fetch', function(done) {
      fetch.returns(emptyResponse(200));

      client
        .post('http://example.com/some/cool/path', JSON.stringify({ test: 'object' }))
        .then(result => {
          expect(result.ok).to.equal(true);
        })
        .catch(result => {
          expect(result).not.to.equal(result);
        })
        .then(() => {
          expect(fetch).to.have.callCount(1);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });
  });

  describe('put', function () {
    it('sets method to PUT and body of request and calls fetch', function(done) {
      fetch.returns(emptyResponse(200));

      client
        .put('http://example.com/some/cool/path', JSON.stringify({ test: 'object' }))
        .then(result => {
          expect(result.ok).to.equal(true);
        })
        .catch(result => {
          expect(result).not.to.equal(result);
        })
        .then(() => {
          expect(fetch).to.have.callCount(1);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });
  });

  describe('patch', function () {
    it('sets method to PATCH and body of request and calls fetch', function(done) {
      fetch.returns(emptyResponse(200));

      client
        .patch('http://example.com/some/cool/path', JSON.stringify({ test: 'object' }))
        .then(result => {
          expect(result.ok).to.equal(true);
        })
        .catch(result => {
          expect(result).not.to.equal(result);
        })
        .then(() => {
          expect(fetch).to.have.callCount(1);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });
  });

  describe('delete', function () {
    it('sets method to DELETE and body of request and calls fetch', function(done) {
      fetch.returns(emptyResponse(200));

      client
        .delete('http://example.com/some/cool/path', JSON.stringify({ test: 'object' }))
        .then(result => {
          expect(result.ok).to.equal(true);
        })
        .catch(result => {
          expect(result).not.to.equal(result);
        })
        .then(() => {
          expect(fetch).to.have.callCount(1);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });
  });

  describe('interceptors', function () {

    it('run on request', function(done) {
      fetch.returns(emptyResponse(200));
      const interceptor = { request(r) {
        return r;
      }, requestError(r) {
        throw r;
      } };
      stub(interceptor, 'request').callThrough();
      stub(interceptor, 'requestError').callThrough();

      client.interceptors.push(interceptor);

      client.fetch('path')
        .then(() => {
          expect(interceptor.request).to.have.been.calledWith(match.instanceOf(Request), client);
          expect(interceptor.requestError).not.to.have.callCount(1);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('run on request error', function(done) {
      fetch.returns(emptyResponse(200));
      const interceptor = { request(r) {
        return r;
      }, requestError(r) {
        throw r;
      } };
      stub(interceptor, 'request').callThrough();
      stub(interceptor, 'requestError').callThrough();

      client.interceptors.push({ request() {
        return Promise.reject(new Error('test'));
      } });
      client.interceptors.push(interceptor);

      client.fetch(undefined)
        .catch(() => {
          expect(interceptor.request).not.to.have.callCount(1);
          expect(interceptor.requestError).to.have.been.calledWith(match.instanceOf(Error), client);
          done();
        });
    });

    it('run on response', function(done) {
      fetch.returns(emptyResponse(200));
      const interceptor = { response(r) {
        return r;
      }, responseError(r) {
        throw r;
      } };
      stub(interceptor, 'response').callThrough();
      stub(interceptor, 'responseError').callThrough();

      client.interceptors.push(interceptor);

      client.fetch('path')
        .then(() => {
          expect(interceptor.response).to.have.been.calledWith(match.instanceOf(Response), match.instanceOf(Request), client);
          expect(interceptor.responseError).not.to.have.callCount(1);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('run on response error', function(done) {
      fetch.returns(Promise.reject(new Response(null, { status: 500 })));
      const interceptor = { response(r) {
        return r;
      }, responseError(r) {
        throw r;
      } };
      stub(interceptor, 'response').callThrough();
      stub(interceptor, 'responseError').callThrough();

      client.interceptors.push(interceptor);

      client.fetch('path')
        .catch(() => {
          expect(interceptor.response).not.to.have.callCount(1);
          expect(interceptor.responseError).to.have.been.calledWith(match.instanceOf(Response), match.instanceOf(Request), client);
          done();
        });
    });

    it('forward requests', function(done) {
      const path = 'retry';
      let retry = 3;
      fetch.returns(Promise.reject(new Response(null, { status: 500 })));
      const interceptor: Interceptor = {
        response(r) { return r; },
        responseError(r) {
          if (retry--) {
            return client.fetch(client.buildRequest(path, {}));
          } else {
            throw r;
          }
        }
      };
      stub(interceptor, 'response').callThrough();
      stub(interceptor, 'responseError').callThrough();

      client.interceptors.push(interceptor);

      client.fetch(path)
        .catch(() => {
          expect(interceptor.response).not.to.have.callCount(1);
          expect(interceptor.responseError).to.have.been.calledWith(match.instanceOf(Response), match.instanceOf(Request), client);
          expect(fetch).to.have.callCount(4);
          done();
        });
    });

    it('normalizes input for interceptors', function(done) {
      fetch.returns(emptyResponse(200));
      let request;
      client.interceptors.push({ request(r) {
        request = r;
        return r;
      } });

      client
        .fetch('http://example.com/some/cool/path')
        .then(() => {
          expect(request instanceof Request).to.equal(true);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('runs multiple interceptors', function(done) {
      fetch.returns(emptyResponse(200));
      const first = { request(r) {
        return r;
      } };
      const second = { request(r) {
        return r;
      } };
      stub(first, 'request').callThrough();
      stub(second, 'request').callThrough();

      client.interceptors.push(first);
      client.interceptors.push(second);

      client.fetch('path')
        .then(() => {
          expect(first.request).to.have.been.calledWith(match.instanceOf(Request), client);
          expect(second.request).to.have.been.calledWith(match.instanceOf(Request), client);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('request interceptors can modify request', function(done) {
      fetch.returns(emptyResponse(200));
      const interceptor = { request() {
        return new Request('http://aurelia.io/');
      } };

      client.interceptors.push(interceptor);

      client.fetch('first')
        .then(() => {
          expect(fetch.lastCall.args[0].url).to.equal('http://aurelia.io/');
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('request interceptors can short circuit request', function(done) {
      const response = new Response();
      const interceptor = { request() {
        return response;
      } };

      client.interceptors.push(interceptor);

      client.fetch('path')
        .then((r) => {
          expect(r).to.equal(response);
          expect(fetch).not.to.have.callCount(1);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('doesn\'t reject unsuccessful responses', function(done) {
      const response = new Response(null, { status: 500 });
      fetch.returns(Promise.resolve(response));

      client.fetch('path')
        .catch((r) => {
          expect(r).not.to.equal(response);
        })
        .then((r) => {
          expect((r as Response).ok).to.equal(false);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    describe('rejectErrorResponses', function () {
      it('can reject error responses', function(done) {
        const response = new Response(null, { status: 500 });
        fetch.returns(Promise.resolve(response));

        client.configure(config => config.rejectErrorResponses());
        client.fetch('path')
          .then((r) => {
            expect(r).not.to.equal(r);
          })
          .catch((r) => {
            expect(r).to.equal(response);
            done();
          });
      });

      it('resolves successful requests', function(done) {
        fetch.returns(emptyResponse(200));

        client.configure(config => config.rejectErrorResponses());
        client.fetch('path')
          .catch((r) => {
            expect(r).not.to.equal(r);
          })
          .then((r) => {
            expect((r as Response).ok).to.equal(true);
            done();
          }).catch(() => { done('Unexpected catch'); });
      });
    });
  });

  describe('default request parameters', function () {

    it('applies baseUrl to requests', function(done) {
      fetch.returns(emptyResponse(200));
      client.baseUrl = 'http://aurelia.io/';

      client.fetch('path')
        .then(() => {
          const [request] = fetch.getCall(0).args;
          expect(request.url).to.equal('http://aurelia.io/path');
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('doesn\'t apply baseUrl to absolute URLs', function(done) {
      fetch.returns(emptyResponse(200));
      client.baseUrl = 'http://aurelia.io/';

      client.fetch('https://example.com/test')
        .then(() => {
          const [request] = fetch.getCall(0).args;
          expect(request.url).to.equal('https://example.com/test');
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('applies default headers to requests with no headers', function(done) {
      fetch.returns(emptyResponse(200));
      client.defaults = { headers: { 'x-foo': 'bar' } };

      client.fetch('path')
        .then(() => {
          const [request] = fetch.getCall(0).args;
          expect(request.headers.has('x-foo')).to.equal(true);
          expect(request.headers.get('x-foo')).to.equal('bar');
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('applies default headers to requests with other headers', function(done) {
      fetch.returns(emptyResponse(200));
      client.defaults = { headers: { 'x-foo': 'bar' } };

      client.fetch('path', { headers: { 'x-baz': 'bat' } })
        .then(() => {
          const [request] = fetch.getCall(0).args;
          expect(request.headers.has('x-foo')).to.equal(true);
          expect(request.headers.has('x-baz')).to.equal(true);
          expect(request.headers.get('x-foo')).to.equal('bar');
          expect(request.headers.get('x-baz')).to.equal('bat');
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('applies default headers to requests using Headers instance', function(done) {
      fetch.returns(emptyResponse(200));
      client.defaults = { headers: { 'x-foo': 'bar' } };

      client.fetch('path', { headers: new Headers({ 'x-baz': 'bat' }) })
        .then(() => {
          const [request] = fetch.getCall(0).args;
          expect(request.headers.has('x-foo')).to.equal(true);
          expect(request.headers.has('x-baz')).to.equal(true);
          expect(request.headers.get('x-foo')).to.equal('bar');
          expect(request.headers.get('x-baz')).to.equal('bat');
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('does not overwrite request headers with default headers', function(done) {
      fetch.returns(emptyResponse(200));
      client.defaults = { headers: { 'x-foo': 'bar' } };

      client.fetch('path', { headers: { 'x-foo': 'baz' } })
        .then(() => {
          const [request] = fetch.getCall(0).args;
          expect(request.headers.has('x-foo')).to.equal(true);
          expect(request.headers.get('x-foo')).to.equal('baz');
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('evaluates default header function values with no headers', function(done) {
      const headers: Partial<HeadersInit> & {[key: string]: () => string} = { 'x-foo': () => 'bar' };
      fetch.returns(emptyResponse(200));
      client.defaults = { headers: headers as unknown as HeadersInit };

      client.fetch('path')
        .then(() => {
          const [request] = fetch.getCall(0).args;
          expect(request.headers.has('x-foo')).to.equal(true);
          expect(request.headers.get('x-foo')).to.equal('bar');
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('evaluates default header function values with other headers', function(done) {
      const headers: Partial<HeadersInit> & {[key: string]: () => string} = { 'x-foo': () => 'bar' };
      fetch.returns(emptyResponse(200));
      client.defaults = { headers: headers as unknown as HeadersInit };

      client.fetch('path', { headers: { 'x-baz': 'bat' } })
        .then(() => {
          const [request] = fetch.getCall(0).args;
          expect(request.headers.has('x-foo')).to.equal(true);
          expect(request.headers.has('x-baz')).to.equal(true);
          expect(request.headers.get('x-foo')).to.equal('bar');
          expect(request.headers.get('x-baz')).to.equal('bat');
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('evaluates default header function values on each request', function(done) {
      const headers: Partial<HeadersInit> & {[key: string]: () => number} = { 'x-foo': () => {
        value++;
        return value;
      } };
      fetch.returns(emptyResponse(200));
      let value = 0;
      client.defaults = {
        headers: headers as unknown as HeadersInit
      };

      const promises = [];
      promises.push(client.fetch('path1'));
      promises.push(client.fetch('path2'));

      Promise.all(promises)
        .then(() => {
          const [request1] = fetch.getCall(0).args;
          const [request2] = fetch.lastCall.args;
          expect(request1.headers.has('x-foo')).to.equal(true);
          expect(request1.headers.get('x-foo')).to.equal('1');
          expect(request2.headers.has('x-foo')).to.equal(true);
          expect(request2.headers.get('x-foo')).to.equal('2');
          done();
        }).catch(() => { done('Unexpected catch'); });
    });

    it('uses default content-type header', function(done) {
      fetch.returns(emptyResponse(200));
      const contentType = 'application/octet-stream';
      client.defaults = { method: 'post', body: '{}', headers: { 'content-type': contentType } };

      client.fetch('path')
        .then(() => {
          const [request] = fetch.getCall(0).args;
          expect(request.headers.has('content-type')).to.equal(true);
          expect(request.headers.get('content-type')).to.equal(contentType);
          done();
        }).catch(() => { done('Unexpected catch'); });
    });
  });

  describe('retry', function () {
    this.timeout(10000);

    it('fails if multiple RetryInterceptors are defined', function () {
      const configure = () => {
        client.configure(config => config.withRetry().withRetry());
      };

      expect(configure).to.throw('Only one RetryInterceptor is allowed.');
    });

    it('fails if RetryInterceptor is not last interceptor defined', function () {
      const configure = () => {
        client.configure(config => config.withRetry().rejectErrorResponses());
      };

      expect(configure).to.throw('The retry interceptor must be the last interceptor defined.');
    });

    // it('retries the specified number of times', function(done) {
    //   const response = new Response(null, { status: 500 });
    //   fetch.returns(Promise.resolve(response));
    //
    //   client.configure(config => config.rejectErrorResponses().withRetry({
    //     maxRetries: 3,
    //     interval: 10
    //   }));
    //   client.fetch('path')
    //     .then((r) => {
    //       done('fetch did not error');
    //     })
    //     .catch((r) => {
    //       // 1 original call plus 3 retries
    //       expect(fetch).to.have.callCount(4);
    //       done();
    //     });
    // });
    //
    // it('continues with retry when doRetry returns true', function(done) {
    //   const response = new Response(null, { status: 500 });
    //   fetch.returns(Promise.resolve(response));
    //
    //   const doRetryCallback = stub().returns(true);
    //
    //   client.configure(config => config.rejectErrorResponses().withRetry({
    //     maxRetries: 2,
    //     interval: 10,
    //     doRetry: doRetryCallback
    //   }));
    //   client.fetch('path')
    //     .then((r) => {
    //       done('fetch did not error');
    //     })
    //     .catch((r) => {
    //       // 1 original call plus 2 retries
    //       expect(fetch).to.have.callCount(3);
    //       // only called on retries
    //       expect(doRetryCallback).to.have.callCount(2);
    //       done();
    //     });
    // });

    it('does not retry when doRetry returns false', function(done) {
      const response = new Response(null, { status: 500 });
      fetch.returns(Promise.resolve(response));

      const doRetryCallback = stub().returns(false);

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 2,
        interval: 10,
        doRetry: doRetryCallback
      }));
      client.fetch('path')
        .then((r) => {
          done('fetch did not error');
        })
        .catch((r) => {
          // 1 original call plus 0 retries
          expect(fetch).to.have.callCount(1);
          // only called on retries
          expect(doRetryCallback).to.have.callCount(1);
          done();
        });
    });

    // it('calls beforeRetry callback when specified', function(done) {
    //   const response = new Response(null, { status: 500 });
    //   fetch.returns(Promise.resolve(response));
    //
    //   const beforeRetryCallback = stub().returns(new Request('path'));
    //
    //   client.configure(config => config.rejectErrorResponses().withRetry({
    //     maxRetries: 2,
    //     interval: 10,
    //     beforeRetry: beforeRetryCallback
    //   }));
    //   return client
    //     .fetch('path')
    //     .then(
    //       () => done('fetch did not error'),
    //       () => {
    //         // 1 original call plus 2 retries
    //         expect(fetch).to.have.callCount(3);
    //         // only called on retries
    //         expect(beforeRetryCallback).to.have.callCount(2);
    //         done();
    //       }).catch(() => { done('Unexpected catch'); });
    // });
    //
    // it('calls custom retry strategy callback when specified', function(done) {
    //   const response = new Response(null, { status: 500 });
    //   fetch.returns(Promise.resolve(response));
    //
    //   const strategyRetryCallback = stub().returns(10);
    //
    //   client.configure(config => config.rejectErrorResponses().withRetry({
    //     maxRetries: 2,
    //     strategy: strategyRetryCallback
    //   }));
    //   return client.fetch('path')
    //     .then(
    //       () => done('fetch did not error'),
    //       () => {
    //         // 1 original call plus 2 retries
    //         expect(fetch).to.have.callCount(3);
    //         // only called on retries
    //         expect(strategyRetryCallback).to.have.callCount(2);
    //         done();
    //       }).catch(() => { done('Unexpected catch'); });
    // });
    //
    // it('waits correct number amount of time with fixed retry strategy', function(done) {
    //   const response = new Response(null, { status: 500 });
    //   fetch.returns(Promise.resolve(response));
    //
    //   const stubSettimeout = stub(PLATFORM, 'setTimeout').callThrough();
    //
    //   client.configure(config => config.rejectErrorResponses().withRetry({
    //     maxRetries: 2,
    //     interval: 250,
    //     strategy: retryStrategy.fixed
    //   }));
    //   return client.fetch('path')
    //     .then(
    //       () => {
    //         stubSettimeout.restore();
    //         done('fetch did not error');
    //       },
    //       () => {
    //         stubSettimeout.restore();
    //         // setTimeout is called when request starts and end, so those args need to filtered out
    //         const callArgs = stubSettimeout.args.filter(args => args[1] > 1);
    //         // only called on retries
    //         expect(callArgs[0]).to.equal([match.instanceOf(Function), 250]);
    //         expect(callArgs[1]).to.equal([match.instanceOf(Function), 250]);
    //         done();
    //       }).catch(() => { done('Unexpected catch'); });
    // });
    //
    // it('waits correct number amount of time with incremental retry strategy', function(done) {
    //   const response = new Response(null, { status: 500 });
    //   fetch.returns(Promise.resolve(response));
    //
    //   const stubSettimeout = stub(PLATFORM, 'setTimeout').callThrough();
    //
    //   client.configure(config => config.rejectErrorResponses().withRetry({
    //     maxRetries: 2,
    //     interval: 250,
    //     strategy: retryStrategy.incremental
    //   }));
    //   return client
    //     .fetch('path')
    //     .then(
    //       () => {
    //         stubSettimeout.restore();
    //         done('fetch did not error');
    //       },
    //       () => {
    //         stubSettimeout.restore();
    //         // setTimeout is called when request starts and end, so those args need to filtered out
    //         const callArgs = stubSettimeout.args.filter(args => args[1] > 1);
    //         // only called on retries
    //         expect(callArgs.length).to.equal(2);
    //         expect(callArgs[0]).to.equal([match.instanceOf(Function), 250]);
    //         expect(callArgs[1]).to.equal([match.instanceOf(Function), 500]);
    //         done();
    //       }).catch(() => { done('Unexpected catch'); });
    // });
    //
    // it('waits correct number amount of time with exponential retry strategy', function(done) {
    //   const response = new Response(null, { status: 500 });
    //   fetch.returns(Promise.resolve(response));
    //
    //   const stubSettimeout = stub(PLATFORM, 'setTimeout').callThrough();
    //
    //   client.configure(config => config.rejectErrorResponses().withRetry({
    //     maxRetries: 2,
    //     interval: 2000,
    //     strategy: retryStrategy.exponential
    //   }));
    //   return client
    //     .fetch('path')
    //     .then(
    //       () => {
    //         stubSettimeout.restore();
    //         done('fetch did not error');
    //       },
    //       () => {
    //         stubSettimeout.restore();
    //         // setTimeout is called when request starts and end, so those args need to filtered out
    //         const callArgs = stubSettimeout.args.filter(args => args[1] > 1);
    //         // only called on retries
    //         expect(callArgs.length).to.equal(2);
    //         expect(callArgs[0]).to.equal([match.instanceOf(Function), 2000]);
    //         expect(callArgs[1]).to.equal([match.instanceOf(Function), 4000]);
    //         done();
    //       }).catch(() => { done('Unexpected catch'); });
    // });
    //
    // it('waits correct number amount of time with random retry strategy', function(done) {
    //   const response = new Response(null, { status: 500 });
    //   const firstRandom = 0.1;
    //   const secondRandom = 0.4;
    //
    //   fetch.returns(Promise.resolve(response));
    //
    //   const stubSettimeout = stub(PLATFORM, 'setTimeout').callThrough();
    //   stub(Math, 'random').onCall(0).returns(firstRandom);
    //   stub(Math, 'random').onCall(1).returns(secondRandom);
    //
    //   client.configure(config => config.rejectErrorResponses().withRetry({
    //     maxRetries: 2,
    //     interval: 2000,
    //     strategy: retryStrategy.random,
    //     minRandomInterval: 1000,
    //     maxRandomInterval: 3000
    //   }));
    //
    //   const firstInterval = firstRandom * (3000 - 1000) + 1000;
    //   const secondInterval = secondRandom * (3000 - 1000) + 1000;
    //
    //   return client
    //     .fetch('path')
    //     .then(
    //       () => {
    //         stubSettimeout.restore();
    //         done('fetch did not error');
    //       },
    //       () => {
    //         stubSettimeout.restore();
    //         // setTimeout is called when request starts and end, so those args need to filtered out
    //         const callArgs = stubSettimeout.args.filter(args => args[1] > 1);
    //         // only called on retries
    //         expect(callArgs[0]).to.equal([match.instanceOf(Function), firstInterval]);
    //         expect(callArgs[1]).to.equal([match.instanceOf(Function), secondInterval]);
    //         done();
    //       }
    //     ).catch(() => { done('Unexpected catch'); });
    // });
    //
    // it('successfully returns without error if a retry succeeds', function(done) {
    //   const firstResponse = new Response(null, { status: 500 });
    //   const secondResponse = new Response(null, { status: 200 });
    //
    //   fetch.onCall(0).returns(Promise.resolve(firstResponse));
    //   fetch.onCall(1).returns(Promise.resolve(secondResponse));
    //
    //   client.configure(config => config.rejectErrorResponses().withRetry({
    //     maxRetries: 3,
    //     interval: 1,
    //     strategy: retryStrategy.fixed
    //   }));
    //
    //   return client.fetch('path')
    //     .then(
    //       (r) => {
    //         // 1 original call plus 1 retry
    //         expect(fetch).to.have.callCount(2);
    //         expect(r).to.equal(secondResponse);
    //         done();
    //       },
    //       () => done('retry was unsuccessful')
    //      ).catch(() => { done('Unexpected catch'); });
    // });
  });

  describe('isRequesting', function () {
    it('is set to true when starting a request', function(done) {
      fetch.returns(emptyResponse(200));

      expect(client.isRequesting, 'Before start').to.equal(false);
      const request = client.fetch('http://example.com/some/cool/path');
      expect(client.isRequesting, 'When started').to.equal(true);
      request.then(() => {
        expect(fetch).to.have.callCount(1);
        done();
      }).catch(() => { done('Unexpected catch'); });
    });
    it('is set to false when request is finished', function(done) {
      fetch.returns(emptyResponse(200));

      expect(client.isRequesting, 'Before start').to.equal(false);
      const request = client.fetch('http://example.com/some/cool/path');
      expect(client.isRequesting, 'When started').to.equal(true);
      request.then(() => {
        expect(client.isRequesting, 'When finished').to.equal(false);
      }).then(() => {
        expect(fetch).to.have.callCount(1);
        done();
      }).catch(() => { done('Unexpected catch'); });
    });
    it('is still true when a request is still in progress', function(done) {
      const firstResponse = emptyResponse(200);
      const secondResponse = new Promise((resolve) => {
        PLATFORM.setTimeout(() => { resolve(emptyResponse(200)); }, 200);
      });

      fetch.onCall(0).returns(firstResponse);
      fetch.onCall(1).returns(secondResponse);
      expect(client.isRequesting, 'Before start').to.equal(false);

      const request1 = client.fetch('http://example.com/some/cool/path');
      const request2 = client.fetch('http://example.com/some/cool/path');
      expect(client.isRequesting, 'When started').to.equal(true);
      request1.then(() => {
        expect(client.isRequesting, 'When request 1 is completed').to.equal(true);
      }).catch(() => { done('Unexpected catch'); });
      PLATFORM.setTimeout(() => { expect(client.isRequesting, 'After 100ms').to.equal(true); }, 100);
      request2.then(() => {
        expect(client.isRequesting, 'When all requests are finished').to.equal(false);
      }).then(() => {
        expect(fetch).to.have.callCount(2);
        done();
      }).catch(() => { done('Unexpected catch'); });
    });
    it('is set to false when request is rejected', function(done) {
      fetch.returns(Promise.reject(new Error('Failed to fetch')));

      expect(client.isRequesting, 'Before start').to.equal(false);
      client.fetch('http://example.com/some/cool/path').then(result => {
        expect(result).not.to.equal(result);
      }).catch((result) => {
        expect(result instanceof Error).to.equal(true);
        expect(result.message).to.equal('Failed to fetch');
        expect(client.isRequesting, 'When finished').to.equal(false);
        return Promise.resolve();
      }).then(() => {
        expect(fetch).to.have.callCount(1);
        done();
      }).catch(() => { done('Unexpected catch'); });
    });

    // it('stays true during a series of retries', function(done) {
    //   const response = new Response(null, { status: 500 });
    //   fetch.returns(Promise.resolve(response));
    //
    //   client.configure(config => config.rejectErrorResponses().withRetry({
    //     maxRetries: 3,
    //     interval: 100
    //   }));
    //
    //   expect(client.isRequesting, 'Before start').to.equal(false);
    //   const request = client.fetch('path');
    //   expect(client.isRequesting, 'When started').to.equal(true);
    //   PLATFORM.setTimeout(() => { expect(client.isRequesting, 'After 100ms').to.equal(true); }, 100);
    //   PLATFORM.setTimeout(() => { expect(client.isRequesting, 'After 200ms').to.equal(true); }, 200);
    //   request.then((result) => {
    //     done('fetch did not error');
    //   }).catch((r) => {
    //     // 1 original call plus 3 retries
    //     expect(fetch).to.have.callCount(4);
    //     done();
    //   });
    // });
    // it('is set to false after a series of retry that fail', function(done) {
    //   const response = new Response(null, { status: 500 });
    //   fetch.returns(Promise.resolve(response));
    //
    //   client.configure(config => config.rejectErrorResponses().withRetry({
    //     maxRetries: 3,
    //     interval: 100
    //   }));
    //
    //   expect(client.isRequesting, 'Before start').to.equal(false);
    //   const request = client.fetch('path');
    //   expect(client.isRequesting, 'When started').to.equal(true);
    //   request.then((result) => {
    //     done('fetch did not error');
    //   }).catch(() => {
    //     // 1 original call plus 3 retries
    //     expect(fetch).to.have.callCount(4);
    //     expect(client.isRequesting, 'When finished').to.equal(false);
    //     done();
    //   });
    // });
    it('is set to false after a series of retry that fail that succeed', function(done) {
      const firstResponse = new Response(null, { status: 500 });
      const secondResponse = new Response(null, { status: 200 });

      fetch.onCall(0).returns(Promise.resolve(firstResponse));
      fetch.onCall(1).returns(Promise.resolve(secondResponse));

      client.configure(config => config.rejectErrorResponses().withRetry({
        maxRetries: 3,
        interval: 1,
        strategy: retryStrategy.fixed
      }));

      expect(client.isRequesting, 'Before start').to.equal(false);
      const request = client.fetch('path');
      expect(client.isRequesting, 'When started').to.equal(true);
      request.then(() => {
        // 1 original call plus 1 retry
        expect(fetch).to.have.callCount(2);
        expect(client.isRequesting, 'When finished').to.equal(false);
        done();
      }).catch((result) => {
        done('fetch did error');
      });
    });
    it('forward requests', function(done) {
      const path = 'retry';
      let retry = 3;
      fetch.returns(Promise.reject(new Response(null, { status: 500 })));
      const interceptor: Interceptor = {
        response(r) { return r; },
        responseError(r) {
          if (retry--) {
            return client.fetch(client.buildRequest(path, {}));
          } else {
            throw r;
          }
        }
      };
      stub(interceptor, 'response').callThrough();
      stub(interceptor, 'responseError').callThrough();

      client.interceptors.push(interceptor);

      // add check before fetch, this one passes.
      expect(client.isRequesting).to.equal(false);

      client.fetch(path)
        .catch(() => {
          expect(interceptor.response).not.to.have.callCount(1);
          expect(interceptor.responseError).to.have.been.calledWith(match.instanceOf(Response), match.instanceOf(Request), client);
          expect(fetch).to.have.callCount(4);
          expect(client.activeRequestCount).to.equal(0);
          expect(client.isRequesting).to.equal(false);
          done();
        });
    });
  });
});

function emptyResponse(status: number) {
  return Promise.resolve(new Response(null, { status }));
}
