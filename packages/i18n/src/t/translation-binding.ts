import { camelCase, toArray } from '@aurelia/kernel';
import {
  AccessorType,
  connectable,
  astEvaluate,
  astUnbind,
  astBind,
  IConnectableBinding,
  IAstEvaluator,
} from '@aurelia/runtime';
import {
  CustomElement,
  IPlatform,
  type IBindingController,
  mixinAstEvaluator,
  mixingBindingLimited,
  type IHydratableController,
  type INode
} from '@aurelia/runtime-html';
import type * as i18next from 'i18next';
import { I18N } from '../i18n';

import type { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/platform';
import type { IContainer, IServiceLocator } from '@aurelia/kernel';
import { IExpressionParser, IsExpression, CustomExpression } from '@aurelia/expression-parser';
import type {
  Scope,
  IObserverLocator,
  IAccessor,
} from '@aurelia/runtime';
import type { TranslationBindBindingInstruction, TranslationBindingInstruction } from './translation-renderer';
import type { TranslationParametersBindingInstruction } from './translation-parameters-renderer';
import { etInterpolation, etIsProperty, stateActivating } from '../utils';

interface TranslationBindingCreationContext {
  parser: IExpressionParser;
  observerLocator: IObserverLocator;
  context: IContainer;
  controller: IHydratableController;
  target: HTMLElement;
  instruction: TranslationBindingInstruction | TranslationBindBindingInstruction | TranslationParametersBindingInstruction;
  platform: IPlatform;
  isParameterContext?: boolean;
}
const contentAttributes = ['textContent', 'innerHTML', 'prepend', 'append'] as const;
type ContentAttribute = typeof contentAttributes[number];
interface ContentValue {
  textContent?: string;
  innerHTML?: string;
  prepend?: string;
  append?: string;
}

const attributeAliases = new Map([['text', 'textContent'], ['html', 'innerHTML']]);

export interface TranslationBinding extends IAstEvaluator, IConnectableBinding { }

const forOpts = { optional: true } as const;
const taskQueueOpts: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};

export class TranslationBinding implements IConnectableBinding {

  public static create({
    parser,
    observerLocator,
    context,
    controller,
    target,
    instruction,
    platform,
    isParameterContext,
  }: TranslationBindingCreationContext) {
    const binding = this._getBinding({ observerLocator, context, controller, target, platform });
    const expr = typeof instruction.from === 'string'
      /* istanbul ignore next */
      ? parser.parse(instruction.from, etIsProperty)
      : instruction.from;
    if (isParameterContext) {
      binding.useParameter(expr as IsExpression);
    } else {
      const interpolation = expr instanceof CustomExpression ? parser.parse(expr.value as string, etInterpolation) : undefined;
      binding.ast = interpolation || expr as IsExpression;
    }
  }

  /** @internal */
  private static _getBinding({
    observerLocator,
    context,
    controller,
    target,
    platform,
  }: Omit<TranslationBindingCreationContext, 'parser' | 'instruction' | 'isParameterContext'>): TranslationBinding {
    let binding: TranslationBinding | null = controller.bindings && controller.bindings.find((b) => b instanceof TranslationBinding && b.target === target) as TranslationBinding;
    if (!binding) {
      binding = new TranslationBinding(controller, context, observerLocator, platform, target);
      controller.addBinding(binding);
    }
    return binding;
  }

  public isBound: boolean = false;
  public ast!: IsExpression;
  private readonly i18n: I18N;
  /** @internal */
  private readonly _contentAttributes: readonly string[] = contentAttributes;
  /** @internal */
  private _keyExpression: string | undefined | null;

  /** @internal */
  public _scope!: Scope;

  /** @internal */
  private _task: ITask | null = null;

  /** @internal */
  private readonly _targetAccessors: Set<IAccessor>;

  public target: HTMLElement;
  /** @internal */
  private readonly _platform: IPlatform;

  /** @internal */
  private readonly _taskQueue: TaskQueue;
  private parameter: ParameterBinding | null = null;

