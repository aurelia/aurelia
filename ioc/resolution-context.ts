import { IChain, IPair, IFulfillment, IInjectionPoint } from './interfaces';
import { BasicInjectionPoint } from './injection-point';
import { Pair } from './types';

export class ResolutionContext implements IChain<IPair<IFulfillment, IInjectionPoint>> {
  public readonly previous: IChain<IPair<IFulfillment, IInjectionPoint>>;
  public readonly tailValue: IPair<IFulfillment, IInjectionPoint>;

  constructor(prev: ResolutionContext, fulfillment: IFulfillment, injectionPoint: IInjectionPoint) {
    this.previous = prev;
    this.tailValue = new Pair(fulfillment, injectionPoint);
  }

  public static singleton(fulfillment: IFulfillment, injectionPoint?: IInjectionPoint): ResolutionContext {
    let ip = injectionPoint;
    if (ip === undefined) {
      ip = new BasicInjectionPoint(fulfillment.type);
    }
    return new ResolutionContext(null, fulfillment, injectionPoint);
  }

  public toArray(): IPair<IFulfillment, IInjectionPoint>[] {
    const current = this.tailValue;
    if (!this.previous) {
      return [current];
    } else {
      return this.previous.toArray().concat(current);
    }
  }

  public extend(fulfillment: IFulfillment, injectionPoint: IInjectionPoint): ResolutionContext {
    return new ResolutionContext(this, fulfillment, injectionPoint);
  }
}
