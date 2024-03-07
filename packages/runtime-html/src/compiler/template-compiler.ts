/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { emptyArray, toArray, ILogger, camelCase, noop, Key, Registrable, getResourceKeyFor } from '@aurelia/kernel';
import { IExpressionParser, IsBindingBehavior, PrimitiveLiteralExpression } from '@aurelia/runtime';
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
  ITemplateCompiler,
  PropertyBindingInstruction,
  SpreadElementPropBindingInstruction,
  propertyBinding,
} from '../renderer';
import { IPlatform } from '../platform';
import { BindableDefinition, PartialBindableDefinition } from '../bindable';
import { AttrSyntax, IAttributeParser } from '../resources/attribute-pattern';
import { CustomAttribute } from '../resources/custom-attribute';
import { CustomElement, CustomElementDefinition, CustomElementType, defineElement, generateElementName, getElementDefinition } from '../resources/custom-element';
import { BindingCommandInstance, ICommandBuildInfo, ctIgnoreAttr, BindingCommand, BindingCommandDefinition } from '../resources/binding-command';
import { createLookup, def, etInterpolation, etIsProperty, isString, objectAssign, objectFreeze } from '../utilities';
import { aliasRegistration, allResources, createInterface, singletonRegistration } from '../utilities-di';
import { appendManyToTemplate, appendToTemplate, createComment, createElement, createText, insertBefore, insertManyBefore, isElement, isTextNode } from '../utilities-dom';
import { oneTime, type BindingMode, toView, fromView, twoWay, defaultMode } from '../binding/interfaces-bindings';

import type {
  IContainer,
  Constructable,
  Writable,
} from '@aurelia/kernel';
import type { AnyBindingExpression } from '@aurelia/runtime';
import type { CustomAttributeDefinition } from '../resources/custom-attribute';
import type { PartialCustomElementDefinition } from '../resources/custom-element';
import type { ICompliationInstruction, IInstruction, } from '../renderer';
import type { IAuSlotProjections } from '../templating/controller.projection';
import { ErrorNames, createMappedError } from '../errors';

export class TemplateCompiler implements ITemplateCompiler {
  public static register(container: IContainer): void {
    container.register(
      singletonRegistration(this, this),
      aliasRegistration(this, ITemplateCompiler)
    );
  }

  public debug: boolean = false;
  public resolveResources: boolean = true;

  public compile(
    partialDefinition: PartialCustomElementDefinition,
    container: IContainer,
    compilationInstruction: ICompliationInstruction | null,
  ): CustomElementDefinition {
    const definition = CustomElementDefinition.getOrCreate(partialDefinition);
    if (definition.template === null || definition.template === void 0) {
      return definition;
    }
    if (definition.needsCompile === false) {
      return definition;
    }
    compilationInstruction ??= emptyCompilationInstructions;

    const context = new CompilationContext(partialDefinition, container, compilationInstruction, null, null, void 0);
    const template = isString(definition.template) || !partialDefinition.enhance
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

    const compiledDef = CustomElementDefinition.create({
      ...partialDefinition,
      name: partialDefinition.name || generateElementName(),
      dependencies: (partialDefinition.dependencies ?? emptyArray).concat(context.deps ?? emptyArray),
      instructions: context.rows,
      surrogates: isTemplateElement
        ? this._compileSurrogate(template, context)
        : emptyArray,
      template,
      hasSlots: context.hasSlot,
      needsCompile: false,
    });

    if (context.deps != null) {
      // if we have a template like this
      //
      // my-app.html
      // <template as-custom-element="le-1">
      //  <le-2></le-2>
      // </template>
      // <template as-custom-element="le-2">...</template>
      //
      // without registering dependencies properly, <le-1> will not see <le-2> as a custom element
      const allDepsForLocalElements = [compiledDef.Type, ...compiledDef.dependencies, ...context.deps];
      for (const localElementType of context.deps) {
        (getElementDefinition(localElementType).dependencies as Key[]).push(...allDepsForLocalElements.filter(d => d !== localElementType));
      }
    }

    return compiledDef;
  }

