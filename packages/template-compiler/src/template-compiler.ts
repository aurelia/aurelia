/* eslint-disable max-lines-per-function */
/* eslint-disable function-call-argument-newline */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import {
  emptyArray,
  toArray,
  ILogger,
  camelCase,
  noop,
  getResourceKeyFor,
  allResources,
  IPlatform,
  pascalCase,
  createImplementationRegister,
  registrableMetadataKey,
  isString,
} from '@aurelia/kernel';
import {
  IExpressionParser,
  PrimitiveLiteralExpression,
  createPrimitiveLiteralExpression,
} from '@aurelia/expression-parser';
import { IAttrMapper } from './attribute-mapper';
import { ITemplateElementFactory } from './template-element-factory';
import {
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  HydrateLetElementInstruction,
  HydrateTemplateController,
  InterpolationInstruction,
  LetBindingInstruction,
  SetAttributeInstruction,
  SetClassAttributeInstruction,
  SetPropertyInstruction,
  SetStyleAttributeInstruction,
  TextBindingInstruction,
  PropertyBindingInstruction,
  SpreadElementPropBindingInstruction,
  propertyBinding,
  IInstruction,
  SpreadTransferedBindingInstruction,
  SpreadValueBindingInstruction,
} from './instructions';
import { AttrSyntax, IAttributeParser } from './attribute-pattern';
import { BindingCommand, BindingCommandInstance, ICommandBuildInfo } from './binding-command';
import { etInterpolation, etIsProperty, tcObjectFreeze, tcCreateInterface, singletonRegistration, definitionTypeElement } from './utilities';
import { auLocationStart, auLocationEnd, appendManyToTemplate, appendToTemplate, insertBefore, insertManyBefore, isElement, isTextNode } from './utilities-dom';

import type {
  IContainer,
  Constructable,
  Writable,
  Key,
  IRegistry,
} from '@aurelia/kernel';
import type {
  AnyBindingExpression,
  IsBindingBehavior,
} from '@aurelia/expression-parser';
import type {
  IAttributeComponentDefinition,
  ICompiledElementComponentDefinition,
  IComponentBindablePropDefinition,
  IDomPlatform,
  IElementComponentDefinition,
  StringBindingMode,
} from './interfaces-template-compiler';
import { ErrorNames, createMappedError } from './errors';
import { ITemplateCompiler } from './interfaces-template-compiler';

const auslotAttr = 'au-slot';
const defaultSlotName = 'default';
export const generateElementName = ((id) => () => `anonymous-${++id}`)(0);

/**
 * Result of classifying all attributes on an element.
 * Groups attributes into their semantic categories for instruction generation.
 */
interface IAttrClassificationResult {
  /** Instructions for template controllers (if, repeat, etc.) */
  tcInstructions: HydrateTemplateController[] | undefined;
  /** Instructions for custom attributes */
  attrInstructions: HydrateAttributeInstruction[] | undefined;
  /** Instructions for custom element bindable properties */
  elBindableInstructions: IInstruction[] | undefined;
  /** Instructions for plain attribute bindings/interpolations */
  plainAttrInstructions: IInstruction[] | undefined;
  /** Whether the element has the containerless attribute */
  hasContainerless: boolean;
}

export class TemplateCompiler implements ITemplateCompiler {
  public static register = /*@__PURE__*/ createImplementationRegister(ITemplateCompiler);

  public debug: boolean = false;
  public resolveResources: boolean = true;

  public compile(
    definition: IElementComponentDefinition,
    container: IContainer,
  ): ICompiledElementComponentDefinition {
    if (definition.template == null || definition.needsCompile === false) {
      return definition as ICompiledElementComponentDefinition;
    }

    const context = new CompilationContext(definition, container, null, null, void 0);
    const template = isString(definition.template) || !definition.enhance
      ? context._templateFactory.createTemplate(definition.template)
      : definition.template as HTMLElement;
    const isTemplateElement = template.nodeName === TEMPLATE_NODE_NAME && (template as HTMLTemplateElement).content != null;
    const content = isTemplateElement ? (template as HTMLTemplateElement).content : template;
    const hooks = TemplateCompilerHooks.findAll(container);
    const ii = hooks.length;
    let i = 0;
    if (ii > 0) {
      while (ii > i) {
        hooks[i].compiling?.(template);
        ++i;
      }
    }

    if (template.hasAttribute(localTemplateIdentifier)) {
      throw createMappedError(ErrorNames.compiler_root_is_local, definition);
    }
    this._compileLocalElement(content, context);
    this._compileNode(content, context);

    const compiledDef = {
      ...definition,
      name: definition.name || generateElementName(),
      dependencies: (definition.dependencies ?? emptyArray).concat(context.deps ?? emptyArray),
      instructions: context.rows,
      surrogates: isTemplateElement
        ? this._compileSurrogate(template, context)
        : emptyArray,
      template,
      hasSlots: context.hasSlot,
      needsCompile: false,
    } satisfies ICompiledElementComponentDefinition;

    return compiledDef;
  }

  public compileSpread(
    requestor: IElementComponentDefinition,
    attrSyntaxs: AttrSyntax[],
    container: IContainer,
    target: Element,
    targetDef?: IElementComponentDefinition,
  ): IInstruction[] {
    const context = new CompilationContext(requestor, container, null, null, void 0);
    const instructions: IInstruction[] = [];
    const elDef = targetDef ?? context._findElement(target.nodeName.toLowerCase());
    const isCustomElement = elDef !== null;
    const exprParser = context._exprParser;
    const ii = attrSyntaxs.length;
    let i = 0;
    let attrSyntax: AttrSyntax;
    let attrDef: IAttributeComponentDefinition | null = null;
    let attrInstructions: (HydrateAttributeInstruction | HydrateTemplateController)[] | undefined;
    let attrBindableInstructions: IInstruction[];
    let bindablesInfo: IAttributeBindablesInfo | IElementBindablesInfo;
    let bindable: IComponentBindablePropDefinition;
    let bindingCommand: BindingCommandInstance | null = null;
    let expr: AnyBindingExpression;
    let attrTarget: string;
    let attrValue: string;

    for (; ii > i; ++i) {
      attrSyntax = attrSyntaxs[i];

      attrTarget = attrSyntax.target;
      attrValue = attrSyntax.rawValue;

      if (attrTarget === '...$attrs') {
        instructions.push(new SpreadTransferedBindingInstruction());
        continue;
      }

      bindingCommand = context._getCommand(attrSyntax);
      if (bindingCommand !== null && bindingCommand.ignoreAttr) {
        // when the binding command overrides everything
        // just pass the target as is to the binding command, and treat it as a normal attribute:
        // active.class="..."
        // background.style="..."
        // my-attr.attr="..."

        instructions.push(bindingCommand.build(
          { node: target, attr: attrSyntax, bindable: null, def: null },
          context._exprParser,
          context._attrMapper
        ));

        // to next attribute
        continue;
      }

      if (isCustomElement) {
        // if the element is a custom element
        // - prioritize bindables on a custom element before plain attributes
        bindablesInfo = context._getBindables(elDef);
        bindable = bindablesInfo.attrs[attrTarget];
        if (bindable !== void 0) {
          if (bindingCommand == null) {
            expr = exprParser.parse(attrValue, etInterpolation);
            instructions.push(
              new SpreadElementPropBindingInstruction(
                expr == null
                  ? new SetPropertyInstruction(attrValue, bindable.name)
                  : new InterpolationInstruction(expr, bindable.name)
              )
            );
          } else {
            instructions.push(new SpreadElementPropBindingInstruction(bindingCommand.build(
              { node: target, attr: attrSyntax, bindable, def: elDef },
              context._exprParser,
              context._attrMapper
            )));
          }
          continue;
        }
      }

      attrDef = context._findAttr(attrTarget);
      if (attrDef !== null) {
        if (attrDef.isTemplateController) {
          throw createMappedError(ErrorNames.no_spread_template_controller, attrTarget);
        }
        attrBindableInstructions = this._compileCustomAttributeBindables(
          target, attrDef, attrSyntax, attrValue, bindingCommand, context,
          /* treatEmptyAsNoBinding */ false
        );

        (attrInstructions ??= []).push(new HydrateAttributeInstruction(
          // todo: def/ def.Type or def.name should be configurable
          //       example: AOT/runtime can use def.Type, but there are situation
          //       where instructions need to be serialized, def.name should be used
          this.resolveResources ? attrDef : attrDef.name,
          attrDef.aliases != null && attrDef.aliases.includes(attrTarget) ? attrTarget : void 0,
          attrBindableInstructions
        ));
        continue;
      }

      if (bindingCommand == null) {
        expr = exprParser.parse(attrValue, etInterpolation);

        // reaching here means:
        // + maybe a plain attribute with interpolation
        // + maybe a plain attribute

        if (expr != null) {
          instructions.push(new InterpolationInstruction(
            expr,
            // if not a bindable, then ensure plain attribute are mapped correctly:
            // e.g: colspan -> colSpan
            //      innerhtml -> innerHTML
            //      minlength -> minLength etc...
            context._attrMapper.map(target, attrTarget) ?? camelCase(attrTarget)
          ));
        } else {
          switch (attrTarget) {
            case 'class':
              instructions.push(new SetClassAttributeInstruction(attrValue));
              break;
            case 'style':
              instructions.push(new SetStyleAttributeInstruction(attrValue));
              break;
            default:
              // if not a custom attribute + no binding command + not a bindable + not an interpolation
              // then it's just a plain attribute
              instructions.push(new SetAttributeInstruction(attrValue, attrTarget));
          }
        }
      } else {
        // reaching here means:
        // + a plain attribute with binding command
        instructions.push(bindingCommand.build(
          { node: target, attr: attrSyntax, bindable: null, def: null },
          context._exprParser,
          context._attrMapper
        ));
      }
    }

    if (attrInstructions != null) {
      return (attrInstructions as IInstruction[]).concat(instructions);
    }

    return instructions;
  }

