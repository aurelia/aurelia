import { expect } from 'chai';
import { hydrateCustomElement } from '../behavior-assistance';
import { Compose } from '../../../../src/templating/resources/compose';
import { TemplateDefinition, DOM, IViewFactory, customElement, ITemplateSource, BindingFlags } from '../../../../src';
import { PotentialRenderable } from '../../../../src/templating/create-element';
import { ViewFactoryFake } from '../fakes/view-factory-fake';

describe('The "compose" custom element', () => {
  @customElement(createTemplateDefinition())
  class MyCustomElement {}

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
      create() {
        return createViewFactory().create();
      }
    },
    {
      description: 'Custom Element Constructor',
      create() {
        return MyCustomElement;
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
        const value = producerPossibility.create(subjectPossibility.create());
        const { element } = hydrateCustomElement(Compose);

        waitForCompositionEnd(element, () => {
          expect(element['currentView']).to.not.be.undefined.null;
        }, done);

        element.subject = value;
      });

      it(`enforces the attach lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const value = producerPossibility.create(subjectPossibility.create());
        const { element, parent } = hydrateCustomElement(Compose);

        waitForCompositionEnd(element, () => {
          const child = element['currentView'];
          let attachCalled = false;
          child.$attach = function() { attachCalled = true; };

          element.$attach(parent);

          expect(attachCalled).to.be.true;
        }, done);

        element.subject = value;
      });

      it(`adds a view at the render location when attaching a ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const value = producerPossibility.create(subjectPossibility.create());
        const { element, parent } = hydrateCustomElement(Compose);

        waitForCompositionEnd(element, () => {
          const location = element.$projector.host;

          element.$attach(parent);

          expect(location.previousSibling)
            .to.be.equal(element['currentView'].$nodes.lastChild);
        }, done);

        element.subject = value;
      });

      it(`enforces the bind lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const value = producerPossibility.create(subjectPossibility.create());
        const { element } = hydrateCustomElement(Compose);

        waitForCompositionEnd(element, () => {
          const child = element['currentView'];
          let bindCalled = false;
          child.$bind = function() { bindCalled = true; };

          element.$bind(BindingFlags.fromBind);

          expect(bindCalled).to.be.true;
        }, done);

        element.subject = value;
      });

      it(`enforces the detach lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const value = producerPossibility.create(subjectPossibility.create());
        const { element, parent } = hydrateCustomElement(Compose);

        waitForCompositionEnd(element, () => {
          const child = element['currentView'];
          let detachCalled = false;
          child.$detach = function() { detachCalled = true; };

          element.$attach(parent);
          element.$detach(null);

          expect(detachCalled).to.be.true;
        }, done);

        element.subject = value;
      });

      it(`enforces the unbind lifecycle of its composed ${subjectPossibility.description} ${producerPossibility.description}`, done => {
        const value = producerPossibility.create(subjectPossibility.create());
        const { element } = hydrateCustomElement(Compose);

        waitForCompositionEnd(element, () => {
          const child = element['currentView'];
          let unbindCalled = false;
          child.$unbind = function() { unbindCalled = true; };

          element.$bind(BindingFlags.fromBind);
          element.$unbind(BindingFlags.fromUnbind);

          expect(unbindCalled).to.be.true;
        }, done);

        element.subject = value;
      });
    }
  }

  function waitForCompositionEnd(element: Compose, callback: () => void, done: () => void) {
    const endComposition = element.endComposition;

    element.endComposition = function(subject, flags) {
      element.endComposition = endComposition;
      endComposition.apply(element, [subject, flags]);
      callback();
      done();
    };
  }

  function createViewFactory(): IViewFactory {
    return new ViewFactoryFake();
  }

  function createPotentialRenderable(): PotentialRenderable {
    return new PotentialRenderable(
      DOM.createElement('div'),
      [],
      []
    );
  }

  function createTemplateDefinition(): ITemplateSource {
    return {
      name: 'dynamic',
      templateOrNode: `
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
