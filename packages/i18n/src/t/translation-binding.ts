import { IEventAggregator, IServiceLocator, toArray } from '@aurelia/kernel';
import {
  addBinding,
  BindingType,
  connectable,
  CustomElement,
  CustomExpression,
  DOM,
  ensureExpression,
  IBindingTargetAccessor,
  ICallBindingInstruction,
  IConnectableBinding,
  IController,
  IExpressionParser,
  Interpolation,
  IObserverLocator,
  IPartialConnectableBinding,
  IRenderContext,
  IScope,
  IsExpression,
  LifecycleFlags,
  State
} from '@aurelia/runtime';
import i18next from 'i18next';
import { I18N } from '../i18n';
import { Signals } from '../utils';

interface TranslationBindingCreationContext {
  parser: IExpressionParser;
  observerLocator: IObserverLocator;
  context: IRenderContext;
  renderable: IController;
  target: HTMLElement;
  instruction: ICallBindingInstruction;
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

@connectable()
export class TranslationBinding implements IPartialConnectableBinding {
  public id!: number;
  public $state: State;
  public expr!: IsExpression;
  public parametersExpr?: IsExpression;
  private readonly i18n: I18N;
  private readonly contentAttributes: readonly string[] = contentAttributes;
  private keyExpression!: string;
  private translationParameters!: i18next.TOptions;
  private scope!: IScope;
  private isInterpolatedSourceExpr!: boolean;
  private readonly targetObservers: Set<IBindingTargetAccessor>;

  public constructor(
    public readonly target: HTMLElement,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator
  ) {
    this.$state = State.none;
    this.i18n = this.locator.get(I18N);
    const ea: IEventAggregator = this.locator.get(IEventAggregator);
    ea.subscribe(Signals.I18N_EA_CHANNEL, this.handleLocaleChange.bind(this));
    this.targetObservers = new Set<IBindingTargetAccessor>();
  }

  public static create({ parser, observerLocator, context, renderable, target, instruction, isParameterContext }: TranslationBindingCreationContext) {
    const binding = this.getBinding({ observerLocator, context, renderable, target });
    const expr = ensureExpression(parser, instruction.from, BindingType.BindCommand);
    if (!isParameterContext) {
      const interpolation = expr instanceof CustomExpression ? parser.parse(expr.value, BindingType.Interpolation) : undefined;
      binding.expr = interpolation || expr;
    } else {
      binding.parametersExpr = expr;
    }
  }
  private static getBinding({ observerLocator, context, renderable, target }: Omit<TranslationBindingCreationContext, 'parser' | 'instruction' | 'isParameterContext'>): TranslationBinding {
    let binding: TranslationBinding | undefined = renderable.bindings && renderable.bindings.find((b) => b instanceof TranslationBinding && b.target === target) as TranslationBinding;
    if (!binding) {
      binding = new TranslationBinding(target, observerLocator, context);
      addBinding(renderable, binding);
    }
    return binding;
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string | undefined): void {
    if (!this.expr) { throw new Error('key expression is missing'); } // TODO replace with error code
    this.scope = scope;
    this.isInterpolatedSourceExpr = this.expr instanceof Interpolation;

    this.keyExpression = this.expr.evaluate(flags, scope, this.locator, part) as string;
    if (this.parametersExpr) {
      const parametersFlags = flags | LifecycleFlags.secondaryExpression;
      this.translationParameters = this.parametersExpr.evaluate(parametersFlags, scope, this.locator, part) as i18next.TOptions;
      this.parametersExpr.connect(parametersFlags, scope, this as any, part);
    }

    const expressions = !(this.expr instanceof CustomExpression) ? this.isInterpolatedSourceExpr ? (this.expr as Interpolation).expressions : [this.expr] : [];

    for (const expr of expressions) {
      expr.connect(flags, scope, this as any, part);
    }

    this.updateTranslations(flags);
    this.$state = State.isBound;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }
    this.$state |= State.isUnbinding;

    if (this.expr.unbind) {
      this.expr.unbind(flags, this.scope, this as any);
    }

