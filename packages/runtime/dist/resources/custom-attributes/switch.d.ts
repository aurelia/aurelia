import { ILogger } from '@aurelia/kernel';
import { IHydrateTemplateController } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, IRenderableController, ISyntheticView, IViewFactory } from '../../lifecycle';
import { IndexMap } from '../../observation';
import { IObserverLocator } from '../../observation/observer-locator';
import { ICompiledRenderContext } from '../../templating/render-context';
import { Scope } from '../../observation/binding-context';
export declare class Switch<T extends INode = Node> implements ICustomAttributeViewModel<T> {
    private readonly factory;
    private readonly location;
    readonly id: number;
    readonly $controller: ICustomAttributeController<T, this>;
    private view;
    value: unknown;
    private activeCases;
    /**
     * This is kept around here so that changes can be awaited from the tests.
     * This needs to be removed after the scheduler is ready to handle/queue the floating promises.
     */
    readonly promise: Promise<void> | void;
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>);
    link(flags: LifecycleFlags, parentContext: ICompiledRenderContext, controller: IRenderableController, childController: ICustomAttributeController, target: INode, instruction: IHydrateTemplateController): void;
    afterAttach(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    afterUnbind(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
    valueChanged(_newValue: boolean, _oldValue: boolean, flags: LifecycleFlags): void;
    caseChanged($case: Case<T>, flags: LifecycleFlags): void;
    private handleCaseChange;
    private swap;
    private activateCases;
    private clearActiveCases;
    private queue;
}
export declare class Case<T extends INode = Node> implements ICustomAttributeViewModel<T> {
    private readonly factory;
    private readonly locator;
    readonly id: number;
    readonly $controller: ICustomAttributeController<T, this>;
    value: unknown;
    fallThrough: boolean;
    view: ISyntheticView<T>;
    private $switch;
    private readonly debug;
    private readonly logger;
    private observer;
    constructor(factory: IViewFactory<T>, locator: IObserverLocator, location: IRenderLocation<T>, logger: ILogger);
    link(flags: LifecycleFlags, parentContext: ICompiledRenderContext, controller: IRenderableController, _childController: ICustomAttributeController, _target: INode, _instruction: IHydrateTemplateController): void;
    afterUnbind(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    isMatch(value: unknown, flags: LifecycleFlags): boolean;
    valueChanged(newValue: unknown, _oldValue: unknown, flags: LifecycleFlags): void;
    handleCollectionChange(_indexMap: IndexMap, flags: LifecycleFlags): void;
    activate(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void | Promise<void>;
    deactivate(flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
    protected linkToSwitch(auSwitch: Switch<T>): void;
    private observeCollection;
}
export declare class DefaultCase<T extends INode = Node> extends Case<T> {
    protected linkToSwitch($switch: Switch<T>): void;
}
//# sourceMappingURL=switch.d.ts.map