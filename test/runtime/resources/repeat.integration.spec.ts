import { IElementType, Component, IElementComponent } from '../../../src/runtime/templating/component';
import { IContainer, DI } from '../../../src/kernel/di';
import { ITaskQueue } from '../../../src/runtime/task-queue';
import { IRenderingEngine } from '../../../src/runtime/templating/rendering-engine';
import { expect } from 'chai';
import { TargetedInstructionType } from '../../../src/runtime/templating/instructions';
import { customElement } from '../../../src/runtime/decorators';
import { Repeat } from '../../../src/runtime/resources/repeat/repeat';
import { IExpressionParser } from '../../../src/runtime/binding/expression-parser';
import { AccessScope, AccessMember } from '../../../src/runtime/binding/ast';
import { enableArrayObservation, disableArrayObservation } from '../../../src/runtime/binding/array-observation';

const initialStates  = [
  {text: '', todos: []},
  {text: '1', todos: [{id: 1}]},
  {text: '12', todos: [{id: 1}, {id: 2}]},
  {text: '123', todos: [{id: 1}, {id: 2}, {id: 3}]}
];

for (const {todos: initialTodos, text: initialText} of initialStates) {
  class App {
    todos: any[] = initialTodos.slice();
  }
  
  describe(`Repeat with ${initialTodos.length} initial todos`, () => {
    let container: IContainer;
    let taskQueue: ITaskQueue;
    let renderingEngine: IRenderingEngine;
    let host: HTMLElement;
    let app: App & IElementComponent;

    beforeEach(() => {
      enableArrayObservation();
      container = DI.createContainer();
      container.register(Repeat);
      container.get(IExpressionParser).cache({
        items: new AccessScope('todos'),
        id: new AccessMember(new AccessScope('todo'), 'id')
      });
      taskQueue = container.get(ITaskQueue);
      taskQueue['microTaskQueue'] = [];
      renderingEngine = container.get(IRenderingEngine);
      host = document.createElement('app');

      Component.element(
        {
          name: 'foo',
          dependencies: [],
          template: `<au-marker class='au'></au-marker>`,
          instructions: [
            [
              {
                type: TargetedInstructionType.hydrateTemplateController,
                res: 'repeat',
                src: {
                  template: `<div><au-marker class='au'></au-marker> </div>`,
                  instructions: [
                    [
                      {
                        type: TargetedInstructionType.textBinding,
                        src: 'id'
                      }
                    ]
                  ]
                },
                instructions: [
                  {
                    type: TargetedInstructionType.oneWayBinding,
                    src: 'todos',
                    dest: 'items'
                  },
                  {
                    type: TargetedInstructionType.setProperty,
                    value: 'todo',
                    dest: 'local'
                  }
                ]
              }
            ]
          ],
          surrogates: []
        },
        App
      );

      app = new App() as any;
      app.$hydrate(renderingEngine, host);
      app.$bind();
      app.$attach(host);
      taskQueue.flushMicroTaskQueue();
    });

    afterEach(() => {
      disableArrayObservation();
    });

    it('should render correctly', () => {
      expect(host.innerText).to.equal(initialText);
    });

    it('reverses', () => {
      app.todos.reverse();
      taskQueue.flushMicroTaskQueue();
      expect(host.innerText).to.equal(Array.from(initialText).reverse().join(''));
    });

    const tests = [
      {text: '1', todos: [{id: 1}]},
      {text: '12', todos: [{id: 1}, {id: 2}]},
      {text: '123', todos: [{id: 1}, {id: 2}, {id: 3}]}
    ];
  
    for (const { todos, text } of tests) {
      it(`pop ${todos.length} todos`, () => {
        for (const todo of todos) {
          app.todos.pop();
        }
        taskQueue.flushMicroTaskQueue();
        expect(host.innerText).to.equal(text.slice(0, text.length - todos.length));
      });

      it(`shift ${todos.length} todos`, () => {
        for (const todo of todos) {
          app.todos.shift();
        }
        taskQueue.flushMicroTaskQueue();
        expect(host.innerText).to.equal(text.slice(todos.length - 1));
      });

      it(`splice ${todos.length} todos`, () => {
        app.todos.splice(0, 0, todos);
        taskQueue.flushMicroTaskQueue();
        expect(host.innerText).to.equal(`${text}${initialText}`);
      });

      it(`unshift ${todos.length} todos`, () => {
        app.todos.unshift(todos);
        taskQueue.flushMicroTaskQueue();
        expect(host.innerText).to.equal(`${text}${initialText}`);
      });

      it(`assign ${todos.length} todos`, () => {
        app.todos = todos.slice();
        taskQueue.flushMicroTaskQueue();
        expect(host.innerText).to.equal(text);
      });

      it(`push ${todos.length} todos`, () => {
        for (const todo of todos) {
          app.todos.push(todo);
        }
        taskQueue.flushMicroTaskQueue();
        expect(host.innerText).to.equal(`${initialText}${text}`);
      });
    }
  });
}

