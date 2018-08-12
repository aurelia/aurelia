import { IContainer, DI, Registration } from '@aurelia/kernel';
import { Repeat, IChangeSet } from '@aurelia/runtime';
import { enableArrayObservation, disableArrayObservation } from '@aurelia/runtime';
import { IViewSlot, ViewSlot } from '@aurelia/runtime';
import { IRenderable } from '@aurelia/runtime';
import { IViewFactory } from '@aurelia/runtime';
import { expect } from 'chai';
import { AccessScope } from '@aurelia/runtime';
import { Binding } from '@aurelia/runtime';
import { IObservedArray } from '@aurelia/runtime';
import { padRight, incrementItems, assertVisualsSynchronized } from '../../util';
import { BindingFlags } from '@aurelia/runtime';
import { RenderableFake } from '../fakes/renderable-fake';
import { ViewFactoryFake } from '../fakes/view-factory-fake';

describe('ArrayRepeater - synchronize visuals', () => {
  let container: IContainer;
  let changeSet: IChangeSet;
  let slot: IViewSlot;
  let renderable: IRenderable;
  let factory: IViewFactory;
  let host: HTMLElement;
  let sut: Repeat<IObservedArray>;

  before(() => {
    enableArrayObservation();
  });

  after(() => {
    disableArrayObservation();
  });

  beforeEach(() => {
    container = DI.createContainer();
    container.register(Registration.singleton(IRenderable, RenderableFake));
    container.register(Registration.singleton(IViewFactory, ViewFactoryFake));
    changeSet = container.get(IChangeSet);
    host = document.createElement('div');
    slot = ViewSlot.create(host, true);
    renderable = container.get(IRenderable);
    factory = container.get(IViewFactory);
    sut = new Repeat(changeSet, slot, renderable, factory, container);
    const binding = new Binding(<any>sourceExpression, sut, 'items', <any>null, <any>null, <any>null);
    renderable.$bindables = [binding];
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
              changeSet.flushChanges();
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
                      changeSet.flushChanges();
                      assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                    } else {
                      assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName);
                    }
                    break;
                  case 'every':
                    // flushed every; verify changes propagate to the DOM after each mutation
                    changeSet.flushChanges();
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
            changeSet.flushChanges();
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
                    changeSet.flushChanges();
                    assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                  } else {
                    assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName);
                  }
                  break;
                case 'every':
                  // flushed every; verify changes propagate to the DOM after each mutation
                  changeSet.flushChanges();
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
                changeSet.flushChanges();
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
                        changeSet.flushChanges();
                        assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                      } else {
                        assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName);
                      }
                      break;
                    case 'every':
                      // flushed every; verify changes propagate to the DOM after each mutation
                      changeSet.flushChanges();
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
            changeSet.flushChanges();
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
                    changeSet.flushChanges();
                    assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                  } else {
                    assertVisualsSynchronized(<any>sut.slot.children, init, itemName);
                  }
                  break;
                case 'every':
                  changeSet.flushChanges();
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
            changeSet.flushChanges();
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
                    changeSet.flushChanges();
                    assertVisualsSynchronized(<any>sut.slot.children, sut.items, itemName);
                  } else {
                    assertVisualsSynchronized(<any>sut.slot.children, initItemsCopy, itemName);
                  }
                  break;
                case 'every':
                  // flushed every; verify changes propagate to the DOM after each mutation
                  changeSet.flushChanges();
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
      renderable.$bindables = [new Binding(<any>new AccessScope(''), sut, 'items', <any>null, <any>null, <any>null)];
      sut.bound(BindingFlags.none, <any>{ });

      sut.items.push(1);
      expect(sut.items.length).to.equal(1);
      expect(sut.slot.children.length).to.equal(0);
      const items: any = [];
      sut.items = items;
      changeSet.flushChanges();
      expect(sut.items.length).to.equal(0);
      expect(sut.slot.children.length).to.equal(0);
    });

    it('should include pending changes from new instance when assigning a new instance', () => {
      (<any>sut)._items = [];
      renderable.$bindables = [new Binding(<any>new AccessScope(''), sut, 'items', <any>null, <any>null, <any>null)];
      sut.bound(BindingFlags.none, <any>{ });

      expect(sut.items.length).to.equal(0);
      expect(sut.slot.children.length).to.equal(0);
      const items: any = [];
      sut.items = items;
      sut.items.push(1);
      changeSet.flushChanges();
      expect(sut.items.length).to.equal(1);
      expect(sut.slot.children.length).to.equal(1);
    });
  });
});

