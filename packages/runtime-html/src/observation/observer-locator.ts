import { Registration } from '@aurelia/kernel';
import {
  INodeObserverLocator,
  IObserverLocator,
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

import type { IContainer, IIndexable } from '@aurelia/kernel';
import type { IAccessor, IBindingTargetAccessor, INodeEventConfig, IObserver, ICollectionObserver, CollectionKind } from '@aurelia/runtime';

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

const inputEventsConfig: INodeEventConfig = { events: ['change', 'input'], default: '' };
const selectEventsConfig: INodeEventConfig = { events: ['change'], default: '' };
const contentEventsConfig: INodeEventConfig = { events: ['change', 'input', 'blur', 'keyup', 'paste'], default: '' };
const scrollEventsConfig: INodeEventConfig = { events: ['scroll'], default: 0 };

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

  private readonly globalLookup: Record<string, INodeEventConfig> = createLookup();
  // { input: { value: ['change', 'input'] } }
  private readonly eventsLookup: Record<string, Record<string, INodeEventConfig>> = createLookup();
  private readonly overrides: Record<string, true> = getDefaultOverrideProps();


  public constructor(
    @IPlatform private readonly platform: IPlatform,
    @ISVGAnalyzer private readonly svgAnalyzer: ISVGAnalyzer,
  ) {
    this.useConfig({
      INPUT: {
        value: inputEventsConfig,
        files: { events: inputEventsConfig.events, readonly: true },
      },
      TEXTAREA: {
        value: inputEventsConfig,
      },
    });
    this.useGlobalConfig({
      scrollTop: scrollEventsConfig,
      scrollLeft: scrollEventsConfig,
      textContent: contentEventsConfig,
      innerHTML: contentEventsConfig,
    });
  }

  public static register(container: IContainer) {
    Registration.singleton(INodeObserverLocator, this).register(container);
  }

  // deepscan-disable-next-line
  public handles(obj: unknown, _key: PropertyKey): boolean {
    return obj instanceof this.platform.Node;
  }

  public useConfig(config: Record<string, Record<string, INodeEventConfig>>): void;
  public useConfig(nodeName: string, key: PropertyKey, events: INodeEventConfig): void;
  public useConfig(nodeNameOrConfig: string | Record<string, Record<string, INodeEventConfig>>, key?: PropertyKey, eventsConfig?: INodeEventConfig): void {
    const lookup = this.eventsLookup;
    let existingMapping: Record<string, INodeEventConfig>;
    if (typeof nodeNameOrConfig === 'string') {
      existingMapping = lookup[nodeNameOrConfig] ??= createLookup();
      if (existingMapping[key as string] == null) {
        existingMapping[key as string] = eventsConfig!;
      } else {
        throwMappingExisted(nodeNameOrConfig, key!);
      }
    } else {
      for (const nodeName in nodeNameOrConfig) {
        existingMapping = lookup[nodeName] ??= createLookup<INodeEventConfig>();
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

  public useGlobalConfig(config: Record<string, INodeEventConfig>): void;
  public useGlobalConfig(key: PropertyKey, events: INodeEventConfig): void;
  public useGlobalConfig(configOrKey: PropertyKey | Record<string, INodeEventConfig>, eventsConfig?: INodeEventConfig): void {
    const lookup = this.globalLookup;
    if (typeof configOrKey === 'object') {
      for (const key in configOrKey) {
        if (lookup[key] == null) {
          lookup[key] = configOrKey[key];
        } else {
          throwMappingExisted('*', key);
        }
      }
    } else {
      if (lookup[configOrKey as string] == null) {
        lookup[configOrKey as string] = eventsConfig!;
      } else {
        throwMappingExisted('*', configOrKey);
      }
    }
  }

  // deepscan-disable-nextline
  public getAccessor(obj: HTMLElement, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver {
    if (this.overrides[key as string] === true) {
      return this.getObserver(obj, key, requestor);
    }
    switch (key) {
      // class / style / css attribute will be observed using .getObserver() per overrides
      //
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
    const tagName = el.tagName;
    if (tagName === 'SELECT' && key === 'value') {
      return new SelectValueObserver(el as ISelectElement, new EventSubscriber(selectEventsConfig), requestor, this.platform);
    } else if (tagName === 'INPUT' && key === 'checked') {
      return new CheckedObserver(el as IInputElement, new EventSubscriber(inputEventsConfig), requestor);
    }
    switch (key) {
      case 'role':
        return attrAccessor;
      case 'class':
        return new ClassAttributeAccessor(el);
      case 'css':
      case 'style':
        return new StyleAttributeAccessor(el);
    }
    const eventsConfig: INodeEventConfig | undefined = this.eventsLookup[tagName]?.[key as string] ?? this.globalLookup[key as string];
    if (eventsConfig == null) {
      const nsProps = nsAttributes[key as string];
      if (nsProps !== undefined) {
        return AttributeNSAccessor.forNs(nsProps[1]) as IBindingTargetAccessor;
      }
      if (isDataAttribute(el, key, this.svgAnalyzer)) {
        // todo: should observe
        return attrAccessor;
      }
      if (key in el.constructor.prototype) {
        // todo: either:
        // - if DirtyChecker is register, then use it
        // - add a adapter API to handle unknown obj/key combo
        throw new Error(`Unable to observe property ${String(key)}. Register observation mapping with .useEvent().`);
      } else {
        return new SetterObserver(el as HTMLElement & IIndexable, key as string);
      }
    }
    return new ValueAttributeObserver(el, key, new EventSubscriber(eventsConfig));
  }
}

export function getCollectionObserver(collection: unknown, observerLocator: IObserverLocator): ICollectionObserver<CollectionKind> | undefined {
  if (collection instanceof Array) {
    return observerLocator.getArrayObserver(LifecycleFlags.none, collection);
  }
  if (collection instanceof Map) {
    return observerLocator.getMapObserver(LifecycleFlags.none, collection);
  }
  if (collection instanceof Set) {
    return observerLocator.getSetObserver(LifecycleFlags.none, collection);
  }
  return;
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
