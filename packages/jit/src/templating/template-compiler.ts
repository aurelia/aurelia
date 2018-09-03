import { Immutable, inject, PLATFORM } from '@aurelia/kernel';
import {
  BindingMode,
  BindingType,
  CustomAttributeResource,
  CustomElementResource,
  DelegationStrategy,
  DOM,
  ICallBindingInstruction,
  IExpression,
  IExpressionParser,
  IHydrateAttributeInstruction,
  IHydrateElementInstruction,
  IHydrateTemplateController,
  IListenerBindingInstruction,
  INode,
  IPropertyBindingInstruction,
  IRefBindingInstruction,
  IResourceDescriptions,
  ISetPropertyInstruction,
  IStylePropertyBindingInstruction,
  ITargetedInstruction,
  ITemplateCompiler,
  ITemplateSource,
  ITextBindingInstruction,
  PrimitiveLiteral,
  TargetedInstruction,
  TargetedInstructionType,
  TemplateDefinition,

  ViewCompileFlags,
} from '@aurelia/runtime';
import { Char } from '../binding/expression-parser';
import { BindingCommandResource, IBindingCommand } from './binding-command';

const domParser = <HTMLDivElement>DOM.createElement('div');
const marker = DOM.createElement('au-marker') as Element;
marker.classList.add('au');
const createMarker: () => HTMLElement = marker.cloneNode.bind(marker, false);
const swapWithMarker = (node: Element, parentNode: Element) => {
  const marker = createMarker();
  const template = DOM.createElement('template') as HTMLTemplateElement;
  (node.parentNode || parentNode).replaceChild(marker, node);
  template.content.appendChild(node);
  return marker;
};

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
  public get name(): string {
    return 'default';
  }

  constructor(private expressionParser: IExpressionParser) { }

  public compile(
    definition: Required<ITemplateSource>,
    resources: IResourceDescriptions,
    viewCompileFlags?: ViewCompileFlags
  ): TemplateDefinition {
    let node = <Node>definition.templateOrNode;
    if (!node.nodeType) {
      // tslint:disable-next-line:no-inner-html
      domParser.innerHTML = <any>node;
      node = domParser.firstElementChild;
      definition.templateOrNode = node;
    }
    const rootNode = node;
    // Parent node is required for remove / replace operation,
    // incase node is the direct child of document fragment
    const parentNode = node = node.nodeName === 'TEMPLATE' ? (<HTMLTemplateElement>node).content : node;
    while (node = this.compileNode(<Node>node, parentNode, definition.instructions, resources)) { /* Do nothing */ }
    if ((viewCompileFlags & ViewCompileFlags.surrogate)
      // defensive code, for first iteration
      // ideally the flag should be passed correctly from rendering engine
      && rootNode.nodeName === 'TEMPLATE'
    ) {
      this.compileSurrogate(rootNode as Element, definition.surrogates, resources);
    }
    return definition;
  }

  /*@internal*/
  public compileNode(
    node: Node,
    parentNode: Node,
    instructions: TargetedInstruction[][],
    resources: IResourceDescriptions
  ): Node {
    const nextSibling = node.nextSibling;
    switch (node.nodeType) {
      case NodeType.Element:
        this.compileElementNode(<Element>node, parentNode, instructions, resources);
        return nextSibling;
      case NodeType.Text:
        if (!this.compileTextNode(<Text>node, instructions)) {
          while ((node = node.nextSibling) && node.nodeType === NodeType.Text) { /* Do nothing */ }
          return node;
        }
        return nextSibling;
      case NodeType.Comment:
        return nextSibling;
      case NodeType.Document:
        return node.firstChild;
      case NodeType.DocumentType:
        return nextSibling;
      case NodeType.DocumentFragment:
        return node.firstChild;
    }
  }

  /*@internal*/
  public compileSurrogate(
    node: Element,
    surrogateInstructions: TargetedInstruction[],
    resources: IResourceDescriptions
  ): void {
    const attributes = node.attributes;
    for (let i = 0, ii = attributes.length; i < ii; ++i) {
      const attr = attributes.item(i);
      const instruction = this.compileAttribute(attr, node, resources, null, null);
      if (instruction !== null) {
        if (instruction.type === TargetedInstructionType.hydrateTemplateController) {
          throw new Error('Cannot have template controller on surrogate element.');
        } else {
          surrogateInstructions.push(instruction);
        }
      } else {
        const { name, value } = attr;
        let attrInst: TargetedInstruction;
        // Doesn't make sense for these properties as they need to be unique
        if (name !== 'id' && name !== 'part' && name !== 'replace-part') {
          switch (name) {
            // TODO: handle simple surrogate style attribute
            case 'style':
              attrInst = new SetAttributeInstruction(value, name);
              break;
            default:
              attrInst = new SetAttributeInstruction(value, name);
          }
          surrogateInstructions.push(attrInst);
        } else {
          throw new Error(`Invalid surrogate attribute: ${name}`);
        }
      }
    }
  }

  /*@internal*/
  public compileElementNode(
    node: Element,
    parentNode: Node,
    instructions: TargetedInstruction[][],
    resources: IResourceDescriptions
  ): void {
    let elementDefinition: Immutable<Required<ITemplateSource>>;
    let elementInstruction: HydrateElementInstruction;
    const tagName = node.tagName;
    if (tagName === 'SLOT' || tagName === 'LET') {
      throw new Error('<slot/> or <let/> not implemented');
    }
    const tagResourceKey = tagName.toLowerCase();
    elementDefinition = resources.find(CustomElementResource, tagResourceKey);
    if (elementDefinition) {
      elementInstruction = new HydrateElementInstruction(tagResourceKey, []);
    }
    const attributes = node.attributes;
    const attributeInstructions: TargetedInstruction[] = [];
    let liftInstruction: HydrateTemplateController;
    for (let i = 0, ii = attributes.length; i < ii; ++i) {
      const instruction = this.compileAttribute(attributes.item(i), node, resources, elementDefinition, elementInstruction);
      if (instruction !== null) {
        if (instruction.type === TargetedInstructionType.hydrateTemplateController) {
          liftInstruction = instruction;
          // lift instructions will take over the compilation
          // no need to process further if hit 1
          break;
        } else {
          if (elementInstruction) {
            elementInstruction.instructions.push(instruction);
          } else {
            // if instruction is not null, it's a normal targetted instruction
            // not a `elementInstruction.instructions`
            attributeInstructions.push(instruction);
          }
        }
      }
    }
    if (liftInstruction) {
      node = swapWithMarker(node, parentNode as Element);
      const template = DOM.createTemplate() as HTMLTemplateElement;
      template.content.appendChild(liftInstruction.src.templateOrNode as Node);
      liftInstruction.src.templateOrNode = template;
      this.compile(<any>liftInstruction.src, resources);
      // All normal attributes processed before template controller need to be added to template controller
      // But all should come after the first instruction,
      // which is the instruction that sets the value/ values of the template controller

      liftInstruction.instructions.splice(1, 0, ...attributeInstructions);
      instructions.push([liftInstruction]);
    } else {
      const targetInstructions: TargetedInstruction[] = [];
      if (elementInstruction) {
        targetInstructions.push(elementInstruction);
      }
      if (attributeInstructions.length) {
        targetInstructions.push(...attributeInstructions);
      }
      if (targetInstructions.length) {
        instructions.push(targetInstructions);
        node.classList.add('au');
      }
      const current = node;
      let currentChild = node.firstChild;
      while (currentChild) {
        currentChild = this.compileNode(currentChild, current, instructions, resources);
      }
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
    elementDefinition: Immutable<Required<ITemplateSource>>,
    elementInstruction: HydrateElementInstruction
  ): TargetedInstruction {
    const expressionParser = this.expressionParser;
    const { name, value } = attr;
    // if the name has a period in it, targetName will be overwritten again with the left-hand side of the period
    // and commandName will be the right-hand side
    let targetName: string = name;
    let commandName: string = null;
    let bindingCommand: IBindingCommand = null;

    const nameLength = name.length;
    let index = 0;
    while (index < nameLength) {
      if (name.charCodeAt(++index) === Char.Dot) {
        targetName = name.slice(0, index);
        commandName = name.slice(index + 1);

        // see if we have a custom instruction compiler for the command
        bindingCommand = resources.create(BindingCommandResource, commandName);
        if (bindingCommand === null) {
          // false alarm, we don't really have a command, use the full attribute name
          targetName = name;
        }
        break;
      }
    }

    if (targetName === 'ref') {
      return new RefBindingInstruction(expressionParser.parse(value, BindingType.IsRef));
    }

    let propertyName = targetName;
    if (elementDefinition) {
      propertyName = PLATFORM.camelCase(targetName);
    }
    const attributeDefinition = resources.find(CustomAttributeResource, targetName);
    if (!attributeDefinition) {
      if (bindingCommand !== null && bindingCommand.handles(attributeDefinition)) {
        return bindingCommand.compile(attr, node, propertyName, resources, attributeDefinition, elementDefinition, elementInstruction);
      }
      const expression = this.expressionParser.parse(value, BindingType.Interpolation);
      if (expression !== null) {
        // <my-input value="init value with binding: ${initValue}" />
        return new ToViewBindingInstruction(expression, propertyName);
      }
      // check if it's an existing property
      if (elementDefinition && elementDefinition.bindables[propertyName]) {
        return new SetPropertyInstruction(value, propertyName);
      }
      // no command, no interpolation, no property -> return null (no attribute instruction)
      return null;
    }

    if (attributeDefinition.isTemplateController === false) {
      // first get the simple stuff out of the way
      if (bindingCommand !== null && bindingCommand.handles(attributeDefinition)) {
        // IMPORANT difference between vNext and vCurrent
        // for vNext, there is always a default / primary property with name "value"
        // this may not make enough sense, so subject for future change
        const instruction = bindingCommand.compile(attr, node, 'value', resources, attributeDefinition, elementDefinition, elementInstruction);
        return new HydrateAttributeInstruction(targetName, [instruction]);
      }
      // TODO: this is very naive/inefficient, probably doesn't even work, and only meant as a placeholder
      // normal usage looks like this: <div if="value.bind: showDiv; cache: false;"></div>
      // needs to parse properly to differenciate between property with / without binding command
      const hydrateAttrChildInstructions = [];
      const bindings = value.split(';');
      for (let i = 0, ii = bindings.length; i < ii; ++i) {
        const binding = bindings[i];
        const parts = binding.split(':');
        const attr = document.createAttribute(parts[0]);
        attr.value = parts[1];
        hydrateAttrChildInstructions.push(this.compileAttribute(
          attr,
          node,
          resources,
          elementDefinition,
          elementInstruction
        ));
      }
      return new HydrateAttributeInstruction(targetName, hydrateAttrChildInstructions);
    }
    // ============
    // And on to the complex stuff (from here on it's just template controllers, with/without binding commands)
    // ============
    // There are 3 steps involved in processing a template controller:
    // 1. Swap the current element with a marker
    // 2. Added swapped out element into a template
    // 3. Start compiling the newly created template
    // Because of 1, template controller cannot be fully processed here
    // =============================================
    // the template controller will extract & compile
    // Remove attribute to avoid infinite loop
    node.removeAttributeNode(attr);

    if (bindingCommand !== null && bindingCommand.handles(attributeDefinition)) {
      return bindingCommand.compile(attr, node, propertyName, resources, attributeDefinition, elementDefinition, elementInstruction);
    }

    const expression = value
      ? expressionParser.parse(value, BindingType.Interpolation) || expressionParser.parse(value, BindingType.None)
      : new PrimitiveLiteral('');
    const instruction = new ToViewBindingInstruction(
      expression,
      // IMPORANT difference between vNext and vCurrent
      // for vNext, there is always a default / primary property with name "value"
      // this may not make enough sense, so subject for future change
      'value'
    );
    const src: ITemplateSource = { templateOrNode: node, instructions: [] };
    return new HydrateTemplateController(src, targetName, [instruction], attributeDefinition.name === 'else');
  }
}

// tslint:disable:no-reserved-keywords
// tslint:disable:no-any
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

// tslint:enable:no-reserved-keywords
// tslint:enable:no-any
