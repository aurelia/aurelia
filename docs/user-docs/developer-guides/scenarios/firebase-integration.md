# Firebase Integration

Integrate Firebase into your Aurelia 2 application for authentication, Cloud Firestore, and cloud storage using the current modular Firebase JavaScript SDK. This recipe shows a minimal-yet-production-ready setup that honors Aurelia's dependency injection patterns and Firebase's best practices.

## Prerequisites
- Aurelia 2 workspace (the Vite + TypeScript starter works great)
- Node and npm versions that match the Aurelia workspace template (use `npm run env` in the root if you need to confirm)
- Firebase project with the following enabled in the console:
  - Web App registration (App ID + config object)
  - Authentication → Email/Password provider
  - Cloud Firestore (in Production mode) and a ruleset drafted for your app
- Optional but recommended: Firebase Emulator Suite configured locally

## Install the Firebase SDK

Install the modular SDK and (optionally) the CLI for emulators/deploys:

```bash
npm install firebase
npm install -D firebase-tools
```

## Configure environment secrets

Firebase config values should never be hard-coded. With the Vite-powered Aurelia starter, define them in `.env.local` (never commit this file):

```dotenv
# .env.local
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=my-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-app
VITE_FIREBASE_STORAGE_BUCKET=my-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
VITE_USE_FIREBASE_EMULATORS=false # flip to true locally if you run emulators
```

Then expose a typed config object:

```typescript
// src/environment.ts
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY!,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN!,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID!,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
  appId: import.meta.env.VITE_FIREBASE_APP_ID!,
} as const;
```

## Central Firebase service (DI-friendly)

Create a singleton service that initializes Firebase exactly once, exposes Auth + Firestore, and opts into IndexedDB persistence for offline support.

```typescript
// src/services/firebase.ts
import { DI, Registration } from '@aurelia/kernel';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type Auth,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';
import { firebaseConfig } from '../environment';

export const IFirebaseService = DI.createInterface<IFirebaseService>('IFirebaseService');

export interface IFirebaseService {
  readonly app: FirebaseApp;
  readonly auth: Auth;
  readonly db: Firestore;
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  onAuthChange(callback: (user: User | null) => void): () => void;
}

export class FirebaseService implements IFirebaseService {
  public readonly app: FirebaseApp;
  public readonly auth: Auth;
  public readonly db: Firestore;

  public constructor() {
    this.app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    setPersistence(this.auth, browserLocalPersistence).catch((err) => {
      console.warn('Falling back to default auth persistence', err);
    });

    this.db = getFirestore(this.app);
    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(this.db).catch((err) => {
        console.warn('Firestore persistence unavailable', err);
      });
    }

    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
      connectAuthEmulator(this.auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(this.db, '127.0.0.1', 8080);
    }
  }

  public async login(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(this.auth, email, password);
    return user;
  }

  public logout(): Promise<void> {
    return signOut(this.auth);
  }

  public onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback);
  }
}

export const FirebaseServiceRegistration = Registration.singleton(IFirebaseService, FirebaseService);
```

## Register the service

```typescript
// src/main.ts
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { FirebaseServiceRegistration } from './services/firebase';
import { MyApp } from './my-app';

await new Aurelia()
  .register(StandardConfiguration, FirebaseServiceRegistration)
  .app({ host: document.querySelector('my-app')!, component: MyApp })
  .start();
```

## Email/password authentication component

```typescript
// src/components/login.ts
import { customElement } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';
import type { User } from 'firebase/auth';
import { IFirebaseService } from '../services/firebase';

@customElement('login')
export class Login {
  email = '';
  password = '';
  user: User | null = null;
  error = '';

  private readonly firebase = resolve(IFirebaseService);
  private disposeAuth?: () => void;

  binding() {
    this.disposeAuth = this.firebase.onAuthChange((user) => {
      this.user = user;
    });
  }

  unbinding() {
    this.disposeAuth?.();
  }

  async login() {
    try {
      this.error = '';
      const user = await this.firebase.login(this.email, this.password);
      console.log('Logged in:', user.email);
    } catch (error: any) {
      this.error = error.message;
    }
  }

  logout() {
    return this.firebase.logout();
  }
}
```

