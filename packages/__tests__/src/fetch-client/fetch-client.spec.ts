import { resolve } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';
import { assert, createFixture } from '@aurelia/testing';
import { isNode } from '../util.js';

describe('fetch-client/fetch-client.spec.ts', function () {
  if (isNode()) {
    return;
  }

  const originalFetchFn = window.fetch;
  let mockFetchFn: any;
  beforeEach(function () {
    window.fetch = function (...args: any[]) {
      return mockFetchFn?.(...args as Parameters<typeof fetch>);
    };
    mockFetchFn = function (request: Request) {
      return { request, url: request.url.replace(location.origin, '') };
    };
  });

  afterEach(function () {
    window.fetch = originalFetchFn;
  });

  it('works when injecting IHttpClient', async function () {
    const { component } = createFixture('${message}', class App {
      http = resolve(IHttpClient);
    });

    assert.deepStrictEqual(
      await component.http.fetch('/a'),
      { request: new Request('/a'), url: '/a' }
    );
  });
});
