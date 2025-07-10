/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { ICompiledCustomElementController, ICustomElementViewModel, ICustomElementController, IHydratedController, ISyntheticView } from '@aurelia/runtime-html';
import { IContainer } from '@aurelia/kernel';
import { ViewportScope } from '../endpoints/viewport-scope';
export declare class ViewportScopeCustomElement implements ICustomElementViewModel {
    name: string;
    catches: string;
    collection: boolean;
    source: unknown[] | null;
    viewportScope: ViewportScope | null;
    readonly $controller: ICustomElementController<this>;
    controller: ICustomElementController;
    private isBound;
    private readonly router;
    readonly element: HTMLElement;
    container: IContainer;
    private readonly parent;
    private readonly parentController;
    hydrated(controller: ICompiledCustomElementController): void;
    bound(_initiator: IHydratedController, _parent: ISyntheticView | ICustomElementController | null): void;
    unbinding(_initiator: IHydratedController, _parent: ISyntheticView | ICustomElementController | null): void | Promise<void>;
    connect(): void;
    disconnect(): void;
    private getAttribute;
}
//# sourceMappingURL=viewport-scope.d.ts.map