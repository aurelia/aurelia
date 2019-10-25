import { IAttributeParser, ResourceModel } from '@aurelia/jit';
import {
  IAttrSyntaxTransformer,
  TemplateBinder
} from '@aurelia/jit-html';
import { RuntimeCompilationResources } from '@aurelia/kernel';
import {
  Aurelia,
  CustomElement,
  IExpressionParser,
  INodeSequence,
  ISignaler,
  LifecycleFlags } from '@aurelia/runtime';
import { NodeSequenceFactory } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

const spec = 'kitchen-sink';

// TemplateCompiler - integration with various different parts
describe(spec, function () {
  it.skip('startup with App type', function () {
    const ctx = TestContext.createHTMLTestContext();
    const component = CustomElement.define({ name: 'app', template: `<template>\${message}</template>` }, class { public message = 'Hello!'; });
    const host = ctx.createElement('div');
    const au = new Aurelia(ctx.container).register().app({ host, component });
    au.start();
    assert.strictEqual(host.textContent, 'Hello!', `host.textContent`);
    au.stop();
    assert.strictEqual(host.textContent, '', `host.textContent`);
    au.start();
    assert.strictEqual(host.textContent, 'Hello!', `host.textContent`);
    au.stop();
    assert.strictEqual(host.textContent, '', `host.textContent`);
  });

  it.skip('signaler', function () {

    const items = [0, 1, 2];
    const App = CustomElement.define(
      {
        name: 'app',
        template: `<template><div repeat.for="i of 3">\${items[i] & signal:'updateItem'}</div></template>`
      },
      class {
        public items = items;
      }
    );

    const ctx = TestContext.createHTMLTestContext();
    const signaler = ctx.container.get(ISignaler);
    const scheduler = ctx.scheduler;
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, '012', `host.textContent`);

    items[0] = 2;

    scheduler.getRenderTaskQueue().flush();

    assert.strictEqual(host.textContent, '012', `host.textContent`);

    signaler.dispatchSignal('updateItem', LifecycleFlags.fromFlush);

    assert.strictEqual(host.textContent, '212', `host.textContent`);

  });

  it.skip('signaler + oneTime', function () {

    const items = [0, 1, 2];
    const App = CustomElement.define({
      name: 'app',
      template: `<template><div repeat.for="i of 3">\${items[i] & signal:'updateItem' & oneTime}</div></template>`
    },                                       class {
      public items = items;
    });

    const ctx = TestContext.createHTMLTestContext();
    const signaler = ctx.container.get(ISignaler);
    const scheduler = ctx.scheduler;
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, '012', `host.textContent`);

    items[0] = 2;

    scheduler.getRenderTaskQueue().flush();

    assert.strictEqual(host.textContent, '012', `host.textContent`);

    signaler.dispatchSignal('updateItem', LifecycleFlags.fromFlush);

    assert.strictEqual(host.textContent, '212', `host.textContent`);

  });

  it.skip('render hook', function () {

    const ctx = TestContext.createHTMLTestContext();
    const App = CustomElement.define({
      name: 'app',
      template: `<template></template>`
    },                                       class {
      public $nodes: INodeSequence;
      public render() {
        this.$nodes = new NodeSequenceFactory(ctx.dom, 'foo').createNodeSequence();
      }
    });

    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'foo', `host.textContent`);

  });
});

describe('xml node compiler tests', function () {
  // TODO: add some content assertions and verify different kinds of xml compilation
  // (for now these tests are just to ensure the binder doesn't hang or crash when given "unusual" node types)
  const markups = [
    '<?xml?>',
    '<?xml version="1.0" encoding="utf-8"?>',
    '<?xml?>\n<a/>',
    '<?xml?>\n<a>\n\v<b/>\n</a>',
    '<?go there?>',
    '<?go there?><?come here?>',
    '<!-- \t Hello, World! \t -->',
    '<!-- \t Hello \t -->\n<!-- \t World \t -->',
    '<![CDATA[ \t <foo></bar> \t ]]>',
    '<![CDATA[ \t data]]><![CDATA[< > " and & \t ]]>',
    '<!DOCTYPE note [\n<!ENTITY foo "baa">]>',
    '<a/>',
    '<a/>\n<a/>',
    '<a/>\n<b/>',
    '<a x="hello"/>',
    '<a x="1.234" y="It\'s"/>',
    '<a> \t Hi \t </a>',
    '<a>  Hi \n There \t </a>',
    '<a>\n\v<b/>\n</a>',
    '<a>\n\v<b>\n\v\v<c/>\n\v</b>\n</a>'
  ];

  for (const markup of markups) {
    const escaped = markup.replace(/\b/g, '\\b').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\v/g, '\\v').replace(/\f/g, '\\f').replace(/\r/g, '\\r');
    it.skip(escaped, function () {
      const ctx = TestContext.createHTMLTestContext();
      const parser = new ctx.DOMParser();
      const doc = parser.parseFromString(markup, 'application/xml');
      const fakeSurrogate = { firstChild: doc, attributes: [] };

      const binder = new TemplateBinder(
        ctx.dom,
        new ResourceModel(new RuntimeCompilationResources(ctx.container)),
        ctx.container.get(IAttributeParser),
        ctx.container.get(IExpressionParser),
        ctx.container.get(IAttrSyntaxTransformer)
      );

      const result = binder.bind(fakeSurrogate as any);
      assert.strictEqual(result.physicalNode, fakeSurrogate, `result.physicalNode`);
    });
  }
});

