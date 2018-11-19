import { Writable } from '@aurelia/kernel';
import { createRenderContext, INode, INodeSequenceFactory, IRenderable, IRenderContext, IRenderingEngine, ITemplate, NodeSequence, TemplateDefinition, TemplatePartDefinitions } from '@aurelia/runtime';
import { PixiNodeSequenceFactory } from './pixi-node-sequence';

// This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
/*@internal*/
export const noViewTemplate: ITemplate = {
  renderContext: null,
  render(renderable: IRenderable): void {
    (<Writable<IRenderable>>renderable).$nodes = NodeSequence.empty;
    (<Writable<IRenderable>>renderable).$context = null;
  }
};

// This is the main implementation of ITemplate.
// It is used to create instances of IView based on a compiled TemplateDefinition.
// TemplateDefinitions are hand-coded today, but will ultimately be the output of the
// TemplateCompiler either through a JIT or AOT process.
// Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
// and create instances of it on demand.
/*@internal*/
export class PixiCompiledTemplate implements ITemplate {
  public readonly factory: INodeSequenceFactory;
  public readonly renderContext: IRenderContext;
  constructor(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, private templateDefinition: TemplateDefinition) {
    this.factory = PixiNodeSequenceFactory.createFor(templateDefinition.template);
    this.renderContext = createRenderContext(renderingEngine, parentRenderContext, templateDefinition.dependencies);
  }
  public render(renderable: IRenderable, host?: INode, parts?: TemplatePartDefinitions): void {
    const nodes = (<Writable<IRenderable>>renderable).$nodes = this.factory.createNodeSequence();
    (<Writable<IRenderable>>renderable).$context = this.renderContext;
    this.renderContext.render(renderable, nodes.findTargets(), this.templateDefinition, host, parts);
  }
}