import { Constructable, Immutable, IRegistry } from '@aurelia/kernel';
import { CompositionCoordinator, ICustomElement, ICustomElementResource, IDOM, IHydrateElementInstruction, INode, IRenderable, IRenderingEngine, IView, IViewFactory, LifecycleFlags, TemplateDefinition } from '@aurelia/runtime';
import { RenderPlan } from '../../create-element';
export declare type Subject<T extends INode = Node> = IViewFactory<T> | IView<T> | RenderPlan<T> | Constructable | TemplateDefinition;
export interface Compose<T extends INode = Node> extends ICustomElement<T> {
}
export declare class Compose<T extends INode = Node> implements Compose<T> {
    static readonly inject: ReadonlyArray<Function>;
    static readonly register: IRegistry['register'];
    static readonly kind: ICustomElementResource<Node>;
    static readonly description: TemplateDefinition;
    static readonly containerless: TemplateDefinition['containerless'];
    static readonly shadowOptions: TemplateDefinition['shadowOptions'];
    static readonly bindables: TemplateDefinition['bindables'];
    subject: Subject<T> | Promise<Subject<T>> | null;
    composing: boolean;
    private readonly dom;
    private readonly coordinator;
    private readonly properties;
    private readonly renderable;
    private readonly renderingEngine;
    private lastSubject;
    constructor(dom: IDOM<T>, renderable: IRenderable<T>, instruction: Immutable<IHydrateElementInstruction>, renderingEngine: IRenderingEngine, coordinator: CompositionCoordinator);
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
    caching(flags: LifecycleFlags): void;
    subjectChanged(newValue: Subject<T> | Promise<Subject<T>>, previousValue: Subject<T> | Promise<Subject<T>>, flags: LifecycleFlags): void;
    private startComposition;
    private resolveView;
    private provideViewFor;
}
//# sourceMappingURL=compose.d.ts.map