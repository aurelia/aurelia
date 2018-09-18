import { inject, PLATFORM } from '@aurelia/kernel';
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

  ILetBindingInstruction,
  ILetElementInstruction,

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
  AttributeDefinition,
  ElementDefinition,
} from '@aurelia/runtime';
import { Char } from '../binding/expression-parser';
import { BindingCommandResource, IBindingCommand } from './binding-command';

// tslint:disable:no-inner-html

const domParser = <HTMLDivElement>DOM.createElement('div');
const marker = DOM.createElement('au-marker') as Element;
marker.classList.add('au');
const createMarker: () => HTMLElement = marker.cloneNode.bind(marker, false);

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

/*@internal*/
export function resolveTarget(target: string, element: ElementDefinition, attribute: AttributeDefinition): string {
  // give custom attributes priority over custom element properties (is this correct? should we throw if there's a conflict?)
  if (attribute !== null) {
    // only consider semicolon-separated bindings for normal custom attributes, not template controllers
    if (attribute.isTemplateController === false) {
      // users must not have a semicolon-separated binding with the same name as the attribute; behavior would be unpredictable
      if (target !== attribute.name) {
        const propertyName = PLATFORM.camelCase(target);
        const bindable = attribute.bindables[propertyName]
        if (bindable !== null) {
          return bindable.property || propertyName;
        }
        return target;
      }
    }
    const bindableNames = Object.keys(attribute.bindables);
    if (bindableNames.length) {
      // return the first by convention (usually there should only be one)
      return bindableNames[0];
    }
    // if there are no bindables declared, default to 'value'
    return 'value';
  }
  if (element !== null) {
    const propertyName = PLATFORM.camelCase(target);
    const bindable = element.bindables[propertyName];
    if (bindable) {
      return bindable.property || propertyName;
    }
  }
  return target;
}

const attributeInspectionBuffer: [string, AttributeDefinition, IBindingCommand | null] = <any>Array(3);

/*@internal*/
export function inspectAttribute(name: string, resources: IResourceDescriptions):
  [string, AttributeDefinition, IBindingCommand | null] {
  let targetName = name;
  let bindingCommand: IBindingCommand = null;

  for (let i = 0, ii = name.length; i < ii; ++i) {
    if (name.charCodeAt(i) === Char.Dot) {
      // set the targetName to only the part that comes before the first dot
      if (name === targetName) {
        targetName = name.slice(0, i);
      }
      const commandName = name.slice(i + 1);
      bindingCommand = resources.create(BindingCommandResource, commandName) || null;
      if (bindingCommand !== null) {
        // keep looping until the part after any dot (doesn't have to be the first/last) is a bindingCommand
        break;
      }
    }
  }
  const attributeDefinition = resources.find(CustomAttributeResource, targetName) || null;

  attributeInspectionBuffer[0] = targetName;
  attributeInspectionBuffer[1] = attributeDefinition;
  attributeInspectionBuffer[2] = bindingCommand;
  return attributeInspectionBuffer;
}

@inject(IExpressionParser)
export class TemplateCompiler implements ITemplateCompiler {
  public get name(): string {
    return 'default';
  }

  constructor(private parser: IExpressionParser) { }

  public compile(definition: Required<ITemplateSource>, resources: IResourceDescriptions, flags?: ViewCompileFlags): TemplateDefinition {
    let node = <Node>definition.templateOrNode;
    if (typeof node === 'string') {
      domParser.innerHTML = node;
      node = definition.templateOrNode = domParser.firstElementChild;
      domParser.removeChild(node);
    }
    const rootNode = <Element>node;
    const isTemplate = node.nodeName === 'TEMPLATE';

    // Parent node is required for remove / replace operation incase node is the direct child of document fragment
    const parentNode = node = isTemplate ? (<HTMLTemplateElement>node).content : node;

    while (node = this.compileNode(node, parentNode, definition, definition.instructions, resources)) { /* Do nothing */ }

    // ideally the flag should be passed correctly from rendering engine
    if (isTemplate && (flags & ViewCompileFlags.surrogate)) {
      this.compileSurrogate(rootNode, definition.surrogates, resources);
    }
    return definition;
  }

