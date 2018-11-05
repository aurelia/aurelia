// import { expect } from 'chai';
// import { Constructable } from '../../../../../kernel/src/index';
// import { LifecycleFlags, Lifecycle, LifecycleFlags, IAttach, IView, Lifecycle } from '../../../../src/index';
// import { ViewFake } from '../fakes/view-fake';
// import { hydrateCustomAttribute } from '../behavior-assistance';
// import { createScope } from '../scope-assistance';

// export function ensureSingleChildTemplateControllerBehaviors<T extends Constructable>(
//   Type: T,
//   getChildView: (attribute: InstanceType<T>) => IView
//   ) {
//     const lifecycle = new Lifecycle();

//   it('creates a child instance from its template', () => {
//     const { attribute } = hydrateCustomAttribute(Type);
//     const child = getChildView(attribute);

//     expect(child).to.be.instanceof(ViewFake);
//   });

//   it('enforces the attach lifecycle of its child instance', () => {
//     const { attribute } = hydrateCustomAttribute(Type);
//     const child = getChildView(attribute);

//     let attachCalled = false;
//     child.$attach = function() { attachCalled = true; };

//     runLifecycle(attribute);

//     expect(attachCalled).to.be.true;
//   });

//   it('adds a child instance at the render location when attaching', () => {
//     const { attribute, location } = hydrateCustomAttribute(Type);
//     const child = getChildView(attribute);

//     runLifecycle(attribute);

//     expect(location.previousSibling)
//       .to.be.equal(child.$nodes.lastChild);
//   });

//   it('enforces the bind lifecycle of its child instance', () => {
//     const { attribute } = hydrateCustomAttribute(Type);
//     const child = getChildView(attribute);

//     let bindCalled = false;
//     child.$bind = function() { bindCalled = true; };

//     attribute.$bind(LifecycleFlags.fromBind, createScope());

//     expect(bindCalled).to.be.true;
//   });

//   it('enforces the detach lifecycle of its child instance', () => {
//     const { attribute } = hydrateCustomAttribute(Type);
//     const child = getChildView(attribute);

//     let detachCalled = false;
//     child.$detach = function() { detachCalled = true; };

//     runLifecycle(attribute);
//     runLifecycle(attribute);

//     expect(detachCalled).to.be.true;
//   });

//   it('enforces the unbind lifecycle of its child instance', () => {
//     const { attribute } = hydrateCustomAttribute(Type);
//     const child = getChildView(attribute);

//     let unbindCalled = false;
//     child.$unbind = function() { unbindCalled = true; };

//     attribute.$bind(LifecycleFlags.fromBind, createScope());
//     attribute.$unbind(LifecycleFlags.fromUnbind);

//     expect(unbindCalled).to.be.true;
//   });

//   function runLifecycle(item: IAttach) {
//     const attachLifecycle = this.lifecycle.beginAttach(lifecycle, null, LifecycleFlags.none);
//     attachLifecycle.attach(item);
//     attachLifecycle.end();
//   }

//   function runLifecycle(item: IAttach) {
//     const detachLifecycle = this.lifecycle.beginDetach(lifecycle, LifecycleFlags.none);
//     detachLifecycle.detach(item);
//     detachLifecycle.end();
//   }
// }
