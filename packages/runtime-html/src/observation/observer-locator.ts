
import { IContainer, IResolver, Key, Registration, IIndexable } from '@aurelia/kernel';
import {
  IBindingTargetAccessor,
  IBindingTargetObserver,
  IDOM,
  ILifecycle,
  IObserverLocator,
  ITargetAccessorLocator,
  ITargetObserverLocator,
  LifecycleFlags,
  SetterObserver,
  IScheduler
} from '@aurelia/runtime';
import { AttributeNSAccessor } from './attribute-ns-accessor';
import { CheckedObserver, IInputElement } from './checked-observer';
import { ClassAttributeAccessor } from './class-attribute-accessor';
import { DataAttributeAccessor } from './data-attribute-accessor';
import { ElementPropertyAccessor } from './element-property-accessor';
import { EventSubscriber } from './event-manager';
import { ISelectElement, SelectValueObserver } from './select-value-observer';
import { StyleAttributeAccessor } from './style-attribute-accessor';
import { ISVGAnalyzer } from './svg-analyzer';
import { ValueAttributeObserver } from './value-attribute-observer';

// https://infra.spec.whatwg.org/#namespaces
const htmlNS = 'http://www.w3.org/1999/xhtml';
const mathmlNS = 'http://www.w3.org/1998/Math/MathML';
const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const xmlnsNS = 'http://www.w3.org/2000/xmlns/';

// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
const nsAttributes = Object.assign(
  Object.create(null),
  {
    'xlink:actuate': ['actuate', xlinkNS],
    'xlink:arcrole': ['arcrole', xlinkNS],
    'xlink:href': ['href', xlinkNS],
    'xlink:role': ['role', xlinkNS],
    'xlink:show': ['show', xlinkNS],
    'xlink:title': ['title', xlinkNS],
    'xlink:type': ['type', xlinkNS],
    'xml:lang': ['lang', xmlNS],
    'xml:space': ['space', xmlNS],
    'xmlns': ['xmlns', xmlnsNS],
    'xmlns:xlink': ['xlink', xmlnsNS],
  }
) as Record<string, [string, string]>;

const inputEvents = ['change', 'input'];
const selectEvents = ['change'];
const contentEvents = ['change', 'input', 'blur', 'keyup', 'paste'];
const scrollEvents = ['scroll'];

const overrideProps = Object.assign(
  Object.create(null),
  {
    'class': true,
    'style': true,
    'css': true,
    'checked': true,
    'value': true,
    'model': true,
    'xlink:actuate': true,
    'xlink:arcrole': true,
    'xlink:href': true,
    'xlink:role': true,
    'xlink:show': true,
    'xlink:title': true,
    'xlink:type': true,
    'xml:lang': true,
    'xml:space': true,
    'xmlns': true,
    'xmlns:xlink': true,
  }
) as Record<string, boolean>;

export class TargetObserverLocator implements ITargetObserverLocator {
  public constructor(
    @IDOM private readonly dom: IDOM,
    @ISVGAnalyzer private readonly svgAnalyzer: ISVGAnalyzer,
  ) {}

  public static register(container: IContainer): IResolver<ITargetObserverLocator> {
    return Registration.singleton(ITargetObserverLocator, this).register(container);
  }

