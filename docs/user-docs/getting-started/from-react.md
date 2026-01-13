---
description: >-
  React developers: Discover why Aurelia's standards-based approach delivers better performance and cleaner code without the complexity.
---

# From React to Aurelia: Better Performance, Cleaner Code

**Coming from React?** You'll love Aurelia's approach to component development. Get the productivity of React with better performance, cleaner templates, and no virtual DOM overhead.

## Why React Developers Choose Aurelia

### **🚀 Performance That Actually Matters**
```typescript
// React: Virtual DOM reconciliation overhead
function UserList({ users, onUserClick }) {
  return (
    <div>
      {users.filter(u => u.isActive).map(user => (
        <UserCard key={user.id} user={user} onClick={onUserClick} />
      ))}
    </div>
  );
}

// Aurelia: Direct DOM updates, no virtual overhead
export class UserList {
  @bindable users: User[];
  @bindable onUserClick: (user: User) => void;
}
```

```html
<!-- Aurelia template: Clean HTML, faster rendering -->
<div>
  <user-card repeat.for="user of users.filter(u => u.isActive)" 
             user.bind="user" 
             on-click.bind="() => onUserClick(user)">
  </user-card>
</div>
```

**Result:** 30-50% faster rendering with smaller bundle sizes.

### **✨ Cleaner Component Code**
```typescript
// React: Hooks complexity and re-render management
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {
      setLoading(true);
      try {
        const data = await searchAPI(searchTerm);
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query.length > 2) {
      debouncedSearch(query);
    } else {
      setResults([]);
    }
  }, [query, debouncedSearch]);

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {loading && <div>Loading...</div>}
      {results.map(result => <Result key={result.id} data={result} />)}
    </div>
  );
}

// Aurelia: Simple, intuitive code
export class SearchComponent {
  query = '';
  results: SearchResult[] = [];
  loading = false;

  @watch('query')
  async queryChanged(newQuery: string) {
    if (newQuery.length > 2) {
      this.loading = true;
      try {
        this.results = await searchAPI(newQuery);
      } finally {
        this.loading = false;
      }
    } else {
      this.results = [];
    }
  }
}
```

```html
<div>
  <input value.bind="query & debounce:300" placeholder="Search...">
  <div if.bind="loading">Loading...</div>
  <result repeat.for="result of results" data.bind="result"></result>
</div>
```

**No hooks complexity. No re-render cycles. Just clean, maintainable code.**

### **🎯 TypeScript-First Development**
```typescript
// React: Complex prop typing
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  className?: string;
  children?: React.ReactNode;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, onEdit, onDelete, className, children 
}) => {
  // Component logic
};

// Aurelia: Built-in TypeScript support
export class UserCard {
  @bindable user: User;
  @bindable onEdit?: (user: User) => void;
  @bindable onDelete?: (user: User) => void;
  
  // Automatic type checking, no prop interfaces needed
}
```

### **🔥 Better Developer Experience**
| Feature | React | Aurelia |
|---------|-------|---------|
| **Component State** | useState, useReducer | Simple class properties |
| **Side Effects** | useEffect with dependencies | @watch decorator or lifecycle hooks |
| **Performance** | memo, useMemo, useCallback | Automatic optimization |
| **Styling** | CSS-in-JS or external files | Automatic CSS loading + Shadow DOM |
| **Forms** | Controlled components + validation libs | Two-way binding + built-in validation |

## Your React Knowledge Transfers

### **JSX → Aurelia Templates**
```jsx
// React JSX
<div className={`card ${isActive ? 'active' : ''}`}>
  <h2>{user.name}</h2>
  <button onClick={() => handleEdit(user)}>Edit</button>
  {showDetails && (
    <div>
      <p>{user.bio}</p>
      {user.posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )}
</div>

// Aurelia HTML (cleaner, more intuitive)
<div class="card" active.class="isActive">
  <h2>${user.name}</h2>
  <button click.trigger="handleEdit(user)">Edit</button>
  <div if.bind="showDetails">
    <p>${user.bio}</p>
    <post-card repeat.for="post of user.posts" post.bind="post"></post-card>
  </div>
</div>
```

