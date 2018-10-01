import {
  Repeat,
  ForOfStatement,
  BindingIdentifier,
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
  LifecycleFlags,
  ChangeSet,
  IView
} from '../../../../src/index';
import { expect } from 'chai';
import { MockTextNodeTemplate } from '../../mock';
import { eachCartesianJoinFactory } from '../../../../../../scripts/test-lib';
import { createScopeForTest } from '../../binding/shared';


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
    <(($1: [any, number, string, string]) => [(sut: Repeat, host: Node, cs: ChangeSet) => void, string])[]>[

      ([items, count, expected]) => [(sut, host, cs) => {
        sut.$bind(BindingFlags.fromBind, createScopeForTest({ }));

        expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
        expect(host.textContent).to.equal('', `execute1, host.textContent`);
        verifyViewBindingContexts(sut.views, items);

        Lifecycle.beginAttach(host, LifecycleFlags.none).attach(sut).end();

        expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
        expect(host.textContent).to.equal('', `execute1, host.textContent`);

        cs.flushChanges();

        expect(host.textContent).to.equal(expected, `execute1, host.textContent`);

      }, `$bind(fromBind)  -> $attach(none)`],

      ([items, count, expected]) => [(sut, host) => {
        sut.$bind(BindingFlags.fromBind | BindingFlags.fromFlushChanges, createScopeForTest({ }));
        verifyViewBindingContexts(sut.views, items);

        expect(sut.views.length).to.equal(count), `execute1, sut.views.length`;
        expect(host.textContent).to.equal('', `execute1, host.textContent`);

        Lifecycle.beginAttach(host, LifecycleFlags.none).attach(sut).end();

        expect(host.textContent).to.equal(expected, `execute1, host.textContent`);

      }, `$bind(fromFlush) -> $attach(none)`]
    ],
    // second operation "execute2" (second bind or noop)
    <(($1: [any, number, string, string]) => [(sut: Repeat, host: Node, cs: ChangeSet) => void, string])[]>[

      ([items, count, expected]) => [(sut, host) => {
        sut.$bind(BindingFlags.fromBind, sut.$scope);
        verifyViewBindingContexts(sut.views, items);

        expect(sut.views.length).to.equal(count, `execute2, sut.views.length`);
        expect(host.textContent).to.equal(expected, `execute2, host.textContent`);

      }, `$bind(fromBind), same scope`],

      ([items, count, expected]) => [(sut, host, cs) => {
        sut.$bind(BindingFlags.fromBind, createScopeForTest({ }));
        verifyViewBindingContexts(sut.views, items);

        expect(sut.views.length).to.equal(count, `execute2, sut.views.length`);
        expect(host.textContent).to.equal(expected, `execute2, host.textContent`);

        cs.flushChanges();

        expect(sut.views.length).to.equal(count, `execute2, sut.views.length`);
        expect(host.textContent).to.equal(expected, `execute2, host.textContent`);

      }, `$bind(fromBind), new scope `],

      ([items, count, expected]) => [(sut, host) => {
        sut.$bind(BindingFlags.fromBind | BindingFlags.fromFlushChanges, createScopeForTest({ }));
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
    <(($1: [any, number, string, string], $2, $3, $4: [any, number, string, string]) => [(sut: Repeat, host: Node, cs: ChangeSet) => void, string])[]>[

      ([items,], $2, $3, [newItems, newCount, newExpected]) => [(sut, host, cs) => {
        sut.items = newItems;
        sut.itemsChanged(newItems, items, BindingFlags.updateTargetInstance);
        verifyViewBindingContexts(sut.views, newItems);

        cs.flushChanges();

        expect(sut.views.length).to.equal(newCount, `execute3, sut.views.length`);
        expect(host.textContent).to.equal(newExpected, `execute3, host.textContent`);

      }, `assign              `],

      ([items,], $2, $3, [newItems, newCount, newExpected]) => [(sut, host, cs) => {
        sut.items = newItems;
        sut.itemsChanged(newItems, items, BindingFlags.updateTargetInstance);
        verifyViewBindingContexts(sut.views, newItems);

        cs.flushChanges();

        expect(sut.views.length).to.equal(newCount, `execute3, sut.views.length`);
        expect(host.textContent).to.equal(newExpected, `execute3, host.textContent`);

        if (!(Array.isArray(newItems)) || items === newItems) {
          const arr = sut.items = [];
          sut.itemsChanged(arr, items, BindingFlags.updateTargetInstance);

          cs.flushChanges();

          expect(sut.views.length).to.equal(0, `execute3, sut.views.length`);
          expect(host.textContent).to.equal('', `execute3, host.textContent`);

          sut.items.push(1);
          cs.flushChanges();

          expect(sut.views.length).to.equal(1, `execute3, sut.views.length`);
          expect(host.textContent).to.equal('1', `execute3, host.textContent`);
        } else {
          expect(sut.views.length).to.equal(newCount, `execute3, sut.views.length`);
          expect(host.textContent).to.equal(newExpected, `execute3, host.textContent`);

          sut.items.push(1);
          cs.flushChanges();

          expect(sut.views.length).to.equal(newCount + 1, `execute3, sut.views.length`);
          expect(host.textContent).to.equal(newExpected + '1', `execute3, host.textContent`);
        }

        let textParts = host.textContent.split('');
        textParts.reverse();
        sut.items.reverse();
        cs.flushChanges();

        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent`);

        textParts.sort();
        sut.items.sort();
        cs.flushChanges();

        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent`);

        textParts.pop();
        sut.items.pop();
        cs.flushChanges();

        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent`);

        textParts.unshift('1', '2', '3');
        sut.items.unshift(1, 2, 3);
        cs.flushChanges();

        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent`);

        textParts.splice(0, 2);
        sut.items.splice(0, 2);
        cs.flushChanges();

        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent`);

        textParts.splice(0, 1, '1', '2', '3');
        sut.items.splice(0, 1, 1, 2, 3);
        cs.flushChanges();

        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent`);

        textParts.shift();
        sut.items.shift();
        cs.flushChanges();

        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent`);

      }, `mutate       `],

      ([items,], $2, $3, [newItems, newCount, newExpected]) => [(sut, host, cs) => {
        sut.items = newItems;
        sut.itemsChanged(newItems, items, BindingFlags.updateTargetInstance);
        verifyViewBindingContexts(sut.views, newItems);

        cs.flushChanges();

        expect(sut.views.length).to.equal(newCount, `execute3, sut.views.length`);
        expect(host.textContent).to.equal(newExpected, `execute3, host.textContent`);

        if (!(Array.isArray(newItems)) || items === newItems) {
          const arr = sut.items = [];
          sut.itemsChanged(arr, items, BindingFlags.updateTargetInstance);

          cs.flushChanges();

          expect(sut.views.length).to.equal(0, `execute3, sut.views.length`);
          expect(host.textContent).to.equal('', `execute3, host.textContent`);

          sut.items.push(1);
          cs.flushChanges();

          expect(sut.views.length).to.equal(1, `execute3, sut.views.length`);
          expect(host.textContent).to.equal('1', `execute3, host.textContent`);
        } else {
          expect(sut.views.length).to.equal(newCount, `execute3, sut.views.length`);
          expect(host.textContent).to.equal(newExpected, `execute3, host.textContent`);

          sut.items.push(1);
          cs.flushChanges();

          expect(sut.views.length).to.equal(newCount + 1, `execute3, sut.views.length`);
          expect(host.textContent).to.equal(newExpected + '1', `execute3, host.textContent`);
        }

        let itemsBeforeMutations = sut.items.slice();
        const textBeforeMutations = host.textContent;
        let textParts = host.textContent.split('');
        textParts.reverse();
        sut.items.reverse();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutations, `execute3, host.textContent`);

        textParts.sort();
        sut.items.sort();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutations, `execute3, host.textContent`);

        textParts.pop();
        sut.items.pop();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutations, `execute3, host.textContent`);

        textParts.unshift('1', '2', '3');
        sut.items.unshift(1, 2, 3);

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutations, `execute3, host.textContent`);

        textParts.splice(0, 2);
        sut.items.splice(0, 2);

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutations, `execute3, host.textContent`);

        textParts.splice(0, 1, '1', '2', '3');
        sut.items.splice(0, 1, 1, 2, 3);

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutations, `execute3, host.textContent`);

        textParts.shift();
        sut.items.shift();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutations, `execute3, host.textContent`);

        cs.flushChanges();

        verifyViewBindingContexts(sut.views, sut.items);
        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent`);

      }, `mutate(batch)`],

      ([items,], $2, $3, [newItems, newCount, newExpected]) => [(sut, host, cs) => {
        sut.items = newItems;
        sut.itemsChanged(newItems, items, BindingFlags.updateTargetInstance);
        verifyViewBindingContexts(sut.views, newItems);

        cs.flushChanges();

        expect(sut.views.length).to.equal(newCount, `execute3, sut.views.length`);
        expect(host.textContent).to.equal(newExpected, `execute3, host.textContent`);

        if (!(Array.isArray(newItems)) || items === newItems) {
          const arr = sut.items = [];
          sut.itemsChanged(arr, items, BindingFlags.updateTargetInstance);

          cs.flushChanges();

          expect(sut.views.length).to.equal(0, `execute3, sut.views.length`);
          expect(host.textContent).to.equal('', `execute3, host.textContent`);

          sut.items.push(1);
          cs.flushChanges();

          expect(sut.views.length).to.equal(1, `execute3, sut.views.length`);
          expect(host.textContent).to.equal('1', `execute3, host.textContent`);
        } else {
          expect(sut.views.length).to.equal(newCount, `execute3, sut.views.length`);
          expect(host.textContent).to.equal(newExpected, `execute3, host.textContent`);

          sut.items.push(1);
          cs.flushChanges();

          expect(sut.views.length).to.equal(newCount + 1, `execute3, sut.views.length`);
          expect(host.textContent).to.equal(newExpected + '1', `execute3, host.textContent`);
        }

        let itemsBeforeMutations = sut.items.slice();
        const textBeforeMutation = host.textContent;
        let textParts = host.textContent.split('');
        textParts.reverse();
        sut.items.reverse();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutation, `execute3, host.textContent`);

        textParts.sort();
        sut.items.sort();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutation, `execute3, host.textContent`);

        textParts.pop();
        sut.items.pop();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutation, `execute3, host.textContent`);

        textParts.unshift('1', '2', '3');
        sut.items.unshift(1, 2, 3);

        sut.items = ['a', 'b', 'c', 'd', 'e'];
        // assignment will immediately update the bindings (not the DOM)
        // any item mutations that came before are effectively ignored
        // any item mutations afterwards are batched again
        itemsBeforeMutations = sut.items.slice();
        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        textParts = sut.items.slice();

        expect(host.textContent).to.equal(textBeforeMutation, `execute3, host.textContent`);

        textParts.splice(0, 2);
        sut.items.splice(0, 2);

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutation, `execute3, host.textContent`);

        textParts.splice(0, 1, '1', '2', '3');
        sut.items.splice(0, 1, 1, 2, 3);

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutation, `execute3, host.textContent`);

        textParts.shift();
        sut.items.shift();

        verifyViewBindingContexts(sut.views, itemsBeforeMutations);
        expect(host.textContent).to.equal(textBeforeMutation, `execute3, host.textContent`);

        cs.flushChanges();

        verifyViewBindingContexts(sut.views, sut.items);
        expect(host.textContent).to.equal(textParts.join(''), `execute3, host.textContent`);

      }, `assign+mutate(batch)`]
    ],
    // fourth operation "execute4" (detach and unbind)
    <(($1: [any, number, string, string], $2, $3, $4: [any, number, string, string], $5: [(sut: Repeat, host: Node, cs: ChangeSet) => void, string]) => [(sut: Repeat, host: Node, cs: ChangeSet) => void, string])[]>[

      ([items, count], $2, $3, [newItems, newCount]) => [(sut, host) => {
        Lifecycle.beginDetach(LifecycleFlags.none).detach(sut).end();

        const currentCount = sut.items && sut.items.length ? sut.items.length : sut.items === items ? count : sut.items === newItems ? newCount : 0;

        expect(sut.views.length).to.equal(currentCount, `execute4, sut.views.length`);
        expect(host.textContent).to.equal('', `execute4, host.textContent`);

        sut.$unbind(BindingFlags.fromUnbind);

        expect(sut.views.length).to.equal(currentCount, `execute4, sut.views.length`);
        expect(host.textContent).to.equal('', `execute4, host.textContent`);

      }, `$detach(none)   -> $unbind(fromUnbind)`],

      ([items, count], $2, $3, [newItems, newCount]) => [(sut, host) => {
        Lifecycle.beginDetach(LifecycleFlags.unbindAfterDetached).detach(sut).end();

        const currentCount = sut.items && sut.items.length ? sut.items.length : sut.items === items ? count : sut.items === newItems ? newCount : 0;

        expect(sut.views.length).to.equal(currentCount, `execute4, sut.views.length`);
        expect(host.textContent).to.equal('', `execute4, host.textContent`);

        sut.$unbind(BindingFlags.fromUnbind);

        expect(sut.views.length).to.equal(currentCount, `execute4, sut.views.length`);
        expect(host.textContent).to.equal('', `execute4, host.textContent`);

      }, `$detach(unbind) -> $unbind(fromUnbind)`],
    ],
    // fifth operation "execute5" (second unbind)
    <(($1: [any, number, string, string], $2, $3, $4: [any, number, string, string], $5: [(sut: Repeat, host: Node, cs: ChangeSet) => void, string]) => [(sut: Repeat, host: Node, cs: ChangeSet) => void, string])[]>[

      ([items, count], $2, $3, [newItems, newCount]) => [(sut, host) => {
        sut.$unbind(BindingFlags.fromUnbind);

        const currentCount = sut.items && sut.items.length ? sut.items.length : sut.items === items ? count : sut.items === newItems ? newCount : 0;

        expect(sut.views.length).to.equal(currentCount, `execute5, sut.views.length`);
        expect(host.textContent).to.equal('', `execute5, host.textContent`);

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
      const { sut, host, cs } = setup<IObservedArray>();
      sut.items = items1;

      exec1(sut, host, cs);
      exec2(sut, host, cs);
      exec3(sut, host, cs);
      exec4(sut, host, cs);
      exec5(sut, host, cs);
    });
  });
});
