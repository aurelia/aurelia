import { TemplateDefinition } from "./instructions";
import { DI } from '@aurelia/kernel';
import { IResourceDescriptions } from "../resource";

export interface ITemplateCompiler {
  readonly name: string;
  compile(definition: TemplateDefinition, resources: IResourceDescriptions): TemplateDefinition;
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>().noDefault();
