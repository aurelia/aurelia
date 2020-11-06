import { IContainer, IResolver, Registration, IIndexable } from '@aurelia/kernel';
import {
  IBindingTargetAccessor,
  IBindingTargetObserver,
  ILifecycle,
  IObserverLocator,
  ITargetAccessorLocator,
  ITargetObserverLocator,
  LifecycleFlags,
  SetterObserver,
} from '@aurelia/runtime';
import { IPlatform } from '../platform';
import { AttributeNSAccessor } from './attribute-ns-accessor';
import { CheckedObserver, IInputElement } from './checked-observer';
import { ClassAttributeAccessor } from './class-attribute-accessor';
import { attrAccessor } from './data-attribute-accessor';
import { elementPropertyAccessor } from './element-property-accessor';
import { EventSubscriber } from './event-delegator';
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
    @IPlatform private readonly platform: IPlatform,
    @ILifecycle private readonly lifecycle: ILifecycle,
    @ISVGAnalyzer private readonly svgAnalyzer: ISVGAnalyzer,
  ) {}

  public static register(container: IContainer): IResolver<ITargetObserverLocator> {
    return Registration.singleton(ITargetObserverLocator, this).register(container);
  }

  public getObserver(
    flags: LifecycleFlags,
    observerLocator: IObserverLocator,
    obj: Node,
    propertyName: string,
  ): IBindingTargetObserver | IBindingTargetAccessor | null {
    switch (propertyName) {
      case 'checked':
        return new CheckedObserver(flags, this.lifecycle, new EventSubscriber(inputEvents), obj as IInputElement);
      case 'value':
        if ((obj as Element).tagName === 'SELECT') {
          return new SelectValueObserver(observerLocator, this.platform, new EventSubscriber(selectEvents), obj as ISelectElement);
        }
        return new ValueAttributeObserver(flags, new EventSubscriber(inputEvents), obj as Node & IIndexable, propertyName);
      case 'files':
        return new ValueAttributeObserver(flags, new EventSubscriber(inputEvents), obj as Node & IIndexable, propertyName);
      case 'textContent':
      case 'innerHTML':
        return new ValueAttributeObserver(flags, new EventSubscriber(contentEvents), obj as Node & IIndexable, propertyName);
      case 'scrollTop':
      case 'scrollLeft':
        return new ValueAttributeObserver(flags, new EventSubscriber(scrollEvents), obj as Node & IIndexable, propertyName);
      case 'class':
        return new ClassAttributeAccessor(flags, obj as HTMLElement);
      case 'style':
      case 'css':
        return new StyleAttributeAccessor(flags, obj as HTMLElement);
      case 'model':
        return new SetterObserver(flags, obj as Node & IIndexable, propertyName);
      case 'role':
        return attrAccessor;
      default:
        if (nsAttributes[propertyName] !== undefined) {
          const nsProps = nsAttributes[propertyName];
          return AttributeNSAccessor.forNs(nsProps[1]) as IBindingTargetAccessor;
        }
        if (isDataAttribute(obj, propertyName, this.svgAnalyzer)) {
          return attrAccessor;
        }
    }
    return null!;
  }

  public overridesAccessor(flags: LifecycleFlags, obj: Node, propertyName: string): boolean {
    return overrideProps[propertyName] === true;
  }

  // consider a scenario where user would want to provide a Date object observation via patching a few mutation method on it
  // then this extension point of this default implementaion cannot be used,
  // and a new implementation of ITargetObserverLocator should be used instead
  // This default implementation only accounts for the most common target scenarios
  public handles(flags: LifecycleFlags, obj: unknown): boolean {
    return obj instanceof this.platform.Node;
  }
}

export class TargetAccessorLocator implements ITargetAccessorLocator {
  public constructor(
    @IPlatform private readonly platform: IPlatform,
    @ISVGAnalyzer private readonly svgAnalyzer: ISVGAnalyzer,
  ) {}

  public static register(container: IContainer): IResolver<ITargetAccessorLocator> {
    return Registration.singleton(ITargetAccessorLocator, this).register(container);
  }

  public getAccessor(
    flags: LifecycleFlags,
    obj: Node,
    propertyName: string,
  ): IBindingTargetAccessor {
    switch (propertyName) {
      case 'class':
        return new ClassAttributeAccessor(flags, obj as HTMLElement);
      case 'style':
      case 'css':
        return new StyleAttributeAccessor(flags, obj as HTMLElement);
      // TODO: there are (many) more situation where we want to default to DataAttributeAccessor,
      // but for now stick to what vCurrent does
      case 'src':
      case 'href':
      // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
      case 'role':
        return attrAccessor;
      default:
        if (nsAttributes[propertyName] !== undefined) {
          const nsProps = nsAttributes[propertyName];
          return AttributeNSAccessor.forNs(nsProps[1]) as IBindingTargetAccessor;
        }
        if (isDataAttribute(obj, propertyName, this.svgAnalyzer)) {
          return attrAccessor;
        }
        return elementPropertyAccessor;
    }
  }

  public handles(flags: LifecycleFlags, obj: Node): boolean {
    return obj instanceof this.platform.Node;
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
