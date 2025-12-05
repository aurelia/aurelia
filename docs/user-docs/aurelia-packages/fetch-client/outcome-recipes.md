---
description: Scenario-based patterns for @aurelia/fetch-client that solve common API challenges like auth, caching, and uploads.
---

# Fetch Client Outcome Recipes

Use these patterns when you know the experience you want - resilient API calls, cache-friendly dashboards, or abortable uploads - and need the exact configuration steps.

## 1. Token-aware API client with automatic retries

**Goal:** Add an Authorization header to every request, refresh expired tokens, and retry transient 5xx errors with exponential backoff.

### Steps

1. Configure the shared `IHttpClient` once during app startup:
   ```typescript
   import { IHttpClient } from '@aurelia/fetch-client';
   import { resolve } from '@aurelia/kernel';

   const http = resolve(IHttpClient);

   http.configure(config => config
     .withBaseUrl('https://api.example.com/')
     .withDefaults({
       headers: {
         'Content-Type': 'application/json'
       }
     })
     .withRetry({
       maxRetries: 3,
       strategy: RetryStrategy.exponential,
       interval: 2000,
       doRetry: (error) => error.status >= 500
     })
     .withInterceptor({
       request(request) {
         request.headers.set('Authorization', `Bearer ${tokenStore.current}`);
         return request;
       },
       async responseError(error, request, client) {
         if (error.status === 401) {
           await tokenStore.refresh();
           return client.fetch(request);
         }
         throw error;
       }
     })
     .rejectErrorResponses()
   );
   ```
2. Use helper methods (`http.get`, `http.post`, etc.) everywhere else - each call now benefits from the shared interceptors and retry policy.

### Checklist

- Expired tokens trigger exactly one refresh and replay of the original request.
- 5xx responses retry with exponential delays, verified by watching network logs.
- `http.rejectErrorResponses()` makes failed HTTP status codes reject Promises so callers can `catch` them.

## 2. Stale-while-revalidate dashboards

**Goal:** Cache GET responses for a few minutes, immediately serve stale data if needed, and refresh in the background so dashboards feel instant.

### Steps

1. Instantiate the cache interceptor via DI (it needs access to `ICacheService`):
   ```typescript
   import { CacheInterceptor } from '@aurelia/fetch-client';
   import { resolve } from '@aurelia/kernel';

   const cacheInterceptor = resolve(CacheInterceptor, [{
     cacheTime: 300_000,        // keep entries for 5 minutes
     staleTime: 30_000,         // mark as stale after 30s
     refreshStaleImmediate: true,
     refreshInterval: 60_000    // background refresh every minute
   }]);
   ```
2. Register the interceptor when configuring the client:
   ```typescript
   http.configure(config => config.withInterceptor(cacheInterceptor));
   ```
3. Fetch dashboards via `http.get('/dashboards/overview')` - the interceptor handles cache reads or writes.

### Checklist

- First load hits the network; subsequent loads within `cacheTime` resolve instantly.
- When the cache is stale, users see cached data immediately and fresh data appears shortly after (refresh interval logs confirm the background fetch).
- Non-GET requests bypass the cache automatically.

## 3. Abortable uploads with progress feedback

**Goal:** Let users cancel long uploads and show progress using the same client instance.

### Steps

1. Build a wrapper that creates an `AbortController` per upload:
   ```typescript
   export class UploadService {
     private http = resolve(IHttpClient);

     upload(file: File, onProgress: (percent: number) => void) {
       const controller = new AbortController();
       const body = new FormData();
       body.append('file', file);

       const request = new Request('/files', {
         method: 'POST',
         body,
         signal: controller.signal
       });

       const trackedUpload = this.http.fetch(request)
         .then(response => response.json());

       return { cancel: () => controller.abort(), ready: trackedUpload };
     }
   }
   ```
2. Use the browser’s upload progress events (e.g., XHR or a custom uploader) if you need granular progress numbers; Fetch itself does not emit upload progress, but you can still expose a spinner tied to `http.isRequesting` or the `activeRequestCount`.

### Checklist

- Calling `cancel()` triggers `AbortError`, which you can catch to reset UI state.
- `http.isRequesting` flips to `true` while uploads run, so global loading indicators stay accurate.
- Multiple uploads in parallel each get their own controller, preventing accidental cross-cancellation.

## 4. Time-boxed requests with automatic timeout

**Goal:** Cancel any request that takes longer than a threshold (for example, 8 seconds) and show a friendly timeout message.

### Steps

1. Wrap `http.fetch` so each call gets an `AbortController` plus a timeout:
   ```typescript
   function fetchWithTimeout(input: RequestInfo, init: RequestInit = {}, timeoutMs = 8000) {
     const controller = new AbortController();
     const timeout = setTimeout(() => controller.abort(), timeoutMs);
     const request = new Request(input, { ...init, signal: controller.signal });

     return resolve(IHttpClient).fetch(request)
       .finally(() => clearTimeout(timeout));
   }
   ```
2. Use it wherever you need snappy UX:
   ```typescript
   try {
     const response = await fetchWithTimeout('/reports/slow');
     return await response.json();
   } catch (error) {
     if (error.name === 'AbortError') {
       toast.show('Request timed out, please try again');
     }
     throw error;
   }
   ```

### Checklist

- Requests that exceed the timeout trigger `AbortError` and can be handled centrally.
- Successful responses clear the timeout to avoid leaks.
- Global loading indicators drop immediately after the abort because `http.isRequesting` returns to `false`.

## 5. Correlated requests with logging

**Goal:** Attach a unique correlation ID to every request for troubleshooting and log response times without sprinkling code across services.

### Steps

1. Add an interceptor that stamps IDs and measures duration (store timings in a `WeakMap` so you can read them later):
   ```typescript
   const timings = new WeakMap<Request, { id: string; start: number }>();

   http.configure(config => config.withInterceptor({
     request(request) {
       const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
       const start = performance.now();
       timings.set(request, { id, start });
       request.headers.set('X-Request-Id', id);
       return request;
     },
     response(response, request) {
       const timing = request ? timings.get(request) : null;
       if (request && timing) {
         const elapsed = (performance.now() - timing.start).toFixed(1);
         console.info(`[${timing.id}] ${response.status} ${response.url} in ${elapsed}ms`);
         timings.delete(request);
       }
       return response;
     }
   }));
   ```
   > If your server needs to read the correlation ID, emit the header from the request before forwarding it upstream.
2. Consume the logs in your monitoring system or browser console.

### Checklist

- Every network call carries an `X-Request-Id` header visible in browser dev tools.
- Logs show the correlation ID, status, URL, and elapsed time.
- The interceptor lives in one place, so adding fields (tenant, locale) is straightforward.

## Pattern picker

| Outcome | Key APIs |
| --- | --- |
| Resilient, authenticated API calls | `withInterceptor`, `withRetry`, `rejectErrorResponses` |
| Instant dashboards with background refresh | `CacheInterceptor`, custom cache configuration, `withInterceptor` |
| Abortable uploads | `AbortController`, `http.fetch`, `http.isRequesting` |
| Time-boxed requests | `AbortController`, manual timeout wrapper |
| Correlated logging | Custom interceptors, request headers |

See the rest of the fetch-client docs for deep dives:
- [Setup & configuration](./setting-up.md)
- [Interceptors](./interceptors.md)
- [Caching](./caching.md)
- [Abort controller](./abort-controller.md)
