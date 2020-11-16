import { Constructable } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { RenderPlan } from '../../create-element.js';
import { HydrateElementInstruction } from '../../renderer.js';
import { IPlatform } from '../../platform.js';
import { IViewFactory } from '../../templating/view.js';
import { CustomElementDefinition } from '../custom-element.js';
import type { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller.js';
export declare type Subject = IViewFactory | ISyntheticView | RenderPlan | Constructable | CustomElementDefinition;
export declare type MaybeSubjectPromise = Subject | Promise<Subject> | undefined;
export declare class Compose implements ICustomElementViewModel {
    private readonly p;
    readonly id: number;
    subject?: MaybeSubjectPromise;
    composing: boolean;
    view?: ISyntheticView;
    private readonly properties;
    private lastSubject?;
    readonly $controller: ICustomElementController<this>;
    constructor(p: IPlatform, instruction: HydrateElementInstruction);
    attaching(initiator: IHydratedController, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void>;
    subjectChanged(newValue: Subject | Promise<Subject>, previousValue: Subject | Promise<Subject>, flags: LifecycleFlags): void;
    private compose;
    private deactivate;
    private activate;
    private resolveView;
    private provideViewFor;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
//# sourceMappingURL=compose.d.ts.map