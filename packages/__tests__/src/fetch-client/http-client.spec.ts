// import { PLATFORM } from '@aurelia/kernel';
// import {
//   HTMLTestContext,
//   TestContext
// } from '@aurelia/testing';
// import {
//   HttpClient,
//   HttpClientConfiguration,
//   Interceptor,
//   retryStrategy,
//   json
// } from '@aurelia/fetch-client';

// describe('fetch-client/http-client.spec.ts', function () {
//   let ctx: HTMLTestContext;
//   let originalFetch: (input: string | Request, init?: RequestInit) => Promise<Response>;
//   let client: HttpClient;
//   let fetch: SinonStub;

//   beforeEach(function () {
//     ctx = TestContext.createHTMLTestContext();
//     originalFetch = ctx.dom.window.fetch;
//     client = ctx.container.get(HttpClient);
//     fetch = ctx.dom.window.fetch = stub();
//   });

//   afterEach(function () {
//     fetch = ctx.dom.window.fetch = originalFetch as SinonStub;
//   });

//   describe('interceptors', function () {

//     it('run on request', function(done) {
//       fetch.returns(emptyResponse(200));
//       const interceptor = { request(r) {
//         return r;
//       }, requestError(r) {
//         throw r;
//       } };
//       stub(interceptor, 'request').callThrough();
//       stub(interceptor, 'requestError').callThrough();

//       client.interceptors.push(interceptor);

//       client.fetch('path')
//         .then(() => {
//           expect(interceptor.request).to.have.been.calledWith(match.instanceOf(Request), client);
//           expect(interceptor.requestError).not.to.have.callCount(1);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('run on request error', function(done) {
//       fetch.returns(emptyResponse(200));
//       const interceptor = { request(r) {
//         return r;
//       }, requestError(r) {
//         throw r;
//       } };
//       stub(interceptor, 'request').callThrough();
//       stub(interceptor, 'requestError').callThrough();

//       client.interceptors.push({ request() {
//         return Promise.reject(new Error('test'));
//       } });
//       client.interceptors.push(interceptor);

//       client.fetch(undefined)
//         .catch(() => {
//           expect(interceptor.request).not.to.have.callCount(1);
//           expect(interceptor.requestError).to.have.been.calledWith(match.instanceOf(Error), client);
//           done();
//         });
//     });

//     it('run on response', function(done) {
//       fetch.returns(emptyResponse(200));
//       const interceptor = { response(r) {
//         return r;
//       }, responseError(r) {
//         throw r;
//       } };
//       stub(interceptor, 'response').callThrough();
//       stub(interceptor, 'responseError').callThrough();

//       client.interceptors.push(interceptor);

//       client.fetch('path')
//         .then(() => {
//           expect(interceptor.response).to.have.been.calledWith(match.instanceOf(Response), match.instanceOf(Request), client);
//           expect(interceptor.responseError).not.to.have.callCount(1);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('run on response error', function(done) {
//       fetch.returns(Promise.reject(new Response(null, { status: 500 })));
//       const interceptor = { response(r) {
//         return r;
//       }, responseError(r) {
//         throw r;
//       } };
//       stub(interceptor, 'response').callThrough();
//       stub(interceptor, 'responseError').callThrough();

//       client.interceptors.push(interceptor);

//       client.fetch('path')
//         .catch(() => {
//           expect(interceptor.response).not.to.have.callCount(1);
//           expect(interceptor.responseError).to.have.been.calledWith(match.instanceOf(Response), match.instanceOf(Request), client);
//           done();
//         });
//     });

//     it('forward requests', function(done) {
//       const path = 'retry';
//       let retry = 3;
//       fetch.returns(Promise.reject(new Response(null, { status: 500 })));
//       const interceptor: Interceptor = {
//         response(r) { return r; },
//         responseError(r) {
//           if (retry--) {
//             return client.fetch(client.buildRequest(path, {}));
//           } else {
//             throw r;
//           }
//         }
//       };
//       stub(interceptor, 'response').callThrough();
//       stub(interceptor, 'responseError').callThrough();

//       client.interceptors.push(interceptor);

