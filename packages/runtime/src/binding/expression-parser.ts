import {
  DI,
  PLATFORM,
  Reporter,
} from '@aurelia/kernel';
import {
  AnyBindingExpression,
  IForOfStatement,
  IInterpolationExpression,
  IsBindingBehavior,
} from '../ast';
import { ExpressionKind } from '../flags';
import {
  AccessMemberExpression,
  AccessScopeExpression,
  CallMemberExpression,
  CallScopeExpression,
  ForOfStatement,
  Interpolation,
  PrimitiveLiteralExpression,
} from './ast';

export interface IExpressionParser {
  cache(expressions: Record<string, AnyBindingExpression>): void;
  parse(expression: string, bindingType: BindingType.ForCommand): IForOfStatement;
  parse(expression: string, bindingType: BindingType.Interpolation): IInterpolationExpression;
  parse(expression: string, bindingType: Exclude<BindingType, BindingType.ForCommand | BindingType.Interpolation>): IsBindingBehavior;
  parse(expression: string, bindingType: BindingType): AnyBindingExpression;
}

export const IExpressionParser = DI.createInterface<IExpressionParser>('IExpressionParser').withDefault(x => x.singleton(ExpressionParser));

/** @internal */
export class ExpressionParser implements IExpressionParser {
  private readonly expressionLookup: Record<string, IsBindingBehavior>;
  private readonly forOfLookup: Record<string, IForOfStatement>;
  private readonly interpolationLookup: Record<string, IInterpolationExpression>;

  public constructor() {
    this.expressionLookup = Object.create(null);
    this.forOfLookup = Object.create(null);
    this.interpolationLookup = Object.create(null);
  }

  public parse(expression: string, bindingType: BindingType.ForCommand): IForOfStatement;
  public parse(expression: string, bindingType: BindingType.Interpolation): IInterpolationExpression;
  public parse(expression: string, bindingType: Exclude<BindingType, BindingType.ForCommand | BindingType.Interpolation>): IsBindingBehavior;
  public parse(expression: string, bindingType: BindingType): AnyBindingExpression {
    switch (bindingType) {
      case BindingType.Interpolation: {
        let found = this.interpolationLookup[expression];
        if (found === void 0) {
          found = this.interpolationLookup[expression] = this.parseCore(expression, bindingType);
        }
        return found;
      }
      case BindingType.ForCommand: {
        let found = this.forOfLookup[expression];
        if (found === void 0) {
          found = this.forOfLookup[expression] = this.parseCore(expression, bindingType);
        }
        return found;
      }
      default: {
        // Allow empty strings for normal bindings and those that are empty by default (such as a custom attribute without an equals sign)
        // But don't cache it, because empty strings are always invalid for any other type of binding
        if (expression.length === 0 && (bindingType & (BindingType.BindCommand | BindingType.OneTimeCommand | BindingType.ToViewCommand))) {
          return PrimitiveLiteralExpression.$empty;
        }
        let found = this.expressionLookup[expression];
        if (found === void 0) {
          found = this.expressionLookup[expression] = this.parseCore(expression, bindingType);
        }
        return found;
      }
    }
  }

  public cache(expressions: Record<string, AnyBindingExpression>): void {
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
  private parseCore(expression: string, bindingType: BindingType): AnyBindingExpression {
    try {
      const parts = expression.split('.');
      const firstPart = parts[0];
      let current: AnyBindingExpression;

      if (firstPart.endsWith('()')) {
        current = new CallScopeExpression(firstPart.replace('()', ''), PLATFORM.emptyArray);
      } else {
        current = new AccessScopeExpression(parts[0]);
      }

      let index = 1;

      while (index < parts.length) {
        const currentPart = parts[index];

        if (currentPart.endsWith('()')) {
          current = new CallMemberExpression(current, currentPart.replace('()', ''), PLATFORM.emptyArray);
        } else {
          current = new AccessMemberExpression(current, parts[index]);
        }

        index++;
      }

      return current;
    } catch (e) {
      throw Reporter.error(3, e);
    }
  }
}

/* eslint-disable @typescript-eslint/indent */
export const enum BindingType {
                None = 0,
    IgnoreCustomAttr = 0b100000000_0000,
       Interpolation = 0b010000000_0000,
          IsRef      = 0b101010000_0000,
          IsIterator = 0b000100000_0000,
          IsCustom   = 0b000010000_0000,
          IsFunction = 0b000001000_0000,
          IsEvent    = 0b000000100_0000,
          IsProperty = 0b000000010_0000,
          IsCommand  = 0b000000001_0000,
  IsPropertyCommand  = 0b000000011_0000,
     IsEventCommand  = 0b000000101_0000,
  DelegationStrategyDelta =      0b0110,

             Command =           0b1111,
      OneTimeCommand = 0b000000011_0001,
      ToViewCommand  = 0b000000011_0010,
     FromViewCommand = 0b000000011_0011,
       TwoWayCommand = 0b000000011_0100,
         BindCommand = 0b000000011_0101,
      TriggerCommand = 0b100000101_0110,
      CaptureCommand = 0b100000101_0111,
     DelegateCommand = 0b100000101_1000,
         CallCommand = 0b000001001_1001,
      OptionsCommand = 0b000000001_1010,
          ForCommand = 0b000100001_1011,
       CustomCommand = 0b000010001_1100
}
/* eslint-enable @typescript-eslint/indent */
