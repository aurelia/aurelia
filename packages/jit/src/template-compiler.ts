import { inject, PLATFORM } from '@aurelia/kernel';
import {
  BindingMode,
  BindingType,
  IExpressionParser,
  ILetBindingInstruction,
  IResourceDescriptions,
  ITemplateCompiler,
  ITemplateDefinition,
  TargetedInstruction,
  TargetedInstructionType,
  TemplateDefinition,
  ViewCompileFlags
} from '@aurelia/runtime';
import { IAttributeParser } from './attribute-parser';
import {  IElementParser, NodeType } from './element-parser';
import {
  FromViewBindingInstruction,
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateTemplateController,
  InterpolationInstruction,
  LetBindingInstruction,
  LetElementInstruction,
  OneTimeBindingInstruction,
  RefBindingInstruction,
  SetAttributeInstruction,
  SetPropertyInstruction,
  TextBindingInstruction,
  ToViewBindingInstruction,
  TwoWayBindingInstruction
} from './instructions';
import { AttributeSymbol, ElementSymbol, IAttributeSymbol, SemanticModel } from './semantic-model';

@inject(IExpressionParser, IElementParser, IAttributeParser)
export class TemplateCompiler implements ITemplateCompiler {
  public exprParser: IExpressionParser;
  public elParser: IElementParser;
  public attrParser: IAttributeParser;

  public get name(): string {
    return 'default';
  }

  constructor(exprParser: IExpressionParser, elParser: IElementParser, attrParser: IAttributeParser) {
    this.exprParser = exprParser;
    this.elParser = elParser;
    this.attrParser = attrParser;
  }

  public compile(definition: ITemplateDefinition, resources: IResourceDescriptions, flags?: ViewCompileFlags): TemplateDefinition {
    const model = SemanticModel.create(definition, resources, this.attrParser, this.elParser, this.exprParser);
    const root = model.root;
    let $el = root.isTemplate ? root.$content : root;
    while ($el = this.compileNode($el));

    // the flag should be passed correctly from rendering engine
    if (root.isTemplate && (flags & ViewCompileFlags.surrogate)) {
      this.compileSurrogate(root);
    }

    return <TemplateDefinition>definition;
  }

