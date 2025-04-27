import { IContainer } from '@aurelia/kernel';
import { INodeSequence } from '../dom';
import { INode } from '../dom.node';
import { IRenderer } from '../renderer';
import { CustomElementDefinition, PartialCustomElementDefinition } from '../resources/custom-element';
import { IViewFactory } from './view';
import type { IHydratableController } from './controller';
export declare const IRendering: import("@aurelia/kernel").InterfaceSymbol<IRendering>;
export interface IRendering {
    get renderers(): Record<string, IRenderer>;
    compile(definition: CustomElementDefinition, container: IContainer): CustomElementDefinition;
    getViewFactory(definition: PartialCustomElementDefinition, container: IContainer): IViewFactory;
    createNodes(definition: CustomElementDefinition): INodeSequence;
    render(controller: IHydratableController, targets: ArrayLike<INode>, definition: CustomElementDefinition, host: INode | null | undefined): void;
}
export declare class Rendering implements IRendering {
    get renderers(): Record<string, IRenderer>;
    constructor();
    compile(definition: CustomElementDefinition, container: IContainer): CustomElementDefinition;
    getViewFactory(definition: PartialCustomElementDefinition, container: IContainer): IViewFactory;
    createNodes(definition: CustomElementDefinition): INodeSequence;
    render(controller: IHydratableController, targets: ArrayLike<INode>, definition: CustomElementDefinition, host: INode | null | undefined): void;
}
//# sourceMappingURL=rendering.d.ts.map