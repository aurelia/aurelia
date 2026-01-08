import {
  createLookup,
  createImplementationRegister,
  type IContainer,
  type IRegistry
} from '@aurelia/kernel';
import {
  type IAttributeBindablesInfo,
  type IElementBindablesInfo,
  IResourceResolver,
  TemplateCompiler,
} from '@aurelia/template-compiler';
import { BindableDefinition } from '../bindable';
import { CustomAttribute } from '../resources/custom-attribute';
import { CustomElement, CustomElementDefinition } from '../resources/custom-element';

import { ErrorNames, createMappedError } from '../errors';
import type { CustomAttributeDefinition } from '../resources/custom-attribute';
import { AttrMapper } from './attribute-mapper';

/**
 * A group of registrations to connect the template compiler with the aurelia runtime implementation
 */
export const RuntimeTemplateCompilerImplementation: IRegistry = {
  register(container) {
    container.register(
      TemplateCompiler,
      AttrMapper,
      ResourceResolver,
    );
  }
};

class BindablesInfo {
  public constructor(
    public readonly attrs: Record<string, BindableDefinition>,
    public readonly bindables: Record<string, BindableDefinition>,
    public readonly primary: BindableDefinition | null,
  ) {}
}

class ResourceResolver implements IResourceResolver<CustomElementDefinition, CustomAttributeDefinition> {
  public static register = /*@__PURE__*/ createImplementationRegister(IResourceResolver);

  /** @internal */
  private readonly _resourceCache = new WeakMap<IContainer, RecordCache>();

  public el(c: IContainer, name: string): CustomElementDefinition | null {
    let record = this._resourceCache.get(c);
    if (record == null) {
      this._resourceCache.set(c, record = new RecordCache());
    }
    return name in record._element ? record._element[name] : (record._element[name] = CustomElement.find(c, name));
  }

  public attr(c: IContainer, name: string): CustomAttributeDefinition | null {
    let record = this._resourceCache.get(c);
    if (record == null) {
      this._resourceCache.set(c, record = new RecordCache());
    }
    return name in record._attr ? record._attr[name] : (record._attr[name] = CustomAttribute.find(c, name));
  }

  /** @internal */
  private readonly _bindableCache = new WeakMap<CustomElementDefinition | CustomAttributeDefinition, BindablesInfo>();

  public bindables(def: CustomAttributeDefinition): IAttributeBindablesInfo;
  public bindables(def: CustomElementDefinition): IElementBindablesInfo;
  public bindables(def: CustomAttributeDefinition | CustomElementDefinition): IAttributeBindablesInfo | IElementBindablesInfo {
    let info = this._bindableCache.get(def);
    if (info == null) {
      const bindables = def.bindables;
      const attrs = createLookup<BindableDefinition>();
      let bindable: BindableDefinition | undefined;
      let prop: string;
      let primary: BindableDefinition | undefined;
      let attr: string;

      // For custom attributes, the primary bindable is determined by `defaultProperty`
      // which defaults to 'value' if not specified
      const isCustomAttribute = def.type === 'custom-attribute';
      const defaultProperty = isCustomAttribute ? def.defaultProperty : null;

      for (prop in bindables) {
        bindable = bindables[prop];
        attr = bindable.attribute;

        // For custom attributes, check if this bindable matches defaultProperty
        if (defaultProperty != null && prop === defaultProperty) {
          primary = bindable;
        }

        attrs[attr] = BindableDefinition.create(prop, bindable);
      }

      if (isCustomAttribute && primary == null) {
        // If no bindable matches defaultProperty, create the default bindable
        // defaultProperty is always defined for custom attributes (defaults to 'value')
        const defaultProp = defaultProperty!;
        primary = attrs[defaultProp] = BindableDefinition.create(defaultProp);
      }

      this._bindableCache.set(def, info = new BindablesInfo(attrs, bindables, primary ?? null));
    }
    return info;
  }
}

class RecordCache {
  public _element = createLookup<CustomElementDefinition | null>();
  public _attr = createLookup<CustomAttributeDefinition | null>();
}
