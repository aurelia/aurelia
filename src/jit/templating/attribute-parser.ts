import { IExpressionParser } from './../../runtime/binding/expression-parser';
import { Binding } from '../../runtime/binding/binding';
import { BindingMode } from '../../runtime/binding/binding-mode';
import { IObserverLocator } from '../../runtime/binding/observer-locator';
import { IContainer } from '../../kernel/di';

// this is just a quick skeleton
export class AttributeParser {
  constructor(
    private expressionParser: IExpressionParser,
    private observerLocator: IObserverLocator,
    private container: IContainer) {

  }

  public parse(attribute: Attr): Binding {
    const sourceExpression = this.expressionParser.parse(attribute.value); // we should pass some context to the expressionParser
    return new Binding(
      sourceExpression,
      attribute.parentElement,
      attribute.name.split('.')[0], 
      BindingMode.twoWay,
      this.observerLocator,
      this.container);
  }
}
