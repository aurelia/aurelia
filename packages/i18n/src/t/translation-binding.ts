import { toArray } from '@aurelia/kernel';
import {
  connectable,
  AccessorType,
  CustomExpression,
  ExpressionType,
  LifecycleFlags,
  Interpolation,
} from '@aurelia/runtime';
import {
  CustomElement,
  IPlatform,
} from '@aurelia/runtime-html';
import i18next from 'i18next';
import { I18N } from '../i18n';

import type { ITask, QueueTaskOptions } from '@aurelia/platform';
import type { IContainer, IServiceLocator } from '@aurelia/kernel';
import type {
  Scope,
  IsExpression,
  IConnectableBinding,
  IExpressionParser,
  IObserverLocator,
  IObserverLocatorBasedConnectable,
  IAccessor,
} from '@aurelia/runtime';
import type { CallBindingInstruction, IHydratableController, INode } from '@aurelia/runtime-html';

interface TranslationBindingCreationContext {
  parser: IExpressionParser;
  observerLocator: IObserverLocator;
  context: IContainer;
  controller: IHydratableController;
  target: HTMLElement;
  instruction: CallBindingInstruction;
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

export interface TranslationBinding extends IConnectableBinding { }

const forOpts = { optional: true } as const;
const taskQueueOpts: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};

export class TranslationBinding implements IObserverLocatorBasedConnectable {
  public interceptor: this = this;
  public isBound: boolean = false;
  public expr!: IsExpression;
  private readonly i18n: I18N;
  /** @internal */
  private readonly _contentAttributes: readonly string[] = contentAttributes;
  /** @internal */
  private _keyExpression: string | undefined | null;
  private scope!: Scope;
  private task: ITask | null = null;
  /** @internal */
  private _isInterpolation!: boolean;
  private readonly _targetAccessors: Set<IAccessor>;

  public target: HTMLElement;
  private readonly platform: IPlatform;
  private parameter: ParameterBinding | null = null;
  /**
   * A semi-private property used by connectable mixin
   */
  public readonly oL: IObserverLocator;