  /** @internal */
  private _compileSurrogate(el: Element, context: CompilationContext): IInstruction[] {
    const instructions: IInstruction[] = [];
    const attrs = el.attributes;
    const exprParser = context._exprParser;
    let ii = attrs.length;
    let i = 0;
    let attr: Attr;
    let attrName: string;
    let attrValue: string;
    let attrSyntax: AttrSyntax;
    let attrDef: IAttributeComponentDefinition | null = null;
    let attrInstructions: HydrateAttributeInstruction[] | undefined;
    let attrBindableInstructions: IInstruction[];
    let bindingCommand: BindingCommandInstance | null = null;
    let expr: AnyBindingExpression;
    let realAttrTarget: string;
    let realAttrValue: string;

    for (; ii > i; ++i) {
      attr = attrs[i];
      attrName = attr.name;
      attrValue = attr.value;
      attrSyntax = context._attrParser.parse(attrName, attrValue);

      realAttrTarget = attrSyntax.target;
      realAttrValue = attrSyntax.rawValue;

      if (invalidSurrogateAttribute[realAttrTarget]) {
        throw createMappedError(ErrorNames.compiler_invalid_surrogate_attr, attrName);
      }

      bindingCommand = context._getCommand(attrSyntax);
      if (bindingCommand !== null && bindingCommand.ignoreAttr) {
        // when the binding command overrides everything
        // just pass the target as is to the binding command, and treat it as a normal attribute:
        // active.class="..."
        // background.style="..."
        // my-attr.attr="..."

        instructions.push(bindingCommand.build(
          { node: el, attr: attrSyntax, bindable: null, def: null },
          context._exprParser,
          context._attrMapper
        ));

        // to next attribute
        continue;
      }

      attrDef = context._findAttr(realAttrTarget);
      if (attrDef !== null) {
        if (attrDef.isTemplateController) {
          throw createMappedError(ErrorNames.compiler_no_tc_on_surrogate, realAttrTarget);
        }
        attrBindableInstructions = this._compileCustomAttributeBindables(
          el, attrDef, attrSyntax, realAttrValue, bindingCommand, context,
          /* treatEmptyAsNoBinding */ true
        );

        el.removeAttribute(attrName);
        --i;
        --ii;
        (attrInstructions ??= []).push(new HydrateAttributeInstruction(
          // todo: def/ def.Type or def.name should be configurable
          //       example: AOT/runtime can use def.Type, but there are situation
          //       where instructions need to be serialized, def.name should be used
          this.resolveResources ? attrDef : attrDef.name,
          attrDef.aliases != null && attrDef.aliases.includes(realAttrTarget) ? realAttrTarget : void 0,
          attrBindableInstructions
        ));
        continue;
      }

      if (bindingCommand === null) {
        expr = exprParser.parse(realAttrValue, etInterpolation);
        if (expr != null) {
          el.removeAttribute(attrName);
          --i;
          --ii;

          instructions.push(new InterpolationInstruction(
            expr,
            // if not a bindable, then ensure plain attribute are mapped correctly:
            // e.g: colspan -> colSpan
            //      innerhtml -> innerHTML
            //      minlength -> minLength etc...
            context._attrMapper.map(el, realAttrTarget) ?? camelCase(realAttrTarget)
          ));
        } else {
          switch (attrName) {
            case 'class':
              instructions.push(new SetClassAttributeInstruction(realAttrValue));
              break;
            case 'style':
              instructions.push(new SetStyleAttributeInstruction(realAttrValue));
              break;
            default:
              // if not a custom attribute + no binding command + not a bindable + not an interpolation
              // then it's just a plain attribute
              instructions.push(new SetAttributeInstruction(realAttrValue, attrName));
          }
        }
      } else {
        instructions.push(bindingCommand.build(
          { node: el, attr: attrSyntax, bindable: null, def: null },
          context._exprParser,
          context._attrMapper
        ));
      }
    }

    if (attrInstructions != null) {
      return (attrInstructions as IInstruction[]).concat(instructions);
    }

    return instructions;
  }

  // overall flow:
  // each of the method will be responsible for compiling its corresponding node type
  // and it should return the next node to be compiled
  /** @internal */
  private _compileNode(node: Node, context: CompilationContext): Node | null {
    switch (node.nodeType) {
      case 1:
        switch (node.nodeName) {
          case 'LET':
            return this._compileLet(node as Element, context);
          // ------------------------------------
          // todo: possible optimization:
          // when two conditions below are met:
          // 1. there's no attribute on au slot,
          // 2. there's no projection
          //
          // -> flatten the au-slot into children as this is just a static template
          // ------------------------------------
          // case 'AU-SLOT':
          //   return this.auSlot(node as Element, container, context);
          default:
            return this._compileElement(node as Element, context);
        }
      case 3:
        return this._compileText(node as Text, context);
      case 11: {
        let current: Node | null = (node as DocumentFragment).firstChild;
        while (current !== null) {
          current = this._compileNode(current, context);
        }
        break;
      }
    }
    return node.nextSibling;
  }

