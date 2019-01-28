
import { IContainer, InterfaceSymbol, IResolver, Registration } from '@aurelia/kernel';
import {
  IBindingTargetAccessor,
  IBindingTargetObserver,
  IDOM,
  ILifecycle,
  IObserverLocator,
  ITargetAccessorLocator,
  ITargetObserverLocator,
  LifecycleFlags,
  SetterObserver
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
const nsAttributes = (function (o: Record<string, [string, string]>): typeof o {
  o['xlink:actuate'] = ['actuate', xlinkNS];
  o['xlink:arcrole'] = ['arcrole', xlinkNS];
  o['xlink:href'] = ['href', xlinkNS];
  o['xlink:role'] = ['role', xlinkNS];
  o['xlink:show'] = ['show', xlinkNS];
  o['xlink:title'] = ['title', xlinkNS];
  o['xlink:type'] = ['type', xlinkNS];
  o['xml:lang'] = ['lang', xmlNS];
  o['xml:space'] = ['space', xmlNS];
  o['xmlns'] = ['xmlns', xmlnsNS];
  o['xmlns:xlink'] = ['xlink', xmlnsNS];
  return o;
})(Object.create(null));

const inputEvents = ['change', 'input'];
const selectEvents = ['change'];
const contentEvents = ['change', 'input', 'blur', 'keyup', 'paste'];
const scrollEvents = ['scroll'];

const overrideProps = (function (o: Record<string, boolean>): typeof o {
  o['class'] = true;
  o['style'] = true;
  o['css'] = true;
  o['checked'] = true;
  o['value'] = true;
  o['model'] = true;
  o['xlink:actuate'] = true;
  o['xlink:arcrole'] = true;
  o['xlink:href'] = true;
  o['xlink:role'] = true;
  o['xlink:show'] = true;
  o['xlink:title'] = true;
  o['xlink:type'] = true;
  o['xml:lang'] = true;
  o['xml:space'] = true;
  o['xmlns'] = true;
  o['xmlns:xlink'] = true;
  return o;
})(Object.create(null));

export class TargetObserverLocator implements ITargetObserverLocator {
  public static readonly inject: ReadonlyArray<InterfaceSymbol> = [IDOM, ISVGAnalyzer];

  private readonly dom: IDOM;
  private readonly svgAnalyzer: ISVGAnalyzer;

  constructor(dom: IDOM, svgAnalyzer: ISVGAnalyzer) {
    this.dom = dom;
    this.svgAnalyzer = svgAnalyzer;
  }

  public static register(container: IContainer): IResolver<ITargetObserverLocator> {
    return Registration.singleton(ITargetObserverLocator, this).register(container);
  }

  public getObserver(flags: LifecycleFlags, lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: Node, propertyName: string): IBindingTargetObserver | IBindingTargetAccessor {
    switch (propertyName) {
      case 'checked':
        return new CheckedObserver(flags, lifecycle, obj as IInputElement, new EventSubscriber(this.dom, inputEvents), observerLocator);
      case 'value':
        if (obj['tagName'] === 'SELECT') {
          return new SelectValueObserver(flags, lifecycle, obj as ISelectElement, new EventSubscriber(this.dom, selectEvents), observerLocator, this.dom);
        }
        return new ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(this.dom, inputEvents));
      case 'files':
        return new ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(this.dom, inputEvents));
      case 'textContent':
      case 'innerHTML':
        return new ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(this.dom, contentEvents));
      case 'scrollTop':
      case 'scrollLeft':
        return new ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(this.dom, scrollEvents));
      case 'class':
        return new ClassAttributeAccessor(lifecycle, obj as HTMLElement);
      case 'style':
      case 'css':
        return new StyleAttributeAccessor(lifecycle, obj as HTMLElement);
      case 'model':
        return new SetterObserver(flags, obj, propertyName);
      case 'role':
        return new DataAttributeAccessor(lifecycle, obj as HTMLElement, propertyName);
      default:
        if (nsAttributes[propertyName] !== undefined) {
          const nsProps = nsAttributes[propertyName];
          return new AttributeNSAccessor(lifecycle, obj as HTMLElement, propertyName, nsProps[0], nsProps[1]);
        }
        const prefix = propertyName.slice(0, 5);
        // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
        // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
        if (prefix === 'aria-' || prefix === 'data-' || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)) {
          return new DataAttributeAccessor(lifecycle, obj as HTMLElement, propertyName);
        }
    }
    return null;
  }

  public overridesAccessor(flags: LifecycleFlags, obj: Node, propertyName: string): boolean {
    return overrideProps[propertyName] === true;
  }

  public handles(flags: LifecycleFlags, obj: unknown): boolean {
    return this.dom.isNodeInstance(obj);
  }
}

export class TargetAccessorLocator implements ITargetAccessorLocator {
  public static readonly inject: ReadonlyArray<InterfaceSymbol> = [IDOM, ISVGAnalyzer];

  private readonly dom: IDOM;
  private readonly svgAnalyzer: ISVGAnalyzer;

  constructor(dom: IDOM, svgAnalyzer: ISVGAnalyzer) {
    this.dom = dom;
    this.svgAnalyzer = svgAnalyzer;
  }

  public static register(container: IContainer): IResolver<ITargetAccessorLocator> {
    return Registration.singleton(ITargetAccessorLocator, this).register(container);
  }

  public getAccessor(flags: LifecycleFlags, lifecycle: ILifecycle, obj: Node, propertyName: string): IBindingTargetAccessor {
    switch (propertyName) {
      case 'textContent':
        // note: this case is just an optimization (textContent is the most often used property)
        return new ElementPropertyAccessor(lifecycle, obj, propertyName);
      case 'class':
        return new ClassAttributeAccessor(lifecycle, obj as HTMLElement);
      case 'style':
      case 'css':
        return new StyleAttributeAccessor(lifecycle, obj as HTMLElement);
      // TODO: there are (many) more situation where we want to default to DataAttributeAccessor,
      // but for now stick to what vCurrent does
      case 'src':
      case 'href':
      // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
      case 'role':
        return new DataAttributeAccessor(lifecycle, obj as HTMLElement, propertyName);
      default:
        if (nsAttributes[propertyName] !== undefined) {
          const nsProps = nsAttributes[propertyName];
          return new AttributeNSAccessor(lifecycle, obj as HTMLElement, propertyName, nsProps[0], nsProps[1]);
        }
        const prefix = propertyName.slice(0, 5);
        // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
        // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
        if (prefix === 'aria-' || prefix === 'data-' || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)) {
          return new DataAttributeAccessor(lifecycle, obj as HTMLElement, propertyName);
        }

        return new ElementPropertyAccessor(lifecycle, obj, propertyName);
    }
  }

  public handles(flags: LifecycleFlags, obj: Node): boolean {
    return this.dom.isNodeInstance(obj);
  }
}
