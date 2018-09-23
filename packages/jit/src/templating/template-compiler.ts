import { SemanticModel, ElementSymbol, AttributeSymbol } from './semantic-model';
import { inject, PLATFORM } from '@aurelia/kernel';
import {
  AttributeDefinition,
  BindingMode,
  BindingType,
  CustomAttributeResource,
  CustomElementResource,
  DelegationStrategy,
  DOM,
  ElementDefinition,
  IBindableDescription,
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

  TargetedInstruction,
  TargetedInstructionType,
  TemplateDefinition,
  ViewCompileFlags,
} from '@aurelia/runtime';
import { AttrSyntax, IAttributeParser } from './attribute-parser';
import { BindingCommandResource, IBindingCommand } from './binding-command';
import { IElementParser } from './element-parser';

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

@inject(IExpressionParser, IAttributeParser, IElementParser)
export class TemplateCompiler implements ITemplateCompiler {
  public get name(): string {
    return 'default';
  }

  constructor(
    private exprParser: IExpressionParser,
    private attrParser: IAttributeParser,
    private elParser: IElementParser) { }

  public compile(definition: Required<ITemplateSource>, resources: IResourceDescriptions, flags?: ViewCompileFlags): TemplateDefinition {
    const $symbol = new SemanticModel(this.elParser.parse(definition.templateOrNode), resources).getElementSymbolRoot(definition);
    definition.templateOrNode = $symbol.node;
    return this.compileCore($symbol, definition, flags);
  }

  public compileCore($symbol: ElementSymbol, definition: Required<ITemplateSource>, flags?: ViewCompileFlags): TemplateDefinition {
    let node = <Node>definition.templateOrNode;

   // const rootNode = <Element>node;
    const isTemplate = node.nodeName === 'TEMPLATE';

    // Parent node is required for remove / replace operation incase node is the direct child of document fragment
    const parentNode = node = isTemplate ? (<HTMLTemplateElement>node).content : node;

    while ($symbol = this.compileNode($symbol, definition.instructions));

    // // ideally the flag should be passed correctly from rendering engine
    // if (isTemplate && (flags & ViewCompileFlags.surrogate)) {
    //   this.compileSurrogate($symbol, rootNode, definition.surrogates);
    // }
    return definition;
  }

  /*@internal*/
  public compileNode(
    $el: ElementSymbol,
    instructions: TargetedInstruction[][]
  ): ElementSymbol {
    const node = $el.node;
    const nextSibling = $el.nextSibling;
    switch (node.nodeType) {
      case NodeType.Element:
        this.compileElementNode($el, instructions);
        return nextSibling;
      case NodeType.Text:
        if (!this.compileTextNode($el, instructions)) {
          while (($el = $el.nextSibling) && $el.node.nodeType === NodeType.Text);
          return $el;
        }
        return nextSibling;
      case NodeType.Comment:
        return nextSibling;
      case NodeType.Document:
        return $el.firstChild;
      case NodeType.DocumentType:
        return nextSibling;
      case NodeType.DocumentFragment:
        return $el.firstChild;
    }
  }

  // /*@internal*/
  // public compileSurrogate(
  //   $symbol: ElementSymbol,
  //   node: Element,
  //   surrogateInstructions: TargetedInstruction[]
  // ): void {
  //   const attributes = node.attributes;
  //   for (let i = 0, ii = attributes.length; i < ii; ++i) {
  //     const attr = attributes.item(i);
  //     const { name, value } = attr;
  //     const { target, attribute, command } = inspectAttribute(this.attrParser.parse(name, value));
  //     if (attribute && attribute.isTemplateController) {
  //       throw new Error('Cannot have template controller on surrogate element.');
  //     }
  //     const instruction = this.compileAttribute($symbol, target, value, node, attribute, null, command, false);
  //     if (instruction !== null) {
  //       surrogateInstructions.push(instruction);
  //     } else {
  //       let attrInst: TargetedInstruction;
  //       // Doesn't make sense for these properties as they need to be unique
  //       if (name !== 'id' && name !== 'part' && name !== 'replace-part') {
  //         switch (name) {
  //           // TODO: handle simple surrogate style attribute
  //           case 'style':
  //             attrInst = new SetAttributeInstruction(value, name);
  //             break;
  //           default:
  //             attrInst = new SetAttributeInstruction(value, name);
  //         }
  //         surrogateInstructions.push(attrInst);
  //       } else {
  //         throw new Error(`Invalid surrogate attribute: ${name}`);
  //       }
  //     }
  //   }
  // }

