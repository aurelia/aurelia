import { DI } from '@aurelia/kernel';
import { IResourceDescriptions } from '../resource';
import { ITemplateSource, TemplateDefinition } from './instructions';
import { ViewCompileFlags } from './view-compile-flags';

export interface ITemplateCompiler {
  readonly name: string;
  compile(definition: ITemplateSource, resources: IResourceDescriptions, viewCompileFlags?: ViewCompileFlags): TemplateDefinition;
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>().noDefault();
