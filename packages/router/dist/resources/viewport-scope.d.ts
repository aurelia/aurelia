import { INode, LifecycleFlags, ICompiledCustomElementController, ICustomElementViewModel, ICustomElementController, CustomElementDefinition, IDryCustomElementController, PartialCustomElementDefinitionParts, PartialCustomElementDefinition, IHydratedController } from '@aurelia/runtime';
import { IRouter } from '../router';
import { ViewportScope } from '../viewport-scope';
import { IContainer } from '@aurelia/kernel';
export declare const ParentViewportScope: import("@aurelia/runtime/dist/resources/custom-element").InjectableToken<import("@aurelia/kernel").Key>;
export declare class ViewportScopeCustomElement implements ICustomElementViewModel<Element> {
    private readonly router;
    private container;
    private readonly parent;
    private readonly parentController;
    name: string;
    catches: string;
    collection: boolean;
    source: unknown[] | null;
    viewportScope: ViewportScope | null;
    readonly $controller: ICustomElementController<Element, this>;
    private readonly element;
    private isBound;
    constructor(router: IRouter, element: INode, container: IContainer, parent: ViewportScopeCustomElement, parentController: IHydratedController);
    create(controller: IDryCustomElementController<Element, this>, parentContainer: IContainer, definition: CustomElementDefinition, parts: PartialCustomElementDefinitionParts | undefined): PartialCustomElementDefinition;
    afterCompile(controller: ICompiledCustomElementController): void;
    afterUnbound(): void;
    connect(): void;
    disconnect(): void;
    beforeBind(flags: LifecycleFlags): void;
    beforeUnbind(flags: LifecycleFlags): Promise<void>;
    private getAttribute;
}
//# sourceMappingURL=viewport-scope.d.ts.map