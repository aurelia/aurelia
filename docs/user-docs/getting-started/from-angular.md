---
description: >-
  Angular developers: Keep the best parts (DI, TypeScript, CLI) while eliminating the complexity and improving performance.
---

# From Angular to Aurelia: Keep the Good, Lose the Complexity

**Angular developer?** You'll feel right at home with Aurelia. Keep everything you love—dependency injection, TypeScript, powerful CLI—while eliminating boilerplate, improving performance, and simplifying your development experience.

## Why Angular Developers Choose Aurelia

### **🎯 All the Power, None of the Complexity**
```typescript
// Angular: Heavy ceremony and boilerplate
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-user-search',
  template: `
    <div>
      <input 
        [value]="searchQuery" 
        (input)="onSearchInput($event)"
        placeholder="Search users..."
      >
      <div *ngIf="loading">Loading...</div>
      <app-user-card 
        *ngFor="let user of filteredUsers; trackBy: trackByUserId"
        [user]="user"
        (userEdit)="onUserEdit($event)"
      ></app-user-card>
    </div>
  `
})
export class UserSearchComponent implements OnInit, OnDestroy {
  @Input() users: User[] = [];
  @Output() userEdit = new EventEmitter<User>();
  
  searchQuery = '';
  filteredUsers: User[] = [];
  loading = false;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => this.performSearch(query));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.searchSubject.next(this.searchQuery);
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  private async performSearch(query: string) {
    if (query.length > 2) {
      this.loading = true;
      // Search logic
      this.loading = false;
    } else {
      this.filteredUsers = [];
    }
  }

  onUserEdit(user: User) {
    this.userEdit.emit(user);
  }
}

// Aurelia: Clean, intuitive code
export class UserSearch {
  @bindable users: User[];
  @bindable userEdit: (user: User) => void;
  
  searchQuery = '';
  loading = false;

  // Computed properties work automatically
  get filteredUsers() {
    if (this.searchQuery.length < 3) return [];
    return this.users.filter(user => 
      user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Simple debounced search
  @watch('searchQuery')
  async searchChanged(newQuery: string) {
    if (newQuery.length > 2) {
      this.loading = true;
      // Search logic  
      this.loading = false;
    }
  }
}
```

```html
<!-- Aurelia template: Clean HTML -->
<div>
  <input value.bind="searchQuery & debounce:300" placeholder="Search users...">
  <div if.bind="loading">Loading...</div>
  <user-card repeat.for="user of filteredUsers" 
             user.bind="user"
             user-edit.call="userEdit(user)">
  </user-card>
</div>
```

**Result:** 70% less code with the same functionality and better performance.

### **🚀 Dependency Injection Without the Complexity**
```typescript
// Angular: Complex DI with decorators and modules
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient,
    @Inject('API_URL') private apiUrl: string
  ) {}
}

@NgModule({
  providers: [
    { provide: 'API_URL', useValue: 'https://api.example.com' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class AppModule {}

// Aurelia: Simple, powerful DI
export const IUserService = DI.createInterface<IUserService>(
  'IUserService',
  x => x.singleton(UserService)
);

export class UserService {
  private http = resolve(IHttpClient);
  private config = resolve(IApiConfig);
  
  // That's it - no modules, no complex setup
}

// Use anywhere
export class UserList {
  private userService = resolve(IUserService);
  
  // Clean, type-safe injection
}
```

### **✨ Better TypeScript Integration**
```typescript
// Angular: Lots of ceremony for type safety
interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-user-detail',
  template: `
    <div *ngIf="user">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
      <button (click)="editUser()">Edit</button>
    </div>
  `
})
export class UserDetailComponent {
  @Input() user: User | null = null;
  @Output() edit = new EventEmitter<User>();

  editUser() {
    if (this.user) {
      this.edit.emit(this.user);
    }
  }
}

// Aurelia: TypeScript-first design
export class UserDetail {
  @bindable user: User | null = null;
  @bindable edit: (user: User) => void;

  editUser() {
    if (this.user) {
      this.edit(this.user);
    }
  }
}
```

```html
<!-- Aurelia template with automatic type checking -->
<div if.bind="user">
  <h2>${user.name}</h2>
  <p>${user.email}</p>
  <button click.trigger="editUser()">Edit</button>
</div>
```

## Your Angular Knowledge Transfers

