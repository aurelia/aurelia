import { IContainer } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { INode, INodeSequence } from '../dom.js';
import { ICompliationInstruction, IRenderer } from '../renderer.js';
import { CustomElementDefinition, PartialCustomElementDefinition } from '../resources/custom-element.js';
import { IViewFactory } from './view.js';
import type { IHydratableController } from './controller.js';
export declare const IRendering: import("@aurelia/kernel").InterfaceSymbol<IRendering>;
export interface IRendering extends Rendering {
}
export declare class Rendering {
    private rs;
    get renderers(): Record<string, IRenderer>;
    constructor(container: IContainer);
    compile(definition: PartialCustomElementDefinition, container: IContainer, compilationInstruction: ICompliationInstruction | null): CustomElementDefinition;
    getViewFactory(definition: PartialCustomElementDefinition, container: IContainer): IViewFactory;
    createNodes(definition: CustomElementDefinition): INodeSequence;
    render(flags: LifecycleFlags, controller: IHydratableController, targets: ArrayLike<INode>, definition: CustomElementDefinition, host: INode | null | undefined): void;
}
//# sourceMappingURL=rendering.d.ts.map