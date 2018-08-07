import { DI, PLATFORM, Reporter } from '@aurelia/kernel';
import { AccessMember, AccessScope, CallMember, CallScope, IExpression } from './ast';

export interface IExpressionParser {
  cache(expressions: Record<string, IExpression>): void;
  parse(expression: string, bindingType?: BindingType): IExpression;
}

export const IExpressionParser = DI.createInterface<IExpressionParser>()
  .withDefault(x => x.singleton(ExpressionParser));

/*@internal*/
export class ExpressionParser implements IExpressionParser {
  private lookup: Record<string, IExpression>;
  constructor() {
    this.lookup = Object.create(null);
  }

  public parse(expression: string, bindingType?: BindingType): IExpression {
    let found = this.lookup[expression];

    if (found === undefined) {
      found = this.parseCore(expression, bindingType === undefined ? BindingType.None : bindingType);
      this.lookup[expression] = found;
    }

    return found;
  }

  public cache(expressions: Record<string, IExpression>) {
    Object.assign(this.lookup, expressions);
  }

  private parseCore(expression: string, bindingType: BindingType): IExpression {
    try {
      const parts = expression.split('.');
      const firstPart = parts[0];
      let current: IExpression;

      if (firstPart.endsWith('()')) {
        current = new CallScope(firstPart.replace('()', ''), PLATFORM.emptyArray);
      } else {
        current = new AccessScope(parts[0]);
      }

      let index = 1;

      while(index < parts.length) {
        let currentPart = parts[index];

        if (currentPart.endsWith('()')) {
          current = new CallMember(current, currentPart.replace('()', ''), PLATFORM.emptyArray);
        } else {
          current = new AccessMember(current, parts[index]);
        }

        index++;
      }

      return current;
    } catch(e) {
      throw Reporter.error(3, e);
    }
  }
}

export const enum BindingType {
             None = 0,
  Interpolation   = 0b0110000000 << 4,
IsInterpolation   = 0b0100000000 << 4,
       Text       = 0b1100000000 << 4,
       IsPlain    = 0b0010000000 << 4,
       IsRef      = 0b0001010000 << 4,
       IsIterator = 0b0000100000 << 4,
       IsCustom   = 0b0000010000 << 4,
       IsFunction = 0b0000001000 << 4,
       IsEvent    = 0b0000000100 << 4,
       IsProperty = 0b0000000010 << 4,
       IsCommand  = 0b0000000001 << 4,
       IsBinding  = IsProperty | IsEvent | IsFunction | IsCustom,
          Command =                     0b1111,
   OneTimeCommand = 0b0000000011 << 4 | 0b0001,
    ToViewCommand = 0b0000000011 << 4 | 0b0010,
  FromViewCommand = 0b0000000011 << 4 | 0b0011,
    TwoWayCommand = 0b0000000011 << 4 | 0b0100,
      BindCommand = 0b0000000011 << 4 | 0b0101,
   TriggerCommand = 0b0000000101 << 4 | 0b0110,
   CaptureCommand = 0b0000000101 << 4 | 0b0111,
  DelegateCommand = 0b0000000101 << 4 | 0b1000,
      CallCommand = 0b0000001001 << 4 | 0b1001,
   OptionsCommand = 0b0000010001 << 4 | 0b1010,
       ForCommand = 0b0000100001 << 4 | 0b1011,
    CustomCommand = 0b0000010001 << 4 | 0b1100
}
