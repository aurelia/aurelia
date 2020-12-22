import { LifecycleFlags } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom.js';
import { IViewFactory } from '../../templating/view.js';
import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../templating/controller.js';
declare abstract class FlagsTemplateController implements ICustomAttributeViewModel {
    private readonly factory;
    private readonly flags;
    readonly id: number;
    view: ISyntheticView;
    readonly $controller: ICustomAttributeController<this>;
    constructor(factory: IViewFactory, location: IRenderLocation, flags: LifecycleFlags);
    attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
export declare class FrequentMutations extends FlagsTemplateController {
    constructor(factory: IViewFactory, location: IRenderLocation);
}
export declare class ObserveShallow extends FlagsTemplateController {
    constructor(factory: IViewFactory, location: IRenderLocation);
}
export {};
//# sourceMappingURL=flags.d.ts.map