//       client.fetch(path)
//         .catch(() => {
//           expect(interceptor.response).not.to.have.callCount(1);
//           expect(interceptor.responseError).to.have.been.calledWith(match.instanceOf(Response), match.instanceOf(Request), client);
//           expect(fetch).to.have.callCount(4);
//           done();
//         });
//     });

//     it('normalizes input for interceptors', function(done) {
//       fetch.returns(emptyResponse(200));
//       let request;
//       client.interceptors.push({ request(r) {
//         request = r;
//         return r;
//       } });

//       client
//         .fetch('http://example.com/some/cool/path')
//         .then(() => {
//           assert.strictEqual(request instanceof Request, true, `request instanceof Request`);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('runs multiple interceptors', function(done) {
//       fetch.returns(emptyResponse(200));
//       const first = { request(r) {
//         return r;
//       } };
//       const second = { request(r) {
//         return r;
//       } };
//       stub(first, 'request').callThrough();
//       stub(second, 'request').callThrough();

//       client.interceptors.push(first);
//       client.interceptors.push(second);

//       client.fetch('path')
//         .then(() => {
//           expect(first.request).to.have.been.calledWith(match.instanceOf(Request), client);
//           expect(second.request).to.have.been.calledWith(match.instanceOf(Request), client);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('request interceptors can modify request', function(done) {
//       fetch.returns(emptyResponse(200));
//       const interceptor = { request() {
//         return new Request('http://aurelia.io/');
//       } };

//       client.interceptors.push(interceptor);

//       client.fetch('first')
//         .then(() => {
//           assert.strictEqual(fetch.lastCall.args[0].url, 'http://aurelia.io/', `fetch.lastCall.args[0].url`);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('request interceptors can short circuit request', function(done) {
//       const response = new Response();
//       const interceptor = { request() {
//         return response;
//       } };

//       client.interceptors.push(interceptor);

//       client.fetch('path')
//         .then((r) => {
//           assert.strictEqual(r, response, `r`);
//           expect(fetch).not.to.have.callCount(1);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('doesn\'t reject unsuccessful responses', function(done) {
//       const response = new Response(null, { status: 500 });
//       fetch.returns(Promise.resolve(response));

//       client.fetch('path')
//         .catch((r) => {
//           assert.notStrictEqual(r, response, `r`);
//         })
//         .then((r) => {
//           assert.strictEqual((r as Response).ok, false, `(r as Response).ok`);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     describe('rejectErrorResponses', function () {
//       it('can reject error responses', function(done) {
//         const response = new Response(null, { status: 500 });
//         fetch.returns(Promise.resolve(response));

//         client.configure(config => config.rejectErrorResponses());
//         client.fetch('path')
//           .then((r) => {
//             assert.notStrictEqual(r, r, `r`);
//           })
//           .catch((r) => {
//             assert.strictEqual(r, response, `r`);
//             done();
//           });
//       });

//       it('resolves successful requests', function(done) {
//         fetch.returns(emptyResponse(200));

//         client.configure(config => config.rejectErrorResponses());
//         client.fetch('path')
//           .catch((r) => {
//             assert.notStrictEqual(r, r, `r`);
//           })
//           .then((r) => {
//             assert.strictEqual((r as Response).ok, true, `(r as Response).ok`);
//             done();
//           }).catch(() => { done('Unexpected catch'); });
//       });
//     });
//   });

//   describe('default request parameters', function () {

//     it('applies baseUrl to requests', function(done) {
//       fetch.returns(emptyResponse(200));
//       client.baseUrl = 'http://aurelia.io/';

//       client.fetch('path')
//         .then(() => {
//           const [request] = fetch.getCall(0).args;
//           assert.strictEqual(request.url, 'http://aurelia.io/path', `request.url`);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('doesn\'t apply baseUrl to absolute URLs', function(done) {
//       fetch.returns(emptyResponse(200));
//       client.baseUrl = 'http://aurelia.io/';

//       client.fetch('https://example.com/test')
//         .then(() => {
//           const [request] = fetch.getCall(0).args;
//           assert.strictEqual(request.url, 'https://example.com/test', `request.url`);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('applies default headers to requests with no headers', function(done) {
//       fetch.returns(emptyResponse(200));
//       client.defaults = { headers: { 'x-foo': 'bar' } };

