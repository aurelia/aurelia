import { IRenderLocation } from '../../dom.js';
import { IHydrationContext } from '../../templating/controller.js';
import type { LifecycleFlags } from '@aurelia/runtime';
import type { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller.js';
import type { HydrateElementInstruction } from '../../renderer.js';
export declare class AuSlot implements ICustomElementViewModel {
    private readonly hdrContext;
    readonly view: ISyntheticView;
    readonly $controller: ICustomElementController<this>;
    private hostScope;
    private outerScope;
    private readonly hasProjection;
    constructor(location: IRenderLocation, instruction: HydrateElementInstruction, hdrContext: IHydrationContext);
    binding(_initiator: IHydratedController, _parent: IHydratedParentController, _flags: LifecycleFlags): void | Promise<void>;
    attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
//# sourceMappingURL=au-slot.d.ts.map