  private compileNode($el: ElementSymbol): ElementSymbol {
    const node = $el.node;
    const nextSibling = $el.nextSibling;
    switch (node.nodeType) {
      case NodeType.Element:
        if ($el.isSlot) {
          $el.$root.definition.hasSlots = true;
        } else if ($el.isLet) {
          this.compileLetElement($el);
        } else if ($el.isCustomElement) {
          this.compileCustomElement($el);
        } else {
          this.compileElementNode($el);
        }
        if (!$el.isLifted) {
          let $child = $el.firstChild || $el.$content;
          while ($child) {
            $child = this.compileNode($child);
          }
        }
        return nextSibling;
      case NodeType.Text:
        const expression = this.exprParser.parse((<Text>$el.node).wholeText, BindingType.Interpolation);
        if (expression === null) {
          while (($el = $el.nextSibling) && $el.node.nodeType === NodeType.Text);
          return $el;
        }
        $el.replaceTextNodeWithMarker();
        $el.addInstructions([new TextBindingInstruction(expression)]);
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

  private compileSurrogate($el: ElementSymbol): void {
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

  private compileElementNode($el: ElementSymbol): void {
    if ($el.$attributes.length === 0) {
      return;
    }
    const attributes = $el.$attributes;
    const attributeInstructions: TargetedInstruction[] = [];
    for (let i = 0, ii = attributes.length; i < ii; ++i) {
      const $attr = attributes[i];
      if ($attr.isProcessed) continue;
      $attr.markAsProcessed();
      if ($attr.isTemplateController) {
        let instruction = this.compileAttribute($attr);
        // compileAttribute will return a HydrateTemplateController if there is a binding command registered that produces one (in our case only "for")
        if (instruction.type !== TargetedInstructionType.hydrateTemplateController) {
          const name = $attr.res;
          instruction = new HydrateTemplateController({ name, instructions: [] }, name, [instruction], name === 'else');
        }
        // all attribute instructions preceding the template controller become children of the hydrate instruction
        instruction.instructions.push(...attributeInstructions);
        this.compileNode($el.lift(instruction));
        return;
      } else if ($attr.isCustomAttribute) {
        attributeInstructions.push(this.compileCustomAttribute($attr));
      } else {
        const instruction = this.compileAttribute($attr);
        if (instruction !== null) {
          attributeInstructions.push(instruction);
        }
      }
    }
    if (attributeInstructions.length) {
      $el.addInstructions(attributeInstructions);
      $el.makeTarget();
    }
  }

  private compileCustomElement($el: ElementSymbol): void {
    if ($el.$attributes.length === 0) {
      $el.addInstructions([new HydrateElementInstruction($el.definition.name, <TargetedInstruction[]>PLATFORM.emptyArray)]);
      if ($el.definition.containerless) {
        $el.replaceNodeWithMarker();
      } else {
        $el.makeTarget();
      }
      return;
    }
    const attributeInstructions: TargetedInstruction[] = [];
    // if there is a custom element, then only the attributes that map to bindables become children of the hydrate instruction,
    // otherwise they become sibling instructions; if there is no custom element, then sibling instructions are never appended to
    const siblingInstructions: TargetedInstruction[] = [];
    const attributes = $el.$attributes;
    for (let i = 0, ii = attributes.length; i < ii; ++i) {
      const $attr = attributes[i];
      if ($attr.isProcessed) continue;
      $attr.markAsProcessed();
      if ($attr.isTemplateController) {
        let instruction = this.compileAttribute($attr);
        // compileAttribute will return a HydrateTemplateController if there is a binding command registered that produces one (in our case only "for")
        if (instruction.type !== TargetedInstructionType.hydrateTemplateController) {
          const name = $attr.res;
          instruction = new HydrateTemplateController({ name, instructions: [] }, name, [instruction], name === 'else');
        }
        // all attribute instructions preceding the template controller become children of the hydrate instruction
        instruction.instructions.push(...attributeInstructions);
        this.compileNode($el.lift(instruction));
        return;
      } else if ($attr.isCustomAttribute) {
        if ($attr.isAttributeBindable) {
          siblingInstructions.push(this.compileCustomAttribute($attr));
        } else {
          attributeInstructions.push(this.compileCustomAttribute($attr));
        }
      } else {
        const instruction = this.compileAttribute($attr);
        if (instruction !== null) {
          if (!$attr.isElementBindable) {
            siblingInstructions.push(instruction);
          } else {
            attributeInstructions.push(instruction);
          }
        }
      }
    }
    $el.addInstructions([new HydrateElementInstruction($el.definition.name, attributeInstructions), ...siblingInstructions]);
    if ($el.definition.containerless) {
      $el.replaceNodeWithMarker();
    } else {
      $el.makeTarget();
    }
  }

  private compileCustomAttribute($attr: AttributeSymbol): HydrateAttributeInstruction {
    const childInstructions = [];
    if ($attr.isMultiAttrBinding) {
      const mBindings = $attr.$multiAttrBindings;
      for (let j = 0, jj = mBindings.length; j < jj; ++j) {
        childInstructions.push(this.compileAttribute(mBindings[j]));
      }
    } else {
      childInstructions.push(this.compileAttribute($attr));
    }
    return new HydrateAttributeInstruction($attr.res, childInstructions);
  }

  private compileLetElement($el: ElementSymbol): void {
    const letInstructions: ILetBindingInstruction[] = [];
    const attributes = $el.$attributes;
    let toViewModel = false;
    for (let i = 0, ii = attributes.length; ii > i; ++i) {
      const $attr = attributes[i];
      const to = PLATFORM.camelCase($attr.to);
      if ($attr.hasBindingCommand) {
        const expr = this.exprParser.parse($attr.rawValue, BindingType.BindCommand);
        letInstructions.push(new LetBindingInstruction(expr, to));
      } else if ($attr.rawName === 'to-view-model') {
        toViewModel = true;
        (<Element>$el.node).removeAttribute('to-view-model');
      } else {
        const expr = this.exprParser.parse($attr.rawValue, BindingType.Interpolation);
        if (expr === null) {
          // Should just be a warning, but throw for now
          throw new Error(`Invalid let binding. String liternal given for attribute: ${$attr.to}`);
        }
        letInstructions.push(new LetBindingInstruction(expr, to));
      }
    }
    $el.addInstructions([new LetElementInstruction(letInstructions, toViewModel)]);
    // theoretically there's no need to replace, but to keep it consistent
    $el.replaceNodeWithMarker();
  }

  private compileAttribute($attr: IAttributeSymbol): TargetedInstruction {
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
        if (!$attr.hasBindingCommand) {
          const expression = parser.parse($attr.rawValue, BindingType.Interpolation);
          if (expression !== null) {
            return new InterpolationInstruction(expression, $attr.to);
          }
          if ($attr.isMultiAttrBinding) {
            return new SetPropertyInstruction($attr.rawValue, $attr.to);
          }
        }
        // intentional nested block without a statement to ensure the expression variable isn't shadowed
        // (we're not declaring it at the outer block for better typing without explicit casting)
        {
          const expression = parser.parse($attr.rawValue, BindingType.ToViewCommand);
          switch ($attr.mode) {
            case BindingMode.oneTime:
              return new OneTimeBindingInstruction(expression, $attr.to);
            case BindingMode.fromView:
              return new FromViewBindingInstruction(expression, $attr.to);
            case BindingMode.twoWay:
              return new TwoWayBindingInstruction(expression, $attr.to);
            case BindingMode.toView:
            default:
              return new ToViewBindingInstruction(expression, $attr.to);
          }
        }
      }
      // plain attribute on a custom element
      if ($attr.onCustomElement) {
        // bindable attribute
        if ($attr.isElementBindable) {
          const expression = parser.parse($attr.rawValue, BindingType.Interpolation);
          if (expression === null) {
            // no interpolation -> make it a setProperty on the component
            return new SetPropertyInstruction($attr.rawValue, $attr.to);
          }
          // interpolation -> behave like toView (e.g. foo="${someProp}")
          return new InterpolationInstruction(expression, $attr.to);
        }
      }
      {
        // plain attribute on a normal element
        const expression = parser.parse($attr.rawValue, BindingType.Interpolation);
        if (expression === null) {
          // no interpolation -> do not return an instruction
          return null;
        }
        // interpolation -> behave like toView (e.g. id="${someId}")
        return new InterpolationInstruction(expression, $attr.to);
      }
  }
}
