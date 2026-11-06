---
"@aurelia/fetch-client": patch
---

A default `Content-Type` header no longer replaces the content type of `FormData`, `URLSearchParams` and typed `Blob` request bodies. The dev warning about a lowercase `content-type` default fires only when the default key is lowercase.
