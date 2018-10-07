import { DI, PLATFORM, Reporter } from '@aurelia/kernel';
import { AccessMember, AccessScope, CallMember, CallScope, ForOfStatement, IExpression, Interpolation, IsBindingBehavior, PrimitiveLiteral } from './ast';

export interface IExpressionParser {
  cache(expressions: Record<string, Interpolation | ForOfStatement | IsBindingBehavior>): void;
  parse<TType extends BindingType>(expression: string, bindingType: TType):
    TType extends BindingType.Interpolation ? Interpolation :
    TType extends BindingType.ForCommand ? ForOfStatement :
    IsBindingBehavior;
}

export const IExpressionParser = DI.createInterface<IExpressionParser>()
  .withDefault(x => x.singleton(ExpressionParser));

const emptyString: any = new PrimitiveLiteral('');

/*@internal*/
export class ExpressionParser implements IExpressionParser {
  private lookup: Record<string, any>;
  private nonInterpolationLookup: Record<string, any>;
  constructor() {
    this.lookup = Object.create(null);
    // we use a separate cache for storing plain attribute values (attributes without a binding command)
    // that were not found to be valid interpolations, to prevent the parser from trying to find
    // interpolations repeatedly in the same attribute values
    this.nonInterpolationLookup = Object.create(null);
  }

  // TODO: fix this cache stuff
  public parse<TType extends BindingType>(expression: string, bindingType: TType):
    TType extends BindingType.Interpolation ? Interpolation :
    TType extends BindingType.ForCommand ? ForOfStatement :
    IsBindingBehavior {
    if (bindingType & BindingType.Interpolation) {
      if (this.nonInterpolationLookup[expression] === null) {
        return null;
      }
      let found = this.lookup[expression];
      if (found === undefined) {
        found = this.parseCore(expression, bindingType);
        if (found === null) {
          this.nonInterpolationLookup[expression] = null;
        } else {
          this.lookup[expression] = found;
        }
      }
      return found;
    }

    // Allow empty strings for normal bindings and those that are empty by default (such as a custom attribute without an equals sign)
    // But don't cache it, because empty strings are always invalid for any other type of binding
    if (expression.length === 0 && (bindingType & (BindingType.BindCommand | BindingType.OneTimeCommand | BindingType.ToViewCommand))) {
      return emptyString;
    }
    let found = this.lookup[expression];

    if (found === undefined) {
      found = this.parseCore(expression, bindingType);
      this.lookup[expression] = found;
    }

    return found;
  }

  public cache(expressions: Record<string, IExpression>) {
    Object.assign(this.lookup, expressions);
  }

  private parseCore(expression: string, bindingType: BindingType): Interpolation | ForOfStatement | IsBindingBehavior {
    try {
      const parts = expression.split('.');
      const firstPart = parts[0];
      let current: Interpolation | ForOfStatement | IsBindingBehavior;

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
     Interpolation = 0b10000000_0000,
        IsRef      = 0b01010000_0000,
        IsIterator = 0b00100000_0000,
        IsCustom   = 0b00010000_0000,
        IsFunction = 0b00001000_0000,
        IsEvent    = 0b00000100_0000,
        IsProperty = 0b00000010_0000,
        IsCommand  = 0b00000001_0000,
IsPropertyCommand  = 0b00000011_0000,
   IsEventCommand  = 0b00000101_0000,
DelegationStrategyDelta =              0b0110,
           Command =                   0b1111,
    OneTimeCommand = 0b00000011_0001,
     ToViewCommand = 0b00000011_0010,
   FromViewCommand = 0b00000011_0011,
     TwoWayCommand = 0b00000011_0100,
       BindCommand = 0b00000011_0101,
    TriggerCommand = 0b00000101_0110,
    CaptureCommand = 0b00000101_0111,
   DelegateCommand = 0b00000101_1000,
       CallCommand = 0b00001001_1001,
    OptionsCommand = 0b00000001_1010,
        ForCommand = 0b00100001_1011,
     CustomCommand = 0b00010001_1100
}
