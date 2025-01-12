# Type-check webpack e2e

## To run

- Use webpack

```
npm run dev
```

- Use vite

```
npm run dev:vite
```

The app uses `router-lite` by default. To use `router`, add the following querystring `?use-router=true` to the browser URL and load the page.

## To test

Ideally, we want to inspect the heap snapshots to see if there are any detached routed components. However, it seems that for now it is bit complicated; refer the spec file for the work, done so far. At this point, investing time on inspecting the heap snapshots has a diminishing return. We can revisit this later. Hence, this e2e project is not a part of the CI, as of now.
