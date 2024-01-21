import { emptyObject, IServiceLocator, resolve } from '@aurelia/kernel';
import {
  getObserverLookup,
  IDirtyChecker,
  INodeObserverLocator,
  IObserverLocator,
  PropertyAccessor,
  SetterObserver,
} from '@aurelia/runtime';
import { IPlatform } from '../platform';
import { AttributeNSAccessor } from './attribute-ns-accessor';
import { CheckedObserver } from './checked-observer';
import { ClassAttributeAccessor } from './class-attribute-accessor';
import { attrAccessor } from './data-attribute-accessor';
import { SelectValueObserver } from './select-value-observer';
import { StyleAttributeAccessor } from './style-attribute-accessor';
import { ISVGAnalyzer } from './svg-analyzer';
import { ValueAttributeObserver } from './value-attribute-observer';
import { atLayout, atNode, createLookup, isDataAttribute, isString, objectAssign } from '../utilities';
import { aliasRegistration, singletonRegistration } from '../utilities-di';

import type { IIndexable, IContainer } from '@aurelia/kernel';
import type { AccessorType, IAccessor, IObserver, ICollectionObserver, CollectionKind } from '@aurelia/runtime';
import type { INode } from '../dom';
import { createMappedError, ErrorNames } from '../errors';

// https://infra.spec.whatwg.org/#namespaces
// const htmlNS = 'http://www.w3.org/1999/xhtml';
// const mathmlNS = 'http://www.w3.org/1998/Math/MathML';
// const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const xmlnsNS = 'http://www.w3.org/2000/xmlns/';

// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
const nsAttributes = objectAssign(
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

const elementPropertyAccessor = new PropertyAccessor();
elementPropertyAccessor.type = (atNode | atLayout) as AccessorType;

export interface INodeObserverConfigBase {
  /**
   * Indicates the list of events can be used to observe a particular property
   */
  readonly events: string[];
  /**
   * Indicates whether this property is readonly, so observer wont attempt to assign value
   * example: input.files
   */
  readonly readonly?: boolean;
  /**
   * A default value to assign to the corresponding property if the incoming value is null/undefined
   */
  readonly default?: unknown;
}

export interface INodeObserver extends IObserver {
  /**
   * Instruct this node observer event observation behavior
   */
  useConfig(config: INodeObserverConfigBase): void;
}

export type INodeObserverConstructor =
  new (
    el: INode,
    key: PropertyKey,
    config: INodeObserverConfig,
    observerLocator: IObserverLocator,
    locator: IServiceLocator,
  ) => INodeObserver;

export interface INodeObserverConfig {
  /**
   * The observer constructor to use
   */
  readonly type?: INodeObserverConstructor;
  /**
   * Indicates the list of events can be used to observe a particular property
   */
  readonly events: string[];
  /**
   * Indicates whether this property is readonly, so observer wont attempt to assign value
   * example: input.files
   */
  readonly readonly?: boolean;
  /**
   * A default value to assign to the corresponding property if the incoming value is null/undefined
   */
  readonly default?: unknown;
}

export class NodeObserverLocator implements INodeObserverLocator {
  /** @internal */
  protected static readonly inject = [IServiceLocator, IPlatform, IDirtyChecker, ISVGAnalyzer];

  /**
   * Indicates whether the node observer will be allowed to use dirty checking for a property it doesn't know how to observe
   */
  public allowDirtyCheck: boolean = true;

  /** @internal */
  private readonly _events: Record<string, Record<string, INodeObserverConfig>> = createLookup();
  /** @internal */
  private readonly _globalEvents: Record<string, INodeObserverConfig> = createLookup();
  /** @internal */
  private readonly _overrides: Record<string, Record<string, true>> = createLookup();
  /** @internal */
  private readonly _globalOverrides: Record<string, true> = createLookup();

  /** @internal */
  private readonly _locator = resolve(IServiceLocator);
  /** @internal */
  private readonly _platform = resolve(IPlatform);
  /** @internal */
  private readonly _dirtyChecker = resolve(IDirtyChecker);
  /** @internal */
  private readonly svg = resolve(ISVGAnalyzer);

  public constructor() {
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
        valueAsNumber: { events: inputEvents, default: 0 },
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
    this.useConfigGlobal({
      scrollTop: scrollEventsConfig,
      scrollLeft: scrollEventsConfig,
      textContent: contentEventsConfig,
      innerHTML: contentEventsConfig,
    });

    this.overrideAccessorGlobal('css', 'style', 'class');
    this.overrideAccessor({
      INPUT: ['value', 'checked', 'model'],
      SELECT: ['value'],
      TEXTAREA: ['value'],
    });
  }

  public static register(container: IContainer) {
    aliasRegistration(INodeObserverLocator, NodeObserverLocator).register(container);
    singletonRegistration(INodeObserverLocator, NodeObserverLocator).register(container);
  }

  // deepscan-disable-next-line
  public handles(obj: unknown, _key: PropertyKey): boolean {
    return obj instanceof this._platform.Node;
  }

  public useConfig(config: Record<string, Record<string, INodeObserverConfig>>): void;
  public useConfig(nodeName: string, key: PropertyKey, events: INodeObserverConfig): void;
  public useConfig(nodeNameOrConfig: string | Record<string, Record<string, INodeObserverConfig>>, key?: PropertyKey, eventsConfig?: INodeObserverConfig): void {
    const lookup = this._events;
    let existingMapping: Record<string, INodeObserverConfig>;
    if (isString(nodeNameOrConfig)) {
      existingMapping = lookup[nodeNameOrConfig] ??= createLookup();
      if (existingMapping[key as string] == null) {
        existingMapping[key as string] = eventsConfig!;
      } else {
        throwMappingExisted(nodeNameOrConfig, key!);
      }
    } else {
      for (const nodeName in nodeNameOrConfig) {
        existingMapping = lookup[nodeName] ??= createLookup();
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

  public useConfigGlobal(config: Record<string, INodeObserverConfig>): void;
  public useConfigGlobal(key: PropertyKey, events: INodeObserverConfig): void;
  public useConfigGlobal(configOrKey: PropertyKey | Record<string, INodeObserverConfig>, eventsConfig?: INodeObserverConfig): void {
    const lookup = this._globalEvents;
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
    if (key in this._globalOverrides || (key in (this._overrides[obj.tagName] ?? emptyObject))) {
      return this.getObserver(obj, key, requestor);
    }
    switch (key) {
      // class / style / css attribute will be observed using .getObserver() per overrides
      //
      // TODO: there are (many) more situation where we want to default to DataAttributeAccessor
      case 'src':
      case 'href':
      case 'role':
      case 'minLength':
      case 'maxLength':
      case 'placeholder':
      case 'size':
      case 'pattern':
      case 'title':
      case 'popovertarget':
      case 'popovertargetaction':
        /* istanbul-ignore-next */
        if (__DEV__) {
          if ((key === 'popovertarget' || key === 'popovertargetaction') && obj.nodeName !== 'INPUT' && obj.nodeName !== 'BUTTON') {
            // eslint-disable-next-line no-console
            console.warn(`[aurelia] Popover API are only valid on <input> or <button>. Detected ${key} on <${obj.nodeName.toLowerCase()}>`);
          }
        }
        // assigning null/undefined to size on input is an error
        // though it may be fine on other elements.
        // todo: make an effort to distinguish properties based on element name
        // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
        return attrAccessor;
      default: {
        const nsProps = nsAttributes[key as string];
        if (nsProps !== undefined) {
          return AttributeNSAccessor.forNs(nsProps[1]);
        }
        if (isDataAttribute(obj, key, this.svg)) {
          return attrAccessor;
        }
        return elementPropertyAccessor;
      }
    }
  }

  /**
   * For a list of specific elements
   * compose a list of properties, based on different tag name,
   * indicating that an overser should be returned instead of an accessor in `.getAccessor()`
   */
  public overrideAccessor(overrides: Record<string, string[]>): void;
  public overrideAccessor(tagName: string, key: PropertyKey): void;
  public overrideAccessor(tagNameOrOverrides: string | Record<string, string[]>, key?: PropertyKey): void {
    let existingTagOverride: Record<string, true> | undefined;
    if (isString(tagNameOrOverrides)) {
      existingTagOverride = this._overrides[tagNameOrOverrides] ??= createLookup();
      existingTagOverride[key as string] = true;
    } else {
      for (const tagName in tagNameOrOverrides) {
        for (const key of tagNameOrOverrides[tagName]) {
          existingTagOverride =this._overrides[tagName] ??= createLookup();
          existingTagOverride[key] = true;
        }
      }
    }
  }

  /**
   * For all elements:
   * compose a list of properties,
   * to indicate that an overser should be returned instead of an accessor in `.getAccessor()`
   */
  public overrideAccessorGlobal(...keys: string[]): void {
    for (const key of keys) {
      this._globalOverrides[key] = true;
    }
  }

  public getNodeObserverConfig(el: HTMLElement, key: PropertyKey): INodeObserverConfig | undefined {
    return this._events[el.tagName]?.[key as string] ?? this._globalEvents[key as string];
  }

  public getNodeObserver(el: HTMLElement, key: PropertyKey, requestor: IObserverLocator): INodeObserver | null {
    const eventsConfig = this._events[el.tagName]?.[key as string] ?? this._globalEvents[key as string];
    let observer: INodeObserver;
    if (eventsConfig != null) {
      observer = new (eventsConfig.type ?? ValueAttributeObserver)(el, key, eventsConfig, requestor, this._locator);
      if (!observer.doNotCache) {
        getObserverLookup(el)[key] = observer;
      }
      return observer;
    }
    return null;
  }

  public getObserver(el: HTMLElement, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver {
    switch (key) {
      case 'class':
        // todo: invalid accessor returned for a get observer call
        //       for now it's a noop observer
        return new ClassAttributeAccessor(el);
      case 'css':
      case 'style':
        // todo: invalid accessor returned for a get observer call
        //       for now it's a noop observer
        return new StyleAttributeAccessor(el);
    }
    const nodeObserver = this.getNodeObserver(el, key, requestor);
    if (nodeObserver != null) {
      return nodeObserver;
    }

    const nsProps = nsAttributes[key as string];
    if (nsProps !== undefined) {
      // todo: invalid accessor returned for a get observer call
      //       for now it's a noop observer
      return AttributeNSAccessor.forNs(nsProps[1]);
    }
    if (isDataAttribute(el, key, this.svg)) {
      // todo: invalid accessor returned for a get observer call
      //       for now it's a noop observer
      return attrAccessor;
    }
    if (key in el.constructor.prototype) {
      if (this.allowDirtyCheck) {
        return this._dirtyChecker.createProperty(el, key as string);
      }
      // consider:
      // - maybe add a adapter API to handle unknown obj/key combo
      throw createMappedError(ErrorNames.node_observer_strategy_not_found, key);
    } else {
      // todo: probably still needs to get the property descriptor via getOwnPropertyDescriptor
      // but let's start with simplest scenario
      return new SetterObserver(el as HTMLElement & IIndexable, key as string);
    }
  }
}

export function getCollectionObserver(collection: unknown, observerLocator: IObserverLocator): ICollectionObserver<CollectionKind> | undefined {
  if (collection instanceof Array) {
    return observerLocator.getArrayObserver(collection);
  }
  if (collection instanceof Map) {
    return observerLocator.getMapObserver(collection);
  }
  if (collection instanceof Set) {
    return observerLocator.getSetObserver(collection);
  }
}

function throwMappingExisted(nodeName: string, key: PropertyKey): never {
  throw createMappedError(ErrorNames.node_observer_mapping_existed, nodeName, key);
}
