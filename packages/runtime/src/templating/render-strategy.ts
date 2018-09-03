import { Constructable, IContainer, Registration, Writable } from '@aurelia/kernel';
import { IResourceKind, IResourceType } from '../resource';
import { IRenderStrategyInstruction } from './instructions';
import { IRenderable } from './renderable';

export interface IRenderStrategy<TTarget = any, TInstruction extends IRenderStrategyInstruction = any> {
  render(renderable: IRenderable, target: TTarget, instruction: TInstruction): void;
}

export interface IRenderStrategySource {
  name: string;
}

export type IRenderStrategyType = IResourceType<IRenderStrategySource, IRenderStrategy>;

export function renderStrategy(nameOrSource: string | IRenderStrategySource) {
  return function<T extends Constructable>(target: T) {
    return RenderStrategyResource.define(nameOrSource, target);
  }
}

export const RenderStrategyResource: IResourceKind<IRenderStrategySource, IRenderStrategyType> = {
  name: 'render-strategy',

  keyFrom(name: string): string {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable>(type: T): type is T & IRenderStrategyType {
    return (type as any).kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | IRenderStrategySource, ctor: T): T & IRenderStrategyType {
    const description = typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource;
    const Type: T & IRenderStrategyType = ctor as any;

    (Type as Writable<IRenderStrategyType>).kind = RenderStrategyResource;
    (Type as Writable<IRenderStrategyType>).description = description;
    Type.register = function(container: IContainer) {
      container.register(Registration.singleton(Type.kind.keyFrom(description.name), Type));
    };

    return Type;
  }
};
