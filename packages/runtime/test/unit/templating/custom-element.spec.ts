import { MockTextNodeSequence, MockRenderingEngine } from './../mock';
import { IDetachLifecycle } from './../../../src/templating/lifecycle';
import { BindingFlags } from './../../../src/binding/binding-flags';
import { Immutable, PLATFORM } from '@aurelia/kernel';
import { customElement, useShadowDOM, containerless, CustomElementResource, createCustomElementDescription, ShadowDOMProjector, ContainerlessProjector, HostProjector, CustomAttributeResource, INode, ITemplateSource, IAttachLifecycle, INodeSequence, ICustomElement, noViewTemplate } from '../../../src/index';
import { expect } from 'chai';

describe('@customElement', () => {
  it(`with string`, () => {
    @customElement('foo')
    class Foo {}

    expect(Foo['description'].name).to.equal('foo');
  });

  it(`with object`, () => {
    @customElement({ name: 'foo' })
    class Foo {}

    expect(Foo['description'].name).to.equal('foo');
  });

  describe(`determineProjector`, () => {
    it(`@useShadowDOM yields ShadowDOMProjector`, () => {
      @customElement('foo')
      @useShadowDOM()
      class Foo {}

      const renderingEngine = new MockRenderingEngine(noViewTemplate, null, null, (type, instance) => {
        instance.$behavior = {};
      });
      const host = document.createElement('div');

      const sut = new Foo() as ICustomElement;
      sut.$hydrate(<any>renderingEngine, host);

      expect(sut.$projector).to.be.instanceof(ShadowDOMProjector);
      expect(sut.$projector['shadowRoot']).to.be.instanceof(Node);
      expect(sut.$projector['shadowRoot'].$customElement).to.equal(sut);
      expect(host['$customElement']).to.equal(sut);
      expect(sut.$projector.children).to.equal(sut.$projector.host['childNodes']);
    });

    it(`hasSlots=true yields ShadowDOMProjector`, () => {
      @customElement('foo')
      class Foo {}

      Foo['description'].hasSlots = true;

      const renderingEngine = new MockRenderingEngine(noViewTemplate, null, null, (type, instance) => {
        instance.$behavior = {};
      });
      const host = document.createElement('div');

      const sut = new Foo() as ICustomElement;
      sut.$hydrate(<any>renderingEngine, host);

      expect(sut.$projector).to.be.instanceof(ShadowDOMProjector);
      expect(sut.$projector['shadowRoot']).to.be.instanceof(Node);
      expect(sut.$projector['shadowRoot'].$customElement).to.equal(sut);
      expect(host['$customElement']).to.equal(sut);
      expect(sut.$projector.children).to.equal(sut.$projector.host['childNodes']);
      expect(sut.$projector.provideEncapsulationSource(null)).to.equal(sut.$projector['shadowRoot']);
    });

    it(`@containerless yields ContainerlessProjector`, () => {
      @customElement('foo')
      @containerless()
      class Foo {}

      const renderingEngine = new MockRenderingEngine(noViewTemplate, null, null, (type, instance) => {
        instance.$behavior = {};
      });
      const parent = document.createElement('div')
      const host = document.createElement('div');
      parent.appendChild(host);

      const sut = new Foo() as ICustomElement;
      sut.$hydrate(<any>renderingEngine, host);

      expect(sut.$projector).to.be.instanceof(ContainerlessProjector);
      expect(sut.$projector['childNodes'].length).to.equal(0);
      expect(host.parentNode).to.be.null;
      expect(parent.firstChild).to.be.instanceof(Comment);
      expect(parent.firstChild.textContent).to.equal('au-loc');
      expect(parent.firstChild['$customElement']).to.equal(sut);
      expect(sut.$projector.children).to.equal(sut.$projector['childNodes']);
    });

    it(`@containerless yields ContainerlessProjector (with child)`, () => {
      @customElement('foo')
      @containerless()
      class Foo {}

      const renderingEngine = new MockRenderingEngine(noViewTemplate, null, null, (type, instance) => {
        instance.$behavior = {};
      });
      const parent = document.createElement('div')
      const host = document.createElement('div');
      const child = document.createElement('div');
      parent.appendChild(host);
      host.appendChild(child);

      const sut = new Foo() as ICustomElement;
      sut.$hydrate(<any>renderingEngine, host);

      expect(sut.$projector).to.be.instanceof(ContainerlessProjector);
      expect(sut.$projector['childNodes'][0]).to.equal(child);
      expect(host.parentNode).to.be.null;
      expect(parent.firstChild).to.be.instanceof(Comment);
      expect(parent.firstChild.textContent).to.equal('au-loc');
      expect(parent.firstChild['$customElement']).to.equal(sut);
      expect(sut.$projector.children).to.equal(sut.$projector['childNodes']);
    });

    it(`no shadowDOM, slots or containerless yields HostProjector`, () => {
      @customElement('foo')
      class Foo {}

      const renderingEngine = new MockRenderingEngine(noViewTemplate, null, null, (type, instance) => {
        instance.$behavior = {};
      });
      const host = document.createElement('div');
      const sut = new Foo() as ICustomElement;
      sut.$hydrate(<any>renderingEngine, host);
      expect(host['$customElement']).to.equal(sut);
      expect(sut.$projector).to.be.instanceof(HostProjector);
      expect(sut.$projector.children).to.equal(PLATFORM.emptyArray);
    });

    it(`@containerless + @useShadowDOM throws`, () => {
      @customElement('foo')
      @useShadowDOM()
      @containerless()
      class Foo {}

      const renderingEngine = new MockRenderingEngine(noViewTemplate, null, null, (type, instance) => {
        instance.$behavior = {};
      });
      const host = document.createElement('div');
      const sut = new Foo() as ICustomElement;
      expect(() => sut.$hydrate(<any>renderingEngine, host)).to.throw(/21/);
    });

    it(`@containerless + hasSlots throws`, () => {
      @customElement('foo')
      @containerless()
      class Foo {}

      Foo['description'].hasSlots = true;

      const renderingEngine = new MockRenderingEngine(noViewTemplate, null, null, (type, instance) => {
        instance.$behavior = {};
      });
      const host = document.createElement('div');
      const sut = new Foo() as ICustomElement;
      expect(() => sut.$hydrate(<any>renderingEngine, host)).to.throw(/21/);
    });
  });
});

