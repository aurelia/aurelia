import { DI, PLATFORM, Reporter } from '../../kernel';
import { AccessMember, AccessScope, CallMember, CallScope, ExpressionKind, ForOfStatement, Interpolation, IsBindingBehavior, PrimitiveLiteral } from './ast';

export interface IExpressionParser {
  cache(expressions: Record<string, Interpolation | ForOfStatement | IsBindingBehavior>): void;
  parse(expression: string, bindingType: BindingType.ForCommand): ForOfStatement;
  parse(expression: string, bindingType: BindingType.Interpolation): Interpolation;
  parse(expression: string, bindingType: Exclude<BindingType, BindingType.ForCommand | BindingType.Interpolation>): IsBindingBehavior;
  parse(expression: string, bindingType: BindingType): Interpolation | ForOfStatement | IsBindingBehavior;
}

export const IExpressionParser = DI.createInterface<IExpressionParser>()
  .withDefault(x => x.singleton(ExpressionParser));

/*@internal*/
export class ExpressionParser implements IExpressionParser {
  private expressionLookup: Record<string, IsBindingBehavior>;
  private interpolationLookup: Record<string, Interpolation>;
  private forOfLookup: Record<string, ForOfStatement>;
  constructor() {
    this.expressionLookup = Object.create(null);
    this.interpolationLookup = Object.create(null);
    this.forOfLookup = Object.create(null);
  }

  public parse(expression: string, bindingType: BindingType.ForCommand): ForOfStatement;
  public parse(expression: string, bindingType: BindingType.Interpolation): Interpolation;
  public parse(expression: string, bindingType: Exclude<BindingType, BindingType.ForCommand | BindingType.Interpolation>): IsBindingBehavior;
  public parse(expression: string, bindingType: BindingType): Interpolation | ForOfStatement | IsBindingBehavior {
    switch (bindingType) {
      case BindingType.Interpolation:
      {
        let found = this.interpolationLookup[expression];
        if (found === undefined) {
          found = this.interpolationLookup[expression] = this.parseCore(expression, bindingType);
        }
        return found;
      }
      case BindingType.ForCommand:
      {
        let found = this.forOfLookup[expression];
        if (found === undefined) {
          found = this.forOfLookup[expression] = this.parseCore(expression, bindingType);
        }
        return found;
      }
      default:
      {
        // Allow empty strings for normal bindings and those that are empty by default (such as a custom attribute without an equals sign)
        // But don't cache it, because empty strings are always invalid for any other type of binding
        if (expression.length === 0 && (bindingType & (BindingType.BindCommand | BindingType.OneTimeCommand | BindingType.ToViewCommand))) {
          return PrimitiveLiteral.$empty;
        }
        let found = this.expressionLookup[expression];
        if (found === undefined) {
          found = this.expressionLookup[expression] = this.parseCore(expression, bindingType);
        }
        return found;
      }
    }
  }

  public cache(expressions: Record<string, Interpolation | ForOfStatement | IsBindingBehavior>): void {
    const { forOfLookup, expressionLookup, interpolationLookup } = this;
    for (const expression in expressions) {
      const expr = expressions[expression];
      switch (expr.$kind) {
        case ExpressionKind.Interpolation:
          interpolationLookup[expression] = expr;
          break;
        case ExpressionKind.ForOfStatement:
          forOfLookup[expression] = expr;
          break;
        default:
          expressionLookup[expression] = expr;
      }
    }
  }

  private parseCore(expression: string, bindingType: BindingType.ForCommand): ForOfStatement;
  private parseCore(expression: string, bindingType: BindingType.Interpolation): Interpolation;
  private parseCore(expression: string, bindingType: Exclude<BindingType, BindingType.ForCommand | BindingType.Interpolation>): IsBindingBehavior;
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

      while (index < parts.length) {
        const currentPart = parts[index];

        if (currentPart.endsWith('()')) {
          current = new CallMember(current, currentPart.replace('()', ''), PLATFORM.emptyArray);
        } else {
          current = new AccessMember(current, parts[index]);
        }

        index++;
      }

      return current;
    } catch (e) {
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
DelegationStrategyDelta =     0b0110,
           Command =          0b1111,
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
