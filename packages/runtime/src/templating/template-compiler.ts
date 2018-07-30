import { TemplateDefinition } from "./instructions";
import { DI } from "../../kernel/di";
import { IResourceDescriptions } from "../resource";

export interface ITemplateCompiler {
  readonly name: string;
  compile(definition: TemplateDefinition, resources: IResourceDescriptions): TemplateDefinition;
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>().noDefault();
