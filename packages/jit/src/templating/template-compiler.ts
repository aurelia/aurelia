import { inject, PLATFORM } from '@aurelia/kernel';
import {
  BindingMode,
  BindingType,
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

  TargetedInstruction,
  TargetedInstructionType,
  TemplateDefinition,
  ViewCompileFlags,
} from '@aurelia/runtime';
import { IAttributeParser } from './attribute-parser';
import { IElementParser, NodeType } from './element-parser';
import { ElementSymbol, IAttributeSymbol, SemanticModel } from './semantic-model';

// tslint:disable:no-inner-html

const marker = DOM.createElement('au-marker') as Element;
marker.classList.add('au');
const createMarker: () => HTMLElement = marker.cloneNode.bind(marker, false);

@inject(IExpressionParser, IElementParser, IAttributeParser)
export class TemplateCompiler implements ITemplateCompiler {
  public get name(): string {
    return 'default';
  }

  constructor(public exprParser: IExpressionParser, public elParser: IElementParser, public attrParser: IAttributeParser) { }

  public compile(definition: ITemplateSource, resources: IResourceDescriptions, flags?: ViewCompileFlags): TemplateDefinition {
    let $el = new SemanticModel(this.attrParser, this.elParser.parse(definition.templateOrNode), resources).getElementSymbolRoot(definition);
    const $root = $el;
    while ($el = this.compileNode($el.$content || $el));

    // ideally the flag should be passed correctly from rendering engine
    if ($root.isTemplate && (flags & ViewCompileFlags.surrogate)) {
      this.compileSurrogate($root);
    }

    return <TemplateDefinition>definition;
  }

