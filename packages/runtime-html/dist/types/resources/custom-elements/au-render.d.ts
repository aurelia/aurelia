import { Constructable } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { RenderPlan } from '../../create-element.js';
import { HydrateElementInstruction } from '../../renderer.js';
import { IPlatform } from '../../platform.js';
import { IViewFactory } from '../../templating/view.js';
import { CustomElementDefinition } from '../custom-element.js';
import { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, IHydrationContext, ISyntheticView } from '../../templating/controller.js';
import { IRendering } from '../../templating/rendering.js';
export declare type Subject = string | IViewFactory | ISyntheticView | RenderPlan | Constructable | CustomElementDefinition;
export declare type MaybeSubjectPromise = Subject | Promise<Subject> | undefined;
export declare class AuRender implements ICustomElementViewModel {
    readonly id: number;
    component?: MaybeSubjectPromise;
    composing: boolean;
    view?: ISyntheticView;
    readonly $controller: ICustomElementController<this>;
    constructor(
    /** @internal */ _platform: IPlatform, 
    /** @internal */ _instruction: HydrateElementInstruction, 
    /** @internal */ _hdrContext: IHydrationContext, 
    /** @internal */ _rendering: IRendering);
    attaching(initiator: IHydratedController, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void>;
    componentChanged(newValue: Subject | Promise<Subject>, previousValue: Subject | Promise<Subject>, flags: LifecycleFlags): void;
    private compose;
    private _deactivate;
    private _activate;
    private _resolveView;
    private _provideViewFor;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
//# sourceMappingURL=au-render.d.ts.map