  /*@internal*/
  public compileElementNode(
    $el: ElementSymbol,
    instructions: TargetedInstruction[][]
  ): void {

    // if (tagName === 'SLOT') {
    //   definition.hasSlots = true;
    //   return;
    // } else if (tagName === 'LET') {
    //   const letElementInstruction = this.compileLetElement($symbol, node);
    //   instructions.push([letElementInstruction]);
    //   // theoretically there's no need to replace, but to keep it consistent
    //   DOM.replaceNode(createMarker(), node);
    //   return;
    // }
    // if there is a template controller, then all attribute instructions become children of the hydrate instruction

    // if there is a custom element, then only the attributes that map to bindables become children of the hydrate instruction,
    // otherwise they become sibling instructions
    const attributeInstructions: TargetedInstruction[] = [];
    const siblingInstructions: TargetedInstruction[] = [];
    //const tagResourceKey = (node.getAttribute('as-element') || tagName).toLowerCase();
    const attributes = $el.attributes;
    //const element = resources.find(CustomElementResource, tagResourceKey);
    //const attributes = node.attributes;
    for (let i = 0, ii = attributes.length; i < ii; ++i) {
      const $attr = attributes[i];
      // const { name, value } = attr;
      // if (name === 'as-element') {
      //   continue;
      // }
      //const { target, attribute, command } = inspectAttribute(this.attrParser.parse(name, value));

      if ($attr.isProcessed) {
        continue;
      }
      $attr.markAsProcessed();
      if ($attr.isCustomAttribute) {
        if ($attr.isTemplateController) {
          let instruction = this.compileAttribute($attr);
          // compileAttribute will return a HydrateTemplateController if there is a binding command registered that produces one (in our case only "for")
          if (instruction.type !== TargetedInstructionType.hydrateTemplateController) {
            const src: ITemplateSource = {
              name: $attr.res,
              templateOrNode: $attr.element.node,
              instructions: []
            };
            instruction = new HydrateTemplateController(src, $attr.res, [instruction], $attr.res === 'else');
          }

          ($attr.element.node.parentNode || $attr.element.parent.node).replaceChild(createMarker(), $attr.element.node);
          const template = DOM.createTemplate() as HTMLTemplateElement;
          template.content.appendChild($attr.element.node);
          instruction.src.templateOrNode = template;
          instruction.instructions.push(...attributeInstructions);
          this.compileCore($el, <Required<ITemplateSource>>instruction.src);
          instructions.push([instruction]);
          return;
        } else {
          const childInstructions = [];
          if ($attr.isMultiAttrBinding) {
            // TODO
            // const bindings = attr.rawValue.split(';');
            // for (let i = 0, ii = bindings.length; i < ii; ++i) {
            //   const binding = bindings[i].trim();
            //   if (binding.length === 0) continue;
            //   const parts = binding.split(':');
            //   const inspected = inspectAttribute(this.attrParser.parse(parts[0].trim(), value));
            //   childInstructions.push(this.compileAttribute($symbol, inspected.target, parts[1].trim(), node, attribute, element, inspected.command, true));
            // }
          } else {
            childInstructions.push(this.compileAttribute($attr));
          }
          if ($attr.isAttributeBindable) {
            attributeInstructions.push(new HydrateAttributeInstruction($attr.res, childInstructions));
          } else {
            siblingInstructions.push(new HydrateAttributeInstruction($attr.res, childInstructions));
          }
        }
      } else {
        const instruction = this.compileAttribute($attr);
        if (instruction !== null) {
          if ($attr.isElementBindable) {
            attributeInstructions.push(instruction);
          } else {
            siblingInstructions.push(instruction);
          }
        }
      }
    }
    // no template controller; see if there's a custom element
    const node = $el.node as Element;
    if ($el.isCustomElement) {
      // custom element takes the attributes as children
      instructions.push([new HydrateElementInstruction($el.resourceKey, attributeInstructions), ...siblingInstructions]);
      $el.makeTarget();
    } else if (attributeInstructions.length) {
      // no custom element or template controller, add the attributes directly
      instructions.push(attributeInstructions);
      $el.makeTarget();
    }
    for (let $child = $el.firstChild; !!$child; $child = this.compileNode($child, instructions));
    // const current = node;
    // let currentChild = node.firstChild;
    // while (currentChild) {
    //   currentChild = this.compileNode($symbol, currentChild, current, definition, instructions);
    // }
  }

