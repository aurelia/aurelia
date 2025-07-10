import { IContainer } from '@aurelia/kernel';
import { ICompiledCustomElementController, ICustomElementViewModel, ICustomElementController, IHydratedController, IHydratedParentController, ISyntheticView } from '@aurelia/runtime-html';
import { NavigationFlags } from '../index';
import { Viewport } from '../endpoints/viewport';
import { Step } from '../utilities/runner';
import { OpenPromise } from '../utilities/open-promise';
import { FallbackAction } from '../router-options';
export declare class ViewportCustomElement implements ICustomElementViewModel {
    /**
     * The name of the viewport. Should be unique within the routing scope.
     */
    name: string;
    /**
     * A list of components that is using the viewport. These components
     * can only be loaded into this viewport and this viewport can't
     * load any other components.
     */
    usedBy: string;
    /**
     * The default component that's loaded if the viewport is created
     * without having a component specified (in that navigation).
     */
    default: string;
    /**
     * The component loaded if the viewport can't load the specified
     * component. The component is passed as a parameter to the fallback.
     */
    fallback: string;
    /**
     * Whether the fallback action is to load the fallback component in
     * place of the unloadable component and continue with any child
     * instructions or if the fallback is to be called and the processing
     * of the children to be aborted.
     */
    fallbackAction: FallbackAction | '';
    /**
     * Indicates that the viewport has no scope.
     */
    noScope: boolean;
    /**
     * Indicates that the viewport doesn't add a content link to
     * the Location URL.
     */
    noLink: boolean;
    /**
     * Indicates that the viewport doesn't add a title to the browser
     * window title.
     */
    noTitle: boolean;
    /**
     * Indicates that the viewport doesn't add history content to
     * the History API.
     */
    noHistory: boolean;
    /**
     * Whether the components of the viewport are stateful or not.
     */
    stateful: boolean;
    /**
     * The connected Viewport.
     */
    endpoint: Viewport | null;
    /**
     * The custom element controller.
     */
    controller: ICustomElementController;
    /**
     * Child viewports waiting to be connected.
     */
    pendingChildren: ViewportCustomElement[];
    /**
     * Promise to await while children are waiting to be connected.
     */
    pendingPromise: OpenPromise | null;
    /**
     * Whether the viewport is bound or not.
     */
    private isBound;
    private readonly router;
    readonly element: HTMLElement;
    readonly container: IContainer;
    private readonly ea;
    readonly parentViewport: ViewportCustomElement;
    private readonly instruction;
    hydrated(controller: ICompiledCustomElementController): void | Promise<void>;
    binding(initiator: IHydratedController, _parent: IHydratedParentController | null): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: ISyntheticView | ICustomElementController | null): void | Promise<void>;
    unbinding(_initiator: IHydratedController, _parent: ISyntheticView | ICustomElementController | null): void | Promise<void>;
    dispose(): void;
    /**
     * Connect this custom element to a router endpoint (Viewport).
     */
    connect(): void;
    /**
     * Disconnect this custom element from its router endpoint (Viewport).
     */
    disconnect(step: Step | null): void;
    /**
     * Set whether the viewport is currently active or not. Adds or removes
     * activity classes to the custom element
     *
     * @param active - Whether the viewport is active or not
     */
    setActivity(state: string | NavigationFlags, active: boolean): void;
}
//# sourceMappingURL=viewport.d.ts.map