### **Template Syntax Translation**
| Angular | Aurelia | Benefit |
|---------|---------|---------|
| `[property]="value"` | `property.bind="value"` | Same one-way binding |
| `[(ngModel)]="value"` | `value.bind="value"` | Simpler two-way binding |
| `(click)="handler()"` | `click.trigger="handler()"` | Same event handling |
| `*ngIf="condition"` | `if.bind="condition"` | Cleaner conditional syntax |
| `*ngFor="let item of items"` | `repeat.for="item of items"` | Same iteration, better performance |
| `[class.active]="isActive"` | `active.class="isActive"` | More intuitive class binding |

### **Component Architecture**
```typescript
// Angular Component
@Component({
  selector: 'app-todo-list',
  template: `
    <div class="todo-app">
      <input 
        [(ngModel)]="newTodo" 
        (keyup.enter)="addTodo()"
        placeholder="Add todo..."
      >
      <ul>
        <li *ngFor="let todo of todos; trackBy: trackByTodoId"
            [class.completed]="todo.completed">
          <input 
            type="checkbox" 
            [(ngModel)]="todo.completed"
          >
          <span>{{ todo.text }}</span>
          <button (click)="deleteTodo(todo.id)">Delete</button>
        </li>
      </ul>
    </div>
  `,
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent {
  @Input() todos: Todo[] = [];
  @Output() todoAdded = new EventEmitter<Todo>();
  @Output() todoDeleted = new EventEmitter<number>();
  
  newTodo = '';
  private nextId = 1;

  addTodo() {
    if (this.newTodo.trim()) {
      const todo: Todo = {
        id: this.nextId++,
        text: this.newTodo.trim(),
        completed: false
      };
      this.todoAdded.emit(todo);
      this.newTodo = '';
    }
  }

  deleteTodo(id: number) {
    this.todoDeleted.emit(id);
  }

  trackByTodoId(index: number, todo: Todo): number {
    return todo.id;
  }
}

// Aurelia Component - much cleaner
export class TodoList {
  @bindable todos: Todo[] = [];
  @bindable todoAdded: (todo: Todo) => void;
  @bindable todoDeleted: (id: number) => void;
  
  newTodo = '';
  private nextId = 1;

  addTodo() {
    if (this.newTodo.trim()) {
      const todo: Todo = {
        id: this.nextId++,
        text: this.newTodo.trim(),
        completed: false
      };
      this.todoAdded(todo);
      this.newTodo = '';
    }
  }

  deleteTodo(id: number) {
    this.todoDeleted(id);
  }
  
  onEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addTodo();
    }
  }
}
```

```html
<!-- todo-list.html - clean, readable -->
<div class="todo-app">
  <input 
    value.bind="newTodo" 
    keydown.trigger="onEnterKey($event)"
    placeholder="Add todo..."
  >
  <ul>
    <li repeat.for="todo of todos" completed.class="todo.completed">
      <input type="checkbox" checked.bind="todo.completed">
      <span>${todo.text}</span>
      <button click.trigger="deleteTodo(todo.id)">Delete</button>
    </li>
  </ul>
</div>
```

### **Services and DI Comparison**
```typescript
// Angular Service
@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(
    private http: HttpClient,
    @Inject('API_CONFIG') private config: ApiConfig
  ) {}

  async getUsers(): Promise<User[]> {
    return this.http.get<User[]>(`${this.config.baseUrl}/users`).toPromise();
  }
}

// Aurelia Service - cleaner and more flexible
export const IDataService = DI.createInterface<IDataService>(
  'IDataService', 
  x => x.singleton(DataService)
);

export class DataService {
  private http = resolve(IHttpClient);
  private config = resolve(IApiConfig);

  async getUsers(): Promise<User[]> {
    return this.http.get(`${this.config.baseUrl}/users`);
  }
}
```

## Migration Benefits for Angular Developers

### **📈 Performance Gains**
- **No Zone.js overhead** - direct DOM updates instead of change detection
- **Smaller bundle sizes** - less framework code, better tree shaking
- **Faster startup** - no complex bootstrap process
- **Better runtime performance** - efficient batched updates

### **🧹 Development Experience Improvements**
- **Less boilerplate** - no modules, less ceremony
- **Simpler testing** - no TestBed setup complexity  
- **Better debugging** - inspect actual DOM, not framework abstractions
- **Cleaner templates** - HTML that looks like HTML

### **🚀 Modern Development Features**
- **Built-in hot reload** - better development experience
- **Automatic CSS loading** - no need to import stylesheets
- **Shadow DOM support** - true component encapsulation
- **Standards-based** - closer to web platform APIs

## Quick Migration Path

### **1. Set Up Your Aurelia Environment (5 minutes)**
```bash
npx makes aurelia my-aurelia-app
cd my-aurelia-app
npm run dev
```

