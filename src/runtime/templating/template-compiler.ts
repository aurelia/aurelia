import { TemplateDefinition } from "./instructions";
import { IServiceLocator, DI } from "../../kernel/di";

export type Resources = Pick<IServiceLocator, 'has'>;

export interface ITemplateCompiler {
  readonly name: string;
  compile(definition: TemplateDefinition, resources: Resources): TemplateDefinition;
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>().noDefault();
