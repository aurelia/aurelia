import { type Scope } from '@aurelia/runtime';
import type { IInstruction } from '@aurelia/template-compiler';
import { CustomAttributeStaticAuDefinition } from '../custom-attribute';
import type { ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, IHydratableController, ISyntheticView, ControllerVisitor } from '../../templating/controller';
import type { INode } from '../../dom.node';
export declare class Switch implements ICustomAttributeViewModel {
    static readonly $au: CustomAttributeStaticAuDefinition;
    readonly $controller: ICustomAttributeController<this>;
    private view;
    value: unknown;
    private activeCases;
    /**
     * This is kept around here so that changes can be awaited from the tests.
     * This needs to be removed after the scheduler is ready to handle/queue the floating promises.
     */
    readonly promise: Promise<void> | void;
    link(_controller: IHydratableController, _childController: ICustomAttributeController, _target: INode, _instruction: IInstruction): void;
    attaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    dispose(): void;
    valueChanged(_newValue: boolean, _oldValue: boolean): void;
    caseChanged($case: Case): void;
    private swap;
    private queue;
    accept(visitor: ControllerVisitor): void | true;
}
export declare class Case implements ICustomAttributeViewModel {
    readonly $controller: ICustomAttributeController<this>;
    value: unknown;
    fallThrough: boolean;
    view: ISyntheticView | undefined;
    private $switch;
    link(controller: IHydratableController, _childController: ICustomAttributeController, _target: INode, _instruction: IInstruction): void;
    detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void>;
    isMatch(value: unknown): boolean;
    valueChanged(newValue: unknown, _oldValue: unknown): void;
    handleCollectionChange(): void;
    activate(initiator: IHydratedController | null, scope: Scope): void | Promise<void>;
    deactivate(initiator: IHydratedController | null): void | Promise<void>;
    dispose(): void;
    protected linkToSwitch(auSwitch: Switch): void;
    accept(visitor: ControllerVisitor): void | true;
}
export declare class DefaultCase extends Case {
    protected linkToSwitch($switch: Switch): void;
}
//# sourceMappingURL=switch.d.ts.map