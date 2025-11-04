---
description: Scenario-based patterns for @aurelia/state and @aurelia/store so you can solve common state challenges quickly.
---

# State Management Outcome Recipes

Use these guides when you know the behavior you want and need the exact combination of actions, middleware, and bindings to deliver it.

## 1. Optimistic updates with rollback

**Goal:** Update the UI instantly when a user edits data and roll back if the server rejects the change.

### Steps

1. Model the optimistic action so it records the previous value alongside the new value:
   ```typescript
   type AppState = { todos: Todo[] };

   export const updateTodo = (state: AppState, { id, patch }: { id: string; patch: Partial<Todo> }) => {
     return {
       ...state,
       todos: state.todos.map(todo => todo.id === id ? { ...todo, ...patch } : todo)
     };
   };
   ```
2. Dispatch the optimistic action before the API call:
   ```typescript
   const store = resolve(IStore<AppState>);

   async function saveTodo(todo: Todo) {
     const previous = structuredClone(todo);
     store.dispatch(updateTodo, { id: todo.id, patch: { title: todo.title } });

     try {
       await api.save(todo);
     } catch (error) {
       store.dispatch(updateTodo, { id: todo.id, patch: previous });
       notifications.error('Saving failed, changes were reverted');
       throw error;
     }
   }
   ```
3. Show a subtle status indicator (for example, `todo.pending = true`) by including an extra field in the patch and clearing it once the API responds.

### Checklist

- The UI reflects edits immediately, even before the API responds.
- Failed requests reapply the previous state via a second dispatch.
- Users see a toast or inline message when a rollback happens.

## 2. Persist slices of state to IndexedDB

**Goal:** Remember part of the global state between sessions without blocking the main thread.

### Steps

1. Create a persistence middleware:
   ```typescript
   import { MiddlewarePlacement, StoreMiddleware } from '@aurelia/state';

   const persistMiddleware: StoreMiddleware = store => next => action => {
     const result = next(action);
     const snapshot = store.getState();
     const subset = { filters: snapshot.filters };
     indexedDBStorage.save('app-cache', subset);
     return result;
   };
   ```
2. Hydrate the initial state from storage before registering the plugin:
   ```typescript
   const persisted = await indexedDBStorage.load('app-cache');
   const initialState = { ...defaultState, ...persisted };

   Aurelia.register(StateDefaultConfiguration.init(initialState, {
     middlewares: [{ middleware: persistMiddleware, placement: MiddlewarePlacement.After }]
   }, actionHandlers));
   ```

### Checklist

- Reloading the app restores the persisted filters without hitting the server.
- Only the desired slice is stored (inspect IndexedDB to confirm).
- Middleware placement `After` ensures the state snapshot reflects the latest changes.

## 3. Time-travel debugging / replay

**Goal:** Record every dispatched action so developers can scrub through state history or reproduce bugs.

### Steps

1. Add a logging middleware that pushes actions and snapshots into an array:
   ```typescript
   const timeline: { action: any; state: AppState }[] = [];

   const recordMiddleware: StoreMiddleware = store => next => action => {
     const result = next(action);
     timeline.push({ action, state: store.getState() });
     return result;
   };
   ```
2. Expose helper functions on a debugging service:
   ```typescript
   export class TimelineService {
     jumpTo(index: number) {
       const snapshot = timeline[index];
       if (snapshot) {
         store.dispatch(setState, snapshot.state);
       }
     }

     get entries() {
       return timeline;
     }
   }
   ```
3. Optionally wire it to Redux DevTools by enabling the built-in devtools middleware in `StateDefaultConfiguration` or `StoreConfiguration`.

### Checklist

- Timeline entries display in the browser console (or DevTools) for each dispatch.
- Calling `jumpTo(n)` restores the exact state at that point.
- Production builds can disable the middleware to reduce memory usage.

## 4. Micro-frontend friendly shared store

**Goal:** Let multiple Aurelia apps on the same page share a single store instance without clobbering each other.

### Steps

1. Create the store in a shared module and export the configured instance:
   ```typescript
   const configured = StoreDefaultConfiguration.init(initialState, actionHandlers);
   export const SharedStore = configured.register(new Container());
   ```
2. In each micro-frontend, register the already configured store instead of creating a new one:
   ```typescript
   Aurelia.register(SharedStore);
   ```
3. Namespaces actions or use tags to avoid collisions when different teams add handlers.

### Checklist

- All micro-frontends react to state changes regardless of which app dispatched the action.
- Only one store instance exists (inspect via logging middleware).
- Unmounting one micro-frontend leaves the store intact for the others.

## 5. Server-side pagination cache

**Goal:** Cache page results as users paginate through a large list so returning to earlier pages does not re-fetch data.

### Steps

1. Extend your state shape with a page cache and metadata:
   ```typescript
   interface AppState { pageCache: Record<number, User[]>; currentPage: number; }

   export const storePage = (state: AppState, { page, data }: { page: number; data: User[] }) => ({
     ...state,
     currentPage: page,
     pageCache: { ...state.pageCache, [page]: data }
   });
   ```
2. In your view-model, consult the cache before calling the API:
   ```typescript
   const cached = store.getState().pageCache[page];
   if (cached) {
     return cached;
   }

   const data = await api.fetchUsers(page);
   store.dispatch(storePage, { page, data });
   ```
3. Optionally add a `lastFetched` timestamp per page so you can invalidate stale entries.

### Checklist

- Navigating back to a previous page renders instantly without network calls.
- Cache invalidation logic (timestamp or manual clear) keeps data fresh when needed.
- The global state clearly indicates which page is currently shown.

## 6. Live WebSocket feed reducer

**Goal:** Keep a list of items in sync with a WebSocket stream while reusing the same dispatch pipeline.

### Steps

1. Create an action that inserts or updates items when messages arrive:
   ```typescript
   export const upsertQuote = (state: AppState, quote: Quote) => ({
     ...state,
     quotes: { ...state.quotes, [quote.id]: quote }
   });
   ```
2. Subscribe to the WebSocket once (for example in an `AppTask` or service) and dispatch on every message:
   ```typescript
   const socket = new WebSocket('/quotes');
   socket.addEventListener('message', event => {
     const quote = JSON.parse(event.data) as Quote;
     store.dispatch(upsertQuote, quote);
   });
   ```
3. Return a cleanup handle so you can close the socket when the app tears down.

### Checklist

- The state updates in near real time as messages arrive.
- Unmounting the feature (or navigating away) closes the socket to avoid leaks.
- UI bindings use `.state` or selectors so they react automatically to each dispatch.

## Reference material

- [State plugin guide](./state.md)
- [Store plugin guide](./store/README.md)
- [Middleware](./store/middleware.md)
- [Configuration and setup](./store/configuration-and-setup.md)
