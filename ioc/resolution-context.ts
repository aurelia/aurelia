import { IChain, IPair, IFulfillment, IInjectionPoint } from "./interfaces";
import { BasicInjectionPoint } from "./injection-point";

export class ResolutionContext implements IChain<IPair<IFulfillment, IInjectionPoint>> {
  public readonly previous: IChain<IPair<IFulfillment, IInjectionPoint>>;
  public readonly tailValue: IPair<IFulfillment, IInjectionPoint>;

  constructor(prev: ResolutionContext, fulfillment: IFulfillment, injectionPoint: IInjectionPoint) {
    this.previous = prev;
    this.tailValue = {
      left: fulfillment,
      right: injectionPoint
    };
  }

  public static singleton(fulfillment: IFulfillment, injectionPoint?: IInjectionPoint): ResolutionContext {
    let ip = injectionPoint;
    if (ip === undefined) {
      ip = new BasicInjectionPoint(fulfillment.getType());
    }
    return new ResolutionContext(null, fulfillment, injectionPoint);
  }

  public toArray(): IPair<IFulfillment, IInjectionPoint>[] {
    const current = this.tailValue;
    if (this.previous === null) {
      return [current];
    } else {
      return this.previous.toArray().concat(current);
    }
  }

  public extend(fulfillment: IFulfillment, injectionPoint: IInjectionPoint): ResolutionContext {
    return new ResolutionContext(this, fulfillment, injectionPoint);
  }
}
