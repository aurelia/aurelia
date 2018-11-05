// import { expect } from 'chai';
// import { hydrateCustomElement } from '../behavior-assistance';
// import { DOM, IViewFactory, customElement, ITemplateDefinition, LifecycleFlags, Lifecycle, LifecycleFlags, IAttach, Lifecycle, RenderPlan, Compose } from '../../../../src/index';
// import { ViewFactoryFake } from '../fakes/view-factory-fake';

// describe('The "compose" custom element', () => {
//   // this is not ideal (same instance will be reused for multiple loops) but probably fine
//   // need to revisit this later to give this extra dep a clean atomic entry point for the tests
//   let lifecycle: Lifecycle;
//   beforeEach(() => {
//     lifecycle = new Lifecycle();
//   });

//   @customElement(createTemplateDefinition())
//   class MyCustomElement {}

//   const subjectPossibilities = [
//     {
//       description: 'Template Definition',
//       create: createTemplateDefinition
//     },
//     {
//       description: 'View Factory',
//       create: createViewFactory
//     },
//     {
//       description: 'Potential Renderable',
//       create: createPotentialRenderable
//     },
//     {
//       description: 'View',
//       create() {
//         return createViewFactory().create();
//       }
//     },
//     {
//       description: 'Custom Element Constructor',
//       create() {
//         return MyCustomElement;
//       }
//     }
//   ];

//   const producerPossibilities = [
//     {
//       description: 'as a raw value',
//       create(subject) { return subject; }
//     },
//     {
//       description: 'via a Promise',
//       create(subject) { return Promise.resolve(subject); }
//     }
//   ];

//   for (let subjectPossibility of subjectPossibilities) {
//     for(let producerPossibility of producerPossibilities) {
//       it(`can compose a ${subjectPossibility.description} ${producerPossibility.description}`, done => {
//         const value = producerPossibility.create(subjectPossibility.create());
//         const { element } = hydrateCustomElement(Compose);

//         waitForCompositionEnd(element, () => {
//           const child = getCurrentView(element);
//           expect(child).to.not.be.undefined.null;
//         }, done);

//         element.subject = value;
//       });

//       it(`enforces the attach lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
//         const value = producerPossibility.create(subjectPossibility.create());
//         const { element, parent } = hydrateCustomElement(Compose);

//         waitForCompositionEnd(element, () => {
//           const child = getCurrentView(element);
//           let attachCalled = false;
//           child.$attach = function() { attachCalled = true; };

//           runLifecycle(element, parent);

//           expect(attachCalled).to.be.true;
//         }, done);

//         element.subject = value;
//       });

//       it(`adds a view at the render location when attaching a ${subjectPossibility.description} ${producerPossibility.description}`, done => {
//         const value = producerPossibility.create(subjectPossibility.create());
//         const { element, parent } = hydrateCustomElement(Compose);

//         waitForCompositionEnd(element, () => {
//           const location = element.$projector.host;

//           runLifecycle(element, parent);

//           expect(location.previousSibling)
//             .to.be.equal(getCurrentView(element).$nodes.lastChild);
//         }, done);

//         element.subject = value;
//       });

//       it(`enforces the bind lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
//         const value = producerPossibility.create(subjectPossibility.create());
//         const { element } = hydrateCustomElement(Compose);

//         waitForCompositionEnd(element, () => {
//           const child = getCurrentView(element);

//           let bindCalled = false;
//           child.$bind = function() { bindCalled = true; };

//           element.$bind(LifecycleFlags.fromBind);

//           expect(bindCalled).to.be.true;
//         }, done);

//         element.subject = value;
//       });

//       it(`enforces the detach lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
//         const value = producerPossibility.create(subjectPossibility.create());
//         const { element, parent } = hydrateCustomElement(Compose);

//         waitForCompositionEnd(element, () => {
//           const child = getCurrentView(element);
//           let detachCalled = false;
//           child.$detach = function() { detachCalled = true; };

//           runLifecycle(element, parent);
//           runLifecycle(element);

//           expect(detachCalled).to.be.true;
//         }, done);

//         element.subject = value;
//       });

//       it(`enforces the unbind lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
//         const value = producerPossibility.create(subjectPossibility.create());
//         const { element } = hydrateCustomElement(Compose);

