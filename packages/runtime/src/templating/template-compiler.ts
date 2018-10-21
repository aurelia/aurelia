import { DI } from '@aurelia/kernel';
import { IResourceDescriptions } from '../resource';
import { ITemplateDefinition, TemplateDefinition } from './instructions';

export interface ITemplateCompiler {
  readonly name: string;
  compile(definition: ITemplateDefinition, resources: IResourceDescriptions, viewCompileFlags?: ViewCompileFlags): TemplateDefinition;
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>().noDefault();

export enum ViewCompileFlags {
  none        = 0b0_001,
  surrogate   = 0b0_010,
  shadowDOM   = 0b0_100,
}
