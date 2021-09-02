import { ILogger } from '@aurelia/kernel';
import { LifecycleFlags, IObserverLocator, IndexMap, Scope } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom.js';
import { IViewFactory } from '../../templating/view.js';
import type { ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, IHydratableController, ISyntheticView, ControllerVisitor } from '../../templating/controller.js';
import type { INode } from '../../dom.js';
import type { IInstruction } from '../../renderer.js';
export declare class Switch implements ICustomAttributeViewModel {
    private readonly _factory;
    private readonly _location;
    readonly id: number;
    readonly $controller: ICustomAttributeController<this>;
    private view;
    value: unknown;
    private activeCases;
    /**
     * This is kept around here so that changes can be awaited from the tests.
     * This needs to be removed after the scheduler is ready to handle/queue the floating promises.
     */
    readonly promise: Promise<void> | void;
    constructor(_factory: IViewFactory, _location: IRenderLocation);
    link(_controller: IHydratableController, _childController: ICustomAttributeController, _target: INode, _instruction: IInstruction): void;
    attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
    valueChanged(_newValue: boolean, _oldValue: boolean, flags: LifecycleFlags): void;
    caseChanged($case: Case, flags: LifecycleFlags): void;
    private swap;
    private queue;
    accept(visitor: ControllerVisitor): void | true;
}
export declare class Case implements ICustomAttributeViewModel {
    readonly id: number;
    readonly $controller: ICustomAttributeController<this>;
    value: unknown;
    fallThrough: boolean;
    view: ISyntheticView;
    private $switch;
    constructor(factory: IViewFactory, 
    /** @internal */ _locator: IObserverLocator, location: IRenderLocation, logger: ILogger);
    link(controller: IHydratableController, _childController: ICustomAttributeController, _target: INode, _instruction: IInstruction): void;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    isMatch(value: unknown, flags: LifecycleFlags): boolean;
    valueChanged(newValue: unknown, _oldValue: unknown, flags: LifecycleFlags): void;
    handleCollectionChange(_indexMap: IndexMap, flags: LifecycleFlags): void;
    activate(initiator: IHydratedController | null, flags: LifecycleFlags, scope: Scope): void | Promise<void>;
    deactivate(initiator: IHydratedController | null, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
    protected linkToSwitch(auSwitch: Switch): void;
    private _observeCollection;
    accept(visitor: ControllerVisitor): void | true;
}
export declare class DefaultCase extends Case {
    protected linkToSwitch($switch: Switch): void;
}
//# sourceMappingURL=switch.d.ts.map