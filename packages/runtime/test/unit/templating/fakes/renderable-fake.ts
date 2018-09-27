import {
  IRenderContext,
  IBindScope,
  IAttach,
  IScope,
  IRenderable,
  INodeSequence
} from "../../../../src/index";

export class RenderableFake implements IRenderable {
  $isAttached: boolean;

  $context: IRenderContext;
  $nodes: INodeSequence;
  $scope: IScope;
  $isBound: boolean;

  $bindables: IBindScope[];
  $attachables: IAttach[];

  $addNodes() {}
  $removeNodes() {}

  constructor() {
    this.$bindables = [];
    this.$attachables = [];
  }
}
