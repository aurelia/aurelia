import { ILogger } from '@aurelia/kernel';
import { LifecycleFlags, Scope } from '@aurelia/runtime';
import { INode, IRenderLocation } from '../../dom.js';
import { IPlatform } from '../../platform.js';
import { IInstruction } from '../../renderer.js';
import { ICustomAttributeController, ICustomAttributeViewModel, IHydratableController, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller.js';
import { IViewFactory } from '../../templating/view.js';
import { AttrSyntax } from '../attribute-pattern.js';
export declare class PromiseTemplateController implements ICustomAttributeViewModel {
    readonly id: number;
    readonly $controller: ICustomAttributeController<this>;
    private view;
    value: Promise<unknown>;
    pending?: PendingTemplateController;
    fulfilled?: FulfilledTemplateController;
    rejected?: RejectedTemplateController;
    private viewScope;
    private preSettledTask;
    private postSettledTask;
    private postSettlePromise;
    constructor(
    /** @internal */ _factory: IViewFactory, 
    /** @internal */ _location: IRenderLocation, 
    /** @internal */ _platform: IPlatform, logger: ILogger);
    link(_controller: IHydratableController, _childController: ICustomAttributeController, _target: INode, _instruction: IInstruction): void;
    attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    valueChanged(_newValue: boolean, _oldValue: boolean, flags: LifecycleFlags): void;
    private swap;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
}
export declare class PendingTemplateController implements ICustomAttributeViewModel {
    private readonly factory;
    readonly id: number;
    readonly $controller: ICustomAttributeController<this>;
    value: Promise<unknown>;
    view: ISyntheticView;
    constructor(factory: IViewFactory, location: IRenderLocation);
    link(controller: IHydratableController, _childController: ICustomAttributeController, _target: INode, _instruction: IInstruction): void;
    activate(initiator: IHydratedController | null, flags: LifecycleFlags, scope: Scope): void | Promise<void>;
    deactivate(initiator: IHydratedController | null, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
}
export declare class FulfilledTemplateController implements ICustomAttributeViewModel {
    private readonly factory;
    readonly id: number;
    readonly $controller: ICustomAttributeController<this>;
    value: unknown;
    view: ISyntheticView;
    constructor(factory: IViewFactory, location: IRenderLocation);
    link(controller: IHydratableController, _childController: ICustomAttributeController, _target: INode, _instruction: IInstruction): void;
    activate(initiator: IHydratedController | null, flags: LifecycleFlags, scope: Scope, resolvedValue: unknown): void | Promise<void>;
    deactivate(initiator: IHydratedController | null, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
}
export declare class RejectedTemplateController implements ICustomAttributeViewModel {
    private readonly factory;
    readonly id: number;
    readonly $controller: ICustomAttributeController<this>;
    value: unknown;
    view: ISyntheticView;
    constructor(factory: IViewFactory, location: IRenderLocation);
    link(controller: IHydratableController, _childController: ICustomAttributeController, _target: INode, _instruction: IInstruction): void;
    activate(initiator: IHydratedController | null, flags: LifecycleFlags, scope: Scope, error: unknown): void | Promise<void>;
    deactivate(initiator: IHydratedController | null, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
}
export declare class PromiseAttributePattern {
    'promise.resolve'(name: string, value: string, _parts: string[]): AttrSyntax;
}
export declare class FulfilledAttributePattern {
    'then'(name: string, value: string, _parts: string[]): AttrSyntax;
}
export declare class RejectedAttributePattern {
    'catch'(name: string, value: string, _parts: string[]): AttrSyntax;
}
//# sourceMappingURL=promise.d.ts.map