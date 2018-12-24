import { customElement, useShadowDOM, noViewTemplate, ICustomElement, ShadowDOMProjector, containerless, ContainerlessProjector, HostProjector, DOM } from '../../../src';
import { MockRenderingEngine } from '../mock';
import { expect } from 'chai';
import { PLATFORM } from '@aurelia/kernel';

const dom = new DOM(<any>document);

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
    sut.$hydrate(dom, <any>renderingEngine, host);

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
    sut.$hydrate(dom, <any>renderingEngine, host);

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
    sut.$hydrate(dom, <any>renderingEngine, host);

    expect(sut.$projector).to.be.instanceof(ContainerlessProjector);
    expect(sut.$projector['childNodes'].length).to.equal(0);
    expect(host.parentNode).to.be.null;
    expect(parent.firstChild).to.be.instanceof(Comment);
    expect(parent.firstChild.textContent).to.equal('au-start');
    expect(parent.lastChild).to.be.instanceof(Comment);
    expect(parent.lastChild.textContent).to.equal('au-end');
    expect(parent.firstChild.nextSibling['$customElement']).to.equal(sut);
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
    sut.$hydrate(dom, <any>renderingEngine, host);

    expect(sut.$projector).to.be.instanceof(ContainerlessProjector);
    expect(sut.$projector['childNodes'][0]).to.equal(child);
    expect(host.parentNode).to.be.null;
    expect(parent.firstChild).to.be.instanceof(Comment);
    expect(parent.firstChild.textContent).to.equal('au-start');
    expect(parent.lastChild).to.be.instanceof(Comment);
    expect(parent.lastChild.textContent).to.equal('au-end');
    expect(parent.firstChild.nextSibling['$customElement']).to.equal(sut);
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
    sut.$hydrate(dom, <any>renderingEngine, host);
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
    expect(() => sut.$hydrate(dom, <any>renderingEngine, host)).to.throw(/21/);
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
    expect(() => sut.$hydrate(dom, <any>renderingEngine, host)).to.throw(/21/);
  });
});
describe('ShadowDOMProjector', () => {

});

describe('ContainerlessProjector', () => {

});

describe('HostProjector', () => {

});
