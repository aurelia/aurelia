import { IEventAggregator, IServiceLocator } from '@aurelia/kernel';
import { connectable, CustomExpression, DOM, Interpolation, IObserverLocator, IPartialConnectableBinding, IScope, IsExpression, LifecycleFlags, State } from '@aurelia/runtime';
import i18next from 'i18next';
import { I18N, I18nService, I18N_EA_CHANNEL } from '../i18n';

type ContentAttribute = 'textContent' | 'innerHTML' | 'prepend' | 'append';
interface ContentValue {
  textContent?: string;
  innerHTML?: string;
  prepend?: string;
  append?: string;
}

@connectable()
export class TranslationBinding implements IPartialConnectableBinding {
  public id!: number;
  public $state: State;
  public expr?: IsExpression;
  public parametersExpr?: IsExpression;
  private readonly i18n: I18nService;
  private readonly contentAttributes: ReadonlyArray<string> = ['textContent', 'innerHTML', 'prepend', 'append'];
  private keyExpression!: string;
  private translationParameters!: Record<string, any>;
  private scope!: IScope;
  private isInterpolatedSourceExpr!: boolean;

  constructor(
    public readonly target: HTMLElement,
    private readonly instruction: string,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator
  ) {
    this.$state = State.none;
    this.i18n = this.locator.get(I18N);
    const ea: IEventAggregator = this.locator.get(IEventAggregator);
    ea.subscribe(I18N_EA_CHANNEL, this.handleLocaleChange.bind(this));
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string | undefined): void {
    if (!this.expr) { throw new Error('key expression is missing'); }
    this.scope = scope;
    this.isInterpolatedSourceExpr = this.expr instanceof Interpolation;

    this.keyExpression = this.expr.evaluate(flags, scope, this.locator, part) as string;
    if (this.parametersExpr) {
      this.translationParameters = this.parametersExpr.evaluate(flags, scope, this.locator, part) as Record<string, any>;
      this.parametersExpr.connect(flags, scope, this as any, part);
    }

    if (!(this.expr instanceof CustomExpression)) {
      if (this.isInterpolatedSourceExpr) {
        for (const expr of (this.expr as Interpolation).expressions) {
          expr.connect(flags, scope, this as any, part);
        }
      } else {
        this.expr.connect(flags, scope, this as any, part);
      }
    }

    this.updateTranslations(flags);
  }
  public $unbind(flags: LifecycleFlags): void { }
  public handleChange(newValue: string | Record<string, any>, _previousValue: string | Record<string, any>, flags: LifecycleFlags): void {
    if (typeof newValue === 'object') {
      this.translationParameters = newValue;
    } else {
      this.keyExpression = this.isInterpolatedSourceExpr
        ? this.expr!.evaluate(flags, this.scope, this.locator, '') as string
        : newValue;
    }
    this.updateTranslations(flags);
  }

  private handleLocaleChange() {
    this.updateTranslations(LifecycleFlags.none);
  }

  private updateTranslations(flags: LifecycleFlags) {
    const results = this.i18n.evaluate(this.keyExpression, this.translationParameters as i18next.TOptions<object>);
    const content: ContentValue = Object.create(null);

    for (const item of results) {
      const value = item.value;
      const attributes = this.preprocessAttributes(item.attributes);
      for (const attribute of attributes) {
        if (!this.isContentAttribute(attribute)) {
          const observer = this.observerLocator.getAccessor(LifecycleFlags.none, this.target, attribute);
          observer.setValue(value, flags);
        } else {
          content[attribute] = value;
        }
      }
    }
    if (Object.keys(content).length) {
      this.updateContent(content, flags);
    }
  }

  private preprocessAttributes(attributes: string[]) {
    if (attributes.length === 0) {
      attributes = this.target.tagName === 'IMG' ? ['src'] : ['textContent'];
    }
    const htmlIndex = attributes.findIndex((attr) => attr === 'html');
    if (htmlIndex > -1) {
      attributes.splice(htmlIndex, 1, 'innerHTML');
    }
    return attributes;
  }

  private isContentAttribute(attribute: string): attribute is ContentAttribute {
    return this.contentAttributes.includes(attribute);
  }
  private updateContent(content: ContentValue, flags: LifecycleFlags) {
    const children = Array.from(this.target.childNodes);
    const fallBackContents = [];
    const marker = 'au-i18n';

    // extract the original content, not manipulate by au-i18n
    for (const child of children) {
      if (!Reflect.get(child, marker)) {
        fallBackContents.push(child);
      }
    }

    // build template and add marker
    const template = DOM.createTemplate() as HTMLTemplateElement;

    // prepend text if exists
    if (content.prepend) {
      const prepend: Node = DOM.createTextNode(content.prepend) as Node;
      Reflect.set(prepend, marker, true);
      template.content.append(prepend);
    }
    // build content: prioritize [html], then textContent, and falls back to original content
    if (content.innerHTML) {
      const fragment = DOM.createDocumentFragment(content.innerHTML) as DocumentFragment;
      for (const child of Array.from(fragment.childNodes)) {
        Reflect.set(child, marker, true);
        template.content.append(child);
      }
    } else if (content.textContent) {
      const textContent = DOM.createTextNode(content.textContent) as Text;
      Reflect.set(textContent, marker, true);
      template.content.append(textContent);
    } else {
      for (const fallbackContent of fallBackContents) {
        template.content.append(fallbackContent);
      }
    }

    // append text if exists
    if (content.append) {
      const appended: Node = DOM.createTextNode(content.append) as Node;
      Reflect.set(appended, marker, true);
      template.content.append(appended);
    }

    // difficult to use the set property approach in this case, as most of the properties of Node is readonly
    // const observer = this.observerLocator.getAccessor(LifecycleFlags.none, this.target, '??');
    // observer.setValue(??, flags);

    this.target.innerHTML = '';
    for (const child of Array.from(template.content.childNodes)) {
      this.target.appendChild(child);
    }
  }
}
