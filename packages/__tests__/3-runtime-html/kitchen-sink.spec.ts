import {
  IAttrSyntaxTransformer,
  TemplateBinder,
  IAttributeParser,
  Aurelia,
  CustomElement,
  IExpressionParser,
} from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

// TemplateCompiler - integration with various different parts
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
      const ctx = TestContext.create();
      const parser = new ctx.DOMParser();
      const doc = parser.parseFromString(markup, 'application/xml');
      const fakeSurrogate = { firstChild: doc, attributes: [] };

      const binder = new TemplateBinder(
        ctx.platform,
        ctx.container,
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

    const ctx = TestContext.create();
    ctx.container.register(Foo);
    const au = new Aurelia(ctx.container);

    const host = ctx.createElement('div');
    const component = new App();

    au.app({ host, component });

    void au.start();

    assert.strictEqual(host.textContent, 'bar', `host.textContent`);
  });
});

// commented out code left here intentionally, serves as a staring point for template controller tests

// describe('test', function () {
//   it.skip('$1', function () {
//     enableTracing();
//     Tracer.enableLiveLogging(SymbolTraceWriter);
//     const container = StandardConfiguration.createContainer();
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

//     const platform = container.get(ILifecycle);
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

//   it.skip('$1', function () {
//     enableTracing();
//     Tracer.enableLiveLogging(SymbolTraceWriter);
//     // common stuff
//     const container = AuDOMConfiguration.createContainer();
//     const dom = container.get<AuDOM>(IDOM);
//     const observerLocator = container.get(IObserverLocator);
//     const platform = container.get(ILifecycle);

//     const location = AuNode.createRenderLocation();
//     const host = AuNode.createHost().appendChild(location.$start).appendChild(location);

//     const ifPropName = 'ifValue';
//     const elsePropName = 'elseValue';
//     const ifText = 'foo';
//     const elseText = 'bar';

//     const ifTemplate: ITemplate = {
//       renderContext: null as any,
//       dom: null as any,
//       compose(composable) {
//         const text = AuNode.createText();
//         const wrapper = AuNode.createTemplate().appendChild(text);

//         const nodes = new AuNodeSequence(dom, wrapper);
//         const binding = new Binding(new AccessScope(ifPropName), text, 'textContent', BindingMode.toView, observerLocator, container);

//         (composable as Writable<typeof composable>).$nodes = nodes;
//         addBinding(composable, binding);
//       }
//     };

//     const elseTemplate: ITemplate = {
//       renderContext: null as any,
//       dom: null as any,
//       compose(composable) {
//         const text = AuNode.createText();
//         const wrapper = AuNode.createTemplate().appendChild(text);

//         const nodes = new AuNodeSequence(dom, wrapper);
//         const binding = new Binding(new AccessScope(elsePropName), text, 'textContent', BindingMode.toView, observerLocator, container);

//         (composable as Writable<typeof composable>).$nodes = nodes;
//         addBinding(composable, binding);
//       }
//     };

//     const ifFactory = new ViewFactory('if-view', ifTemplate, platform);
//     const elseFactory = new ViewFactory('else-view', elseTemplate, platform);

//     const sut = new If(ifFactory, location, new CompositionCoordinator(platform));
//     const elseSut = new Else(elseFactory);
//     elseSut.link(sut);

//     (sut as Writable<If>).$scope = null;
//     (elseSut as Writable<Else>).$scope = null;

//     const ifBehavior = RuntimeBehavior.create(If);
//     ifBehavior.applyTo(sut, platform);

//     const elseBehavior = RuntimeBehavior.create(Else);
//     elseBehavior.applyTo(elseSut, platform);

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
