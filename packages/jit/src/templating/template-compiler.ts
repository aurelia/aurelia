import { Immutable, inject } from '@aurelia/kernel';
import * as RunTime from '@aurelia/runtime';
import { BindingMode, BindingType, CustomAttributeResource, CustomElementResource, DelegationStrategy, DOM, ICallBindingInstruction, IExpression, IExpressionParser, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateTemplateController, IListenerBindingInstruction, INode, IPropertyBindingInstruction, IRefBindingInstruction, IResourceDescriptions, ISetPropertyInstruction, IStylePropertyBindingInstruction, ITargetedInstruction, ITemplateCompiler, ITemplateSource, ITextBindingInstruction, TargetedInstruction, TargetedInstructionType, TemplateDefinition } from '@aurelia/runtime';
import { Char } from '../binding/expression-parser';
import { camelCase } from './camel-case';

const domParser = <HTMLDivElement>DOM.createElement('div');
const marker = document.createElement('au-marker');
marker.classList.add('au');
const createMarker = marker.cloneNode.bind(marker, false);

const enum NodeType {
  Element = 1,
  Attr = 2,
  Text = 3,
  CDATASection = 4,
  EntityReference = 5,
  Entity = 6,
  ProcessingInstruction = 7,
  Comment = 8,
  Document = 9,
  DocumentType = 10,
  DocumentFragment = 11,
  Notation = 12
}

@inject(IExpressionParser)
export class TemplateCompiler implements ITemplateCompiler {
  public get name() {
    return 'default';
  }

  constructor(private expressionParser: IExpressionParser) { }

  public compile(definition: Required<ITemplateSource>, resources: IResourceDescriptions): TemplateDefinition {
    let node = <Node>definition.templateOrNode;
    if (!node.nodeType) {
      domParser.innerHTML = <any>node;
      node = domParser.firstElementChild;
      definition.templateOrNode = node;
    }
    node = <Element>(node.nodeName === 'TEMPLATE' ? (<HTMLTemplateElement>node).content : node);
    while (node = this.compileNode(<Node>node, definition, definition.instructions, resources)) { /* Do nothing */ }
    return definition;
  }

  /*@internal*/
  public compileNode(node: Node, definition: Required<ITemplateSource>, instructions: TargetedInstruction[][], resources: IResourceDescriptions): Node {
    switch (node.nodeType) {
      case NodeType.Element:
        this.compileElementNode(<Element>node, definition, instructions, resources);
        return node.nextSibling;
      case NodeType.Text:
        if (!this.compileTextNode(<Text>node, instructions)) {
          while ((node = node.nextSibling) && node.nodeType === NodeType.Text) { /* Do nothing */ }
          return node;
        }
        return node.nextSibling;
      case NodeType.Comment:
        return node.nextSibling;
      case NodeType.Document:
        return node.firstChild;
      case NodeType.DocumentType:
        return node.nextSibling;
      case NodeType.DocumentFragment:
        return node.firstChild;
    }
  }

  /*@internal*/
  public compileElementNode(node: Element, definition: Required<ITemplateSource>, instructions: TargetedInstruction[][], resources: IResourceDescriptions): void {
    let elementDefinition: Immutable<Required<ITemplateSource>>;
    let elementInstruction: HydrateElementInstruction;
    const tagName = node.tagName;
    if (tagName === 'SLOT' || tagName === 'LET') {
      throw new Error('<slot/> or <let/> not implemented');
    }
    elementDefinition = resources.find(
      CustomElementResource,
      CustomElementResource.keyFrom((RunTime as any).hyphenate(node.tagName))
    );
    if (elementDefinition) {
      elementInstruction = new HydrateElementInstruction(
        resources,
        [],
      );
    }
    const attributes = node.attributes;
    const attributeInstructions: TargetedInstruction[] = [];
    let liftInstruction: HydrateTemplateController;
    for (let i = 0, ii = attributes.length; i < ii; ++i) {
      const instruction = this.compileAttribute(
        attributes.item(i),
        node,
        resources,
        elementInstruction,
        false
      );
      if (instruction !== null) {
        // if it's a template controller instruction
        // it could be nth template controller instruction: <div if.bind="" repeat.for="" with.bind=""></div>
        // just keep refreshing the reference to the last template controller instruction
        if (instruction.type === TargetedInstructionType.hydrateTemplateController) {
          --i;
          --ii;
          if (liftInstruction) {
            liftInstruction.instructions.push(instruction);
          }
          liftInstruction = instruction;
        } else {
          if (liftInstruction) {
            liftInstruction.instructions.push(instruction);
          } else {
            attributeInstructions.push(instruction);
          }
        }
      }
    }
    if (elementInstruction) {
      if (liftInstruction) {
        liftInstruction.instructions.splice(0, 0, elementInstruction);
      } else {
        elementInstruction.instructions.push(...attributeInstructions);
      }
    }
    if (elementInstruction || liftInstruction || attributeInstructions.length) {
      if (liftInstruction) {
        const marker = createMarker();
        node.parentNode.replaceChild(marker, node);
        node = marker;
        instructions.push([liftInstruction]);
      } else {
        node.classList.add('au');
        instructions.push(elementInstruction
          ? [elementInstruction]
          : attributeInstructions
        );
      }
    }
    node = <Element>(node.nodeName === 'TEMPLATE' ? (<HTMLTemplateElement>node).content : node);
    let currentChild = node.firstChild;
    while (currentChild) {
      currentChild = this.compileNode(currentChild, definition, instructions, resources);
    }
  }

