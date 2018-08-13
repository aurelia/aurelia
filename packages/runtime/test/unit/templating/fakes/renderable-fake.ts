import {
  IRenderContext,
  IBindScope,
  IAttach,
  IScope,
  IRenderable,
  INodeSequence
} from "@aurelia/runtime";

export class RenderableFake implements IRenderable {
  $context: IRenderContext;
  $nodes: INodeSequence;
  $scope: IScope;
  $isBound: boolean;

  $bindables: IBindScope[];
  $attachables: IAttach[];

  constructor() {
    this.$bindables = [];
    this.$attachables = [];
  }
}
