import {
  TemplateControllerSymbol,
  ReplacePartSymbol,
  CustomAttributeSymbol,
  PlainAttributeSymbol,
  CustomElementSymbol,
  PlainElementSymbol,
  TextSymbol,
  BindingSymbol,
  AttributeSymbol,
  ResourceAttributeSymbol,
  ElementSymbol,
  NodeSymbol,
  ParentNodeSymbol,
  ElementBinder
} from '../../src/element-binder';
import {
  ITemplateFactory,
  TemplateFactory
} from '../../src/template-factory';
import {
  stringifyTemplateDefinition, stringifyDOM
} from '../../src/debugging';
import {
  DefaultBindingLanguage,
  GlobalResources,
  ParserRegistration,
  IElementParser,
  BasicConfiguration,
  IAttributeParser
} from '../../../jit/src/index';
import {
  DI,
  IRegistry,
  IContainer,
  PLATFORM,
  Tracer,
  ITraceInfo,
  Container,
  Resolver
} from '../../../kernel/src/index';
import {
  Tracer as DebugTracer
} from '../../../debug/src/index';
import {
  IExpressionParser,
  RuntimeCompilationResources,
  IResourceDescriptions,
  ILifecycle,
  HtmlRenderer,
  CustomElementResource,
  Aurelia,
  DOM,
  IHTMLElement,
  INode,
  NodeType,
  IElement,
  IText,
  TargetedInstruction,
  TargetedInstructionType,
  ITemplateDefinition,
  IHTMLTemplateElement,
  ExpressionKind,
  Interpolation,
  ForOfStatement,
  AccessScope,
  CustomAttributeResource,
  PrimitiveLiteral,
  HydrateTemplateController,
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  InterpolationInstruction,
  CallBindingInstruction,
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  FromViewBindingInstruction,
  IteratorBindingInstruction,
  LetBindingInstruction,
  LetElementInstruction,
  OneTimeBindingInstruction,
  RefBindingInstruction,
  SetAttributeInstruction,
  SetPropertyInstruction,
  StylePropertyBindingInstruction,
  TextBindingInstruction,
  ToViewBindingInstruction,
  TriggerBindingInstruction,
  TwoWayBindingInstruction
} from '../../../runtime/src/index';
import { expect } from 'chai';
import {
  TemplateCompiler,
  SymbolPreprocessor,
  NodePreprocessor,
} from '../../src/template-compiler';
import { enableTracing, disableTracing, SymbolTraceWriter } from '../unit/util';
import { MetadataModel } from '../../src/metadata-model';

function setup(markup: string, ...extraResources: any[]) {
  const container = DI.createContainer();
  container.register(<any>BasicConfiguration);
  container.register(...extraResources);

  const attrParser = container.get<IAttributeParser>(IAttributeParser);
  const exprParser = container.get<IExpressionParser>(IExpressionParser);
  const resources = new RuntimeCompilationResources(<any>container);
  const metadata = new MetadataModel(<any>resources);
  const binder = new ElementBinder(metadata, attrParser, <any>exprParser);

  const factory = container.get<ITemplateFactory>(ITemplateFactory);
  const template = factory.createTemplate(markup);
  const surrogate = binder.bindSurrogate(template);

  return { container, factory, surrogate };
}


