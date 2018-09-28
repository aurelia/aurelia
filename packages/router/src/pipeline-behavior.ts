import { Immutable, Writable } from '@aurelia/kernel';
import { IActivatable, IActivatableType, IRoute } from './route';

export interface IPipelineBehavior {
  readonly route: Required<Immutable<IRoute>>;
  readonly hasActivating: boolean;
  readonly hasActivated: boolean;
  readonly hasDeactivating: boolean;
  readonly hasDeactivated: boolean;
  readonly hasCanActivate: boolean;
  readonly hasCanDeactivate: boolean;
  readonly hasConfiguringRoute: boolean;
  readonly hasConfiguredRoute: boolean;
}

/*@internal*/
export class PipelineBehavior implements IPipelineBehavior {
  public route: Required<Immutable<IRoute>>;
  public hasActivating: boolean = false;
  public hasActivated: boolean = false;
  public hasDeactivating: boolean = false;
  public hasDeactivated: boolean = false;
  public hasCanActivate: boolean = false;
  public hasCanDeactivate: boolean = false;
  public hasConfiguringRoute: boolean = false;
  public hasConfiguredRoute: boolean = false;

  private constructor() {}

  public static create(component: IActivatableType, instance: IActivatable): PipelineBehavior {
    const behavior = new PipelineBehavior();

    behavior.route = component.description;
    behavior.hasActivating = 'activating' in instance;
    behavior.hasActivated = 'activated' in instance;
    behavior.hasDeactivating = 'deactivating' in instance;
    behavior.hasDeactivated = 'deactivated' in instance;
    behavior.hasCanActivate = 'canActivate' in instance;
    behavior.hasCanDeactivate = 'canDeactivate' in instance;
    behavior.hasConfiguringRoute = 'configuringRoute' in instance;
    behavior.hasConfiguredRoute = 'configuredRoute' in instance;

    return behavior;
  }

  public applyTo(instance: Writable<IActivatable>): void {
    instance.$behavior = this;
  }
}
