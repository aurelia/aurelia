import { AttributeMap } from './attribute-map';
import { Parser } from './parser';
import {
  IBindingLanguage,
  IInsepctionInfo,
  // bindingType,
  IResourceElement,
  IAureliaModule,
  ITemplateFactory,
} from './interfaces';

import { bindingMode, delegationStrategy, AbstractBinding, PropertyBinding, ListenerBinding } from './binding';

// interface SyntaxInterpreterCommands {
//   bind: 1,
//   'one-time': 1,
//   'one-way': 1,
//   'two-way': 1,
//   'to-view': 1,
//   'from-view': 1,
//   'trigger': 1,
//   'delegate': 1,
//   'capture': 1
// };

export class SyntaxInterpreter {

  static inject = [Parser, 'IBindingLanguage', AttributeMap];

  constructor(
    public parser: Parser,
    public bindingLanguage: IBindingLanguage,
    public attributeMap: AttributeMap
  ) {
  }

  interpret(element: Element, info: IInsepctionInfo, targetIndex: number, elementResource: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule) {
    if (info.command in this) {
      return (this as any)[info.command](element, info, targetIndex, elementResource, factory, auModule);
    }

    return this.handleUnknownCommand(element, info, targetIndex);
  }

  private handleUnknownCommand(element: Element, info: IInsepctionInfo, targetIndex: number): AbstractBinding {
    console.warn('Unknown binding command.', info);
    return null;
  }

  private determineDefaultBindingMode(
    element: Element & { type?: string, contentEditable?: string },
    attrName: string,
    elementResource: IResourceElement,
    factory: ITemplateFactory,
    auModule: IAureliaModule,
  ) {
    let tagName = element.tagName.toLowerCase();

    if (tagName === 'input' && (attrName === 'value' || attrName === 'files') && element.type !== 'checkbox' && element.type !== 'radio'
      || tagName === 'input' && attrName === 'checked' && (element.type === 'checkbox' || element.type === 'radio')
      || (tagName === 'textarea' || tagName === 'select') && attrName === 'value'
      || (attrName === 'textcontent' || attrName === 'innerhtml') && element.contentEditable === 'true'
      || attrName === 'scrolltop'
      || attrName === 'scrollleft') {
      return bindingMode.twoWay;
    }

    // Todo: check if custom attribute || or should it be on view compiler
    if (!elementResource) {
      return bindingMode.toView;
    }

    let bindable = factory.elementResource.getBindable(attrName);
    if (bindable) {
      return bindable.defaultBindingMode === null || bindable.defaultBindingMode === undefined
        ? bindingMode.toView
        : bindable.defaultBindingMode
    }


    // if (resources
    //   && resources.attributes && attrName in resources.attributes
    //   && resources.attributes[attrName]
    //   && resources.attributes[attrName].defaultBindingMode >= bindingMode.oneTime
    // ) {
    //   return resources.attributes[attrName].defaultBindingMode;
    // }

    return bindingMode.oneWay;
  }

  bind(element: Element, info: IInsepctionInfo, targetIndex: number, elementResource: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): AbstractBinding {
    let bindable = elementResource ? elementResource.getBindable(info.attrName) : null;
    return new PropertyBinding(
      this.parser.getOrCreateAstRecord(info.attrValue),
      targetIndex,
      info.attrName,
      info.defaultBindingMode === undefined || info.defaultBindingMode === null
        ? this.determineDefaultBindingMode(element, info.attrName, elementResource, factory, auModule)
        : info.defaultBindingMode,
      bindable ? true : false,
      bindable ? factory.lastBehaviorIndex : undefined
    );
    // return [
    //   targetIndex,
    //   bindingType.binding,
    //   this.parser.parse(info.attrValue),
    //   info.attrName,
    //   info.defaultBindingMode === undefined || info.defaultBindingMode === null
    //     ? this.determineDefaultBindingMode(resources, element, info.attrName)
    //     : info.defaultBindingMode
    // ];
  }

  trigger(element: Element, info: IInsepctionInfo, targetIndex: number, elementResource: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): AbstractBinding {
    return new ListenerBinding(
      this.parser.getOrCreateAstRecord(info.attrValue),
      targetIndex,
      info.attrName,
      delegationStrategy.none,
    );
    // return [
    //   targetIndex,
    //   bindingType.listener,
    //   this.parser.parse(info.attrValue),
    //   info.attrName,
    //   delegationStrategy.none
    // ];
    // return new ListenerExpression(
    //   this.eventManager,
    //   info.attrName,
    //   this.parser.parse(info.attrValue),
    //   delegationStrategy.none,
    //   true,
    //   resources.lookupFunctions
    // );
  }