//       client.fetch('path')
//         .then(() => {
//           const [request] = fetch.getCall(0).args;
//           assert.strictEqual(request.headers.has('x-foo'), true, `request.headers.has('x-foo')`);
//           assert.strictEqual(request.headers.get('x-foo'), 'bar', `request.headers.get('x-foo')`);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('applies default headers to requests with other headers', function(done) {
//       fetch.returns(emptyResponse(200));
//       client.defaults = { headers: { 'x-foo': 'bar' } };

//       client.fetch('path', { headers: { 'x-baz': 'bat' } })
//         .then(() => {
//           const [request] = fetch.getCall(0).args;
//           assert.strictEqual(request.headers.has('x-foo'), true, `request.headers.has('x-foo')`);
//           assert.strictEqual(request.headers.has('x-baz'), true, `request.headers.has('x-baz')`);
//           assert.strictEqual(request.headers.get('x-foo'), 'bar', `request.headers.get('x-foo')`);
//           assert.strictEqual(request.headers.get('x-baz'), 'bat', `request.headers.get('x-baz')`);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('applies default headers to requests using Headers instance', function(done) {
//       fetch.returns(emptyResponse(200));
//       client.defaults = { headers: { 'x-foo': 'bar' } };

//       client.fetch('path', { headers: new Headers({ 'x-baz': 'bat' }) })
//         .then(() => {
//           const [request] = fetch.getCall(0).args;
//           assert.strictEqual(request.headers.has('x-foo'), true, `request.headers.has('x-foo')`);
//           assert.strictEqual(request.headers.has('x-baz'), true, `request.headers.has('x-baz')`);
//           assert.strictEqual(request.headers.get('x-foo'), 'bar', `request.headers.get('x-foo')`);
//           assert.strictEqual(request.headers.get('x-baz'), 'bat', `request.headers.get('x-baz')`);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('does not overwrite request headers with default headers', function(done) {
//       fetch.returns(emptyResponse(200));
//       client.defaults = { headers: { 'x-foo': 'bar' } };

//       client.fetch('path', { headers: { 'x-foo': 'baz' } })
//         .then(() => {
//           const [request] = fetch.getCall(0).args;
//           assert.strictEqual(request.headers.has('x-foo'), true, `request.headers.has('x-foo')`);
//           assert.strictEqual(request.headers.get('x-foo'), 'baz', `request.headers.get('x-foo')`);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('evaluates default header function values with no headers', function(done) {
//       const headers: Partial<HeadersInit> & {[key: string]: () => string} = { 'x-foo': () => 'bar' };
//       fetch.returns(emptyResponse(200));
//       client.defaults = { headers: headers as unknown as HeadersInit };

//       client.fetch('path')
//         .then(() => {
//           const [request] = fetch.getCall(0).args;
//           assert.strictEqual(request.headers.has('x-foo'), true, `request.headers.has('x-foo')`);
//           assert.strictEqual(request.headers.get('x-foo'), 'bar', `request.headers.get('x-foo')`);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('evaluates default header function values with other headers', function(done) {
//       const headers: Partial<HeadersInit> & {[key: string]: () => string} = { 'x-foo': () => 'bar' };
//       fetch.returns(emptyResponse(200));
//       client.defaults = { headers: headers as unknown as HeadersInit };

//       client.fetch('path', { headers: { 'x-baz': 'bat' } })
//         .then(() => {
//           const [request] = fetch.getCall(0).args;
//           assert.strictEqual(request.headers.has('x-foo'), true, `request.headers.has('x-foo')`);
//           assert.strictEqual(request.headers.has('x-baz'), true, `request.headers.has('x-baz')`);
//           assert.strictEqual(request.headers.get('x-foo'), 'bar', `request.headers.get('x-foo')`);
//           assert.strictEqual(request.headers.get('x-baz'), 'bat', `request.headers.get('x-baz')`);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('evaluates default header function values on each request', function(done) {
//       const headers: Partial<HeadersInit> & {[key: string]: () => number} = { 'x-foo': () => {
//         value++;
//         return value;
//       } };
//       fetch.returns(emptyResponse(200));
//       let value = 0;
//       client.defaults = {
//         headers: headers as unknown as HeadersInit
//       };

