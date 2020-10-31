import { kebabCase } from '@aurelia/kernel';
import { BindableDefinition, BindingMode } from '@aurelia/runtime';
import { CustomAttributeDefinition } from './resources/custom-attribute';
import { CustomElementDefinition } from './resources/custom-element';

/**
 * A pre-processed piece of information about a defined bindable property on a custom
 * element or attribute, optimized for consumption by the template compiler.
 */
export class BindableInfo {
  public constructor(
    /**
     * The pre-processed *property* (not attribute) name of the bindable, which is
     * (in order of priority):
     *
     * 1. The `property` from the description (if defined)
     * 2. The name of the property of the bindable itself
     */
    public propName: string,
    /**
     * The pre-processed (default) bindingMode of the bindable, which is (in order of priority):
     *
     * 1. The `mode` from the bindable (if defined and not bindingMode.default)
     * 2. The `defaultBindingMode` (if it's an attribute, defined, and not bindingMode.default)
     * 3. `bindingMode.toView`
     */
    public mode: BindingMode,
  ) {}
}

const elementInfoLookup = new WeakMap<CustomElementDefinition, ElementInfo>();

/**
 * Pre-processed information about a custom element resource, optimized
 * for consumption by the template compiler.
 */
export class ElementInfo {
  /**
   * A lookup of the bindables of this element, indexed by the (pre-processed)
   * attribute names as they would be found in parsed markup.
   */
  public bindables: Record<string, BindableInfo | undefined> = Object.create(null);

  public constructor(
    public name: string,
    public containerless: boolean,
  ) {}

  public static from(def: CustomElementDefinition | null): ElementInfo | null {
    if (def === null) {
      return null;
    }

    let info = elementInfoLookup.get(def);
    if (info === void 0) {
      info = new ElementInfo(def.name, def.containerless);
      const bindables = def.bindables;
      const defaultBindingMode = BindingMode.toView;

      let bindable: BindableDefinition;
      let prop: string;
      let attr: string;
      let mode: BindingMode;

      for (prop in bindables) {
        bindable = bindables[prop];
        // explicitly provided property name has priority over the implicit property name
        if (bindable.property !== void 0) {
          prop = bindable.property;
        }
        // explicitly provided attribute name has priority over the derived implicit attribute name
        if (bindable.attribute !== void 0) {
          attr = bindable.attribute;
        } else {
          // derive the attribute name from the resolved property name
          attr = kebabCase(prop);
        }
        if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
          mode = bindable.mode;
        } else {
          mode = defaultBindingMode;
        }
        info.bindables[attr] = new BindableInfo(prop, mode);
      }
      elementInfoLookup.set(def, info);
    }
    return info;
  }
}

const attrInfoLookup = new WeakMap<CustomAttributeDefinition, AttrInfo>();

/**
 * Pre-processed information about a custom attribute resource, optimized
 * for consumption by the template compiler.
 */
export class AttrInfo {
  /**
   * A lookup of the bindables of this attribute, indexed by the (pre-processed)
   * bindable names as they would be found in the attribute value.
   *
   * Only applicable to multi attribute bindings (semicolon-separated).
   */
  public bindables: Record<string, BindableInfo | undefined> = Object.create(null);
  /**
   * The single or first bindable of this attribute, or a default 'value'
   * bindable if no bindables were defined on the attribute.
   *
   * Only applicable to single attribute bindings (where the attribute value
   * contains no semicolons)
   */
  public bindable: BindableInfo | null = null;

  public constructor(
    public name: string,
    public isTemplateController: boolean,
    public noMultiBindings: boolean,
  ) {}

  public static from(def: CustomAttributeDefinition | null): AttrInfo | null {
    if (def === null) {
      return null;
    }
    let info = attrInfoLookup.get(def);
    if (info === void 0) {
      info = new AttrInfo(def.name, def.isTemplateController, def.noMultiBindings);
      const bindables = def.bindables;
      const defaultBindingMode = def.defaultBindingMode !== void 0 && def.defaultBindingMode !== BindingMode.default
        ? def.defaultBindingMode
        : BindingMode.toView;

      let bindable: BindableDefinition;
      let prop: string;
      let mode: BindingMode;
      let hasPrimary: boolean = false;
      let isPrimary: boolean = false;
      let bindableInfo: BindableInfo;

      for (prop in bindables) {
        bindable = bindables[prop];
        // explicitly provided property name has priority over the implicit property name
        if (bindable.property !== void 0) {
          prop = bindable.property;
        }
        if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
          mode = bindable.mode;
        } else {
          mode = defaultBindingMode;
        }
        isPrimary = bindable.primary === true;
        bindableInfo = info.bindables[prop] = new BindableInfo(prop, mode);
        if (isPrimary) {
          if (hasPrimary) {
            throw new Error('primary already exists');
          }
          hasPrimary = true;
          info.bindable = bindableInfo;
        }
        // set to first bindable by convention
        if (info.bindable === null) {
          info.bindable = bindableInfo;
        }
      }
      // if no bindables are present, default to "value"
      if (info.bindable === null) {
        info.bindable = new BindableInfo('value', defaultBindingMode);
      }
      attrInfoLookup.set(def, info);
    }
    return info;
  }
}
