import { IRenderLocation } from '../../dom.js';
import { IHydrationContext } from '../../templating/controller.js';
import { IRendering } from '../../templating/rendering.js';
import type { LifecycleFlags } from '@aurelia/runtime';
import type { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller.js';
import type { HydrateElementInstruction } from '../../renderer.js';
export declare class AuSlot implements ICustomElementViewModel {
    private readonly hdrContext;
    readonly view: ISyntheticView;
    readonly $controller: ICustomElementController<this>;
    private parentScope;
    private outerScope;
    private readonly hasProjection;
    expose: object | undefined;
    constructor(location: IRenderLocation, instruction: HydrateElementInstruction, hdrContext: IHydrationContext, rendering: IRendering);
    binding(_initiator: IHydratedController, _parent: IHydratedParentController, _flags: LifecycleFlags): void | Promise<void>;
    attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    exposeChanged(v: object): void;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
//# sourceMappingURL=au-slot.d.ts.map