  /** @internal */
  private _compileLet(el: Element, context: CompilationContext): Node | null {
    const attrs = el.attributes;
    const ii = attrs.length;
    const letInstructions: LetBindingInstruction[] = [];
    const exprParser = context._exprParser;
    let toBindingContext = false;
    let i = 0;
    let attr: Attr;
    let attrSyntax: AttrSyntax;
    let attrName: string;
    let attrValue: string;
    let bindingCommand: BindingCommandInstance | null;
    let realAttrTarget: string;
    let realAttrValue: string;
    let expr: AnyBindingExpression;

    for (; ii > i; ++i) {
      attr = attrs[i];
      attrName = attr.name;
      attrValue = attr.value;
      if (attrName === 'to-binding-context') {
        toBindingContext = true;
        continue;
      }

      attrSyntax = context._attrParser.parse(attrName, attrValue);
      realAttrTarget = attrSyntax.target;
      realAttrValue = attrSyntax.rawValue;

      bindingCommand = context._getCommand(attrSyntax);
      if (bindingCommand !== null) {
        if (attrSyntax.command === 'bind') {
          letInstructions.push(new LetBindingInstruction(
            exprParser.parse(realAttrValue, etIsProperty),
            camelCase(realAttrTarget)
          ));
        } else {
          throw createMappedError(ErrorNames.compiler_invalid_let_command, attrSyntax);
        }
        continue;
      }

      expr = exprParser.parse(realAttrValue, etInterpolation);
      if (expr === null) {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn(
            `[DEV:aurelia] Property "${realAttrTarget}" is declared with literal string ${realAttrValue}. ` +
            `Did you mean ${realAttrTarget}.bind="${realAttrValue}"?`
          );
        }
      }

      letInstructions.push(new LetBindingInstruction(
        expr === null ? createPrimitiveLiteralExpression(realAttrValue) : expr,
        camelCase(realAttrTarget)
      ));
    }
    context.rows.push([new HydrateLetElementInstruction(letInstructions, toBindingContext)]);
    // probably no need to replace
    // as the let itself can be used as is
    // though still need to mark el as target to ensure the instruction is matched with a target
    return this._markAsTarget(el, context).nextSibling;
  }

  /** @internal */
  private _compileElement(el: Element, context: CompilationContext): Node | null {
    // Compilation flow:
    // 1. Classify all attributes into semantic categories
    // 2. Create element instruction if custom element
    // 3. Merge instructions in correct order
    // 4. Compile children (handling template controllers specially)
    // 5. Return next sibling for continued compilation

    const nextSibling = el.nextSibling;
    const elName = (el.getAttribute('as-element') ?? el.nodeName).toLowerCase();
    const elDef = context._findElement(elName);

    const isCustomElement = elDef !== null;
    const isShadowDom = isCustomElement && elDef.shadowOptions != null;
    const captures: AttrSyntax[] = elDef?.capture ? [] : emptyArray;

    // Validate slot usage
    if (elName === 'slot') {
      if (context.root.def.shadowOptions == null) {
        throw createMappedError(ErrorNames.compiler_slot_without_shadowdom, context.root.def.name);
      }
      context.root.hasSlot = true;
    }

    // Allow custom element to process its own content
    // todo: this is a bit ... powerful
    // maybe do not allow it to process its own attributes
    let processContentResult: boolean | undefined | void = true;
    let elementMetadata: Record<PropertyKey, unknown> = {};
    if (isCustomElement) {
      processContentResult = elDef.processContent?.call(elDef.Type, el as HTMLElement, context.p, elementMetadata);
    }

    // 1. Classify all attributes
    const {
      tcInstructions,
      attrInstructions,
      elBindableInstructions,
      plainAttrInstructions,
      hasContainerless,
    } = this._classifyAttributes(el, elDef, captures, context);

    // Reorder instructions for order-sensitive elements (checkbox, radio, select)
    if (this._shouldReorderAttrs(el, plainAttrInstructions) && plainAttrInstructions != null && plainAttrInstructions.length > 1) {
      this._reorder(el, plainAttrInstructions);
    }

    // 2. Create element instruction if this is a custom element
    let elementInstruction: HydrateElementInstruction | undefined;
    if (isCustomElement) {
      // todo: def/ def.Type or def.name should be configurable
      //       example: AOT/runtime can use def.Type, but there are situations
      //       where instructions need to be serialized, def.name should be used
      elementInstruction = new HydrateElementInstruction(
        this.resolveResources ? elDef : elDef.name,
        (elBindableInstructions ?? emptyArray) as IInstruction[],
        null,
        hasContainerless,
        captures,
        elementMetadata,
      );
    }

    // 3. Merge instructions in correct order:
    //    element instruction -> custom attributes -> plain attributes
    let instructions: IInstruction[] | undefined;
    let needsMarker = false;
    if (plainAttrInstructions != null || elementInstruction != null || attrInstructions != null) {
      instructions = emptyArray.concat(
        elementInstruction ?? emptyArray,
        attrInstructions ?? emptyArray,
        plainAttrInstructions ?? emptyArray,
      );
      needsMarker = true;
    }

    // 4. Compile children
    if (tcInstructions != null) {
      // Template controllers wrap the element - compile via TC helper
      const outermostTC = this._compileTemplateControllers(
        el,
        tcInstructions,
        instructions,
        elDef,
        isCustomElement,
        isShadowDom,
        hasContainerless,
        elName,
        elementInstruction,
        needsMarker,
        processContentResult,
        context,
      );
      context.rows.push([outermostTC]);
    } else {
      // No template controllers - compile children directly
      if (instructions != null) {
        context.rows.push(instructions);
      }

      // Extract [au-slot] projections
      if (processContentResult !== false) {
        const projections = this._extractProjections(el, isCustomElement, isShadowDom, elName, context);
        if (projections != null) {
          elementInstruction!.projections = projections;
        }
      }

      // Mark element as hydration target
      if (needsMarker) {
        if (isCustomElement && (hasContainerless || elDef.containerless)) {
          this._replaceByMarker(el, context);
        } else {
          this._markAsTarget(el, context);
        }
      }

      // Compile child nodes
      const shouldCompileContent = !isCustomElement || !elDef.containerless && !hasContainerless && processContentResult !== false;
      if (shouldCompileContent && el.childNodes.length > 0) {
        let child = el.firstChild;
        while (child !== null) {
          child = this._compileNode(child, context) as ChildNode | null;
        }
      }
    }

    // 5. Return next sibling for continued compilation
    return nextSibling;
  }

  /**
   * Classify all attributes on an element into their semantic categories.
   *
   * This is the core "attribute semantic decision" algorithm. Each attribute is
   * checked against these categories in priority order:
   *
   * 1. Special attributes (as-element, containerless) - removed, not compiled
   * 2. Captured attributes - forwarded to custom element via captures array
   * 3. Spread transferred bindings (...$attrs) - spreads parent's attributes
   * 4. Binding commands with ignoreAttr (class/style/attr) - command handles everything
   * 5. Spread bindables (...$bindables) - spreads bindings to all bindable props
   * 6. Custom element bindable properties - binds to CE's declared bindables
   * 7. Custom attributes and template controllers - hydrates CA/TC instances
   * 8. Plain attributes - interpolation or binding command on DOM attribute
   *
   * @returns Classification result with instructions grouped by category
   * @internal
   */
  private _classifyAttributes(
    el: Element,
    elDef: IElementComponentDefinition | null,
    captures: AttrSyntax[],
    context: CompilationContext,
  ): IAttrClassificationResult {
    const isCustomElement = elDef !== null;
    const capture = elDef?.capture;
    const hasCaptureFilter = capture != null && typeof capture !== 'boolean';
    const exprParser = context._exprParser;

    let attrs = el.attributes;
    let ii = attrs.length;
    let i = 0;
    let attr: Attr;
    let attrName: string;
    let attrValue: string;
    let attrSyntax: AttrSyntax;
    let bindingCommand: BindingCommandInstance | null = null;
    let realAttrTarget: string;
    let realAttrValue: string;

    let tcInstructions: HydrateTemplateController[] | undefined;
    let attrInstructions: HydrateAttributeInstruction[] | undefined;
    let elBindableInstructions: IInstruction[] | undefined;
    let plainAttrInstructions: IInstruction[] | undefined;

    let attrDef: IAttributeComponentDefinition | null = null;
    let bindable: IComponentBindablePropDefinition;
    let attrBindableInstructions: IInstruction[];
    let bindablesInfo: IElementBindablesInfo | IAttributeBindablesInfo;
    let expr: AnyBindingExpression;
    let hasContainerless = false;
    let canCapture = false;
    let spreadIndex = 0;

    const removeAttr = this.debug
      ? noop
      : () => {
        el.removeAttribute(attrName);
        --i;
        --ii;
      };

    for (; ii > i; ++i) {
      attr = attrs[i];
      attrName = attr.name;
      attrValue = attr.value;

      // 1. Handle special attributes
      switch (attrName) {
        case 'as-element':
        case 'containerless':
          removeAttr();
          hasContainerless = hasContainerless || attrName === 'containerless';
          continue;
      }

      attrSyntax = context._attrParser.parse(attrName, attrValue);
      bindingCommand = context._getCommand(attrSyntax);
      realAttrTarget = attrSyntax.target;
      realAttrValue = attrSyntax.rawValue;

      // 2. Handle captured attributes (for custom elements with capture enabled)
      if (capture && (!hasCaptureFilter || hasCaptureFilter && capture(realAttrTarget))) {
        if (bindingCommand != null && bindingCommand.ignoreAttr) {
          removeAttr();
          captures.push(attrSyntax);
          continue;
        }

        canCapture = realAttrTarget !== auslotAttr
          && realAttrTarget !== 'slot'
          && ((spreadIndex = realAttrTarget.indexOf('...')) === -1
            || (spreadIndex === 0 && (realAttrTarget === '...$attrs'))
          );
        if (canCapture) {
          bindablesInfo = context._getBindables(elDef);
          // Capture everything except bindable properties and template controllers
          if (bindablesInfo.attrs[realAttrTarget] == null && !context._findAttr(realAttrTarget)?.isTemplateController) {
            removeAttr();
            captures.push(attrSyntax);
            continue;
          }
        }
      }

      // 3. Handle spread transferred bindings (...$attrs)
      if (realAttrTarget === '...$attrs') {
        (plainAttrInstructions ??= []).push(new SpreadTransferedBindingInstruction());
        removeAttr();
        continue;
      }

      // 4. Binding commands with ignoreAttr (e.g., class/style/attr) handle the attribute entirely
      if (bindingCommand?.ignoreAttr) {
        (plainAttrInstructions ??= []).push(bindingCommand.build(
          { node: el, attr: attrSyntax, bindable: null, def: null },
          context._exprParser,
          context._attrMapper
        ));
        removeAttr();
        continue;
      }

      // 5. Spread bindables (...$bindables, ...propName) - spread to all bindable properties
      if (realAttrTarget.indexOf('...') === 0) {
        if (isCustomElement && (realAttrTarget = realAttrTarget.slice(3)) !== '$element') {
          (elBindableInstructions ??= []).push(new SpreadValueBindingInstruction(
            '$bindables',
            realAttrTarget === '$bindables' ? realAttrValue : realAttrTarget
          ));
          removeAttr();
          continue;
        }

        if (__DEV__) {
          if (realAttrTarget === '$bindable' || realAttrTarget === 'bindables') {
            // eslint-disable-next-line no-console
            console.warn(`[DEV:aurelia] Detected usage of ${realAttrTarget} on <${el.nodeName}>, did you mean "$bindables"?`);
          }
        }

        throw createMappedError(ErrorNames.compiler_no_reserved_spread_syntax, realAttrTarget);
      }

      // 6. Custom element bindable properties
      if (isCustomElement) {
        bindablesInfo = context._getBindables(elDef);
        bindable = bindablesInfo.attrs[realAttrTarget];
        if (bindable !== void 0) {
          if (bindingCommand === null) {
            expr = exprParser.parse(realAttrValue, etInterpolation);
            (elBindableInstructions ??= []).push(
              expr == null
                ? new SetPropertyInstruction(realAttrValue, bindable.name)
                : new InterpolationInstruction(expr, bindable.name)
            );
          } else {
            (elBindableInstructions ??= []).push(bindingCommand.build(
              { node: el, attr: attrSyntax, bindable, def: elDef },
              context._exprParser,
              context._attrMapper
            ));
          }

          removeAttr();

          if (__DEV__) {
            attrDef = context._findAttr(realAttrTarget);
            if (attrDef !== null) {
              // eslint-disable-next-line no-console
              console.warn(`[DEV:aurelia] Binding with bindable "${realAttrTarget}" on custom element "${elDef.name}" is ambiguous.` +
                `There is a custom attribute with the same name.`
              );
            }
          }
          continue;
        }

        // Handle $bindables with binding command
        if (realAttrTarget === '$bindables') {
          if (bindingCommand != null) {
            const buildInfo = { node: el, attr: attrSyntax, bindable: null, def: elDef } as const;

            if (__DEV__) {
              const instruction = bindingCommand.build(
                buildInfo,
                context._exprParser,
                context._attrMapper
              );
              if (!(instruction instanceof SpreadValueBindingInstruction)) {
                // eslint-disable-next-line no-console
                console.warn(`[DEV:aurelia] Binding with "$bindables" on custom element "${elDef.name}" with command ${attrSyntax.command} ` +
                  ` did not result in a spread binding instruction. This likely won't work as expected.`
                );
              }
              (elBindableInstructions ??= []).push(instruction);
            } else {
              (elBindableInstructions ??= []).push(bindingCommand.build(
                buildInfo,
                context._exprParser,
                context._attrMapper
              ));
            }
          } else if (__DEV__) {
            // eslint-disable-next-line no-console
            console.warn(`[DEV:aurelia] Usage of "$bindables" on custom element "<${elDef.name}>" is ignored.`);
          }

          removeAttr();
          continue;
        }
      }

      // Disallow $bindables on non-custom elements
      if (realAttrTarget === '$bindables') {
        throw createMappedError(ErrorNames.compiler_no_reserved_$bindable, el.nodeName, realAttrTarget, realAttrValue);
      }

      // 7. Custom attributes and template controllers
      attrDef = context._findAttr(realAttrTarget);
      if (attrDef !== null) {
        attrBindableInstructions = this._compileCustomAttributeBindables(
          el, attrDef, attrSyntax, realAttrValue, bindingCommand, context,
          /* treatEmptyAsNoBinding */ true
        );

        removeAttr();

        // todo: def/ def.Type or def.name should be configurable
        //       example: AOT/runtime can use def.Type, but there are situations
        //       where instructions need to be serialized, def.name should be used
        if (attrDef.isTemplateController) {
          (tcInstructions ??= []).push(new HydrateTemplateController(
            voidDefinition,
            this.resolveResources ? attrDef : attrDef.name,
            void 0,
            attrBindableInstructions,
          ));
        } else {
          (attrInstructions ??= []).push(new HydrateAttributeInstruction(
            this.resolveResources ? attrDef : attrDef.name,
            attrDef.aliases != null && attrDef.aliases.includes(realAttrTarget) ? realAttrTarget : void 0,
            attrBindableInstructions
          ));
        }
        continue;
      }

      // 8. Plain attributes - either interpolation or binding command on a DOM property/attribute
      if (bindingCommand === null) {
        expr = exprParser.parse(realAttrValue, etInterpolation);
        if (expr != null) {
          removeAttr();
          (plainAttrInstructions ??= []).push(new InterpolationInstruction(
            expr,
            context._attrMapper.map(el, realAttrTarget) ?? camelCase(realAttrTarget)
          ));
        }
        // else: plain static attribute, left on the element (no instruction needed)
        continue;
      }

      // Plain attribute with binding command (e.g., value.bind="x")
      (plainAttrInstructions ??= []).push(bindingCommand.build(
        { node: el, attr: attrSyntax, bindable: null, def: null },
        context._exprParser,
        context._attrMapper
      ));
      removeAttr();
    }

    return {
      tcInstructions,
      attrInstructions,
      elBindableInstructions,
      plainAttrInstructions,
      hasContainerless,
    };
  }

  /** @internal */
  private _compileText(node: Text, context: CompilationContext): Node | null {
    const parent = node.parentNode!;
    const expr = context._exprParser.parse(node.textContent!, etInterpolation);
    const next = node.nextSibling;
    let parts: readonly string[];
    let expressions: readonly IsBindingBehavior[];
    let i: number;
    let ii: number;
    let part: string;
    if (expr !== null) {
      ({ parts, expressions } = expr);

      // foreach normal part, turn into a standard text node
      if ((part = parts[0])) {
        insertBefore(parent, context._text(part), node);
      }
      for (i = 0, ii = expressions.length; ii > i; ++i) {
        // foreach expression part, turn into a marker
        insertManyBefore(parent, node, [
          // context.h(MARKER_NODE_NAME),
          context._marker(),
          // empty text node will not be cloned when doing fragment.cloneNode()
          // so give it an empty space instead
          context._text(' '),
        ]);
        // foreach normal part, turn into a standard text node
        if ((part = parts[i + 1])) {
          insertBefore(parent, context._text(part), node);
        }
        // and the corresponding instruction
        context.rows.push([new TextBindingInstruction(expressions[i])]);
      }
      parent.removeChild(node);
    }
    return next;
  }

  /** @internal */
  private _compileMultiBindings(
    node: Element,
    attrRawValue: string,
    attrDef: IAttributeComponentDefinition,
    context: CompilationContext
  ): IInstruction[] {
    // custom attribute + multiple values:
    // my-attr="prop1: literal1 prop2.bind: ...; prop3: literal3"
    // my-attr="prop1.bind: ...; prop2.bind: ..."
    // my-attr="prop1: ${}; prop2.bind: ...; prop3: ${}"
    const bindableAttrsInfo = context._getBindables(attrDef);
    const valueLength = attrRawValue.length;
    const instructions: IInstruction[] = [];

    let attrName: string | undefined = void 0;
    let attrValue: string | undefined = void 0;

    let start = 0;
    let ch = 0;
    let expr: AnyBindingExpression;
    let attrSyntax: AttrSyntax;
    let command: BindingCommandInstance | null;
    let bindable: IComponentBindablePropDefinition;

    for (let i = 0; i < valueLength; ++i) {
      ch = attrRawValue.charCodeAt(i);

      if (ch === Char.Backslash) {
        ++i;
        // Ignore whatever comes next because it's escaped
      } else if (ch === Char.Colon) {
        attrName = attrRawValue.slice(start, i);

        // Skip whitespace after colon
        while (attrRawValue.charCodeAt(++i) <= Char.Space);

        start = i;

        for (; i < valueLength; ++i) {
          ch = attrRawValue.charCodeAt(i);
          if (ch === Char.Backslash) {
            ++i;
            // Ignore whatever comes next because it's escaped
          } else if (ch === Char.Semicolon) {
            attrValue = attrRawValue.slice(start, i);
            break;
          }
        }

        if (attrValue === void 0) {
          // No semicolon found, so just grab the rest of the value
          attrValue = attrRawValue.slice(start);
        }

        attrSyntax = context._attrParser.parse(attrName, attrValue);
        // ================================================
        // todo: should it always camel case???
        // const attrTarget = camelCase(attrSyntax.target);
        // ================================================
        command = context._getCommand(attrSyntax);
        bindable = bindableAttrsInfo.attrs[attrSyntax.target];
        if (bindable == null) {
          throw createMappedError(ErrorNames.compiler_binding_to_non_bindable, attrSyntax.target, attrDef.name);
        }
        if (command === null) {
          expr = context._exprParser.parse(attrValue, etInterpolation);
          instructions.push(expr === null
            ? new SetPropertyInstruction(attrValue, bindable.name)
            : new InterpolationInstruction(expr, bindable.name)
          );
        } else {
          instructions.push(command.build(
            { node, attr: attrSyntax, bindable, def: attrDef },
            context._exprParser,
            context._attrMapper
          ));
        }

        // Skip whitespace after semicolon
        while (i < valueLength && attrRawValue.charCodeAt(++i) <= Char.Space);

        start = i;

        attrName = void 0;
        attrValue = void 0;
      }
    }

    return instructions;
  }

  /** @internal */
  private _compileLocalElement(template: Element | DocumentFragment, context: CompilationContext) {
    const elName = context.root.def.name;
    const root: Element | DocumentFragment = template;
    const localTemplates = toArray(root.querySelectorAll<HTMLTemplateElement>('template[as-custom-element]'));
    const numLocalTemplates = localTemplates.length;
    if (numLocalTemplates === 0) { return; }
    if (numLocalTemplates === root.childElementCount) {
      throw createMappedError(ErrorNames.compiler_template_only_local_template, elName);
    }
    const localTemplateNames: Set<string> = new Set();
    const localElementTypes: (Constructable & { dependencies?: Key[] })[] = [];

    for (const localTemplate of localTemplates) {
      if (localTemplate.parentNode !== root) {
        throw createMappedError(ErrorNames.compiler_local_el_not_under_root, elName);
      }

      const name = processTemplateName(elName, localTemplate, localTemplateNames);

      const content = localTemplate.content;
      const bindableEls = toArray(content.querySelectorAll('bindable'));
      const properties = new Set<string>();
      const attributes = new Set<string>();
      const bindables = bindableEls.reduce((allBindables: Record<string, IComponentBindablePropDefinition>, bindableEl) => {
        if (bindableEl.parentNode !== content) {
          throw createMappedError(ErrorNames.compiler_local_el_bindable_not_under_root, name);
        }
        const property = bindableEl.getAttribute(LocalTemplateBindableAttributes.name);
        if (property === null) {
          throw createMappedError(ErrorNames.compiler_local_el_bindable_name_missing, bindableEl, name);
        }
        const attribute = bindableEl.getAttribute(LocalTemplateBindableAttributes.attribute);
        if (attribute !== null
          && attributes.has(attribute)
          || properties.has(property)
        ) {
          throw createMappedError(ErrorNames.compiler_local_el_bindable_duplicate, properties, attribute);
        } else {
          if (attribute !== null) {
            attributes.add(attribute);
          }
          properties.add(property);
        }
        const ignoredAttributes = toArray(bindableEl.attributes).filter((attr) => !allowedLocalTemplateBindableAttributes.includes(attr.name));
        if (ignoredAttributes.length > 0) {
          if (__DEV__)
            // eslint-disable-next-line no-console
            console.warn(`[DEV:aurelia] The attribute(s) ${ignoredAttributes.map(attr => attr.name).join(', ')} will be ignored for ${bindableEl.outerHTML}. Only ${allowedLocalTemplateBindableAttributes.join(', ')} are processed.`);
        }

        bindableEl.remove();

        allBindables[property] = {
          name: property,
          attribute: attribute ?? void 0,
          mode: bindableEl.getAttribute(LocalTemplateBindableAttributes.mode) as StringBindingMode ?? 'default'
        };

        return allBindables;
      }, {});

      class LocalDepType {
        public static $au: IElementComponentDefinition & { dependencies?: Key[] } = {
          type: definitionTypeElement,
          name,
          template: localTemplate,
          bindables,
        };
      }
      Reflect.defineProperty(LocalDepType, 'name', { value: pascalCase(name) });
      localElementTypes.push(LocalDepType);

      root.removeChild(localTemplate);
    }

    // if we have a template like this
    //
    // my-app.html
    // <template as-custom-element="le-1">
    //  <le-2></le-2>
    // </template>
    // <template as-custom-element="le-2">...</template>
    //
    // without registering dependencies properly, <le-1> will not see <le-2> as a custom element
    const compilationDeps = (context.root.def.dependencies ?? []).concat(context.root.def.Type == null ? emptyArray : [context.root.def.Type]);
    for (const localElementType of localElementTypes) {
      localElementType.dependencies = compilationDeps.concat(localElementTypes.filter(d => d !== localElementType));
      context._addLocalDep(localElementType);
    }

  }

  /** @internal */
  private _shouldReorderAttrs(el: Element, instructions?: IInstruction[]): boolean | undefined {
    const nodeName = el.nodeName;
    return nodeName === 'INPUT' && orderSensitiveInputType[(el as HTMLInputElement).type] === 1
      || nodeName === 'SELECT' && (
        (el as HTMLSelectElement).hasAttribute('multiple')
        || instructions?.some(i => i.type === propertyBinding && (i as PropertyBindingInstruction | InterpolationInstruction).to === 'multiple')
      );
  }

  /** @internal */
  private _reorder(el: Element, instructions: (IInstruction)[]) {
    switch (el.nodeName) {
      case 'INPUT': {
        const _instructions = instructions as (PropertyBindingInstruction | InterpolationInstruction)[];
        // swap the order of checked and model/value attribute,
        // so that the required observers are prepared for checked-observer
        let modelOrValueOrMatcherIndex: number | undefined = void 0;
        let checkedIndex: number | undefined = void 0;
        let found = 0;
        let instruction: PropertyBindingInstruction | InterpolationInstruction;
        for (let i = 0; i < _instructions.length && found < 3; i++) {
          instruction = _instructions[i];
          switch (instruction.to) {
            case 'model':
            case 'value':
            case 'matcher':
              modelOrValueOrMatcherIndex = i;
              found++;
              break;
            case 'checked':
              checkedIndex = i;
              found++;
              break;
          }
        }
        if (checkedIndex !== void 0 && modelOrValueOrMatcherIndex !== void 0 && checkedIndex < modelOrValueOrMatcherIndex) {
          [_instructions[modelOrValueOrMatcherIndex], _instructions[checkedIndex]] = [_instructions[checkedIndex], _instructions[modelOrValueOrMatcherIndex]];
        }
        break;
      }
      case 'SELECT': {
        const _instructions = instructions as (PropertyBindingInstruction | InterpolationInstruction)[];
        let valueIndex = 0;
        let multipleIndex = 0;
        // a variable to stop the loop as soon as we find both value & multiple binding indices
        let found = 0;
        let instruction: PropertyBindingInstruction | InterpolationInstruction;
        // swap the order of multiple and value bindings
        for (let i = 0; i < _instructions.length && found < 2; ++i) {
          instruction = _instructions[i];
          switch (instruction.to) {
            case 'multiple':
              multipleIndex = i;
              found++;
              break;
            case 'value':
              valueIndex = i;
              found++;
              break;
          }
          if (found === 2 && valueIndex < multipleIndex) {
            [_instructions[multipleIndex], _instructions[valueIndex]] = [_instructions[valueIndex], _instructions[multipleIndex]];
          }
        }
      }
    }
  }

  /**
   * Mark an element as target with a special css class
   * and return it
   *
   * @internal
   */
  private _markAsTarget<T extends Element>(el: T, context: CompilationContext): T {
    insertBefore(el.parentNode!, context._comment('au*'), el);
    // el.classList.add('au');
    return el;
  }

  /**
   * Replace an element with a marker, and return the marker
   *
   * @internal
   */
  private _replaceByMarker(node: Node, context: CompilationContext): Comment {
    if (isMarker(node)) {
      return node;
    }
    // todo: assumption made: parentNode won't be null
    const parent = node.parentNode!;
    // const marker = this._markAsTarget(context.h(MARKER_NODE_NAME));
    const marker = context._marker();
    // insertBefore(parent, marker, node);
    insertManyBefore(parent, node, [
      marker,
      context._comment(auLocationStart),
      context._comment(auLocationEnd),
    ]);
    parent.removeChild(node);
    return marker;
  }

  /**
   * Compile and chain template controllers on an element.
   *
   * When an element has multiple template controllers (e.g., `<div if.bind="x" repeat.for="y">`),
   * they form a chain where each outer TC wraps the inner one:
   *
   *   TC(if) -> TC(repeat) -> actual element
   *
   * This method:
   * 1. Creates a template for the innermost TC containing the actual element
   * 2. Compiles the element's children into that template
   * 3. Creates wrapper templates for each outer TC, chaining them together
   * 4. Returns the outermost TC instruction to be added to the parent context
   *
   * @internal
   */
  private _compileTemplateControllers(
    el: Element,
    tcInstructions: HydrateTemplateController[],
    instructions: IInstruction[] | undefined,
    elDef: IElementComponentDefinition | null,
    isCustomElement: boolean,
    isShadowDom: boolean,
    hasContainerless: boolean,
    elName: string,
    elementInstruction: HydrateElementInstruction | undefined,
    needsMarker: boolean,
    processContentResult: boolean | undefined | void,
    context: CompilationContext,
  ): HydrateTemplateController {
    const ii = tcInstructions.length - 1;
    let i = ii;
    let tcInstruction = tcInstructions[i];

    // Create template for the innermost TC
    let template: HTMLTemplateElement;
    if (isMarker(el)) {
      template = context.t();
      appendManyToTemplate(template, [
        context._marker(),
        context._comment(auLocationStart),
        context._comment(auLocationEnd),
      ]);
    } else {
      // Replace element with marker and wrap in template
      this._replaceByMarker(el, context);
      if (el.nodeName === 'TEMPLATE') {
        template = el as HTMLTemplateElement;
      } else {
        template = context.t();
        appendToTemplate(template, el);
      }
    }
    const mostInnerTemplate = template;

    // Prepare child context for inner template compilation
    const childContext = context._createChild(instructions == null ? [] : [instructions]);

    // Extract [au-slot] projections from children before compiling
    if (processContentResult !== false) {
      const projections = this._extractProjections(el, isCustomElement, isShadowDom, elName, context);
      if (projections != null) {
        elementInstruction!.projections = projections;
      }
    }

    // Mark element as hydration target if needed
    if (needsMarker) {
      if (isCustomElement && (hasContainerless || elDef!.containerless)) {
        this._replaceByMarker(el, context);
      } else {
        this._markAsTarget(el, context);
      }
    }

    // Compile children into the inner context
    const shouldCompileContent = !isCustomElement || !elDef!.containerless && !hasContainerless && processContentResult !== false;
    if (shouldCompileContent) {
      if (el.nodeName === TEMPLATE_NODE_NAME) {
        this._compileNode((el as HTMLTemplateElement).content, childContext);
      } else {
        let child = el.firstChild;
        while (child !== null) {
          child = this._compileNode(child, childContext) as ChildNode | null;
        }
      }
    }

    // Set the definition for the innermost TC
    tcInstruction.def = {
      name: generateElementName(),
      type: definitionTypeElement,
      template: mostInnerTemplate,
      instructions: childContext.rows,
      needsCompile: false,
    };

    // Chain outer TCs from right to left
    // Each outer TC gets a template with just a marker pointing to the inner TC
    while (i-- > 0) {
      tcInstruction = tcInstructions[i];
      template = context.t();
      appendManyToTemplate(template, [
        context._marker(),
        context._comment(auLocationStart),
        context._comment(auLocationEnd),
      ]);

      tcInstruction.def = {
        name: generateElementName(),
        type: definitionTypeElement,
        template,
        needsCompile: false,
        instructions: [[tcInstructions[i + 1]]],
      };
    }

    // Return the outermost TC instruction
    return tcInstruction;
  }

  /**
   * Build the bindable property instructions for a custom attribute.
   *
   * Handles three cases:
   * 1. Multi-binding syntax: `my-attr="prop1: value1; prop2.bind: expr"`
   * 2. Single value without command: `my-attr="value"` or `my-attr="${expr}"`
   * 3. Single value with command: `my-attr.bind="expr"`
   *
   * @param node - The element the attribute is on
   * @param attrDef - The custom attribute definition
   * @param attrSyntax - The parsed attribute syntax
   * @param attrValue - The raw attribute value
   * @param bindingCommand - The binding command instance, or null
   * @param context - The compilation context
   * @param treatEmptyAsNoBinding - If true, empty string values produce no instructions (surrogate/element behavior)
   * @returns Array of instructions for the attribute's bindable properties
   * @internal
   */
  private _compileCustomAttributeBindables(
    node: Element,
    attrDef: IAttributeComponentDefinition,
    attrSyntax: AttrSyntax,
    attrValue: string,
    bindingCommand: BindingCommandInstance | null,
    context: CompilationContext,
    treatEmptyAsNoBinding: boolean,
  ): IInstruction[] {
    const bindablesInfo = context._getBindables(attrDef);

    // Check for multi-binding syntax: `my-attr="prop1: value1; prop2.bind: expr"`
    // Multi-binding is only allowed when:
    // - The attribute allows it (noMultiBindings !== true)
    // - There's no binding command
    // - The value contains a colon (but not just interpolation)
    const isMultiBindings = attrDef.noMultiBindings === false
      && bindingCommand === null
      && hasInlineBindings(attrValue);

    if (isMultiBindings) {
      return this._compileMultiBindings(node, attrValue, attrDef, context);
    }

    const primaryBindable = bindablesInfo.primary;

    // Single value WITHOUT binding command: `my-attr=""` or `my-attr="${expr}"`
    if (bindingCommand === null) {
      const expr = context._exprParser.parse(attrValue, etInterpolation);
      if (expr === null) {
        // No interpolation - treat as literal value
        if (treatEmptyAsNoBinding && attrValue === '') {
          // Empty attribute like `<div my-attr>` produces no bindings
          return [];
        }
        return [new SetPropertyInstruction(attrValue, primaryBindable.name)];
      }
      // Has interpolation
      return [new InterpolationInstruction(expr, primaryBindable.name)];
    }

    // Single value WITH binding command: `my-attr.bind="expr"`
    return [bindingCommand.build(
      { node, attr: attrSyntax, bindable: primaryBindable, def: attrDef },
      context._exprParser,
      context._attrMapper
    )];
  }

  /**
   * Extract au-slot projections from a custom element's children.
   *
   * Walks through child nodes looking for [au-slot] attributes. When found,
   * removes them from the parent and groups them by slot name into compiled
   * projection definitions.
   *
   * @returns A record of slot name -> compiled definition, or null if no projections found
   * @internal
   */
  private _extractProjections(
    el: Element,
    isCustomElement: boolean,
    isShadowDom: boolean,
    elName: string,
    context: CompilationContext,
  ): Record<string, IElementComponentDefinition> | null {
    let child: Node | null = el.firstChild;
    let childEl: Element;
    let targetSlot: string | null;
    let hasAuSlot: boolean;
    let slotTemplateRecord: Record<string, (Node | Element | DocumentFragment)[]> | undefined;
    let isEmptyTextNode: boolean;

    // Walk through child nodes, extracting those with [au-slot]
    while (child !== null) {
      targetSlot = isElement(child) ? child.getAttribute(auslotAttr) : null;
      hasAuSlot = targetSlot !== null || isCustomElement && !isShadowDom;
      childEl = child.nextSibling as Element;
      if (hasAuSlot) {
        if (!isCustomElement) {
          throw createMappedError(ErrorNames.compiler_au_slot_on_non_element, targetSlot, elName);
        }
        (child as Element).removeAttribute?.(auslotAttr);
        // ignore all whitespace
        isEmptyTextNode = isTextNode(child) && child.textContent!.trim() === '';
        if (!isEmptyTextNode) {
          ((slotTemplateRecord ??= {})[targetSlot || defaultSlotName] ??= []).push(child);
        }
        el.removeChild(child);
      }
      child = childEl;
    }

    if (slotTemplateRecord == null) {
      return null;
    }

    // Compile each slot's content into a projection definition
    const projections: Record<string, IElementComponentDefinition> = {};
    let template: HTMLTemplateElement;
    let slotTemplates: (Node | Element | DocumentFragment)[];
    let slotTemplate: Node | Element | DocumentFragment;
    let projectionCompilationContext: CompilationContext;

    for (targetSlot in slotTemplateRecord) {
      template = context.t();
      slotTemplates = slotTemplateRecord[targetSlot];

      // Aggregate all content targeting the same slot into a single template
      for (let j = 0, jj = slotTemplates.length; jj > j; ++j) {
        slotTemplate = slotTemplates[j];
        if (slotTemplate.nodeName === TEMPLATE_NODE_NAME) {
          // User has something more than [au-slot] on a template
          // e.g. <template au-slot repeat.for="i of items"> vs <template au-slot>static content</template>
          if ((slotTemplate as Element).attributes.length > 0) {
            // Has other attributes - keep the template wrapper
            appendToTemplate(template, slotTemplate);
          } else {
            // No other attributes - unwrap the content
            appendToTemplate(template, (slotTemplate as HTMLTemplateElement).content);
          }
        } else {
          appendToTemplate(template, slotTemplate);
        }
      }

      // Compile the aggregated template
      projectionCompilationContext = context._createChild();
      this._compileNode(template.content, projectionCompilationContext);
      projections[targetSlot] = {
        name: generateElementName(),
        type: definitionTypeElement,
        template,
        instructions: projectionCompilationContext.rows,
        needsCompile: false,
      };
    }

    return projections;
  }
}