    if (this.parametersExpr && this.parametersExpr.unbind) {
      this.parametersExpr.unbind(flags | LifecycleFlags.secondaryExpression, this.scope, this as any);
    }
    this.unobserveTargets(flags);

    this.scope = (void 0)!;
    (this as unknown as IConnectableBinding).unobserve(true);
  }

  public handleChange(newValue: string | i18next.TOptions, _previousValue: string | i18next.TOptions, flags: LifecycleFlags): void {
    if (flags & LifecycleFlags.secondaryExpression) {
      // @ToDo, @Fixme: where do we get "part" from (last argument for evaluate)?
      this.translationParameters = this.parametersExpr!.evaluate(flags, this.scope, this.locator) as i18next.TOptions;
    } else {
      this.keyExpression = this.isInterpolatedSourceExpr
        ? this.expr.evaluate(flags, this.scope, this.locator, '') as string
        : newValue as string;
    }
    this.updateTranslations(flags);
  }

  private handleLocaleChange() {
    this.updateTranslations(LifecycleFlags.none);
  }

  private updateTranslations(flags: LifecycleFlags) {
    const results = this.i18n.evaluate(this.keyExpression, this.translationParameters);
    const content: ContentValue = Object.create(null);
    this.unobserveTargets(flags);

    for (const item of results) {
      const value = item.value;
      const attributes = this.preprocessAttributes(item.attributes);
      for (const attribute of attributes) {
        if (this.isContentAttribute(attribute)) {
          content[attribute] = value;
        } else {
          this.updateAttribute(attribute, value, flags);
        }
      }
    }
    if (Object.keys(content).length) {
      this.updateContent(content, flags);
    }
  }

  private updateAttribute(attribute: string, value: string, flags: LifecycleFlags) {
    const controller = CustomElement.behaviorFor(this.target);
    const observer = controller && controller.viewModel
      ? this.observerLocator.getAccessor(LifecycleFlags.none, controller.viewModel, attribute)
      : this.observerLocator.getAccessor(LifecycleFlags.none, this.target, attribute);
    observer.setValue(value, flags);
    this.targetObservers.add(observer);
  }

  private preprocessAttributes(attributes: string[]) {
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

  private isContentAttribute(attribute: string): attribute is ContentAttribute {
    return this.contentAttributes.includes(attribute);
  }

  private updateContent(content: ContentValue, flags: LifecycleFlags) {
    const children = toArray(this.target.childNodes);
    const fallBackContents = [];
    const marker = 'au-i18n';

    // extract the original content, not manipulated by au-i18n
    for (const child of children) {
      if (!Reflect.get(child, marker)) {
        fallBackContents.push(child);
      }
    }

    const template = this.prepareTemplate(content, marker, fallBackContents);

    // difficult to use the set property approach in this case, as most of the properties of Node is readonly
    // const observer = this.observerLocator.getAccessor(LifecycleFlags.none, this.target, '??');
    // observer.setValue(??, flags);

    this.target.innerHTML = '';
    for (const child of toArray(template.content.childNodes)) {
      this.target.appendChild(child);
    }
  }

  private prepareTemplate(content: ContentValue, marker: string, fallBackContents: ChildNode[]) {
    const template = DOM.createTemplate() as HTMLTemplateElement;

    this.addContentToTemplate(template, content.prepend, marker);

    // build content: prioritize [html], then textContent, and falls back to original content
    if (!this.addContentToTemplate(template, content.innerHTML || content.textContent, marker)) {
      for (const fallbackContent of fallBackContents) {
        template.content.append(fallbackContent);
      }
    }

    this.addContentToTemplate(template, content.append, marker);
    return template;
  }

  private addContentToTemplate(template: HTMLTemplateElement, content: string | undefined, marker: string) {
    if (content) {
      const addendum = DOM.createDocumentFragment(content) as Node;
      for (const child of toArray(addendum.childNodes)) {
        Reflect.set(child, marker, true);
        template.content.append(child);
      }
      return true;
    }
    return false;
  }

  private unobserveTargets(flags: LifecycleFlags) {
    for (const observer of this.targetObservers) {
      if (observer.unbind) {
        observer.unbind(flags);
      }
    }
    this.targetObservers.clear();
  }
}
