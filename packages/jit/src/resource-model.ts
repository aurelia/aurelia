import { IResourceDescriptions, PLATFORM, Reporter } from '@aurelia/kernel';
import {
  AttributeDefinition,
  BindingMode,
  CustomAttributeResource,
  CustomElementResource,
  IBindableDescription,
  TemplateDefinition
} from '@aurelia/runtime';
import { AttrSyntax } from './ast';
import { BindingCommandResource, IBindingCommand } from './binding-command';

/**
 * A pre-processed piece of information about declared custom elements, attributes and
 * binding commands, optimized for consumption by the template compiler.
 */
export class ResourceModel {

  private resources: IResourceDescriptions;
  private elementLookup: Record<string, ElementInfo>;
  private attributeLookup: Record<string, AttrInfo>;
  private commandLookup: Record<string, IBindingCommand>;

  constructor(resources: IResourceDescriptions) {
    this.resources = resources;
    this.elementLookup = {};
    this.attributeLookup = {};
    this.commandLookup = {};
  }

  /**
   * Retrieve information about a custom element resource.
   *
   * @param element The original DOM element.
   *
   * @returns The resource information if the element exists, or `null` if it does not exist.
   */
  public getElementInfo(name: string): ElementInfo | null {
    let result = this.elementLookup[name];
    if (result === undefined) {
      const def = this.resources.find(CustomElementResource, name);
      if (def === null) {
        result = null;
      } else {
        result = createElementInfo(def);
      }
      this.elementLookup[name] = result;
    }
    return result;
  }

  /**
   * Retrieve information about a custom attribute resource.
   *
   * @param syntax The parsed `AttrSyntax`
   *
   * @returns The resource information if the attribute exists, or `null` if it does not exist.
   */
  public getAttributeInfo(syntax: AttrSyntax): AttrInfo | null {
    const name = PLATFORM.camelCase(syntax.target);
    let result = this.attributeLookup[name];
    if (result === undefined) {
      const def = this.resources.find(CustomAttributeResource, name);
      if (def === null) {
        result = null;
      } else {
        result = createAttributeInfo(def);
      }
      this.attributeLookup[name] = result;
    }
    return result;
  }

  /**
   * Retrieve a binding command resource.
   *
   * @param name The parsed `AttrSyntax`
   *
   * @returns An instance of the command if it exists, or `null` if it does not exist.
   */
  public getBindingCommand(syntax: AttrSyntax): IBindingCommand | null {
    const name = syntax.command;
    if (name === null) {
      return null;
    }
    let result = this.commandLookup[name];
    if (result === undefined) {
      result = this.resources.create(BindingCommandResource, name);
      if (result === null) {
        // unknown binding command
        throw Reporter.error(0); // TODO: create error code
      }
      this.commandLookup[name] = result;
    }
    return result;
  }
}

function createElementInfo(def: TemplateDefinition): ElementInfo {
  const info = new ElementInfo(def.name, def.containerless);
  const bindables = def.bindables;
  const defaultBindingMode = BindingMode.toView;

  let bindable: IBindableDescription;
  let prop: string;
  let attr: string;
  let mode: BindingMode;

  for (prop in bindables) {
    bindable = bindables[prop];
    // explicitly provided property name has priority over the implicit property name
    if (bindable.property !== undefined) {
      prop = bindable.property;
    }
    // explicitly provided attribute name has priority over the derived implicit attribute name
    if (bindable.attribute !== undefined) {
      attr = bindable.attribute;
    } else {
      // derive the attribute name from the resolved property name
      attr = PLATFORM.kebabCase(prop);
    }
    if (bindable.mode !== undefined && bindable.mode !== BindingMode.default) {
      mode = bindable.mode;
    } else {
      mode = defaultBindingMode;
    }
    info.bindables[attr] = new BindableInfo(prop, mode);
  }
  return info;
}

function createAttributeInfo(def: AttributeDefinition): AttrInfo {
  const info = new AttrInfo(def.name, def.isTemplateController);
  const bindables = def.bindables;
  const defaultBindingMode = def.defaultBindingMode !== undefined && def.defaultBindingMode !== BindingMode.default
    ? def.defaultBindingMode
    : BindingMode.toView;

  let bindable: IBindableDescription;
  let prop: string;
  let mode: BindingMode;
  let bindableCount: number = 0;

  for (prop in bindables) {
    ++bindableCount;
    bindable = bindables[prop];
    // explicitly provided property name has priority over the implicit property name
    if (bindable.property !== undefined) {
      prop = bindable.property;
    }
    if (bindable.mode !== undefined && bindable.mode !== BindingMode.default) {
      mode = bindable.mode;
    } else {
      mode = defaultBindingMode;
    }
    info.bindables[prop] = new BindableInfo(prop, mode);
    // set to first bindable by convention
    if (info.bindable === null) {
      info.bindable = info.bindables[prop];
    }
  }
  // if no bindables are present, default to "value"
  if (info.bindable === null) {
    info.bindable = new BindableInfo('value', defaultBindingMode);
  }
  if (def.hasDynamicOptions || bindableCount > 1) {
    info.hasDynamicOptions = true;
  }
  return info;
}

/**
 * A pre-processed piece of information about a defined bindable property on a custom
 * element or attribute, optimized for consumption by the template compiler.
 */
export class BindableInfo {
  /**
   * The pre-processed *property* (not attribute) name of the bindable, which is
   * (in order of priority):
   *
   * 1. The `property` from the description (if defined)
   * 2. The name of the property of the bindable itself
   */
  public propName: string;
  /**
   * The pre-processed (default) bindingMode of the bindable, which is (in order of priority):
   *
   * 1. The `mode` from the bindable (if defined and not bindingMode.default)
   * 2. The `defaultBindingMode` (if it's an attribute, defined, and not bindingMode.default)
   * 3. `bindingMode.toView`
   */
  public mode: BindingMode;

  constructor(propName: string, mode: BindingMode) {
    this.propName = propName;
    this.mode = mode;
  }
}

/**
 * Pre-processed information about a custom element resource, optimized
 * for consumption by the template compiler.
 */
export class ElementInfo {
  public name: string;
  public containerless: boolean;

  /**
   * A lookup of the bindables of this element, indexed by the (pre-processed)
   * attribute names as they would be found in parsed markup.
   */
  public bindables: Record<string, BindableInfo>;

  constructor(name: string, containerless: boolean) {
    this.name = name;
    this.containerless = containerless;
    this.bindables = {};
  }
}

/**
 * Pre-processed information about a custom attribute resource, optimized
 * for consumption by the template compiler.
 */
export class AttrInfo {
  public name: string;

  /**
   * A lookup of the bindables of this attribute, indexed by the (pre-processed)
   * bindable names as they would be found in the attribute value.
   *
   * Only applicable to multi attribute bindings (semicolon-separated).
   */
  public bindables: Record<string, BindableInfo>;
  /**
   * The single or first bindable of this attribute, or a default 'value'
   * bindable if no bindables were defined on the attribute.
   *
   * Only applicable to single attribute bindings (where the attribute value
   * contains no semicolons)
   */
  public bindable: BindableInfo;

  public isTemplateController: boolean;

  public hasDynamicOptions: boolean;

  constructor(name: string, isTemplateController: boolean) {
    this.name = name;
    this.bindables = {};
    this.bindable = null;
    this.isTemplateController = isTemplateController;
    this.hasDynamicOptions = false;
  }
}
