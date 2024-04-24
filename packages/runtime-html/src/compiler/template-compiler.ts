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
  BindingCommand,
  BindingCommandDefinition,
  type BindingCommandInstance,
  type IAttributeBindablesInfo,
  type IElementBindablesInfo,
  IBindablesInfoResolver,
  IResourceResolver,
  TemplateCompiler,
} from '@aurelia/template-compiler';
import { ErrorNames, createMappedError } from '../errors';
import type { CustomAttributeDefinition } from '../resources/custom-attribute';
import { AttrMapper } from './attribute-mapper';

/**
 * A group of registrations to connect the template compiler with the aurelia runtime implementation
 */
export const templateCompilerComponents: IRegistry = {
  register(container) {
    container.register(
      TemplateCompiler,
      AttrMapper,
      BindablesInfoResolver,
      ResourceResolver,
    );
  }
};

class BindablesInfoResolver implements IBindablesInfoResolver {
  public static register = /*@__PURE__*/ createImplementationRegister(IBindablesInfoResolver);
  /** @internal */
  private readonly _cache = new WeakMap<CustomElementDefinition | CustomAttributeDefinition, BindablesInfo>();
  public get(def: CustomAttributeDefinition): IAttributeBindablesInfo;
  public get(def: CustomElementDefinition): IElementBindablesInfo;
  public get(def: CustomAttributeDefinition | CustomElementDefinition): IAttributeBindablesInfo | IElementBindablesInfo {
    let info = this._cache.get(def);
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

      this._cache.set(def, info = new BindablesInfo(attrs, bindables, primary ?? null));
    }
    return info;
  }
}

class BindablesInfo {
  public constructor(
    public readonly attrs: Record<string, BindableDefinition>,
    public readonly bindables: Record<string, BindableDefinition>,
    public readonly primary: BindableDefinition | null,
  ) {}
}

class ResourceResolver implements IResourceResolver {
  public static register = /*@__PURE__*/ createImplementationRegister(IResourceResolver);

  private readonly _resourceCache = new WeakMap<IContainer, RecordCache>();
  private readonly _commandCache = new WeakMap<IContainer, Record<string, BindingCommandInstance | null>>();

  public el(c: IContainer, name: string): CustomElementDefinition | null {
    let record = this._resourceCache.get(c);
    if (record == null) {
      this._resourceCache.set(c, record = new RecordCache());
    }
    return name in record.element ? record.element[name] : (record.element[name] = CustomElement.find(c, name));
  }

  public attr(c: IContainer, name: string): CustomAttributeDefinition | null {
    let record = this._resourceCache.get(c);
    if (record == null) {
      this._resourceCache.set(c, record = new RecordCache());
    }
    return name in record.attr ? record.attr[name] : (record.attr[name] = CustomAttribute.find(c, name));
  }

  public command(c: IContainer, name: string): BindingCommandInstance | null {
    let commandInstanceCache = this._commandCache.get(c);
    if (commandInstanceCache == null) {
      this._commandCache.set(c, commandInstanceCache = createLookup());
    }
    let result = commandInstanceCache[name];
    if (result === void 0) {
      let record = this._resourceCache.get(c);
      if (record == null) {
        this._resourceCache.set(c, record = new RecordCache());
      }

      const commandDef = name in record.command ? record.command[name] : (record.command[name] = BindingCommand.find(c, name));
      if (commandDef == null) {
        throw createMappedError(ErrorNames.compiler_unknown_binding_command, name);
      }
      commandInstanceCache[name] = result = BindingCommand.get(c, name);
    }
    return result;
  }
}

class RecordCache {
  public element = createLookup<CustomElementDefinition | null>();
  public attr = createLookup<CustomAttributeDefinition | null>();
  public command = createLookup<BindingCommandDefinition | null>();
}
