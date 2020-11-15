import { IServiceLocator, Registration } from '@aurelia/kernel';
import {
  IDirtyChecker,
  INodeObserverLocator,
  IObserverLocator,
  LifecycleFlags,
  SetterObserver,
} from '@aurelia/runtime';
import { IPlatform } from '../platform';
import { AttributeNSAccessor } from './attribute-ns-accessor';
import { CheckedObserver } from './checked-observer';
import { ClassAttributeAccessor } from './class-attribute-accessor';
import { attrAccessor } from './data-attribute-accessor';
import { elementPropertyAccessor } from './element-property-accessor';
import { EventSubscriber } from './event-delegator';
import { SelectValueObserver } from './select-value-observer';
import { StyleAttributeAccessor } from './style-attribute-accessor';
import { ISVGAnalyzer } from './svg-analyzer';
import { ValueAttributeObserver } from './value-attribute-observer';

import type { IIndexable, IContainer } from '@aurelia/kernel';
import type { IAccessor, IBindingTargetAccessor, IObserver, ICollectionObserver, CollectionKind } from '@aurelia/runtime';
import type { INode } from '../dom';

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

export interface IHtmlObserverConstructor {
  new (
    el: INode,
    key: PropertyKey,
    handler: EventSubscriber,
    observerLocator: IObserverLocator,
    locator: IServiceLocator,
  ): IObserver;
}

export interface INodeObserverConfig extends Partial<NodeObserverConfig> {
  events: string[];
}

export class NodeObserverConfig {
  /**
   * The observer constructor to use
   */
  type: IHtmlObserverConstructor;
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

  public constructor(config: INodeObserverConfig) {
    this.type = config.type ?? ValueAttributeObserver;
    this.events = config.events;
    this.readonly = config.readonly;
    this.default = config.default;
  }
}

const selectEventsConfig: NodeObserverConfig = new NodeObserverConfig({ events: ['change'], default: '' });

export class NodeObserverLocator implements INodeObserverLocator {
  public allowDirtyCheck: boolean = true;

  private readonly globalLookup: Record<string, NodeObserverConfig> = createLookup();
  private readonly eventsLookup: Record<string, Record<string, NodeObserverConfig>> = createLookup();
  private readonly overrides: Record<string, true> = getDefaultOverrideProps();

  public constructor(
    @IServiceLocator private readonly locator: IServiceLocator,
    @IPlatform private readonly platform: IPlatform,
    @IDirtyChecker private readonly dirtyChecker: IDirtyChecker,
    @ISVGAnalyzer private readonly svgAnalyzer: ISVGAnalyzer,
  ) {
    // todo: atm, platform is required to be resolved too eagerly for the `.handles()` check
    // also a lot of tests assume default availability of observation
    // those 2 assumptions make it not the right time to extract the following line into a
    // default configuration for NodeObserverLocator yet
    // but in the future, they should be, so apps that don't use check box/select, or implement a different
    // observer don't have to pay the of the default implementation
    const inputEvents = ['change', 'input'];
    const inputEventsConfig: INodeObserverConfig = { events: inputEvents, default: '' };
    this.useConfig({
      INPUT: {
        value: inputEventsConfig,
        checked: { type: CheckedObserver, events: inputEvents } ,
        files: { events: inputEvents, readonly: true },
      },
      SELECT: {
        value: { type: SelectValueObserver, events: ['change'], default: '' },
      },
      TEXTAREA: {
        value: inputEventsConfig,
      },
    });

    const contentEventsConfig: INodeObserverConfig = { events: ['change', 'input', 'blur', 'keyup', 'paste'], default: '' };
    const scrollEventsConfig: INodeObserverConfig = { events: ['scroll'], default: 0 };
    this.useGlobalConfig({
      scrollTop: scrollEventsConfig,
      scrollLeft: scrollEventsConfig,
      textContent: contentEventsConfig,
      innerHTML: contentEventsConfig,
    });
  }

  public static register(container: IContainer) {
    Registration.aliasTo(INodeObserverLocator, NodeObserverLocator).register(container);
    Registration.singleton(INodeObserverLocator, NodeObserverLocator).register(container);
  }

  // deepscan-disable-next-line
  public handles(obj: unknown, _key: PropertyKey): boolean {
    return obj instanceof this.platform.Node;
  }

  public useConfig(config: Record<string, Record<string, INodeObserverConfig>>): void;
  public useConfig(nodeName: string, key: PropertyKey, events: INodeObserverConfig): void;
  public useConfig(nodeNameOrConfig: string | Record<string, Record<string, INodeObserverConfig>>, key?: PropertyKey, eventsConfig?: INodeObserverConfig): void {
    const lookup = this.eventsLookup;
    let existingMapping: Record<string, NodeObserverConfig>;
    if (typeof nodeNameOrConfig === 'string') {
      existingMapping = lookup[nodeNameOrConfig] ??= createLookup();
      if (existingMapping[key as string] == null) {
        existingMapping[key as string] = new NodeObserverConfig(eventsConfig!);
      } else {
        throwMappingExisted(nodeNameOrConfig, key!);
      }
    } else {
      for (const nodeName in nodeNameOrConfig) {
        existingMapping = lookup[nodeName] ??= createLookup();
        const newMapping = nodeNameOrConfig[nodeName];
        for (key in newMapping) {
          if (existingMapping[key] == null) {
            existingMapping[key] = new NodeObserverConfig(newMapping[key]);
          } else {
            throwMappingExisted(nodeName, key);
          }
        }
      }
    }
  }

  public useGlobalConfig(config: Record<string, INodeObserverConfig>): void;
  public useGlobalConfig(key: PropertyKey, events: INodeObserverConfig): void;
  public useGlobalConfig(configOrKey: PropertyKey | Record<string, INodeObserverConfig>, eventsConfig?: INodeObserverConfig): void {
    const lookup = this.globalLookup;
    if (typeof configOrKey === 'object') {
      for (const key in configOrKey) {
        if (lookup[key] == null) {
          lookup[key] = new NodeObserverConfig(configOrKey[key]);
        } else {
          throwMappingExisted('*', key);
        }
      }
    } else {
      if (lookup[configOrKey as string] == null) {
        lookup[configOrKey as string] = new NodeObserverConfig(eventsConfig!);
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
    switch (key) {
      case 'role':
        return attrAccessor;
      case 'class':
        return new ClassAttributeAccessor(el);
      case 'css':
      case 'style':
        return new StyleAttributeAccessor(el);
    }
    const eventsConfig: NodeObserverConfig | undefined = this.eventsLookup[el.tagName]?.[key as string] ?? this.globalLookup[key as string];
    if (eventsConfig != null) {
      return new eventsConfig.type(el, key, new EventSubscriber(eventsConfig), requestor, this.locator);
    }

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
      throw new Error(`Unable to observe property ${String(key)}. Register observation mapping with .useConfig().`);
    } else {
      // todo: probably still needs to get the property descriptor via getOwnPropertyDescriptor
      // but let's start with simplest scenario
      return new SetterObserver(el as HTMLElement & IIndexable, key as string);
    }
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
