import { appConfig } from './app-config'; //added by the compiler
import { customElement } from '../runtime/templating/custom-element';

class Todo {
  done = false;
  constructor(public description: string) {}
}

@customElement(appConfig) //added by the compiler
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
