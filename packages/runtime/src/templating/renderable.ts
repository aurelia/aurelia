import { DI } from '@aurelia/kernel';
import { IScope } from '../binding/binding-context';
import { IBindScope } from '../binding/observation';
import { INodeSequence } from '../dom';
import { IAttach } from './lifecycle';
import { IRenderContext } from './render-context';

export const IRenderable = DI.createInterface<IRenderable>().noDefault();

export interface IRenderable {
  $context: IRenderContext;
  $nodes: INodeSequence;
  $scope: IScope;
  $isBound: boolean;
  $bindables: IBindScope[];
  $attachables: IAttach[];
}
