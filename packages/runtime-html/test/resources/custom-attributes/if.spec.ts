import { DI } from '@aurelia/kernel';
import { expect } from 'chai';
import { Writable } from 'stream';
import {
  AccessMember,
  AccessScope,
  BindingIdentifier,
  CompositionCoordinator,
  Else,
  ForOfStatement,
  IAttach,
  If,
  ILifecycle,
  IView,
  Lifecycle,
  LifecycleFlags,
  ObserverLocator,
  RuntimeBehavior,
  ViewFactory
} from '../../../src/index';
import { hydrateCustomAttribute } from '../../behavior-assistance';
import { FakeView } from '../../fakes/view-fake';
import { MockTextNodeTemplate } from '../../mock';
import { createScope } from '../../scope-assistance';
import { createScopeForTest } from '../../shared';
import { eachCartesianJoinFactory } from '../../util';

describe('The "if" template controller', () => {
  it('renders its view when the value is true', () => {
    const { attribute: ifAttr, location, lifecycle } = hydrateCustomAttribute(If);

    ifAttr.value = true;
    ifAttr.$bind(LifecycleFlags.fromBind, createScope());

    const child = getCurrentView(ifAttr);
    const ifView = ifAttr['ifView'] as IView;

    expect(child).not.to.equal(null);
    expect(child).to.equal(ifView);
    expect(ifView).to.be.instanceof(FakeView);
    expect(ifView).to.have.$state.isBound();
    expect(ifView).to.not.have.$state.isAttached();

    runAttachLifecycle(lifecycle, ifAttr);

    expect(ifView).to.have.$state.isAttached();
    expect(location.previousSibling)
      .to.equal(ifView.$nodes.lastChild);
  });

  it('queues the view removal via the lifecycle when the value is false', () => {
    const { attribute: ifAttr, location, lifecycle } = hydrateCustomAttribute(If);

    ifAttr.value = true;
    ifAttr.$bind(LifecycleFlags.fromBind, createScope());
    runAttachLifecycle(lifecycle, ifAttr);

    const childBefore = getCurrentView(ifAttr);
    const prevSiblingBefore = location.previousSibling;

    ifAttr.value = false;

    let ifView = ifAttr['ifView'] as IView;
    expect(ifView).to.have.$state.isAttached();
    expect(ifView).to.have.$state.isBound();

    const childAfter = getCurrentView(ifAttr);
    expect(childAfter).to.equal(childBefore);
    expect(location.previousSibling).to.equal(prevSiblingBefore);
    expect(lifecycle.flushCount).to.equal(1);

    lifecycle.processFlushQueue(LifecycleFlags.none);

    const child = getCurrentView(ifAttr);
    expect(child).to.equal(null);
    expect(location.previousSibling).to.equal(location.$start);

    ifView = ifAttr['ifView'] as IView;
    expect(ifView).to.not.have.$state.isAttached();
    expect(ifView).to.not.have.$state.isBound();
  });

  it('queues the rendering of an else view when one is linked and its value is false', () => {
    const container = DI.createContainer();
    const { attribute: ifAttr, location } = hydrateCustomAttribute(If, { container });
    const { attribute: elseAttr, lifecycle } = hydrateCustomAttribute(Else, { container });

    elseAttr.link(ifAttr);

    ifAttr.value = true;
    ifAttr.$bind(LifecycleFlags.fromBind, createScope());
    ifAttr.value = false;

    let child = getCurrentView(ifAttr);
    let elseView = ifAttr['elseView'] as IView;

    expect(child).not.to.equal(null);
    expect(elseView).to.equal(null);

    lifecycle.processFlushQueue(LifecycleFlags.none);

    child = getCurrentView(ifAttr);
    elseView = ifAttr['elseView'] as IView;
    expect(child).not.to.equal(null);
    expect(child).to.equal(elseView);
    expect(elseView).to.be.instanceof(FakeView);
    expect(elseView).to.have.$state.isBound();
    expect(elseView).to.not.have.$state.isAttached();

    runAttachLifecycle(lifecycle, ifAttr);

    expect(elseView).to.have.$state.isAttached();
    expect(location.previousSibling)
      .to.equal(elseView.$nodes.lastChild);
  });

  it('detaches its child view when it is detached', () => {
    const { attribute: ifAttr, lifecycle } = hydrateCustomAttribute(If);

    ifAttr.value = true;
    ifAttr.$bind(LifecycleFlags.fromBind, createScope());

    const ifView = ifAttr['ifView'] as IView;

    runAttachLifecycle(lifecycle, ifAttr);
    runDetachLifecycle(lifecycle, ifAttr);

    expect(ifView).to.not.have.$state.isAttached();
    expect(ifAttr).to.not.have.$state.isAttached();
  });

  it('unbinds its child view when it is unbound', () => {
    const { attribute: ifAttr } = hydrateCustomAttribute(If);

    ifAttr.value = true;
    ifAttr.$bind(LifecycleFlags.fromBind, createScope());

    const ifView = ifAttr['ifView'] as IView;

    ifAttr.$unbind(LifecycleFlags.fromUnbind);

    expect(ifView).to.not.have.$state.isBound();
    expect(ifAttr).to.not.have.$state.isBound();
  });

  function getCurrentView(ifAttr: If) {
    return ifAttr['coordinator']['currentView'];
  }

  function runAttachLifecycle(lifecycle: Lifecycle, item: IAttach, encapsulationSource = null) {
    lifecycle.beginAttach();
    item.$attach(LifecycleFlags.none);
    lifecycle.endAttach(LifecycleFlags.none);
  }

  function runDetachLifecycle(lifecycle: Lifecycle, item: IAttach) {
    lifecycle.beginDetach();
    item.$detach(LifecycleFlags.none);
    lifecycle.endDetach(LifecycleFlags.none);
  }
});

