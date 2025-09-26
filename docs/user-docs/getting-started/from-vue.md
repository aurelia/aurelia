---
description: >-
  Vue developers: Love Vue's simplicity? Aurelia takes it further with better performance, stronger TypeScript support, and zero magic.
---

# From Vue to Aurelia: All the Simplicity, Better Performance

**Vue developer?** You already appreciate simple, intuitive frameworks. Aurelia takes that philosophy even further with better performance, stronger TypeScript support, and standards-based architecture.

## Why Vue Developers Love Aurelia

### **🎯 Vue's Simplicity + Better Performance**
```vue
<!-- Vue: Reactivity with Proxy overhead -->
<template>
  <div>
    <input v-model="searchQuery" placeholder="Search users...">
    <div v-if="loading">Loading...</div>
    <user-card 
      v-for="user in filteredUsers" 
      :key="user.id"
      :user="user"
      @edit="handleEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const searchQuery = ref('')
const loading = ref(false)
const users = ref<User[]>([])

const filteredUsers = computed(() => 
  users.value.filter(user => 
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

watch(searchQuery, async (newQuery) => {
  if (newQuery.length > 2) {
    loading.value = true
    // Search logic
    loading.value = false
  }
})
</script>
```

```typescript
// Aurelia: Same simplicity, better performance
export class UserSearch {
  searchQuery = '';
  loading = false;
  users: User[] = [];

  // Computed properties work automatically - no wrapper needed
  get filteredUsers() {
    return this.users.filter(user => 
      user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Watching is clean and intuitive
  @watch('searchQuery')
  async onSearchChange(newQuery: string) {
    if (newQuery.length > 2) {
      this.loading = true;
      // Search logic
      this.loading = false;
    }
  }
}
```

```html
<!-- Aurelia template: Clean HTML, no special directives -->
<div>
  <input value.bind="searchQuery & debounce:300" placeholder="Search users...">
  <div if.bind="loading">Loading...</div>
  <user-card repeat.for="user of filteredUsers" 
             user.bind="user"
             edit.call="handleEdit">
  </user-card>
</div>
```

**Result:** Same clean code style, but with direct DOM updates and no proxy overhead.

### **✨ Better TypeScript Integration**
```vue
<!-- Vue: TypeScript support is good but requires setup -->
<script setup lang="ts">
interface Props {
  user: User
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: false
})

const emit = defineEmits<{
  edit: [user: User]
  delete: [id: number]
}>()
</script>

// Aurelia: TypeScript-first, no setup needed
export class UserCard {
  @bindable user: User;
  @bindable editable = false;
  
  // Events are just methods - no emit setup
  edit() {
    // Automatically available as edit.call in templates
  }
  
  delete() {
    // Type-safe event handling
  }
}
```

### **🚀 Standards-Based Architecture**
```vue
<!-- Vue: Custom template syntax -->
<template>
  <div :class="{ active: isActive, loading: isLoading }">
    <slot name="header">
      <h2>{{ title }}</h2>
    </slot>
    <div v-show="expanded">
      <slot>Default content</slot>
    </div>
  </div>
</template>

<!-- Aurelia: Closer to web standards -->
<div class="card" active.class="isActive" loading.class="isLoading">
  <au-slot name="header">
    <h2>${title}</h2>
  </au-slot>
  <div show.bind="expanded">
    <au-slot>Default content</au-slot>
  </div>
</div>
```

**Aurelia's approach:** Build on web standards instead of creating new syntax.

## Your Vue Knowledge Transfers Perfectly

### **Template Syntax Comparison**
| Vue | Aurelia | Benefit |
|-----|---------|---------|
| `v-model="value"` | `value.bind="value"` | Two-way binding works the same |
| `v-if="condition"` | `if.bind="condition"` | Same conditional logic |
| `v-for="item in items"` | `repeat.for="item of items"` | Same iteration, better performance |
| `@click="handler"` | `click.trigger="handler"` | Same event handling |
| `:class="{ active: isActive }"` | `active.class="isActive"` | Cleaner conditional classes |

### **Component Structure**
```vue
<!-- Vue Single File Component -->
<template>
  <div class="my-component">
    <h1>{{ message }}</h1>
    <button @click="updateMessage">Update</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Hello Vue!')

const updateMessage = () => {
  message.value = 'Updated!'
}
</script>

<style scoped>
.my-component {
  padding: 20px;
  border: 1px solid #ccc;
}
</style>
```

```typescript
// Aurelia: Similar structure, separate files (or inline)
export class MyComponent {
  message = 'Hello Aurelia!';
  
  updateMessage() {
    this.message = 'Updated!';
  }
}
```

```html
<!-- my-component.html -->
<div class="my-component">
  <h1>${message}</h1>
  <button click.trigger="updateMessage()">Update</button>
</div>
```

```css
/* my-component.css - automatically loaded! */
.my-component {
  padding: 20px;
  border: 1px solid #ccc;
}
```

### **Reactivity Comparison**
```vue
<!-- Vue: Composition API -->
<script setup>
const count = ref(0)
const doubled = computed(() => count.value * 2)

watch(count, (newValue) => {
  console.log(`Count changed to ${newValue}`)
})
</script>

// Aurelia: Plain JavaScript/TypeScript
export class Counter {
  count = 0;
  
  // Computed properties are just getters
  get doubled() {
    return this.count * 2;
  }
  
  // Watching is explicit and clear
  @watch('count')
  countChanged(newValue: number) {
    console.log(`Count changed to ${newValue}`);
  }
}
```