  /*@internal*/
  public compileNode(
    node: Node,
    parentNode: Node,
    definition: Required<ITemplateSource>,
    instructions: TargetedInstruction[][],
    resources: IResourceDescriptions
  ): Node {
    const nextSibling = node.nextSibling;
    switch (node.nodeType) {
      case NodeType.Element:
        this.compileElementNode(<Element>node, parentNode, definition, instructions, resources);
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
      const { name, value } = attr;
      const [target, attribute, command] = inspectAttribute(name, resources);
      if (attribute && attribute.isTemplateController) {
        throw new Error('Cannot have template controller on surrogate element.');
      }
      const instruction = this.compileAttribute(target, value, node, attribute, null, command);
      if (instruction !== null) {
        surrogateInstructions.push(instruction);
      } else {
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
    definition: Required<ITemplateSource>,
    instructions: TargetedInstruction[][],
    resources: IResourceDescriptions
  ): void {
    const tagName = node.tagName;

    if (tagName === 'SLOT') {
      definition.hasSlots = true;
      return;
    } else if (tagName === 'LET') {
      const letElementInstruction = this.compileLetElement(node, resources);
      instructions.push([letElementInstruction]);
      // theoretically there's no need to replace, but to keep it consistent
      DOM.replaceNode(createMarker(), node);
      return;
    }
    // if there is a custom element or template controller, then the attribute instructions become children
    // of the hydrate instruction, otherwise they are added directly to instructions as a single array
    const attributeInstructions: TargetedInstruction[] = [];
    const tagResourceKey = (node.getAttribute('as-element') || tagName).toLowerCase();
    const element = resources.find(CustomElementResource, tagResourceKey) || null;
    const attributes = node.attributes;
    for (let i = 0, ii = attributes.length; i < ii; ++i) {
      const attr = attributes.item(i);
      const { name, value } = attr;
      if (name === 'as-element') {
        continue;
      }
      const [target, attribute, command] = inspectAttribute(name, resources);

      if (attribute !== null) {
        if (attribute.isTemplateController) {
          node.removeAttributeNode(attr);

          let instruction = this.compileAttribute(target, value, node, attribute, element, command);
          // compileAttribute will return a HydrateTemplateController if there is a binding command registered that produces one (in our case only "for")
          if (instruction.type !== TargetedInstructionType.hydrateTemplateController) {
            const src: ITemplateSource = {
              name: attribute.name,
              templateOrNode: node,
              instructions: []
            };
            instruction = new HydrateTemplateController(src, target, [instruction], attribute.name === 'else');
          }

          (node.parentNode || parentNode).replaceChild(createMarker(), node);
          const template = DOM.createTemplate() as HTMLTemplateElement;
          template.content.appendChild(node);
          instruction.src.templateOrNode = template;
          instruction.instructions.push(...attributeInstructions);
          this.compile(<Required<ITemplateSource>>instruction.src, resources);
          instructions.push([instruction]);
          return;
        } else {
          const childInstructions = [];
          const bindings = value.split(';');
          // TODO: improve this
          if (bindings.length > 1) {
            for (let i = 0, ii = bindings.length; i < ii; ++i) {
              const binding = bindings[i];
              const parts = binding.split(':');
              const [childTarget, , childCommand] = inspectAttribute(parts[0].trim(), resources);
              childInstructions.push(this.compileAttribute(childTarget, parts[1].trim(), node, attribute, element, childCommand));
            }
          } else {
            childInstructions.push(this.compileAttribute(target, value, node, attribute, element, command));
          }
          attributeInstructions.push(new HydrateAttributeInstruction(target, childInstructions));
        }
      } else {
        const instruction = this.compileAttribute(target, value, node, attribute, element, command);
        if (instruction !== null) {
          attributeInstructions.push(instruction);
        }
      }
    }
    // no template controller; see if there's a custom element
    if (element) {
      // custom element takes the attributes as children
      instructions.push([new HydrateElementInstruction(tagResourceKey, attributeInstructions)]);
      node.classList.add('au');
    } else if (attributeInstructions.length) {
      // no custom element or template controller, add the attributes directly
      instructions.push(attributeInstructions);
      node.classList.add('au');
    }
    const current = node;
    let currentChild = node.firstChild;
    while (currentChild) {
      currentChild = this.compileNode(currentChild, current, definition, instructions, resources);
    }
  }

  public compileLetElement(node: Element, resources: IResourceDescriptions): ILetElementInstruction {
    const letInstructions: ILetBindingInstruction[] = [];
    const attributes = node.attributes;
    // ToViewModel flag needs to be determined in advance
    // before compiling any attribute
    const toViewModel = node.hasAttribute('to-view-model');
    node.removeAttribute('to-view-model');
    for (let i = 0, ii = attributes.length; ii > i; ++i) {
      const attr = attributes.item(i);
      const { name, value } = attr;
      // tslint:disable-next-line:prefer-const
      let [target, , command] = inspectAttribute(name, resources);
      target = PLATFORM.camelCase(target);
      let letInstruction: LetBindingInstruction;

      if (!command) {
        const expression = this.parser.parse(value, BindingType.Interpolation);
        if (expression === null) {
          // Should just be a warning, but throw for now
          throw new Error(`Invalid let binding. String liternal given for attribute: ${target}`);
        }
        letInstruction = new LetBindingInstruction(expression, target);
      } else if (command === null) {
        // TODO: this does work well with no built in command spirit
        throw new Error('Only bind command supported for "let" element.');
      } else {
        letInstruction = new LetBindingInstruction(value, target);
      }
      letInstructions.push(letInstruction);
    }
    return new LetElementInstruction(letInstructions, toViewModel);
  }

  /*@internal*/
  public compileTextNode(node: Text, instructions: TargetedInstruction[][]): boolean {
    const expression = this.parser.parse(node.wholeText, BindingType.Interpolation);
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
    target: string,
    value: string,
    node: Node,
    attribute: AttributeDefinition,
    element: ElementDefinition,
    command: IBindingCommand | null): TargetedInstruction {
      // binding commands get priority over all; they may override default behaviors
      // it is the responsibility of the implementor to ensure they filter out stuff they shouldn't override
      if (command !== null && command.handles(attribute)) {
        return command.compile(target, value, node, attribute, element);
      }
      // simple path for ref binding
      const parser = this.parser;
      if (target === 'ref') {
        return new RefBindingInstruction(parser.parse(value, BindingType.IsRef));
      }
      // simple path for style bindings (TODO: this doesnt work, but we need to use StylePropertyBindingInstruction right?)
      // if (target === 'style' || target === 'css') {
      //   const expression = parser.parse(value, BindingType.Interpolation);
      //   if (expression === null) {
      //     return null;
      //   }
      //   return new StylePropertyBindingInstruction(expression, target);
      // }
      // plain custom attribute on any kind of element
      if (attribute !== null) {
        target = resolveTarget(target, element, attribute);
        value = value && value.length ? value : '""';
        const expression = parser.parse(value, BindingType.Interpolation) || parser.parse(value, BindingType.ToViewCommand);
        if (attribute.defaultBindingMode) {
          switch (attribute.defaultBindingMode) {
            case BindingMode.oneTime:
              return new OneTimeBindingInstruction(expression, target);
            case BindingMode.fromView:
              return new FromViewBindingInstruction(expression, target);
            case BindingMode.twoWay:
              return new TwoWayBindingInstruction(expression, target);
            case BindingMode.toView:
            default:
              return new ToViewBindingInstruction(expression, target);
          }
        }
        return new ToViewBindingInstruction(expression, target);
      }
      // plain attribute on a custom element
      if (element !== null) {
        target = resolveTarget(target, element, attribute);
        const expression = parser.parse(value, BindingType.Interpolation);
        if (expression === null) {
          // no interpolation -> make it a setProperty on the component
          return new SetPropertyInstruction(value, target);
        }
        // interpolation -> behave like toView (e.g. foo="${someProp}")
        return new ToViewBindingInstruction(expression, target);
      }
      // plain attribute on a normal element
      const expression = parser.parse(value, BindingType.Interpolation);
      if (expression === null) {
        // no interpolation -> do not return an instruction
        return null;
      }
      // interpolation -> behave like toView (e.g. id="${someId}")
      return new ToViewBindingInstruction(expression, target);
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
export class LetElementInstruction implements ILetElementInstruction {
  public type: TargetedInstructionType.letElement;
  public instructions: ILetBindingInstruction[];
  public toViewModel: boolean;
  constructor(instructions: ILetBindingInstruction[], toViewModel: boolean) {
    this.instructions = instructions;
    this.toViewModel = toViewModel;
  }
}
export class LetBindingInstruction implements ILetBindingInstruction {
  public type: TargetedInstructionType.letBinding;
  public srcOrExpr: string | IExpression;
  public dest: string;
  constructor(srcOrExpr: string | IExpression, dest: string) {
    this.srcOrExpr = srcOrExpr;
    this.dest = dest;
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
LetElementInstruction.prototype.type = TargetedInstructionType.letElement;
LetBindingInstruction.prototype.type = TargetedInstructionType.letBinding;

// tslint:enable:no-reserved-keywords
// tslint:enable:no-any