const TEMPLATE_NODE_NAME = 'TEMPLATE';
const isMarker = (el: Node): el is Comment =>
  el.nodeValue === 'au*';
    // && isComment(nextSibling = el.nextSibling) && nextSibling.textContent === auStartComment
    // && isComment(nextSibling = el.nextSibling) && nextSibling.textContent === auEndComment;
// const isComment = (el: Node | null): el is Comment => el?.nodeType === 8;

// this class is intended to be an implementation encapsulating the information at the root level of a template
// this works at the time this is created because everything inside a template should be retrieved
// from the root itself.
// if anytime in the future, where it's desirable to retrieve information from somewhere other than root
// then consider dropping this
// goal: hide the root container, and all the resources finding calls
class CompilationContext {
  public readonly root: CompilationContext;
  public readonly parent: CompilationContext | null;
  public readonly def: IElementComponentDefinition;
  public readonly _resourceResolver: IResourceResolver;
  public readonly _commandResolver: IBindingCommandResolver;
  public readonly _templateFactory: ITemplateElementFactory;
  public readonly _logger: ILogger;
  public readonly _attrParser: IAttributeParser;
  public readonly _attrMapper: IAttrMapper;
  public readonly _exprParser: IExpressionParser;
  public readonly p: IDomPlatform;
  // an array representing targets of instructions, built on depth first tree walking compilation
  public readonly rows: IInstruction[][];
  public readonly localEls: Set<string>;
  public hasSlot: boolean = false;
  public deps: Constructable[] | null = null;