//       const promises = [];
//       promises.push(client.fetch('path1'));
//       promises.push(client.fetch('path2'));

//       Promise.all(promises)
//         .then(() => {
//           const [request1] = fetch.getCall(0).args;
//           const [request2] = fetch.lastCall.args;
//           assert.strictEqual(request1.headers.has('x-foo'), true, `request1.headers.has('x-foo')`);
//           assert.strictEqual(request1.headers.get('x-foo'), '1', `request1.headers.get('x-foo')`);
//           assert.strictEqual(request2.headers.has('x-foo'), true, `request2.headers.has('x-foo')`);
//           assert.strictEqual(request2.headers.get('x-foo'), '2', `request2.headers.get('x-foo')`);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });

//     it('uses default content-type header', function(done) {
//       fetch.returns(emptyResponse(200));
//       const contentType = 'application/octet-stream';
//       client.defaults = { method: 'post', body: '{}', headers: { 'content-type': contentType } };

//       client.fetch('path')
//         .then(() => {
//           const [request] = fetch.getCall(0).args;
//           assert.strictEqual(request.headers.has('content-type'), true, `request.headers.has('content-type')`);
//           assert.strictEqual(request.headers.get('content-type'), contentType, `request.headers.get('content-type')`);
//           done();
//         }).catch(() => { done('Unexpected catch'); });
//     });
//   });

//   describe('retry', function () {
//     this.timeout(10000);

//     it('fails if multiple RetryInterceptors are defined', function () {
//       const configure = () => {
//         client.configure(config => config.withRetry().withRetry());
//       };

//       assert.throws(configure, 'Only one RetryInterceptor is allowed.', `configure`);
//     });

//     it('fails if RetryInterceptor is not last interceptor defined', function () {
//       const configure = () => {
//         client.configure(config => config.withRetry().rejectErrorResponses());
//       };

//       assert.throws(configure, 'The retry interceptor must be the last interceptor defined.', `configure`);
//     });

//     // it('retries the specified number of times', function(done) {
//     //   const response = new Response(null, { status: 500 });
//     //   fetch.returns(Promise.resolve(response));
//     //
//     //   client.configure(config => config.rejectErrorResponses().withRetry({
//     //     maxRetries: 3,
//     //     interval: 10
//     //   }));
//     //   client.fetch('path')
//     //     .then((r) => {
//     //       done('fetch did not error');
//     //     })
//     //     .catch((r) => {
//     //       // 1 original call plus 3 retries
//     //       expect(fetch).to.have.callCount(4);
//     //       done();
//     //     });
//     // });
//     //
//     // it('continues with retry when doRetry returns true', function(done) {
//     //   const response = new Response(null, { status: 500 });
//     //   fetch.returns(Promise.resolve(response));
//     //
//     //   const doRetryCallback = stub().returns(true);
//     //
//     //   client.configure(config => config.rejectErrorResponses().withRetry({
//     //     maxRetries: 2,
//     //     interval: 10,
//     //     doRetry: doRetryCallback
//     //   }));
//     //   client.fetch('path')
//     //     .then((r) => {
//     //       done('fetch did not error');
//     //     })
//     //     .catch((r) => {
//     //       // 1 original call plus 2 retries
//     //       expect(fetch).to.have.callCount(3);
//     //       // only called on retries
//     //       expect(doRetryCallback).to.have.callCount(2);
//     //       done();
//     //     });
//     // });

//     it('does not retry when doRetry returns false', function(done) {
//       const response = new Response(null, { status: 500 });
//       fetch.returns(Promise.resolve(response));

//       const doRetryCallback = stub().returns(false);

//       client.configure(config => config.rejectErrorResponses().withRetry({
//         maxRetries: 2,
//         interval: 10,
//         doRetry: doRetryCallback
//       }));
//       client.fetch('path')
//         .then((r) => {
//           done('fetch did not error');
//         })
//         .catch((r) => {
//           // 1 original call plus 0 retries
//           expect(fetch).to.have.callCount(1);
//           // only called on retries
//           expect(doRetryCallback).to.have.callCount(1);
//           done();
//         });
//     });

