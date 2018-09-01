import { DI } from '@aurelia/kernel';
import { IResourceDescriptions } from '../resource';
import { TemplateDefinition } from './instructions';
import { ViewCompileFlags } from './view-compile-flags';

export interface ITemplateCompiler {
  readonly name: string;
  compile(definition: TemplateDefinition, resources: IResourceDescriptions, viewCompileFlags?: ViewCompileFlags): TemplateDefinition;
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>().noDefault();
