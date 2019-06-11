import { Constructable, IContainer, InjectArray } from '@aurelia/kernel';
import { IController, ICustomElementResource, IDOM, IHydrateElementInstruction, ILifecycleTask, INode, IRenderingEngine, ITemplateDefinition, IViewFactory, LifecycleFlags, TemplateDefinition } from '@aurelia/runtime';
import { RenderPlan } from '../../create-element';
export declare type Subject<T extends INode = Node> = IViewFactory<T> | IController<T> | RenderPlan<T> | Constructable | TemplateDefinition;
export declare type MaybeSubjectPromise<T> = Subject<T> | Promise<Subject<T>> | undefined;
export declare class Compose<T extends INode = Node> {
    static readonly inject: InjectArray;
    static readonly kind: ICustomElementResource;
    static readonly description: Required<ITemplateDefinition>;
    readonly id: number;
    subject?: MaybeSubjectPromise<T>;
    composing: boolean;
    view?: IController<T>;
    private readonly dom;
    private readonly renderable;
    private readonly renderingEngine;
    private readonly properties;
    private task;
    private lastSubject?;
    private $controller;
    constructor(dom: IDOM<T>, renderable: IController<T>, instruction: IHydrateElementInstruction, renderingEngine: IRenderingEngine);
    static register(container: IContainer): void;
    binding(flags: LifecycleFlags): ILifecycleTask;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): ILifecycleTask;
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