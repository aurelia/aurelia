---
"@aurelia/runtime-html": minor
"@aurelia/fetch-client": minor
---

Add `ITransferState` so data loaded during a server render reaches the client through a `<script id="au-state">` element, and `TransferCacheInterceptor` to replay recorded `GET`/`HEAD` responses. Hydration no longer flashes back to a loading state or requests the same data again. Closes #2535.

pr: #2574