### **Props → Bindable Properties**
```tsx
// React
interface Props {
  data: any[];
  onItemClick: (item: any) => void;
  loading?: boolean;
}

const MyComponent: React.FC<Props> = ({ data, onItemClick, loading = false }) => {
  // Component logic
};

// Aurelia
export class MyComponent {
  @bindable data: any[];
  @bindable onItemClick: (item: any) => void;
  @bindable loading = false;
  
  // That's it - cleaner and more intuitive
}
```

### **State Management**
```typescript
// React: Context + useReducer or external library
const UserContext = createContext();

function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
}

// Aurelia: Built-in dependency injection
@singleton()
export class UserService {
  private users: User[] = [];
  
  addUser(user: User) {
    this.users.push(user);
  }
  
  getUsers() {
    return this.users;
  }
}

// Use anywhere with simple injection
export class UserList {
  private userService = resolve(UserService);
  
  get users() {
    return this.userService.getUsers();
  }
}
```

## Quick Migration Path

### **1. Start with Familiar Concepts (5 minutes)**
```bash
npx makes aurelia my-aurelia-app
cd my-aurelia-app
npm run dev
```

### **2. Convert a React Component (10 minutes)**
Create your first Aurelia component using familiar React patterns:

```typescript
// React component you're used to
const TodoList = ({ todos, onToggle, onDelete }) => (
  <ul>
    {todos.map(todo => (
      <li key={todo.id}>
        <input 
          type="checkbox" 
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span>{todo.text}</span>
        <button onClick={() => onDelete(todo.id)}>Delete</button>
      </li>
    ))}
  </ul>
);

// Equivalent Aurelia component
export class TodoList {
  @bindable todos: Todo[];
  @bindable onToggle: (id: number) => void;
  @bindable onDelete: (id: number) => void;
}
```

```html
<!-- todo-list.html -->
<ul>
  <li repeat.for="todo of todos">
    <input type="checkbox" 
           checked.bind="todo.completed"
           change.trigger="onToggle(todo.id)">
    <span>${todo.text}</span>
    <button click.trigger="onDelete(todo.id)">Delete</button>
  </li>
</ul>
```

### **3. Experience the Differences (5 minutes)**
- **No build step complexity** - just works with any bundler
- **No prop drilling** - dependency injection handles state
- **No re-render debugging** - direct DOM updates
- **No hooks confusion** - simple class properties and methods

## What You'll Gain

### **📈 Performance Benefits**
- **Faster initial load** - no virtual DOM library overhead
- **Faster updates** - direct DOM manipulation
- **Smaller bundles** - efficient code splitting
- **Better mobile performance** - less JavaScript execution

### **🧹 Cleaner Codebase**
- **Less boilerplate** - no prop interfaces, no memo wrapping
- **Intuitive templates** - HTML that looks like HTML
- **Simpler state management** - class properties instead of hooks
- **Better separation of concerns** - HTML, CSS, and TypeScript in separate files

### **🚀 Better Developer Experience**
- **Stronger TypeScript integration** - built from the ground up for TypeScript
- **No re-render optimization needed** - automatically efficient
- **Powerful CLI tools** - scaffolding and build tools that just work
- **Excellent debugging** - inspect actual DOM, not virtual representations

## Ready to Make the Switch?

```bash
# Try Aurelia now
npx makes aurelia my-first-aurelia-app
cd my-first-aurelia-app
npm run dev
```

**Next Steps:**
1. **[Complete Getting Started Guide](complete-guide.md)** - Build your first app in 15 minutes
2. **[Component Guide](../components/components.md)** - Master Aurelia's component model  
3. **[Templates Deep Dive](../templates/template-syntax/overview.md)** - Learn the templating system
4. **[Migration Examples](../developer-guides/migrating-to-aurelia-2/)** - See more migration patterns

**Questions?** Join our [Discord community](https://discord.gg/RBtyM6u) where developers discuss their experiences with different frameworks.

**Ready to experience the difference?** [Start building with Aurelia now](complete-guide.md).