### **2. Convert Your First Angular Component (15 minutes)**
Take any Angular component and follow this pattern:

```typescript
// Angular
@Component({
  selector: 'app-user-profile',
  template: `
    <div class="profile" [class.editing]="isEditing">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
      <button *ngIf="!isEditing" (click)="startEdit()">Edit</button>
      <div *ngIf="isEditing">
        <input [(ngModel)]="editName" placeholder="Name">
        <input [(ngModel)]="editEmail" placeholder="Email">
        <button (click)="saveChanges()">Save</button>
        <button (click)="cancelEdit()">Cancel</button>
      </div>
    </div>
  `
})
export class UserProfileComponent {
  @Input() user: User;
  @Output() userUpdated = new EventEmitter<User>();
  
  isEditing = false;
  editName = '';
  editEmail = '';

  startEdit() {
    this.isEditing = true;
    this.editName = this.user.name;
    this.editEmail = this.user.email;
  }

  saveChanges() {
    const updatedUser = { ...this.user, name: this.editName, email: this.editEmail };
    this.userUpdated.emit(updatedUser);
    this.isEditing = false;
  }

  cancelEdit() {
    this.isEditing = false;
  }
}

// Aurelia - same functionality, cleaner code
export class UserProfile {
  @bindable user: User;
  @bindable userUpdated: (user: User) => void;
  
  isEditing = false;
  editName = '';
  editEmail = '';

  startEdit() {
    this.isEditing = true;
    this.editName = this.user.name;
    this.editEmail = this.user.email;
  }

  saveChanges() {
    const updatedUser = { ...this.user, name: this.editName, email: this.editEmail };
    this.userUpdated(updatedUser);
    this.isEditing = false;
  }

  cancelEdit() {
    this.isEditing = false;
  }
}
```

```html
<!-- user-profile.html -->
<div class="profile" editing.class="isEditing">
  <h2>${user.name}</h2>
  <p>${user.email}</p>
  <button if.bind="!isEditing" click.trigger="startEdit()">Edit</button>
  <div if.bind="isEditing">
    <input value.bind="editName" placeholder="Name">
    <input value.bind="editEmail" placeholder="Email">
    <button click.trigger="saveChanges()">Save</button>
    <button click.trigger="cancelEdit()">Cancel</button>
  </div>
</div>
```

### **3. Experience the Improvements**
- **No change detection cycles** - updates happen directly
- **No modules to configure** - components work immediately
- **Better TypeScript support** - everything is typed by default
- **Cleaner templates** - HTML without framework-specific syntax

## Angular vs Aurelia: Feature Comparison

| Feature | Angular | Aurelia | Winner |
|---------|---------|---------|---------|
| **TypeScript Support** | Excellent | Excellent | Tie |
| **Dependency Injection** | Powerful but complex | Powerful and simple | Aurelia |
| **Performance** | Good with OnPush | Better by default | Aurelia |
| **Learning Curve** | Steep | Gentle | Aurelia |
| **Bundle Size** | Large | Smaller | Aurelia |
| **CLI Tools** | Excellent | Excellent | Tie |
| **Enterprise Features** | Comprehensive | Comprehensive | Tie |
| **Ecosystem** | Huge | Focused | Angular |
| **Standards Compliance** | Good | Excellent | Aurelia |

## What Angular Concepts Work in Aurelia

✅ **Dependency Injection** - Even more powerful and simpler  
✅ **TypeScript** - First-class support, better integration  
✅ **Component Architecture** - Same concepts, cleaner implementation  
✅ **Services** - Same patterns, less boilerplate  
✅ **Routing** - More powerful, type-safe navigation  
✅ **Testing** - Simpler setup, same testing patterns  
✅ **CLI Tools** - Full-featured CLI for scaffolding and building  

## Ready for a Better Angular Experience?

```bash
# Start your Aurelia journey
npx makes aurelia my-angular-to-aurelia-app
cd my-angular-to-aurelia-app
npm run dev
```

**Next Steps:**
1. **[Complete Getting Started Guide](complete-guide.md)** - Build a real app in 15 minutes
2. **[Dependency Injection Guide](../getting-to-know-aurelia/dependency-injection.md)** - Master Aurelia's DI system
3. **[Router Guide](../router/getting-started.md)** - Type-safe navigation
4. **[Testing Guide](../developer-guides/testing/overview.md)** - Test your applications

**Questions?** Join our [Discord community](https://discord.gg/RBtyM6u) where developers discuss enterprise framework experiences and architectural decisions.

**Ready to experience Angular without the complexity?** [Start building with Aurelia](complete-guide.md) today.