//     // it('calls beforeRetry callback when specified', function(done) {
//     //   const response = new Response(null, { status: 500 });
//     //   fetch.returns(Promise.resolve(response));
//     //
//     //   const beforeRetryCallback = stub().returns(new Request('path'));
//     //
//     //   client.configure(config => config.rejectErrorResponses().withRetry({
//     //     maxRetries: 2,
//     //     interval: 10,
//     //     beforeRetry: beforeRetryCallback
//     //   }));
//     //   return client
//     //     .fetch('path')
//     //     .then(
//     //       () => done('fetch did not error'),
//     //       () => {
//     //         // 1 original call plus 2 retries
//     //         expect(fetch).to.have.callCount(3);
//     //         // only called on retries
//     //         expect(beforeRetryCallback).to.have.callCount(2);
//     //         done();
//     //       }).catch(() => { done('Unexpected catch'); });
//     // });
//     //
//     // it('calls custom retry strategy callback when specified', function(done) {
//     //   const response = new Response(null, { status: 500 });
//     //   fetch.returns(Promise.resolve(response));
//     //
//     //   const strategyRetryCallback = stub().returns(10);
//     //
//     //   client.configure(config => config.rejectErrorResponses().withRetry({
//     //     maxRetries: 2,
//     //     strategy: strategyRetryCallback
//     //   }));
//     //   return client.fetch('path')
//     //     .then(
//     //       () => done('fetch did not error'),
//     //       () => {
//     //         // 1 original call plus 2 retries
//     //         expect(fetch).to.have.callCount(3);
//     //         // only called on retries
//     //         expect(strategyRetryCallback).to.have.callCount(2);
//     //         done();
//     //       }).catch(() => { done('Unexpected catch'); });
//     // });
//     //
//     // it('waits correct number amount of time with fixed retry strategy', function(done) {
//     //   const response = new Response(null, { status: 500 });
//     //   fetch.returns(Promise.resolve(response));
//     //
//     //   const stubSettimeout = stub(PLATFORM, 'setTimeout').callThrough();
//     //
//     //   client.configure(config => config.rejectErrorResponses().withRetry({
//     //     maxRetries: 2,
//     //     interval: 250,
//     //     strategy: retryStrategy.fixed
//     //   }));
//     //   return client.fetch('path')
//     //     .then(
//     //       () => {
//     //         stubSettimeout.restore();
//     //         done('fetch did not error');
//     //       },
//     //       () => {
//     //         stubSettimeout.restore();
//     //         // setTimeout is called when request starts and end, so those args need to filtered out
//     //         const callArgs = stubSettimeout.args.filter(args => args[1] > 1);
//     //         // only called on retries
//     //         assert.strictEqual(callArgs[0], [match.instanceOf(Function), 250], `callArgs[0]`);
//     //         assert.strictEqual(callArgs[1], [match.instanceOf(Function), 250], `callArgs[1]`);
//     //         done();
//     //       }).catch(() => { done('Unexpected catch'); });
//     // });
//     //
//     // it('waits correct number amount of time with incremental retry strategy', function(done) {
//     //   const response = new Response(null, { status: 500 });
//     //   fetch.returns(Promise.resolve(response));
//     //
//     //   const stubSettimeout = stub(PLATFORM, 'setTimeout').callThrough();
//     //
//     //   client.configure(config => config.rejectErrorResponses().withRetry({
//     //     maxRetries: 2,
//     //     interval: 250,
//     //     strategy: retryStrategy.incremental
//     //   }));
//     //   return client
//     //     .fetch('path')
//     //     .then(
//     //       () => {
//     //         stubSettimeout.restore();
//     //         done('fetch did not error');
//     //       },
//     //       () => {
//     //         stubSettimeout.restore();
//     //         // setTimeout is called when request starts and end, so those args need to filtered out
//     //         const callArgs = stubSettimeout.args.filter(args => args[1] > 1);
//     //         // only called on retries
//     //         assert.strictEqual(callArgs.length, 2, `callArgs.length`);
//     //         assert.strictEqual(callArgs[0], [match.instanceOf(Function), 250], `callArgs[0]`);
//     //         assert.strictEqual(callArgs[1], [match.instanceOf(Function), 500], `callArgs[1]`);
//     //         done();
//     //       }).catch(() => { done('Unexpected catch'); });
//     // });
//     //
//     // it('waits correct number amount of time with exponential retry strategy', function(done) {
//     //   const response = new Response(null, { status: 500 });
//     //   fetch.returns(Promise.resolve(response));
//     //
//     //   const stubSettimeout = stub(PLATFORM, 'setTimeout').callThrough();
//     //
//     //   client.configure(config => config.rejectErrorResponses().withRetry({
//     //     maxRetries: 2,
//     //     interval: 2000,
//     //     strategy: retryStrategy.exponential
//     //   }));
//     //   return client
//     //     .fetch('path')
//     //     .then(
//     //       () => {
//     //         stubSettimeout.restore();
//     //         done('fetch did not error');
//     //       },
//     //       () => {
//     //         stubSettimeout.restore();
//     //         // setTimeout is called when request starts and end, so those args need to filtered out
//     //         const callArgs = stubSettimeout.args.filter(args => args[1] > 1);
//     //         // only called on retries
//     //         assert.strictEqual(callArgs.length, 2, `callArgs.length`);
//     //         assert.strictEqual(callArgs[0], [match.instanceOf(Function), 2000], `callArgs[0]`);
//     //         assert.strictEqual(callArgs[1], [match.instanceOf(Function), 4000], `callArgs[1]`);
//     //         done();
//     //       }).catch(() => { done('Unexpected catch'); });
//     // });
//     //
//     // it('waits correct number amount of time with random retry strategy', function(done) {
//     //   const response = new Response(null, { status: 500 });
//     //   const firstRandom = 0.1;
//     //   const secondRandom = 0.4;
//     //
//     //   fetch.returns(Promise.resolve(response));
//     //
//     //   const stubSettimeout = stub(PLATFORM, 'setTimeout').callThrough();
//     //   stub(Math, 'random').onCall(0).returns(firstRandom);
//     //   stub(Math, 'random').onCall(1).returns(secondRandom);
//     //
//     //   client.configure(config => config.rejectErrorResponses().withRetry({
//     //     maxRetries: 2,
//     //     interval: 2000,
//     //     strategy: retryStrategy.random,
//     //     minRandomInterval: 1000,
//     //     maxRandomInterval: 3000
//     //   }));
//     //
//     //   const firstInterval = firstRandom * (3000 - 1000) + 1000;
//     //   const secondInterval = secondRandom * (3000 - 1000) + 1000;
//     //
//     //   return client
//     //     .fetch('path')
//     //     .then(
//     //       () => {
//     //         stubSettimeout.restore();
//     //         done('fetch did not error');
//     //       },
//     //       () => {
//     //         stubSettimeout.restore();
//     //         // setTimeout is called when request starts and end, so those args need to filtered out
//     //         const callArgs = stubSettimeout.args.filter(args => args[1] > 1);
//     //         // only called on retries
//     //         assert.strictEqual(callArgs[0], [match.instanceOf(Function), firstInterval], `callArgs[0]`);
//     //         assert.strictEqual(callArgs[1], [match.instanceOf(Function), secondInterval], `callArgs[1]`);
//     //         done();
//     //       }
//     //     ).catch(() => { done('Unexpected catch'); });
//     // });
//     //
//     // it('successfully returns without error if a retry succeeds', function(done) {
//     //   const firstResponse = new Response(null, { status: 500 });
//     //   const secondResponse = new Response(null, { status: 200 });
//     //
//     //   fetch.onCall(0).returns(Promise.resolve(firstResponse));
//     //   fetch.onCall(1).returns(Promise.resolve(secondResponse));
//     //
//     //   client.configure(config => config.rejectErrorResponses().withRetry({
//     //     maxRetries: 3,
//     //     interval: 1,
//     //     strategy: retryStrategy.fixed
//     //   }));
//     //
//     //   return client.fetch('path')
//     //     .then(
//     //       (r) => {
//     //         // 1 original call plus 1 retry
//     //         expect(fetch).to.have.callCount(2);
//     //         assert.strictEqual(r, secondResponse, `r`);
//     //         done();
//     //       },
//     //       () => done('retry was unsuccessful')
//     //      ).catch(() => { done('Unexpected catch'); });
//     // });
//   });

