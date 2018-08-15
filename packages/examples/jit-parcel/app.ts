import { customElement } from '@aurelia/runtime';

class Todo {
  done = false;
  constructor(public description: string) {}
}

@customElement({
  name: 'app',
  templateOrNode: `
  <template>
    \${message}<br/>
    <input type="text" value.bind="message">
    <input type="checkbox" checked.bind="duplicateMessage" />
    <div if.bind="duplicateMessage">
      \${message}
    </div>
    <div else>No Message Duplicated</div>
    <div repeat.for="todo of todos">
      \${description}
    </div>
    <button click.trigger="addTodo()">Add Todo</button>
  </template>
  `,
  build: {
    required: true,
    compiler: 'default'
  },
  dependencies: []
})
export class App {
  message = 'Hello World';
  duplicateMessage = true;
  todos: Todo[] = [];

  addTodo() {
    this.todos.push(new Todo(this.message));
  }

  bound() {
    console.log('app bound');
  }

  attaching() {
    console.log('app attaching');
  }

  attached() {
    console.log('app attached');
  }

  detaching() {
    console.log('app detaching');
  }

  detached() {
    console.log('app detached');
  }

  unbound() {
    console.log('app unbound');
  }
}
