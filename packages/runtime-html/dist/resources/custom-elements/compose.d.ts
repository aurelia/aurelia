import { Constructable } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { RenderPlan } from '../../create-element';
import { HydrateElementInstruction } from '../../renderer';
import { IPlatform } from '../../platform';
import { IViewFactory } from '../../templating/view';
import { CustomElementDefinition } from '../custom-element';
import type { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller';
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