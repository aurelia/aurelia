import { expect } from 'chai';
import { hydrateCustomElement } from '../behavior-assistance';
import { DOM, IViewFactory, customElement, ITemplateDefinition, LifecycleFlags, IAttach, Lifecycle, RenderPlan, Compose, CustomElementResource, IDOM } from '../../../../src/index';
import { FakeViewFactory } from '../fakes/view-factory-fake';

const dom = new DOM(<any>document);

describe('The "compose" custom element', () => {
  // this is not ideal (same instance will be reused for multiple loops) but probably fine
  // need to revisit this later to give this extra dep a clean atomic entry point for the tests
  const subjectPossibilities = [
    {
      description: 'Template Definition',
      create: createTemplateDefinition
    },
    {
      description: 'View Factory',
      create: createViewFactory
    },
    {
      description: 'Potential Renderable',
      create: createPotentialRenderable
    },
    {
      description: 'View',
      create(lifecycle: Lifecycle) {
        return createViewFactory(lifecycle).create();
      }
    },
    {
      description: 'Custom Element Constructor',
      create(lifecycle: Lifecycle) {
        return CustomElementResource.define(createTemplateDefinition(lifecycle), class MyCustomElement {});
      }
    }
  ];

  const producerPossibilities = [
    {
      description: 'as a raw value',
      create(subject) { return subject; }
    },
    {
      description: 'via a Promise',
      create(subject) { return Promise.resolve(subject); }
    }
  ];

  for (let subjectPossibility of subjectPossibilities) {
    for(let producerPossibility of producerPossibilities) {
      it(`can compose a ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const lifecycle = new Lifecycle();
        const value = producerPossibility.create(subjectPossibility.create(lifecycle));
        const { element } = hydrateCustomElement(Compose);

        waitForCompositionEnd(element, () => {
          const child = getCurrentView(element);
          expect(child).to.not.be.undefined.null;
        }, done);

        element.subject = value;
      });

      it(`enforces the attach lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const lifecycle = new Lifecycle();
        const value = producerPossibility.create(subjectPossibility.create(lifecycle));
        const { element, parent } = hydrateCustomElement(Compose);

        waitForCompositionEnd(element, () => {
          const child = getCurrentView(element);
          let attachCalled = false;
          child.$attach = function() { attachCalled = true; };

          runAttachLifecycle(lifecycle, element, parent);

          expect(attachCalled).to.equal(true);
        }, done);

        element.subject = value;
      });

      it(`adds a view at the render location when attaching a ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const lifecycle = new Lifecycle();
        const value = producerPossibility.create(subjectPossibility.create(lifecycle));
        const { element, parent } = hydrateCustomElement(Compose);

        waitForCompositionEnd(element, () => {
          const location = element.$projector.host;

          runAttachLifecycle(lifecycle, element, parent);

          expect(location.previousSibling)
            .to.be.equal(getCurrentView(element).$nodes.lastChild);
        }, done);

        element.subject = value;
      });

      it(`enforces the bind lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const lifecycle = new Lifecycle();
        const value = producerPossibility.create(subjectPossibility.create(lifecycle));
        const { element } = hydrateCustomElement(Compose);

        waitForCompositionEnd(element, () => {
          const child = getCurrentView(element);

          let bindCalled = false;
          child.$bind = function() { bindCalled = true; };

          element.$bind(LifecycleFlags.fromBind);

          expect(bindCalled).to.equal(true);
        }, done);

        element.subject = value;
      });

      it(`enforces the detach lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const lifecycle = new Lifecycle();
        const value = producerPossibility.create(subjectPossibility.create(lifecycle));
        const { element, parent } = hydrateCustomElement(Compose);

        waitForCompositionEnd(element, () => {
          const child = getCurrentView(element);
          let detachCalled = false;
          child.$detach = function() { detachCalled = true; };

          runAttachLifecycle(lifecycle, element, parent);
          runDetachLifecycle(lifecycle, element);

          expect(detachCalled).to.equal(true);
        }, done);

        element.subject = value;
      });

      it(`enforces the unbind lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const lifecycle = new Lifecycle();
        const value = producerPossibility.create(subjectPossibility.create(lifecycle));
        const { element } = hydrateCustomElement(Compose);

        waitForCompositionEnd(element, () => {
          const child = getCurrentView(element);
          let unbindCalled = false;
          child.$unbind = function() { unbindCalled = true; };

          element.$bind(LifecycleFlags.fromBind);
          element.$unbind(LifecycleFlags.fromUnbind);

          expect(unbindCalled).to.equal(true);
        }, done);

        element.subject = value;
      });
    }
  }

  for (let producer of producerPossibilities) {
    it(`can swap between views ${producer.description}`, done => {
      const lifecycle = new Lifecycle();
      const view1 = createViewFactory(lifecycle).create();
      const view2 = createViewFactory(lifecycle).create();
      const { element } = hydrateCustomElement(Compose);

      waitForCompositionEnd(element, () => {
        expect(getCurrentView(element)).to.equal(view1);

        waitForCompositionEnd(element, () => {
          expect(getCurrentView(element)).to.equal(view2);

          waitForCompositionEnd(element, () => {
            expect(getCurrentView(element)).to.equal(view1);
          }, done);

          element.subject = producer.create(view1);
        });

        element.subject = producer.create(view2);
      });

      element.subject = producer.create(view1);
    });
  }

  const noSubjectValues = [null, undefined];

  for(let value of noSubjectValues) {
    for (let producer of producerPossibilities) {
      it(`clears out the view when the subject is ${value} ${producer.description}`, done => {
        const lifecycle = new Lifecycle();
        const view1 = createViewFactory(lifecycle).create();
        const { element, parent } = hydrateCustomElement(Compose, { lifecycle });
        const location = element.$projector.host;

        waitForCompositionEnd(element, () => {
          runAttachLifecycle(lifecycle, element, parent);

          const currentView = getCurrentView(element);
          if (location.previousSibling !== currentView.$nodes.lastChild) {
            throw new Error(`[ASSERTION ERROR]: expected location.previousSibling (with textContent "${
              location.previousSibling && location.previousSibling.textContent || "NULL"
            }") to equal currentView.$nodes.lastChild (with textContent "${
              currentView.$nodes.lastChild && currentView.$nodes.lastChild.textContent || "NULL"
            }")`)
          }

          let detachCalled = false;
          const detach = view1.$detach;
          view1.$detach = function() {
            detachCalled = true;
            detach.apply(view1, [LifecycleFlags.none]);
          };

          let unbindCalled = false;
          view1.$unbind = function() { unbindCalled = true; };

          waitForCompositionEnd(element, () => {
            expect(unbindCalled).to.equal(true);
            expect(detachCalled).to.equal(true);
            if (location.previousSibling !== location.$start) {
              throw new Error(`[ASSERTION ERROR]: expected location.previousSibling (with textContent "${
                location.previousSibling && location.previousSibling.textContent || "NULL"
              }") to equal location.$start (with textContent "${
                location.$start && location.$start.textContent || "NULL"
              }")`)
            }
          }, done);

          element.subject = producer.create(value);
        });

        element.subject = view1;
      });
    }
  }

  function getCurrentView(compose: Compose) {
    return compose['coordinator']['currentView'];
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

  function waitForCompositionEnd(element: Compose, callback: () => void, done?: () => void) {
    const coordinator = element['coordinator'];
    const originalSwapComplete = coordinator.onSwapComplete;

    coordinator.onSwapComplete = () => {
      originalSwapComplete.call(coordinator);
      coordinator.onSwapComplete = originalSwapComplete;

      callback();

      if (done) {
        done();
      }
    };
  }

  function createViewFactory(lifecycle: Lifecycle): IViewFactory {
    return new FakeViewFactory(lifecycle);
  }

  function createPotentialRenderable(lifecycle: Lifecycle): RenderPlan {
    return new RenderPlan(
      dom,
      document.createElement('div'),
      [],
      []
    );
  }

  function createTemplateDefinition(lifecycle: Lifecycle): ITemplateDefinition {
    return {
      name: 'dynamic',
      template: `
        <template>
          <div>Hello World</div>
        </template>
      `,
      cache: 0,
      instructions: [],
      dependencies: [],
      build: {
        required: false
      },
      surrogates: [],
      bindables: {},
      containerless: false,
      shadowOptions: null,
      hasSlots: false
    };
  }
});
