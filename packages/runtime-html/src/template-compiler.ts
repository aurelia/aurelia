import { emptyArray, Registration, toArray, ILogger, camelCase } from '@aurelia/kernel';
import { BindingMode, BindingType, Char, IExpressionParser, PrimitiveLiteralExpression } from '@aurelia/runtime';
import { IAttrMapper } from './attribute-mapper.js';
import { ITemplateElementFactory } from './template-element-factory.js';
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
} from './renderer.js';
import { AuSlotContentType, SlotInfo } from './resources/custom-elements/au-slot.js';
import { IPlatform } from './platform.js';
import { Bindable, BindableDefinition } from './bindable.js';
import { AttrSyntax, IAttributeParser } from './resources/attribute-pattern.js';
import { CustomAttribute } from './resources/custom-attribute.js';
import { CustomElement, CustomElementDefinition } from './resources/custom-element.js';
import { BindingCommand } from './resources/binding-command.js';
import { createLookup } from './utilities-html.js';

import type { IContainer, IResolver } from '@aurelia/kernel';
import type { AnyBindingExpression } from '@aurelia/runtime';
import type { CustomAttributeType, CustomAttributeDefinition } from './resources/custom-attribute.js';
import type { CustomElementType, PartialCustomElementDefinition } from './resources/custom-element.js';
import type { IProjections } from './resources/custom-elements/au-slot.js';
import type { BindingCommandInstance, ICommandBuildInfo } from './resources/binding-command.js';
import type { ICompliationInstruction, IInstruction, } from './renderer.js';

export class TemplateCompiler implements ITemplateCompiler {
  public static register(container: IContainer): IResolver<ITemplateCompiler> {
    return Registration.singleton(ITemplateCompiler, this).register(container);
  }

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
    const template = typeof definition.template === 'string' || !partialDefinition.enhance
      ? context.templateFactory.createTemplate(definition.template)
      : definition.template as Element;
    const isTemplateElement = template.nodeName === 'TEMPLATE' && (template as HTMLTemplateElement).content != null;
    const content = isTemplateElement ? (template as HTMLTemplateElement).content : template;

    if (template.hasAttribute(localTemplateIdentifier)) {
      throw new Error('The root cannot be a local template itself.');
    }
    this.local(content, context);
    this.node(content, context);

    const surrogates = isTemplateElement
      ? this.surrogate(template, context)
      : emptyArray;

