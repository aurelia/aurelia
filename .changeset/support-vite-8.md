---
"@aurelia/vite-plugin": minor
---

The Aurelia Vite plugin now supports Vite 8. Convention-based components and TC39 decorators work correctly with Vite's Oxc transform, including in HMR, SSR, web workers, and TSX applications. Vite 7 retains its existing behavior.

Projects using legacy TypeScript decorators or incompatible custom Oxc settings now receive a clear error with guidance on how to configure their build.
