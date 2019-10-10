import { ArrayObserver, customElement } from '@aurelia/runtime';

let id = 0;
class Todo {
  public done: boolean = false;
  public id: number = id++;
  public constructor(public description: string, public app: App) {}
}

type ObservedTodos = Todo[] & { $observer: ArrayObserver };

const template = `
<template>
  <div class="ui form">
    <div class="fields">
      <div class="five wide field">
        <label>Description</label>
        <input id="description" type="text" value.two-way="description">
      </div>
      <div class="two wide field">
        <label>Count</label>
        <input id="count" type="number" value.two-way="count">
      </div>
    </div>
    <button id="addTodo" class="ui button" click.trigger="addTodo()">Add Todo</button>
    <button id="clearTodos" class="ui button" click.trigger="clearTodos()">Clear Todos</button>
    <button id="toggleTodos" class="ui button" click.trigger="toggleTodos()">Toggle Todos</button>
  </div>
  <div id="descriptionText">\${description}</div>
  <div class="ui divided list todos">
    <div repeat.for="todo of todos">
      <div class="item todo">
        <div id.bind="\`todo-\${todo.id}\`" class="content">
          #\${todo.id} - \${todo.app.description} - \${todo.description}
          <input id.bind="\`todo-\${todo.id}-done\`" type="checkbox" checked.two-way="todo.done">
          \${todo.done ? 'Done' : ''}
        </div>
      </div>
    </div>
  </div>
</template>
`;

@customElement({ name: 'app', template })
export class App {
  public log: boolean = false;
  public count: number = 1;
  public description: string = 'Hello World';
  public todos: ObservedTodos = [] as any;

  public addTodo(): void {
    for (let i = 0; i < this.count; ++i) {
      this.todos.push(new Todo(this.description, this));
    }
  }

  public clearTodos(): void {
    this.todos.splice(0, this.todos.length);
  }

  public toggleTodos(): void {
    for (const todo of this.todos) {
      todo.done = !todo.done;
    }
  }

  public bound(): void {
    console.log('app bound');
  }

  public attaching(): void {
    console.log('app attaching');
  }

  public attached(): void {
    console.log('app attached');
  }

  public detaching(): void {
    console.log('app detaching');
  }

  public detached(): void {
    console.log('app detached');
  }

  public unbound(): void {
    console.log('app unbound');
  }
}