  /** @internal */
  public readonly l: IServiceLocator;
  /**
   * A semi-private property used by connectable mixin
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  private readonly _controller: IBindingController;
  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public constructor(
    controller: IBindingController,
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    platform: IPlatform,
    target: INode,
  ) {
    this.l = locator;
    this._controller = controller;
    this.target = target as HTMLElement;
    this.i18n = locator.get(I18N);
    this._platform = platform;
    this._targetAccessors = new Set<IAccessor>();
    this.oL = observerLocator;
    this._taskQueue = platform.domWriteQueue;
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      return;
    }
    const ast = this.ast;
    if (ast == null) { throw new Error('key expression is missing'); }
    this._scope = _scope;
    this.i18n.subscribeLocaleChange(this);

    this._keyExpression = astEvaluate(ast, _scope, this, this) as string;
    this._ensureKeyExpression();
    this.parameter?.bind(_scope);

    this.updateTranslations();
    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }

    this.i18n.unsubscribeLocaleChange(this);
    astUnbind(this.ast, this._scope, this);

    this.parameter?.unbind();
    this._targetAccessors.clear();
    if (this._task !== null) {
      this._task.cancel();
      this._task = null;
    }

    this._scope = (void 0)!;
    this.obs.clearAll();
  }

  public handleChange(_newValue: string | i18next.TOptions, _previousValue: string | i18next.TOptions): void {
    this.obs.version++;
    this._keyExpression = astEvaluate(this.ast, this._scope, this, this) as string;
    this.obs.clear();
    this._ensureKeyExpression();
    this.updateTranslations();
  }

  public handleLocaleChange() {
    // todo:
    // no flag passed, so if a locale is updated during binding of a component
    // and the author wants to signal that locale change fromBind, then it's a bug
    this.updateTranslations();
  }

  public useParameter(expr: IsExpression) {
    if (this.parameter != null) {
      throw new Error('This translation parameter has already been specified.');
    }
    this.parameter = new ParameterBinding(this, expr, () => this.updateTranslations());
  }

  public updateTranslations() {
    const results = this.i18n.evaluate(this._keyExpression!, this.parameter?.value);
    const content: ContentValue = Object.create(null);
    const accessorUpdateTasks: AccessorUpdateTask[] = [];
    const task = this._task;
    this._targetAccessors.clear();

    for (const item of results) {
      const value = item.value;
      const attributes = this._preprocessAttributes(item.attributes);
      for (const attribute of attributes) {
        if (this._isContentAttribute(attribute)) {
          content[attribute] = value;
        } else {
          const controller = CustomElement.for(this.target, forOpts);
          const accessor = controller?.viewModel
            ? this.oL.getAccessor(controller.viewModel, camelCase(attribute))
            : this.oL.getAccessor(this.target, attribute);
          const shouldQueueUpdate = this._controller.state !== stateActivating && (accessor.type & AccessorType.Layout) > 0;
          if (shouldQueueUpdate) {
            accessorUpdateTasks.push(new AccessorUpdateTask(accessor, value, this.target, attribute));
          } else {
            accessor.setValue(value, this.target, attribute);
          }
          this._targetAccessors.add(accessor);
        }
      }
    }

    let shouldQueueContent = false;
    if (Object.keys(content).length > 0) {
      shouldQueueContent = this._controller.state !== stateActivating;
      if (!shouldQueueContent) {
        this._updateContent(content);
      }
    }

    if (accessorUpdateTasks.length > 0 || shouldQueueContent) {
      this._task = this._taskQueue.queueTask(() => {
        this._task = null;
        for (const updateTask of accessorUpdateTasks) {
          updateTask.run();
        }
        if (shouldQueueContent) {
          this._updateContent(content);
        }
      }, taskQueueOpts);
    }
    task?.cancel();
  }

  /** @internal */
  private _preprocessAttributes(attributes: string[]) {
    if (attributes.length === 0) {
      attributes = this.target.tagName === 'IMG' ? ['src'] : ['textContent'];
    }

    for (const [alias, attribute] of attributeAliases) {
      const aliasIndex = attributes.findIndex((attr) => attr === alias);
      if (aliasIndex > -1) {
        attributes.splice(aliasIndex, 1, attribute);
      }
    }

    return attributes;
  }

