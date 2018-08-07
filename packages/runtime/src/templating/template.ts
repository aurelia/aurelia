import { INode, IView } from '../dom';
import { TemplatePartDefinitions } from './instructions';
import { IRenderContext } from './render-context';
import { IViewOwner } from './view';

// The basic template abstraction that allows consumers to create
// instances of an IView on-demand. Templates are contextual in that they are, in the very least,
// part of a particular application, with application-level resources, but they also may have their
// own scoped resources or be part of another view (via a template controller) which provides a
// context for the template.
export interface ITemplate {
  readonly renderContext: IRenderContext;
  createFor(owner: IViewOwner, host?: INode, parts?: TemplatePartDefinitions): IView;
}