const expressions = {
  text: new AccessMember(new AccessScope('item'), 'text'),
  if: new AccessMember(new AccessScope('item'), 'if'),
  else: new AccessMember(new AccessScope('item'), 'else'),
  show: new AccessScope('show'),
  items: new ForOfStatement(new BindingIdentifier('item'), new AccessScope('items'))
};

export class MockIfTextNodeTemplate {

}

function setup() {
  const container = DI.createContainer();
  const lifecycle = container.get(ILifecycle) as Lifecycle;
  const host = document.createElement('div');
  const ifLoc = document.createComment('au-loc');
  host.appendChild(ifLoc);

  const observerLocator = new ObserverLocator(dom, lifecycle, null, null, null);
  const ifFactory = new ViewFactory(null, new MockTextNodeTemplate(expressions.if, observerLocator, container) as any, lifecycle);
  const elseFactory = new ViewFactory(null, new MockTextNodeTemplate(expressions.else, observerLocator, container) as any, lifecycle);

  const ifSut = new If(ifFactory, ifLoc, new CompositionCoordinator(lifecycle));
  const elseSut = new Else(elseFactory);

  elseSut.link(ifSut);

  (ifSut as Writable<If>).$scope = null;
  (elseSut as Writable<Else>).$scope = null;

  const ifBehavior = RuntimeBehavior.create(If as any, ifSut);
  ifBehavior.applyTo(ifSut, lifecycle);

  const elseBehavior = RuntimeBehavior.create(Else as any, elseSut as any);
  elseBehavior.applyTo(elseSut, lifecycle);

  return { ifSut, elseSut, host, lifecycle };
}

