import { inject, Writable } from '@aurelia/kernel';
import { BindingType, CustomAttributeResource, DOM, IExpression, IExpressionParser, Interpolation, IResourceDescriptions, ITargetedInstruction, ITemplateCompiler, TemplateDefinition, TargetedInstructionType, TargetedInstruction, DelegationStrategy, ITextBindingInstruction, IPropertyBindingInstruction, IListenerBindingInstruction, ICallBindingInstruction, IRefBindingInstruction, IStylePropertyBindingInstruction, ISetPropertyInstruction, ISetAttributeInstruction, IHydrateElementInstruction, IHydrateAttributeInstruction, IHydrateTemplateController, BindingMode, ITemplateSource, INode } from '@aurelia/runtime';
import { Char } from '../binding/expression-parser';
import { BindingCommandResource } from './binding-command';

const domParser = <HTMLDivElement>DOM.createElement('div');
const createMarker = document.createElement.bind(document, 'au-marker');

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
      node = domParser.firstChild;
      const fragment = document.createDocumentFragment();
      let next = node.nextSibling;
      do {
        fragment.appendChild(node);
        node = next;
      } while (node && (next = node.nextSibling));
      definition.templateOrNode = fragment;
    }
    const instructions = definition.instructions;
    while (node) {
      const childInstructions = new Array<TargetedInstruction>();
      instructions.push(childInstructions);
      node = this.compileNode(<Node>node, childInstructions, resources)
    }
    return definition;
  }

  /*@internal*/
  public compileNode(node: Node, instructions: TargetedInstruction[], resources: IResourceDescriptions): Node {
    switch (node.nodeType) {
      case NodeType.Element:
        return this.compileElementNode(<Element>node, instructions, resources);
      case NodeType.Text:
        return this.compileTextNode(<Text>node, instructions);
      case NodeType.Comment:
        return this.compileNode(node.nextSibling, instructions, resources);
      case NodeType.Document:
        return this.compileNode(node.firstChild, instructions, resources);
      case NodeType.DocumentType:
        return this.compileNode(node.nextSibling, instructions, resources);
      case NodeType.DocumentFragment:
        return this.compileNode(node.firstChild, instructions, resources);
    }
  }

  /*@internal*/
  public compileElementNode(node: Element, instructions: TargetedInstruction[], resources: IResourceDescriptions): Node {
    const attributes = node.attributes;
    const len = attributes.length;
    let nodeHasInstructions = false;
    let i = 0;
    while (i < len) {
      const attribute = attributes.item(i++);
      const instruction = this.compileAttribute(attribute, node, resources);
      if (instruction !== null) {
        instructions.push(instruction);
        nodeHasInstructions = true;
      }
    }
    if (nodeHasInstructions) {
      node.classList.add('au');
    }
    let currentChild = node.nodeName === 'TEMPLATE' ? (<HTMLTemplateElement>node).content : node.firstChild;
    while (currentChild) {
      currentChild = this.compileNode(currentChild, instructions, resources);
    }
    return node.nextSibling;
  }

  /*@internal*/
  public compileTextNode(node: Text, instructions: TargetedInstruction[]): Node  {
    const expression = this.parseInterpolation(node.wholeText);
    if (expression !== null) {
      const instruction = new TextBindingInstruction(expression);
      instructions.push(instruction);
      const marker = createMarker();
      marker.classList.add('au');
      node.parentNode.insertBefore(marker, node);
      node.textContent = ' ';
      while (node.nextSibling && node.nextSibling.nodeType === NodeType.Text) {
        node.parentNode.removeChild(node.nextSibling);
      }
    } else {
      while (node.nextSibling && node.nextSibling.nodeType === NodeType.Text) {
        node = <Text>node.nextSibling;
      }
    }
    return node.nextSibling;
  }

  /*@internal*/
  public compileAttribute(attr: Attr, node: Element, resources: IResourceDescriptions): TargetedInstruction {
    const { name, value } = attr;
    const nameLength = name.length;
    let index = 0;
    while (index < nameLength) {
      if (name.charCodeAt(++index) === Char.Dot) {
        // BindingCommand
        const targetName = name.slice(0, index);
        const commandName = name.slice(index + 1);
        const bindingType = BindingCommandLookup[commandName];
        if (bindingType !== undefined) {
          const expression = this.expressionParser.parse(value, bindingType);
          if (bindingType & BindingType.IsBinding) {
            return new BindingInstruction[bindingType & BindingType.Command](expression, targetName);
          }
          switch (bindingType) {
            case BindingType.OptionsCommand:
              return new HydrateAttributeInstruction(targetName, []); // TODO
            case BindingType.ForCommand:
              let src: ITemplateSource = {
                templateOrNode: null,
                instructions: []
              };
              // Lift the childNodes from the templateController host node
              // TODO: make this cleaner and clearer
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
              return new HydrateTemplateController(src, targetName, [
                new ToViewBindingInstruction(expression, 'items'),
                new SetPropertyInstruction('item', 'local')
              ]);
          }
        }
        const command = resources.find(BindingCommandResource, commandName);
        if (command !== undefined) {
          const expression = this.expressionParser.parse(value, BindingType.CustomCommand);
          // TODO: implement behavior (this is just a temporary placeholder)
          return new ToViewBindingInstruction(expression, targetName);
        }
        // TODO: should we drop down and see if there's an interpolation?
        return null;
      }
    }
    const bindingType = BindingTargetLookup[name];
    if (bindingType !== undefined) {
      const expression = this.expressionParser.parse(value, bindingType);
      switch (bindingType) {
        case BindingType.IsRef:
          return new RefBindingInstruction(expression);
      }
    }
    const attribute = resources.find(CustomAttributeResource, name);
    if (attribute !== undefined) {
      // CustomAttribute
      // TODO: properly parse semicolon-separated bindings
      const expression = this.expressionParser.parse(value, BindingType.IsCustom);
      return new HydrateAttributeInstruction(name, []);
    }

    const expression = this.parseInterpolation(value);
    if (expression !== null) {
      return new ToViewBindingInstruction(expression, name);
    }
    return null;
  }

  private parseInterpolation(value: string): Interpolation | null {
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
    // nothing bindable could be parsed, return null
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
  constructor(srcOrExpr: string | IExpression) {
    this.srcOrExpr = srcOrExpr;
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
