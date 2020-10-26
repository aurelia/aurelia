import { Constructable } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { CompositionPlan } from '../../create-element';
import { HydrateElementInstruction } from '../../instructions';
import { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../lifecycle';
import { IPlatform } from '../../platform';
import { IViewFactory } from '../../templating/view';
import { CustomElementDefinition } from '../custom-element';
export declare type Subject = IViewFactory | ISyntheticView | CompositionPlan | Constructable | CustomElementDefinition;
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
    afterAttach(initiator: IHydratedController, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void>;
    afterUnbind(initiator: IHydratedController, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void>;
    subjectChanged(newValue: Subject | Promise<Subject>, previousValue: Subject | Promise<Subject>, flags: LifecycleFlags): void;
    private compose;
    private deactivate;
    private activate;
    private resolveView;
    private provideViewFor;
    onCancel(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
//# sourceMappingURL=compose.d.ts.map