import { DI } from '@aurelia/kernel';
import { IScope } from '../binding/binding-context';
import { BindingFlags } from '../binding/binding-flags';
import { IBindScope } from '../binding/observation';
import { INodeSequence } from '../dom';
import { IAttach } from './lifecycle';
import { IRenderContext } from './render-context';

export const IRenderable = DI.createInterface<IRenderable>().noDefault();

export interface IRenderable {
  readonly $context: IRenderContext;
  readonly $nodes: INodeSequence;
  readonly $scope: IScope;
  readonly $isBound: boolean;
  readonly $bindables: IBindScope[];
  readonly $isAttached: boolean;
  readonly $attachables: IAttach[];

  $addChild(child: IAttach | IBindScope, flags: BindingFlags): void;
  $removeChild(child: IAttach | IBindScope): void;
}

/*@internal*/
export function addRenderableChild(this: IRenderable, child: IAttach | IBindScope, flags: BindingFlags): void {
  if ('$bind' in child) {
    this.$bindables.push(child);

    if (this.$isBound) {
      child.$bind(flags, this.$scope);
    }
  }

  if ('$attach' in child) {
    this.$attachables.push(child);

    if (this.$isAttached) {
      child.$attach((this as any).$encapsulationSource);
    }
  }
}

/*@internal*/
export function removeRenderableChild(this: IRenderable, child: IAttach | IBindScope): void {
  const attachableIndex = this.$attachables.indexOf(child as IAttach);
  if (attachableIndex !== -1) {
    this.$attachables.splice(attachableIndex, 1);
    (child as IAttach).$detach();
  }

  const bindableIndex = this.$bindables.indexOf(child as IBindScope);
  if (bindableIndex !== -1) {
    this.$bindables.splice(bindableIndex, 1);
    (child as IBindScope).$unbind(BindingFlags.fromUnbind);
  }
}