  /** @internal */
  private readonly c: IContainer;

  public constructor(
    def: IElementComponentDefinition,
    container: IContainer,
    parent: CompilationContext | null,
    root: CompilationContext | null,
    instructions: IInstruction[][] | undefined,
  ) {
    const hasParent = parent !== null;
    this.c = container;
    this.root = root === null ? this : root;
    this.def = def;
    this.parent = parent;
    this._resourceResolver = hasParent ? parent._resourceResolver : container.get(IResourceResolver);
    this._commandResolver = hasParent ? parent._commandResolver : container.get(IBindingCommandResolver);
    this._templateFactory = hasParent ? parent._templateFactory : container.get(ITemplateElementFactory);
    // todo: attr parser should be retrieved based in resource semantic (current leaf + root + ignore parent)
    this._attrParser = hasParent ? parent._attrParser : container.get(IAttributeParser);
    this._exprParser = hasParent ? parent._exprParser : container.get(IExpressionParser);
    this._attrMapper = hasParent ? parent._attrMapper : container.get(IAttrMapper);
    this._logger = hasParent ? parent._logger : container.get(ILogger);
    if (typeof (this.p = hasParent ? parent.p : container.get(IPlatform) as unknown as IDomPlatform).document?.nodeType !== 'number') {
      throw createMappedError(ErrorNames.compiler_no_dom_api);
    }
    this.localEls = hasParent ? parent.localEls : new Set();
    this.rows = instructions ?? [];
  }

