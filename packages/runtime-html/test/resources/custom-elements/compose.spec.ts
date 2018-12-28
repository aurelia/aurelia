import { Registration } from '@aurelia/kernel';
import { CustomElementResource, IAttach, IDOM, ILifecycle, ITemplateDefinition, IViewFactory, LifecycleFlags } from '@aurelia/runtime';
import { expect } from 'chai';
import { Compose, HTMLDOM, HTMLRuntimeConfiguration, RenderPlan } from '../../../src/index';
import { FakeViewFactory } from '../../_doubles/fake-view-factory';
import { hydrateCustomElement } from '../../behavior-assistance';

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
      create(dom: IDOM, lifecycle: ILifecycle) {
        return createViewFactory(dom, lifecycle).create();
      }
    },
    {
      description: 'Custom Element Constructor',
      create(dom: IDOM, lifecycle: ILifecycle) {
        return CustomElementResource.define(createTemplateDefinition(dom, lifecycle), class MyCustomElement {});
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

  for (const subjectPossibility of subjectPossibilities) {
    for (const producerPossibility of producerPossibilities) {
      it(`can compose a ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const { element, lifecycle, dom } = hydrateCustomElement(Compose);
        const value = producerPossibility.create(subjectPossibility.create(dom, lifecycle));

        waitForCompositionEnd(element, () => {
          const child = getCurrentView(element);
          expect(child).to.not.be.undefined.null;
        },                    done);

        element.subject = value;
      });

      it(`enforces the attach lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const { element, lifecycle, parent, dom } = hydrateCustomElement(Compose);
        const value = producerPossibility.create(subjectPossibility.create(dom, lifecycle));

        waitForCompositionEnd(element, () => {
          const child = getCurrentView(element);
          let attachCalled = false;
          child.$attach = function() { attachCalled = true; };

          runAttachLifecycle(lifecycle, element, parent);

          expect(attachCalled).to.equal(true);
        },                    done);

        element.subject = value;
      });

      it(`adds a view at the render location when attaching a ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const { element, parent, lifecycle, dom } = hydrateCustomElement(Compose);
        const value = producerPossibility.create(subjectPossibility.create(dom, lifecycle));

        waitForCompositionEnd(element, () => {
          const location = element.$projector.host;

          runAttachLifecycle(lifecycle, element, parent);

          expect(location.previousSibling)
            .to.be.equal(getCurrentView(element).$nodes.lastChild);
        },                    done);

        element.subject = value;
      });

      it(`enforces the bind lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const { element, lifecycle, dom } = hydrateCustomElement(Compose);
        const value = producerPossibility.create(subjectPossibility.create(dom, lifecycle));

        waitForCompositionEnd(element, () => {
          const child = getCurrentView(element);

          let bindCalled = false;
          child.$bind = function() { bindCalled = true; };

          element.$bind(LifecycleFlags.fromBind);

          expect(bindCalled).to.equal(true);
        },                    done);

        element.subject = value;
      });

      it(`enforces the detach lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const { element, parent, lifecycle, dom } = hydrateCustomElement(Compose);
        const value = producerPossibility.create(subjectPossibility.create(dom, lifecycle));

        waitForCompositionEnd(element, () => {
          const child = getCurrentView(element);
          let detachCalled = false;
          child.$detach = function() { detachCalled = true; };

          runAttachLifecycle(lifecycle, element, parent);
          runDetachLifecycle(lifecycle, element);

          expect(detachCalled).to.equal(true);
        },                    done);

        element.subject = value;
      });

      it(`enforces the unbind lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const { element, lifecycle, dom } = hydrateCustomElement(Compose);
        const value = producerPossibility.create(subjectPossibility.create(dom, lifecycle));

        waitForCompositionEnd(element, () => {
          const child = getCurrentView(element);
          let unbindCalled = false;
          child.$unbind = function() { unbindCalled = true; };

          element.$bind(LifecycleFlags.fromBind);
          element.$unbind(LifecycleFlags.fromUnbind);

          expect(unbindCalled).to.equal(true);
        },                    done);

        element.subject = value;
      });
    }
  }

  for (const producer of producerPossibilities) {
    it(`can swap between views ${producer.description}`, done => {
      const { element, lifecycle, dom } = hydrateCustomElement(Compose);
      const view1 = createViewFactory(dom, lifecycle).create();
      const view2 = createViewFactory(dom, lifecycle).create();

      waitForCompositionEnd(element, () => {
        expect(getCurrentView(element)).to.equal(view1);

        waitForCompositionEnd(element, () => {
          expect(getCurrentView(element)).to.equal(view2);

          waitForCompositionEnd(element, () => {
            expect(getCurrentView(element)).to.equal(view1);
          },                    done);

          element.subject = producer.create(view1);
        });

        element.subject = producer.create(view2);
      });

      element.subject = producer.create(view1);
    });
  }

  const noSubjectValues = [null, undefined];

  for (const value of noSubjectValues) {
    for (const producer of producerPossibilities) {
      it(`clears out the view when the subject is ${value} ${producer.description}`, done => {
        const container = HTMLRuntimeConfiguration.createContainer();
        const lifecycle = container.get(ILifecycle);
        const dom = new HTMLDOM(document);
        Registration.instance(IDOM, dom).register(container, IDOM);
        const { element, parent } = hydrateCustomElement(Compose, { container, lifecycle });

        const view1 = createViewFactory(dom, lifecycle).create();
        const location = element.$projector.host;

        waitForCompositionEnd(element, () => {
          runAttachLifecycle(lifecycle, element, parent);

          const currentView = getCurrentView(element);
          if (location.previousSibling !== currentView.$nodes.lastChild) {
            throw new Error(`[ASSERTION ERROR]: expected location.previousSibling (with textContent "${
              location.previousSibling && location.previousSibling.textContent || 'NULL'
            }") to equal currentView.$nodes.lastChild (with textContent "${
              currentView.$nodes.lastChild && currentView.$nodes.lastChild.textContent || 'NULL'
            }")`);
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
                location.previousSibling && location.previousSibling.textContent || 'NULL'
              }") to equal location.$start (with textContent "${
                location.$start && location.$start.textContent || 'NULL'
              }")`);
            }
          },                    done);

          element.subject = producer.create(value);
        });

        element.subject = view1;
      });
    }
  }

  function getCurrentView(compose: Compose) {
    return compose['coordinator']['currentView'];
  }

  function runAttachLifecycle(lifecycle: ILifecycle, item: IAttach, encapsulationSource = null) {
    lifecycle.beginAttach();
    item.$attach(LifecycleFlags.none);
    lifecycle.endAttach(LifecycleFlags.none);
  }

  function runDetachLifecycle(lifecycle: ILifecycle, item: IAttach) {
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

  function createViewFactory(dom: IDOM, lifecycle: ILifecycle): IViewFactory {
    // @ts-ignore
    return new FakeViewFactory(lifecycle);
  }

  function createPotentialRenderable(dom: IDOM, lifecycle: ILifecycle): RenderPlan {
    // @ts-ignore
    return new RenderPlan(
      dom,
      document.createElement('div'),
      [],
      []
    );
  }

  function createTemplateDefinition(dom: IDOM, lifecycle: ILifecycle): ITemplateDefinition {
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