  public constructor(
    target: INode,
    observerLocator: IObserverLocator,
    public locator: IServiceLocator,
    platform: IPlatform,
  ) {
    this.target = target as HTMLElement;
    this.i18n = this.locator.get(I18N);
    this.platform = platform;
    this._targetAccessors = new Set<IAccessor>();
    this.oL = observerLocator;
    this.i18n.subscribeLocaleChange(this);
  }

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
    const binding = this.getBinding({ observerLocator, context, controller, target, platform });
    const expr = typeof instruction.from === 'string'
      ? parser.parse(instruction.from, ExpressionType.IsProperty)
      : instruction.from;
    if (isParameterContext) {
      binding.useParameter(expr);
    } else {
      const interpolation = expr instanceof CustomExpression ? parser.parse(expr.value, ExpressionType.Interpolation) : undefined;
      binding.expr = interpolation || expr;
    }
  }
  private static getBinding({
    observerLocator,
    context,
    controller,
    target,
    platform,
  }: Omit<TranslationBindingCreationContext, 'parser' | 'instruction' | 'isParameterContext'>): TranslationBinding {
    let binding: TranslationBinding | null = controller.bindings && controller.bindings.find((b) => b instanceof TranslationBinding && b.target === target) as TranslationBinding;
    if (!binding) {
      binding = new TranslationBinding(target, observerLocator, context, platform);
      controller.addBinding(binding);
    }
    return binding;
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!this.expr) { throw new Error('key expression is missing'); }
    this.scope = scope;
    this._isInterpolation = this.expr instanceof Interpolation;

    this._keyExpression = this.expr.evaluate(flags, scope, this.locator, this) as string;
    this._ensureKeyExpression();
    this.parameter?.$bind(flags, scope);

    this._updateTranslations(flags);
    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    if (this.expr.hasUnbind) {
      this.expr.unbind(flags, this.scope, this);
    }

    this.parameter?.$unbind(flags);
    this._targetAccessors.clear();
    if (this.task !== null) {
      this.task.cancel();
      this.task = null;
    }

    this.scope = (void 0)!;
    this.obs.clearAll();
  }

  public handleChange(newValue: string | i18next.TOptions, _previousValue: string | i18next.TOptions, flags: LifecycleFlags): void {
    this.obs.version++;
    this._keyExpression = this._isInterpolation
        ? this.expr.evaluate(flags, this.scope, this.locator, this) as string
        : newValue as string;
    this.obs.clear();
    this._ensureKeyExpression();
    this._updateTranslations(flags);
  }

  public handleLocaleChange() {
    // todo:
    // no flag passed, so if a locale is updated during binding of a component
    // and the author wants to signal that locale change fromBind, then it's a bug
    this._updateTranslations(LifecycleFlags.none);
  }

  public useParameter(expr: IsExpression) {
    if (this.parameter != null) {
      throw new Error('This translation parameter has already been specified.');
    }
    this.parameter = new ParameterBinding(this, expr, (flags: LifecycleFlags) => this._updateTranslations(flags));
  }

  /** @internal */
  private _updateTranslations(flags: LifecycleFlags) {
    const results = this.i18n.evaluate(this._keyExpression!, this.parameter?.value);
    const content: ContentValue = Object.create(null);
    const accessorUpdateTasks: AccessorUpdateTask[] = [];
    const task = this.task;
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
            ? this.oL.getAccessor(controller.viewModel, attribute)
            : this.oL.getAccessor(this.target, attribute);
          const shouldQueueUpdate = (flags & LifecycleFlags.fromBind) === 0 && (accessor.type & AccessorType.Layout) > 0;
          if (shouldQueueUpdate) {
            accessorUpdateTasks.push(new AccessorUpdateTask(accessor, value, flags, this.target, attribute));
          } else {
            accessor.setValue(value, flags, this.target, attribute);
          }
          this._targetAccessors.add(accessor);
        }
      }
    }

    let shouldQueueContent = false;
    if (Object.keys(content).length > 0) {
      shouldQueueContent = (flags & LifecycleFlags.fromBind) === 0;
      if (!shouldQueueContent) {
        this._updateContent(content, flags);
      }
    }

    if (accessorUpdateTasks.length > 0 || shouldQueueContent) {
      this.task = this.platform.domWriteQueue.queueTask(() => {
        this.task = null;
        for (const updateTask of accessorUpdateTasks) {
          updateTask.run();
        }
        if (shouldQueueContent) {
          this._updateContent(content, flags);
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
  private _updateContent(content: ContentValue, _flags: LifecycleFlags) {
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
    // const observer = this.oL.getAccessor(LifecycleFlags.none, this.target, '??');
    // observer.setValue(??, flags);

    this.target.innerHTML = '';
    for (const child of toArray(template.content.childNodes)) {
      this.target.appendChild(child);
    }
  }

  /** @internal */
  private _prepareTemplate(content: ContentValue, marker: string, fallBackContents: ChildNode[]) {
    const template = this.platform.document.createElement('template');

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
      const parser = this.platform.document.createElement('div');
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

class AccessorUpdateTask {
  public constructor(
    private readonly accessor: IAccessor,
    private readonly v: unknown,
    private readonly f: LifecycleFlags,
    private readonly el: HTMLElement,
    private readonly attr: string
  ) {}

  public run(): void {
    this.accessor.setValue(this.v, this.f, this.el, this.attr);
  }
}

interface ParameterBinding extends IConnectableBinding {}

class ParameterBinding {

  public interceptor = this;

  public value!: i18next.TOptions;
  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;
  public readonly locator: IServiceLocator;
  public isBound: boolean = false;

  private scope!: Scope;

  public constructor(
    public readonly owner: TranslationBinding,
    public readonly expr: IsExpression,
    public readonly updater: (flags: LifecycleFlags) => void,
  ) {
    this.oL = owner.oL;
    this.locator = owner.locator;
  }

  public handleChange(newValue: string | i18next.TOptions, _previousValue: string | i18next.TOptions, flags: LifecycleFlags): void {
    // todo(test): add an integration/e2e for this
    //             setup: put this inside an if and switch on/off that if
    if (!this.isBound) {
      return;
    }
    this.obs.version++;
    this.value = this.expr.evaluate(flags, this.scope, this.locator, this) as i18next.TOptions;
    this.obs.clear();
    this.updater(flags);
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      return;
    }
    this.scope = scope;

    if (this.expr.hasBind) {
      this.expr.bind(flags, scope, this);
    }

    this.value = this.expr.evaluate(flags, scope, this.locator, this) as i18next.TOptions;
    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags) {
    if (!this.isBound) {
      return;
    }

    if (this.expr.hasUnbind) {
      this.expr.unbind(flags, this.scope, this);
    }

    this.scope = (void 0)!;
    this.obs.clearAll();
  }
}

connectable(TranslationBinding);
connectable(ParameterBinding);