  public _addLocalDep(Type: Constructable) {
    (this.root.deps ??= []).push(Type);
    this.root.c.register(Type);
    return this;
  }

  public _text(text: string) {
    return this.p.document.createTextNode(text);
  }

  public _comment(text: string) {
    return this.p.document.createComment(text);
  }

  public _marker() {
    return this._comment('au*');
  }

  public h<K extends keyof HTMLElementTagNameMap>(name: K): HTMLElementTagNameMap[K];
  public h(name: string): HTMLElement;
  public h(name: string): HTMLElement {
    const el = this.p.document.createElement(name);
    if (name === 'template') {
      this.p.document.adoptNode((el as HTMLTemplateElement).content);
    }
    return el;
  }

  public t() {
    return this.h('template');
  }

  /**
   * Find the custom element definition of a given name
   */
  public _findElement(name: string): IElementComponentDefinition | null {
    return this._resourceResolver.el(this.c, name);
  }

  /**
   * Find the custom attribute definition of a given name
   */
  public _findAttr(name: string): IAttributeComponentDefinition | null {
    return this._resourceResolver.attr(this.c, name);
  }

  public _getBindables(def: IAttributeComponentDefinition): IAttributeBindablesInfo;
  public _getBindables(def: IElementComponentDefinition): IElementBindablesInfo;
  public _getBindables(def: IAttributeComponentDefinition | IElementComponentDefinition): IAttributeBindablesInfo | IElementBindablesInfo {
    return this._resourceResolver.bindables(def);
  }

