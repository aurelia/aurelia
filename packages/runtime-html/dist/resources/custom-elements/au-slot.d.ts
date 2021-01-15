import { LifecycleFlags, Scope } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom.js';
import { IInstruction } from '../../renderer.js';
import type { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller.js';
import { IViewFactory } from '../../templating/view.js';
import { CustomElementDefinition } from '../custom-element.js';
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
    readonly view: ISyntheticView;
    readonly $controller: ICustomElementController<this>;
    private readonly isProjection;
    private hostScope;
    private readonly outerScope;
    constructor(factory: IViewFactory, location: IRenderLocation);
    binding(_initiator: IHydratedController, _parent: IHydratedParentController, _flags: LifecycleFlags): void | Promise<void>;
    attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
export interface IAuSlotsInfo extends AuSlotsInfo {
}
export declare const IAuSlotsInfo: import("@aurelia/kernel").InterfaceSymbol<IAuSlotsInfo>;
export declare class AuSlotsInfo {
    readonly projectedSlots: string[];
    /**
     * @param {string[]} projectedSlots - Name of the slots to which content are projected.
     */
    constructor(projectedSlots: string[]);
}
//# sourceMappingURL=au-slot.d.ts.map