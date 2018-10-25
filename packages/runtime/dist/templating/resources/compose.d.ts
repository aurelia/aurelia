import { Constructable, Immutable } from '@aurelia/kernel';
import { IHydrateElementInstruction, TemplateDefinition } from '../../definitions';
import { INode } from '../../dom';
import { IAttachLifecycle, IDetachLifecycle } from '../../lifecycle';
import { BindingFlags, IChangeSet } from '../../observation';
import { RenderPlan } from '../create-element';
import { ICustomElement } from '../custom-element';
import { IRenderable, IRenderingEngine } from '../rendering-engine';
import { IView, IViewFactory } from '../view';
declare type Subject = IViewFactory | IView | RenderPlan | Constructable | TemplateDefinition;
export interface Compose extends ICustomElement {
}
export declare class Compose {
    readonly changeSet: IChangeSet;
    private renderable;
    private renderingEngine;
    subject: Subject | Promise<Subject>;
    composing: boolean;
    private properties;
    private coordinator;
    private lastSubject;
    constructor(changeSet: IChangeSet, renderable: IRenderable, instruction: Immutable<IHydrateElementInstruction>, renderingEngine: IRenderingEngine);
    binding(flags: BindingFlags): void;
    attaching(encapsulationSource: INode, lifecycle: IAttachLifecycle): void;
    detaching(lifecycle: IDetachLifecycle): void;
    unbinding(flags: BindingFlags): void;
    caching(): void;
    subjectChanged(newValue: any): void;
    private startComposition;
    private resolveView;
    private provideViewFor;
}
export {};
//# sourceMappingURL=compose.d.ts.map