  public compileSpread(
    requestor: CustomElementDefinition,
    attrSyntaxs: AttrSyntax[],
    container: IContainer,
    target: Element,
    targetDef?: CustomElementDefinition,
  ): IInstruction[] {
    const context = new CompilationContext(requestor, container, emptyCompilationInstructions, null, null, void 0);
    const instructions: IInstruction[] = [];
    const elDef = targetDef ?? context._findElement(target.nodeName.toLowerCase());
    const isCustomElement = elDef !== null;
    const exprParser = context._exprParser;
    const ii = attrSyntaxs.length;
    let i = 0;
    let attrSyntax: AttrSyntax;
    let attrDef: CustomAttributeDefinition | null = null;
    let attrInstructions: (HydrateAttributeInstruction | HydrateTemplateController)[] | undefined;
    let attrBindableInstructions: IInstruction[];
    // eslint-disable-next-line
    let bindablesInfo: BindablesInfo<0> | BindablesInfo<1>;
    let bindable: BindableDefinition;
    let primaryBindable: BindableDefinition;
    let bindingCommand: BindingCommandInstance | null = null;
    let expr: AnyBindingExpression;
    let isMultiBindings: boolean;
    let attrTarget: string;
    let attrValue: string;

    for (; ii > i; ++i) {
      attrSyntax = attrSyntaxs[i];

      attrTarget = attrSyntax.target;
      attrValue = attrSyntax.rawValue;

      bindingCommand = context._createCommand(attrSyntax);
      if (bindingCommand !== null && bindingCommand.type === ctIgnoreAttr) {
        // when the binding command overrides everything
        // just pass the target as is to the binding command, and treat it as a normal attribute:
        // active.class="..."
        // background.style="..."
        // my-attr.attr="..."

        commandBuildInfo.node = target;
        commandBuildInfo.attr = attrSyntax;
        commandBuildInfo.bindable = null;
        commandBuildInfo.def = null;
        instructions.push(bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper));

        // to next attribute
        continue;
      }

      attrDef = context._findAttr(attrTarget);
      if (attrDef !== null) {
        if (attrDef.isTemplateController) {
          throw createMappedError(ErrorNames.no_spread_template_controller, attrTarget);
        }
        bindablesInfo = BindablesInfo.from(attrDef, true);
        // Custom attributes are always in multiple binding mode,
        // except when they can't be
        // When they cannot be:
        //        * has explicit configuration noMultiBindings: false
        //        * has binding command, ie: <div my-attr.bind="...">.
        //          In this scenario, the value of the custom attributes is required to be a valid expression
        //        * has no colon: ie: <div my-attr="abcd">
        //          In this scenario, it's simply invalid syntax.
        //          Consider style attribute rule-value pair: <div style="rule: ruleValue">
        isMultiBindings = attrDef.noMultiBindings === false
          && bindingCommand === null
          && hasInlineBindings(attrValue);
        if (isMultiBindings) {
          attrBindableInstructions = this._compileMultiBindings(target, attrValue, attrDef, context);
        } else {
          primaryBindable = bindablesInfo.primary;
          // custom attribute + single value + WITHOUT binding command:
          // my-attr=""
          // my-attr="${}"
          if (bindingCommand === null) {
            expr = exprParser.parse(attrValue, etInterpolation);
            attrBindableInstructions = [
              expr === null
                ? new SetPropertyInstruction(attrValue, primaryBindable.name)
                : new InterpolationInstruction(expr, primaryBindable.name)
            ];
          } else {
            // custom attribute with binding command:
            // my-attr.bind="..."
            // my-attr.two-way="..."

            commandBuildInfo.node = target;
            commandBuildInfo.attr = attrSyntax;
            commandBuildInfo.bindable = primaryBindable;
            commandBuildInfo.def = attrDef;
            attrBindableInstructions = [bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper)];
          }
        }

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

      if (bindingCommand === null) {
        expr = exprParser.parse(attrValue, etInterpolation);

        // reaching here means:
        // + maybe a bindable attribute with interpolation
        // + maybe a plain attribute with interpolation
        // + maybe a plain attribute
        if (isCustomElement) {
          bindablesInfo = BindablesInfo.from(elDef, false);
          bindable = bindablesInfo.attrs[attrTarget];
          if (bindable !== void 0) {
            expr = exprParser.parse(attrValue, etInterpolation);
            instructions.push(
              new SpreadElementPropBindingInstruction(
                expr == null
                  ? new SetPropertyInstruction(attrValue, bindable.name)
                  : new InterpolationInstruction(expr, bindable.name)
              )
            );

            continue;
          }
        }

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
        if (isCustomElement) {
          // if the element is a custom element
          // - prioritize bindables on a custom element before plain attributes
          bindablesInfo = BindablesInfo.from(elDef, false);
          bindable = bindablesInfo.attrs[attrTarget];
          if (bindable !== void 0) {
            commandBuildInfo.node = target;
            commandBuildInfo.attr = attrSyntax;
            commandBuildInfo.bindable = bindable;
            commandBuildInfo.def = elDef;
            instructions.push(new SpreadElementPropBindingInstruction(bindingCommand.build(
              commandBuildInfo,
              context._exprParser,
              context._attrMapper
            )));
            continue;
          }
        }

        commandBuildInfo.node = target;
        commandBuildInfo.attr = attrSyntax;
        commandBuildInfo.bindable = null;
        commandBuildInfo.def = null;
        instructions.push(bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper));
      }
    }

    resetCommandBuildInfo();

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
    let attrDef: CustomAttributeDefinition | null = null;
    let attrInstructions: HydrateAttributeInstruction[] | undefined;
    let attrBindableInstructions: IInstruction[];
    // eslint-disable-next-line
    let bindableInfo: BindablesInfo<0> | BindablesInfo<1>;
    let primaryBindable: BindableDefinition;
    let bindingCommand: BindingCommandInstance | null = null;
    let expr: AnyBindingExpression;
    let isMultiBindings: boolean;
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

      bindingCommand = context._createCommand(attrSyntax);
      if (bindingCommand !== null && bindingCommand.type === ctIgnoreAttr) {
        // when the binding command overrides everything
        // just pass the target as is to the binding command, and treat it as a normal attribute:
        // active.class="..."
        // background.style="..."
        // my-attr.attr="..."

        commandBuildInfo.node = el;
        commandBuildInfo.attr = attrSyntax;
        commandBuildInfo.bindable = null;
        commandBuildInfo.def = null;
        instructions.push(bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper));

        // to next attribute
        continue;
      }

      attrDef = context._findAttr(realAttrTarget);
      if (attrDef !== null) {
        if (attrDef.isTemplateController) {
          throw createMappedError(ErrorNames.compiler_no_tc_on_surrogate, realAttrTarget);
        }
        bindableInfo = BindablesInfo.from(attrDef, true);
        // Custom attributes are always in multiple binding mode,
        // except when they can't be
        // When they cannot be:
        //        * has explicit configuration noMultiBindings: false
        //        * has binding command, ie: <div my-attr.bind="...">.
        //          In this scenario, the value of the custom attributes is required to be a valid expression
        //        * has no colon: ie: <div my-attr="abcd">
        //          In this scenario, it's simply invalid syntax.
        //          Consider style attribute rule-value pair: <div style="rule: ruleValue">
        isMultiBindings = attrDef.noMultiBindings === false
          && bindingCommand === null
          && hasInlineBindings(realAttrValue);
        if (isMultiBindings) {
          attrBindableInstructions = this._compileMultiBindings(el, realAttrValue, attrDef, context);
        } else {
          primaryBindable = bindableInfo.primary;
          // custom attribute + single value + WITHOUT binding command:
          // my-attr=""
          // my-attr="${}"
          if (bindingCommand === null) {
            expr = exprParser.parse(realAttrValue, etInterpolation);
            attrBindableInstructions = [
              expr === null
                ? new SetPropertyInstruction(realAttrValue, primaryBindable.name)
                : new InterpolationInstruction(expr, primaryBindable.name)
            ];
          } else {
            // custom attribute with binding command:
            // my-attr.bind="..."
            // my-attr.two-way="..."

            commandBuildInfo.node = el;
            commandBuildInfo.attr = attrSyntax;
            commandBuildInfo.bindable = primaryBindable;
            commandBuildInfo.def = attrDef;
            attrBindableInstructions = [bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper)];
          }
        }

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

        commandBuildInfo.node = el;
        commandBuildInfo.attr = attrSyntax;
        commandBuildInfo.bindable = null;
        commandBuildInfo.def = null;
        instructions.push(bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper));
      }
    }

    resetCommandBuildInfo();

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

      bindingCommand = context._createCommand(attrSyntax);
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
        expr === null ? new PrimitiveLiteralExpression(realAttrValue) : expr,
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
  // eslint-disable-next-line
  private _compileElement(el: Element, context: CompilationContext): Node | null {
    // overall, the template compiler does it job by compiling one node,
    // and let that the process of compiling that node point to the next node to be compiled.
    // ----------------------------------------
    // a summary of this 650 line long function:
    // 1. walk through all attributes to put them into their corresponding instruction groups
    //    template controllers      -> list 1
    //    custom attributes         -> list 2
    //    plain attrs with bindings -> list 3
    //    el bindables              -> list 4
    // 2. ensure element instruction is present
    //    2.1.
    //      if element is an <au-slot/> compile its content into auSlot property of the element instruction created
    // 3. sort instructions:
    //    hydrate custom element instruction
    //    hydrate custom attribute instructions
    //    rest kept as is (except special cases & to-be-decided)
    //    3.1
    //      mark this element as a target for later hydration
    // 4. Compiling child nodes of this element
    //    4.1.
    //      If 1 or more [Template controller]:
    //      4.1.1.
    //          Start processing the most inner (most right TC in list 1) similarly to step 4.2:
    //          4.1.1.0.
    //          let innerContext = context.createChild();
    //          4.1.1.1.
    //              walks through the child nodes, and perform a [au-slot] check
    //              - if this is a custom element, then extract all [au-slot] annotated elements into corresponding templates by their target slot name
    //              - else throw an error as [au-slot] is used on non-custom-element
    //          4.1.1.2.
    //              recursively compiles the child nodes into the innerContext
    //      4.1.2.
    //          Start processing other Template controllers by walking the TC list (list 1) RIGHT -> LEFT
    //          Explanation:
    //              If there' are multiple template controllers on an element,
    //              only the most inner template controller will have access to the template with the current element
    //              other "outer" template controller will only need to see a marker pointing to a definition of the inner one
    //    4.2.
    //      NO [Template controller]
    //      4.2.1.
    //          walks through the child nodes, and perform a [au-slot] check
    //          - if this is a custom element, then extract all [au-slot] annotated elements into corresponding templates by their target slot name
    //          - else throw an error as [au-slot] is used on non-custom-element
    //      4.2.2
    //          recursively compiles the child nodes into the current context
    // 5. Returning the next node for the compilation
    const nextSibling = el.nextSibling;
    const elName = (el.getAttribute('as-element') ?? el.nodeName).toLowerCase();
    const elDef = context._findElement(elName);

    const isCustomElement = elDef !== null;
    const isShadowDom = isCustomElement && elDef.shadowOptions != null;
    const capture = elDef?.capture;
    const hasCaptureFilter = capture != null && typeof capture !== 'boolean';
    const captures: AttrSyntax[] = capture ? [] : emptyArray;
    const exprParser = context._exprParser;
    const removeAttr = this.debug
      ? noop
      : () => {
        el.removeAttribute(attrName);
        --i;
        --ii;
      };
    let attrs = el.attributes;
    let instructions: IInstruction[] | undefined;
    let ii = attrs.length;
    let i = 0;
    let attr: Attr;
    let attrName: string;
    let attrValue: string;
    let attrSyntax: AttrSyntax;
    /**
     * A list of plain attribute bindings/interpolation bindings
     */
    let plainAttrInstructions: IInstruction[] | undefined;
    let elBindableInstructions: IInstruction[] | undefined;
    let attrDef: CustomAttributeDefinition | null = null;
    let isMultiBindings = false;
    let bindable: BindableDefinition;
    let attrInstructions: HydrateAttributeInstruction[] | undefined;
    let attrBindableInstructions: IInstruction[];
    let tcInstructions: HydrateTemplateController[] | undefined;
    let tcInstruction: HydrateTemplateController | undefined;
    let expr: AnyBindingExpression;
    let elementInstruction: HydrateElementInstruction | undefined;
    let bindingCommand: BindingCommandInstance | null = null;
    // eslint-disable-next-line
    let bindablesInfo: BindablesInfo<0> | BindablesInfo<1>;
    let primaryBindable: BindableDefinition;
    let realAttrTarget: string;
    let realAttrValue: string;
    let processContentResult: boolean | undefined | void = true;
    let hasContainerless = false;
    let canCapture = false;
    let needsMarker = false;

    if (elName === 'slot') {
      if (context.root.def.shadowOptions == null) {
        throw createMappedError(ErrorNames.compiler_slot_without_shadowdom, context.root.def.name);
      }
      context.root.hasSlot = true;
    }
    if (isCustomElement) {
      // todo: this is a bit ... powerful
      // maybe do not allow it to process its own attributes
      processContentResult = elDef.processContent?.call(elDef.Type, el, context.p);
      // might have changed during the process
      attrs = el.attributes;
      ii = attrs.length;
    }

    // 1. walk and compile through all attributes
    //    for each of them, put in appropriate group.
    //    ex. plain attr with binding -> plain attr instruction list
    //        template controller     -> tc instruction list
    //        custom attribute        -> ca instruction list
    //        el bindable attribute   -> el bindable instruction list
    for (; ii > i; ++i) {
      attr = attrs[i];
      attrName = attr.name;
      attrValue = attr.value;
      switch (attrName) {
        case 'as-element':
        case 'containerless':
          removeAttr();
          if (!hasContainerless) {
            hasContainerless = attrName === 'containerless';
          }
          continue;
      }

      attrSyntax = context._attrParser.parse(attrName, attrValue);
      bindingCommand = context._createCommand(attrSyntax);

      realAttrTarget = attrSyntax.target;
      realAttrValue = attrSyntax.rawValue;

      if (capture && (!hasCaptureFilter || hasCaptureFilter && capture(realAttrTarget))) {
        if (bindingCommand != null && bindingCommand.type === ctIgnoreAttr) {
          removeAttr();
          captures.push(attrSyntax);
          continue;
        }

        canCapture = realAttrTarget !== AU_SLOT && realAttrTarget !== 'slot';
        if (canCapture) {
          bindablesInfo = BindablesInfo.from(elDef, false);
          // if capture is on, capture everything except:
          // - as-element
          // - containerless
          // - bindable properties
          // - template controller
          // - custom attribute
          if (bindablesInfo.attrs[realAttrTarget] == null && !context._findAttr(realAttrTarget)?.isTemplateController) {
            removeAttr();
            captures.push(attrSyntax);
            continue;
          }
        }
      }

      if (bindingCommand?.type === ctIgnoreAttr) {
        // when the binding command overrides everything
        // just pass the target as is to the binding command, and treat it as a normal attribute:
        // active.class="..."
        // background.style="..."
        // my-attr.attr="..."

        commandBuildInfo.node = el;
        commandBuildInfo.attr = attrSyntax;
        commandBuildInfo.bindable = null;
        commandBuildInfo.def = null;
        (plainAttrInstructions ??= []).push(bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper));

        removeAttr();
        // to next attribute
        continue;
      }

      // reaching here means:
      // + there may or may not be a binding command, but it won't be an overriding command

      if (isCustomElement) {
        // if the element is a custom element
        // - prioritize bindables on a custom element before plain attributes
        bindablesInfo = BindablesInfo.from(elDef, false);
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
            commandBuildInfo.node = el;
            commandBuildInfo.attr = attrSyntax;
            commandBuildInfo.bindable = bindable;
            commandBuildInfo.def = elDef;
            (elBindableInstructions ??= []).push(bindingCommand.build(
              commandBuildInfo,
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
      }

      // reaching here means:
      // + there may or may not be a binding command, but it won't be an overriding command
      // + the attribute is not targeting a bindable property of a custom element
      //
      // + maybe it's a custom attribute
      // + maybe it's a plain attribute

      // check for custom attributes before plain attributes
      attrDef = context._findAttr(realAttrTarget);
      if (attrDef !== null) {
        bindablesInfo = BindablesInfo.from(attrDef, true);
        // Custom attributes are always in multiple binding mode,
        // except when they can't be
        // When they cannot be:
        //        * has explicit configuration noMultiBindings: false
        //        * has binding command, ie: <div my-attr.bind="...">.
        //          In this scenario, the value of the custom attributes is required to be a valid expression
        //        * has no colon: ie: <div my-attr="abcd">
        //          In this scenario, it's simply invalid syntax.
        //          Consider style attribute rule-value pair: <div style="rule: ruleValue">
        isMultiBindings = attrDef.noMultiBindings === false
          && bindingCommand === null
          && hasInlineBindings(realAttrValue);
        if (isMultiBindings) {
          attrBindableInstructions = this._compileMultiBindings(el, realAttrValue, attrDef, context);
        } else {
          primaryBindable = bindablesInfo.primary;
          // custom attribute + single value + WITHOUT binding command:
          // my-attr=""
          // my-attr="${}"
          if (bindingCommand === null) {
            expr = exprParser.parse(realAttrValue, etInterpolation);
            attrBindableInstructions = [
              expr === null
                ? new SetPropertyInstruction(realAttrValue, primaryBindable.name)
                : new InterpolationInstruction(expr, primaryBindable.name)
            ];
          } else {
            // custom attribute with binding command:
            // my-attr.bind="..."
            // my-attr.two-way="..."

            commandBuildInfo.node = el;
            commandBuildInfo.attr = attrSyntax;
            commandBuildInfo.bindable = primaryBindable;
            commandBuildInfo.def = attrDef;
            attrBindableInstructions = [bindingCommand.build(commandBuildInfo, context._exprParser, context._attrMapper)];
          }
        }

        removeAttr();

        if (attrDef.isTemplateController) {
          (tcInstructions ??= []).push(new HydrateTemplateController(
            voidDefinition,
            // todo: def/ def.Type or def.name should be configurable
            //       example: AOT/runtime can use def.Type, but there are situation
            //       where instructions need to be serialized, def.name should be used
            this.resolveResources ? attrDef : attrDef.name,
            void 0,
            attrBindableInstructions,
          ));
        } else {
          (attrInstructions ??= []).push(new HydrateAttributeInstruction(
            // todo: def/ def.Type or def.name should be configurable
            //       example: AOT/runtime can use def.Type, but there are situation
            //       where instructions need to be serialized, def.name should be used
            this.resolveResources ? attrDef : attrDef.name,
            attrDef.aliases != null && attrDef.aliases.includes(realAttrTarget) ? realAttrTarget : void 0,
            attrBindableInstructions
          ));
        }
        continue;
      }

      // reaching here means:
      // + it's a plain attribute
      // + there may or may not be a binding command, but it won't be an overriding command

      if (bindingCommand === null) {
        // reaching here means:
        // + maybe a plain attribute with interpolation
        // + maybe a plain attribute
        expr = exprParser.parse(realAttrValue, etInterpolation);
        if (expr != null) {
          // if it's an interpolation, remove the attribute
          removeAttr();

          (plainAttrInstructions ??= []).push(new InterpolationInstruction(
            expr,
            // if not a bindable, then ensure plain attribute are mapped correctly:
            // e.g: colspan -> colSpan
            //      innerhtml -> innerHTML
            //      minlength -> minLength etc...
            context._attrMapper.map(el, realAttrTarget) ?? camelCase(realAttrTarget)
          ));
        }
        continue;
      }

      // reaching here means:
      // + has binding command
      // + not an overriding binding command
      // + not a custom attribute
      // + not a custom element bindable

      commandBuildInfo.node = el;
      commandBuildInfo.attr = attrSyntax;
      commandBuildInfo.bindable = null;
      commandBuildInfo.def = null;
      (plainAttrInstructions ??= []).push(bindingCommand.build(
        commandBuildInfo,
        context._exprParser,
        context._attrMapper
      ));
      removeAttr();
    }

    resetCommandBuildInfo();

    if (this._shouldReorderAttrs(el, plainAttrInstructions) && plainAttrInstructions != null && plainAttrInstructions.length > 1) {
      this._reorder(el, plainAttrInstructions);
    }

    // 2. ensure that element instruction is present if this element is a custom element
    if (isCustomElement) {
      elementInstruction = new HydrateElementInstruction(
        // todo: def/ def.Type or def.name should be configurable
        //       example: AOT/runtime can use def.Type, but there are situation
        //       where instructions need to be serialized, def.name should be used
        this.resolveResources ? elDef : elDef.name,
        void 0,
        (elBindableInstructions ?? emptyArray) as IInstruction[],
        null,
        hasContainerless,
        captures,
      );

      // 2.1 prepare fallback content for <au-slot/>
      if (elName === AU_SLOT) {
        const slotName = el.getAttribute('name') || /* name="" is the same with no name */DEFAULT_SLOT_NAME;
        const template = context.t();
        const fallbackContentContext = context._createChild();
        let node: Node | null = el.firstChild;
        let count = 0;
        while (node !== null) {
          // a special case:
          // <au-slot> doesn't have its own template
          // so anything attempting to project into it is discarded
          // doing so during compilation via removing the node,
          // instead of considering it as part of the fallback view
          if (isElement(node) && node.hasAttribute(AU_SLOT)) {
            if (__DEV__) {
              // eslint-disable-next-line no-console
              console.warn(
                `[DEV:aurelia] detected [au-slot] attribute on a child node`,
                `of an <au-slot> element: "<${node.nodeName} au-slot>".`,
                `This element will be ignored and removed`
              );
            }
            el.removeChild(node);
          } else {
            appendToTemplate(template, node);
            count++;
          }
          node = el.firstChild;
        }

        if (count > 0) {
          this._compileNode(template.content, fallbackContentContext);
        }

        elementInstruction.auSlot = {
          name: slotName,
          fallback: CustomElementDefinition.create({
            name: generateElementName(),
            template,
            instructions: fallbackContentContext.rows,
            needsCompile: false,
          }),
        };
        // todo: shouldn't have to eagerly replace everything like this
        // this is a leftover refactoring work from the old binder
        // el = this._replaceByMarker(el, context);
      }
    }

    // 3. merge and sort all instructions into a single list
    //    as instruction list for this element
    if (plainAttrInstructions != null
      || elementInstruction != null
      || attrInstructions != null
    ) {
      instructions = emptyArray.concat(
        elementInstruction ?? emptyArray,
        attrInstructions ?? emptyArray,
        plainAttrInstructions ?? emptyArray,
      );
      // 3.1 mark as template for later hydration
      // this._markAsTarget(el, context);
      needsMarker = true;
    }

    // 4. compiling child nodes
    let shouldCompileContent: boolean;
    if (tcInstructions != null) {
      // 4.1 if there is 1 or more [Template controller]
      ii = tcInstructions.length - 1;
      i = ii;
      tcInstruction = tcInstructions[i];

      let template: HTMLTemplateElement;
      if (isMarker(el)) {
        template = context.t();
        appendManyToTemplate(template, [
          // context.h(MARKER_NODE_NAME),
          context._marker(),
          context._comment(auStartComment),
          context._comment(auEndComment),
        ]);
      } else {
        // assumption: el.parentNode is not null
        // but not always the case: e.g compile/enhance an element without parent with TC on it
        this._replaceByMarker(el, context);
        if (el.nodeName === 'TEMPLATE') {
          template = el as HTMLTemplateElement;
        } else {
          template = context.t();
          appendToTemplate(template, el);
        }

      }
      const mostInnerTemplate = template;
      // 4.1.1.0. prepare child context for the inner template compilation
      const childContext = context._createChild(instructions == null ? [] : [instructions]);

      let childEl: Element;
      let targetSlot: string | null;
      let hasAuSlot = false;
      let projections: IAuSlotProjections | undefined;
      let slotTemplateRecord: Record<string, (Node | Element | DocumentFragment)[]> | undefined;
      let slotTemplates: (Node | Element | DocumentFragment)[];
      let slotTemplate: Node | Element | DocumentFragment;
      let marker: Comment;
      let projectionCompilationContext: CompilationContext;
      let j = 0, jj = 0;
      // 4.1.1.1.
      //  walks through the child nodes, and perform [au-slot] check
      //  note: this is a bit different with the summary above, possibly wrong since it will not throw
      //        on [au-slot] used on a non-custom-element + with a template controller on it
      // for each child element of a custom element
      // scan for [au-slot], if there's one
      // then extract the element into a projection definition
      // this allows support for [au-slot] declared on the same element with anther template controller
      // e.g:
      //
      // can do:
      //  <my-el>
      //    <div au-slot if.bind="..."></div>
      //    <div if.bind="..." au-slot></div>
      //  </my-el>
      //
      // instead of:
      //  <my-el>
      //    <template au-slot><div if.bind="..."></div>
      //  </my-el>
      let child: Node | null = el.firstChild;
      let isEmptyTextNode = false;
      if (processContentResult !== false) {
        while (child !== null) {
          targetSlot = isElement(child) ? child.getAttribute(AU_SLOT) : null;
          hasAuSlot = targetSlot !== null || isCustomElement && !isShadowDom;
          childEl = child.nextSibling as Element;
          if (hasAuSlot) {
            if (!isCustomElement) {
              throw createMappedError(ErrorNames.compiler_au_slot_on_non_element, targetSlot, elName);
            }
            (child as Element).removeAttribute?.(AU_SLOT);
            // ignore all whitespace
            isEmptyTextNode = isTextNode(child) && child.textContent!.trim() === '';
            if (!isEmptyTextNode) {
              ((slotTemplateRecord ??= {})[targetSlot || DEFAULT_SLOT_NAME] ??= []).push(child);
            }
            el.removeChild(child);
          }
          child = childEl;
        }
      }

      if (slotTemplateRecord != null) {
        projections = {};
        // aggregate all content targeting the same slot
        // into a single template
        // with some special rule around <template> element
        for (targetSlot in slotTemplateRecord) {
          template = context.t();
          slotTemplates = slotTemplateRecord[targetSlot];
          for (j = 0, jj = slotTemplates.length; jj > j; ++j) {
            slotTemplate = slotTemplates[j];
            if (slotTemplate.nodeName === 'TEMPLATE') {
              // this means user has some thing more than [au-slot] on a template
              // consider this intentional, and use it as is
              // e.g:
              // case 1
              // <my-element>
              //   <template au-slot repeat.for="i of items">
              // ----vs----
              // case 2
              // <my-element>
              //   <template au-slot>this is just some static stuff <b>And a b</b></template>
              if ((slotTemplate as Element).attributes.length > 0) {
                // case 1
                appendToTemplate(template, slotTemplate);
              } else {
                // case 2
                appendToTemplate(template, (slotTemplate as HTMLTemplateElement).content);
              }
            } else {
              appendToTemplate(template, slotTemplate);
            }
          }

          // after aggregating all the [au-slot] templates into a single one
          // compile it
          // technically, the most inner template controller compilation context
          // is the parent of this compilation context
          // but for simplicity in compilation, maybe start with a flatter hierarchy
          // also, it wouldn't have any real uses
          projectionCompilationContext = context._createChild();
          this._compileNode(template.content, projectionCompilationContext);
          projections[targetSlot] = CustomElementDefinition.create({
            name: generateElementName(),
            template,
            instructions: projectionCompilationContext.rows,
            needsCompile: false,
          });
        }
        elementInstruction!.projections = projections;
      }

      if (needsMarker) {
        if (isCustomElement && (hasContainerless || elDef.containerless)) {
          this._replaceByMarker(el, context);
        } else {
          this._markAsTarget(el, context);
        }
      }

      shouldCompileContent = !isCustomElement || !elDef.containerless && !hasContainerless && processContentResult !== false;
      if (shouldCompileContent) {
        // 4.1.1.2:
        //  recursively compiles the child nodes into the inner context
        // important:
        // ======================
        // only goes inside a template, if there is a template controller on it
        // otherwise, leave it alone
        if (el.nodeName === TEMPLATE_NODE_NAME) {
          this._compileNode((el as HTMLTemplateElement).content, childContext);
        } else {
          child = el.firstChild;
          while (child !== null) {
            child = this._compileNode(child, childContext);
          }
        }
      }
      tcInstruction.def = CustomElementDefinition.create({
        name: generateElementName(),
        template: mostInnerTemplate,
        instructions: childContext.rows,
        needsCompile: false,
      });

      // 4.1.2.
      //  Start processing other Template controllers by walking the TC list (list 1) RIGHT -> LEFT
      while (i-- > 0) {
        // for each of the template controller from [right] to [left]
        // do create:
        // (1) a template
        // (2) add a marker to the template
        // (3) an instruction
        // instruction will be corresponded to the marker
        // =========================

        tcInstruction = tcInstructions[i];
        template = context.t();
        // appending most inner template is inaccurate, as the most outer one
        // is not really the parent of the most inner one
        // but it's only for the purpose of creating a marker,
        // so it's just an optimization hack
        // marker = this._markAsTarget(context.h(MARKER_NODE_NAME));
        // marker = context.h(MARKER_NODE_NAME);
        marker = context._marker();
        appendManyToTemplate(template, [
          marker,
          context._comment(auStartComment),
          context._comment(auEndComment),
        ]);

        tcInstruction.def = CustomElementDefinition.create({
          name: generateElementName(),
          template,
          needsCompile: false,
          instructions: [[tcInstructions[i + 1]]],
        });
      }
      // the most outer template controller should be
      // the only instruction for peek instruction of the current context
      // e.g
      // <div if.bind="yes" with.bind="scope" repeat.for="i of items" data-id="i.id">
      // results in:
      // -----------
      //
      //  TC(if-[value=yes])
      //    | TC(with-[value=scope])
      //        | TC(repeat-[...])
      //            | div(data-id-[value=i.id])
      context.rows.push([tcInstruction]);
    } else {
      // 4.2
      //
      // if there's no template controller
      // then the instruction built is appropriate to be assigned as the peek row
      // and before the children compilation
      if (instructions != null) {
        context.rows.push(instructions);
      }

      let child = el.firstChild as Node | null;
      let childEl: Element;
      let targetSlot: string | null;
      let hasAuSlot: boolean = false;
      let projections: IAuSlotProjections | null = null;
      let slotTemplateRecord: Record<string, (Node | Element | DocumentFragment)[]> | undefined;
      let slotTemplates: (Node | Element | DocumentFragment)[];
      let slotTemplate: Node | Element | DocumentFragment;
      let template: HTMLTemplateElement;
      let projectionCompilationContext: CompilationContext;
      let isEmptyTextNode = false;
      let j = 0, jj = 0;
      // 4.2.1.
      //    walks through the child nodes and perform [au-slot] check
      // --------------------
      // for each child element of a custom element
      // scan for [au-slot], if there's one
      // then extract the element into a projection definition
      // this allows support for [au-slot] declared on the same element with anther template controller
      // e.g:
      //
      // can do:
      //  <my-el>
      //    <div au-slot if.bind="..."></div>
      //    <div if.bind="..." au-slot></div>
      //  </my-el>
      //
      // instead of:
      //  <my-el>
      //    <template au-slot><div if.bind="..."></div>
      //  </my-el>
      if (processContentResult !== false) {
        while (child !== null) {
          targetSlot = isElement(child) ? child.getAttribute(AU_SLOT) : null;
          hasAuSlot = targetSlot !== null || isCustomElement && !isShadowDom;
          childEl = child.nextSibling as Element;
          if (hasAuSlot) {
            if (!isCustomElement) {
              throw createMappedError(ErrorNames.compiler_au_slot_on_non_element, targetSlot, elName);
            }
            (child as Element).removeAttribute?.(AU_SLOT);
            // ignore all whitespace
            isEmptyTextNode = isTextNode(child) && child.textContent!.trim() === '';
            if (!isEmptyTextNode) {
              ((slotTemplateRecord ??= {})[targetSlot || DEFAULT_SLOT_NAME] ??= []).push(child);
            }
            el.removeChild(child);
          }
          child = childEl;
        }
      }

      if (slotTemplateRecord != null) {
        projections = {};
        // aggregate all content targeting the same slot
        // into a single template
        // with some special rule around <template> element
        for (targetSlot in slotTemplateRecord) {
          template = context.t();
          slotTemplates = slotTemplateRecord[targetSlot];
          for (j = 0, jj = slotTemplates.length; jj > j; ++j) {
            slotTemplate = slotTemplates[j];
            if (slotTemplate.nodeName === TEMPLATE_NODE_NAME) {
              // this means user has some thing more than [au-slot] on a template
              // consider this intentional, and use it as is
              // e.g:
              // case 1
              // <my-element>
              //   <template au-slot repeat.for="i of items">
              // ----vs----
              // case 2
              // <my-element>
              //   <template au-slot>this is just some static stuff <b>And a b</b></template>

              if ((slotTemplate as Element).attributes.length > 0) {
                // case 1
                appendToTemplate(template, slotTemplate);
              } else {
                // case 2
                appendToTemplate(template, (slotTemplate as HTMLTemplateElement).content);
              }
            } else {
              appendToTemplate(template, slotTemplate);
            }
          }

          // after aggregating all the [au-slot] templates into a single one
          // compile it
          projectionCompilationContext = context._createChild();
          this._compileNode(template.content, projectionCompilationContext);
          projections[targetSlot] = CustomElementDefinition.create({
            name: generateElementName(),
            template,
            instructions: projectionCompilationContext.rows,
            needsCompile: false,
          });
        }
        elementInstruction!.projections = projections;
      }

      if (needsMarker) {
        if (isCustomElement && (hasContainerless || elDef.containerless)) {
          this._replaceByMarker(el, context);
        } else {
          this._markAsTarget(el, context);
        }
      }

      shouldCompileContent = !isCustomElement || !elDef.containerless && !hasContainerless && processContentResult !== false;
      if (shouldCompileContent && el.childNodes.length > 0) {
        // 4.2.2
        //    recursively compiles the child nodes into current context
        child = el.firstChild;
        while (child !== null) {
          child = this._compileNode(child, context);
        }
      }
    }

    // 5. returns the next node to be compiled
    return nextSibling;
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
    attrDef: CustomAttributeDefinition,
    context: CompilationContext
  ): IInstruction[] {
    // custom attribute + multiple values:
    // my-attr="prop1: literal1 prop2.bind: ...; prop3: literal3"
    // my-attr="prop1.bind: ...; prop2.bind: ..."
    // my-attr="prop1: ${}; prop2.bind: ...; prop3: ${}"
    const bindableAttrsInfo = BindablesInfo.from(attrDef, true);
    const valueLength = attrRawValue.length;
    const instructions: IInstruction[] = [];

    let attrName: string | undefined = void 0;
    let attrValue: string | undefined = void 0;

    let start = 0;
    let ch = 0;
    let expr: AnyBindingExpression;
    let attrSyntax: AttrSyntax;
    let command: BindingCommandInstance | null;
    let bindable: BindableDefinition;

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
        command = context._createCommand(attrSyntax);
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
          commandBuildInfo.node = node;
          commandBuildInfo.attr = attrSyntax;
          commandBuildInfo.bindable = bindable;
          commandBuildInfo.def = attrDef;
          instructions.push(command.build(commandBuildInfo, context._exprParser, context._attrMapper));
        }

        // Skip whitespace after semicolon
        while (i < valueLength && attrRawValue.charCodeAt(++i) <= Char.Space);

        start = i;

        attrName = void 0;
        attrValue = void 0;
      }
    }

    resetCommandBuildInfo();

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

    for (const localTemplate of localTemplates) {
      if (localTemplate.parentNode !== root) {
        throw createMappedError(ErrorNames.compiler_local_el_not_under_root, elName);
      }

      const name = processTemplateName(elName, localTemplate, localTemplateNames);

      const content = localTemplate.content;
      const bindableEls = toArray(content.querySelectorAll('bindable'));
      const properties = new Set<string>();
      const attributes = new Set<string>();
      const bindables = bindableEls.reduce((allBindables: Record<string, PartialBindableDefinition>, bindableEl) => {
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

        allBindables[property] = { attribute: attribute ?? void 0, mode: getBindingMode(bindableEl) };

        return allBindables;
      }, {});
      class LocalTemplateType {}
      def(LocalTemplateType, 'name', { value: name });
      context._addLocalDep(defineElement({ name, template: localTemplate, bindables }, LocalTemplateType));

      root.removeChild(localTemplate);
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
      context._comment(auStartComment),
      context._comment(auEndComment),
    ]);
    parent.removeChild(node);
    return marker;
  }
}

