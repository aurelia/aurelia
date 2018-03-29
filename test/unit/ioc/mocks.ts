import { IRequirement, IInjectionPoint, IFulfillment } from '../../../ioc/runtime/interfaces';
import { DependencyType } from '../../../ioc/runtime/types';
import { BasicInjectionPoint } from '../../../ioc/runtime/injection-point';

export class MockRequirement implements IRequirement {
  public readonly isRequirement: true = true;
  public readonly requiredType: DependencyType;
  public readonly injectionPoint: IInjectionPoint;
  private fulfillment: IFulfillment;

  constructor(requiredType?: DependencyType, fulfillment?: IFulfillment) {
    this.injectionPoint = new BasicInjectionPoint(requiredType);
    this.requiredType = requiredType;
    this.fulfillment = fulfillment;
  }

  public isInstantiable(): boolean {
    return this.fulfillment !== undefined;
  }
  public getFulfillment(): IFulfillment {
    return this.fulfillment;
  }
  public restrict(fulfillment: IFulfillment): IRequirement {
    return new MockRequirement(fulfillment.type, fulfillment);
  }
  public isEqualTo(other: MockRequirement): boolean {
    if (!(other instanceof MockRequirement)) {
      return false;
    }
    return (
      other.requiredType === this.requiredType &&
      other.injectionPoint.isEqualTo(this.injectionPoint) &&
      (!other.fulfillment ? !this.fulfillment : other.fulfillment.isEqualTo(this.fulfillment))
    );
  }
}