//   describe('isRequesting', function () {
//     it('is set to true when starting a request', function(done) {
//       fetch.returns(emptyResponse(200));

//       assert.strictEqual(client.isRequesting, 'Before start', false, `client.isRequesting, 'Before start'`);
//       const request = client.fetch('http://example.com/some/cool/path');
//       assert.strictEqual(client.isRequesting, 'When started', true, `client.isRequesting, 'When started'`);
//       request.then(() => {
//         expect(fetch).to.have.callCount(1);
//         done();
//       }).catch(() => { done('Unexpected catch'); });
//     });
//     it('is set to false when request is finished', function(done) {
//       fetch.returns(emptyResponse(200));

//       assert.strictEqual(client.isRequesting, 'Before start', false, `client.isRequesting, 'Before start'`);
//       const request = client.fetch('http://example.com/some/cool/path');
//       assert.strictEqual(client.isRequesting, 'When started', true, `client.isRequesting, 'When started'`);
//       request.then(() => {
//         assert.strictEqual(client.isRequesting, 'When finished', false, `client.isRequesting, 'When finished'`);
//       }).then(() => {
//         expect(fetch).to.have.callCount(1);
//         done();
//       }).catch(() => { done('Unexpected catch'); });
//     });
//     it('is still true when a request is still in progress', function(done) {
//       const firstResponse = emptyResponse(200);
//       const secondResponse = new Promise((resolve) => {
//         PLATFORM.setTimeout(() => { resolve(emptyResponse(200)); }, 200);
//       });