    return CustomElementDefinition.create({
      ...partialDefinition,
      name: partialDefinition.name || CustomElement.generateName(),
      instructions: context.rows,
      surrogates,
      template,
      hasSlots: context.hasSlot,
      needsCompile: false,
    });
  }

  /** @internal */
  private surrogate(el: Element, context: CompilationContext): IInstruction[] {
    const instructions: IInstruction[] = [];
    const attrs = el.attributes;
    const attrParser = context.attrParser;
    const exprParser = context.exprParser;
    const attrMapper = context.attrMapper;
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
      attrSyntax = attrParser.parse(attrName, attrValue);

      realAttrTarget = attrSyntax.target;
      realAttrValue = attrSyntax.rawValue;

      if (invalidSurrogateAttribute[realAttrTarget]) {
        throw new Error(`Attribute ${attrName} is invalid on surrogate.`);
      }

      bindingCommand = context.command(attrSyntax);
      if (bindingCommand !== null && bindingCommand.bindingType & BindingType.IgnoreAttr) {
        // when the binding command overrides everything
        // just pass the target as is to the binding command, and treat it as a normal attribute:
        // active.class="..."
        // background.style="..."
        // my-attr.attr="..."
        expr = exprParser.parse(realAttrValue, bindingCommand.bindingType);

        commandBuildInfo.node = el;
        commandBuildInfo.attr = attrSyntax;
        commandBuildInfo.expr = expr;
        commandBuildInfo.bindable = null;
        commandBuildInfo.def = null;
        instructions.push(bindingCommand.build(commandBuildInfo));

        // to next attribute
        continue;
      }

      attrDef = context.attr(realAttrTarget);
      if (attrDef !== null) {
        if (attrDef.isTemplateController) {
          throw new Error(`Template controller ${realAttrTarget} is invalid on surrogate.`);
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
          attrBindableInstructions = this.multiBindings(el, realAttrValue, attrDef, context);
        } else {
          primaryBindable = bindableInfo.primary;
          // custom attribute + single value + WITHOUT binding command:
          // my-attr=""
          // my-attr="${}"
          if (bindingCommand === null) {
            expr = exprParser.parse(realAttrValue, BindingType.Interpolation);
            attrBindableInstructions = [
              expr === null
                ? new SetPropertyInstruction(realAttrValue, primaryBindable.property)
                : new InterpolationInstruction(expr, primaryBindable.property)
            ];
          } else {
            // custom attribute with binding command:
            // my-attr.bind="..."
            // my-attr.two-way="..."
            expr = exprParser.parse(realAttrValue, bindingCommand.bindingType);

            commandBuildInfo.node = el;
            commandBuildInfo.attr = attrSyntax;
            commandBuildInfo.expr = expr;
            commandBuildInfo.bindable = primaryBindable;
            commandBuildInfo.def = attrDef;
            attrBindableInstructions = [bindingCommand.build(commandBuildInfo)];
          }
        }

        el.removeAttribute(attrName);
        --i;
        --ii;
        (attrInstructions ??= []).push(new HydrateAttributeInstruction(
          attrDef.name,
          attrDef.aliases != null && attrDef.aliases.includes(realAttrTarget) ? realAttrTarget : void 0,
          attrBindableInstructions
        ));
        continue;
      }

      if (bindingCommand === null) {
        expr = exprParser.parse(realAttrValue, BindingType.Interpolation);
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
            attrMapper.map(el, realAttrTarget) ?? camelCase(realAttrTarget)
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
        expr = exprParser.parse(realAttrValue, bindingCommand.bindingType);

        commandBuildInfo.node = el;
        commandBuildInfo.attr = attrSyntax;
        commandBuildInfo.expr = expr;
        commandBuildInfo.bindable = null;
        commandBuildInfo.def = null;
        instructions.push(bindingCommand.build(commandBuildInfo));
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
  private node(node: Node, context: CompilationContext): Node | null {
    switch (node.nodeType) {
      case 1:
        switch (node.nodeName) {
          case 'LET':
            return this.declare(node as Element, context);
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
            return this.element(node as Element, context);
        }
      case 3:
        return this.text(node as Text, context);
      case 11: {
        let current: Node | null = (node as DocumentFragment).firstChild;
        while (current !== null) {
          current = this.node(current, context);
        }
        break;
      }
    }
    return node.nextSibling;
  }

  /** @internal */
  private declare(el: Element, context: CompilationContext): Node | null {
    const attrs = el.attributes;
    const ii = attrs.length;
    const letInstructions: LetBindingInstruction[] = [];
    const exprParser = context.exprParser;
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

      attrSyntax = context.attrParser.parse(attrName, attrValue);
      realAttrTarget = attrSyntax.target;
      realAttrValue = attrSyntax.rawValue;

      bindingCommand = context.command(attrSyntax);
      if (bindingCommand !== null) {
        // supporting one time may not be as simple as it appears
        // as the let expression could compute its value from various expressions,
        // which means some value could be unavailable by the time it computes.
        //
        // Onetime means it will not have appropriate value, but it's also a good thing,
        // since often one it's just a simple declaration
        // todo: consider supporting one-time for <let>
        if (bindingCommand.bindingType === BindingType.ToViewCommand
          || bindingCommand.bindingType === BindingType.BindCommand
        ) {
          letInstructions.push(new LetBindingInstruction(
            exprParser.parse(realAttrValue, bindingCommand.bindingType),
            camelCase(realAttrTarget)
          ));
          continue;
        }
        throw new Error(`Invalid command ${attrSyntax.command} for <let>. Only to-view/bind supported.`);
      }

      expr = exprParser.parse(realAttrValue, BindingType.Interpolation);
      if (expr === null) {
        context.logger.warn(
          `Property ${realAttrTarget} is declared with literal string ${realAttrValue}. ` +
          `Did you mean ${realAttrTarget}.bind="${realAttrValue}"?`
        );
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
    return this.mark(el).nextSibling;
  }

  /** @internal */
  // eslint-disable-next-line
  private element(el: Element, context: CompilationContext): Node | null {
    // instructions sort:
    // 1. hydrate custom element instruction
    // 2. hydrate custom attribute instructions
    // 3. rest kept as is (except special cases & to-be-decided)
    const nextSibling = el.nextSibling;
    const elName = (el.getAttribute('as-element') ?? el.nodeName).toLowerCase();
    const elDef = context.el(elName);
    const attrParser = context.attrParser;
    const exprParser = context.exprParser;
    const attrMapper = context.attrMapper;
    const isAttrsOrderSensitive = this.shouldReorderAttrs(el);
    let attrs = el.attributes;
    let instructions: IInstruction[] | undefined;
    let ii = attrs.length;
    let i = 0;
    let attr: Attr;
    let attrName: string;
    let attrValue: string;
    let attrSyntax: AttrSyntax;
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

    if (elName === 'slot') {
      context.root.hasSlot = true;
    }
    if (elDef !== null) {
      // todo: this is a bit ... powerful
      // maybe do not allow it to process its own attributes
      processContentResult = elDef.processContent?.call(elDef.Type, el, context.p);
      // might have changed during the process
      attrs = el.attributes;
      ii = attrs.length;
    }

    for (; ii > i; ++i) {
      attr = attrs[i];
      attrName = attr.name;
      attrValue = attr.value;
      if (attrName === 'as-element') {
        continue;
      }
      attrSyntax = attrParser.parse(attrName, attrValue);

      bindingCommand = context.command(attrSyntax);
      if (bindingCommand !== null && bindingCommand.bindingType & BindingType.IgnoreAttr) {
        // when the binding command overrides everything
        // just pass the target as is to the binding command, and treat it as a normal attribute:
        // active.class="..."
        // background.style="..."
        // my-attr.attr="..."
        expr = exprParser.parse(attrValue, bindingCommand.bindingType);

        commandBuildInfo.node = el;
        commandBuildInfo.attr = attrSyntax;
        commandBuildInfo.expr = expr;
        commandBuildInfo.bindable = null;
        commandBuildInfo.def = null;
        (plainAttrInstructions ??= []).push(bindingCommand.build(commandBuildInfo));

        // to next attribute
        continue;
      }

      realAttrTarget = attrSyntax.target;
      realAttrValue = attrSyntax.rawValue;
      // if not a ignore attribute binding command
      // then process with the next possibilities
      attrDef = context.attr(realAttrTarget);
      // when encountering an attribute,
      // custom attribute takes precedence over custom element bindables
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
          && hasInlineBindings(attrValue);
        if (isMultiBindings) {
          attrBindableInstructions = this.multiBindings(el, attrValue, attrDef, context);
        } else {
          primaryBindable = bindablesInfo.primary;
          // custom attribute + single value + WITHOUT binding command:
          // my-attr=""
          // my-attr="${}"
          if (bindingCommand === null) {
            expr = exprParser.parse(attrValue, BindingType.Interpolation);
            attrBindableInstructions = [
              expr === null
                ? new SetPropertyInstruction(attrValue, primaryBindable.property)
                : new InterpolationInstruction(expr, primaryBindable.property)
            ];
          } else {
            // custom attribute with binding command:
            // my-attr.bind="..."
            // my-attr.two-way="..."
            expr = exprParser.parse(attrValue, bindingCommand.bindingType);

            commandBuildInfo.node = el;
            commandBuildInfo.attr = attrSyntax;
            commandBuildInfo.expr = expr;
            commandBuildInfo.bindable = primaryBindable;
            commandBuildInfo.def = attrDef;
            attrBindableInstructions = [bindingCommand.build(commandBuildInfo)];
          }
        }

        el.removeAttribute(attrName);
        --i;
        --ii;

        if (attrDef.isTemplateController) {
          (tcInstructions ??= []).push(new HydrateTemplateController(
            voidDefinition,
            attrDef.name,
            void 0,
            attrBindableInstructions,
          ));

          // to next attribute
          continue;
        }

        (attrInstructions ??= []).push(new HydrateAttributeInstruction(
          attrDef.name,
          attrDef.aliases != null && attrDef.aliases.includes(realAttrTarget) ? realAttrTarget : void 0,
          attrBindableInstructions
        ));
        continue;
      }

      if (bindingCommand === null) {
        // reaching here means:
        // + maybe a bindable attribute with interpolation
        // + maybe a plain attribute with interpolation
        // + maybe a plain attribute
        if (elDef !== null) {
          bindablesInfo = BindablesInfo.from(elDef, false);
          bindable = bindablesInfo.attrs[realAttrTarget];
          if (bindable !== void 0) {
            expr = exprParser.parse(realAttrValue, BindingType.Interpolation);
            elBindableInstructions ??= [];
            if (expr != null) {
              // if it's an interpolation, remove the attribute
              el.removeAttribute(attrName);
              --i;
              --ii;

              elBindableInstructions.push(new InterpolationInstruction(expr, bindable.property));
            } else {
              elBindableInstructions.push(new SetPropertyInstruction(realAttrValue, bindable.property));
            }

            continue;
          }
        }

        // reaching here means:
        // + maybe a plain attribute with interpolation
        // + maybe a plain attribute
        expr = exprParser.parse(realAttrValue, BindingType.Interpolation);
        if (expr != null) {
          // if it's an interpolation, remove the attribute
          el.removeAttribute(attrName);
          --i;
          --ii;

          (plainAttrInstructions ??= []).push(new InterpolationInstruction(
            expr,
            // if not a bindable, then ensure plain attribute are mapped correctly:
            // e.g: colspan -> colSpan
            //      innerhtml -> innerHTML
            //      minlength -> minLength etc...
            attrMapper.map(el, realAttrTarget) ?? camelCase(realAttrTarget)
          ));
        }
        // if not a custom attribute + no binding command + not a bindable + not an interpolation
        // then it's just a plain attribute, do nothing
        continue;
      }

      // reaching here means:
      // + has binding command
      // + not an overriding binding command
      // + not a custom attribute

      if (elDef !== null) {
        // if the element is a custom element
        // - prioritize bindables on a custom element before plain attributes
        bindablesInfo = BindablesInfo.from(elDef, false);
        bindable = bindablesInfo.attrs[realAttrTarget];
        if (bindable !== void 0) {
          // if it looks like: <my-el value.bind>
          // it means        : <my-el value.bind="value">
          // this is a shortcut
          // and reuse attrValue variable
          attrValue = attrValue.length === 0
            && (bindingCommand.bindingType & (
              BindingType.BindCommand
              | BindingType.OneTimeCommand
              | BindingType.ToViewCommand
              | BindingType.TwoWayCommand
            )) > 0
              ? camelCase(attrName)
              : attrValue;
          expr = exprParser.parse(attrValue, bindingCommand.bindingType);

          commandBuildInfo.node = el;
          commandBuildInfo.attr = attrSyntax;
          commandBuildInfo.expr = expr;
          commandBuildInfo.bindable = bindable;
          commandBuildInfo.def = elDef;
          (elBindableInstructions ??= []).push(bindingCommand.build(commandBuildInfo));
          continue;
        }
      }

      // old: mutate attr syntax before building instruction
      // reaching here means:
      // + a plain attribute
      // + has binding command

      expr = exprParser.parse(realAttrValue, bindingCommand.bindingType);

      commandBuildInfo.node = el;
      commandBuildInfo.attr = attrSyntax;
      commandBuildInfo.expr = expr;
      commandBuildInfo.bindable = null;
      commandBuildInfo.def = null;
      (plainAttrInstructions ??= []).push(bindingCommand.build(commandBuildInfo));
    }

    resetCommandBuildInfo();

    if (isAttrsOrderSensitive && plainAttrInstructions != null && plainAttrInstructions.length > 1) {
      this.reorder(el, plainAttrInstructions);
    }

    if (elDef !== null) {
      elementInstruction = new HydrateElementInstruction(
        elDef.name,
        void 0,
        (elBindableInstructions ?? emptyArray) as IInstruction[],
        null,
        null
      );

      if (elName === 'au-slot') {
        const slotName = el.getAttribute('name') || /* name="" is the same with no name */'default';
        // const projection = context.ci.projections?.[slotName];
        let fallbackContentContext: CompilationContext;
        let template;
        let node: Node | null;
        let fallbackDef: CustomElementDefinition;
        // if (projection == null) {
        template = context.h('template');
        node = el.firstChild;
        while (node !== null) {
          // a special case:
          // <au-slot> doesn't have its own template
          // so anything attempting to project into it is discarded
          // doing so during compilation via removing the node,
          // instead of considering it as part of the fallback view
          if (node.nodeType === 1 && (node as Element).hasAttribute('au-slot')) {
            el.removeChild(node);
          } else {
            template.content.appendChild(node);
          }
          node = el.firstChild;
        }

        fallbackContentContext = context.child();
        this.node(template.content, fallbackContentContext);
        elementInstruction.slotInfo = new SlotInfo(
          slotName,
          AuSlotContentType.Fallback,
          fallbackDef = CustomElementDefinition.create({
            name: CustomElement.generateName(),
            template,
            instructions: fallbackContentContext.rows,
            needsCompile: false,
          })
        );
        elementInstruction.auSlot = {
          name: slotName,
          fallback: fallbackDef,
        };
        // } else {
        //   elementInstruction.slotInfo = new SlotInfo(slotName, AuSlotContentType.Projection, projection);
        // }
        el = this.marker(el, context);
      }
    }

    if (plainAttrInstructions != null
      || elementInstruction != null
      || attrInstructions != null
    ) {
      instructions = emptyArray.concat(
        elementInstruction ?? emptyArray,
        attrInstructions ?? emptyArray,
        plainAttrInstructions ?? emptyArray,
      );
      this.mark(el);
    }

    let shouldCompileContent: boolean;
    if (tcInstructions != null) {
      ii = tcInstructions.length - 1;
      i = ii;
      tcInstruction = tcInstructions[i];

      let template: HTMLTemplateElement;
      // assumption: el.parentNode is not null
      // but not always the case: e.g compile/enhance an element without parent with TC on it
      this.marker(el, context);
      if (el.nodeName === 'TEMPLATE') {
        template = el as HTMLTemplateElement;
      } else {
        template = context.h('template');
        template.content.appendChild(el);
      }
      const mostInnerTemplate = template;
      const childContext = context.child(instructions == null ? [] : [instructions]);

      shouldCompileContent = elDef === null || !elDef.containerless && processContentResult !== false;

      let child: Node | null;
      let childEl: Element;
      let targetSlot: string | null;
      let projections: IProjections | undefined;
      let slotTemplateRecord: Record<string, (Element | DocumentFragment)[]> | undefined;
      let slotTemplates: (Element | DocumentFragment)[];
      let slotTemplate: Element | DocumentFragment;
      let marker: HTMLElement;
      let projectionCompilationContext: CompilationContext;
      let j = 0, jj = 0;
      if (shouldCompileContent) {
        if (elDef !== null) {
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
          child = el.firstChild;
          while (child !== null) {
            if (child.nodeType === 1) {
              // if has [au-slot] then it's a projection
              childEl = (child as Element);
              child = child.nextSibling;
              targetSlot = childEl.getAttribute('au-slot');
              if (targetSlot !== null) {
                if (targetSlot === '') {
                  targetSlot = 'default';
                }
                childEl.removeAttribute('au-slot');
                el.removeChild(childEl);
                ((slotTemplateRecord ??= {})[targetSlot] ??= []).push(childEl);
              }
              // if not a targeted slot then use the common node method
              // todo: in the future, there maybe more special case for a content of a custom element
              //       it can be all done here
            } else {
              child = child.nextSibling;
            }
          }

          if (slotTemplateRecord != null) {
            projections = {};
            // aggregate all content targeting the same slot
            // into a single template
            // with some special rule around <template> element
            for (targetSlot in slotTemplateRecord) {
              template = context.h('template');
              slotTemplates = slotTemplateRecord[targetSlot];
              for (j = 0, jj = slotTemplates.length; jj > j; ++j) {
                slotTemplate = slotTemplates[j];
                if (slotTemplate.nodeName === 'TEMPLATE') {
                  // this means user has some thing more than [au-slot] on a template
                  // consider this intentional, and use it as is
                  // e.g:
                  // <my-element>
                  //   <template au-slot repeat.for="i of items">
                  // ----vs----
                  // <my-element>
                  //   <template au-slot>this is just some static stuff <b>And a b</b></template>
                  if ((slotTemplate as Element).attributes.length > 0) {
                    template.content.appendChild(slotTemplate);
                  } else {
                    template.content.appendChild((slotTemplate as HTMLTemplateElement).content);
                  }
                } else {
                  template.content.appendChild(slotTemplate);
                }
              }

              // after aggregating all the [au-slot] templates into a single one
              // compile it
              // technically, the most inner template controller compilation context
              // is the parent of this compilation context
              // but for simplicity in compilation, maybe start with a flatter hierarchy
              // also, it wouldn't have any real uses
              projectionCompilationContext = context.child();
              this.node(template.content, projectionCompilationContext);
              projections[targetSlot] = CustomElementDefinition.create({
                name: CustomElement.generateName(),
                template,
                instructions: projectionCompilationContext.rows,
                needsCompile: false,
              });
            }
            elementInstruction!.projections = projections;
          }
        }

        // important:
        // ======================
        // only goes inside a template, if there is a template controller on it
        // otherwise, leave it alone
        if (el.nodeName === 'TEMPLATE') {
          this.node((el as HTMLTemplateElement).content, childContext);
        } else {
          child = el.firstChild;
          while (child !== null) {
            child = this.node(child, childContext);
          }
        }
      }
      tcInstruction.def = CustomElementDefinition.create({
        name: CustomElement.generateName(),
        template: mostInnerTemplate,
        instructions: childContext.rows,
        needsCompile: false,
      });
      while (i-- > 0) {
        // for each of the template controller from [right] to [left]
        // do create:
        // (1) a template
        // (2) add a marker to the template
        // (3) an instruction
        // instruction will be corresponded to the marker
        // =========================

        tcInstruction = tcInstructions[i];
        template = context.h('template');
        // appending most inner template is inaccurate, as the most outer one
        // is not really the parent of the most inner one
        // but it's only for the purpose of creating a marker,
        // so it's just an optimization hack
        marker = context.h('au-m');
        marker.classList.add('au');
        template.content.appendChild(marker);

        if (tcInstruction.def !== voidDefinition) {
          throw new Error(`Invalid definition for processing ${tcInstruction.res}.`);
        }
        tcInstruction.def = CustomElementDefinition.create({
          name: CustomElement.generateName(),
          template,
          needsCompile: false,
          instructions: [[tcInstructions[i + 1]]]
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
      // if there's no template controller
      // then the instruction built is appropriate to be assigned as the peek row
      // and before the children compilation
      if (instructions != null) {
        context.rows.push(instructions);
      }

      shouldCompileContent = elDef === null || !elDef.containerless && processContentResult !== false;
      if (shouldCompileContent && el.childNodes.length > 0) {
        let child = el.firstChild as Node | null;
        let childEl: Element;
        let targetSlot: string | null;
        let projections: IProjections | null = null;
        let slotTemplateRecord: Record<string, (Element | DocumentFragment)[]> | undefined;
        let slotTemplates: (Element | DocumentFragment)[];
        let slotTemplate: Element | DocumentFragment;
        let template: HTMLTemplateElement;
        let projectionCompilationContext: CompilationContext;
        let j = 0, jj = 0;
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
        while (child !== null) {
          if (child.nodeType === 1) {
            // if has [au-slot] then it's a projection
            childEl = (child as Element);
            child = child.nextSibling;
            targetSlot = childEl.getAttribute('au-slot');
            if (targetSlot !== null) {
              if (elDef === null) {
                throw new Error(`Projection with [au-slot="${targetSlot}"] is attempted on a non custom element ${el.nodeName}.`);
              }
              if (targetSlot === '') {
                targetSlot = 'default';
              }
              el.removeChild(childEl);
              childEl.removeAttribute('au-slot');
              ((slotTemplateRecord ??= {})[targetSlot] ??= []).push(childEl);
            }
            // if not a targeted slot then use the common node method
            // todo: in the future, there maybe more special case for a content of a custom element
            //       it can be all done here
          } else {
            child = child.nextSibling;
          }
        }

        if (slotTemplateRecord != null) {
          projections = {};
          // aggregate all content targeting the same slot
          // into a single template
          // with some special rule around <template> element
          for (targetSlot in slotTemplateRecord) {
            template = context.h('template');
            slotTemplates = slotTemplateRecord[targetSlot];
            for (j = 0, jj = slotTemplates.length; jj > j; ++j) {
              slotTemplate = slotTemplates[j];
              if (slotTemplate.nodeName === 'TEMPLATE') {
                // this means user has some thing more than [au-slot] on a template
                // consider this intentional, and use it as is
                // e.g:
                // <my-element>
                //   <template au-slot repeat.for="i of items">
                // ----vs----
                // <my-element>
                //   <template au-slot>this is just some static stuff <b>And a b</b></template>
                if ((slotTemplate as Element).attributes.length > 0) {
                  template.content.appendChild(slotTemplate);
                } else {
                  template.content.appendChild((slotTemplate as HTMLTemplateElement).content);
                }
              } else {
                template.content.appendChild(slotTemplate);
              }
            }

            // after aggregating all the [au-slot] templates into a single one
            // compile it
            projectionCompilationContext = context.child();
            this.node(template.content, projectionCompilationContext);
            projections[targetSlot] = CustomElementDefinition.create({
              name: CustomElement.generateName(),
              template,
              instructions: projectionCompilationContext.rows,
              needsCompile: false,
            });
          }
          elementInstruction!.projections = projections;
        }

        child = el.firstChild;
        while (child !== null) {
          child = this.node(child, context);
        }
      }
    }

    return nextSibling;
  }

  /** @internal */
  private text(node: Text, context: CompilationContext): Node | null {
    let text = '';
    let current: Node | null = node;
    while (current !== null && current.nodeType === 3) {
      text += current.textContent!;
      current = current.nextSibling;
    }
    const expr = context.exprParser.parse(text, BindingType.Interpolation);
    if (expr === null) {
      return current;
    }

    const parent = node.parentNode!;
    // prepare a marker
    parent.insertBefore(this.mark(context.h('au-m')), node);
    // and the corresponding instruction
    context.rows.push([new TextBindingInstruction(expr, !!context.def.isStrictBinding)]);

    // and cleanup all the DOM for rendering text binding
    node.textContent = '';
    current = node.nextSibling;
    while (current !== null && current.nodeType === 3) {
      parent.removeChild(current);
      current = node.nextSibling;
    }

    return node.nextSibling;
  }

  /** @internal */
  private multiBindings(
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

        attrSyntax = context.attrParser.parse(attrName, attrValue);
        // ================================================
        // todo: should it always camel case???
        // const attrTarget = camelCase(attrSyntax.target);
        // ================================================
        command = context.command(attrSyntax);
        bindable = bindableAttrsInfo.attrs[attrSyntax.target];
        if (bindable == null) {
          throw new Error(`Bindable ${attrSyntax.target} not found on ${attrDef.name}.`);
        }
        if (command === null) {
          expr = context.exprParser.parse(attrValue, BindingType.Interpolation);
          instructions.push(expr === null
            ? new SetPropertyInstruction(attrValue, bindable.property)
            : new InterpolationInstruction(expr, bindable.property)
          );
        } else {
          expr = context.exprParser.parse(attrValue, command.bindingType);
          commandBuildInfo.node = node;
          commandBuildInfo.attr = attrSyntax;
          commandBuildInfo.expr = expr;
          commandBuildInfo.bindable = bindable;
          commandBuildInfo.def = attrDef;
          // instructions.push(command.compile(new BindingSymbol(command, bindable, expr, attrValue, attrName)));
          instructions.push(command.build(commandBuildInfo));
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
  private local(template: Element | DocumentFragment, context: CompilationContext) {
    const root: Element | DocumentFragment = template;
    const localTemplates = toArray(root.querySelectorAll('template[as-custom-element]')) as HTMLTemplateElement[];
    const numLocalTemplates = localTemplates.length;
    if (numLocalTemplates === 0) { return; }
    if (numLocalTemplates === root.childElementCount) {
      throw new Error('The custom element does not have any content other than local template(s).');
    }
    const localTemplateNames: Set<string> = new Set();

    for (const localTemplate of localTemplates) {
      if (localTemplate.parentNode !== root) {
        throw new Error('Local templates needs to be defined directly under root.');
      }
      const name = processTemplateName(localTemplate, localTemplateNames);

      const LocalTemplateType = class LocalTemplate { };
      const content = localTemplate.content;
      const bindableEls = toArray(content.querySelectorAll('bindable'));
      const bindableInstructions = Bindable.for(LocalTemplateType);
      const properties = new Set<string>();
      const attributes = new Set<string>();
      for (const bindableEl of bindableEls) {
        if (bindableEl.parentNode !== content) {
          throw new Error('Bindable properties of local templates needs to be defined directly under root.');
        }
        const property = bindableEl.getAttribute(LocalTemplateBindableAttributes.property);
        if (property === null) { throw new Error(`The attribute 'property' is missing in ${bindableEl.outerHTML}`); }
        const attribute = bindableEl.getAttribute(LocalTemplateBindableAttributes.attribute);
        if (attribute !== null
          && attributes.has(attribute)
          || properties.has(property)
        ) {
          throw new Error(`Bindable property and attribute needs to be unique; found property: ${property}, attribute: ${attribute}`);
        } else {
          if (attribute !== null) {
            attributes.add(attribute);
          }
          properties.add(property);
        }
        bindableInstructions.add({
          property,
          attribute: attribute ?? void 0,
          mode: getBindingMode(bindableEl),
        });
        const ignoredAttributes = bindableEl.getAttributeNames().filter((attrName) => !allowedLocalTemplateBindableAttributes.includes(attrName));
        if (ignoredAttributes.length > 0) {
          context.logger.warn(`The attribute(s) ${ignoredAttributes.join(', ')} will be ignored for ${bindableEl.outerHTML}. Only ${allowedLocalTemplateBindableAttributes.join(', ')} are processed.`);
        }

        content.removeChild(bindableEl);
      }

      context.register(CustomElement.define({ name, template: localTemplate }, LocalTemplateType));

      root.removeChild(localTemplate);
    }
  }

  private shouldReorderAttrs(el: Element): boolean {
    return el.nodeName === 'INPUT' && orderSensitiveInputType[(el as HTMLInputElement).type] === 1;
  }

  private reorder(el: Element, instructions: (IInstruction)[]) {
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
      }
    }
  }

  /**
   * Mark an element as target with a special css class
   * and return it
   *
   * @internal
   */
  private mark<T extends Element>(el: T): T {
    el.classList.add('au');
    return el;
  }

  /**
   * Replace an element with a marker, and return the marker
   *
   * @internal
   */
  private marker(node: Node, context: CompilationContext): HTMLElement {
    // todo: assumption made: parentNode won't be null
    const parent = node.parentNode!;
    const marker = context.h('au-m');
    this.mark(parent.insertBefore(marker, node));
    parent.removeChild(node);
    return marker;
  }
}

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
  public readonly templateFactory: ITemplateElementFactory;
  public readonly logger: ILogger;
  public readonly attrParser: IAttributeParser;
  public readonly attrMapper: IAttrMapper;
  public readonly exprParser: IExpressionParser;
  public readonly p: IPlatform;
  // an array representing targets of instructions, built on depth first tree walking compilation
  public readonly rows: IInstruction[][];
  public readonly localEls: Set<string>;
  public hasSlot: boolean = false;

  /**
   * @internal
   */
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
    this.templateFactory = hasParent ? parent!.templateFactory : container.get(ITemplateElementFactory);
    // todo: attr parser should be retrieved based in resource semantic (current leaf + root + ignore parent)
    this.attrParser = hasParent ? parent!.attrParser : container.get(IAttributeParser);
    this.exprParser = hasParent ? parent!.exprParser : container.get(IExpressionParser);
    this.attrMapper = hasParent ? parent!.attrMapper : container.get(IAttrMapper);
    this.logger = hasParent ? parent!.logger : container.get(ILogger);
    this.p = hasParent ? parent!.p : container.get(IPlatform);
    this.localEls = hasParent ? parent!.localEls : new Set();
    this.rows = instructions ?? [];
  }

  // todo: later can be extended to more (AttrPattern, command etc)
  public register(def: CustomElementType | CustomAttributeType) {
    this.root.c.register(def);
  }

  public h<K extends keyof HTMLElementTagNameMap>(name: K): HTMLElementTagNameMap[K];
  public h<K extends string>(name: string): HTMLElement;
  public h(name: string): HTMLElement {
    const el = this.p.document.createElement(name);
    if (name === 'template') {
      this.p.document.adoptNode((el as HTMLTemplateElement).content);
    }
    return el;
  }

  /**
   * Find the custom element definition of a given name
   */
  public el(name: string): CustomElementDefinition | null {
    return this.c.find(CustomElement, name) as CustomElementDefinition | null;
  }

  /**
   * Find the custom attribute definition of a given name
   */
  public attr(name: string): CustomAttributeDefinition | null {
    return this.c.find(CustomAttribute, name);
  }

  /**
   * Create a new child compilation context
   */
  public child(instructions?: IInstruction[][]) {
    return new CompilationContext(this.def, this.c, this.ci, this, this.root, instructions);
  }

  // todo: ideally binding command shouldn't have to be cached
  // it can just be a singleton where it' retrieved
  // the resources semantic should be defined by the resource itself,
  // rather than baked in the container
  private readonly commands: Record<string, BindingCommandInstance | null | undefined> = createLookup();
  /**
   * Retrieve a binding command resource instance.
   *
   * @param name - The parsed `AttrSyntax`
   *
   * @returns An instance of the command if it exists, or `null` if it does not exist.
   */
  public command(syntax: AttrSyntax): BindingCommandInstance | null {
    if (this.root !== this) {
      return this.root.command(syntax);
    }
    const name = syntax.command;
    if (name === null) {
      return null;
    }
    let result = this.commands[name];
    if (result === void 0) {
      result = this.c.create(BindingCommand, name) as BindingCommandInstance;
      if (result === null) {
        throw new Error(`Unknown binding command: ${name}`);
      }
      this.commands[name] = result;
    }
    return result;
  }
}

function hasInlineBindings(rawValue: string): boolean {
  const len = rawValue.length;
  let ch = 0;
  for (let i = 0; i < len; ++i) {
    ch = rawValue.charCodeAt(i);
    if (ch === Char.Backslash) {
      ++i;
      // Ignore whatever comes next because it's escaped
    } else if (ch === Char.Colon) {
      return true;
    } else if (ch === Char.Dollar && rawValue.charCodeAt(i + 1) === Char.OpenBrace) {
      return false;
    }
  }
  return false;
}

function resetCommandBuildInfo(): void {
  commandBuildInfo.node
    = commandBuildInfo.attr
    = commandBuildInfo.expr
    = commandBuildInfo.bindable
    = commandBuildInfo.def = null!;
}

const emptyCompilationInstructions: ICompliationInstruction = { projections: null };
// eslint-disable-next-line
const voidDefinition: CustomElementDefinition = { name: 'unnamed' } as CustomElementDefinition;
const commandBuildInfo: ICommandBuildInfo = {
  node: null!,
  expr: null!,
  attr: null!,
  bindable: null,
  def: null,
};
const invalidSurrogateAttribute = Object.assign(createLookup<boolean | undefined>(), {
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
class BindablesInfo<T extends 0 | 1 = 0> {
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
          ? BindingMode.default
          : (def as CA).defaultBindingMode
        : BindingMode.default;
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
            throw new Error(`Primary already exists on ${def.name}`);
          }
          hasPrimary = true;
          primary = bindable;
        } else if (!hasPrimary && primary == null) {
          primary = bindable;
        }

        attrs[attr] = BindableDefinition.create(prop, bindable);
      }
      if (bindable == null && isAttr) {
        // if no bindables are present, default to "value"
        primary = attrs.value = BindableDefinition.create('value', { mode: defaultBindingMode });
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

const enum LocalTemplateBindableAttributes {
  property = "property",
  attribute = "attribute",
  mode = "mode",
}
const allowedLocalTemplateBindableAttributes: readonly string[] = Object.freeze([
  LocalTemplateBindableAttributes.property,
  LocalTemplateBindableAttributes.attribute,
  LocalTemplateBindableAttributes.mode
]);
const localTemplateIdentifier = 'as-custom-element';

function processTemplateName(localTemplate: HTMLTemplateElement, localTemplateNames: Set<string>): string {
  const name = localTemplate.getAttribute(localTemplateIdentifier);
  if (name === null || name === '') {
    throw new Error('The value of "as-custom-element" attribute cannot be empty for local template');
  }
  if (localTemplateNames.has(name)) {
    throw new Error(`Duplicate definition of the local template named ${name}`);
  } else {
    localTemplateNames.add(name);
    localTemplate.removeAttribute(localTemplateIdentifier);
  }
  return name;
}

function getBindingMode(bindable: Element): BindingMode {
  switch (bindable.getAttribute(LocalTemplateBindableAttributes.mode)) {
    case 'oneTime':
      return BindingMode.oneTime;
    case 'toView':
      return BindingMode.toView;
    case 'fromView':
      return BindingMode.fromView;
    case 'twoWay':
      return BindingMode.twoWay;
    case 'default':
    default:
      return BindingMode.default;
  }
}