describe.only('element-binder', () => {
  it('repeater on div with interpolation', () => {
    enableTracing();
    Tracer.enableLiveLogging(SymbolTraceWriter);

    const { surrogate } = setup("<template><div repeat.for=\"i of 2\">${msg}</div></template>");

    expect(surrogate.childNodes.length).to.equal(1, 'surrogate.childNodes.length');

    const child$1 = surrogate.childNodes[0] as TemplateControllerSymbol;

    expect(child$1.hasAttributes).to.equal(false, 'child$1.hasAttributes');
    expect(child$1.expression).to.be.instanceof(ForOfStatement, 'child$1.expression');

    const child$2 = child$1.template as PlainElementSymbol;

    expect(child$2.childNodes.length).to.equal(1, 'child$2.childNodes.length');

    const child$3 = child$2.childNodes[0] as TextSymbol;

    expect(child$3.interpolation).to.be.instanceof(Interpolation, 'child$3.interpolation');

    disableTracing();
  });

  it('au-compose with various attributes', () => {
    enableTracing();
    Tracer.enableLiveLogging(SymbolTraceWriter);

    const CA = CustomAttributeResource.define({
      name: 'foo',
      bindables: { a: { property: 'a', attribute: 'a' }, b: { property: 'b', attribute: 'b' } },
      hasDynamicOptions: true
    }, class {});

    const { surrogate } = setup(`
    <template>
      <au-compose
        subject.bind="sub"
        zubject.bind="sub"
        subject="sub"
        zubject="sub"
        zzubject="\${sub}"
        foo="a: 1; b: 2"
        foo.bind="1">

        <div replace-part="foo"></div>
        <div replace-part="bar"></div>
      </au-compose>
    </template>
    `, CA);

    expect(surrogate.childNodes.length).to.equal(1, 'surrogate.childNodes.length');

    const child$1 = surrogate.childNodes[0] as CustomElementSymbol;

    expect(child$1.attributes.length).to.equal(6, 'child$1.attributes.length');
    expect(child$1.parts.length).to.equal(2, 'child$1.parts.length');

    const child$1attr$1 = child$1.attributes[0] as PlainAttributeSymbol;

    expect(child$1attr$1.bindable.propName).to.equal('subject', 'child$1attr$1.bindable.propName');
    expect(child$1attr$1.expression).to.be.instanceof(AccessScope, 'child$1attr$1.expression');

    const child$1attr$2 = child$1.attributes[1] as PlainAttributeSymbol;

    expect(child$1attr$2.bindable).to.equal(null, 'child$1attr$2.bindable');
    expect(child$1attr$2.expression).to.be.instanceof(AccessScope, 'child$1attr$2.expression');

    const child$1attr$3 = child$1.attributes[2] as PlainAttributeSymbol;

    expect(child$1attr$3.bindable.propName).to.equal('subject', 'child$1attr$3.bindable');
    expect(child$1attr$3.expression).to.be.equal(null, 'child$1attr$3.expression');

    const child$1attr$4 = child$1.attributes[3] as PlainAttributeSymbol;

    expect(child$1attr$4.bindable).to.equal(null, 'child$1attr$4.bindable.propName');
    expect(child$1attr$4.expression).to.be.instanceof(Interpolation, 'child$1attr$4.expression');

    const child$1attr$5 = child$1.attributes[4] as CustomAttributeSymbol;

    expect(child$1attr$5.expression).to.equal(null, 'child$1attr$5.expression');

    const child$1attr$6 = child$1.attributes[5] as CustomAttributeSymbol;

    expect(child$1attr$6.bindable.propName).to.equal('a', 'child$1attr$6.bindable.propName');
    expect(child$1attr$6.expression).to.be.instanceof(PrimitiveLiteral, 'child$1attr$6.expression');

    disableTracing();
  });

  it('compile template for repeater on div with interpolation', () => {
    enableTracing();
    Tracer.enableLiveLogging(SymbolTraceWriter);

    const { surrogate, factory, container } = setup("<template><div repeat.for=\"i of 2\">${msg}</div></template>");

    const templateController = surrogate.childNodes[0] as TemplateControllerSymbol;
    const div = templateController.template as ElementSymbol;
    const text = div.childNodes[0] as TextSymbol;

    const def: ITemplateDefinition = {
      name: 'app',
      template: factory.createTemplate(`<au-m class="au"></au-m>`) as unknown as IHTMLTemplateElement,
      instructions: [
        [
          new HydrateTemplateController(
            {
              name: 'repeat',
              template: factory.createTemplate(`<au-m class="au"></au-m> `) as unknown as IHTMLTemplateElement,
              instructions: [
                [
                  new TextBindingInstruction(text.interpolation as unknown as Interpolation)
                ]
              ]
            },
            'repeat',
            [
              new IteratorBindingInstruction(
                templateController.expression as unknown as ForOfStatement,
                templateController.bindable.propName
              )
            ],
            false
          )
        ]
      ]
    };

    const App = CustomElementResource.define(def, class { msg = 'hi' });
    const component = new App();
    const host = DOM.createElement('div');
    const au = new Aurelia(container as any);
    au.app({ host, component });
    au.start();

    expect(host.textContent).to.equal('hihi');



    disableTracing();
  });
})
