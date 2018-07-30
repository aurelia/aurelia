import { IContainer, DI, Registration } from '../../../../src/kernel/di';
import { Repeater } from '../../../../src/runtime/templating/resources/repeater';
import { enableArrayObservation, disableArrayObservation } from '../../../../src/runtime/binding/array-observer';
import { ITaskQueue } from '../../../../src/runtime/task-queue';
import { IRenderSlot, RenderSlot } from '../../../../src/runtime/templating/render-slot';
import { IViewOwner } from '../../../../src/runtime/templating/view';
import { IVisualFactory, IVisual, MotionDirection, RenderCallback } from '../../../../src/runtime/templating/visual';
import { expect } from 'chai';
import { IScope } from '../../../../src/runtime/binding/binding-context';
import { AccessScope } from '../../../../src/runtime/binding/ast';
import { Binding } from '../../../../src/runtime/binding/binding';
import { DetachLifecycle, AttachLifecycle, IAttach } from '../../../../src/runtime/templating/lifecycle';
import { INode, IView } from '../../../../src/runtime/dom';
import { IRenderContext } from '../../../../src/runtime/templating/render-context';
import { IBindScope, IObservedArray } from '../../../../src/runtime/binding/observation';
import { IEmulatedShadowSlot } from '../../../../src/runtime/templating/shadow-dom';
import { padRight, incrementItems, assertVisualsSynchronized } from '../../util';
import { BindingFlags } from '../../../../src/runtime/binding/binding-flags';

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

