# Firebase + Aurelia

## Overview

Integrate Firebase into your Aurelia 2 application to enable real-time data, authentication, and cloud storage. This recipe walks you through setting up Firebase, handling authentication, and performing basic Firestore operations using Firebase's modern modular SDK.

## Prerequisites
- An existing Aurelia 2 project.
- A Firebase project with configuration details (API key, project ID, etc.).
- Node.js and npm installed.

## Installation
Install the latest Firebase SDK:

```bash
npm install firebase
```

## Initializing Firebase
### 1. Create a Firebase Configuration File
Create `src/firebase-config.ts` and add your configuration:

```typescript
// src/firebase-config.ts
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID'
};
```

### 2. Initialize Firebase in a Service
Create a Firebase service using the modular SDK:

```typescript
// src/services/firebase-service.ts
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../firebase-config';

class FirebaseService {
  app = initializeApp(firebaseConfig);
  auth = getAuth(this.app);
  db = getFirestore(this.app);

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    return signOut(this.auth);
  }
}

export const firebaseService = new FirebaseService();
```

## Using Firebase Authentication in Components
Inject and use the Firebase service in your components:

```typescript
// src/components/login.ts
import { customElement } from 'aurelia';
import { firebaseService } from '../services/firebase-service';

@customElement({
  name: 'login',
  template: `<button click.trigger="login()">Login</button>
             <button click.trigger="logout()">Logout</button>`
})
export class Login {
  async login() {
    try {
      const userCredential = await firebaseService.login('user@example.com', 'password');
      console.log('Logged in:', userCredential.user);
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  async logout() {
    await firebaseService.logout();
    console.log('Logged out');
  }
}
```

## Firestore Real-Time Updates
Use Firestore to listen for real-time updates:

```typescript
// src/components/todo-list.ts
import { customElement } from 'aurelia';
import { firebaseService } from '../services/firebase-service';
import { collection, onSnapshot } from 'firebase/firestore';

@customElement({
  name: 'todo-list',
  template: `
    <ul>
      <li repeat.for="todo of todos">${todo.text}</li>
    </ul>
  `
})
export class TodoList {
  todos: any[] = [];

  constructor() {
    const todosCollection = collection(firebaseService.db, 'todos');
    onSnapshot(todosCollection, (snapshot) => {
      this.todos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
  }
}
```
