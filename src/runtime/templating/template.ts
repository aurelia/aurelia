import { IViewOwner } from "./view";
import { INode, IView } from "../dom";
import { ITemplateSource } from "./instructions";
import { ITemplateContainer } from "./template-container";

export interface ITemplate {
  readonly container: ITemplateContainer;
  createFor(owner: IViewOwner, host?: INode, replacements?: Record<string, ITemplateSource>): IView;
}