//       fetch.onCall(0).returns(firstResponse);
//       fetch.onCall(1).returns(secondResponse);
//       assert.strictEqual(client.isRequesting, 'Before start', false, `client.isRequesting, 'Before start'`);

//       const request1 = client.fetch('http://example.com/some/cool/path');
//       const request2 = client.fetch('http://example.com/some/cool/path');
//       assert.strictEqual(client.isRequesting, 'When started', true, `client.isRequesting, 'When started'`);
//       request1.then(() => {
//         assert.strictEqual(client.isRequesting, 'When request 1 is completed', true, `client.isRequesting, 'When request 1 is completed'`);
//       }).catch(() => { done('Unexpected catch'); });
//       PLATFORM.setTimeout(() => { assert.strictEqual(client.isRequesting, 'After 100ms', true); }, 100, `client.isRequesting, 'After 100ms'`);
//       request2.then(() => {
//         assert.strictEqual(client.isRequesting, 'When all requests are finished', false, `client.isRequesting, 'When all requests are finished'`);
//       }).then(() => {
//         expect(fetch).to.have.callCount(2);
//         done();
//       }).catch(() => { done('Unexpected catch'); });
//     });
//     it('is set to false when request is rejected', function(done) {
//       fetch.returns(Promise.reject(new Error('Failed to fetch')));

//       assert.strictEqual(client.isRequesting, 'Before start', false, `client.isRequesting, 'Before start'`);
//       client.fetch('http://example.com/some/cool/path').then(result => {
//         assert.notStrictEqual(result, result, `result`);
//       }).catch((result) => {
//         assert.strictEqual(result instanceof Error, true, `result instanceof Error`);
//         assert.strictEqual(result.message, 'Failed to fetch', `result.message`);
//         assert.strictEqual(client.isRequesting, 'When finished', false, `client.isRequesting, 'When finished'`);
//         return Promise.resolve();
//       }).then(() => {
//         expect(fetch).to.have.callCount(1);
//         done();
//       }).catch(() => { done('Unexpected catch'); });
//     });

