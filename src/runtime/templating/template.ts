import { IViewOwner } from "./view";
import { INode, IView } from "../dom";
import { ITemplateSource } from "./instructions";
import { IRenderContext } from "./render-context";

export interface ITemplate {
  readonly context: IRenderContext;
  createFor(owner: IViewOwner, host?: INode, replacements?: Record<string, ITemplateSource>): IView;
}
