import { DI } from '@aurelia/kernel';
import { IScope } from '../binding/binding-context';
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

  $addNodes(): void;
  $removeNodes(): void;
}
