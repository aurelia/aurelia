import { createMarker, MockNodeSequence, MockIfElseTextNodeTemplate } from './../../mock';
import {
  ITemplateSource,
  TargetedInstructionType,
  BindingMode,
  ForOfStatement,
  BindingIdentifier,
  Aurelia,
  Repeat,
  IChangeSet,
  DOM,
  INode,
  ICustomElement,
  IExpressionParser,
  Binding,
  IObservedArray,
  BindingFlags,
  AccessScope,
  AccessMember,
  ViewFactory,
  ObservedCollection,
  RuntimeBehavior,
  ObserverLocator,
  Lifecycle,
  LifecycleFlags,
  ChangeSet,
  IView,
  Interpolation
} from '../../../../src/index';
import { IContainer, DI } from '../../../../../kernel/src/index';
import { createAureliaRepeaterConfig, createRepeater } from '../../util';
import { expect } from 'chai';
import { MockIfTextNodeTemplate } from '../../mock';
import { eachCartesianJoinFactory } from '../../../../../../scripts/test-lib';
import { createScopeForTest } from '../../binding/shared';


const expressions = {
  item: new AccessScope('item'),
  items: new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items')),
  show: new AccessScope('show', 0)
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
  const factory = new ViewFactory(null, <any>new MockIfElseTextNodeTemplate(expressions.show, observerLocator, cs));
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
    <(() => [any, number, boolean, string, string, string])[]>[
      () => [[{if:1,else:2},{if:3,else:4}],   2, true,  `13`, `24`, `[{if:1,else:2},{if:3,else:4}] show=true `],
      () => [[{if:1,else:2},{if:3,else:4}],   2, false, `13`, `24`, `[{if:1,else:2},{if:3,else:4}] show=false`]
    ],
    // first operation "execute1" (initial bind + attach)
    <(($1: [any, number, boolean, string, string, string]) => [(sut: Repeat, host: Node, cs: ChangeSet) => void, string])[]>[

      ([items, count, show, trueValue, falseValue]) => [(sut, host, cs) => {
        sut.$bind(BindingFlags.fromBind, createScopeForTest({ show }));

        expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
        expect(host.textContent).to.equal('', `execute1, host.textContent`);
        verifyViewBindingContexts(sut.views, items);

        Lifecycle.beginAttach(host, LifecycleFlags.none).attach(sut).end();

        expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
        expect(host.textContent).to.equal('', `execute1, host.textContent`);

        cs.flushChanges();

        expect(sut.$scope.bindingContext.show).to.equal(show);
        expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute1, host.textContent`);

      }, `$bind(fromBind)  -> $attach(none)`],

      ([items, count, show, trueValue, falseValue]) => [(sut, host, cs) => {
        sut.$bind(BindingFlags.fromFlushChanges, createScopeForTest({ show }));

        expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
        expect(host.textContent).to.equal('', `execute1, host.textContent`);
        verifyViewBindingContexts(sut.views, items);

        Lifecycle.beginAttach(host, LifecycleFlags.none).attach(sut).end();

        expect(sut.$scope.bindingContext.show).to.equal(show);
        expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute1, host.textContent`);

      }, `$bind(fromFlush) -> $attach(none)`]
    ],
    // second operation "execute2" (second bind or noop)
    <(($1: [any, number, boolean, string, string, string]) => [(sut: Repeat, host: Node, cs: ChangeSet) => void, string])[]>[

      ([items, count, show, trueValue, falseValue]) => [(sut, host, cs) => {
        sut.$bind(BindingFlags.fromBind, sut.$scope);

        expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
        verifyViewBindingContexts(sut.views, items);

        expect(sut.$scope.bindingContext.show).to.equal(show);
        expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute2, host.textContent`);

      }, `$bind(fromBind), same scope`],

      ([items, count, show, trueValue, falseValue]) => [(sut, host, cs) => {
        sut.$bind(BindingFlags.fromBind, createScopeForTest({ show }));

        expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
        verifyViewBindingContexts(sut.views, items);

        expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute2, host.textContent`);

        cs.flushChanges();

        expect(sut.$scope.bindingContext.show).to.equal(show);
        expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute2, host.textContent`);

      }, `$bind(fromBind), new scope `],

      ([items, count, show, trueValue, falseValue]) => [(sut, host, cs) => {
        sut.$bind(BindingFlags.fromFlushChanges, createScopeForTest({ show }));

        expect(sut.views.length).to.equal(count, `execute1, sut.views.length`);
        verifyViewBindingContexts(sut.views, items);

        expect(sut.$scope.bindingContext.show).to.equal(show);
        expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute2, host.textContent`);

      }, `$bind(fromFlush), new scope`],

      ([,]) => [() => {

      }, `noop                       `]
    ],
    // third operation "execute3" (change value)
    <(($1: [any, number, boolean, string, string, string]) => [(sut: Repeat, host: Node, cs: ChangeSet) => void, string])[]>[

      ([items, count, show, trueValue, falseValue]) => [(sut, host, cs) => {
        sut.$scope.bindingContext.show = !sut.$scope.bindingContext.show;

        cs.flushChanges();

        expect(sut.$scope.bindingContext.show).not.to.equal(show);
        expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute3, host.textContent`);

      }, `show=!show    `],

      ([items, count, show, trueValue, falseValue]) => [(sut, host, cs) => {
        sut.$scope.bindingContext.show = !sut.$scope.bindingContext.show;
        expect(sut.$scope.bindingContext.show).not.to.equal(show);
        sut.$scope.bindingContext.show = !sut.$scope.bindingContext.show;
        expect(sut.$scope.bindingContext.show).to.equal(show);

        cs.flushChanges();

        expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? trueValue : falseValue, `execute3, host.textContent`);

      }, `show=!show(x2)`],

      // NOTE: these (and other tests) need to get fixed. Currently mutations don't appear to be picked up automatically.
      // Not sure yet whether this is a repeater problem or an if/else problem (or perhaps both)

      // ([items, count, show, trueValue, falseValue]) => [(sut, host, cs) => {
      //   const newItems = sut.items = [{if:'a',else:'b'}];
      //   sut.itemsChanged(newItems, items, BindingFlags.updateTargetInstance);
      //   verifyViewBindingContexts(sut.views, newItems);

      //   cs.flushChanges();

      //   expect(sut.views.length).to.equal(1, `execute3, sut.views.length`);
      //   expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? 'a' : 'b', `execute3, host.textContent`);

      // }, `assign=[{if:'a',else:'b'}]`],

      // ([items, count, show, trueValue, falseValue]) => [(sut, host, cs) => {
      //   sut.items.push({if:'a',else:'b'});

      //   cs.flushChanges();
      //   verifyViewBindingContexts(sut.views, sut.items);

      //   expect(sut.views.length).to.equal(count + 1, `execute3, sut.views.length`);
      //   expect(host.textContent).to.equal(sut.$scope.bindingContext.show ? `${trueValue}a` : `${falseValue}b`, `execute3, host.textContent`);

      // }, `push={if:'a',else:'b'}`]
    ],
  ], (
    [items1, count, show, trueValue, falseValue, text1],
    [exec1, exec1Text],
    [exec2, exec2Text],
    [exec3, exec3Text]) => {
    it(`assign=${text1} -> ${exec1Text} -> ${exec2Text} -> ${exec3Text}`, () => {
      const { sut, host, cs } = setup<IObservedArray>();
      sut.items = items1;

      exec1(sut, host, cs);
      exec2(sut, host, cs);
      exec3(sut, host, cs);
    });
  });
});


describe('ArrayRepeater - render html', () => {
  let container: IContainer;
  let changeSet: IChangeSet;
  let au: Aurelia;
  let host: INode;

  let aureliaConfig: ReturnType<typeof createAureliaRepeaterConfig>;
  let component: ICustomElement;

  beforeEach(() => {
    container = DI.createContainer();
    changeSet = container.get(IChangeSet);
    au = new Aurelia(container);
    host = DOM.createElement('app');
    DOM.appendChild(document.body, host);
  });

  it('triple nested repeater should render correctly', () => {
    const initItems = [
      {
        id: 1,
        innerTodos: [
          { innerId: 10, innerInnerTodos: [ { innerInnerId: 100 }, { innerInnerId: 101 }, { innerInnerId: 102 } ] },
          { innerId: 11, innerInnerTodos: [ { innerInnerId: 110 }, { innerInnerId: 111 }, { innerInnerId: 112 } ] },
          { innerId: 12, innerInnerTodos: [ { innerInnerId: 120 }, { innerInnerId: 121 }, { innerInnerId: 122 } ] }
        ]
      },
      { id: 2,
        innerTodos: [
          { innerId: 20, innerInnerTodos: [ { innerInnerId: 200 }, { innerInnerId: 201 }, { innerInnerId: 202 } ] },
          { innerId: 21, innerInnerTodos: [ { innerInnerId: 210 }, { innerInnerId: 211 }, { innerInnerId: 212 } ] },
          { innerId: 22, innerInnerTodos: [ { innerInnerId: 220 }, { innerInnerId: 221 }, { innerInnerId: 222 } ] }
        ]
      },
      { id: 3,
        innerTodos: [
          { innerId: 30, innerInnerTodos: [ { innerInnerId: 300 }, { innerInnerId: 301 }, { innerInnerId: 302 } ] },
          { innerId: 31, innerInnerTodos: [ { innerInnerId: 310 }, { innerInnerId: 311 }, { innerInnerId: 312 } ] },
          { innerId: 32, innerInnerTodos: [ { innerInnerId: 320 }, { innerInnerId: 321 }, { innerInnerId: 322 } ] }
        ]
      },
    ];
    const expressionCache = {
      todos: new ForOfStatement(new BindingIdentifier('todo'), new AccessScope('todos')),
      id: new Interpolation(['', ''], [new AccessMember(new AccessScope('todo'), 'id')]),
      length: new Interpolation(['', ''], [new AccessMember(new AccessMember(new AccessScope('todo'), 'innerTodos'), 'length')]),
      innerTodos: new ForOfStatement(new BindingIdentifier('innerTodo'), new AccessMember(new AccessScope('todo'), 'innerTodos')),
      innerId: new Interpolation(['', ''], [new AccessMember(new AccessScope('innerTodo'), 'innerId')]),
      innerLength: new Interpolation(['', ''], [new AccessMember(new AccessMember(new AccessScope('innerTodo'), 'innerInnerTodos'), 'length')]),
      innerInnerTodos: new ForOfStatement(new BindingIdentifier('innerInnerTodo'), new AccessMember(new AccessScope('innerTodo'), 'innerInnerTodos')),
      innerInnerId: new Interpolation(['', ''], [new AccessMember(new AccessScope('innerInnerTodo'), 'innerInnerId')])
    };
    aureliaConfig = {
      register(container: IContainer) {
        (<IExpressionParser>container.get(IExpressionParser)).cache(expressionCache);
        container.register(<any>Repeat);
      }
    };
    au.register(aureliaConfig);
    const templateSource: ITemplateSource = {
      name: 'app',
      dependencies: [],
      templateOrNode: `<span class="au"></span> `,
      instructions: [
        [
          {
            type: TargetedInstructionType.hydrateTemplateController,
            res: 'repeat',
            src: {
              cache: "*",
              templateOrNode: `<span class="au"></span> <span class="au"></span> <span class="au"></span> `,
              instructions: [
                [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'id' } ],
                [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'length' } ],
                [
                  {
                    type: TargetedInstructionType.hydrateTemplateController,
                    res: 'repeat',
                    src: {
                      cache: "*",
                      templateOrNode: `<span class="au"></span> <span class="au"></span> <span class="au"></span> `,
                      instructions: [
                        [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'innerId' } ],
                        [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'innerLength' } ],
                        [
                          {
                            type: TargetedInstructionType.hydrateTemplateController,
                            res: 'repeat',
                            src: {
                              cache: "*",
                              templateOrNode: `<span class="au"></span> `,
                              instructions: [
                                [ { type: TargetedInstructionType.textBinding, srcOrExpr: 'innerInnerId' } ]
                              ]
                            },
                            instructions: [
                              { type: TargetedInstructionType.iteratorBinding, srcOrExpr: 'innerInnerTodos', dest: 'items' },
                              { type: TargetedInstructionType.setProperty, value: 'innerInnerTodo', dest: 'local' },
                              { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
                            ]
                          }
                        ]
                      ]
                    },
                    instructions: [
                      { type: TargetedInstructionType.iteratorBinding, srcOrExpr: 'innerTodos', dest: 'items' },
                      { type: TargetedInstructionType.setProperty, value: 'innerTodo', dest: 'local' },
                      { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
                    ]
                  }
                ]
              ]
            },
            instructions: [
              { type: TargetedInstructionType.iteratorBinding, srcOrExpr: 'todos', dest: 'items' },
              { type: TargetedInstructionType.setProperty, value: 'todo', dest: 'local' },
              { type: TargetedInstructionType.setProperty, value: false, dest: 'visualsRequireLifecycle' }
            ]
          }
        ]
      ],
      surrogates: []
    }
    component = createRepeater(<any>{ colName: 'todos' }, initItems, templateSource);

    au.app({ host, component });
    au.start();
    changeSet.flushChanges();

    const expectedText = initItems.map(i => `${i.id}${i.innerTodos.length}${i.innerTodos.map(ii => `${ii.innerId}${ii.innerInnerTodos.length}${ii.innerInnerTodos.map(iii => `${iii.innerInnerId}`).join('')}`).join(' ')}`).join(' ');
    expect(host['innerText']).to.equal(expectedText);
  });
});