```html
<!-- src/components/login.html -->
<div class="login-form">
  <div if.bind="!user">
    <input value.bind="email" placeholder="Email" type="email" autocomplete="email">
    <input value.bind="password" placeholder="Password" type="password" autocomplete="current-password">
    <button click.trigger="login()" disabled.bind="!email || !password">
      Login
    </button>
    <div if.bind="error" class="error">${error}</div>
  </div>
  
  <div if.bind="user">
    <p>Welcome, ${user.email}!</p>
    <button click.trigger="logout()">Logout</button>
  </div>
</div>
```

## Firestore-backed todo list

```typescript
// src/components/todo-list.ts
import { customElement } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { IFirebaseService } from '../services/firebase';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

@customElement('todo-list')
export class TodoList {
  todos: Todo[] = [];
  newTodoText = '';

  private readonly firebase = resolve(IFirebaseService);
  private unsubscribe?: Unsubscribe;

  attaching() {
    const todosRef = collection(this.firebase.db, 'todos');
    const todosQuery = query(todosRef, orderBy('createdAt', 'desc'));

    this.unsubscribe = onSnapshot(todosQuery, (snapshot) => {
      this.todos = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const createdAt = (data.createdAt as Timestamp | undefined)?.toDate() ?? new Date();
        return {
          id: docSnap.id,
          text: data.text as string,
          completed: Boolean(data.completed),
          createdAt,
        } satisfies Todo;
      });
    }, (error) => {
      console.error('Firestore listener error', error);
    });
  }

  detaching() {
    this.unsubscribe?.();
  }

  async addTodo() {
    if (!this.newTodoText.trim()) return;
    try {
      await addDoc(collection(this.firebase.db, 'todos'), {
        text: this.newTodoText.trim(),
        completed: false,
        createdAt: serverTimestamp(),
      });
      this.newTodoText = '';
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  }

  async deleteTodo(todoId: string) {
    try {
      await deleteDoc(doc(this.firebase.db, 'todos', todoId));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }
}
```

```html
<!-- src/components/todo-list.html -->
<div class="todo-list">
  <div class="add-todo">
    <input value.bind="newTodoText" placeholder="Add new todo"
           keyup.trigger="$event.key === 'Enter' && addTodo()">
    <button click.trigger="addTodo()" disabled.bind="!newTodoText.trim()">
      Add
    </button>
  </div>
  
  <ul class="todos">
    <li repeat.for="todo of todos" class="todo-item">
      <span class="todo-text">${todo.text}</span>
      <span class="todo-date">${todo.createdAt.toLocaleString()}</span>
      <button click.trigger="deleteTodo(todo.id)" class="delete-btn">
        Delete
      </button>
    </li>
  </ul>
  
  <div if.bind="todos.length === 0" class="empty-state">
    No todos yet. Add one above!
  </div>
</div>
```

## Sync Firebase with @aurelia/state

Use `@aurelia/state` when you want Firebase-authenticated users and Firestore documents to feed a single app-wide state tree that templates can bind to with `.state` and `.dispatch`.

```bash
npm install @aurelia/state
```

### Define the global state

```typescript
// src/state/app-state.ts
import type { User } from 'firebase/auth';
import type { Todo } from '../components/todo-list';

export interface AppState {
  user: User | null;
  todos: Todo[];
  status: 'idle' | 'loading' | 'error';
  error?: string;
}

export const initialState: AppState = {
  user: null,
  todos: [],
  status: 'idle',
  error: undefined,
};

export type AppAction =
  | { type: 'userChanged'; user: User | null }
  | { type: 'todosSynced'; todos: Todo[] }
  | { type: 'statusChanged'; status: AppState['status']; error?: string };

export function appStateHandler(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'userChanged':
      return { ...state, user: action.user };
    case 'todosSynced':
      return { ...state, todos: action.todos };
    case 'statusChanged':
      return { ...state, status: action.status, error: action.error };
    default:
      return state;
  }
}
```

