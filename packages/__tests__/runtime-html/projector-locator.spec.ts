import { CustomElementResource, ICustomElementType } from '@aurelia/runtime';
import { expect } from 'chai';
import { ContainerlessProjector, HostProjector, HTMLProjectorLocator, ShadowDOMProjector } from '@aurelia/runtime-html';
import { TestContext } from './util';

describe(`determineProjector`, function () {
  const ctx = TestContext.createHTMLTestContext();
  const dom = ctx.dom;
  const locator = new HTMLProjectorLocator();

  it(`@useShadowDOM yields ShadowDOMProjector`, function () {
    const host = ctx.createElement('div');
    const Foo = CustomElementResource.define(
      {
        name: 'foo',
        shadowOptions: { mode: 'open' }
      },
      class {}
    ) as ICustomElementType<Node>;
    const component = new Foo();
    const projector = locator.getElementProjector(dom, component, host, Foo.description);

    expect(projector).to.be.instanceof(ShadowDOMProjector);
    expect(projector['shadowRoot']).to.be.instanceof(ctx.Node);
    expect(projector['shadowRoot'].$customElement).to.equal(component);
    expect(host['$customElement']).to.equal(component);
    expect(projector.children.length).to.equal(projector['shadowRoot']['childNodes'].length);
    if (projector.children.length > 0) {
      expect(projector.children).to.deep.equal(projector['shadowRoot']['childNodes']);
    }
    expect(projector.provideEncapsulationSource()).to.equal(projector['shadowRoot']);
  });

  it(`hasSlots=true yields ShadowDOMProjector`, function () {
    const host = ctx.createElement('div');
    const Foo = CustomElementResource.define(
      {
        name: 'foo',
        hasSlots: true
      },
      class {}
    ) as ICustomElementType<Node>;
    const component = new Foo();
    const projector = locator.getElementProjector(dom, component, host, Foo.description);

    expect(projector).to.be.instanceof(ShadowDOMProjector);
    expect(projector['shadowRoot']).to.be.instanceof(ctx.Node);
    expect(projector['shadowRoot'].$customElement).to.equal(component);
    expect(host['$customElement']).to.equal(component);
    expect(projector.children.length).to.equal(projector['shadowRoot']['childNodes'].length);
    if (projector.children.length > 0) {
      expect(projector.children).to.deep.equal(projector['shadowRoot']['childNodes']);
    }
    expect(projector.provideEncapsulationSource()).to.equal(projector['shadowRoot']);
  });

  it(`@containerless yields ContainerlessProjector`, function () {
    const host = ctx.createElement('div');
    const parent = ctx.createElement('div');
    parent.appendChild(host);
    const Foo = CustomElementResource.define(
      {
        name: 'foo',
        containerless: true
      },
      class {}
    ) as ICustomElementType<Node>;
    const component = new Foo();
    const projector = locator.getElementProjector(dom, component, host, Foo.description);

    expect(projector).to.be.instanceof(ContainerlessProjector);
    expect(projector['childNodes'].length).to.equal(0);
    expect(host.parentNode).to.equal(null);
    expect(parent.firstChild).to.be.instanceof(ctx.Comment);
    expect(parent.firstChild.textContent).to.equal('au-start');
    expect(parent.lastChild).to.be.instanceof(ctx.Comment);
    expect(parent.lastChild.textContent).to.equal('au-end');
    expect(parent.firstChild.nextSibling['$customElement']).to.equal(component);
    expect(projector.children.length).to.equal(projector.host['childNodes'].length);
    if (projector.children.length > 0) {
      expect(projector.children).to.deep.equal(projector.host['childNodes']);
    }
    expect(projector.provideEncapsulationSource()).not.to.equal(projector['host']);
    expect(projector.provideEncapsulationSource()).to.equal(parent);
  });

  it(`@containerless yields ContainerlessProjector (with child)`, function () {
    const parent = ctx.createElement('div');
    const host = ctx.createElement('div');
    const child = ctx.createElement('div');
    parent.appendChild(host);
    host.appendChild(child);
    const Foo = CustomElementResource.define(
      {
        name: 'foo',
        containerless: true
      },
      class {}
    ) as ICustomElementType<Node>;
    const component = new Foo();
    const projector = locator.getElementProjector(dom, component, host, Foo.description);

    expect(projector).to.be.instanceof(ContainerlessProjector);
    expect(projector['childNodes'][0]).to.equal(child);
    expect(host.parentNode).to.equal(null);
    expect(parent.firstChild).to.be.instanceof(ctx.Comment);
    expect(parent.firstChild.textContent).to.equal('au-start');
    expect(parent.lastChild).to.be.instanceof(ctx.Comment);
    expect(parent.lastChild.textContent).to.equal('au-end');
    expect(parent.firstChild.nextSibling['$customElement']).to.equal(component);
    expect(projector.provideEncapsulationSource()).not.to.equal(projector['host']);
    expect(projector.provideEncapsulationSource()).to.equal(parent);
  });

  it(`no shadowDOM, slots or containerless yields HostProjector`, function () {
    const host = ctx.createElement('div');
    const Foo = CustomElementResource.define(
      {
        name: 'foo'
      },
      class {}
    ) as ICustomElementType<Node>;
    const component = new Foo();
    const projector = locator.getElementProjector(dom, component, host, Foo.description);

    expect(host['$customElement']).to.equal(component);
    expect(projector).to.be.instanceof(HostProjector);
    expect(projector.children).to.equal(projector.host.childNodes);
    expect(projector.provideEncapsulationSource()).to.equal(host);
  });

  it(`@containerless + @useShadowDOM throws`, function () {
    const host = ctx.createElement('div');
    const Foo = CustomElementResource.define(
      {
        name: 'foo',
        containerless: true,
        shadowOptions: { mode: 'open' }
      },
      class {}
    ) as ICustomElementType<Node>;
    const component = new Foo();

    expect(() => locator.getElementProjector(dom, component, host, Foo.description)).to.throw(/21/);
  });

  it(`@containerless + hasSlots throws`, function () {
    const host = ctx.createElement('div');
    const Foo = CustomElementResource.define(
      {
        name: 'foo',
        containerless: true,
        hasSlots: true
      },
      class {}
    ) as ICustomElementType<Node>;
    const component = new Foo();

    expect(() => locator.getElementProjector(dom, component, host, Foo.description)).to.throw(/21/);
  });
});
