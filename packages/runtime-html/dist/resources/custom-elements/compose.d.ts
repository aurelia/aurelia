import { Constructable } from '@aurelia/kernel';
import { IDOM, IHydrateElementInstruction, ILifecycleTask, INode, IViewFactory, LifecycleFlags, CustomElementDefinition, ICustomElementController, ISyntheticView, ICustomElementViewModel } from '@aurelia/runtime';
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
    private task;
    private lastSubject?;
    readonly $controller: ICustomElementController<T, this>;
    constructor(dom: IDOM<T>, instruction: IHydrateElementInstruction);
    beforeBind(flags: LifecycleFlags): ILifecycleTask;
    beforeAttach(flags: LifecycleFlags): void;
    beforeDetach(flags: LifecycleFlags): void;
    beforeUnbind(flags: LifecycleFlags): ILifecycleTask;
    caching(flags: LifecycleFlags): void;
    subjectChanged(newValue: Subject<T> | Promise<Subject<T>>, previousValue: Subject<T> | Promise<Subject<T>>, flags: LifecycleFlags): void;
    private compose;
    private deactivate;
    private activate;
    private bindView;
    private attachView;
    private onComposed;
    private resolveView;
    private provideViewFor;
}
//# sourceMappingURL=compose.d.ts.map