  /*@internal*/
  public compileTextNode(node: Text, instructions: TargetedInstruction[][]): boolean {
    const expression = this.expressionParser.parse(node.wholeText, BindingType.Interpolation);
    if (expression === null) {
      return false;
    }
    node.parentNode.insertBefore(createMarker(), node);
    node.textContent = ' ';
    while (node.nextSibling && node.nextSibling.nodeType === NodeType.Text) {
      node.parentNode.removeChild(node.nextSibling);
    }
    instructions.push([new TextBindingInstruction(expression)]);
    return true;
  }

  /*@internal*/
  public compileAttribute(
    attr: Attr,
    node: Element,
    resources: IResourceDescriptions,
    elementInstruction: HydrateElementInstruction,
    isForSurrogateElement: boolean
  ): TargetedInstruction {
    const { name, value } = attr;
    // if the name has a period in it, targetName will be overwritten again with the left-hand side of the period
    // and commandName will be the right-hand side
    let targetName: string = name;
    let commandName: string = null;
    let bindingCommand: BindingType = BindingType.None;

    const nameLength = name.length;
    let index = 0;
    while (index < nameLength) {
      if (name.charCodeAt(++index) === Char.Dot) {
        targetName = name.slice(0, index);
        commandName = name.slice(index + 1);
        // TODO: get/process @bindingCommand decorator resource (not implemented yet)
        bindingCommand = BindingCommandLookup[commandName] || BindingType.None;
        if (bindingCommand === BindingType.None) {
          // false alarm, we don't really have a command, use the full attribute name
          targetName = name;
        }
        break;
      }
    }

    const attributeDefinition = resources.find(
      CustomAttributeResource,
      CustomAttributeResource.keyFrom(targetName)
    );

    if (attributeDefinition && attributeDefinition.isTemplateController && isForSurrogateElement) {
      throw new Error('You cannot put template controller on surrogate elements.');
    }

    if (BindingTargetLookup[targetName] === BindingType.IsRef) {
      // just a one-off special case for ref (we may want to make that a normal attribute resource, and deprecate this target lookup)
      const expression = this.expressionParser.parse(value, bindingCommand);
      return new RefBindingInstruction(expression);
    }

    // Event commands win all
    if (bindingCommand & BindingType.IsEvent) {
      return new BindingInstruction[bindingCommand & BindingType.Command](value, targetName);
    }

    if (attributeDefinition === undefined) {
      if (elementInstruction) {
        const elementDefinition = resources.find(
          CustomElementResource,
          CustomElementResource.keyFrom((RunTime as any).hyphenate(node.tagName))
        );
        const propertyName = camelCase(targetName);
        const elementProperty = elementDefinition.bindables[propertyName];
        if (elementProperty) {
          let attrInstruction: IPropertyBindingInstruction;
          if (bindingCommand === BindingType.BindCommand) {
            switch (elementProperty.mode) {
              case BindingMode.fromView: attrInstruction = new FromViewBindingInstruction(value, propertyName);
              case BindingMode.oneTime: attrInstruction = new OneTimeBindingInstruction(value, propertyName);
              case BindingMode.twoWay: attrInstruction = new TwoWayBindingInstruction(value, propertyName);
              case BindingMode.toView: attrInstruction = new ToViewBindingInstruction(value, propertyName);
              default: throw new Error('Invalid bindable mode');
            }
          } else {
            attrInstruction = new BindingInstruction[bindingCommand & BindingType.Command](value, propertyName);
          }
          elementInstruction.instructions.push(attrInstruction);
          // Is it safe to return null ?
          return null;
        }
      }
      // if we don't have a custom attribute with this name, treat it as a regular attribute binding
      if (bindingCommand === BindingType.None) {
        // no binding command = look for interpolation
        const expression = this.expressionParser.parse(value, BindingType.Interpolation);
        if (expression === null) {
          // no interpolation = no binding
          return null;
        }
        return new ToViewBindingInstruction(expression, targetName);
      }
      if (bindingCommand & (BindingType.IsProperty | BindingType.IsEvent | BindingType.IsFunction)) {
        // covers oneTime, toView, fromView, twoWay, delegate, capture, trigger and call
        const expression = this.expressionParser.parse(value, bindingCommand);
        return new BindingInstruction[bindingCommand & BindingType.Command](expression, targetName);
      }
      // TODO: handle custom binding commands
      return null;
    }

    if (attributeDefinition.isTemplateController === false) {
      // first get the simple stuff out of the way
      if (bindingCommand & BindingType.IsProperty) {
        // single bindable property
        const expression = this.expressionParser.parse(value, bindingCommand);
        const instruction = new BindingInstruction[bindingCommand & BindingType.Command](expression, targetName);
        return new HydrateAttributeInstruction(targetName, [instruction]);
      }
      if (bindingCommand === BindingType.None) {
        // TODO: this is very naive/inefficient, probably doesn't even work, and only meant as a placeholder
        const instructions = [];
        const bindings = value.split(';');
        for (let i = 0, ii = bindings.length; i < ii; ++i) {
          const binding = bindings[i];
          const parts = binding.split(':');
          const attr = document.createAttribute(parts[0]);
          attr.value = parts[1];
          instructions.push(this.compileAttribute(
            attr,
            node,
            resources,
            elementInstruction,
            false
          ));
        }
        return new HydrateAttributeInstruction(targetName, instructions);
      }
      // TODO: (hm? do we need more here?)
      return null;
    }

    // And on to the complex stuff (from here on it's just template controllers, with/without binding commands)
    if (bindingCommand === BindingType.ForCommand) {
      // Yes, indeed we're not looking for an attribute named "repeat". Anything could be iterable. No idea what/how yet though, besides the repeater :)
      let src: ITemplateSource = {
        templateOrNode: null,
        instructions: []
      };
      // Lift the childNodes from the templateController host node
      let current: Node;
      if (current = node.firstChild) {
        const fragment = document.createDocumentFragment();
        let next = current.nextSibling;
        do {
          fragment.appendChild(current);
          current = next;
        } while (current && (next = current.nextSibling));
        src.templateOrNode = fragment;
        src = <ITemplateSource>this.compile(<Required<ITemplateSource>>src, resources);
      }
      const expression = this.expressionParser.parse(value, bindingCommand);
      return new HydrateTemplateController(src, targetName, [
        new ToViewBindingInstruction(expression, 'items'),
        new SetPropertyInstruction('item', 'local')
      ]);
    }

    // TODO: other template controllers / binding commands

    // the template controller will recompile the whole template as its src, needs to remove to avoid infinite loop
    node.removeAttributeNode(attr);
    let src: ITemplateSource = {
      templateOrNode: node,
      instructions: []
    };
    let current: Node;
    if (current = node.firstChild) {
      const template = DOM.createTemplate() as HTMLTemplateElement;
      template.content.appendChild(node.cloneNode(true));
      src.templateOrNode = template;
      src = <ITemplateSource>this.compile(<Required<ITemplateSource>>src, resources);
      src.templateOrNode = template;
    }
    // first get the simple stuff out of the way
    if (bindingCommand & BindingType.IsProperty) {
      if ((bindingCommand & BindingType.FromViewCommand) === BindingType.FromViewCommand) {
        throw new Error('Invalid template. template controller ' + targetName + ' cannot work with .from-view');
      }
      // single bindable property
      const expression = this.expressionParser.parse(value, bindingCommand);
      const instruction = new ToViewBindingInstruction(expression, 'value');
      return new HydrateTemplateController(src, targetName, [
        instruction
      ]);
    }
  }
}