  /**
   * Create a new child compilation context
   */
  public _createChild(instructions?: IInstruction[][]) {
    return new CompilationContext(this.def, this.c, this, this.root, instructions);
  }

  /**
   * Retrieve a binding command resource instance.
   *
   * @param name - The parsed `AttrSyntax`
   *
   * @returns An instance of the command if it exists, or `null` if it does not exist.
   */
  public _getCommand(syntax: AttrSyntax): BindingCommandInstance | null {
    const name = syntax.command;
    if (name === null) {
      return null;
    }
    return this._commandResolver.get(this.c, name);
  }
}

const hasInlineBindings = (rawValue: string): boolean => {
  const len = rawValue.length;
  let ch = 0;
  let i = 0;
  while (len > i) {
    ch = rawValue.charCodeAt(i);
    if (ch === Char.Backslash) {
      ++i;
      // Ignore whatever comes next because it's escaped
    } else if (ch === Char.Colon) {
      return true;
    } else if (ch === Char.Dollar && rawValue.charCodeAt(i + 1) === Char.OpenBrace) {
      return false;
    }
    ++i;
  }
  return false;
};

const voidDefinition: IElementComponentDefinition = { name: 'unnamed', type: definitionTypeElement };
const invalidSurrogateAttribute: Record<string, boolean> = {
  'id': true,
  'name': true,
  'au-slot': true,
  'as-element': true,
};
const orderSensitiveInputType: Record<string, number> = {
  checkbox: 1,
  radio: 1,
  // todo: range is also sensitive to order, for min/max
};

