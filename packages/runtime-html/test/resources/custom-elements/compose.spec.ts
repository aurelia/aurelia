import { CustomElementResource, IComponent, ITemplateDefinition, IViewFactory, LifecycleFlags, LifecycleTask } from '@aurelia/runtime';
import { expect } from 'chai';
import { Compose, RenderPlan } from '../../../src/index';
import { FakeViewFactory } from '../../_doubles/fake-view-factory';
import { hydrateCustomElement } from '../../behavior-assistance';
import { HTMLTestContext, TestContext } from '../../util';

describe('The "compose" custom element', function () {
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
      create(ctx: HTMLTestContext) {
        return createViewFactory(ctx).create();
      }
    },
    {
      description: 'Custom Element Constructor',
      create(ctx: HTMLTestContext) {
        return CustomElementResource.define(createTemplateDefinition(), class MyCustomElement {});
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
        const ctx = TestContext.createHTMLTestContext();
        const { element } = hydrateCustomElement(Compose, ctx);
        const value = producerPossibility.create(subjectPossibility.create(ctx));

        waitForCompositionEnd(
          element,
          () => {
            const child = getCurrentView(element);
            expect(child).not.to.equal(undefined);
            expect(child).not.to.equal(null);
          },
          done
        );

        element.subject = value;
      });

      it(`enforces the attach lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const ctx = TestContext.createHTMLTestContext();
        const { element } = hydrateCustomElement(Compose, ctx);
        const value = producerPossibility.create(subjectPossibility.create(ctx));

        waitForCompositionEnd(
          element,
          () => {
            const child = getCurrentView(element);
            let attachCalled = false;
            child.$attach = function () { attachCalled = true; };

            runAttachLifecycle(ctx, element);

            expect(attachCalled).to.equal(true);
          },
          done
        );

        element.subject = value;
      });

      it(`adds a view at the render location when attaching a ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const ctx = TestContext.createHTMLTestContext();
        const { element } = hydrateCustomElement(Compose, ctx);
        const value = producerPossibility.create(subjectPossibility.create(ctx));

        waitForCompositionEnd(
          element,
          () => {
            const location = element.$projector.host;

            runAttachLifecycle(ctx, element);

            expect(location.previousSibling)
              .to.be.equal(getCurrentView(element).$nodes.lastChild);
          },
          done
        );

        element.subject = value;
      });

      it(`enforces the bind lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const ctx = TestContext.createHTMLTestContext();
        const { element } = hydrateCustomElement(Compose, ctx);
        const value = producerPossibility.create(subjectPossibility.create(ctx));

        waitForCompositionEnd(
          element,
          () => {
            const child = getCurrentView(element);

            let bindCalled = false;
            child.$bind = function () { bindCalled = true; };

            element.$bind(LifecycleFlags.fromBind);

            expect(bindCalled).to.equal(true);
          },
          done
        );

        element.subject = value;
      });

      it(`enforces the detach lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const ctx = TestContext.createHTMLTestContext();
        const { element } = hydrateCustomElement(Compose, ctx);
        const value = producerPossibility.create(subjectPossibility.create(ctx));

        waitForCompositionEnd(
          element,
          () => {
            const child = getCurrentView(element);
            let detachCalled = false;
            child.$detach = function () { detachCalled = true; };

            runAttachLifecycle(ctx, element);
            runDetachLifecycle(ctx, element);

            expect(detachCalled).to.equal(true);
          },
          done
        );

        element.subject = value;
      });

      it(`enforces the unbind lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const ctx = TestContext.createHTMLTestContext();
        const { element } = hydrateCustomElement(Compose, ctx);
        const value = producerPossibility.create(subjectPossibility.create(ctx));

        waitForCompositionEnd(
          element,
          () => {
            const child = getCurrentView(element);
            let unbindCalled = false;
            child.$unbind = function () { unbindCalled = true; };

            element.$bind(LifecycleFlags.fromBind);
            element.$unbind(LifecycleFlags.fromUnbind);

            expect(unbindCalled).to.equal(true);
          },
          done
        );

        element.subject = value;
      });
    }
  }

  for (const producer of producerPossibilities) {
    it(`can swap between views ${producer.description}`, done => {
      const ctx = TestContext.createHTMLTestContext();
      const { element } = hydrateCustomElement(Compose, ctx);
      const view1 = createViewFactory(ctx).create();
      const view2 = createViewFactory(ctx).create();

      waitForCompositionEnd(
        element,
        () => {
          expect(getCurrentView(element)).to.equal(view1);

          waitForCompositionEnd(
            element,
            () => {
              expect(getCurrentView(element)).to.equal(view2);

              waitForCompositionEnd(
                element,
                () => {
                  expect(getCurrentView(element)).to.equal(view1);
                },
                done
              );

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
        const ctx = TestContext.createHTMLTestContext();
        const { element } = hydrateCustomElement(Compose, ctx);

        const view1 = createViewFactory(ctx).create();
        const location = element.$projector.host;

        waitForCompositionEnd(element, () => {
          runAttachLifecycle(ctx, element);

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
          view1.$detach = function () {
            detachCalled = true;
            detach.apply(view1, [LifecycleFlags.none]);
            return LifecycleTask.done;
          };

          let unbindCalled = false;
          view1.$unbind = function () {
            unbindCalled = true;
            return LifecycleTask.done;
          };

          waitForCompositionEnd(
            element,
            () => {
              expect(unbindCalled).to.equal(true);
              expect(detachCalled).to.equal(true);
              if (location.previousSibling !== location.$start) {
                throw new Error(`[ASSERTION ERROR]: expected location.previousSibling (with textContent "${
                  location.previousSibling && location.previousSibling.textContent || 'NULL'
                }") to equal location.$start (with textContent "${
                  location.$start && location.$start.textContent || 'NULL'
                }")`);
              }
            },
            done
          );

          element.subject = producer.create(value);
        });

        element.subject = view1;
      });
    }
  }

  function getCurrentView(compose: Compose) {
    return compose['coordinator']['currentView'];
  }

  function runAttachLifecycle(ctx: HTMLTestContext, item: IComponent) {
    ctx.lifecycle.beginAttach();
    item.$attach(LifecycleFlags.none);
    ctx.lifecycle.endAttach(LifecycleFlags.none);
  }

  function runDetachLifecycle(ctx: HTMLTestContext, item: IComponent) {
    ctx.lifecycle.beginDetach();
    item.$detach(LifecycleFlags.none);
    ctx.lifecycle.endDetach(LifecycleFlags.none);
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

  function createViewFactory(ctx: HTMLTestContext): IViewFactory {
    return new FakeViewFactory(ctx);
  }

  function createPotentialRenderable(ctx: HTMLTestContext): RenderPlan {
    return new RenderPlan<Node>(ctx.dom, ctx.createElement('div'), [], []);
  }

  function createTemplateDefinition(): ITemplateDefinition {
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