  capture(element: Element, info: IInsepctionInfo, targetIndex: number, elementResource: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): AbstractBinding {
    return new ListenerBinding(
      this.parser.getOrCreateAstRecord(info.attrValue),
      targetIndex,
      info.attrName,
      delegationStrategy.capturing,
    );
    // return [
    //   targetIndex,
    //   bindingType.listener,
    //   this.parser.parse(info.attrValue),
    //   info.attrName,
    //   delegationStrategy.capturing
    // ];
    // return new ListenerExpression(
    //   this.eventManager,
    //   info.attrName,
    //   this.parser.parse(info.attrValue),
    //   delegationStrategy.capturing,
    //   true,
    //   resources.lookupFunctions
    // );
  }

  delegate(element: Element, info: IInsepctionInfo, targetIndex: number, elementResource: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): AbstractBinding {
    return new ListenerBinding(
      this.parser.getOrCreateAstRecord(info.attrValue),
      targetIndex,
      info.attrName,
      delegationStrategy.bubbling,
    );
    // return [
    //   targetIndex,
    //   bindingType.listener,
    //   this.parser.parse(info.attrValue),
    //   info.attrName,
    //   delegationStrategy.bubbling
    // ];
    // return new ListenerExpression(
    //   this.eventManager,
    //   info.attrName,
    //   this.parser.parse(info.attrValue),
    //   delegationStrategy.bubbling,
    //   true,
    //   resources.lookupFunctions
    // );
  }

  // call(resources, element, info, existingInstruction) {
  //   let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

  //   instruction.attributes[info.attrName] = new CallExpression(
  //     this.observerLocator,
  //     info.attrName,
  //     this.parser.parse(info.attrValue),
  //     resources.lookupFunctions
  //   );

  //   return instruction;
  // }

  // options(resources, element, info, existingInstruction, context) {
  //   let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);
  //   let attrValue = info.attrValue;
  //   let language = this.language;
  //   let name = null;
  //   let target = '';
  //   let current;
  //   let i;
  //   let ii;
  //   let inString = false;
  //   let inEscape = false;
  //   let foundName = false;

  //   for (i = 0, ii = attrValue.length; i < ii; ++i) {
  //     current = attrValue[i];

  //     if (current === ';' && !inString) {
  //       if (!foundName) {
  //         name = this._getPrimaryPropertyName(resources, context);
  //       }
  //       info = language.inspectAttribute(resources, '?', name, target.trim());
  //       language.createAttributeInstruction(resources, element, info, instruction, context);

  //       if (!instruction.attributes[info.attrName]) {
  //         instruction.attributes[info.attrName] = info.attrValue;
  //       }

  //       target = '';
  //       name = null;
  //     } else if (current === ':' && name === null) {
  //       foundName = true;
  //       name = target.trim();
  //       target = '';
  //     } else if (current === '\\') {
  //       target += current;
  //       inEscape = true;
  //       continue;
  //     } else {
  //       target += current;

  //       if (name !== null && inEscape === false && current === '\'') {
  //         inString = !inString;
  //       }
  //     }

  //     inEscape = false;
  //   }

  //   // check for the case where we have a single value with no name
  //   // and there is a default property that we can use to obtain
  //   // the name of the property with which the value should be associated.
  //   if (!foundName) {
  //     name = this._getPrimaryPropertyName(resources, context);
  //   }

  //   if (name !== null) {
  //     info = language.inspectAttribute(resources, '?', name, target.trim());
  //     language.createAttributeInstruction(resources, element, info, instruction, context);

  //     if (!instruction.attributes[info.attrName]) {
  //       instruction.attributes[info.attrName] = info.attrValue;
  //     }
  //   }

  //   return instruction;
  // }

  // _getPrimaryPropertyName(resources, context) {
  //   let type = resources.getAttribute(context.attributeName);
  //   if (type && type.primaryProperty) {
  //     return type.primaryProperty.attribute;
  //   }
  //   return null;
  // }

  // 'for'(resources, element, info, existingInstruction) {
  //   let parts;
  //   let keyValue;
  //   let instruction;
  //   let attrValue;
  //   let isDestructuring;

  //   attrValue = info.attrValue;
  //   isDestructuring = attrValue.match(/^ *[[].+[\]]/);
  //   parts = isDestructuring ? attrValue.split('of ') : attrValue.split(' of ');

  //   if (parts.length !== 2) {
  //     throw new Error('Incorrect syntax for "for". The form is: "$local of $items" or "[$key, $value] of $items".');
  //   }

  //   instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

  //   if (isDestructuring) {
  //     keyValue = parts[0].replace(/[[\]]/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
  //     instruction.attributes.key = keyValue[0];
  //     instruction.attributes.value = keyValue[1];
  //   } else {
  //     instruction.attributes.local = parts[0];
  //   }

  //   instruction.attributes.items = new BindingExpression(
  //     this.observerLocator,
  //     'items',
  //     this.parser.parse(parts[1]),
  //     bindingMode.oneWay,
  //     resources.lookupFunctions
  //   );

  //   return instruction;
  // }

