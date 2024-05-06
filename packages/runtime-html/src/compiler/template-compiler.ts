import { BindableDefinition } from '../bindable';
import { defaultMode } from '../binding/interfaces-bindings';
import { CustomAttribute } from '../resources/custom-attribute';
import { CustomElement, CustomElementDefinition } from '../resources/custom-element';
import { createLookup } from '../utilities';

import {
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
      let hasPrimary: boolean = false;
      let primary: BindableDefinition | undefined;
      let attr: string;

      // from all bindables, pick the first primary bindable
      // if there is no primary, pick the first bindable
      // if there's no bindables, create a new primary with property value
      for (prop in bindables) {
        bindable = bindables[prop];
        attr = bindable.attribute;
        if (bindable.primary === true) {
          if (hasPrimary) {
            throw createMappedError(ErrorNames.compiler_primary_already_existed, def);
          }
          hasPrimary = true;
          primary = bindable;
        } else if (!hasPrimary && primary == null) {
          primary = bindable;
        }

        attrs[attr] = BindableDefinition.create(prop, bindable);
      }
      if (bindable == null && def.type === 'custom-attribute') {
        // if no bindables are present, default to "value"
        primary = attrs.value = BindableDefinition.create(
          'value',
          { mode: def.defaultBindingMode ?? defaultMode }
        );
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
