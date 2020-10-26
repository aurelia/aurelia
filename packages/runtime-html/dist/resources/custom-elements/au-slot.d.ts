import { Scope, LifecycleFlags } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../lifecycle';
import { CustomElementDefinition } from '../custom-element';
import { IInstruction } from '../../definitions';
import { IViewFactory } from '../../templating/view';
export declare type IProjections = Record<string, CustomElementDefinition>;
export declare const IProjections: import("@aurelia/kernel").InterfaceSymbol<Record<string, CustomElementDefinition<import("@aurelia/kernel").Constructable<{}>>>>;
export declare enum AuSlotContentType {
    Projection = 0,
    Fallback = 1
}
export declare class SlotInfo {
    readonly name: string;
    readonly type: AuSlotContentType;
    readonly projectionContext: ProjectionContext;
    constructor(name: string, type: AuSlotContentType, projectionContext: ProjectionContext);
}
export declare class ProjectionContext {
    readonly content: CustomElementDefinition;
    readonly scope: Scope | null;
    constructor(content: CustomElementDefinition, scope?: Scope | null);
}
export declare class RegisteredProjections {
    readonly scope: Scope;
    readonly projections: Record<string, CustomElementDefinition>;
    constructor(scope: Scope, projections: Record<string, CustomElementDefinition>);
}
export interface IProjectionProvider extends ProjectionProvider {
}
export declare const IProjectionProvider: import("@aurelia/kernel").InterfaceSymbol<IProjectionProvider>;
export declare class ProjectionProvider {
    registerProjections(projections: Map<IInstruction, Record<string, CustomElementDefinition>>, scope: Scope): void;
    getProjectionFor(instruction: IInstruction): RegisteredProjections | null;
}
export declare class AuSlot implements ICustomElementViewModel {
    private readonly factory;
    readonly view: ISyntheticView;
    readonly $controller: ICustomElementController<this>;
    private readonly isProjection;
    private hostScope;
    private readonly outerScope;
    constructor(factory: IViewFactory, location: IRenderLocation);
    beforeBind(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    afterAttach(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    afterUnbind(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    onCancel(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
//# sourceMappingURL=au-slot.d.ts.map