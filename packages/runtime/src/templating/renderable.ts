/**
 */
import { DI } from '@aurelia/kernel';
import { IScope } from '../binding/binding-context';
import { IBindScope } from '../binding/observation';
import { INodeSequence } from '../dom';
import { IAttach } from './lifecycle';
import { IRenderContext } from './render-context';

export const IRenderable = DI.createInterface<IRenderable>().noDefault();

/**
 * An object containing the necessary information to render something for display.
 */
export interface IRenderable {
  /**
   * The (dependency) context of this instance.
   *
   * Contains any dependencies required by this instance or its children.
   */
  readonly $context: IRenderContext;

  /**
   * The nodes that represent the visible aspect of this instance.
   *
   * Typically this will be a sequence of `DOM` nodes contained in a `DocumentFragment`
   */
  readonly $nodes: INodeSequence;

  /**
   * The binding scope that the `$bindables` of this instance will be bound to.
   *
   * This includes the `BindingContext` which can be either a user-defined view model instance, or a synthetic view model instantiated by a `templateController`
   */
  readonly $scope: IScope;

  /**
   * Indicates whether the `$scope` is bound to the `$bindables`
   */
  readonly $isBound: boolean;

  /**
   * The Bindings, Views, CustomElements, CustomAttributes and other bindable components that belong to this instance.
   */
  readonly $bindables: IBindScope[];

  /**
   * Indicates whether the `$attachables` are currently attached to the `DOM`.
   */
  readonly $isAttached: boolean;

  /**
   * The Views, CustomElements, CustomAttributes and other attachable components that belong to this instance.
   */
  readonly $attachables: IAttach[];

  /**
   * Add the `$nodes` of this instance to the Host or RenderLocation that this instance is attached to.
   */
  $addNodes(): void;

  /**
   * Remove the `$nodes` of this instance from the Host or RenderLocation that this instance is attached to, optionally returning them to a cache.
   */
  $removeNodes(): void;
}