### Register the store next to Firebase

```typescript
// src/main.ts
import { Aurelia, StandardConfiguration, AppTask } from '@aurelia/runtime-html';
import { StateDefaultConfiguration, IStore } from '@aurelia/state';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import type { Todo } from './components/todo-list';
import { FirebaseServiceRegistration, IFirebaseService } from './services/firebase';
import { initialState, appStateHandler } from './state/app-state';
import { MyApp } from './my-app';

await new Aurelia()
  .register(
    StandardConfiguration,
    FirebaseServiceRegistration,
    StateDefaultConfiguration.init(initialState, appStateHandler),
    AppTask.activated(IStore, IFirebaseService, (store, firebase) => {
      const disposeAuth = firebase.onAuthChange((user) => store.dispatch({ type: 'userChanged', user }));

      const todosRef = query(collection(firebase.db, 'todos'), orderBy('createdAt', 'desc'));
      const unsubscribeTodos = onSnapshot(todosRef, (snapshot) => {
        const todos = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const createdAt = (data.createdAt as Timestamp | undefined)?.toDate() ?? new Date();
          return {
            id: docSnap.id,
            text: data.text as string,
            completed: Boolean(data.completed),
            createdAt,
          } satisfies Todo;
        });
        store.dispatch({ type: 'todosSynced', todos });
      });

      return () => {
        disposeAuth();
        unsubscribeTodos();
      };
    })
  )
  .app({ host: document.querySelector('my-app')!, component: MyApp })
  .start();
```

### Bind templates directly to the store

Because the state lives in a central store, any component can consume it without managing its own Firestore subscription:

```html
<!-- src/components/dashboard.html -->
<section>
  <p>Logged in as ${user?.email & state}</p>

  <ul>
    <li repeat.for="todo of todos & state">
      <span>${todo.text}</span>
      <button click.dispatch="{ type: 'statusChanged', status: 'loading' }">Set Loading</button>
    </li>
  </ul>
</section>
```

Use `.state` or `& state` wherever you would normally bind to local view-model fields. All Firebase updates flow through the store exactly once, which keeps components simple and makes it trivial to add middleware (analytics, logging, optimistic updates, etc.).

## Firestore security rules (minimal example)

```text
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /todos/{todoId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Tighten the predicate to match your data model (e.g., ensure a `ownerId` matches `request.auth.uid`). Always test rule changes in the Emulator Suite before deploying.

## Local development & testing

1. Authenticate the CLI once: `npx firebase login`.
2. Configure emulators: `npx firebase init emulators --only firestore,auth`.
3. Start them alongside Aurelia:
   ```bash
   npm run dev    # Aurelia/Vite
   npx firebase emulators:start
   ```
4. Point the SDKs to emulators during development (set `VITE_USE_FIREBASE_EMULATORS=true` in `.env.local` so the service snippet can detect it):
   ```typescript
   import { connectAuthEmulator } from 'firebase/auth';
   import { connectFirestoreEmulator } from 'firebase/firestore';

   if (import.meta.env.DEV) {
     connectAuthEmulator(this.auth, 'http://127.0.0.1:9099');
     connectFirestoreEmulator(this.db, '127.0.0.1', 8080);
   }
   ```

## Additional best practices

- Use `serverTimestamp()` (as shown) so writes rely on Google time instead of client clocks.
- Prefer `query` + `orderBy` with indexes over client-side filtering to avoid hot documents.
- Clean up listeners (`unsubscribe`) whenever components detach to prevent memory leaks.
- Keep Firebase config in environment files and rotate API keys if compromised.
- Run `npm run build` and `npm run test` with the Emulator Suite before deploying new rules.

This integration pattern keeps Firebase initialization isolated, leans on Aurelia's DI system, and follows modern Firebase recommendations for security, offline resilience, and testing.