//         waitForCompositionEnd(element, () => {
//           const child = getCurrentView(element);
//           let unbindCalled = false;
//           child.$unbind = function() { unbindCalled = true; };

//           element.$bind(LifecycleFlags.fromBind);
//           element.$unbind(LifecycleFlags.fromUnbind);

//           expect(unbindCalled).to.be.true;
//         }, done);

//         element.subject = value;
//       });
//     }
//   }

//   for (let producer of producerPossibilities) {
//     it(`can swap between views ${producer.description}`, done => {
//       const view1 = createViewFactory().create();
//       const view2 = createViewFactory().create();
//       const { element } = hydrateCustomElement(Compose);

//       waitForCompositionEnd(element, () => {
//         expect(getCurrentView(element)).to.equal(view1);

//         waitForCompositionEnd(element, () => {
//           expect(getCurrentView(element)).to.equal(view2);

//           waitForCompositionEnd(element, () => {
//             expect(getCurrentView(element)).to.equal(view1);
//           }, done);

//           element.subject = producer.create(view1);
//         });

//         element.subject = producer.create(view2);
//       });

//       element.subject = producer.create(view1);
//     });
//   }

//   const noSubjectValues = [null, undefined];

//   for(let value of noSubjectValues) {
//     for (let producer of producerPossibilities) {
//       it(`clears out the view when the subject is ${value} ${producer.description}`, done => {
//         const view1 = createViewFactory().create();
//         const { element, parent } = hydrateCustomElement(Compose);
//         const location = element.$projector.host;

//         waitForCompositionEnd(element, () => {
//           runLifecycle(element, parent);

//           expect(location.previousSibling)
//             .to.be.equal(getCurrentView(element).$nodes.lastChild);

//           let detachCalled = false;
//           const detach = view1.$detach;
//           view1.$detach = function() {
//             detachCalled = true;
//             detach.apply(view1, [lifecycle]);
//           };

//           let unbindCalled = false;
//           view1.$unbind = function() { unbindCalled = true; };

//           waitForCompositionEnd(element, () => {
//             expect(unbindCalled).to.be.true;
//             expect(detachCalled).to.be.true;
//             expect(location.previousSibling).to.equal(location.$start);
//           }, done);

//           element.subject = producer.create(value);
//         });

//         element.subject = view1;
//       });
//     }
//   }

//   function getCurrentView(compose: Compose) {
//     return compose['coordinator']['currentView'];
//   }

//   function runLifecycle(item: IAttach, encapsulationSource = null) {
//     const attachLifecycle = this.lifecycle.beginAttach(lifecycle, encapsulationSource, LifecycleFlags.none);
//     attachLifecycle.attach(item);
//     attachLifecycle.end();
//   }

//   function runLifecycle(item: IAttach) {
//     const detachLifecycle = this.lifecycle.beginDetach(lifecycle, LifecycleFlags.none);
//     detachLifecycle.detach(item);
//     detachLifecycle.end();
//   }

//   function waitForCompositionEnd(element: Compose, callback: () => void, done?: () => void) {
//     const coordinator = element['coordinator'];
//     const originalSwapComplete = coordinator.onSwapComplete;

//     coordinator.onSwapComplete = () => {
//       originalSwapComplete.call(coordinator);
//       coordinator.onSwapComplete = originalSwapComplete;

//       callback();

//       if (done) {
//         done();
//       }
//     };
//   }

//   function createViewFactory(): IViewFactory {
//     return new ViewFactoryFake();
//   }

//   function createPotentialRenderable(): RenderPlan {
//     return new RenderPlan(
//       DOM.createElement('div'),
//       [],
//       []
//     );
//   }

//   function createTemplateDefinition(): ITemplateDefinition {
//     return {
//       name: 'dynamic',
//       template: `
//         <template>
//           <div>Hello World</div>
//         </template>
//       `,
//       cache: 0,
//       instructions: [],
//       dependencies: [],
//       build: {
//         required: false
//       },
//       surrogates: [],
//       bindables: {},
//       containerless: false,
//       shadowOptions: null,
//       hasSlots: false
//     };
//   }
// });
