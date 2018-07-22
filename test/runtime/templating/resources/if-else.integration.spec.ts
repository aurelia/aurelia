import { IContainer, DI, Registration } from '../../../../src/kernel/di';
import { Repeater } from '../../../../src/runtime/templating/resources/repeater';
import { enableArrayObservation, disableArrayObservation } from '../../../../src/runtime/binding/observers/array-observer';
import { ITaskQueue } from '../../../../src/runtime/task-queue';
import { IRenderSlot, RenderSlot } from '../../../../src/runtime/templating/render-slot';
import { IViewOwner } from '../../../../src/runtime/templating/view';
import { IVisualFactory, IVisual, MotionDirection, RenderCallback } from '../../../../src/runtime/templating/visual';
import { expect } from 'chai';
import { IScope } from '../../../../src/runtime/binding/binding-context';
import { ForOfStatement, ForDeclaration, AccessScope } from '../../../../src/runtime/binding/ast';
import { Binding, BindingFlags } from '../../../../src/runtime/binding/binding';
import { DetachLifecycle, AttachLifecycle, IAttach } from '../../../../src/runtime/templating/lifecycle';
import { INode, IView, DOM } from '../../../../src/runtime/dom';
import { IRenderContext } from '../../../../src/runtime/templating/render-context';
import { IBindScope, IObservedArray } from '../../../../src/runtime/binding/observation';
import { IEmulatedShadowSlot } from '../../../../src/runtime/templating/shadow-dom';
import { padRight, incrementItems, assertVisualsSynchronized, createAureliaRepeaterConfig, IRepeaterFixture, createRepeater, createIf, createAureliaIfConfig, IIfFixture } from '../../util';
import { If } from '../../../../src/runtime/templating/resources/if';
import { Aurelia } from '../../../../src/runtime/aurelia';
import { ICustomElement } from '../../../../src/runtime/templating/custom-element';

class TestViewOwner implements IViewOwner {
  $context: IRenderContext;
  $view: IView;
  $scope: IScope;
  $isBound: boolean;

  $bindable: IBindScope[];
  $attachable: IAttach[];

  $slots?: Record<string, IEmulatedShadowSlot>;

  constructor() {
    this.$bindable = [];
    this.$attachable = [];
  }
}

class TestVisualFactory implements IVisualFactory {
  name: string;
  isCaching: boolean;
  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void {}
  create(): IVisual {
    return new TestVisual();
  }
}

class TestVisual implements IVisual {
  // IVisual impl
  factory: IVisualFactory;
  
  parent: IRenderSlot;
  onRender: RenderCallback;
  renderState: any;

  animate(direction: MotionDirection): void | Promise<boolean> {}
  tryReturnToCache(): boolean {
    return true;
  }
  
  // IBindScope impl
  $bind(flags: BindingFlags, scope: IScope): void {
    this.$scope = scope;
  }
  $unbind(): void {}

  // IAttach impl
  $attach(encapsulationSource: INode, lifecycle?: AttachLifecycle): void {}
  $detach(lifecycle?: DetachLifecycle): void {}

  // IViewOwner impl
  $context: IRenderContext;
  $view: IView;
  $scope: IScope;
  $isBound: boolean;

  $bindable: IBindScope[];
  $attachable: IAttach[];

  $slots?: Record<string, IEmulatedShadowSlot>;

  constructor() {
    this.$bindable = [];
    this.$attachable = [];
  }
}

describe('If', () => {
  let container: IContainer;
  let taskQueue: ITaskQueue;
  let au: Aurelia;
  let host: INode;
  let sut: If;

  let aureliaConfig: ReturnType<typeof createAureliaIfConfig>;
  let component: ICustomElement;

  beforeEach(() => {
    container = DI.createContainer();
    taskQueue = container.get(ITaskQueue);
    au = new Aurelia(container);
    host = DOM.createElement('app');
    DOM.appendChild(document.body, host);
  });

  describe('splice - synchronize', () => {
    const fixtures: IIfFixture[] = [
      { type: If, elName: 'foo1', conditionName: 'foo', propName: 'bar' },
      { type: If, elName: 'foo2', conditionName: 'baz', propName: 'qux' }
    ];
    const initialConditionArr = [true, false];
    const secondConditionArr = [true, false];
    const valueArr = ['foo11', 'bar11'];
    const flushArr = ['never', 'once', 'every'];
    const timesArr = [1, 2, 3];
    const title1 = 'If (render): ';

    // test with different condition and property names
    for (const fixture of fixtures) {      
      const { elName, conditionName, propName } = fixture;
      const title2 = title1 + ' fixture=' + padRight(`${elName},${conditionName},${propName}`, 16);

      // test with different initial conditions
      for (const initialCondition of initialConditionArr) {
        const title3 = title2 + ' initialCondition=' + padRight(initialCondition, 6);

        // test with different second conditions
        for (const secondCondition of secondConditionArr) {
          const title4 = title3 + ' secondCondition=' + padRight(secondCondition, 6);

          // test with different values
          for (const value of valueArr) {
            const title5 = title4 + ' value=' + padRight(value, 6);

            // test with never flushing after mutation, flushing only after all mutations are done, or flushing after every mutation
            for (const flush of flushArr) {
              const title6 = title5 + ' flush=' + padRight(flush, 6);

              // repeat the operation different amounts of times to simulate complexer chained operations
              for (const times of timesArr) {
                const title = title6 + ' times=' + padRight(times, 2);
                it(title, async () => {
                  aureliaConfig = createAureliaIfConfig(fixture);
                  au.register(aureliaConfig);
                  component = createIf(fixture, initialCondition, value);
                  component.$flags = BindingFlags.connectImmediate; 
                  au.app({ host, component });
                  au.start();
                  sut = <any>au['components'][0].$attachable[0];
                  taskQueue.flushMicroTaskQueue();
                  let condition = initialCondition;
                  expect((<any>host).innerText).to.equal(condition ? value : '');
                  let newValue = value;
                  let i = 0;
                  while (i < times) {
                    newValue += i++;
                    condition = component[conditionName] = i === 1 ? secondCondition : !secondCondition;
                    component[propName] = newValue;
                    switch (flush) {
                      case 'never':
                        // never flushed; verify everything is identical to the initial state after each mutation
                        expect((<any>host).innerText).to.equal(initialCondition ? value : '');
                        break;
                      case 'once':
                        // flushed once; verify everything is identical to the initial state except for the last iteration
                        if (i === times) {
                          taskQueue.flushMicroTaskQueue();
                          expect((<any>host).innerText).to.equal(condition ? newValue : '');
                        } else {
                          expect((<any>host).innerText).to.equal(initialCondition ? value : '');
                        }
                        break;
                      case 'every':
                        // flushed every; verify changes propagate to the DOM after each mutation
                        taskQueue.flushMicroTaskQueue();
                        expect((<any>host).innerText).to.equal(condition ? newValue : '');
                        break;
                    }
                  }
                });
              }
            }
          }
        }
      }
    }
  });
});

