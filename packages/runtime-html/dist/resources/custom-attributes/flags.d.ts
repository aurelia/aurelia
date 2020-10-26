import { LifecycleFlags } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../lifecycle';
import { IViewFactory } from '../../templating/view';
declare abstract class FlagsTemplateController implements ICustomAttributeViewModel {
    private readonly factory;
    private readonly flags;
    readonly id: number;
    view: ISyntheticView;
    readonly $controller: ICustomAttributeController<this>;
    constructor(factory: IViewFactory, location: IRenderLocation, flags: LifecycleFlags);
    afterAttach(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    afterUnbind(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    onCancel(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
export declare class InfrequentMutations extends FlagsTemplateController {
    constructor(factory: IViewFactory, location: IRenderLocation);
}
export declare class FrequentMutations extends FlagsTemplateController {
    constructor(factory: IViewFactory, location: IRenderLocation);
}
export declare class ObserveShallow extends FlagsTemplateController {
    constructor(factory: IViewFactory, location: IRenderLocation);
}
export {};
//# sourceMappingURL=flags.d.ts.map