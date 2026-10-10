---
"@aurelia/fetch-client": patch
---

Fix the retry interceptor's handling of cancelled and replayed requests. An aborted request is no longer retried, and `doRetry` is not called for it. Aborting during the retry delay or while `beforeRetry` is pending now settles the call straight away and skips the hook. A `Request` returned from `beforeRetry` keeps the retry state and the caller's abort signal. Without a `doRetry` callback, only idempotent methods (GET, HEAD, OPTIONS, PUT, DELETE) are retried by default; POST and PATCH are no longer retried unless `doRetry` opts them in. Closes #2502.

pr: #2554