// TODO: may want to get rid of these lookups completely and defer to resources.find() for both commands and attributes
// Ultimately this lookup is just a performance optimization, and we can easily make resources.find() nearly just as fast
const BindingTargetLookup = {
  ['ref']: BindingType.IsRef
};

const BindingCommandLookup = {
  ['one-time']: BindingType.OneTimeCommand,
  ['to-view']: BindingType.ToViewCommand,
  ['from-view']: BindingType.FromViewCommand,
  ['two-way']: BindingType.TwoWayCommand,
  ['bind']: BindingType.BindCommand,
  ['trigger']: BindingType.TriggerCommand,
  ['capture']: BindingType.CaptureCommand,
  ['delegate']: BindingType.DelegateCommand,
  ['call']: BindingType.CallCommand,
  ['options']: BindingType.OptionsCommand,
  ['for']: BindingType.ForCommand
};

// tslint:disable:no-reserved-keywords
export class TextBindingInstruction implements ITextBindingInstruction {
  public type: TargetedInstructionType.textBinding;
  public srcOrExpr: string | IExpression;
  constructor(srcOrExpr: string | IExpression) {
    this.srcOrExpr = srcOrExpr;
  }
}
export class OneTimeBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding;
  public oneTime: true;
  public mode: BindingMode.oneTime;
  public srcOrExpr: string | IExpression;
  public dest: string;
  constructor(srcOrExpr: string | IExpression, dest: string) {
    this.srcOrExpr = srcOrExpr;
    this.dest = dest;
  }
}
export class ToViewBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding;
  public oneTime: false;
  public mode: BindingMode.toView;
  public srcOrExpr: string | IExpression;
  public dest: string;
  constructor(srcOrExpr: string | IExpression, dest: string) {
    this.srcOrExpr = srcOrExpr;
    this.dest = dest;
  }
}
export class FromViewBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding;
  public oneTime: false;
  public mode: BindingMode.fromView;
  public srcOrExpr: string | IExpression;
  public dest: string;
  constructor(srcOrExpr: string | IExpression, dest: string) {
    this.srcOrExpr = srcOrExpr;
    this.dest = dest;
  }
}
export class TwoWayBindingInstruction implements IPropertyBindingInstruction {
  public type: TargetedInstructionType.propertyBinding;
  public oneTime: false;
  public mode: BindingMode.twoWay;
  public srcOrExpr: string | IExpression;
  public dest: string;
  constructor(srcOrExpr: string | IExpression, dest: string) {
    this.srcOrExpr = srcOrExpr;
    this.dest = dest;
  }
}
export class TriggerBindingInstruction implements IListenerBindingInstruction {
  public type: TargetedInstructionType.listenerBinding;
  public strategy: DelegationStrategy.none;
  public preventDefault: true;
  public srcOrExpr: string | IExpression;
  public dest: string;
  constructor(srcOrExpr: string | IExpression, dest: string) {
    this.srcOrExpr = srcOrExpr;
    this.dest = dest;
  }
}
export class DelegateBindingInstruction implements IListenerBindingInstruction {
  public type: TargetedInstructionType.listenerBinding;
  public strategy: DelegationStrategy.bubbling;
  public preventDefault: false;
  public srcOrExpr: string | IExpression;
  public dest: string;
  constructor(srcOrExpr: string | IExpression, dest: string) {
    this.srcOrExpr = srcOrExpr;
    this.dest = dest;
  }
}
export class CaptureBindingInstruction implements IListenerBindingInstruction {
  public type: TargetedInstructionType.listenerBinding;
  public strategy: DelegationStrategy.capturing;
  public preventDefault: false;
  public srcOrExpr: string | IExpression;
  public dest: string;
  constructor(srcOrExpr: string | IExpression, dest: string) {
    this.srcOrExpr = srcOrExpr;
    this.dest = dest;
  }
}
export class CallBindingInstruction implements ICallBindingInstruction {
  public type: TargetedInstructionType.callBinding;
  public srcOrExpr: string | IExpression;
  public dest: string;
  constructor(srcOrExpr: string | IExpression, dest: string) {
    this.srcOrExpr = srcOrExpr;
    this.dest = dest;
  }
}
export class RefBindingInstruction implements IRefBindingInstruction {
  public type: TargetedInstructionType.refBinding;
  public srcOrExpr: string | IExpression;
  constructor(srcOrExpr: string | IExpression) {
    this.srcOrExpr = srcOrExpr;
  }
}
export class StylePropertyBindingInstruction implements IStylePropertyBindingInstruction {
  public type: TargetedInstructionType.stylePropertyBinding;
  public srcOrExpr: string | IExpression;
  public dest: string;
  constructor(srcOrExpr: string | IExpression, dest: string) {
    this.srcOrExpr = srcOrExpr;
    this.dest = dest;
  }
}
export class SetPropertyInstruction implements ISetPropertyInstruction {
  public type: TargetedInstructionType.setProperty;
  public value: any;
  public dest: string;
  constructor(value: any, dest: string) {
    this.value = value;
    this.dest = dest;
  }
}
export class SetAttributeInstruction implements ITargetedInstruction {
  public type: TargetedInstructionType.setAttribute;
  public value: any;
  public dest: string;
  constructor(value: any, dest: string) {
    this.value = value;
    this.dest = dest;
  }
}
export class HydrateElementInstruction implements IHydrateElementInstruction {
  public type: TargetedInstructionType.hydrateElement;
  public res: any;
  public instructions: TargetedInstruction[];
  public parts?: Record<string, ITemplateSource>;
  public contentOverride?: INode;
  constructor(res: any, instructions: TargetedInstruction[], parts?: Record<string, ITemplateSource>, contentOverride?: INode) {
    this.res = res;
    this.instructions = instructions;
    this.parts = parts;
    this.contentOverride = contentOverride;
  }
}
export class HydrateAttributeInstruction implements IHydrateAttributeInstruction {
  public type: TargetedInstructionType.hydrateAttribute;
  public res: any;
  public instructions: TargetedInstruction[];
  constructor(res: any, instructions: TargetedInstruction[]) {
    this.res = res;
    this.instructions = instructions;
  }
}
export class HydrateTemplateController implements IHydrateTemplateController {
  public type: TargetedInstructionType.hydrateTemplateController;
  public src: ITemplateSource;
  public res: any;
  public instructions: TargetedInstruction[];
  public link?: boolean;
  constructor(src: ITemplateSource, res: any, instructions: TargetedInstruction[], link?: boolean) {
    this.src = src;
    this.res = res;
    this.instructions = instructions;
    this.link = link;
  }
}
// tslint:enable:no-reserved-keywords

