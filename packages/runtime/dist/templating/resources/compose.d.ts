import { Constructable, Immutable } from '@aurelia/kernel';
import { IChangeSet } from '../../binding';
import { BindingFlags } from '../../binding/binding-flags';
import { INode } from '../../dom';
import { PotentialRenderable } from '../create-element';
import { ICustomElement } from '../custom-element';
import { IHydrateElementInstruction, TemplateDefinition } from '../instructions';
import { IAttachLifecycle, IDetachLifecycle } from '../lifecycle';
import { IRenderable } from '../renderable';
import { IRenderingEngine } from '../rendering-engine';
import { IView, IViewFactory } from '../view';
declare type Subject = IViewFactory | IView | PotentialRenderable | Constructable | TemplateDefinition;
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