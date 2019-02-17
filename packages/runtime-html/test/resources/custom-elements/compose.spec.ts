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
      it(`can compose a ${subjectPossibility.description} ${producerPossibility.description}`, async function () {
        const ctx = TestContext.createHTMLTestContext();
        const { element } = hydrateCustomElement(Compose, ctx);
        const value = producerPossibility.create(subjectPossibility.create(ctx));

        element.subject = value;

        await element['task'].wait();

        const child = element['view'];
        expect(child).not.to.equal(undefined);
        expect(child).not.to.equal(null);
      });

      it(`enforces the attach lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, async function () {
        const ctx = TestContext.createHTMLTestContext();
        const { element } = hydrateCustomElement(Compose, ctx);
        const value = producerPossibility.create(subjectPossibility.create(ctx));

        element.subject = value;

        await element['task'].wait();

        const child = element['view'];
        let attachCalled = false;
        child.$attach = function () {
          attachCalled = true;
          return LifecycleTask.done;
        };

        element.$attach(LifecycleFlags.none);

        expect(attachCalled, `attachCalled`).to.equal(true);
      });

      it(`adds a view at the render location when attaching a ${subjectPossibility.description} ${producerPossibility.description}`, async function () {
        const ctx = TestContext.createHTMLTestContext();
        const { element } = hydrateCustomElement(Compose, ctx);
        const value = producerPossibility.create(subjectPossibility.create(ctx));

        element.subject = value;

        await element['task'].wait();

        const location = element.$projector.host;

        element.$attach(LifecycleFlags.none);

        expect(location.previousSibling, `location.previousSibling`).to.equal(element['view'].$nodes.lastChild);
      });

      it(`enforces the bind lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, async function () {
        const ctx = TestContext.createHTMLTestContext();
        const { element } = hydrateCustomElement(Compose, ctx);
        const value = producerPossibility.create(subjectPossibility.create(ctx));

        element.subject = value;

        await element['task'].wait();

        const child = element['view'];

        let bindCalled = false;
        child.$bind = function () {
          bindCalled = true;
          return LifecycleTask.done;
        };

        element.$bind(LifecycleFlags.fromBind);

        expect(bindCalled, `bindCalled`).to.equal(true);
      });

      it(`enforces the detach lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, async function () {
        const ctx = TestContext.createHTMLTestContext();
        const { element } = hydrateCustomElement(Compose, ctx);
        const value = producerPossibility.create(subjectPossibility.create(ctx));

        element.subject = value;

        await element['task'].wait();

        const child = element['view'];
        let detachCalled = false;
        child.$detach = function () {
          detachCalled = true;
          return LifecycleTask.done;
        };

        element.$attach(LifecycleFlags.none);
        element.$detach(LifecycleFlags.none);

        expect(detachCalled, `detachCalled`).to.equal(true);
      });

      it(`enforces the unbind lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, async function () {
        const ctx = TestContext.createHTMLTestContext();
        const { element } = hydrateCustomElement(Compose, ctx);
        const value = producerPossibility.create(subjectPossibility.create(ctx));

        element.subject = value;

        await element['task'].wait();

        const child = element['view'];
        let unbindCalled = false;
        child.$unbind = function () {
          unbindCalled = true;
          return LifecycleTask.done;
        };

        element.$bind(LifecycleFlags.fromBind);
        element.$unbind(LifecycleFlags.fromUnbind);
        expect(unbindCalled, `unbindCalled`).to.equal(true);
      });
    }
  }

  for (const producer of producerPossibilities) {
    it(`can swap between views ${producer.description}`, async function () {
      const ctx = TestContext.createHTMLTestContext();
      const { element } = hydrateCustomElement(Compose, ctx);
      const view1 = createViewFactory(ctx).create();
      const view2 = createViewFactory(ctx).create();

      element.subject = producer.create(view1);

      await element['task'].wait();

      expect(element['view'], `element['view']`).to.equal(view1);

      element.subject = producer.create(view2);

      await element['task'].wait();

      expect(element['view'], `element['view']`).to.equal(view2);

      element.subject = producer.create(view1);

      await element['task'].wait();

      expect(element['view'], `element['view']`).to.equal(view1);
    });
  }

  const noSubjectValues = [null, undefined];

  for (const value of noSubjectValues) {
    for (const producer of producerPossibilities) {
      it(`clears out the view when the subject is ${value} ${producer.description}`, async function () {
        const ctx = TestContext.createHTMLTestContext();
        const { element } = hydrateCustomElement(Compose, ctx);

        const view1 = createViewFactory(ctx).create();
        const location = element.$projector.host;

        element.subject = view1;

        await element['task'].wait();

        element.$attach(LifecycleFlags.none);

        const currentView = element['view'];
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
          return detach.apply(view1, [LifecycleFlags.none]);
        };

        let unbindCalled = false;
        view1.$unbind = function () {
          unbindCalled = true;
          return LifecycleTask.done;
        };

        element.subject = producer.create(value);

        await element['task'].wait();

        expect(unbindCalled, `unbindCalled`).to.equal(true);
        expect(detachCalled, `detachCalled`).to.equal(true);
        if (location.previousSibling !== location.$start) {
          throw new Error(`[ASSERTION ERROR]: expected location.previousSibling (with textContent "${
            location.previousSibling && location.previousSibling.textContent || 'NULL'
          }") to equal location.$start (with textContent "${
            location.$start && location.$start.textContent || 'NULL'
          }")`);
        }
      });
    }
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
