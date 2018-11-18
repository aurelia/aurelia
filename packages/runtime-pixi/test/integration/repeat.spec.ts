import {
  Repeat,
  ForOfStatement,
  BindingIdentifier,
  AccessScope,
  Binding,
  IObservedArray,
  LifecycleFlags,
  BindingMode,
  ViewFactory,
  ObservedCollection,
  RuntimeBehavior,
  ObserverLocator,
  Lifecycle,
  IView,
  State,
  ILifecycle
} from '../../src/index';
import { expect } from 'chai';
import { MockTextNodeTemplate } from '../unit/mock';
import { eachCartesianJoinFactory } from '../../../../scripts/test-lib';
import { createScopeForTest } from '../unit/binding/shared';
import { DI } from '../../../kernel/src/index';


const expressions = {
  item: new AccessScope('item'),
  items: new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items'))
};

function verifyViewBindingContexts(views: IView[], items: any[]): void {
  if (items === null || items === undefined) {
    return;
  }
  if (typeof items === 'number') {
    for (let i = 0, ii = views.length; i < ii; ++i) {
      expect(views[i].$scope.bindingContext['item']).to.equal(i);
    }
  } else {
    for (let i = 0, ii = views.length; i < ii; ++i) {
      expect(views[i].$scope.bindingContext['item']).to.equal(items[i]);
    }
  }
}


function setup<T extends ObservedCollection>() {
  const container = DI.createContainer();
  const lifecycle = container.get(ILifecycle) as Lifecycle;
  const host = document.createElement('div');
  const location = document.createComment('au-loc');
  host.appendChild(location);

  const observerLocator = new ObserverLocator(lifecycle, null, null, null);
  const factory = new ViewFactory(null, <any>new MockTextNodeTemplate(expressions.item, observerLocator, container), lifecycle)
  const renderable = { } as any;
  const sut = new Repeat<T>(location, renderable, factory);
  renderable.$bindableHead = renderable.$bindableTail = new Binding(expressions.items, sut, 'items', BindingMode.toView, null, <any>container);
  sut.$state = 0;
  sut.$scope = null;
  const behavior = RuntimeBehavior.create(<any>Repeat, sut);
  behavior.applyTo(sut, lifecycle);


  return { sut, host, lifecycle };
}

