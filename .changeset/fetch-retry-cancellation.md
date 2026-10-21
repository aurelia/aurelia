---
"@aurelia/fetch-client": patch
---

- Stop retrying aborted requests, cancel retry delays promptly, and check cancellation after awaited retry callbacks before proceeding.
- Preserve retry state and the caller's abort signal when `beforeRetry` returns a replacement `Request`.
- Retry only GET, HEAD, OPTIONS, PUT, and DELETE by default; POST and PATCH require `doRetry` opt-in.

Closes #2502.

pr: #2554