describe('dependency injection', function () {

  it.skip('register local dependencies ', function () {
    const Foo = CustomElement.define(
      {
        name: 'foo',
        template: 'bar'
      },
      null
    );
    const App = CustomElement.define(
      {
        name: 'app',
        template: '<foo></foo>',
        dependencies: [Foo]
      },
      null
    );

    const ctx = TestContext.createHTMLTestContext();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    au.start();

    assert.strictEqual(host.textContent, 'bar', `host.textContent`);
  });
});

// commented out code left here intentionally, serves as a staring point for template controller tests

// describe('test', function() {
//   it.skip('$1', function() {
//     enableTracing();
//     Tracer.enableLiveLogging(SymbolTraceWriter);
//     const container = JitHtmlBrowserConfiguration.createContainer();
//     const dom = new HTMLDOM(document);
//     Registration.instance(IDOM, dom).register(container, IDOM);
//     const host = document.createElement('div');
//     const hosthost = document.createElement('div');
//     hosthost.appendChild(host);
//     const App = CustomElement.define(
//       {
//         name: 'app',
//         template: '<div if.bind="value">${ifText}</div><div else>${elseText}</div>'
//       },
//       class {
//         ifText = 'foo';
//         elseText = 'bar';
//       }
//     );
//     const component = new App();

//     const scheduler = container.get(ILifecycle);
//     const re = container.get(IRenderingEngine);
//     const pl = container.get(IProjectorLocator);

//     component.$hydrate(dom, pl, re, host, null);

//     component['value'] = false;
//     component.$bind(LifecycleFlags.none);

//     component['value'] = true;

//     component.$bind(LifecycleFlags.none);

//     component.$attach(LifecycleFlags.none);

//     disableTracing();
//     expect(host.textContent).to.equal('bar')
//   });

//   it.skip('$1', function() {
//     enableTracing();
//     Tracer.enableLiveLogging(SymbolTraceWriter);
//     // common stuff
//     const container = AuDOMConfiguration.createContainer();
//     const dom = container.get<AuDOM>(IDOM);
//     const observerLocator = container.get(IObserverLocator);
//     const scheduler = container.get(ILifecycle);

//     const location = AuNode.createRenderLocation();
//     const host = AuNode.createHost().appendChild(location.$start).appendChild(location);

//     const ifPropName = 'ifValue';
//     const elsePropName = 'elseValue';
//     const ifText = 'foo';
//     const elseText = 'bar';

//     const ifTemplate: ITemplate<AuNode> = {
//       renderContext: null as any,
//       dom: null as any,
//       render(renderable) {
//         const text = AuNode.createText();
//         const wrapper = AuNode.createTemplate().appendChild(text);

//         const nodes = new AuNodeSequence(dom, wrapper);
//         const binding = new Binding(new AccessScope(ifPropName), text, 'textContent', BindingMode.toView, observerLocator, container);

//         (renderable as Writable<typeof renderable>).$nodes = nodes;
//         addBinding(renderable, binding);
//       }
//     };

//     const elseTemplate: ITemplate<AuNode> = {
//       renderContext: null as any,
//       dom: null as any,
//       render(renderable) {
//         const text = AuNode.createText();
//         const wrapper = AuNode.createTemplate().appendChild(text);

//         const nodes = new AuNodeSequence(dom, wrapper);
//         const binding = new Binding(new AccessScope(elsePropName), text, 'textContent', BindingMode.toView, observerLocator, container);

//         (renderable as Writable<typeof renderable>).$nodes = nodes;
//         addBinding(renderable, binding);
//       }
//     };

//     const ifFactory = new ViewFactory<AuNode>('if-view', ifTemplate, scheduler);
//     const elseFactory = new ViewFactory<AuNode>('else-view', elseTemplate, scheduler);

//     const sut = new If<AuNode>(ifFactory, location, new CompositionCoordinator(scheduler));
//     const elseSut = new Else<AuNode>(elseFactory);
//     elseSut.link(sut);

//     (sut as Writable<If>).$scope = null;
//     (elseSut as Writable<Else>).$scope = null;

//     const ifBehavior = RuntimeBehavior.create(If);
//     ifBehavior.applyTo(sut, scheduler);

//     const elseBehavior = RuntimeBehavior.create(Else);
//     elseBehavior.applyTo(elseSut, scheduler);

//     let firstBindInitialNodesText: string;
//     let firstBindFinalNodesText: string;
//     let secondBindInitialHostsText: string;
//     let secondBindFinalNodesText: string;
//     let firstAttachInitialHostText: string = 'foo';
//     let firstAttachFinalHostText: string;
//     let secondAttachInitialHostText: string;
//     let secondAttachFinalHostText: string;

//     // -- Round 1 --

//     const ctx = BindingContext.create({
//       [ifPropName]: ifText,
//       [elsePropName]: elseText
//     });
//     let scope = Scope.create(ctx);

//     sut.value = false;

//     sut.$bind(LifecycleFlags.none, scope);
//     if (false) {
//       scope = Scope.create(ctx);
//     }
//     sut.value = true;
//     sut.$bind(LifecycleFlags.none, scope);

//     sut.$attach(LifecycleFlags.none);

//     assert.strictEqual(host.textContent, firstAttachInitialHostText, 'host.textContent #1', `host.textContent`);
//     disableTracing();

//   });
// });