export interface IAttributeBindablesInfo {
  readonly attrs: Record<string, IComponentBindablePropDefinition>;
  readonly bindables: Record<string, IComponentBindablePropDefinition>;
  readonly primary: IComponentBindablePropDefinition;
}

export interface IElementBindablesInfo {
  readonly attrs: Record<string, IComponentBindablePropDefinition>;
  readonly bindables: Record<string, IComponentBindablePropDefinition>;
  readonly primary: null;
}

export interface IResourceResolver<
  TElementDef extends IElementComponentDefinition = IElementComponentDefinition,
  TAttrDef extends IAttributeComponentDefinition = IAttributeComponentDefinition,
> {
  el(c: IContainer, name: string): TElementDef | null;
  attr(c: IContainer, name: string): TAttrDef | null;
  bindables(def: TAttrDef): IAttributeBindablesInfo;
  bindables(def: TElementDef): IElementBindablesInfo;
  bindables(def: TAttrDef | TElementDef): IAttributeBindablesInfo | IElementBindablesInfo;
}

export const IResourceResolver = /*@__PURE__*/ tcCreateInterface<IResourceResolver>('IResourceResolver');

export interface IBindingCommandResolver {
  get(c: IContainer, name: string): BindingCommandInstance | null;
}
export const IBindingCommandResolver = /*@__PURE__*/ tcCreateInterface<IBindingCommandResolver>('IBindingCommandResolver', x => {
  class DefaultBindingCommandResolver implements IBindingCommandResolver {
    private readonly _cache = new WeakMap<IContainer, Record<string, BindingCommandInstance>>();
    public get(c: IContainer, name: string): BindingCommandInstance | null {
      let record = this._cache.get(c);
      if (!record) {
        this._cache.set(c, record = {});
      }
      return name in record ? record[name] : (record[name] = BindingCommand.get(c, name));
    }
  }

  return x.singleton(DefaultBindingCommandResolver);
});

_START_CONST_ENUM();
const enum LocalTemplateBindableAttributes {
  name = "name",
  attribute = "attribute",
  mode = "mode",
}
_END_CONST_ENUM();
const allowedLocalTemplateBindableAttributes: readonly string[] = tcObjectFreeze([
  LocalTemplateBindableAttributes.name,
  LocalTemplateBindableAttributes.attribute,
  LocalTemplateBindableAttributes.mode
]);
const localTemplateIdentifier = 'as-custom-element';

const processTemplateName = (owningElementName: string, localTemplate: HTMLTemplateElement, localTemplateNames: Set<string>): string => {
  const name = localTemplate.getAttribute(localTemplateIdentifier);
  if (name === null || name === '') {
    throw createMappedError(ErrorNames.compiler_local_name_empty, owningElementName);
  }
  if (localTemplateNames.has(name)) {
    throw createMappedError(ErrorNames.compiler_duplicate_local_name, name, owningElementName);
  } else {
    localTemplateNames.add(name);
    localTemplate.removeAttribute(localTemplateIdentifier);
  }
  return name;
};

/**
 * An interface describing the hooks a compilation process should invoke.
 *
 * A feature available to the default template compiler.
 */
export const ITemplateCompilerHooks = /*@__PURE__*/tcCreateInterface<ITemplateCompilerHooks>('ITemplateCompilerHooks');
export interface ITemplateCompilerHooks {
  /**
   * Should be invoked immediately before a template gets compiled
   */
  compiling?(template: HTMLElement): void;
}

export const TemplateCompilerHooks = tcObjectFreeze({
  name: /*@__PURE__*/getResourceKeyFor('compiler-hooks'),
  define<K extends ITemplateCompilerHooks, T extends Constructable<K>>(Type: T): IRegistry {
    return {
      register(container) {
        singletonRegistration(ITemplateCompilerHooks, Type).register(container);
      }
    };
  },
  findAll(container: IContainer): readonly ITemplateCompilerHooks[] {
    return container.get(allResources(ITemplateCompilerHooks));
  }
});

/**
 * Decorator: Indicates that the decorated class is a template compiler hooks.
 *
 * An instance of this class will be created and appropriate compilation hooks will be invoked
 * at different phases of the default compiler.
 */
/* eslint-disable */
// deepscan-disable-next-line
export const templateCompilerHooks = <T extends Constructable>(target?: T, context?: ClassDecoratorContext) => {
  return target === void 0 ? decorator : decorator(target, context!);
  function decorator<T extends Constructable>(t: T, context: ClassDecoratorContext): any {
    context.metadata[registrableMetadataKey] = TemplateCompilerHooks.define(t);
    return t;
  };
}
/* eslint-enable */

_START_CONST_ENUM();
const enum Char {
  // Null           = 0x00,
  // Backspace      = 0x08,
  // Tab            = 0x09,
  // LineFeed       = 0x0A,
  // VerticalTab    = 0x0B,
  // FormFeed       = 0x0C,
  // CarriageReturn = 0x0D,
  Space          = 0x20,
  // Exclamation    = 0x21,
  // DoubleQuote    = 0x22,
  Dollar         = 0x24,
  // Percent        = 0x25,
  // Ampersand      = 0x26,
  // SingleQuote    = 0x27,
  // OpenParen      = 0x28,
  // CloseParen     = 0x29,
  // Asterisk       = 0x2A,
  // Plus           = 0x2B,
  // Comma          = 0x2C,
  // Minus          = 0x2D,
  // Dot            = 0x2E,
  // Slash          = 0x2F,
  Semicolon      = 0x3B,
  // Backtick       = 0x60,
  // OpenBracket    = 0x5B,
  Backslash      = 0x5C,
  // CloseBracket   = 0x5D,
  // Caret          = 0x5E,
  // Underscore     = 0x5F,
  OpenBrace      = 0x7B,
  // Bar            = 0x7C,
  // CloseBrace     = 0x7D,
  Colon          = 0x3A,
  // LessThan       = 0x3C,
  // Equals         = 0x3D,
  // GreaterThan    = 0x3E,
  // Question       = 0x3F,
}
_END_CONST_ENUM();

// eslint-disable-next-line
function apiTest() {

  @templateCompilerHooks()
  @templateCompilerHooks
  class Abc {}

  return Abc;
}
