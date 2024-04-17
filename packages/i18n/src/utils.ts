import { BindingBehaviorExpression, IsValueConverter, ValueConverterExpression } from '@aurelia/expression-parser';
import { Writable } from '@aurelia/kernel';
import { IBinding, BindingMode, State } from '@aurelia/runtime-html';

export const Signals = {
  I18N_EA_CHANNEL: 'i18n:locale:changed',
  I18N_SIGNAL: 'aurelia-translation-signal',
  RT_SIGNAL: 'aurelia-relativetime-signal'
} as const;

/** @internal */
export const enum ValueConverters {
  translationValueConverterName = 't',
  dateFormatValueConverterName = 'df',
  numberFormatValueConverterName = 'nf',
  relativeTimeValueConverterName = 'rt'
}

export type BindingWithBehavior = IBinding & {
  ast: BindingBehaviorExpression;
};

export function createIntlFormatValueConverterExpression(name: string, binding: BindingWithBehavior) {

  const expression = binding.ast.expression;

  if (!(expression instanceof ValueConverterExpression)) {
    const vcExpression = new ValueConverterExpression(expression as IsValueConverter, name, binding.ast.args);
    (binding.ast as Writable<BindingBehaviorExpression>).expression = vcExpression;
  }
}

/** ExpressionType */
/** @internal */ export const etInterpolation = 'Interpolation';
/** @internal */ export const etIsProperty = 'IsProperty';

/** BindingMode */
/** @internal */ export const bmToView = BindingMode.toView;

/** State */
/** @internal */export const stateActivating = State.activating;

/** @internal */export const behaviorTypeName = 'binding-behavior';
/** @internal */export const valueConverterTypeName = 'value-converter';
