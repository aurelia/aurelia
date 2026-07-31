---
"@aurelia/vite-plugin": minor
---

Add Vite 8 support to the Aurelia Vite plugin. Convention-based components and standard decorators now work correctly with Vite's Oxc transform, including in HMR, web workers, and TSX applications. Vite 7 keeps its existing behavior.

Projects using legacy TypeScript decorators or incompatible custom Oxc settings now receive a clear error with guidance on how to configure their build.
