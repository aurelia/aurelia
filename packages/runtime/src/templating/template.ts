import { INode, INodeSequence } from '../dom';
import { TemplatePartDefinitions } from './instructions';
import { IRenderContext } from './render-context';
import { IRenderable } from './renderable';

// The basic template abstraction that allows consumers to create
// instances of an INodeSequence on-demand. Templates are contextual in that they are, in the very least,
// part of a particular application, with application-level resources, but they also may have their
// own scoped resources or be part of another view (via a template controller) which provides a
// context for the template.
export interface ITemplate {
  readonly renderContext: IRenderContext;
  createFor(renderable: IRenderable, host?: INode, parts?: TemplatePartDefinitions): INodeSequence;
}
