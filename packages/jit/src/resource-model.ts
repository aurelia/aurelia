import {
  kebabCase,
  IContainer,
  IResolver,
  Metadata,
  ResourceType,
  ResourceDefinition,
  IResourceKind,
} from '@aurelia/kernel';
import {
  CustomAttributeDefinition,
  BindingMode,
  CustomAttribute,
  CustomElement,
  BindableDefinition,
  CustomElementDefinition,
} from '@aurelia/runtime';
import { AttrSyntax } from './ast';
import { BindingCommand, BindingCommandInstance } from './binding-command';

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

  public static from(def: CustomElementDefinition): ElementInfo {
    const info = new ElementInfo(def.name, def.containerless);
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
    return info;
  }
}

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

  public static from(def: CustomAttributeDefinition): AttrInfo {
    const info = new AttrInfo(def.name, def.isTemplateController, def.noMultiBindings);
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
    return info;
  }
}

const contextLookup = new WeakMap<IContainer, ResourceModel>();

/**
 * A pre-processed piece of information about declared custom elements, attributes and
 * binding commands, optimized for consumption by the template compiler.
 */
export class ResourceModel {
  private readonly elementLookup: Record<string, ElementInfo | null | undefined> = Object.create(null);
  private readonly attributeLookup: Record<string, AttrInfo | null | undefined> = Object.create(null);
  private readonly commandLookup: Record<string, BindingCommandInstance | null | undefined> = Object.create(null);

  private readonly container: IContainer;

  private readonly resourceResolvers: Record<string, IResolver | undefined | null>;
  private readonly rootResourceResolvers: Record<string, IResolver | undefined | null>;

  public constructor(container: IContainer) {
    // Note: don't do this sort of thing elsewhere, this is purely for perf reasons
    this.container = container;
    const rootContainer = (container as IContainer & { root: IContainer }).root;
    this.resourceResolvers = (container as IContainer & { resourceResolvers: Record<string, IResolver | undefined | null> }).resourceResolvers;
    this.rootResourceResolvers = (rootContainer as IContainer & { resourceResolvers: Record<string, IResolver | undefined | null> }).resourceResolvers;
  }

  public static getOrCreate(context: IContainer): ResourceModel {
    let model = contextLookup.get(context);
    if (model === void 0) {
      contextLookup.set(
        context,
        model = new ResourceModel(context),
      );
    }
    return model;
  }

  /**
   * Retrieve information about a custom element resource.
   *
   * @param element - The original DOM element.
   *
   * @returns The resource information if the element exists, or `null` if it does not exist.
   */
  public getElementInfo(name: string): ElementInfo | null {
    let result = this.elementLookup[name];
    if (result === void 0) {
      const def = this.find(CustomElement, name) as unknown as CustomElementDefinition;
      this.elementLookup[name] = result = def === null ? null : ElementInfo.from(def);
    }

    return result;
  }

  /**
   * Retrieve information about a custom attribute resource.
   *
   * @param syntax - The parsed `AttrSyntax`
   *
   * @returns The resource information if the attribute exists, or `null` if it does not exist.
   */
  public getAttributeInfo(syntax: AttrSyntax): AttrInfo | null {
    let result = this.attributeLookup[syntax.target];
    if (result === void 0) {
      const def = this.find(CustomAttribute, syntax.target) as unknown as CustomAttributeDefinition;
      this.attributeLookup[syntax.target] = result = def === null ? null : AttrInfo.from(def);
    }
    return result;
  }

  /**
   * Retrieve a binding command resource.
   *
   * @param name - The parsed `AttrSyntax`
   *
   * @returns An instance of the command if it exists, or `null` if it does not exist.
   */
  public getBindingCommand(syntax: AttrSyntax, optional: boolean): BindingCommandInstance | null {
    const name = syntax.command;
    if (name === null) {
      return null;
    }
    let result = this.commandLookup[name];
    if (result === void 0) {
      result = this.create(BindingCommand, name) as BindingCommandInstance;
      if (result === null) {
        if (optional) {
          return null;
        }
        throw new Error(`Unknown binding command: ${name}`);
      }
      this.commandLookup[name] = result;
    }
    return result;
  }

  private find<
    TType extends ResourceType,
    TDef extends ResourceDefinition,
  >(kind: IResourceKind<TType, TDef>, name: string): TDef | null {
    const key = kind.keyFrom(name);
    let resolver = this.resourceResolvers[key];
    if (resolver === void 0) {
      resolver = this.rootResourceResolvers[key];
      if (resolver === void 0) {
        return null;
      }
    }

    if (resolver === null) {
      return null;
    }

    if (typeof resolver.getFactory === 'function') {
      const factory = resolver.getFactory(this.container);
      if (factory === null || factory === void 0) {
        return null;
      }

      const definition = Metadata.getOwn(kind.name, factory.Type);
      if (definition === void 0) {
        // TODO: we may want to log a warning here, or even throw. This would happen if a dependency is registered with a resource-like key
        // but does not actually have a definition associated via the type's metadata. That *should* generally not happen.
        return null;
      }

      return definition;
    }

    return null;
  }

  private create<
    TType extends ResourceType,
    TDef extends ResourceDefinition,
  >(kind: IResourceKind<TType, TDef>, name: string): InstanceType<TType> | null {
    const key = kind.keyFrom(name);
    let resolver = this.resourceResolvers[key];
    if (resolver === void 0) {
      resolver = this.rootResourceResolvers[key];
      if (resolver === void 0) {
        return null;
      }
    }

    if (resolver === null) {
      return null;
    }

    const instance = resolver.resolve(this.container, this.container);
    if (instance === void 0) {
      return null;
    }

    return instance;
  }
}