// let nextSibling: Node | null;
// const MARKER_NODE_NAME = 'AU-M';
const TEMPLATE_NODE_NAME = 'TEMPLATE';
const auStartComment = 'au-start';
const auEndComment = 'au-end';
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
  public readonly def: PartialCustomElementDefinition;
  public readonly ci: ICompliationInstruction;
  public readonly _templateFactory: ITemplateElementFactory;
  public readonly _logger: ILogger;
  public readonly _attrParser: IAttributeParser;
  public readonly _attrMapper: IAttrMapper;
  public readonly _exprParser: IExpressionParser;
  public readonly p: IPlatform;
  // an array representing targets of instructions, built on depth first tree walking compilation
  public readonly rows: IInstruction[][];
  public readonly localEls: Set<string>;
  public hasSlot: boolean = false;
  public deps: CustomElementType[] | undefined;

  /** @internal */
  private readonly c: IContainer;

  public constructor(
    def: PartialCustomElementDefinition,
    container: IContainer,
    compilationInstruction: ICompliationInstruction,
    parent: CompilationContext | null,
    root: CompilationContext | null,
    instructions: IInstruction[][] | undefined,
  ) {
    const hasParent = parent !== null;
    this.c = container;
    this.root = root === null ? this : root;
    this.def = def;
    this.ci = compilationInstruction;
    this.parent = parent;
    this._templateFactory = hasParent ? parent._templateFactory : container.get(ITemplateElementFactory);
    // todo: attr parser should be retrieved based in resource semantic (current leaf + root + ignore parent)
    this._attrParser = hasParent ? parent._attrParser : container.get(IAttributeParser);
    this._exprParser = hasParent ? parent._exprParser : container.get(IExpressionParser);
    this._attrMapper = hasParent ? parent._attrMapper : container.get(IAttrMapper);
    this._logger = hasParent ? parent._logger : container.get(ILogger);
    this.p = hasParent ? parent.p : container.get(IPlatform);
    this.localEls = hasParent ? parent.localEls : new Set();
    this.rows = instructions ?? [];
  }

  public _addLocalDep(dep: CustomElementType) {
    (this.root.deps ??= []).push(dep);
    this.root.c.register(dep);
    return dep;
  }

  public _text(text: string) {
    return createText(this.p, text);
  }

  public _comment(text: string) {
    return createComment(this.p, text);
  }

  public _marker() {
    return this._comment('au*');
  }

  public h<K extends keyof HTMLElementTagNameMap>(name: K): HTMLElementTagNameMap[K];
  public h(name: string): HTMLElement;
  public h(name: string): HTMLElement {
    const el = createElement(this.p, name);
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
  public _findElement(name: string): CustomElementDefinition | null {
    return CustomElement.find(this.c, name);
  }

  /**
   * Find the custom attribute definition of a given name
   */
  public _findAttr(name: string): CustomAttributeDefinition | null {
    return CustomAttribute.find(this.c, name);
  }

  /**
   * Create a new child compilation context
   */
  public _createChild(instructions?: IInstruction[][]) {
    return new CompilationContext(this.def, this.c, this.ci, this, this.root, instructions);
  }

  // todo: ideally binding command shouldn't have to be cached
  // it can just be a singleton where it' retrieved
  // the resources semantic should be defined by the resource itself,
  // rather than baked in the container
  private readonly _commands: Record<string, BindingCommandInstance | null | undefined> = createLookup();
  /**
   * Retrieve a binding command resource instance.
   *
   * @param name - The parsed `AttrSyntax`
   *
   * @returns An instance of the command if it exists, or `null` if it does not exist.
   */
  public _createCommand(syntax: AttrSyntax): BindingCommandInstance | null {
    if (this.root !== this) {
      return this.root._createCommand(syntax);
    }
    const name = syntax.command;
    if (name === null) {
      return null;
    }
    let result = this._commands[name];
    let commandDef: BindingCommandDefinition | null;
    if (result === void 0) {
      commandDef = BindingCommand.find(this.c, name);
      if (commandDef == null) {
        throw createMappedError(ErrorNames.compiler_unknown_binding_command, name);
      }
      this._commands[name] = result = BindingCommand.get(this.c, name);
    }
    return result;
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

const resetCommandBuildInfo = (): void => {
  commandBuildInfo.node
    = commandBuildInfo.attr
    = commandBuildInfo.bindable
    = commandBuildInfo.def = null!;
};

const emptyCompilationInstructions: ICompliationInstruction = { projections: null };
// eslint-disable-next-line
const voidDefinition: CustomElementDefinition = { name: 'unnamed' } as CustomElementDefinition;
const commandBuildInfo: Writable<ICommandBuildInfo> = {
  node: null!,
  attr: null!,
  bindable: null,
  def: null,
};
const invalidSurrogateAttribute = objectAssign(createLookup<boolean | undefined>(), {
  'id': true,
  'name': true,
  'au-slot': true,
  'as-element': true,
});
const orderSensitiveInputType: Record<string, number> = {
  checkbox: 1,
  radio: 1,
  // todo: range is also sensitive to order, for min/max
};

const bindableAttrsInfoCache = new WeakMap<CustomElementDefinition | CustomAttributeDefinition, BindablesInfo>();
export class BindablesInfo<T extends 0 | 1 = 0> {
  public static from(def: CustomAttributeDefinition, isAttr: true): BindablesInfo<1>;
  // eslint-disable-next-line
  public static from(def: CustomElementDefinition, isAttr: false): BindablesInfo<0>;
  public static from(def: CustomElementDefinition | CustomAttributeDefinition, isAttr: boolean): BindablesInfo<1 | 0> {
    let info = bindableAttrsInfoCache.get(def);
    if (info == null) {
      type CA = CustomAttributeDefinition;
      const bindables = def.bindables;
      const attrs = createLookup<BindableDefinition>();
      const defaultBindingMode: BindingMode = isAttr
        ? (def as CA).defaultBindingMode === void 0
          ? defaultMode
          : (def as CA).defaultBindingMode
        : defaultMode;
      let bindable: BindableDefinition | undefined;
      let prop: string;
      let hasPrimary: boolean = false;
      let primary: BindableDefinition | undefined;
      let attr: string;

      // from all bindables, pick the first primary bindable
      // if there is no primary, pick the first bindable
      // if there's no bindables, create a new primary with property value
      for (prop in bindables) {
        bindable = bindables[prop];
        attr = bindable.attribute;
        if (bindable.primary === true) {
          if (hasPrimary) {
            throw createMappedError(ErrorNames.compiler_primary_already_existed, def);
          }
          hasPrimary = true;
          primary = bindable;
        } else if (!hasPrimary && primary == null) {
          primary = bindable;
        }

        attrs[attr] = BindableDefinition.create(prop, def.Type, bindable);
      }
      if (bindable == null && isAttr) {
        // if no bindables are present, default to "value"
        primary = attrs.value = BindableDefinition.create('value', def.Type, { mode: defaultBindingMode });
      }

      bindableAttrsInfoCache.set(def, info = new BindablesInfo(attrs, bindables, primary));
    }
    return info;
  }

  protected constructor(
    public readonly attrs: Record<string, BindableDefinition>,
    public readonly bindables: Record<string, BindableDefinition>,
    public readonly primary: T extends 1 ? BindableDefinition : BindableDefinition | undefined,
  ) {}
}

_START_CONST_ENUM();
const enum LocalTemplateBindableAttributes {
  name = "name",
  attribute = "attribute",
  mode = "mode",
}
_END_CONST_ENUM();
const allowedLocalTemplateBindableAttributes: readonly string[] = objectFreeze([
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

const getBindingMode = (bindable: Element): BindingMode => {
  switch (bindable.getAttribute(LocalTemplateBindableAttributes.mode)) {
    case 'oneTime':
      return oneTime;
    case 'toView':
      return toView;
    case 'fromView':
      return fromView;
    case 'twoWay':
      return twoWay;
    case 'default':
    default:
      return defaultMode;
  }
};

/**
 * An interface describing the hooks a compilation process should invoke.
 *
 * A feature available to the default template compiler.
 */
export const ITemplateCompilerHooks = /*@__PURE__*/createInterface<ITemplateCompilerHooks>('ITemplateCompilerHooks');
export interface ITemplateCompilerHooks {
  /**
   * Should be invoked immediately before a template gets compiled
   */
  compiling?(template: HTMLElement): void;
}

export const TemplateCompilerHooks = objectFreeze({
  name: /*@__PURE__*/getResourceKeyFor('compiler-hooks'),
  define<K extends ITemplateCompilerHooks, T extends Constructable<K>>(Type: T): T {
    return Registrable.define(Type, function (container) {
      singletonRegistration(ITemplateCompilerHooks, this).register(container);
    });
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
export const templateCompilerHooks = <T extends Constructable>(target?: T) => {
  return target === void 0 ? decorator : decorator(target);
  function decorator<T extends Constructable>(t: T): any {
    return TemplateCompilerHooks.define(t) as unknown as void;
  };
}
/* eslint-enable */

const DEFAULT_SLOT_NAME = 'default';
const AU_SLOT = 'au-slot';

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
