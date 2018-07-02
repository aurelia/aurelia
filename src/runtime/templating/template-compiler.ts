import { TemplateDefinition, IElementDescription, IAttributeDescription } from "./instructions";
import { DI } from "../../kernel/di";

export interface ICompilationResources {
  tryGetElement(name: string): IElementDescription | null;
  tryGetAttribute(name: string): IAttributeDescription | null;
}

export interface ITemplateCompiler {
  readonly name: string;
  compile(definition: TemplateDefinition, resources: ICompilationResources): TemplateDefinition;
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>().noDefault();
