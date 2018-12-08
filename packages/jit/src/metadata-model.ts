import { IContainer, IResolver, PLATFORM } from '@aurelia/kernel';
import { BindingMode, CustomAttributeResource, CustomElementResource, IBindableDescription, IResourceDescriptions, TemplateDefinition } from '@aurelia/runtime';
import { BindingCommandResource, IBindingCommand } from './binding-command';

/**
 * A pre-processed piece of information about declared custom elements, attributes and
 * binding commands, optimized for consumption by the template compiler.
 */
export class MetadataModel {

  /**
   * Information about custom element resources, indexed by the name of the element
   * as it would appear in parsed markup.
   */
  public elements: Record<string, ElementInfo>;

  /**
   * Information about custom attributes resources, indexed by the name of the attribute
   * as it would appear in parsed markup.
   */
  public attributes: Record<string, AttrInfo>;

  /**
   * Instantiated binding command resources, indexed by the name as it would come out
   * of the attribute parser.
   */
  public commands: Record<string, IBindingCommand>;

  constructor(resources: IResourceDescriptions) {
    const elements: MetadataModel['elements'] = this.elements = {};
    const attributes: MetadataModel['attributes'] = this.attributes = {};
    const commands: MetadataModel['commands'] = this.commands = {};
    const element = CustomElementResource.name;
    const attribute = CustomAttributeResource.name;
    const command = BindingCommandResource.name;
    // TODO: make a less hacky way to do this
    const container = (resources as unknown as { context: IContainer & { resolvers: Map<unknown, IResolver> } }).context;
    let type: string;
    let name: string;
    let key: unknown;
    const keys = container.resolvers.keys();
    for (key of keys) {
      if (typeof key === 'string') {
        [type, name] = key.split(':');
        switch (type) {
          case element:
            elements[name] = createElementInfo(resources, name);
            break;
          case attribute:
            attributes[PLATFORM.kebabCase(name)] = createAttributeInfo(resources, name);
            break;
          case command:
            commands[name] = resources.create(BindingCommandResource, name);
        }
      }
    }
    // manually add ref since it's not a real custom attribute
    attributes['ref'] = new AttrInfo('ref', false);
  }
}

function createElementInfo(resources: IResourceDescriptions, name: string): ElementInfo {
  const def = resources.find(CustomElementResource, name) as TemplateDefinition;
  const info = new ElementInfo(name, def.containerless);
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

function createAttributeInfo(resources: IResourceDescriptions, name: string): AttrInfo {
  const def = resources.find(CustomAttributeResource, name);
  const info = new AttrInfo(name, def.isTemplateController);
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
  if (bindableCount > 1) {
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