  'two-way'(element: Element, info: IInsepctionInfo, targetIndex: number, elementResource: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): AbstractBinding {
    let bindable = elementResource ? elementResource.getBindable(info.attrName) : null;
    return new PropertyBinding(
      this.parser.getOrCreateAstRecord(info.attrValue),
      targetIndex,
      info.attrName,
      bindingMode.twoWay,
      bindable ? true : false,
      bindable ? factory.lastBehaviorIndex : undefined
    );
    // return [
    //   targetIndex,
    //   bindingType.binding,
    //   this.parser.parse(info.attrValue),
    //   info.attrName,
    //   bindingMode.twoWay
    // ];

    // instruction.attributes[info.attrName] = new BindingExpression(
    //   this.observerLocator,
    //   this.attributeMap.map(element.tagName, info.attrName),
    //   this.parser.parse(info.attrValue),
    //   bindingMode.twoWay,
    //   resources.lookupFunctions
    // );

    // return instruction;
  }

  'to-view'(element: Element, info: IInsepctionInfo, targetIndex: number, elementResource: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): AbstractBinding {
    let bindable = elementResource ? elementResource.getBindable(info.attrName) : null;
    return new PropertyBinding(
      this.parser.getOrCreateAstRecord(info.attrValue),
      targetIndex,
      info.attrName,
      bindingMode.toView,
      bindable ? true : false,
      bindable ? factory.lastBehaviorIndex : undefined
    );
    // return [
    //   targetIndex,
    //   bindingType.binding,
    //   this.parser.parse(info.attrValue),
    //   info.attrName,
    //   bindingMode.twoWay
    // ];
    // let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    // instruction.attributes[info.attrName] = new BindingExpression(
    //   this.observerLocator,
    //   this.attributeMap.map(element.tagName, info.attrName),
    //   this.parser.parse(info.attrValue),
    //   bindingMode.toView,
    //   resources.lookupFunctions
    // );

    // return instruction;
  }

  'one-way'(element: Element, info: IInsepctionInfo, targetIndex: number, elementResource: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): AbstractBinding {
    let bindable = elementResource ? elementResource.getBindable(info.attrName) : null;
    return new PropertyBinding(
      this.parser.getOrCreateAstRecord(info.attrValue),
      targetIndex,
      info.attrName,
      bindingMode.toView,
      bindable ? true : false,
      bindable ? factory.lastBehaviorIndex : undefined
    );
    // return [
    //   targetIndex,
    //   bindingType.binding,
    //   this.parser.parse(info.attrValue),
    //   info.attrName,
    //   bindingMode.twoWay
    // ];
    // let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    // instruction.attributes[info.attrName] = new BindingExpression(
    //   this.observerLocator,
    //   this.attributeMap.map(element.tagName, info.attrName),
    //   this.parser.parse(info.attrValue),
    //   bindingMode.toView,
    //   resources.lookupFunctions
    // );

    // return instruction;
  }

  'from-view'(element: Element, info: IInsepctionInfo, targetIndex: number, elementResource: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): AbstractBinding {
    let bindable = elementResource ? elementResource.getBindable(info.attrName) : null;
    return new PropertyBinding(
      this.parser.getOrCreateAstRecord(info.attrValue),
      targetIndex,
      info.attrName,
      bindingMode.fromView,
      bindable ? true : false,
      bindable ? factory.lastBehaviorIndex : undefined
    );
    // return [
    //   targetIndex,
    //   bindingType.binding,
    //   this.parser.parse(info.attrValue),
    //   info.attrName,
    //   bindingMode.fromView
    // ];
    // let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    // instruction.attributes[info.attrName] = new BindingExpression(
    //   this.observerLocator,
    //   this.attributeMap.map(element.tagName, info.attrName),
    //   this.parser.parse(info.attrValue),
    //   bindingMode.fromView,
    //   resources.lookupFunctions
    // );

    // return instruction;
  }

  'one-time'(element: Element, info: IInsepctionInfo, targetIndex: number, elementResource: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): AbstractBinding {
    let bindable = elementResource ? elementResource.getBindable(info.attrName) : null;
    return new PropertyBinding(
      this.parser.getOrCreateAstRecord(info.attrValue),
      targetIndex,
      info.attrName,
      bindingMode.oneTime,
      bindable ? true : false,
      bindable ? factory.lastBehaviorIndex : undefined
    );
    // return [
    //   targetIndex,
    //   bindingType.binding,
    //   this.parser.parse(info.attrValue),
    //   info.attrName,
    //   bindingMode.oneTime
    // ];
    // let instruction = existingInstruction || BehaviorInstruction.attribute(info.attrName);

    // instruction.attributes[info.attrName] = new BindingExpression(
    //   this.observerLocator,
    //   this.attributeMap.map(element.tagName, info.attrName),
    //   this.parser.parse(info.attrValue),
    //   bindingMode.oneTime,
    //   resources.lookupFunctions
    // );

    // return instruction;
  }
}
