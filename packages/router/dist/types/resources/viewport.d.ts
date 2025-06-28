import { ICompiledCustomElementController, ICustomElementViewModel, IHydratedController } from '@aurelia/runtime-html';
import { FallbackFunction, Routeable } from '../options';
export interface IViewport {
    readonly name: string;
    readonly usedBy: string;
    readonly default: string;
    readonly fallback: Routeable | FallbackFunction;
}
export declare class ViewportCustomElement implements ICustomElementViewModel, IViewport {
    name: string;
    usedBy: string;
    default: string;
    fallback: Routeable | FallbackFunction;
    hydrated(controller: ICompiledCustomElementController): void;
    attaching(initiator: IHydratedController, _parent: IHydratedController): void | Promise<void>;
    detaching(initiator: IHydratedController, _parent: IHydratedController): void | Promise<void>;
    dispose(): void;
    toString(): string;
}
//# sourceMappingURL=viewport.d.ts.map