import { DOM, INode, INodeSequence, NodeSequence } from '../dom';
import { TemplateDefinition, TemplatePartDefinitions } from './instructions';
import { createRenderContext, IRenderContext } from './render-context';
import { IRenderable } from './renderable';
import { IRenderingEngine } from './rendering-engine';

// The basic template abstraction that allows consumers to create
// instances of an INodeSequence on-demand. Templates are contextual in that they are, in the very least,
// part of a particular application, with application-level resources, but they also may have their
// own scoped resources or be part of another view (via a template controller) which provides a
// context for the template.
export interface ITemplate {
  readonly renderContext: IRenderContext;
  createFor(renderable: IRenderable, host?: INode, parts?: TemplatePartDefinitions): INodeSequence;
}

// This is the main implementation of ITemplate.
// It is used to create instances of IView based on a compiled TemplateDefinition.
// TemplateDefinitions are hand-coded today, but will ultimately be the output of the
// TemplateCompiler either through a JIT or AOT process.
// Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
// and create instances of it on demand.
/*@internal*/
export class CompiledTemplate implements ITemplate {
  public renderContext: IRenderContext;
  private createNodeSequence: () => INodeSequence;

  constructor(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, private templateDefinition: TemplateDefinition) {
    this.renderContext = createRenderContext(renderingEngine, parentRenderContext, templateDefinition.dependencies);
    this.createNodeSequence = DOM.createFactoryFromMarkupOrNode(templateDefinition.templateOrNode);
  }

  public createFor(renderable: IRenderable, host?: INode, replacements?: TemplatePartDefinitions): INodeSequence {
    const nodes = this.createNodeSequence();
    this.renderContext.render(renderable, nodes.findTargets(), this.templateDefinition, host, replacements);
    return nodes;
  }
}

// This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
/*@internal*/
export const noViewTemplate: ITemplate = {
  renderContext: null,
  createFor(renderable: IRenderable): INodeSequence {
    return NodeSequence.empty;
  }
};
