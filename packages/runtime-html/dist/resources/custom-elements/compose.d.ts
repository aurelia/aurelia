import { Constructable } from '@aurelia/kernel';
import { IDOM, IHydrateElementInstruction, INode, IViewFactory, LifecycleFlags, CustomElementDefinition, ICustomElementController, ISyntheticView, ICustomElementViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '@aurelia/runtime';
import { RenderPlan } from '../../create-element';
export declare type Subject<T extends INode = Node> = IViewFactory<T> | ISyntheticView<T> | RenderPlan<T> | Constructable | CustomElementDefinition;
export declare type MaybeSubjectPromise<T> = Subject<T> | Promise<Subject<T>> | undefined;
export declare class Compose<T extends INode = Node> implements ICustomElementViewModel<T> {
    private readonly dom;
    readonly id: number;
    subject?: MaybeSubjectPromise<T>;
    composing: boolean;
    view?: ISyntheticView<T>;
    private readonly properties;
    private lastSubject?;
    readonly $controller: ICustomElementController<T, this>;
    constructor(dom: IDOM<T>, instruction: IHydrateElementInstruction);
    afterAttach(initiator: IHydratedController<T>, parent: IHydratedParentController<T> | null, flags: LifecycleFlags): void | Promise<void>;
    afterUnbind(initiator: IHydratedController<T>, parent: IHydratedParentController<T> | null, flags: LifecycleFlags): void | Promise<void>;
    subjectChanged(newValue: Subject<T> | Promise<Subject<T>>, previousValue: Subject<T> | Promise<Subject<T>>, flags: LifecycleFlags): void;
    private compose;
    private deactivate;
    private activate;
    private resolveView;
    private provideViewFor;
    onCancel(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void;
    dispose(): void;
    accept(visitor: ControllerVisitor<T>): void | true;
}
//# sourceMappingURL=compose.d.ts.map