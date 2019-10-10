import { inlineView, TaskQueue } from 'aurelia-framework';
import { Instrumenter } from './instrumenter';
declare var instrumenter: Instrumenter;

let id = 0;
class Todo {
  public done: boolean = false;
  public id: number = id++;
  public constructor(public description: string, public app: App) {}
}

@inlineView(`
  <template>
    <input id="description" type="text" value.two-way="description">
    <input id="count" type="number" value.two-way="count">
    <input id="log" type="checkbox" checked.two-way="log">

    <button id="addTodo" class="ui button" click.trigger="addTodo()">Add Todo</button>
    <button id="clearTodos" class="ui button" click.trigger="clearTodos()">Clear Todos</button>
    <button id="toggleTodos" class="ui button" click.trigger="toggleTodos()">Toggle Todos</button>
    <button id="updateTodos" class="ui button" click.trigger="updateTodos()">Update Todos</button>
    <button id="reverseTodos" class="ui button" click.trigger="reverseTodos()">Reverse Todos</button>
    <button id="insertTodos" class="ui button" click.trigger="insertTodos()">Insert Todos</button>
    <button id="removeTodos" class="ui button" click.trigger="removeTodos()">Remove Todos</button>
    <button id="swapTodos" class="ui button" click.trigger="swapTodos()">Swap Todos</button>

    <div id="descriptionText">\${description}</div>

    <div repeat.for="todo of todos">
      <div class="todo">\${\`\${todo.description}\${todo.id}\${todo.done?'X':''}\`}</div>
    </div>
  </template>
`)
export class App {
  static inject = [TaskQueue];
  public log: boolean = false;
  public count: number = 1;
  public description: string = 'Hello World';
  public todos: Todo[] = [];

  public constructor(public tq: TaskQueue) {
    instrumenter.markLifecycle(`app-constructor`);
  }

  public addTodo(): void {
    instrumenter.markActionStart(`app-addTodo-${this.count}`, true);
    const ii = this.count;
    if (ii === 1) {
      this.todos.push(new Todo(this.description, this));
    } else {
      const newTodos = Array(ii);
      const description = this.description;
      for (let i = 0; i < ii; ++i) {
        newTodos[i] = new Todo(description, this);
      }
      this.todos.push(...newTodos);
    }
    setTimeout(() => {
      instrumenter.markEnd();
    });
  }

  public clearTodos(): void {
    instrumenter.markActionStart(`app-clearTodos-${this.todos.length}`, true);
    this.todos = [];
    setTimeout(() => {
      instrumenter.markEnd();
    });
  }

  public toggleTodos(): void {
    instrumenter.markActionStart(`app-toggleTodos-${this.todos.length}`, true);
    const todos = this.todos;
    for (let i = 0, ii = todos.length; i < ii; ++i) {
      const todo = todos[i];
      todo.done = !todo.done;
    }
    setTimeout(() => {
      instrumenter.markEnd();
    });
  }

  public updateTodos(): void {
    instrumenter.markActionStart(`app-updateTodos-${this.todos.length}`, true);
    const todos = this.todos;
    const description = this.description;
    for (let i = 0, ii = todos.length; i < ii; ++i) {
      todos[i].description = description;
    }
    setTimeout(() => {
      instrumenter.markEnd();
    });
  }

  public reverseTodos(): void {
    instrumenter.markActionStart(`app-reverseTodos-${this.todos.length}`, true);
    this.todos.reverse();
    setTimeout(() => {
      instrumenter.markEnd();
    });
  }

  public insertTodos(): void {
    instrumenter.markActionStart(`app-insertTodos-${this.todos.length}`, true);
    let stepSize = this.todos.length / 10 | 0;
    for (let i = 0; i < 10; ++i) {
      this.todos.splice(stepSize + (i * stepSize), 0, new Todo(this.description, this));
    }
    setTimeout(() => {
      instrumenter.markEnd();
    });
  }

  public removeTodos(): void {
    instrumenter.markActionStart(`app-removeTodos-${this.todos.length}`, true);
    let stepSize = this.todos.length / 10 | 0;
    for (let i = 0; i < 10; ++i) {
      this.todos.splice(stepSize + (i * stepSize), 1);
    }
    setTimeout(() => {
      instrumenter.markEnd();
    });
  }

  public swapTodos(): void {
    instrumenter.markActionStart(`app-swapTodos-${this.todos.length}`, true);
    let stepSize = this.todos.length / 3 | 0;
    const todos1 = this.todos.splice(stepSize, 1);
    const todos2 = this.todos.splice(stepSize * 2, 1);
    this.todos.splice(stepSize, 0, ...todos2);
    this.todos.splice(stepSize * 2, 0, ...todos1);
    setTimeout(() => {
      instrumenter.markEnd();
    });
  }

  public bound(): void {
    instrumenter.markLifecycle(`app-bound`);
  }

  public attaching(): void {
    instrumenter.markLifecycle(`app-attaching`);
  }

  public attached(): void {
    instrumenter.markLifecycle(`app-attached`);
  }

  public detaching(): void {
    instrumenter.markLifecycle(`app-detaching`);
  }

  public detached(): void {
    instrumenter.markLifecycle(`app-detached`);
  }

  public unbound(): void {
    instrumenter.markLifecycle(`app-unbound`);
  }
}