describe('@useShadowDOM', () => {
  it(`non-invocation`, () => {
    @useShadowDOM
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('open');
  });

  it(`invocation without options`, () => {
    @useShadowDOM()
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('open');
  });

  it(`invocation with options mode=open`, () => {
    @useShadowDOM({ mode: 'open' })
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('open');
  });

  it(`invocation with options mode=closed`, () => {
    @useShadowDOM({ mode: 'closed' })
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('closed');
  });
});

describe('@containerless', () => {
  it(`non-invocation`, () => {
    @containerless
    class Foo {}

    expect(Foo['containerless']).to.be.true;
  });

  it(`invocation`, () => {
    @containerless()
    class Foo {}

    expect(Foo['containerless']).to.be.true;
  });
});

describe('CustomElementResource', () => {
  describe(`define`, () => {
    it(`creates a new class when applied to null`, () => {
      const type = CustomElementResource.define('foo', null);
      expect(typeof type).to.equal('function');
      expect(typeof type.constructor).to.equal('function');
      expect(type.name).to.equal('HTMLOnlyElement');
      expect(typeof type.prototype).to.equal('object');
    });

    it(`creates a new class when applied to undefined`, () => { // how though?? it explicitly checks for null??
      const type = (<any>CustomElementResource).define('foo');
      expect(typeof type).to.equal('function');
      expect(typeof type.constructor).to.equal('function');
      expect(type.name).to.equal('HTMLOnlyElement');
      expect(typeof type.prototype).to.equal('object');
    });

    it(`names the resource 'unnamed' if no name is provided`, () => {
      const type = CustomElementResource.define({}, class Foo {});
      expect(type.description.name).to.equal('unnamed');
    });
  });

  describe(`keyFrom`, () => {
    it(`returns the correct key`, () => {
      expect(CustomElementResource.keyFrom('foo')).to.equal('custom-element:foo');
    });
  });

  describe(`isType`, () => {
    it(`returns true when given a resource with the correct kind`, () => {
      const type = CustomElementResource.define('foo', class Foo{});
      expect(CustomElementResource.isType(type)).to.be.true;
    });

    it(`returns false when given a resource with the wrong kind`, () => {
      const type = CustomAttributeResource.define('foo', class Foo{});
      expect(CustomElementResource.isType(type)).to.be.false;
    });
  });

  describe(`behaviorFor`, () => {
    it(`returns $customElement variable if it exists`, () => {
      expect(CustomElementResource.behaviorFor(<any>{$customElement: 'foo'})).to.equal('foo');
    });

    it(`returns null if the $customElement variable does nots`, () => {
      expect(CustomElementResource.behaviorFor(<any>{})).to.be.null;
    });
  });
});

describe('createCustomElementDescription', () => {

});

describe('ShadowDOMProjector', () => {

});

describe('ContainerlessProjector', () => {

});

describe('HostProjector', () => {

});
