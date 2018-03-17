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

import { bindingMode, delegationStrategy, IBinding, PropertyBinding, ListenerBinding } from './binding';

export class SyntaxInterpreter {

  static inject = [Parser, 'IBindingLanguage', AttributeMap];

  constructor(
    public parser: Parser,
    public bindingLanguage: IBindingLanguage,
    public attributeMap: AttributeMap
  ) {
  }

  interpret(
    element: Element,
    info: IInsepctionInfo,
    targetIndex: number,
    elementResource: IResourceElement | null,
    factory: ITemplateFactory,
    auModule: IAureliaModule
  ): IBinding | null {
    if (info.command && info.command in this) {
      return (this as any)[info.command](element, info, targetIndex, elementResource, factory, auModule);
    }

    return this.handleUnknownCommand(element, info, targetIndex);
  }

  private handleUnknownCommand(element: Element, info: IInsepctionInfo, targetIndex: number): IBinding | null {
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

    let bindable = elementResource.getBindable(attrName);
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

  bind(el: Element, info: IInsepctionInfo, targetIndex: number, elRes: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): IBinding | null {
    if (!info.attrName || !info.attrValue) {
      console.error('Command [bind] used without attribue name or value.');
      return null;
    }
    let bindable = elRes ? elRes.getBindable(info.attrName) : null;
    return new PropertyBinding(
      this.parser.getOrCreateAstRecord(info.attrValue),
      targetIndex,
      info.attrName,
      info.defaultBindingMode === undefined || info.defaultBindingMode === null
        ? this.determineDefaultBindingMode(el, info.attrName, elRes, factory, auModule)
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

  trigger(el: Element, info: IInsepctionInfo, targetIndex: number, elRes: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): IBinding | null {
    if (!info.attrName || !info.attrValue) {
      console.error('Command [trigger] used without attribue name or value.');
      return null;
    }
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

  capture(el: Element, info: IInsepctionInfo, targetIndex: number, elRes: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): IBinding | null {
    if (!info.attrName || !info.attrValue) {
      console.error('Command [capture] used without attribue name or value.');
      return null;
    }
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

  delegate(el: Element, info: IInsepctionInfo, targetIndex: number, elRes: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): IBinding | null {
    if (!info.attrName || !info.attrValue) {
      console.error('Command [delegate] used without attribue name or value.');
      return null;
    }
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

  'two-way'(el: Element, info: IInsepctionInfo, targetIndex: number, elRes: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): IBinding | null {
    if (!info.attrName || !info.attrValue) {
      console.error('explicit [.two-way] command without attribue name or value.');
      return null;
    }
    let bindable = elRes ? elRes.getBindable(info.attrName) : null;
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

  'to-view'(el: Element, info: IInsepctionInfo, targetIndex: number, elRes: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): IBinding | null {
    if (!info.attrName || !info.attrValue) {
      console.error('explicit [.to-view] command without attribue name or value.');
      return null;
    }
    let bindable = elRes ? elRes.getBindable(info.attrName) : null;
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

  'one-way'(el: Element, info: IInsepctionInfo, targetIndex: number, elRes: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): IBinding | null {
    if (!info.attrName || !info.attrValue) {
      console.error('explicit [.one-way] command without attribue name or value.');
      return null;
    }
    let bindable = elRes ? elRes.getBindable(info.attrName) : null;
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

  'from-view'(el: Element, info: IInsepctionInfo, targetIndex: number, elRes: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): IBinding | null {
    if (!info.attrName || !info.attrValue) {
      console.error('explicit [.from-view] command without attribue name or value.');
      return null;
    }
    let bindable = elRes ? elRes.getBindable(info.attrName) : null;
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

  'one-time'(el: Element, info: IInsepctionInfo, targetIndex: number, elRes: IResourceElement, factory: ITemplateFactory, auModule: IAureliaModule): IBinding | null {
    if (!info.attrName || !info.attrValue) {
      console.error('explicit [.one-time] command without attribue name or value.');
      return null;
    }
    let bindable = elRes ? elRes.getBindable(info.attrName) : null;
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
