import { valueConverter } from '@aurelia/runtime-html';
import { INumberService, IToStringOptions } from '../services/number-service';



/**
 * when a number is retrieved from the element to which it is bound, convert it from a string to a number.
 */
@valueConverter('number')
export class Number {
  constructor(@INumberService private readonly numberService: INumberService) {}

  public toView(value: number | string, options?: IToStringOptions): string {
    return this.numberService.toString(value, Object.assign(options ?? {}, { isPercentage: false, isCurrency: false })) ?? value.toString();
  }
}
