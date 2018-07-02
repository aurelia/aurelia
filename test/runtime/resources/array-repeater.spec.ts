import { spy } from 'sinon';
import { IContainer, DI, Registration } from '../../../src/kernel/di';
import { ArrayRepeater } from '../../../src/runtime/resources/array-repeater';
import { enableArrayObservation, disableArrayObservation } from '../../../src/runtime/binding/array-observer';
import { ITaskQueue } from '../../../src/runtime/task-queue';
import { IRenderSlot, RenderSlot } from '../../../src/runtime/templating/render-slot';
import { IViewOwner } from '../../../src/runtime/templating/view';
import { IVisualFactory, IVisual, MotionDirection, RenderCallback } from '../../../src/runtime/templating/visual';
import { expect } from 'chai';
import { IScope } from '../../../src/runtime/binding/binding-context';
import { ForOfStatement, ForDeclaration, AccessScope } from '../../../src/runtime/binding/ast';
import { Binding } from '../../../src/runtime/binding/binding';
import { DetachLifecycle, AttachLifecycle, IAttach } from '../../../src/runtime/templating/lifecycle';
import { INode, IView } from '../../../src/runtime/dom';
import { IRenderContext } from '../../../src/runtime/templating/render-context';
import { IBindScope } from '../../../src/runtime/binding/observation';
import { IEmulatedShadowSlot } from '../../../src/runtime/templating/shadow-dom';

function assertSynchronized(visuals: IVisual[], items: any[], localName: string): void {
  const len = visuals.length;
  expect(len).to.equal(items.length, `visuals.length=${visuals.length}, items.length=${items.length}`);
  let i = 0;
  while (i < len) {
    const visual = visuals[i];
    if (visual.$scope.bindingContext[localName] !== items[i]) {
      let $actual = visuals
        .map(v => v.$scope.bindingContext[localName])
        .map(stringify)
        .join(',');
      let $expected = items.map(stringify).join(',');
      throw new Error(`expected visuals[${$actual}] to equal items[${$expected}]`);
    }
    i++;
  }
}

function stringify(value) {
  if (value === undefined) {
    return 'undefined';
  } else if (value === null) {
    return 'null';
  } else {
    return value.toString();
  }
}

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
  $bind(scope: IScope): void {
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

describe('ArrayRepeater', () => {
  let container: IContainer;
  let taskQueue: ITaskQueue;
  let slot: IRenderSlot;
  let owner: IViewOwner;
  let factory: IVisualFactory;
  let host: HTMLElement;
  let sut: ArrayRepeater;

  before(() => {
    enableArrayObservation();
  });

  after(() => {
    disableArrayObservation();
  });

  beforeEach(() => {
    container = DI.createContainer();
    container.register(Registration.singleton(IViewOwner, TestViewOwner));
    container.register(Registration.singleton(IVisualFactory, TestVisualFactory));
    taskQueue = container.get(ITaskQueue);
    host = document.createElement('div');
    slot = RenderSlot.create(host, true);
    owner = container.get(IViewOwner);
    factory = container.get(IVisualFactory);
    sut = new ArrayRepeater(taskQueue, slot, owner, factory, container);
  });

  describe('synchronize', () => {
    const initArr = [[], [1], [1, 2]];
    const startArr = [0, 1, 2];
    const deleteCountArr = [0, 1, 2];
    const itemsArr = [[], [4], [4, 5]];
    const localNameArr = ['foo', 'item'];
    const flushArr = ['never', 'once', 'every'];
    const timesArr = [1, 2];
    const title1 = 'ArrayRepeater splice: ';

    for (const localName of localNameArr) {
      const title2 = title1 + ' localName=' + padRight(localName, 5);
      const declaration = new ForDeclaration(localName);
      const iterable = new AccessScope(''); // we don't use this in this test anyway
      const sourceExpression = new ForOfStatement(declaration, iterable);

      for (const init of initArr) {
        const title3 = title2 + ' size=' + padRight(init.length, 2);

        for (const start of startArr.filter(s => s <= init.length)) { // todo: should include this and ensure undefined items are created too
          const title4 = title3 + ' start=' + padRight(start, 2);

          for (const deleteCount of deleteCountArr.filter(d => d <= init.length)) {
            const title5 = title4 + ' deleteCount=' + padRight(deleteCount, 2);

            for (const items of itemsArr) {
              const title6 = title5 + ' itemCount=' + padRight(items.length, 2);

              for (const flush of flushArr) {
                const title7 = title6 + ' flush=' + padRight(flush, 6);

                for (const times of timesArr) {
                  const title = title7 + ' times=' + padRight(times, 2);

                  it(title, () => {
                    const binding = new Binding(<any>sourceExpression, sut, 'items', <any>null, <any>null, <any>null);
                    owner.$bindable = [binding];
                    const initItems = init.slice();
                    const newItems = items.slice();
                    sut.items = initItems as any;
  
                    const bindingContext = {}; // normally the items would be in here
                    const scope = { bindingContext, overrideContext: { bindingContext, parentOverrideContext: null } };
                    sut.bound(scope);
                    let i = 0;
                    while (i < times) {
                      incrementItems(newItems, i);
                      i++;
                      sut.items.splice(start, deleteCount, ...newItems);
                      switch (flush) {
                        case 'never':
                          assertSynchronized(<any>sut.slot.children, init, localName);
                          break;
                        case 'once':
                          if (i === times) {
                            taskQueue.flushMicroTaskQueue();
                            assertSynchronized(<any>sut.slot.children, sut.items, localName);
                          } else {
                            assertSynchronized(<any>sut.slot.children, init, localName);
                          }
                          break;
                        case 'every':
                          taskQueue.flushMicroTaskQueue();
                          assertSynchronized(<any>sut.slot.children, sut.items, localName);
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
    }
  });
});

function padRight(str: any, len: number): string {
  str = str + '';
  return str + new Array(len - str.length + 1).join(' ');
}


function incrementItems(items: number[], by: number): void {
  let i = 0;
  let len = items.length;
  while (i < len) {
    items[i] += by;
    i++;
  }
}
