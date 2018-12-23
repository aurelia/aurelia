import { Constructable, Immutable, IRegistry } from '@aurelia/kernel';
import { IHydrateElementInstruction, TemplateDefinition } from '../../definitions';
import { CompositionCoordinator, IRenderable, IView, IViewFactory } from '../../lifecycle';
import { LifecycleFlags } from '../../observation';
import { RenderPlan } from '../../templating/create-element';
import { IRenderingEngine } from '../../templating/lifecycle-render';
import { ICustomElement } from '../custom-element';
declare type Subject = IViewFactory | IView | RenderPlan | Constructable | TemplateDefinition;
export interface Compose extends ICustomElement {
}
export declare class Compose {
    static register: IRegistry['register'];
    subject: Subject | Promise<Subject> | null;
    composing: boolean;
    private coordinator;
    private lastSubject;
    private properties;
    private renderable;
    private renderingEngine;
    constructor(renderable: IRenderable, instruction: Immutable<IHydrateElementInstruction>, renderingEngine: IRenderingEngine, coordinator: CompositionCoordinator);
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
    caching(flags: LifecycleFlags): void;
    subjectChanged(newValue: Subject | Promise<Subject>, previousValue: Subject | Promise<Subject>, flags: LifecycleFlags): void;
    private startComposition;
    private resolveView;
    private provideViewFor;
}
export {};
//# sourceMappingURL=compose.d.ts.map