import { ICustomElement, IRenderable, ILifecycleHooks, IMountableComponent } from '@aurelia/runtime';

export class FakeRenderable implements IRenderable {
  public $context: IRenderable['$context'] = null;
  public $nodes: IRenderable['$nodes'] = null;
  public $lifecycle: IRenderable['$lifecycle'] = null;

  public $prevComponent: ICustomElement['$prevComponent'] = null;
  public $nextComponent: ICustomElement['$nextComponent'] = null;

  public $scope: ICustomElement['$scope'] = null;
  public $hooks: ICustomElement['$hooks'] = 0;
  public $state: ICustomElement['$state'] = 0;

  public $bindingHead: ICustomElement['$bindingHead'] = null;
  public $bindingTail: ICustomElement['$bindingTail'] = null;
  public $componentHead: ICustomElement['$componentHead'] = null;
  public $componentTail: ICustomElement['$componentTail'] = null;

  public $nextMount: IMountableComponent = null;
  public $nextUnmount: IMountableComponent = null;

  public $projector: ICustomElement['$projector'] = null;

  public $nextFlush: ICustomElement['$nextFlush'] = null;
  public $nextBound: ILifecycleHooks = null;
  public $nextUnbound: ILifecycleHooks = null;
  public $nextAttached: ILifecycleHooks = null;
  public $nextDetached: ILifecycleHooks = null;
}