  /*@internal*/
  public compileNode($el: ElementSymbol): ElementSymbol {
    const node = $el.node;
    const nextSibling = $el.nextSibling;
    switch (node.nodeType) {
      case NodeType.Element:
        this.compileElementNode($el);
        return nextSibling;
      case NodeType.Text:
        if (!this.compileTextNode($el)) {
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

  /*@internal*/
  public compileSurrogate($el: ElementSymbol): void {
    const attributes = $el.$attributes;
    for (let i = 0, ii = attributes.length; i < ii; ++i) {
      const $attr = attributes[i];
      if ($attr.isTemplateController) {
        throw new Error('Cannot have template controller on surrogate element.');
      }
      const instruction = this.compileAttribute($attr);
      if (instruction !== null) {
        $el.definition.surrogates.push(instruction);
      } else {
        let attrInst: TargetedInstruction;
        // Doesn't make sense for these properties as they need to be unique
        const name = $attr.target;
        if (name !== 'id' && name !== 'part' && name !== 'replace-part') {
          switch (name) {
            // TODO: handle simple surrogate style attribute
            case 'style':
              attrInst = new SetAttributeInstruction($attr.rawValue, name);
              break;
            default:
              attrInst = new SetAttributeInstruction($attr.rawValue, name);
          }
          $el.definition.surrogates.push(attrInst);
        } else {
          throw new Error(`Invalid surrogate attribute: ${name}`);
        }
      }
    }
  }

  /*@internal*/
  public compileElementNode($el: ElementSymbol): void {
    if ($el.isSlot) {
      $el.$parent.definition.hasSlots = true;
      return;
    } else if ($el.isLet) {
      this.compileLetElement($el);
      return;
    }
    // if there is a template controller, then all attribute instructions become children of the hydrate instruction

    // if there is a custom element, then only the attributes that map to bindables become children of the hydrate instruction,
    // otherwise they become sibling instructions
    const attributeInstructions: TargetedInstruction[] = [];
    const siblingInstructions: TargetedInstruction[] = [];
    const attributes = $el.$attributes;
    for (let i = 0, ii = attributes.length; i < ii; ++i) {
      const $attr = attributes[i];
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
              templateOrNode: $attr.$element.node,
              instructions: []
            };
            instruction = new HydrateTemplateController(src, $attr.res, [instruction], $attr.res === 'else');
          }

          ($attr.$element.node.parentNode || $attr.$element.$parent.node).replaceChild(createMarker(), $attr.$element.node);
          const template = DOM.createTemplate() as HTMLTemplateElement;
          template.content.appendChild($attr.$element.node);
          instruction.src.templateOrNode = template;
          instruction.instructions.push(...attributeInstructions);
          this.compile(<any>instruction.src, $el.semanticModel.resources);
          $el.addInstructions([instruction]);
          return;
        } else {
          const childInstructions = [];
          if ($attr.isMultiAttrBinding) {
            const mBindings = $attr.$multiAttrBindings;
            for (let j = 0, jj = mBindings.length; j < jj; ++j) {
              childInstructions.push(this.compileAttribute(mBindings[j]));
            }
          } else {
            childInstructions.push(this.compileAttribute($attr));
          }
          if (!$attr.onCustomElement || !$attr.isAttributeBindable) {
            attributeInstructions.push(new HydrateAttributeInstruction($attr.res, childInstructions));
          } else {
            siblingInstructions.push(new HydrateAttributeInstruction($attr.res, childInstructions));
          }
        }
      } else {
        const instruction = this.compileAttribute($attr);
        if (instruction !== null) {
          if (!$attr.onCustomElement || $attr.isElementBindable) {
            attributeInstructions.push(instruction);
          } else {
            siblingInstructions.push(instruction);
          }
        }
      }
    }
    // no template controller; see if there's a custom element
    if ($el.isCustomElement) {
      // custom element takes the attributes as children
      $el.addInstructions([new HydrateElementInstruction($el.definition.name, attributeInstructions), ...siblingInstructions]);
      $el.makeTarget();
    } else if (attributeInstructions.length) {
      // no custom element or template controller, add the attributes directly
      $el.addInstructions(attributeInstructions);
      $el.makeTarget();
    }
    for (let $child = $el.firstChild; !!$child; $child = this.compileNode($child));
  }

  public compileLetElement($el: ElementSymbol): void {
    const letInstructions: ILetBindingInstruction[] = [];
    const attributes = $el.$attributes;
    let toViewModel = false;
    for (let i = 0, ii = attributes.length; ii > i; ++i) {
      const $attr = attributes[i];
      const dest = PLATFORM.camelCase($attr.dest);
      if ($attr.hasBindingCommand) {
        const expr = this.exprParser.parse($attr.rawValue, BindingType.BindCommand);
        letInstructions.push(new LetBindingInstruction(expr, dest));
      } else if ($attr.rawName === 'to-view-model') {
        toViewModel = true;
        (<Element>$el.node).removeAttribute('to-view-model');
      } else {
        const expr = this.exprParser.parse($attr.rawValue, BindingType.Interpolation);
        if (expr === null) {
          // Should just be a warning, but throw for now
          throw new Error(`Invalid let binding. String liternal given for attribute: ${$attr.dest}`);
        }
        letInstructions.push(new LetBindingInstruction(expr, dest));
      }
    }
    $el.addInstructions([new LetElementInstruction(letInstructions, toViewModel)]);
    // theoretically there's no need to replace, but to keep it consistent
    DOM.replaceNode(createMarker(), $el.node);
  }

  /*@internal*/
  public compileTextNode($el: ElementSymbol): boolean {
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
    $el.addInstructions([new TextBindingInstruction(expression)]);
    return true;
  }

  /*@internal*/
  public compileAttribute($attr: IAttributeSymbol): TargetedInstruction {
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
          return new ToViewBindingInstruction(expression, $attr.dest);
        }
        if (!$attr.hasBindingCommand && $attr.isMultiAttrBinding) {
          return new SetPropertyInstruction($attr.rawValue, $attr.dest);
        }
        expression = parser.parse($attr.rawValue, BindingType.ToViewCommand);
        switch ($attr.mode) {
          case BindingMode.oneTime:
            return new OneTimeBindingInstruction(expression, $attr.dest);
          case BindingMode.fromView:
            return new FromViewBindingInstruction(expression, $attr.dest);
          case BindingMode.twoWay:
            return new TwoWayBindingInstruction(expression, $attr.dest);
          case BindingMode.toView:
          default:
            return new ToViewBindingInstruction(expression, $attr.dest);
        }
      }
      // plain attribute on a custom element
      if ($attr.onCustomElement) {
        // bindable attribute
        if ($attr.isElementBindable) {
          const expression = parser.parse($attr.rawValue, BindingType.Interpolation);
          if (expression === null) {
            // no interpolation -> make it a setProperty on the component
            return new SetPropertyInstruction($attr.rawValue, $attr.dest);
          }
          // interpolation -> behave like toView (e.g. foo="${someProp}")
          return new ToViewBindingInstruction(expression, $attr.dest);
        }
      }
      // plain attribute on a normal element
      const expression = parser.parse($attr.rawValue, BindingType.Interpolation);
      if (expression === null) {
        // no interpolation -> do not return an instruction
        return null;
      }
      // interpolation -> behave like toView (e.g. id="${someId}")
      return new ToViewBindingInstruction(expression, $attr.dest);
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