//     // it('stays true during a series of retries', function(done) {
//     //   const response = new Response(null, { status: 500 });
//     //   fetch.returns(Promise.resolve(response));
//     //
//     //   client.configure(config => config.rejectErrorResponses().withRetry({
//     //     maxRetries: 3,
//     //     interval: 100
//     //   }));
//     //
//     //   assert.strictEqual(client.isRequesting, 'Before start', false, `client.isRequesting, 'Before start'`);
//     //   const request = client.fetch('path');
//     //   assert.strictEqual(client.isRequesting, 'When started', true, `client.isRequesting, 'When started'`);
//     //   PLATFORM.setTimeout(() => { assert.strictEqual(client.isRequesting, 'After 100ms', true); }, 100, `client.isRequesting, 'After 100ms'`);
//     //   PLATFORM.setTimeout(() => { assert.strictEqual(client.isRequesting, 'After 200ms', true); }, 200, `client.isRequesting, 'After 200ms'`);
//     //   request.then((result) => {
//     //     done('fetch did not error');
//     //   }).catch((r) => {
//     //     // 1 original call plus 3 retries
//     //     expect(fetch).to.have.callCount(4);
//     //     done();
//     //   });
//     // });
//     // it('is set to false after a series of retry that fail', function(done) {
//     //   const response = new Response(null, { status: 500 });
//     //   fetch.returns(Promise.resolve(response));
//     //
//     //   client.configure(config => config.rejectErrorResponses().withRetry({
//     //     maxRetries: 3,
//     //     interval: 100
//     //   }));
//     //
//     //   assert.strictEqual(client.isRequesting, 'Before start', false, `client.isRequesting, 'Before start'`);
//     //   const request = client.fetch('path');
//     //   assert.strictEqual(client.isRequesting, 'When started', true, `client.isRequesting, 'When started'`);
//     //   request.then((result) => {
//     //     done('fetch did not error');
//     //   }).catch(() => {
//     //     // 1 original call plus 3 retries
//     //     expect(fetch).to.have.callCount(4);
//     //     assert.strictEqual(client.isRequesting, 'When finished', false, `client.isRequesting, 'When finished'`);
//     //     done();
//     //   });
//     // });
//     it('is set to false after a series of retry that fail that succeed', function(done) {
//       const firstResponse = new Response(null, { status: 500 });
//       const secondResponse = new Response(null, { status: 200 });

//       fetch.onCall(0).returns(Promise.resolve(firstResponse));
//       fetch.onCall(1).returns(Promise.resolve(secondResponse));

//       client.configure(config => config.rejectErrorResponses().withRetry({
//         maxRetries: 3,
//         interval: 1,
//         strategy: retryStrategy.fixed
//       }));

//       assert.strictEqual(client.isRequesting, 'Before start', false, `client.isRequesting, 'Before start'`);
//       const request = client.fetch('path');
//       assert.strictEqual(client.isRequesting, 'When started', true, `client.isRequesting, 'When started'`);
//       request.then(() => {
//         // 1 original call plus 1 retry
//         expect(fetch).to.have.callCount(2);
//         assert.strictEqual(client.isRequesting, 'When finished', false, `client.isRequesting, 'When finished'`);
//         done();
//       }).catch((result) => {
//         done('fetch did error');
//       });
//     });
//     it('forward requests', function(done) {
//       const path = 'retry';
//       let retry = 3;
//       fetch.returns(Promise.reject(new Response(null, { status: 500 })));
//       const interceptor: Interceptor = {
//         response(r) { return r; },
//         responseError(r) {
//           if (retry--) {
//             return client.fetch(client.buildRequest(path, {}));
//           } else {
//             throw r;
//           }
//         }
//       };
//       stub(interceptor, 'response').callThrough();
//       stub(interceptor, 'responseError').callThrough();

//       client.interceptors.push(interceptor);

//       // add check before fetch, this one passes.
//       assert.strictEqual(client.isRequesting, false, `client.isRequesting`);

//       client.fetch(path)
//         .catch(() => {
//           expect(interceptor.response).not.to.have.callCount(1);
//           expect(interceptor.responseError).to.have.been.calledWith(match.instanceOf(Response), match.instanceOf(Request), client);
//           expect(fetch).to.have.callCount(4);
//           assert.strictEqual(client.activeRequestCount, 0, `client.activeRequestCount`);
//           assert.strictEqual(client.isRequesting, false, `client.isRequesting`);
//           done();
//         });
//     });
//   });
// });

// function emptyResponse(status: number) {
//   return Promise.resolve(new Response(null, { status }));
// }
