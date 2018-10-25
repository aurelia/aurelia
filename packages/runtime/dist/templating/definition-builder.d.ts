import { Immutable } from '@aurelia/kernel';
import { IBindableDescription, IBuildInstruction, ITemplateDefinition, TargetedInstruction, TemplateDefinition } from '../definitions';
import { INode } from '../dom';
import { ICustomElementType } from './custom-element';
export declare function buildTemplateDefinition(ctor: ICustomElementType, name: string): TemplateDefinition;
export declare function buildTemplateDefinition(ctor: null, def: Immutable<ITemplateDefinition>): TemplateDefinition;
export declare function buildTemplateDefinition(ctor: ICustomElementType | null, nameOrDef: string | Immutable<ITemplateDefinition>): TemplateDefinition;
export declare function buildTemplateDefinition(ctor: ICustomElementType | null, name: string | null, template: string | INode, cache?: number | '*' | null, build?: IBuildInstruction | boolean | null, bindables?: Record<string, IBindableDescription> | null, instructions?: ReadonlyArray<ReadonlyArray<TargetedInstruction>> | null, dependencies?: ReadonlyArray<unknown> | null, surrogates?: ReadonlyArray<TargetedInstruction> | null, containerless?: boolean | null, shadowOptions?: {
    mode: 'open' | 'closed';
} | null, hasSlots?: boolean | null): TemplateDefinition;
//# sourceMappingURL=definition-builder.d.ts.map