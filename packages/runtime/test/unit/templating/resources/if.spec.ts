import { expect } from 'chai';
import { If, Else, IView, BindingFlags } from '../../../../src/index';
import { hydrateCustomAttribute } from '../behavior-assistance';
import { createScope } from '../scope-assistance';
import { ViewFake } from '../fakes/view-fake';

describe('The "if" template controller', () => {
  it("renders its view when the value is true", () => {
    const { attribute: ifAttr, location } = hydrateCustomAttribute(If);

    ifAttr.value = true;
    ifAttr.$bind(BindingFlags.fromBind, createScope());

    const child = ifAttr['$child'] as IView;
    const ifView = ifAttr['ifView'] as IView;

    expect(child).to.not.be.null;
    expect(child).to.equal(ifView);
    expect(ifView).to.be.instanceof(ViewFake);
    expect(ifView.$isBound).to.be.true;
    expect(ifView.$isAttached).to.be.false;

    ifAttr.$attach(null);

    expect(ifView.$isAttached).to.be.true;
    expect(location.previousSibling)
      .to.equal(ifView.$nodes.lastChild);
  });

  it("removes its view when the value is false", () => {
    const { attribute: ifAttr, location } = hydrateCustomAttribute(If);

    ifAttr.value = true;
    ifAttr.$bind(BindingFlags.fromBind, createScope());
    ifAttr.$attach(null);

    ifAttr.value = false;

    const child = ifAttr['$child'] as IView;
    expect(child).to.be.null;
    expect(location.previousSibling).to.be.null;

    const ifView = ifAttr['ifView'] as IView;
    expect(ifView.$isAttached).to.be.false;
    expect(ifView.$isBound).to.be.false;
  });

  it("renders an else view when one is linked and its value is false", () => {
    const { attribute: ifAttr, location } = hydrateCustomAttribute(If);
    const { attribute: elseAttr } = hydrateCustomAttribute(Else);

    elseAttr.link(ifAttr);

    ifAttr.value = true;
    ifAttr.$bind(BindingFlags.fromBind, createScope());
    ifAttr.value = false;

    const child = ifAttr['$child'] as IView;
    const elseView = ifAttr['elseView'] as IView;

    expect(child).to.not.be.null;
    expect(child).to.equal(elseView);
    expect(elseView).to.be.instanceof(ViewFake);
    expect(elseView.$isBound).to.be.true;
    expect(elseView.$isAttached).to.be.false;

    ifAttr.$attach(null);

    expect(elseView.$isAttached).to.be.true;
    expect(location.previousSibling)
      .to.equal(elseView.$nodes.lastChild);
  });

  it("detaches its child view when it is detached", () => {
    const { attribute: ifAttr } = hydrateCustomAttribute(If);

    ifAttr.value = true;
    ifAttr.$bind(BindingFlags.fromBind, createScope());

    const ifView = ifAttr['ifView'] as IView;

    ifAttr.$attach(null);
    ifAttr.$detach();

    expect(ifView.$isAttached).to.be.false;
    expect(ifAttr.$isAttached).to.be.false;
  });

  it("unbinds its child view when it is unbound", () => {
    const { attribute: ifAttr } = hydrateCustomAttribute(If);

    ifAttr.value = true;
    ifAttr.$bind(BindingFlags.fromBind, createScope());

    const ifView = ifAttr['ifView'] as IView;

    ifAttr.$unbind(BindingFlags.fromUnbind);

    expect(ifView.$isBound).to.be.false;
    expect(ifAttr.$isBound).to.be.false;
  });
});
