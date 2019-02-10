import { expect } from 'chai';
import {
  Else,
  IComponent,
  If,
  IView,
  LifecycleFlags
} from '../../../src/index';
import { Lifecycle } from '../../../src/lifecycle';
import { FakeView } from '../../_doubles/fake-view';
import { AuDOMConfiguration, AuNode } from '../../au-dom';
import { createScopeForTest } from '../../util';
import { hydrateCustomAttribute } from './template-controller-tests';

describe('The "if" template controller', function () {
  it('renders its view when the value is true', function () {
    const { attribute: ifAttr, location, lifecycle } = hydrateCustomAttribute(If);

    ifAttr.value = true;
    ifAttr.$bind(LifecycleFlags.fromBind, createScopeForTest());

    const child = getCurrentView(ifAttr as If<AuNode>);
    const ifView = ifAttr['ifView'] as IView<AuNode>;

    expect(child).not.to.equal(null);
    expect(child).to.equal(ifView);
    expect(ifView).to.be.instanceof(FakeView);
    expect(ifView).to.have.$state.isBound();
    expect(ifView).to.not.have.$state.isAttached();

    runAttachLifecycle(lifecycle, ifAttr);

    expect(ifView).to.have.$state.isAttached();
    expect(location.previousSibling).to.equal(ifView.$nodes.lastChild);
  });

  it('queues the view removal via the lifecycle when the value is false', function () {
    const { attribute: ifAttr, location, lifecycle } = hydrateCustomAttribute(If);

    ifAttr.value = true;
    ifAttr.$bind(LifecycleFlags.fromBind, createScopeForTest());
    runAttachLifecycle(lifecycle, ifAttr);

    const childBefore = getCurrentView(ifAttr as If<AuNode>);
    const prevSiblingBefore = location.previousSibling;

    ifAttr.value = false;

    let ifView = ifAttr['ifView'] as IView<AuNode>;
    expect(ifView).to.have.$state.isAttached();
    expect(ifView).to.have.$state.isBound();

    const childAfter = getCurrentView(ifAttr as If<AuNode>);
    expect(childAfter).to.equal(childBefore);
    expect(location.previousSibling).to.equal(prevSiblingBefore);
    expect(lifecycle.flushCount).to.equal(1);

    lifecycle.processFlushQueue(LifecycleFlags.none);

    const child = getCurrentView(ifAttr as If<AuNode>);
    expect(child).to.equal(null);
    expect(location.previousSibling).to.equal(location.$start);

    ifView = ifAttr['ifView'] as IView<AuNode>;
    expect(ifView).to.not.have.$state.isAttached();
    expect(ifView).to.not.have.$state.isBound();
  });

  it('queues the rendering of an else view when one is linked and its value is false', function () {
    const container = AuDOMConfiguration.createContainer();
    const { attribute: ifAttr, location } = hydrateCustomAttribute(If, { container });
    const { attribute: elseAttr, lifecycle } = hydrateCustomAttribute(Else, { container });

    elseAttr.link(ifAttr as If<AuNode>);

    ifAttr.value = true;
    ifAttr.$bind(LifecycleFlags.fromBind, createScopeForTest());
    ifAttr.value = false;

    let child = getCurrentView(ifAttr as If<AuNode>);
    let elseView = ifAttr['elseView'] as IView<AuNode>;

    expect(child).not.to.equal(null);
    expect(elseView).to.equal(null);

    lifecycle.processFlushQueue(LifecycleFlags.none);

    child = getCurrentView(ifAttr as If<AuNode>);
    elseView = ifAttr['elseView'] as IView<AuNode>;
    expect(child).not.to.equal(null);
    expect(child).to.equal(elseView);
    expect(elseView).to.be.instanceof(FakeView);
    expect(elseView).to.have.$state.isBound();
    expect(elseView).to.not.have.$state.isAttached();

    runAttachLifecycle(lifecycle, ifAttr);

    expect(elseView).to.have.$state.isAttached();
    expect(location.previousSibling).to.equal(elseView.$nodes.lastChild);
  });

  it('detaches its child view when it is detached', function () {
    const { attribute: ifAttr, lifecycle } = hydrateCustomAttribute(If);

    ifAttr.value = true;
    ifAttr.$bind(LifecycleFlags.fromBind, createScopeForTest());

    const ifView = ifAttr['ifView'] as IView<AuNode>;

    runAttachLifecycle(lifecycle, ifAttr);
    runDetachLifecycle(lifecycle, ifAttr);

    expect(ifView).to.not.have.$state.isAttached();
    expect(ifAttr).to.not.have.$state.isAttached();
  });

  it('unbinds its child view when it is unbound', function () {
    const { attribute: ifAttr } = hydrateCustomAttribute(If);

    ifAttr.value = true;
    ifAttr.$bind(LifecycleFlags.fromBind, createScopeForTest());

    const ifView = ifAttr['ifView'] as IView<AuNode>;

    ifAttr.$unbind(LifecycleFlags.fromUnbind);

    expect(ifView).to.not.have.$state.isBound();
    expect(ifAttr).to.not.have.$state.isBound();
  });

  function getCurrentView(ifAttr: If<AuNode>): IView<AuNode> {
    return ifAttr['coordinator']['currentView'] as IView<AuNode>;
  }

  function runAttachLifecycle(lifecycle: Lifecycle, item: IComponent) {
    lifecycle.beginAttach();
    item.$attach(LifecycleFlags.none);
    lifecycle.endAttach(LifecycleFlags.none);
  }

  function runDetachLifecycle(lifecycle: Lifecycle, item: IComponent) {
    lifecycle.beginDetach();
    item.$detach(LifecycleFlags.none);
    lifecycle.endDetach(LifecycleFlags.none);
  }
});
