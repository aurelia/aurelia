import { IContainer, Registration, IIndexable } from '@aurelia/kernel';
import {
  IAccessor,
  IBindingTargetAccessor,
  ILifecycle,
  INodeObserverLocator,
  IObserverLocator,
  IObserver,
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
  createLookup<[string, string]>(),
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
  },
);

const inputEvents = ['change', 'input'];
const selectEvents = ['change'];
const contentEvents = ['change', 'input', 'blur', 'keyup', 'paste'];
const scrollEvents = ['scroll'];

const getDefaultOverrideProps = () => [
  'class',
  'style',
  'css',
  'checked',
  'value',
  'model',
  // 'xlink:actuate',
  // 'xlink:arcrole',
  // 'xlink:href',
  // 'xlink:role',
  // 'xlink:show',
  // 'xlink:title',
  // 'xlink:type',
  'xml:lang',
  'xml:space',
  'xmlns',
  'xmlns:xlink',
].reduce((overrides, attr) => {
  overrides[attr] = true;
  return overrides;
},createLookup<true>());

export class NodeObserverLocator implements INodeObserverLocator {
  // { input: { value: ['change', 'input'] } }
  private readonly eventsLookup: Record<string, Record<string, string[]>> = createLookup();
  private readonly overrides: Record<string, true> = getDefaultOverrideProps();

  public constructor(
    @IPlatform private readonly platform: IPlatform,
    @ILifecycle private readonly lifecycle: ILifecycle,
    @ISVGAnalyzer private readonly svgAnalyzer: ISVGAnalyzer,
  ) {
    this.useEvent({
      INPUT: {
        value: inputEvents,
        files: inputEvents,
      },
      TEXTAREA: {
        value: inputEvents,
      },
    });
  }

  public static register(container: IContainer) {
    Registration.singleton(INodeObserverLocator, this).register(container);
  }

  // deepscan-disable-next-line
  public handles(obj: unknown, _key: PropertyKey): boolean {
    return obj instanceof this.platform.Node;
  }

  public useEvent(config: Record<string, Record<string, string[]>>): void;
  public useEvent(nodeName: string, key: PropertyKey, events: string[]): void;
  public useEvent(nodeNameOrConfig: string | Record<string, Record<string, string[]>>, key?: PropertyKey, events?: string[]): void {
    const lookup = this.eventsLookup;
    let existingMapping: Record<string, string[]>;
    if (typeof nodeNameOrConfig === 'string') {
      existingMapping = lookup[nodeNameOrConfig] ??= createLookup<string[]>();
      if (existingMapping[key as string] == null) {
        existingMapping[key as string] = events!;
      } else {
        throwMappingExisted(nodeNameOrConfig, key!);
      }
    } else {
      for (const nodeName in nodeNameOrConfig) {
        existingMapping = lookup[nodeName] ??= createLookup<string[]>();
        const newMapping = nodeNameOrConfig[nodeName];
        for (key in newMapping) {
          if (existingMapping[key] == null) {
            existingMapping[key] = newMapping[key];
          } else {
            throwMappingExisted(nodeName, key);
          }
        }
      }
    }
  }

  // deepscan-disable-nextline
  public getAccessor(obj: HTMLElement, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver {
    if (this.overrides[key as string] === true) {
      return this.getObserver(obj, key, requestor);
    }
    switch (key) {
      case 'class':
        return new ClassAttributeAccessor(LifecycleFlags.none, obj);
      case 'style':
      case 'css':
        return new StyleAttributeAccessor(LifecycleFlags.none, obj);
      // TODO: there are (many) more situation where we want to default to DataAttributeAccessor,
      // but for now stick to what vCurrent does
      case 'src':
      case 'href':
      // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
      case 'role':
        return attrAccessor;
      default:
        const nsProps = nsAttributes[key as string];
        if (nsProps !== undefined) {
          return AttributeNSAccessor.forNs(nsProps[1]) as IBindingTargetAccessor;
        }
        if (isDataAttribute(obj, key, this.svgAnalyzer)) {
          return attrAccessor;
        }
        return elementPropertyAccessor;
    }
  }

  public getObserver(el: HTMLElement, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver {
    const noFlags = LifecycleFlags.none;
    const tagName = el.tagName;
    if (tagName === 'SELECT' && key === 'value') {
      return new SelectValueObserver(requestor, this.platform, new EventSubscriber(selectEvents), el as ISelectElement);
    } else if (tagName === 'INPUT' && key === 'checked') {
      return new CheckedObserver(noFlags, this.lifecycle, new EventSubscriber(inputEvents), el as IInputElement);
    }
    let events: string[] | null;
    switch (key) {
      case 'css':
      case 'style':
        return new StyleAttributeAccessor(LifecycleFlags.none, el);
      case 'scrolltop':
      case 'scrollleft':
        events = scrollEvents;
        break;
      case 'textContent':
      case 'innerHTML':
        events = contentEvents;
        break;
      default:
        events = this.eventsLookup[tagName]?.[key as string];
        break;
    }
    if (events == null) {
      if (key in el.constructor.prototype) {
        // todo: if DirtyChecker is register, then use it
        throw new Error(`Unable to observe property ${String(key)}. Register observation mapping with .useEvent().`);
      } else {
        return new SetterObserver(noFlags, el as HTMLElement & IIndexable, key as string);
      }
    }
    return new ValueAttributeObserver(noFlags, new EventSubscriber(events), el as HTMLElement & IIndexable, key);
  }
}

function throwMappingExisted(nodeName: string, key: PropertyKey): never {
  throw new Error(`Mapping for property ${String(key)} of <${nodeName} /> already exists`);
}

const IsDataAttribute: Record<string, boolean> = createLookup();

function isDataAttribute(obj: Node, key: PropertyKey, svgAnalyzer: ISVGAnalyzer): boolean {
  if (IsDataAttribute[key as string] === true) {
    return true;
  }
  if (typeof key !== 'string') {
    return false;
  }
  const prefix = key.slice(0, 5);
  // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
  // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
  return IsDataAttribute[key] =
    prefix === 'aria-' ||
    prefix === 'data-' ||
    svgAnalyzer.isStandardSvgAttribute(obj, key);
}

function createLookup<T = unknown>(){
  return Object.create(null) as Record<string, T>;
}