### **Component Communication**
```vue
<!-- Vue: Props and Emits -->
<script setup>
interface Props {
  items: Item[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  itemSelected: [item: Item]
}>()

const selectItem = (item: Item) => {
  emit('itemSelected', item)
}
</script>

// Aurelia: Bindable properties and callable methods
export class ItemList {
  @bindable items: Item[];
  
  // Just call this method from parent template
  selectItem(item: Item) {
    // Parent can bind to this with select-item.call="handleSelection(item)"
  }
}
```

## Migration Path: Vue → Aurelia

### **1. Quick Start (5 minutes)**
```bash
npx makes aurelia my-aurelia-app
cd my-aurelia-app
npm run dev
```

### **2. Convert Your First Vue Component (10 minutes)**
Let's convert a typical Vue component:

```vue
<!-- Vue Todo Component -->
<template>
  <div class="todo-app">
    <input 
      v-model="newTodo" 
      @keyup.enter="addTodo"
      placeholder="Add a todo..."
    >
    <ul>
      <li 
        v-for="todo in todos" 
        :key="todo.id"
        :class="{ completed: todo.completed }"
      >
        <input 
          type="checkbox" 
          v-model="todo.completed"
        >
        <span>{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)">Remove</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Todo {
  id: number
  text: string
  completed: boolean
}

const newTodo = ref('')
const todos = ref<Todo[]>([])
let nextId = 1

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({
      id: nextId++,
      text: newTodo.value.trim(),
      completed: false
    })
    newTodo.value = ''
  }
}

const removeTodo = (id: number) => {
  todos.value = todos.value.filter(todo => todo.id !== id)
}
</script>
```

```typescript
// Aurelia equivalent - cleaner and more intuitive
export class TodoApp {
  newTodo = '';
  todos: Todo[] = [];
  private nextId = 1;

  addTodo() {
    if (this.newTodo.trim()) {
      this.todos.push({
        id: this.nextId++,
        text: this.newTodo.trim(),
        completed: false
      });
      this.newTodo = '';
    }
  }

  removeTodo(id: number) {
    this.todos = this.todos.filter(todo => todo.id !== id);
  }
  
  onEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addTodo();
    }
  }
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}
```

```html
<!-- todo-app.html -->
<div class="todo-app">
  <input 
    value.bind="newTodo" 
    keydown.trigger="onEnterKey($event)"
    placeholder="Add a todo..."
  >
  <ul>
    <li repeat.for="todo of todos" completed.class="todo.completed">
      <input type="checkbox" checked.bind="todo.completed">
      <span>${todo.text}</span>
      <button click.trigger="removeTodo(todo.id)">Remove</button>
    </li>
  </ul>
</div>
```

### **3. Experience the Differences**
- **No ref() wrappers** - plain JavaScript properties
- **No .value everywhere** - direct property access  
- **Better TypeScript** - no generic complications
- **Automatic CSS loading** - matching CSS files load automatically

## What You'll Gain Moving from Vue

### **📈 Performance Improvements**
- **Direct DOM updates** instead of virtual DOM reconciliation
- **Smaller runtime** - no proxy reactivity overhead
- **Better tree shaking** - more efficient bundling
- **Faster startup** - less framework initialization code

### **🧹 Cleaner Development Experience**
- **No composition API complexity** - just class properties and methods
- **Better TypeScript support** - built for TypeScript from day one
- **Simpler testing** - no special test utilities needed
- **Standards-based** - closer to web platform APIs

### **🚀 Enhanced Capabilities**
- **Built-in dependency injection** - no need for provide/inject complexity
- **Powerful templating** - lambda expressions and better binding
- **Shadow DOM support** - true component encapsulation
- **Better routing** - type-safe, more powerful navigation

## Vue vs Aurelia: Feature Comparison

| Feature | Vue 3 | Aurelia 2 | Winner |
|---------|--------|-----------|---------|
| **Learning Curve** | Easy | Easy | Tie |
| **TypeScript Support** | Good | Excellent | Aurelia |
| **Performance** | Good | Better | Aurelia |
| **Bundle Size** | Small | Smaller | Aurelia |
| **Template Syntax** | Custom | Standards-based | Aurelia |
| **State Management** | Pinia/Vuex | Built-in DI | Aurelia |
| **Component Communication** | Props/Emits | Bindable/Callable | Tie |
| **Ecosystem Size** | Large | Focused | Vue |

## Ready to Experience the Upgrade?

```bash
# Start your Aurelia journey
npx makes aurelia my-vue-to-aurelia-app
cd my-vue-to-aurelia-app
npm run dev
```

**Next Steps:**
1. **[Complete Getting Started Guide](complete-guide.md)** - Build a real app in 15 minutes
2. **[Component Guide](../components/components.md)** - Master component patterns
3. **[Templates Deep Dive](../templates/template-syntax/overview.md)** - Advanced templating
4. **[Dependency Injection](../getting-to-know-aurelia/dependency-injection.md)** - Powerful DI system

**Questions?** Join our [Discord community](https://discord.gg/RBtyM6u) where developers discuss framework experiences and best practices.

**Ready to take the next step?** [Start building with Aurelia](complete-guide.md) and experience web development the way it should be.