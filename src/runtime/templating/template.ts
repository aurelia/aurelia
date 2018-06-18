import { IViewOwner } from "./view";
import { INode, IView } from "../dom";
import { TemplatePartDefinitions } from "./instructions";
import { IRenderContext } from "./render-context";

export interface ITemplate {
  readonly renderContext: IRenderContext;
  createFor(owner: IViewOwner, host?: INode, parts?: TemplatePartDefinitions): IView;
}