describe('ArrayRepeater - synchronize visuals', () => {
  let container: IContainer;
  let taskQueue: ITaskQueue;
  let slot: IRenderSlot;
  let owner: IViewOwner;
  let factory: IVisualFactory;
  let host: HTMLElement;
  let sut: Repeater<IObservedArray>;

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
    sut = new Repeater(taskQueue, slot, owner, factory, container);
    const binding = new Binding(<any>sourceExpression, sut, 'items', <any>null, <any>null, <any>null);
    owner.$bindable = [binding];
  });

  const initArr = [[], [3, 2, 1], [19, 18, 17, 16, 15, 14, 13, 12, 11, 10]];
  const flushModeArr = ['never', 'once', 'every'];
  const timesArr = [1, 2];
  const itemsArr = [[], [4, 5, 6], [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]];
  const sourceExpression = new AccessScope('');
  const itemName = 'item';

  // test with differently sized initial collections
  for (const init of initArr) {
    const initTitle = 'initSize=' + padRight(init.length, 2);

    // test with never flushing after mutation, flushing only after all mutations are done, or flushing after every mutation
    for (const flushMode of flushModeArr) {
      const flushModeTitle = 'flushMode=' + padRight(flushMode, 6);

      // repeat the operation different amounts of times to simulate complexer chained operations
      for (const times of timesArr) {
        const timesTitle = 'times=' + padRight(times, 2);

        // test with different amounts of items added
        for (const items of itemsArr) {
          const itemTitle = 'addCount=' + padRight(items.length, 2);

          for (const op of ['push', 'unshift']) {
            const opTitle = padRight(op, 10);
            it(`${opTitle} - ${initTitle} ${flushModeTitle} ${timesTitle} ${itemTitle}`, () => {
              const initItems = init.slice();
              const initItemsCopy = initItems.slice();
              const newItems = items.slice();
              sut.local = itemName;
              sut.items = initItems as any;
  
              const bindingContext = {}; // normally the items would be in here
              const scope = { bindingContext, overrideContext: { bindingContext, parentOverrideContext: null } };
              sut.bound(BindingFlags.none, scope);
              let i = 0;
              while (i < times) {
                // change the properties of the newly added items with each iteration to verify bindingTarget is updated correctly
                incrementItems(newItems, i);
                i++;
                sut.items[op](...newItems);
                switch (flushMode) {
                  case 'never':
                    // never flushed; verify everything is identical to the initial state after each mutation
                    assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName);
                    break;
                  case 'once':
                    // flushed once; verify everything is identical to the initial state except for the last iteration
                    if (i === times) {
                      taskQueue.flushMicroTaskQueue();
                      assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                    } else {
                      assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName);
                    }
                    break;
                  case 'every':
                    // flushed every; verify changes propagate to the DOM after each mutation
                    taskQueue.flushMicroTaskQueue();
                    assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                    break;
                }
              }
            });
          }
        }
        
        for (const op of ['pop', 'shift']) {
          const opTitle = padRight(op, 10);
          it(`${opTitle} - ${initTitle} ${flushModeTitle} ${timesTitle}`, () => {
            const initItems = init.slice();
            const initItemsCopy = initItems.slice();
            sut.local = itemName;
            sut.items = initItems as any;

            const bindingContext = {}; // normally the items would be in here
            const scope = { bindingContext, overrideContext: { bindingContext, parentOverrideContext: null } };
            sut.bound(BindingFlags.none, scope);
            let i = 0;
            while (i < times) {
              i++;
              sut.items[op]();
              switch (flushMode) {
                case 'never':
                  // never flushed; verify everything is identical to the initial state after each mutation
                  assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName);
                  break;
                case 'once':
                  // flushed once; verify everything is identical to the initial state except for the last iteration
                  if (i === times) {
                    taskQueue.flushMicroTaskQueue();
                    assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                  } else {
                    assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName);
                  }
                  break;
                case 'every':
                  // flushed every; verify changes propagate to the DOM after each mutation
                  taskQueue.flushMicroTaskQueue();
                  assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                  break;
              }
            }
          });
        }

        const startArr = [0, 1, 2];
        const deleteCountArr = [0, 1, 2];
    
        // test with different splice starting indices (only up to one position out of array bounds to reduce test redundancy)
        for (const start of startArr.filter(s => s <= init.length + 1)) {
          const startTitle = 'start=' + padRight(start, 2);
  
          // test with different splice deleteCount (only up to one higher than initial item count to reduce test redundancy)
          for (const deleteCount of deleteCountArr.filter(d => d <= init.length + 1)) {
            const deleteCountTitle = 'deleteCount=' + padRight(deleteCount, 2);
  
            // test with different amounts of items added
            for (const items of itemsArr) {
              const itemsTitle = 'itemCount=' + padRight(items.length, 2);
              const opTitle = padRight('splice', 10);
  
              it(`${opTitle} - ${initTitle} ${flushModeTitle} ${timesTitle} ${startTitle} ${deleteCountTitle} ${itemsTitle}`, () => {
                const initItems = init.slice();
                const initItemsCopy = initItems.slice();
                const newItems = items.slice();
                sut.local = itemName;
                sut.items = initItems as any;

                const bindingContext = {}; // normally the items would be in here
                const scope = { bindingContext, overrideContext: { bindingContext, parentOverrideContext: null } };
                sut.bound(BindingFlags.none, scope);
                let i = 0;
                while (i < times) {
                  // change the properties of the newly added items with each iteration to verify bindingTarget is updated correctly
                  incrementItems(newItems, i);
                  i++;
                  sut.items.splice(start, deleteCount, ...newItems);
                  switch (flushMode) {
                    case 'never':
                      // never flushed; verify everything is identical to the initial state after each mutation
                      assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName);
                      break;
                    case 'once':
                      // flushed once; verify everything is identical to the initial state except for the last iteration
                      if (i === times) {
                        taskQueue.flushMicroTaskQueue();
                        assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                      } else {
                        assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName);
                      }
                      break;
                    case 'every':
                      // flushed every; verify changes propagate to the DOM after each mutation
                      taskQueue.flushMicroTaskQueue();
                      assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                      break;
                  }
                }
              });
            }
          }
        }

        const assignArr = [[], [1], [1, 2]];

        for (const assign of assignArr) {
          const assignTitle = 'assign=' + padRight(assign.length, 2);
          const opTitle = padRight('assign', 10);
  
          it(`${opTitle} - ${initTitle} ${flushModeTitle} ${timesTitle} ${assignTitle}`, () => {
            const initItems = init.slice();
            let assignItems = assign.slice();
            sut.local = itemName;
            sut.items = initItems as any;

            const bindingContext = {}; // normally the items would be in here
            const scope = { bindingContext, overrideContext: { bindingContext, parentOverrideContext: null } };
            sut.bound(BindingFlags.none, scope);
            let i = 0;
            while (i < times) {
              assignItems = assignItems.slice();
              incrementItems(assignItems, i);
              i++;
              sut.items = <any>assignItems;
              switch (flushMode) {
                case 'never':
                  assertVisualsSynchronized(<any>sut.slot.children, init, itemName);
                  break;
                case 'once':
                  if (i === times) {
                    taskQueue.flushMicroTaskQueue();
                    assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                  } else {
                    assertVisualsSynchronized(<any>sut.slot.children, init, itemName);
                  }
                  break;
                case 'every':
                  taskQueue.flushMicroTaskQueue();
                  assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                  break;
              }
            }
          });
        }

        for (const op of ['reverse', 'sort']) {
          const opTitle = padRight(op, 10);
          it(`${opTitle} - ${initTitle} ${flushModeTitle} ${timesTitle}`, () => {
            const initItems = init.slice();
            const initItemsCopy = initItems.slice();
            sut.local = itemName;
            sut.items = initItems as any;

            const bindingContext = {}; // normally the items would be in here
            const scope = { bindingContext, overrideContext: { bindingContext, parentOverrideContext: null } };
            sut.bound(BindingFlags.none, scope);
            let i = 0;
            while (i < times) {
              i++;
              sut.items[op]();
              switch (flushMode) {
                case 'never':
                  // never flushed; verify everything is identical to the initial state after each mutation
                  assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName);
                  break;
                case 'once':
                  // flushed once; verify everything is identical to the initial state except for the last iteration
                  if (i === times) {
                    taskQueue.flushMicroTaskQueue();
                    assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                  } else {
                    assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName);
                  }
                  break;
                case 'every':
                  // flushed every; verify changes propagate to the DOM after each mutation
                  taskQueue.flushMicroTaskQueue();
                  assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                  break;
              }
            }
          });
        }
      }
    }
  }


  describe('assign - instance mutation', () => {
    it('should not trigger instance mutation when assigning the same instance', () => {
      const arr: any = [];
      (<any>sut)._items = arr;

      sut.items = arr;
      expect(sut.hasPendingInstanceMutation).to.be.false;
    });

    it('should trigger instance mutation when assigning a different instance', () => {
      (<any>sut)._items = [];

      sut.items = <any>[];
      expect(sut.hasPendingInstanceMutation).to.be.true;
    });

    it('should ignore pending changes from previous instance when assigning a new instance', () => {
      (<any>sut)._items = [];
      owner.$bindable = [new Binding(<any>new AccessScope(''), sut, 'items', <any>null, <any>null, <any>null)];
      sut.bound(BindingFlags.none, <any>{ });

      sut.items.push(1);
      expect(sut.items.length).to.equal(1);
      expect(sut.slot.children.length).to.equal(0);
      const items: any = [];
      sut.items = items;
      taskQueue.flushMicroTaskQueue();
      expect(sut.items.length).to.equal(0);
      expect(sut.slot.children.length).to.equal(0);
    });

    it('should include pending changes from new instance when assigning a new instance', () => {
      (<any>sut)._items = [];
      owner.$bindable = [new Binding(<any>new AccessScope(''), sut, 'items', <any>null, <any>null, <any>null)];
      sut.bound(BindingFlags.none, <any>{ });

      expect(sut.items.length).to.equal(0);
      expect(sut.slot.children.length).to.equal(0);
      const items: any = [];
      sut.items = items;
      sut.items.push(1);
      taskQueue.flushMicroTaskQueue();
      expect(sut.items.length).to.equal(1);
      expect(sut.slot.children.length).to.equal(1);
    });
  });
});

