import { IRegistry, Registration } from '@aurelia/kernel';
import {
  IDirtyChecker,
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
import type { IAccessor, IBindingTargetAccessor, IObserver, ICollectionObserver, CollectionKind } from '@aurelia/runtime';

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

export class NodeEventConfig {
  /**
   * Indicates the list of events can be used to observe a particular property
   */
  public readonly events!: string[];
  /**
   * Indicates whether this property is readonly, so observer wont attempt to assign value
   * example: input.files
   */
  public readonly readonly?: boolean;
  /**
   * A default value to assign to the corresponding property if the incoming value is null/undefined
   */
  public readonly default?: unknown;
  public constructor(config: NodeEventConfig) {
    Object.assign(this, config);
  }
}

const inputEventsConfig: NodeEventConfig = new NodeEventConfig({ events: ['change', 'input'], default: '' })
const selectEventsConfig: NodeEventConfig = new NodeEventConfig({ events: ['change'], default: '' });
const contentEventsConfig: NodeEventConfig = new NodeEventConfig({ events: ['change', 'input', 'blur', 'keyup', 'paste'], default: '' });
const scrollEventsConfig: NodeEventConfig = new NodeEventConfig({ events: ['scroll'], default: 0 });

export const DefaultNodeObserverLocatorRegistration: IRegistry = {
  register(container) {
    Registration.singleton(INodeObserverLocator, NodeObserverLocator).register(container);
    Registration.aliasTo(INodeObserverLocator, NodeObserverLocator).register(container);
    const locator = container.get(NodeObserverLocator);
    locator.useConfig({
      INPUT: {
        value: inputEventsConfig,
        files: { events: inputEventsConfig.events, readonly: true },
      },
      TEXTAREA: {
        value: inputEventsConfig,
      },
    });
    locator.useGlobalConfig({
      scrollTop: scrollEventsConfig,
      scrollLeft: scrollEventsConfig,
      textContent: contentEventsConfig,
      innerHTML: contentEventsConfig,
    });
  }
}

export class NodeObserverLocator implements INodeObserverLocator {

  private readonly globalLookup: Record<string, NodeEventConfig> = createLookup();
  // { input: { value: ['change', 'input'] } }
  private readonly eventsLookup: Record<string, Record<string, NodeEventConfig>> = createLookup();
  private readonly overrides: Record<string, true> = getDefaultOverrideProps();

  public allowDirtyCheck: boolean = true;

  public constructor(
    @IPlatform private readonly platform: IPlatform,
    @IDirtyChecker private readonly dirtyChecker: IDirtyChecker,
    @ISVGAnalyzer private readonly svgAnalyzer: ISVGAnalyzer,
  ) {}

  // deepscan-disable-next-line
  public handles(obj: unknown, _key: PropertyKey): boolean {
    return obj instanceof this.platform.Node;
  }

  public useConfig(config: Record<string, Record<string, NodeEventConfig>>): void;
  public useConfig(nodeName: string, key: PropertyKey, events: NodeEventConfig): void;
  public useConfig(nodeNameOrConfig: string | Record<string, Record<string, NodeEventConfig>>, key?: PropertyKey, eventsConfig?: NodeEventConfig): void {
    const lookup = this.eventsLookup;
    let existingMapping: Record<string, NodeEventConfig>;
    if (typeof nodeNameOrConfig === 'string') {
      existingMapping = lookup[nodeNameOrConfig] ??= createLookup();
      if (existingMapping[key as string] == null) {
        existingMapping[key as string] = eventsConfig!;
      } else {
        throwMappingExisted(nodeNameOrConfig, key!);
      }
    } else {
      for (const nodeName in nodeNameOrConfig) {
        existingMapping = lookup[nodeName] ??= createLookup<NodeEventConfig>();
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

  public useGlobalConfig(config: Record<string, NodeEventConfig>): void;
  public useGlobalConfig(key: PropertyKey, events: NodeEventConfig): void;
  public useGlobalConfig(configOrKey: PropertyKey | Record<string, NodeEventConfig>, eventsConfig?: NodeEventConfig): void {
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
      default: {
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
    const eventsConfig: NodeEventConfig | undefined = this.eventsLookup[tagName]?.[key as string] ?? this.globalLookup[key as string];
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
        if (this.allowDirtyCheck) {
          return this.dirtyChecker.createProperty(el, key as string);
        }
        // consider:
        // - maybe add a adapter API to handle unknown obj/key combo
        throw new Error(`Unable to observe property ${String(key)}. Register observation mapping with .useEvent().`);
      } else {
        // todo: probably still needs to get the property descriptor via getOwnPropertyDescriptor
        // but let's start with simplest scenario
        return new SetterObserver(el as HTMLElement & IIndexable, key as string);
      }
    }
    return new ValueAttributeObserver(el, key, new EventSubscriber(eventsConfig));
  }
}

function getDefaultOverrideProps() {
  return [
    'class',
    'style',
    'css',
    'checked',
    'value',
    'model',
    'xml:lang',
    'xml:space',
    'xmlns',
    'xmlns:xlink',
  ].reduce((overrides, attr) => {
    overrides[attr] = true;
    return overrides;
  },createLookup<true>());
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
