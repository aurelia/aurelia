import { customElement } from '@aurelia/runtime';
import view from 'view!./app.html';

class Todo {
  done = false;
  public constructor(public description: string) {}
}

@customElement(view)
export class App {
  message = 'Hello World';
  duplicateMessage = true;
  todos: Todo[] = [];

  get computedMessage() {
    let value = `
      ${this.message} Computed:
      Todo Count ${this.todos.length}
      Descriptions:
      ${this.todos.map(x => x.description).join('\n')}
    `;

    return value;
  }

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
