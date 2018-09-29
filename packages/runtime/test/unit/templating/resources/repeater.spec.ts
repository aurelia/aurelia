import { ChangeSet } from './../../../../src/binding/change-set';
import { IContainer, DI, Registration, Writable, PLATFORM } from '../../../../../kernel/src/index';
import {
  Repeat,
  IChangeSet,
  DOM,
  IRenderLocation,
  ForOfStatement,
  BindingIdentifier,
  IRenderable,
  IViewFactory,
  AccessScope,
  Binding,
  IObservedArray,
  BindingFlags,
  BindingMode,
  ViewFactory,
  ObservedCollection,
  RuntimeBehavior,
  ObserverLocator,
  Lifecycle,
  LifecycleFlags
} from '../../../../src/index';
import { expect } from 'chai';
import { padRight, incrementItems, assertVisualsSynchronized, createElement } from '../../util';
import { RenderableFake } from '../fakes/renderable-fake';
import { ViewFactoryFake } from '../fakes/view-factory-fake';
import { MockTextNodeTemplate } from '../../mock';
import { eachCartesianJoin, eachCartesianJoinFactory } from '../../../../../../scripts/test-lib';
import { createScopeForTest } from '../../binding/shared';

function createRenderLocation() {
  const parent = document.createElement('div');
  const child = document.createElement('div');
  parent.appendChild(child);
  return DOM.convertToRenderLocation(child);
}

const expressions = {
  item: new AccessScope('item'),
  items: new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items'))
};


function setup<T extends ObservedCollection>() {
  const cs = new ChangeSet();
  const host = document.createElement('div');
  const location = document.createComment('au-loc');
  host.appendChild(location);

  const observerLocator = new ObserverLocator(cs, null, null, null);
  const factory = new ViewFactory(null, <any>new MockTextNodeTemplate(expressions.item, observerLocator))
  const renderable = { } as any;
  const sut = new Repeat<T>(cs, location, renderable, factory);
  renderable.$bindables = [new Binding(expressions.items, sut, 'items', BindingMode.toView, null, null)];
  sut.$isAttached = false;
  sut.$isBound = false;
  sut.$scope = null;
  const behavior = RuntimeBehavior.create(<any>Repeat, sut);
  behavior.applyTo(sut, cs);


  return { sut, host, cs };
}

describe.only(`Repeat`, () => {

  eachCartesianJoinFactory([
    <(() => [any, number, string, string])[]>[
      () => [[],                    0, ``     , `[]                   `],
      () => [null,                  0, ``     , `null                 `],
      () => [undefined,             0, ``     , `undefined            `],
      () => [1,                     1, `0`    , `1                    `],
      () => [5,                     5, `01234`, `5                    `],
      () => [['a'],                 1, `a`    , `['a']                `],
      () => [[1],                   1, `1`    , `[1]                  `],
      () => [['a','a'],             2, `aa`   , `['a','a']            `],
      () => [['a','b'],             2, `ab`   , `['a','b']            `],
      () => [[1,2,3],               3, `123`  , `[1,2,3]              `],
      () => [['a','b','c','d','e'], 5, `abcde`, `['a','b','c','d','e']`]
    ],
    <(($1: [any, number, string, string]) => [(sut: Repeat, host: Node, cs: ChangeSet) => void, string])[]>[

      ([items, count, expected]) => [(sut, host, cs) => {
        sut.$bind(BindingFlags.fromBind, createScopeForTest({ }));

        expect(sut.views.length).to.equal(count);
        expect(host.textContent).to.equal('');

        Lifecycle.beginAttach(host, LifecycleFlags.none).attach(sut).end();

        expect(host.textContent).to.equal(expected);

        cs.flushChanges();

        expect(host.textContent).to.equal(expected);

      }, `flags=fromBind        `],

      ([items, count, expected]) => [(sut, host, cs) => {
        sut.$bind(BindingFlags.fromFlushChanges, createScopeForTest({ }));

        expect(sut.views.length).to.equal(count);

        Lifecycle.beginAttach(host, LifecycleFlags.none).attach(sut).end();

        expect(host.textContent).to.equal(expected);

      }, `flags=fromFlushChanges`]
    ]
  ], ([items, count, expected, initText], [execute, execText]) => {
    it(`initialItems=${initText} ${execText}`, () => {
      const { sut, host, cs } = setup<IObservedArray>();
      sut.items = items;

      execute(sut, host, cs);
    });
  });
});