// See ast.ts (at the bottom) for an explanation of what/why
TextBindingInstruction.prototype.type = TargetedInstructionType.textBinding;
OneTimeBindingInstruction.prototype.type = TargetedInstructionType.propertyBinding;
OneTimeBindingInstruction.prototype.mode = BindingMode.oneTime;
OneTimeBindingInstruction.prototype.oneTime = true;
ToViewBindingInstruction.prototype.type = TargetedInstructionType.propertyBinding;
ToViewBindingInstruction.prototype.mode = BindingMode.toView;
ToViewBindingInstruction.prototype.oneTime = false;
FromViewBindingInstruction.prototype.type = TargetedInstructionType.propertyBinding;
FromViewBindingInstruction.prototype.mode = BindingMode.fromView;
FromViewBindingInstruction.prototype.oneTime = false;
TwoWayBindingInstruction.prototype.type = TargetedInstructionType.propertyBinding;
TwoWayBindingInstruction.prototype.mode = BindingMode.twoWay;
TwoWayBindingInstruction.prototype.oneTime = false;
TriggerBindingInstruction.prototype.type = TargetedInstructionType.listenerBinding;
TriggerBindingInstruction.prototype.strategy = DelegationStrategy.none;
TriggerBindingInstruction.prototype.preventDefault = true;
CaptureBindingInstruction.prototype.type = TargetedInstructionType.listenerBinding;
CaptureBindingInstruction.prototype.strategy = DelegationStrategy.capturing;
CaptureBindingInstruction.prototype.preventDefault = false;
DelegateBindingInstruction.prototype.type = TargetedInstructionType.listenerBinding;
DelegateBindingInstruction.prototype.strategy = DelegationStrategy.bubbling;
DelegateBindingInstruction.prototype.preventDefault = false;
CallBindingInstruction.prototype.type = TargetedInstructionType.callBinding;
RefBindingInstruction.prototype.type = TargetedInstructionType.refBinding;
StylePropertyBindingInstruction.prototype.type = TargetedInstructionType.stylePropertyBinding;
SetPropertyInstruction.prototype.type = TargetedInstructionType.setProperty;
SetAttributeInstruction.prototype.type = TargetedInstructionType.setAttribute;
HydrateElementInstruction.prototype.type = TargetedInstructionType.hydrateElement;
HydrateAttributeInstruction.prototype.type = TargetedInstructionType.hydrateAttribute;
HydrateTemplateController.prototype.type = TargetedInstructionType.hydrateTemplateController;

// Note: the indices map to the last 4 bit positions of BindingType
const BindingInstruction: any[] = [
  undefined,
  OneTimeBindingInstruction,
  ToViewBindingInstruction,
  FromViewBindingInstruction,
  TwoWayBindingInstruction,
  ToViewBindingInstruction, // default for .bind (todo: use proper defaults)
  TriggerBindingInstruction,
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  CallBindingInstruction
];
