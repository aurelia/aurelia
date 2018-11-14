import { Constructable, Immutable } from '@aurelia/kernel';
import { IHydrateElementInstruction, TemplateDefinition } from '../../definitions';
import { CompositionCoordinator, IRenderable, IView, IViewFactory } from '../../lifecycle';
import { LifecycleFlags } from '../../observation';
import { RenderPlan } from '../create-element';
import { ICustomElement, IRenderingEngine } from '../lifecycle-render';
declare type Subject = IViewFactory | IView | RenderPlan | Constructable | TemplateDefinition;
export interface Compose extends ICustomElement {
}
export declare class Compose {
    private renderable;
    private renderingEngine;
    private coordinator;
    subject: Subject | Promise<Subject>;
    composing: boolean;
    private properties;
    private lastSubject;
    constructor(renderable: IRenderable, instruction: Immutable<IHydrateElementInstruction>, renderingEngine: IRenderingEngine, coordinator: CompositionCoordinator);
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
    caching(flags: LifecycleFlags): void;
    subjectChanged(newValue: any, previousValue: any, flags: LifecycleFlags): void;
    private startComposition;
    private resolveView;
    private provideViewFor;
}
export {};
//# sourceMappingURL=compose.d.ts.map