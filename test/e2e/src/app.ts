import { ArrayObserver, customElement } from '@aurelia/runtime';

let id = 0;
class Todo {
  public done: boolean = false;
  public id: number = id++;
  constructor(public description: string, public app: App) {}
}

type ObservedTodos = Todo[] & { $observer: ArrayObserver };

@customElement({
  name: 'app',
  templateOrNode: require('./app.html'),
  build: {
    required: true,
    compiler: 'default'
  },
  instructions: [],
  dependencies: []
})
export class App {
  public log: boolean = false;
  public count: number = 1;
  public description: string = 'Hello World';
  public todos: ObservedTodos = <any>[];

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
    Promise.resolve().then(() => {
      this.todos.$observer.subscribe(this);
      this.todos.$observer.subscribeBatched(this);
    });
    console.log('app bound');
  }

  public handleChange(origin: string, args?: IArguments): void {
    if (this.log) {
      console.log('handleChange', origin, args);
    }
  }

  public handleBatchedChange(indexMap: Array<number>): void {
    if (this.log) {
      console.log('handleBatchedChange', indexMap);
    }
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
    this.todos.$observer.unsubscribe(this);
    this.todos.$observer.unsubscribeBatched(this);
  }
}
