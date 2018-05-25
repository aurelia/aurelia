import { appConfig } from './app-config'; //added by the compiler
import { customElement } from './runtime/decorators';

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
    //console.log('Computed');
    return this.message + ' Computed';
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
