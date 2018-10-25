import { Constructable } from '@aurelia/kernel';
import { IRenderStrategyInstruction } from '../definitions';
import { IResourceKind, IResourceType } from '../resource';
import { IRenderable } from './rendering-engine';
export interface IRenderStrategy<TTarget = any, TInstruction extends IRenderStrategyInstruction = any> {
    render(renderable: IRenderable, target: TTarget, instruction: TInstruction): void;
}
export interface IRenderStrategySource {
    name: string;
}
export declare type IRenderStrategyType = IResourceType<IRenderStrategySource, IRenderStrategy>;
export declare function renderStrategy(nameOrSource: string | IRenderStrategySource): <T extends Constructable<{}>>(target: T) => T & IResourceType<IRenderStrategySource, IRenderStrategy<any, any>>;
export declare const RenderStrategyResource: IResourceKind<IRenderStrategySource, IRenderStrategyType>;
//# sourceMappingURL=render-strategy.d.ts.map