describe('ArrayRepeater - synchronize visuals', () => {
  let container: IContainer;
  let changeSet: IChangeSet;
  let renderable: Writable<IRenderable>;
  let factory: IViewFactory;
  let location: IRenderLocation;
  let sut: Repeat<IObservedArray>;

  // it.only('test', () => {
  //   const { component, renderingEngine, host, changeSet } = setup();
  //   component.$hydrate(renderingEngine, host);
  //   component.$bind(BindingFlags.fromStartTask | BindingFlags.fromBind);
  //   Lifecycle.beginAttach(host, LifecycleFlags.none).attach(component).end();
  //   component['items'] = [1, 2, 3];
  //   expect(host.innerText).to.equal('');
  //   changeSet.flushChanges();
  //   expect(host.innerText).to.equal('123');
  // })

  beforeEach(() => {
    container = DI.createContainer();
    container.register(Registration.singleton(IRenderable, RenderableFake));
    container.register(Registration.singleton(IViewFactory, ViewFactoryFake));
    changeSet = container.get(IChangeSet);
    location = createRenderLocation();
    renderable = container.get(IRenderable);
    factory = container.get(IViewFactory);
    sut = new Repeat(changeSet, location, renderable, factory);
    const sourceExpression = new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items'));
    const binding = new Binding(sourceExpression, sut, 'items', <any>null, <any>null, <any>null);
    renderable.$bindables = [binding];
  });

  const initArr = [[], [3, 2, 1], [19, 18, 17, 16, 15, 14, 13, 12, 11, 10]];
  const flushModeArr = ['never', 'once', 'every'];
  const timesArr = [1, 2];
  const itemsArr = [[], [4, 5, 6], [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]];
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
              sut.items = initItems as any;

              const bindingContext = {}; // normally the items would be in here
              const scope = { bindingContext, overrideContext: { bindingContext, parentOverrideContext: null } };
              sut.$bind(BindingFlags.fromBind, scope);
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
                    assertVisualsSynchronized(sut.views, initItemsCopy, itemName);
                    break;
                  case 'once':
                    // flushed once; verify everything is identical to the initial state except for the last iteration
                    if (i === times) {
                      changeSet.flushChanges();
                      assertVisualsSynchronized(sut.views, sut.items, itemName);
                    } else {
                      assertVisualsSynchronized(sut.views, initItemsCopy, itemName);
                    }
                    break;
                  case 'every':
                    // flushed every; verify changes propagate to the DOM after each mutation
                    changeSet.flushChanges();
                    assertVisualsSynchronized(sut.views, sut.items, itemName);
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
            sut.items = initItems as any;

            const bindingContext = {}; // normally the items would be in here
            const scope = { bindingContext, overrideContext: { bindingContext, parentOverrideContext: null } };
            sut.$bind(BindingFlags.fromBind, scope);
            changeSet.flushChanges();
            let i = 0;
            while (i < times) {
              i++;
              sut.items[op]();
              switch (flushMode) {
                case 'never':
                  // never flushed; verify everything is identical to the initial state after each mutation
                  assertVisualsSynchronized(sut.views, initItemsCopy, itemName);
                  break;
                case 'once':
                  // flushed once; verify everything is identical to the initial state except for the last iteration
                  if (i === times) {
                    changeSet.flushChanges();
                    assertVisualsSynchronized(sut.views, sut.items, itemName);
                  } else {
                    assertVisualsSynchronized(sut.views, initItemsCopy, itemName);
                  }
                  break;
                case 'every':
                  // flushed every; verify changes propagate to the DOM after each mutation
                  changeSet.flushChanges();
                  assertVisualsSynchronized(sut.views, sut.items, itemName);
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
                sut.items = initItems as any;

                const bindingContext = {}; // normally the items would be in here
                const scope = { bindingContext, overrideContext: { bindingContext, parentOverrideContext: null } };
                sut.$bind(BindingFlags.fromBind, scope);
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
                      assertVisualsSynchronized(sut.views, initItemsCopy, itemName);
                      break;
                    case 'once':
                      // flushed once; verify everything is identical to the initial state except for the last iteration
                      if (i === times) {
                        changeSet.flushChanges();
                        assertVisualsSynchronized(sut.views, sut.items, itemName);
                      } else {
                        assertVisualsSynchronized(sut.views, initItemsCopy, itemName);
                      }
                      break;
                    case 'every':
                      // flushed every; verify changes propagate to the DOM after each mutation
                      changeSet.flushChanges();
                      assertVisualsSynchronized(sut.views, sut.items, itemName);
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
            sut.items = initItems as any;

            const bindingContext = {}; // normally the items would be in here
            const scope = { bindingContext, overrideContext: { bindingContext, parentOverrideContext: null } };
            sut.$bind(BindingFlags.fromBind, scope);
            changeSet.flushChanges();
            let i = 0;
            while (i < times) {
              assignItems = assignItems.slice();
              incrementItems(assignItems, i);
              i++;
              sut.items = <any>assignItems;
              switch (flushMode) {
                case 'never':
                  assertVisualsSynchronized(sut.views, init, itemName);
                  break;
                case 'once':
                  if (i === times) {
                    changeSet.flushChanges();
                    assertVisualsSynchronized(sut.views, sut.items, itemName);
                  } else {
                    assertVisualsSynchronized(sut.views, init, itemName);
                  }
                  break;
                case 'every':
                  changeSet.flushChanges();
                  assertVisualsSynchronized(sut.views, sut.items, itemName);
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
            sut.$bind(BindingFlags.fromBind, scope);
            changeSet.flushChanges();
            let i = 0;
            while (i < times) {
              i++;
              sut.items[op]();
              switch (flushMode) {
                case 'never':
                  // never flushed; verify everything is identical to the initial state after each mutation
                  assertVisualsSynchronized(sut.views, initItemsCopy, itemName);
                  break;
                case 'once':
                  // flushed once; verify everything is identical to the initial state except for the last iteration
                  if (i === times) {
                    changeSet.flushChanges();
                    assertVisualsSynchronized(sut.views, sut.items, itemName);
                  } else {
                    assertVisualsSynchronized(sut.views, initItemsCopy, itemName);
                  }
                  break;
                case 'every':
                  // flushed every; verify changes propagate to the DOM after each mutation
                  changeSet.flushChanges();
                  assertVisualsSynchronized(sut.views, sut.items, itemName);
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
      renderable.$bindables = [new Binding(new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items')), sut, 'items', <any>null, <any>null, <any>null)];
      sut.$bind(BindingFlags.fromBind, <any>{ });

      sut.items.push(1);
      expect(sut.items.length).to.equal(1);
      expect(sut.views.length).to.equal(0);
      const items: any = [];
      sut.items = items;
      changeSet.flushChanges();
      expect(sut.items.length).to.equal(0);
      expect(sut.views.length).to.equal(0);
    });

    it('should include pending changes from new instance when assigning a new instance', () => {
      (<any>sut)._items = [];
      renderable.$bindables = [new Binding(new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items')), sut, 'items', <any>null, <any>null, <any>null)];
      sut.$bind(BindingFlags.fromBind, <any>{ });

      expect(sut.items.length).to.equal(0);
      expect(sut.views.length).to.equal(0);
      const items: any = [];
      sut.items = items;
      sut.items.push(1);
      changeSet.flushChanges();
      expect(sut.items.length).to.equal(1);
      expect(sut.views.length).to.equal(1);
    });
  });
});

