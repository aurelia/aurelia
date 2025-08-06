# Firebase Integration

Integrate Firebase into your Aurelia 2 application for real-time data, authentication, and cloud storage using Firebase's modular SDK.

## Prerequisites
- Aurelia 2 project
- Firebase project setup
- Firebase configuration details

## Installation

```bash
npm install firebase
```

## Configuration

### Environment Variables
Add Firebase config to your environment:

```typescript
// src/environment.ts
export const environment = {
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  }
};
```

### Firebase Service
Create a Firebase service with proper DI integration:

```typescript
// src/services/firebase.ts
import { DI, Registration } from '@aurelia/kernel';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInWithEmailAndPassword, signOut, User, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { environment } from '../environment';

export const IFirebaseService = DI.createInterface<IFirebaseService>('IFirebaseService');

export interface IFirebaseService {
  readonly app: FirebaseApp;
  readonly auth: Auth;
  readonly db: Firestore;
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}

export class FirebaseService implements IFirebaseService {
  readonly app: FirebaseApp;
  readonly auth: Auth;
  readonly db: Firestore;

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
  }

  async login(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    return result.user;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback);
  }
}

export const FirebaseServiceRegistration = Registration.singleton(IFirebaseService, FirebaseService);
```

## Register Service

Register the Firebase service in your main application:

```typescript
// src/main.ts
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { FirebaseServiceRegistration } from './services/firebase';
import { MyApp } from './my-app';

const au = new Aurelia()
  .register(
    StandardConfiguration,
    FirebaseServiceRegistration
  );

au.app({ host: document.querySelector('my-app'), component: MyApp });
await au.start();
```

## Authentication Component

```typescript
// src/components/login.ts
import { customElement } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';
import { IFirebaseService } from '../services/firebase';

@customElement('login')
export class Login {
  email = '';
  password = '';
  user: any = null;
  error = '';

  private readonly firebase: IFirebaseService = resolve(IFirebaseService);

  constructor() {
    // Listen for auth state changes
    this.firebase.onAuthStateChanged(user => {
      this.user = user;
    });
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

  async logout() {
    await this.firebase.logout();
  }
}
```

```html
<!-- src/components/login.html -->
<div class="login-form">
  <div if.bind="!user">
    <input value.bind="email" placeholder="Email" type="email">
    <input value.bind="password" placeholder="Password" type="password">
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

## Firestore Data Component

```typescript
// src/components/todo-list.ts
import { customElement } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';
import { collection, onSnapshot, addDoc, deleteDoc, doc, Unsubscribe } from 'firebase/firestore';
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
  
  private unsubscribe?: Unsubscribe;
  private readonly firebase: IFirebaseService = resolve(IFirebaseService);

  attached() {
    const todosCollection = collection(this.firebase.db, 'todos');
    this.unsubscribe = onSnapshot(todosCollection, (snapshot) => {
      this.todos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Todo));
    });
  }

  detached() {
    this.unsubscribe?.();
  }

  async addTodo() {
    if (!this.newTodoText.trim()) return;
    
    try {
      await addDoc(collection(this.firebase.db, 'todos'), {
        text: this.newTodoText,
        completed: false,
        createdAt: new Date()
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

## Best Practices

### Security
- Store Firebase config in environment variables
- Use Firebase Security Rules to protect your data
- Never expose sensitive data in client-side code

### Performance  
- Clean up Firestore listeners in `detached()` lifecycle
- Use proper TypeScript interfaces for data structures
- Leverage Firebase's offline capabilities

### Error Handling
- Always wrap Firebase operations in try-catch blocks
- Provide user-friendly error messages
- Log errors for debugging

### Testing
- Mock Firebase services for unit tests
- Use Firebase Emulator Suite for integration tests
- Test offline scenarios

This integration pattern provides type safety, proper lifecycle management, and follows Aurelia 2 best practices for dependency injection and component architecture.