describe(`If/Else`, () => {

  eachCartesianJoinFactory([
    // initial input items
    [
      () => [{if: 1, else: 2},  1,         `1`, `2`, `{if:1,else:2},value:1        `],
      () => [{if: 1, else: 2},  2,         `1`, `2`, `{if:1,else:2},value:2        `],
      () => [{if: 1, else: 2},  {},        `1`, `2`, `{if:1,else:2},value:{}       `],
      () => [{if: 1, else: 2},  true,      `1`, `2`, `{if:1,else:2},value:true     `],
      () => [{if: 1, else: 2},  '1',       `1`, `2`, `{if:1,else:2},value:'1'      `],
      () => [{if: 1, else: 2},  '0',       `1`, `2`, `{if:1,else:2},value:'0'      `],
      () => [{if: 1, else: 2},  'true',    `1`, `2`, `{if:1,else:2},value:'true'   `],
      () => [{if: 1, else: 2},  'false',   `1`, `2`, `{if:1,else:2},value:'false'  `],
      () => [{if: 1, else: 2},  Symbol(),  `1`, `2`, `{if:1,else:2},value:Symbol() `],
      () => [{if: 1, else: 2},  -1,        `1`, `2`, `{if:1,else:2},value:-1       `],
      () => [{if: 1, else: 2},  NaN,       `1`, `2`, `{if:1,else:2},value:NaN      `],
      () => [{if: 1, else: 2},  0,         `1`, `2`, `{if:1,else:2},value:0        `],
      () => [{if: 1, else: 2},  '',        `1`, `2`, `{if:1,else:2},value:''       `],
      () => [{if: 1, else: 2},  false,     `1`, `2`, `{if:1,else:2},value:false    `],
      () => [{if: 1, else: 2},  null,      `1`, `2`, `{if:1,else:2},value:null     `],
      () => [{if: 1, else: 2},  undefined, `1`, `2`, `{if:1,else:2},value:undefined`]
    ] as (() => [any, boolean, string, string, string])[],
    // first operation "execute1" (initial bind + attach)
    [

      ([item, value, trueValue, falseValue]) => [(ifSut, elseSut, host, lifecycle) => {
        ifSut.value = value;
        ifSut.$bind(LifecycleFlags.fromBind, createScopeForTest({ item }));

        expect(ifSut.coordinator['currentView'].$scope).to.equal(ifSut.$scope);
        expect(ifSut.coordinator['currentView']).to.have.$state.isBound();

        expect(host.textContent).to.equal('', `execute1, host.textContent`);

        lifecycle.beginAttach();
        ifSut.$attach(LifecycleFlags.none);
        lifecycle.endAttach(LifecycleFlags.none);

        expect(host.textContent).to.equal(!!ifSut.value ? trueValue : falseValue, `execute1, host.textContent`);

      }, `$bind(fromBind)  -> $attach(none)`],

      ([item, value, trueValue, falseValue]) => [(ifSut, elseSut, host, lifecycle) => {
        ifSut.value = value;
        ifSut.$bind(LifecycleFlags.fromBind | LifecycleFlags.fromFlush, createScopeForTest({ item }));

        expect(ifSut.coordinator['currentView'].$scope).to.equal(ifSut.$scope);
        expect(ifSut.coordinator['currentView']).to.have.$state.isBound();

        expect(host.textContent).to.equal('', `execute1, host.textContent`);

        lifecycle.beginAttach();
        ifSut.$attach(LifecycleFlags.none);
        lifecycle.endAttach(LifecycleFlags.none);

        expect(host.textContent).to.equal(!!ifSut.value ? trueValue : falseValue, `execute1, host.textContent`);

      }, `$bind(fromFlush) -> $attach(none)`]
    ] as (($1: [any, boolean, string, string, string]) => [(ifSut: If, elseSut: Else, host: Node, lifecycle: Lifecycle) => void, string])[],
    // second operation "execute2" (second bind or noop)
    [

      ([, , trueValue, falseValue]) => [(ifSut: If, elseSut: Else, host: Node) => {
        ifSut.$bind(LifecycleFlags.fromBind, ifSut.$scope);

        expect(ifSut.coordinator['currentView'].$scope).to.equal(ifSut.$scope);
        expect(ifSut.coordinator['currentView']).to.have.$state.isBound();

        expect(host.textContent).to.equal(!!ifSut.value ? trueValue : falseValue, `execute2, host.textContent`);

      }, `$bind(fromBind), same scope`],

      ([item, , trueValue, falseValue]) => [(ifSut: If, elseSut: Else, host: Node, lifecycle: Lifecycle) => {
        ifSut.$bind(LifecycleFlags.fromBind, createScopeForTest({ item }));

        expect(ifSut.coordinator['currentView'].$scope).to.equal(ifSut.$scope);
        expect(ifSut.coordinator['currentView']).to.have.$state.isBound();

        expect(host.textContent).to.equal(!!ifSut.value ? trueValue : falseValue, `execute2, host.textContent`);

        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(ifSut.coordinator['currentView'].$scope).to.equal(ifSut.$scope);
        expect(ifSut.coordinator['currentView']).to.have.$state.isBound();

        expect(host.textContent).to.equal(!!ifSut.value ? trueValue : falseValue, `execute2, host.textContent`);

      }, `$bind(fromBind), new scope `],

      ([item, , trueValue, falseValue]) => [(ifSut: If, elseSut: Else, host: Node) => {
        ifSut.$bind(LifecycleFlags.fromFlush, createScopeForTest({ item }));

        expect(ifSut.coordinator['currentView'].$scope).to.equal(ifSut.$scope);
        expect(ifSut.coordinator['currentView']).to.have.$state.isBound();

        expect(host.textContent).to.equal(!!ifSut.value ? trueValue : falseValue, `execute2, host.textContent`);

      }, `$bind(fromFlush), new scope`],

      ([, ]) => [() => {

      }, `noop                       `]
    ] as (($1: [any, boolean, string, string, string]) => [(ifSut: If, elseSut: Else, host: Node, lifecycle: Lifecycle) => void, string])[],
    // third operation "execute3" (change value)
    [

      ([, , trueValue, falseValue]) => [(ifSut, elseSut, host, lifecycle) => {
        const contentBeforeChange = host.textContent;
        const oldValue = ifSut.value;
        const newValue = !ifSut.value;
        ifSut.value = newValue;
        ifSut.valueChanged(newValue, oldValue, undefined);

        expect(ifSut.coordinator['currentView'].$scope).to.equal(ifSut.$scope);
        expect(ifSut.coordinator['currentView']).to.have.$state.isBound();

        expect(host.textContent).to.equal(contentBeforeChange, `execute3, host.textContent`);

        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(ifSut.coordinator['currentView'].$scope).to.equal(ifSut.$scope);
        expect(ifSut.coordinator['currentView']).to.have.$state.isBound();

        expect(host.textContent).to.equal(!!ifSut.value ? trueValue : falseValue, `execute3, host.textContent`);

      }, `ifSut.value=!ifSut.value`],

      ([, , trueValue, falseValue]) => [(ifSut, elseSut, host, lifecycle) => {
        const contentBeforeChange = host.textContent;
        let oldValue = ifSut.value;
        let newValue = !ifSut.value;
        ifSut.value = newValue;
        ifSut.valueChanged(newValue, oldValue, undefined);

        expect(ifSut.coordinator['currentView'].$scope).to.equal(ifSut.$scope);
        expect(ifSut.coordinator['currentView']).to.have.$state.isBound();

        expect(host.textContent).to.equal(contentBeforeChange, `execute3, host.textContent`);

        oldValue = ifSut.value;
        newValue = !ifSut.value;
        ifSut.value = newValue;
        ifSut.valueChanged(newValue, oldValue, undefined);

        expect(ifSut.coordinator['currentView'].$scope).to.equal(ifSut.$scope);
        expect(ifSut.coordinator['currentView']).to.have.$state.isBound();

        expect(host.textContent).to.equal(!!ifSut.value ? trueValue : falseValue, `execute3, host.textContent`);

        lifecycle.processFlushQueue(LifecycleFlags.none);

        expect(ifSut.coordinator['currentView'].$scope).to.equal(ifSut.$scope);
        expect(ifSut.coordinator['currentView']).to.have.$state.isBound();

        expect(host.textContent).to.equal(!!ifSut.value ? trueValue : falseValue, `execute3, host.textContent`);

      }, `ifSut.value=!ifSut.value(x2)`]
    ] as (($1: [any, boolean, string, string, string]) => [(ifSut: If, elseSut: Else, host: Node, lifecycle: Lifecycle) => void, string])[],
    // fourth operation "execute4" (detach and unbind)
    [

      ([, , ]) => [(ifSut, elseSut, host, lifecycle) => {
        lifecycle.beginDetach();
        ifSut.$detach(LifecycleFlags.none);
        lifecycle.endDetach(LifecycleFlags.none);

        expect(host.textContent).to.equal('', `execute4, host.textContent #1`);

        ifSut.$unbind(LifecycleFlags.fromUnbind);

        expect(host.textContent).to.equal('', `execute4, host.textContent #2`);

      }, `$detach(none)   -> $unbind(fromUnbind)`],

      ([, , ]) => [(ifSut, elseSut, host, lifecycle) => {
        lifecycle.enqueueUnbindAfterDetach(ifSut);
        lifecycle.beginDetach();
        ifSut.$detach(LifecycleFlags.none);
        lifecycle.endDetach(LifecycleFlags.none);

        expect(host.textContent).to.equal('', `execute4, host.textContent #3`);

      }, `$detach(unbind) -> $unbind(fromUnbind)`],
    ] as (($1: [any, boolean, string, string, string]) => [(ifSut: If, elseSut: Else, host: Node, lifecycle: Lifecycle) => void, string])[],
    // fifth operation "execute5" (second unbind)
    [

      ([, , ]) => [(ifSut, elseSut, host) => {
        ifSut.$unbind(LifecycleFlags.fromUnbind);

        expect(host.textContent).to.equal('', `execute5, host.textContent`);

      }, `$unbind(fromUnbind)`]
    ] as (($1: [any, boolean, string, string, string]) => [(ifSut: If, elseSut: Else, host: Node, lifecycle: Lifecycle) => void, string])[]
  ],                       (
    [, , , text1],
    [exec1, exec1Text],
    [exec2, exec2Text],
    [exec3, exec3Text],
    [exec4, exec4Text],
    [exec5, exec5Text]) => {
    it(`assign=${text1} -> ${exec1Text} -> ${exec2Text} -> ${exec3Text} -> ${exec4Text} -> ${exec5Text}`, () => {
      const { ifSut, elseSut, host, lifecycle } = setup();

      exec1(ifSut, elseSut, host, lifecycle);
      exec2(ifSut, elseSut, host, lifecycle);
      exec3(ifSut, elseSut, host, lifecycle);
      exec4(ifSut, elseSut, host, lifecycle);
      exec5(ifSut, elseSut, host, lifecycle);
    });
  });
});