  // public compileLetElement(
  //   $symbol: ElementSymbol,
  //   node: Element
  //   ): ILetElementInstruction {
  //   const letInstructions: ILetBindingInstruction[] = [];
  //   const attributes = node.attributes;
  //   // ToViewModel flag needs to be determined in advance
  //   // before compiling any attribute
  //   const toViewModel = node.hasAttribute('to-view-model');
  //   node.removeAttribute('to-view-model');
  //   for (let i = 0, ii = attributes.length; ii > i; ++i) {
  //     const attr = attributes.item(i);
  //     const { name, value } = attr;
  //     // tslint:disable-next-line:prefer-const
  //     let { target, command } = inspectAttribute(this.attrParser.parse(name, value));
  //     target = PLATFORM.camelCase(target);
  //     let letInstruction: LetBindingInstruction;

  //     if (!command) {
  //       const expression = this.exprParser.parse(value, BindingType.Interpolation);
  //       if (expression === null) {
  //         // Should just be a warning, but throw for now
  //         throw new Error(`Invalid let binding. String liternal given for attribute: ${target}`);
  //       }
  //       letInstruction = new LetBindingInstruction(expression, target);
  //     } else if (command === null) {
  //       // TODO: this does work well with no built in command spirit
  //       throw new Error('Only bind command supported for "let" element.');
  //     } else {
  //       letInstruction = new LetBindingInstruction(value, target);
  //     }
  //     letInstructions.push(letInstruction);
  //   }
  //   return new LetElementInstruction(letInstructions, toViewModel);
  // }

  /*@internal*/
  public compileTextNode(
    $el: ElementSymbol,
    instructions: TargetedInstruction[][]
    ): boolean {
    const node = $el.node as Text;
    const expression = this.exprParser.parse(node.wholeText, BindingType.Interpolation);
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
  public compileAttribute($attr: AttributeSymbol): TargetedInstruction {
      // binding commands get priority over all; they may override default behaviors
      // it is the responsibility of the implementor to ensure they filter out stuff they shouldn't override
      if ($attr.isHandledByBindingCommand) {
        return $attr.command.compile($attr);
      }
      // simple path for ref binding
      const parser = this.exprParser;
      if ($attr.target === 'ref') {
        return new RefBindingInstruction(parser.parse($attr.rawValue, BindingType.IsRef));
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
      if ($attr.isCustomAttribute) {
        let expression = parser.parse($attr.rawValue, BindingType.Interpolation);
        if (expression !== null) {
          return new ToViewBindingInstruction(expression, $attr.target);
        }
        if (!$attr.hasBindingCommand && $attr.isAttributeBindable && $attr.isMultiAttrBinding) {
          return new SetPropertyInstruction($attr.rawValue, $attr.target);
        }
        expression = parser.parse($attr.rawValue, BindingType.ToViewCommand);
        switch ($attr.mode) {
          case BindingMode.oneTime:
            return new OneTimeBindingInstruction(expression, $attr.target);
          case BindingMode.fromView:
            return new FromViewBindingInstruction(expression, $attr.target);
          case BindingMode.twoWay:
            return new TwoWayBindingInstruction(expression, $attr.target);
          case BindingMode.toView:
          default:
            return new ToViewBindingInstruction(expression, $attr.target);
        }
      }
      // plain attribute on a custom element
      if ($attr.onCustomElement) {
        // bindable attribute
        if ($attr.isAttributeBindable) {
          const expression = parser.parse($attr.rawValue, BindingType.Interpolation);
          if (expression === null) {
            // no interpolation -> make it a setProperty on the component
            return new SetPropertyInstruction($attr.rawValue, $attr.target);
          }
          // interpolation -> behave like toView (e.g. foo="${someProp}")
          return new ToViewBindingInstruction(expression, $attr.target);
        }
      }
      // plain attribute on a normal element
      const expression = parser.parse($attr.rawValue, BindingType.Interpolation);
      if (expression === null) {
        // no interpolation -> do not return an instruction
        return null;
      }
      // interpolation -> behave like toView (e.g. id="${someId}")
      return new ToViewBindingInstruction(expression, $attr.target);
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
