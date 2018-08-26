// import { Aurelia, ISinglePageApp } from '@aurelia/runtime';
// import { App } from '../../src/test-aot/app';
// import { GeneratedConfiguration } from '../../src/test-aot/generated-configuration';
// import { DebugConfiguration } from '../../src/debug/configuration';
// import { expect } from 'chai';
// import { spy } from 'sinon';
// import { DOM } from '@aurelia/runtime';
// import { ITaskQueue } from '@aurelia/runtime';
// import { IContainer, DI } from '../../../../kernel/src/index';

// describe('Aurelia', () => {
//   let container: IContainer;
//   let taskQueue: ITaskQueue;
//   let sut: Aurelia;
//   let host: HTMLElement;
//   let component: App;
//   let spa: ISinglePageApp;

//   beforeEach(() => {
//     container = DI.createContainer();
//     taskQueue = container.get(ITaskQueue);

//     sut = new Aurelia(container);
//     sut.register(GeneratedConfiguration, DebugConfiguration);

//     host = document.createElement('app');
//     document.body.appendChild(host);
//     component = new App();
//     spa = { host, component };
//     sut.app(spa);
//     sut.start();
//     taskQueue.flushMicroTaskQueue();
//   });

//   afterEach(() => {
//     taskQueue.flushMicroTaskQueue();
//     try {
//       // todo: this fails
//       sut.stop();
//     } catch(e) {
//       console.log(e.message);
//     }
//     taskQueue.flushMicroTaskQueue();
//     document.body.removeChild(host);
//   });

//   it('should render correctly', () => {
//     expectLines('Hello World', 5);
//     expectLines('Hello World Computed', 1);
//     expectLines('Todo Count 0', 1);
//     expectLines('Super Duper name tag', 1);
//   });

//   it('should update source-to-target message', () => {
//     const msg = 'Goodbye World';
//     component.message = msg;
//     taskQueue.flushMicroTaskQueue();

//     expectLines(msg, 5);
//     expectLines(`${msg} Computed`, 1);
//   });

//   it('should update target-to-source message', () => {
//     const msg = 'Hello Again World';
//     const input = <HTMLInputElement>host.querySelector('input[type=text]');
//     input.value = msg;
//     input.dispatchEvent(new CustomEvent('change'));
//     taskQueue.flushMicroTaskQueue();

//     expect(component.message).to.equal(msg);
//     expectLines(msg, 5);
//     expectLines(`${msg} Computed`, 1);
//   });

//   describe('should update source-to-target todos', () => {
//     const tests = [
//       ['todo 1'],
//       ['todo 1', 'todo 2'],
//       ['todo 1', 'todo 2', 'todo 3']
//     ]
//     for (const todos of tests) {
//       it(`push ${todos.length} todos and flush in-between`, () => {
//         for (const todo of todos) {
//           component.todos.push({description: todo, done: false});
//           taskQueue.flushMicroTaskQueue();
//         }

//         for (const todo of todos) {
//           expectLines(todo, 2);
//         }
//         expectLines(`Todo Count ${todos.length}`, 1);
//       });

//       it(`push ${todos.length} todos and flush only at the end`, () => {
//         for (const todo of todos) {
//           component.todos.push({description: todo, done: false});
//         }
//         taskQueue.flushMicroTaskQueue();

//         for (const todo of todos) {
//           expectLines(todo, 2);
//         }
//         expectLines(`Todo Count ${todos.length}`, 1);
//       });

//       it(`push + pop ${todos.length} todos and flush in-between`, () => {
//         for (const todo of todos) {
//           component.todos.push({description: todo, done: false});
//         }
//         taskQueue.flushMicroTaskQueue();
//         while (component.todos.pop()) {
//           taskQueue.flushMicroTaskQueue();
//         }

//         for (const todo of todos) {
//           expectLines(todo, 0);
//         }
//         expectLines(`Todo Count 0`, 1);
//       });

//       it(`push + pop ${todos.length} todos and flush only at the end`, () => {
//         for (const todo of todos) {
//           component.todos.push({description: todo, done: false});
//         }
//         taskQueue.flushMicroTaskQueue();
//         while (component.todos.pop()) {}
//         taskQueue.flushMicroTaskQueue();

//         for (const todo of todos) {
//           expectLines(todo, 0);
//         }
//         expectLines(`Todo Count 0`, 1);
//       });

//       it(`replace ${todos.length} todos`, () => {
//         component.todos = todos.map(description => ({description, done: false}));
//         taskQueue.flushMicroTaskQueue();

//         for (const todo of todos) {
//           expectLines(todo, 2);
//         }
//         expectLines(`Todo Count ${todos.length}`, 1);
//       });
//     }
//   });

//   function expectLines(text: string, count: number): void {
//     expect(host.textContent.split('\n').filter(l => l.includes(text)).length).to.equal(count, `expected ${count}x '${text}'`);
//   }
// });
