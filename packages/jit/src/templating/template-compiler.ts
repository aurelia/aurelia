import { inject } from '@aurelia/kernel';
import { BindingType, CustomAttributeResource, IExpression, IExpressionParser, Interpolation, IResourceDescriptions, ITemplateCompiler, TemplateDefinition } from '@aurelia/runtime';
import { Char } from '../binding/expression-parser';
import { BindingCommandResource } from './binding-command';

export type AttributeValue = IExpression | null;

@inject(IExpressionParser)
export class TemplateCompiler implements ITemplateCompiler {
  public get name() {
    return 'default';
  }

  constructor(private expressionParser: IExpressionParser) {

  }

  public compile(definition: TemplateDefinition, resources: IResourceDescriptions): TemplateDefinition {
    throw new Error('Template Compiler Not Yet Implemented');
  }

  /*@internal*/
  public parseAttribute(attr: Attr, resources: IResourceDescriptions): AttributeValue {
    const { name, value } = attr;
    const nameLength = name.length;
    let index = 0;
    while (index < nameLength) {
      if (name.charCodeAt(++index) === Char.Dot) {
        // BindingCommand
        const commandName = name.slice(index + 1);
        const bindingType = BindingCommandLookup[commandName];
        if (bindingType !== undefined) {
          return this.expressionParser.parse(value, bindingType);
        }
        const command = resources.get(BindingCommandResource, commandName);
        if (command !== undefined) {
          // TODO: implement behavior
          return this.expressionParser.parse(value, BindingType.CustomCommand);
        }
        // TODO: should we drop down and see if there's an interpolation?
        return null;
      }
    }
    const bindingType = BindingTargetLookup[name];
    if (bindingType !== undefined) {
      // CustomAttribute (just ref, really)
      return this.expressionParser.parse(value, bindingType);
    }
    const attribute = resources.get(CustomAttributeResource, name);
    if (attribute !== undefined) {
      // CustomAttribute
      // TODO: properly parse semicolon-separated bindings
      return this.expressionParser.parse(value, BindingType.IsCustom);
    }
    // an attribute that is neither an attribute nor a binding command will only become a binding if an interpolation is found
    // otherwise, null is returned
    const valueLength = value.length;
    const parts = [];
    const expressions = [];
    let prev = 0;
    let i = 0;
    while (i < valueLength) {
      if (value.charCodeAt(i) === Char.Dollar && value.charCodeAt(i + 1) === Char.OpenBrace) {
        parts.push(value.slice(prev, i));
        // skip the Dollar+OpenBrace; the expression parser only knows about the closing brace being a valid expression end when in an interpolation
        const expression = this.expressionParser.parse(value.slice(i + 2), BindingType.Interpolation);
        expressions.push(expression);
        // compensate for the skipped Dollar+OpenBrace
        prev = i = i + (<any>expression).$parserStateIndex /*HACK (not deleting the property because we need a better approach to begin with)*/ + 2;
        continue;
      }
      i++;
    }
    if (expressions.length) {
      // add the string part that came after the last ClosingBrace
      parts.push(value.slice(prev));
      return new Interpolation(parts, expressions);
    }
    // nothing bindable could be parsed, return nulle
    return null;
  }

}

const BindingTargetLookup = {
  ['ref']: BindingType.IsRef
};

const BindingCommandLookup = {
  ['one-time']:  BindingType.OneTimeCommand,
  ['to-view']:   BindingType.ToViewCommand,
  ['from-view']: BindingType.FromViewCommand,
  ['two-way']:   BindingType.TwoWayCommand,
  ['bind']:      BindingType.BindCommand,
  ['trigger']:   BindingType.TriggerCommand,
  ['capture']:   BindingType.CaptureCommand,
  ['delegate']:  BindingType.DelegateCommand,
  ['call']:      BindingType.CallCommand,
  ['options']:   BindingType.OptionsCommand,
  ['for']:       BindingType.ForCommand
};
