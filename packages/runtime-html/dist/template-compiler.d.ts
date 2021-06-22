import { ITemplateCompiler } from './renderer.js';
import { CustomElementDefinition } from './resources/custom-element.js';
import type { IContainer, IResolver } from '@aurelia/kernel';
import type { PartialCustomElementDefinition } from './resources/custom-element.js';
import type { ICompliationInstruction } from './renderer.js';
export declare class ViewCompiler implements ITemplateCompiler {
    static register(container: IContainer): IResolver<ITemplateCompiler>;
    compile(partialDefinition: PartialCustomElementDefinition, container: IContainer, compilationInstruction: ICompliationInstruction | null): CustomElementDefinition;
    private shouldReorderAttrs;
    private reorder;
}
//# sourceMappingURL=template-compiler.d.ts.map