describe(`Repeat`, () => {

  eachCartesianJoinFactory([
    // initial input items
    <(() => [any, number, string, string])[]>[
      () => [[],        0, ``     , `[]       `],
      () => [null,      0, ``     , `null     `],
      () => [undefined, 0, ``     , `undefined`],
      () => [1,         1, `0`    , `1        `],
      () => [5,         5, `01234`, `5        `],
      () => [['a'],     1, `a`    , `['a']    `],
      () => [[1],       1, `1`    , `[1]      `],
      () => [['a','a'], 2, `aa`   , `['a','a']`],
      () => [['a','b'], 2, `ab`   , `['a','b']`],
      () => [[1,2,3],   3, `123`  , `[1,2,3]  `]
    ],
    // first operation "execute1" (initial bind + attach)
    <(($1: [any, number, string, string]) => [(sut: Repeat, host: Node, lifecycle: Lifecycle) => void, string])[]>[

      ([items, count, expected]) => [(sut, host, lifecycle) => {
        sut.$bind(LifecycleFlags.fromBind, createScopeForTest({ }));

        expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
        expect(host.textContent).to.equal('', `execute1, host.textContent`);
        verifyViewBindingContexts(sut.views, items);

        sut.$attach(LifecycleFlags.none);

        expect(host.textContent).to.equal(expected, `execute1, host.textContent`);

      }, `$bind(fromBind)  -> $attach(none)`],

      ([items, count, expected]) => [(sut, host, lifecycle) => {
        sut.$bind(LifecycleFlags.fromBind | LifecycleFlags.fromFlush, createScopeForTest({ }));
        verifyViewBindingContexts(sut.views, items);

        expect(sut.views.length).to.equal(count), `execute1, sut.views.length`;
        expect(host.textContent).to.equal('', `execute1, host.textContent`);

        sut.$attach(LifecycleFlags.none);

        expect(host.textContent).to.equal(expected, `execute1, host.textContent`);

      }, `$bind(fromFlush) -> $attach(none)`]
    ],
    // second operation "execute2" (second bind or noop)
    <(($1: [any, number, string, string]) => [(sut: Repeat, host: Node, lifecycle: Lifecycle) => void, string])[]>[

      ([items, count, expected]) => [(sut, host) => {
        sut.$bind(LifecycleFlags.fromBind, sut.$scope);
        verifyViewBindingContexts(sut.views, items);

        expect(sut.views.length).to.equal(count, `execute2, sut.views.length`);
        expect(host.textContent).to.equal(expected, `execute2, host.textContent`);

      }, `$bind(fromBind), same scope`],

      ([items, count, expected]) => [(sut, host, lifecycle) => {
        sut.$bind(LifecycleFlags.fromBind, createScopeForTest({ }));
        verifyViewBindingContexts(sut.views, items);

        expect(sut.views.length).to.equal(count, `execute2, sut.views.length`);
        expect(host.textContent).to.equal(expected, `execute2, host.textContent`);

        lifecycle.processFlushQueue(LifecycleFlags.none)

        expect(sut.views.length).to.equal(count, `execute2, sut.views.length`);
        expect(host.textContent).to.equal(expected, `execute2, host.textContent`);

      }, `$bind(fromBind), new scope `],

      ([items, count, expected]) => [(sut, host) => {
        sut.$bind(LifecycleFlags.fromBind | LifecycleFlags.fromFlush, createScopeForTest({ }));
        verifyViewBindingContexts(sut.views, items);

        expect(sut.views.length).to.equal(count, `execute2, sut.views.length`);
        expect(host.textContent).to.equal(expected, `execute2, host.textContent`);

      }, `$bind(fromFlush), new scope`],

      ([,]) => [() => {

      }, `noop                       `]
    ],
    // assign items
    <(($1: [any, number, string, string]) => [any, number, string, string])[]>[
      ([,,]) => [[],      0,     ``   ,    `[]       `],
      ([,,]) => [[1],     1,     `1`  ,    `[1]      `],
      ([,,]) => [[1,2,3], 3,     `123`,    `[1,2,3]  `],
      ([items, count, expected, text]) => [items,   count, expected, text]
    ],
    // third operation "execute3" (assignment and/or mutation)
    <(($1: [any, number, string, string], $2, $3, $4: [any, number, string, string]) => [(sut: Repeat, host: Node, lifecycle: Lifecycle) => void, string])[]>[

      ([items,], $2, $3, [newItems, newCount, newExpected]) => [(sut, host, lifecycle) => {
        sut.items = newItems;
        sut.itemsChanged(newItems, items, LifecycleFlags.updateTargetInstance);
        verifyViewBindingContexts(sut.views, newItems);

        lifecycle.processFlushQueue(LifecycleFlags.none)

        expect(sut.views.length).to.equal(newCount, `execute3, sut.views.length 1`);
        expect(host.textContent).to.equal(newExpected, `execute3, host.textContent 1`);

      }, `assign              `],

      ([items,], $2, $3, [newItems, newCount, newExpected]) => [(sut, host, lifecycle) => {
        sut.items = newItems;
        sut.itemsChanged(newItems, items, LifecycleFlags.updateTargetInstance);
        verifyViewBindingContexts(sut.views, newItems);

        lifecycle.processFlushQueue(LifecycleFlags.none)

        expect(sut.views.length).to.equal(newCount, `execute3, sut.views.length 1`);
        expect(host.textContent).to.equal(newExpected, `execute3, host.textContent 1`);

        if (!(Array.isArray(newItems)) || items === newItems) {
          const arr = sut.items = [];
          sut.itemsChanged(arr, items, LifecycleFlags.updateTargetInstance);

          lifecycle.processFlushQueue(LifecycleFlags.none)

          expect(sut.views.length).to.equal(0, `execute3, sut.views.length 2`);
          expect(host.textContent).to.equal('', `execute3, host.textContent 2`);

          sut.items.push(1);
          lifecycle.processFlushQueue(LifecycleFlags.none)

          expect(sut.views.length).to.equal(1, `execute3, sut.views.length 3`);
          expect(host.textContent).to.equal('1', `execute3, host.textContent 3`);
        } else {
          expect(sut.views.length).to.equal(newCount, `execute3, sut.views.length 4`);
          expect(host.textContent).to.equal(newExpected, `execute3, host.textContent 4`);

          sut.items.push(1);
          lifecycle.processFlushQueue(LifecycleFlags.none)

          expect(sut.views.length).to.equal(newCount + 1, `execute3, sut.views.length 5`);
          expect(host.textContent).to.equal(newExpected + '1', `execute3, host.textContent 5`);
        }

        let textParts = host.textContent.split('');
        textParts.reverse();
        sut.items.reverse();
        lifecycle.processFlushQueue(LifecycleFlags.none)

        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent 6`);

        textParts.sort();
        sut.items.sort();
        lifecycle.processFlushQueue(LifecycleFlags.none)

        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent 7`);

        textParts.pop();
        sut.items.pop();
        lifecycle.processFlushQueue(LifecycleFlags.none)

        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent 8`);

        textParts.unshift('1', '2', '3');
        sut.items.unshift(1, 2, 3);
        lifecycle.processFlushQueue(LifecycleFlags.none)

        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent 9`);

        textParts.splice(0, 2);
        sut.items.splice(0, 2);
        lifecycle.processFlushQueue(LifecycleFlags.none)

        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent 10`);

        textParts.splice(0, 1, '1', '2', '3');
        sut.items.splice(0, 1, 1, 2, 3);
        lifecycle.processFlushQueue(LifecycleFlags.none)

        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent 11`);

        textParts.shift();
        sut.items.shift();
        lifecycle.processFlushQueue(LifecycleFlags.none)

        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent 12`);

      }, `mutate       `],

      ([items,], $2, $3, [newItems, newCount, newExpected]) => [(sut, host, lifecycle) => {
        sut.items = newItems;
        sut.itemsChanged(newItems, items, LifecycleFlags.updateTargetInstance);
        verifyViewBindingContexts(sut.views, newItems);

        lifecycle.processFlushQueue(LifecycleFlags.none)

        expect(sut.views.length).to.equal(newCount, `execute3, sut.views.length 1`);
        expect(host.textContent).to.equal(newExpected, `execute3, host.textContent 1`);

        if (!(Array.isArray(newItems)) || items === newItems) {
          const arr = sut.items = [];
          sut.itemsChanged(arr, items, LifecycleFlags.updateTargetInstance);

          lifecycle.processFlushQueue(LifecycleFlags.none)

          expect(sut.views.length).to.equal(0, `execute3, sut.views.length 2`);
          expect(host.textContent).to.equal('', `execute3, host.textContent 2`);

          sut.items.push(1);
          lifecycle.processFlushQueue(LifecycleFlags.none)

          expect(sut.views.length).to.equal(1, `execute3, sut.views.length 3`);
          expect(host.textContent).to.equal('1', `execute3, host.textContent 3`);
        } else {
          expect(sut.views.length).to.equal(newCount, `execute3, sut.views.length 4`);
          expect(host.textContent).to.equal(newExpected, `execute3, host.textContent 4`);

          sut.items.push(1);
          lifecycle.processFlushQueue(LifecycleFlags.none)

          expect(sut.views.length).to.equal(newCount + 1, `execute3, sut.views.length 5`);
          expect(host.textContent).to.equal(newExpected + '1', `execute3, host.textContent 5`);
        }

        let itemsBeforeMutations = sut.items.slice();
        const textBeforeMutations = host.textContent;
        let textParts = host.textContent.split('');
        textParts.reverse();
        sut.items.reverse();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutations, `execute3, host.textContent 6`);

        textParts.sort();
        sut.items.sort();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutations, `execute3, host.textContent 7`);

        textParts.pop();
        sut.items.pop();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutations, `execute3, host.textContent 8`);

        textParts.unshift('1', '2', '3');
        sut.items.unshift(1, 2, 3);

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutations, `execute3, host.textContent 9`);

        textParts.splice(0, 2);
        sut.items.splice(0, 2);

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutations, `execute3, host.textContent 10`);

        textParts.splice(0, 1, '1', '2', '3');
        sut.items.splice(0, 1, 1, 2, 3);

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutations, `execute3, host.textContent 11`);

        textParts.shift();
        sut.items.shift();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutations, `execute3, host.textContent 12`);

        lifecycle.processFlushQueue(LifecycleFlags.none)

        verifyViewBindingContexts(sut.views, sut.items);
        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent 13`);

      }, `mutate(batch)`],

      ([items,], $2, $3, [newItems, newCount, newExpected]) => [(sut, host, lifecycle) => {
        sut.items = newItems;
        sut.itemsChanged(newItems, items, LifecycleFlags.updateTargetInstance);
        verifyViewBindingContexts(sut.views, newItems);

        lifecycle.processFlushQueue(LifecycleFlags.none)

        expect(sut.views.length).to.equal(newCount, `execute3, sut.views.length 1`);
        expect(host.textContent).to.equal(newExpected, `execute3, host.textContent 1`);

        if (!(Array.isArray(newItems)) || items === newItems) {
          const arr = sut.items = [];
          sut.itemsChanged(arr, items, LifecycleFlags.updateTargetInstance);

          lifecycle.processFlushQueue(LifecycleFlags.none)

          expect(sut.views.length).to.equal(0, `execute3, sut.views.length 2`);
          expect(host.textContent).to.equal('', `execute3, host.textContent 2`);

          sut.items.push(1);
          lifecycle.processFlushQueue(LifecycleFlags.none)

          expect(sut.views.length).to.equal(1, `execute3, sut.views.length 3`);
          expect(host.textContent).to.equal('1', `execute3, host.textContent 3`);
        } else {
          expect(sut.views.length).to.equal(newCount, `execute3, sut.views.length 4`);
          expect(host.textContent).to.equal(newExpected, `execute3, host.textContent 4`);

          sut.items.push(1);
          lifecycle.processFlushQueue(LifecycleFlags.none)

          expect(sut.views.length).to.equal(newCount + 1, `execute3, sut.views.length 5`);
          expect(host.textContent).to.equal(newExpected + '1', `execute3, host.textContent 5`);
        }

        let itemsBeforeMutations = sut.items.slice();
        let textBeforeMutation = host.textContent;
        let textParts = host.textContent.split('');
        textParts.reverse();
        sut.items.reverse();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutation, `execute3, host.textContent 6`);

        textParts.sort();
        sut.items.sort();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutation, `execute3, host.textContent 7`);

        textParts.pop();
        sut.items.pop();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutation, `execute3, host.textContent 8`);

        textParts.unshift('1', '2', '3');
        sut.items.unshift(1, 2, 3);

        sut.items = ['a', 'b', 'c', 'd', 'e'];
        // assignment will immediately update the bindings (not the DOM)
        // if any attach/detach calls are triggered, the DOM is updated at the end of that lifecycle however
        // any item mutations that came before are effectively ignored
        // any item mutations afterwards are batched again
        itemsBeforeMutations = sut.items.slice();
        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        textParts = sut.items.slice();
        textBeforeMutation = textParts.join('');

        expect(host.textContent).to.equal(textBeforeMutation, `execute3, host.textContent 9`);

        textParts.splice(0, 2);
        sut.items.splice(0, 2);

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutation, `execute3, host.textContent 10`);

        textParts.splice(0, 1, '1', '2', '3');
        sut.items.splice(0, 1, 1, 2, 3);

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutation, `execute3, host.textContent 11`);

        textParts.shift();
        sut.items.shift();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutation, `execute3, host.textContent 12`);

        lifecycle.processFlushQueue(LifecycleFlags.none)

        verifyViewBindingContexts(sut.views, sut.items);
        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent 13`);

      }, `assign+mutate(batch)`]
    ],
    // fourth operation "execute4" (detach and unbind)
    <(($1: [any, number, string, string], $2, $3, $4: [any, number, string, string], $5: [(sut: Repeat, host: Node, lifecycle: Lifecycle) => void, string]) => [(sut: Repeat, host: Node, lifecycle: Lifecycle) => void, string])[]>[

      ([items, count], $2, $3, [newItems, newCount]) => [(sut, host, lifecycle) => {
        lifecycle.beginDetach();
        sut.$detach(LifecycleFlags.none);
        lifecycle.endDetach(LifecycleFlags.none);

        const currentCount = sut.items && sut.items.length ? sut.items.length : sut.items === items ? count : sut.items === newItems ? newCount : 0;

        expect(sut.views.length).to.equal(currentCount, `execute4, sut.views.length 1`);
        expect(host.textContent).to.equal('', `execute4, host.textContent 1`);

        sut.$unbind(LifecycleFlags.fromUnbind);

        expect(sut.views.length).to.equal(currentCount, `execute4, sut.views.length 2`);
        expect(host.textContent).to.equal('', `execute4, host.textContent 2`);

      }, `$detach(none)   -> $unbind(fromUnbind)`],

      ([items, count], $2, $3, [newItems, newCount]) => [(sut, host, lifecycle) => {
        lifecycle.beginDetach();
        sut.$detach(LifecycleFlags.none);
        lifecycle.enqueueUnbindAfterDetach(sut);
        lifecycle.endDetach(LifecycleFlags.none);

        const currentCount = sut.items && sut.items.length ? sut.items.length : sut.items === items ? count : sut.items === newItems ? newCount : 0;

        expect(sut.views.length).to.equal(currentCount, `execute4, sut.views.length 3`);
        expect(host.textContent).to.equal('', `execute4, host.textContent 3`);

        sut.$unbind(LifecycleFlags.fromUnbind);

        expect(sut.views.length).to.equal(currentCount, `execute4, sut.views.length 4`);
        expect(host.textContent).to.equal('', `execute4, host.textContent 4`);

      }, `$detach(unbind) -> $unbind(fromUnbind)`],
    ],
    // fifth operation "execute5" (second unbind)
    <(($1: [any, number, string, string], $2, $3, $4: [any, number, string, string], $5: [(sut: Repeat, host: Node, lifecycle: Lifecycle) => void, string]) => [(sut: Repeat, host: Node, lifecycle: Lifecycle) => void, string])[]>[

      ([items, count], $2, $3, [newItems, newCount]) => [(sut, host) => {
        sut.$unbind(LifecycleFlags.fromUnbind);

        const currentCount = sut.items && sut.items.length ? sut.items.length : sut.items === items ? count : sut.items === newItems ? newCount : 0;

        expect(sut.views.length).to.equal(currentCount, `execute5, sut.views.length 1`);
        expect(host.textContent).to.equal('', `execute5, host.textContent 1`);

      }, `$unbind(fromUnbind)`]
    ]
  ], (
    [items1,,, text1],
    [exec1, exec1Text],
    [exec2, exec2Text],
    [,,, text2],
    [exec3, exec3Text],
    [exec4, exec4Text],
    [exec5, exec5Text]) => {
    it(`assign=${text1} -> ${exec1Text} -> ${exec2Text} -> assign=${text2} -> ${exec3Text} -> ${exec4Text} -> ${exec5Text}`, () => {
      const { sut, host, lifecycle } = setup<IObservedArray>();
      sut.items = items1;

      exec1(sut, host, lifecycle);
      exec2(sut, host, lifecycle);
      exec3(sut, host, lifecycle);
      exec4(sut, host, lifecycle);
      exec5(sut, host, lifecycle);
    });
  });
});
