import { IDisposable, Immutable, ImmutableArray, IServiceLocator } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../dom';
import { ITargetedInstruction, TemplateDefinition, TemplatePartDefinitions } from './instructions';
import { IRenderable } from './renderable';
import { IRenderingEngine } from './rendering-engine';
import { IViewFactory } from './view';
export interface IRenderContext extends IServiceLocator {
    createChild(): IRenderContext;
    render(renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void;
    beginComponentOperation(renderable: IRenderable, target: any, instruction: Immutable<ITargetedInstruction>, factory?: IViewFactory, parts?: TemplatePartDefinitions, location?: IRenderLocation, locationIsContainer?: boolean): IDisposable;
}
export declare function createRenderContext(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, dependencies: ImmutableArray<any>): IRenderContext;
//# sourceMappingURL=render-context.d.ts.map