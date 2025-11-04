# Integrating Web Workers with Vite + Aurelia 2

Web Workers keep expensive computations off Aurelia’s main thread. The current Aurelia starter uses Vite, which natively supports bundling workers via the [`new Worker(new URL(...), { type: 'module' })`](https://vitejs.dev/guide/features.html#importing-workers) pattern. The following steps show how to add a TypeScript worker, exchange messages safely, and keep TypeScript aware of worker modules.

## 1. Ensure TypeScript knows about worker APIs

Update `tsconfig.json` (or `tsconfig.app.json`) so the `lib` array includes `webworker` alongside `dom`:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext", "webworker"],
    "types": []
  }
}
```

This gives the worker file access to `self`, `postMessage`, and related types without pulling in Node globals.

## 2. Create a worker entry file

```ts
// src/workers/fibonacci.worker.ts
/// <reference lib="webworker" />

function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

self.onmessage = (event: MessageEvent<number>) => {
  const input = event.data;
  const result = fibonacci(input);
  self.postMessage(result);
};
```

## 3. Wrap worker creation for DI-friendly usage

Vite exposes worker URLs via `new URL('./file', import.meta.url)`. Export a factory that returns a strongly typed worker instance:

```ts
// src/workers/create-fibonacci-worker.ts
export function createFibonacciWorker(): Worker {
  return new Worker(new URL('./fibonacci.worker.ts', import.meta.url), {
    type: 'module',
  });
}
```

## 4. Declare a module type for worker imports (optional)

If your tooling complains when importing worker URLs, add a declaration file:

```ts
// src/types/worker.d.ts
declare module '*?worker&inline' {
  const workerConstructor: { new(): Worker };
  export default workerConstructor;
}
```

(With the `new URL('./worker', import.meta.url)` pattern this is usually unnecessary, but keep the declaration if your editor requires it.)

## 5. Use the worker inside an Aurelia component

```ts
// src/components/my-component.ts
import { ICustomElementViewModel } from 'aurelia';
import { createFibonacciWorker } from '../workers/create-fibonacci-worker';

export class MyComponent implements ICustomElementViewModel {
  result: number | null = null;
  private worker: Worker | null = null;

  startWorker(input: number) {
    this.disposeWorker();
    this.worker = createFibonacciWorker();
    this.worker.onmessage = (ev: MessageEvent<number>) => {
      this.result = ev.data;
      this.disposeWorker();
    };
    this.worker.onerror = (err) => {
      console.error('Worker error', err);
      this.disposeWorker();
    };
    this.worker.postMessage(input);
  }

  detaching() {
    this.disposeWorker();
  }

  private disposeWorker() {
    this.worker?.terminate();
    this.worker = null;
  }
}
```

```html
<!-- src/components/my-component.html -->
<template>
  <input type="number" value.bind="userInput" debounce="200">
  <button click.trigger="startWorker(+userInput || 0)">Calculate Fibonacci</button>
  <p if.bind="result !== null">Worker result: ${result}</p>
</template>
```

## 6. Sharing types between main thread and worker

Create a shared interface so both sides agree on message shapes:

```ts
// src/workers/messages.ts
export type WorkerRequest = { kind: 'fibonacci'; value: number };
export type WorkerResponse = { kind: 'fibonacci'; result: number };
```

Use those types inside the worker and component for additional safety.

## 7. Debugging tips

- Use `worker.postMessage({})` only with structured-cloneable data (objects, ArrayBuffers, typed arrays). Avoid functions or DOM nodes.
- Workers live in their own file scope—import only what you need. Vite will tree-shake unused code.
- If you need multiple workers, create helper factories (`createImageWorker`, `createSearchWorker`, etc.) so components can spin them up lazily.

With this Vite-native worker setup, you avoid legacy webpack `worker-loader` plugins and keep Aurelia’s main thread responsive during heavy computations.