  /** @internal */
  private _isContentAttribute(attribute: string): attribute is ContentAttribute {
    return this._contentAttributes.includes(attribute);
  }

  /** @internal */
  private _updateContent(content: ContentValue) {
    const children = toArray(this.target.childNodes);
    const fallBackContents = [];
    const marker = 'au-i18n';

    // extract the original content, not manipulated by au-i18n
    for (const child of children) {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!Reflect.get(child, marker)) {
        fallBackContents.push(child);
      }
    }

    const template = this._prepareTemplate(content, marker, fallBackContents);

    // difficult to use the set property approach in this case, as most of the properties of Node is readonly
    // const observer = this.oL.getAccessor(this.target, '??');
    // observer.setValue(??);

    this.target.innerHTML = '';
    for (const child of toArray(template.content.childNodes)) {
      this.target.appendChild(child);
    }
  }

  /** @internal */
  private _prepareTemplate(content: ContentValue, marker: string, fallBackContents: ChildNode[]) {
    const template = this._platform.document.createElement('template');

    this._addContentToTemplate(template, content.prepend, marker);

    // build content: prioritize [html], then textContent, and falls back to original content
    if (!this._addContentToTemplate(template, content.innerHTML ?? content.textContent, marker)) {
      for (const fallbackContent of fallBackContents) {
        template.content.append(fallbackContent);
      }
    }

    this._addContentToTemplate(template, content.append, marker);
    return template;
  }

  /** @internal */
  private _addContentToTemplate(template: HTMLTemplateElement, content: string | undefined, marker: string) {
    if (content !== void 0 && content !== null) {
      const parser = this._platform.document.createElement('div');
      parser.innerHTML = content;
      for (const child of toArray(parser.childNodes)) {
        Reflect.set(child, marker, true);
        template.content.append(child);
      }
      return true;
    }
    return false;
  }

  /** @internal */
  private _ensureKeyExpression() {
    const expr = this._keyExpression ??= '';
    const exprType = typeof expr;
    if (exprType !== 'string') {
      throw new Error(`Expected the i18n key to be a string, but got ${expr} of type ${exprType}`); // TODO use reporter/logger
    }
  }
}
connectable(TranslationBinding);
mixinAstEvaluator(true)(TranslationBinding);
mixingBindingLimited(TranslationBinding, () => 'updateTranslations');

class AccessorUpdateTask {
  public constructor(
    private readonly accessor: IAccessor,
    private readonly v: unknown,
    private readonly el: HTMLElement,
    private readonly attr: string
  ) {}

  public run(): void {
    this.accessor.setValue(this.v, this.el, this.attr);
  }
}

interface ParameterBinding extends IAstEvaluator, IConnectableBinding {}

class ParameterBinding {
  public isBound: boolean = false;
  public value!: i18next.TOptions;
  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;
  /** @internal */
  public readonly l: IServiceLocator;

  /** @internal */
  public _scope!: Scope;
  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public constructor(
    public readonly owner: TranslationBinding,
    public readonly ast: IsExpression,
    public readonly updater: () => void,
  ) {
    this.oL = owner.oL;
    this.l = owner.l;
  }

  public handleChange(_newValue: string | i18next.TOptions, _previousValue: string | i18next.TOptions): void {
    // todo(test): add an integration/e2e for this
    //             setup: put this inside an if and switch on/off that if
    if (!this.isBound) {
      return;
    }
    this.obs.version++;
    this.value = astEvaluate(this.ast, this._scope, this, this) as i18next.TOptions;
    this.obs.clear();
    this.updater();
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      return;
    }
    this._scope = _scope;

    astBind(this.ast, _scope, this);

    this.value = astEvaluate(this.ast, _scope, this, this) as i18next.TOptions;
    this.isBound = true;
  }

  public unbind() {
    if (!this.isBound) {
      return;
    }

    astUnbind(this.ast, this._scope, this);

    this._scope = (void 0)!;
    this.obs.clearAll();
  }
}

connectable(ParameterBinding);
mixinAstEvaluator(true)(ParameterBinding);