  public getObserver(
    flags: LifecycleFlags,
    scheduler: IScheduler,
    lifecycle: ILifecycle,
    observerLocator: IObserverLocator,
    obj: Node,
    propertyName: string,
  ): IBindingTargetObserver | IBindingTargetAccessor {
    switch (propertyName) {
      case 'checked':
        return new CheckedObserver(scheduler, flags, observerLocator, new EventSubscriber(this.dom, inputEvents), obj as IInputElement);
      case 'value':
        if ((obj as Element).tagName === 'SELECT') {
          return new SelectValueObserver(scheduler, flags, observerLocator, this.dom, new EventSubscriber(this.dom, selectEvents), obj as ISelectElement);
        }
        return new ValueAttributeObserver(scheduler, flags, new EventSubscriber(this.dom, inputEvents), obj as Node & IIndexable, propertyName);
      case 'files':
        return new ValueAttributeObserver(scheduler, flags, new EventSubscriber(this.dom, inputEvents), obj as Node & IIndexable, propertyName);
      case 'textContent':
      case 'innerHTML':
        return new ValueAttributeObserver(scheduler, flags, new EventSubscriber(this.dom, contentEvents), obj as Node & IIndexable, propertyName);
      case 'scrollTop':
      case 'scrollLeft':
        return new ValueAttributeObserver(scheduler, flags, new EventSubscriber(this.dom, scrollEvents), obj as Node & IIndexable, propertyName);
      case 'class':
        return new ClassAttributeAccessor(scheduler, flags, obj as HTMLElement);
      case 'style':
      case 'css':
        return new StyleAttributeAccessor(scheduler, flags, obj as HTMLElement);
      case 'model':
        return new SetterObserver(lifecycle, flags, obj, propertyName);
      case 'role':
        return new DataAttributeAccessor(scheduler, flags, obj as HTMLElement, propertyName);
      default:
        if (nsAttributes[propertyName] !== undefined) {
          const nsProps = nsAttributes[propertyName];
          return new AttributeNSAccessor(scheduler, flags, obj as HTMLElement, nsProps[0], nsProps[1]);
        }
        if (isDataAttribute(obj, propertyName, this.svgAnalyzer)) {
          return new DataAttributeAccessor(scheduler, flags, obj as HTMLElement, propertyName);
        }
    }
    return null!;
  }

  public overridesAccessor(flags: LifecycleFlags, obj: Node, propertyName: string): boolean {
    return overrideProps[propertyName] === true;
  }

  public handles(flags: LifecycleFlags, obj: unknown): boolean {
    return this.dom.isNodeInstance(obj);
  }
}

export class TargetAccessorLocator implements ITargetAccessorLocator {
  public static readonly inject: readonly Key[] = [IDOM, ISVGAnalyzer];

  private readonly dom: IDOM;
  private readonly svgAnalyzer: ISVGAnalyzer;

  public constructor(dom: IDOM, svgAnalyzer: ISVGAnalyzer) {
    this.dom = dom;
    this.svgAnalyzer = svgAnalyzer;
  }

  public static register(container: IContainer): IResolver<ITargetAccessorLocator> {
    return Registration.singleton(ITargetAccessorLocator, this).register(container);
  }

  public getAccessor(
    flags: LifecycleFlags,
    scheduler: IScheduler,
    lifecycle: ILifecycle,
    obj: Node,
    propertyName: string,
  ): IBindingTargetAccessor {
    switch (propertyName) {
      case 'textContent':
        // note: this case is just an optimization (textContent is the most often used property)
        return new ElementPropertyAccessor(scheduler, flags, obj as Node & IIndexable, propertyName);
      case 'class':
        return new ClassAttributeAccessor(scheduler, flags, obj as HTMLElement);
      case 'style':
      case 'css':
        return new StyleAttributeAccessor(scheduler, flags, obj as HTMLElement);
      // TODO: there are (many) more situation where we want to default to DataAttributeAccessor,
      // but for now stick to what vCurrent does
      case 'src':
      case 'href':
      // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
      case 'role':
        return new DataAttributeAccessor(scheduler, flags, obj as HTMLElement, propertyName);
      default:
        if (nsAttributes[propertyName] !== undefined) {
          const nsProps = nsAttributes[propertyName];
          return new AttributeNSAccessor(scheduler, flags, obj as HTMLElement, nsProps[0], nsProps[1]);
        }
        if (isDataAttribute(obj, propertyName, this.svgAnalyzer)) {
          return new DataAttributeAccessor(scheduler, flags, obj as HTMLElement, propertyName);
        }
        return new ElementPropertyAccessor(scheduler, flags, obj as Node & IIndexable, propertyName);
    }
  }

  public handles(flags: LifecycleFlags, obj: Node): boolean {
    return this.dom.isNodeInstance(obj);
  }
}

const IsDataAttribute: Record<string, boolean> = {};

function isDataAttribute(obj: Node, propertyName: string, svgAnalyzer: ISVGAnalyzer): boolean {
  if (IsDataAttribute[propertyName] === true) {
    return true;
  }
  const prefix = propertyName.slice(0, 5);
  // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
  // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
  return IsDataAttribute[propertyName] =
    prefix === 'aria-' ||
    prefix === 'data-' ||
    svgAnalyzer.isStandardSvgAttribute(obj, propertyName);
}
