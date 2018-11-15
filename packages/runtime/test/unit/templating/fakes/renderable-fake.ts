import {
  IRenderContext,
  IBindScope,
  IAttach,
  IScope,
  IRenderable,
  INodeSequence,
  ICustomElement,
  ILifecycle
} from "../../../../src/index";
import { State } from "../../../../src/index";

export class RenderableFake implements IRenderable {
  public $context: IRenderable['$context'] = null;
  public $nodes: IRenderable['$nodes'] = null;
  public $lifecycle: IRenderable['$lifecycle'] = null;

  public $prevBind: ICustomElement['$prevBind'] = null;
  public $nextBind: ICustomElement['$nextBind'] = null;
  public $prevAttach: ICustomElement['$prevAttach'] = null;
  public $nextAttach: ICustomElement['$nextAttach'] = null;

  public $scope: ICustomElement['$scope'] = null;
  public $hooks: ICustomElement['$hooks'] = 0;
  public $state: ICustomElement['$state'] = State.needsMount;

  public $bindableHead: ICustomElement['$bindableHead'] = null;
  public $bindableTail: ICustomElement['$bindableTail'] = null;
  public $attachableHead: ICustomElement['$attachableHead'] = null;
  public $attachableTail: ICustomElement['$attachableTail'] = null;

  public $nextMount: ICustomElement['$nextMount'] = null;
  public $nextUnmount: ICustomElement['$nextUnmount'] = null;

  public $projector: ICustomElement['$projector'] = null;

  public $nextFlush: ICustomElement['$nextFlush'] = null;
  public $nextBound: ICustomElement['$nextBound'] = null;
  public $nextUnbound: ICustomElement['$nextUnbound'] = null;
  public $nextAttached: ICustomElement['$nextAttached'] = null;
  public $nextDetached: ICustomElement['$nextDetached'] = null;

}
