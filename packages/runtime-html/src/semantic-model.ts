import { kebabCase } from '@aurelia/kernel';
import { AnyBindingExpression, BindingMode, Interpolation } from '@aurelia/runtime';
import { AttrSyntax } from './resources/attribute-pattern.js';
import { BindingCommandInstance } from './resources/binding-command.js';
import { IPlatform } from './platform.js';
import { CustomElementDefinition } from './resources/custom-element.js';
import { CustomAttributeDefinition } from './resources/custom-attribute.js';
import { BindableDefinition } from './bindable.js';

export const enum SymbolFlags {
  type                 = 0b000000_1111111111,
  isTemplateController = 0b000000_0000000001,
  isProjection         = 0b000000_0000000010,
  isCustomAttribute    = 0b000000_0000000100,
  isPlainAttribute     = 0b000000_0000001000,
  isCustomElement      = 0b000000_0000010000,
  isLetElement         = 0b000000_0000100000,
  isPlainElement       = 0b000000_0001000000,
  isText               = 0b000000_0010000000,
  isBinding            = 0b000000_0100000000,
  isAuSlot             = 0b000000_1000000000,
  hasMarker            = 0b000001_0000000000,
  hasTemplate          = 0b000010_0000000000,
  hasAttributes        = 0b000100_0000000000,
  hasBindings          = 0b001000_0000000000,
  hasChildNodes        = 0b010000_0000000000,
  hasProjections       = 0b100000_0000000000,
}

function createMarker(p: IPlatform): HTMLElement {
  const marker = p.document.createElement('au-m');
  marker.className = 'au';
  return marker;
}

export type AnySymbol = (
  CustomAttributeSymbol |
  CustomElementSymbol |
  LetElementSymbol |
  PlainAttributeSymbol |
  PlainElementSymbol |
  TemplateControllerSymbol |
  TextSymbol
);

export type AttributeSymbol = (
  CustomAttributeSymbol |
  PlainAttributeSymbol
);

export type SymbolWithBindings = (
  CustomAttributeSymbol |
  CustomElementSymbol |
  LetElementSymbol |
  TemplateControllerSymbol
);

export type ResourceAttributeSymbol = (
  CustomAttributeSymbol |
  TemplateControllerSymbol
);

export type NodeSymbol = (
  CustomElementSymbol |
  LetElementSymbol |
  PlainElementSymbol |
  TemplateControllerSymbol |
  TextSymbol
);

export type ParentNodeSymbol = (
  CustomElementSymbol |
  PlainElementSymbol |
  TemplateControllerSymbol
);

export type ElementSymbol = (
  CustomElementSymbol |
  PlainElementSymbol
);

export type SymbolWithTemplate = (
  TemplateControllerSymbol
);

export type SymbolWithMarker = (
  CustomElementSymbol |
  LetElementSymbol |
  TemplateControllerSymbol |
  TextSymbol
);

/**
 * A html attribute that is associated with a registered resource, specifically a template controller.
 */
export class TemplateControllerSymbol {
  public flags: SymbolFlags = SymbolFlags.isTemplateController | SymbolFlags.hasMarker;
  public physicalNode: HTMLElement | null = null;
  public template: ParentNodeSymbol | null = null;
  public templateController: TemplateControllerSymbol | null = null;
  public marker: HTMLElement;

  private _bindings: BindingSymbol[] | null = null;
  public get bindings(): BindingSymbol[] {
    if (this._bindings === null) {
      this._bindings = [];
      this.flags |= SymbolFlags.hasBindings;
    }
    return this._bindings;
  }

  public constructor(
    p: IPlatform,
    public syntax: AttrSyntax,
    public info: AttrInfo,
    public res: string = info.name,
  ) {
    this.marker = createMarker(p);
  }
}

export class ProjectionSymbol {
  public flags: SymbolFlags = SymbolFlags.isProjection;

  public constructor(
    public name: string,
    public template: ParentNodeSymbol | null,
  ) {}
}

/**
 * A html attribute that is associated with a registered resource, but not a template controller.
 */
export class CustomAttributeSymbol {
  public flags: SymbolFlags = SymbolFlags.isCustomAttribute;

  private _bindings: BindingSymbol[] | null = null;
  public get bindings(): BindingSymbol[] {
    if (this._bindings === null) {
      this._bindings = [];
      this.flags |= SymbolFlags.hasBindings;
    }
    return this._bindings;
  }

  public constructor(
    public syntax: AttrSyntax,
    public info: AttrInfo,
    public res: string = info.name,
  ) {}
}

/**
 * An attribute, with either a binding command or an interpolation, whose target is the html
 * attribute of the element.
 *
 * This will never target a bindable property of a custom attribute or element;
 */
export class PlainAttributeSymbol {
  public flags: SymbolFlags = SymbolFlags.isPlainAttribute;

  public constructor(
    public syntax: AttrSyntax,
    public command: BindingCommandInstance | null,
    public expression: AnyBindingExpression | null
  ) {}
}

/**
 * Either an attribute on an custom element that maps to a declared bindable property of that element,
 * a single-value bound custom attribute, or one of several bindables that were extracted from the attribute
 * value of a custom attribute with multiple bindings usage.
 *
 * This will always target a bindable property of a custom attribute or element;
 */
export class BindingSymbol {
  public flags: SymbolFlags = SymbolFlags.isBinding;

  public constructor(
    public command: BindingCommandInstance | null,
    public bindable: BindableInfo,
    public expression: AnyBindingExpression | null,
    public rawValue: string,
    public target: string
  ) {}
}

/**
 * A html element that is associated with a registered resource either via its (lowerCase) `nodeName`
 * or the value of its `as-element` attribute.
 */
export class CustomElementSymbol {
  public flags: SymbolFlags = SymbolFlags.isCustomElement;
  public isTarget: true = true;
  public templateController: TemplateControllerSymbol | null = null;
  public isContainerless: boolean;
  public marker: HTMLElement;
  public slotName: string | undefined;

  private _customAttributes: CustomAttributeSymbol[] | null = null;
  public get customAttributes(): CustomAttributeSymbol[] {
    if (this._customAttributes === null) {
      this._customAttributes = [];
      this.flags |= SymbolFlags.hasAttributes;
    }
    return this._customAttributes;
  }

  private _plainAttributes: PlainAttributeSymbol[] | null = null;
  public get plainAttributes(): PlainAttributeSymbol[] {
    if (this._plainAttributes === null) {
      this._plainAttributes = [];
      this.flags |= SymbolFlags.hasAttributes;
    }
    return this._plainAttributes;
  }

  private _bindings: BindingSymbol[] | null = null;
  public get bindings(): BindingSymbol[] {
    if (this._bindings === null) {
      this._bindings = [];
      this.flags |= SymbolFlags.hasBindings;
    }
    return this._bindings;
  }

  private _childNodes: NodeSymbol[] | null = null;
  public get childNodes(): NodeSymbol[] {
    if (this._childNodes === null) {
      this._childNodes = [];
      this.flags |= SymbolFlags.hasChildNodes;
    }
    return this._childNodes;
  }

  private _projections: ProjectionSymbol[] | null = null;
  public get projections(): ProjectionSymbol[] {
    if (this._projections === null) {
      this._projections = [];
      this.flags |= SymbolFlags.hasProjections;
    }
    return this._projections;
  }

  public constructor(
    p: IPlatform,
    public physicalNode: HTMLElement,
    public info: ElementInfo,
    public res: string = info.name,
    public bindables: Record<string, BindableInfo | undefined> = info.bindables,
  ) {
    if (info.containerless) {
      this.isContainerless = true;
      this.marker = createMarker(p);
      this.flags |= SymbolFlags.hasMarker;
    } else {
      this.isContainerless = false;
      this.marker = null!;
    }
  }
}

export class LetElementSymbol {
  public flags: SymbolFlags = SymbolFlags.isLetElement | SymbolFlags.hasMarker;
  public toBindingContext: boolean = false;

  private _bindings: BindingSymbol[] | null = null;
  public get bindings(): BindingSymbol[] {
    if (this._bindings === null) {
      this._bindings = [];
      this.flags |= SymbolFlags.hasBindings;
    }
    return this._bindings;
  }

  public constructor(
    p: IPlatform,
    public physicalNode: HTMLElement,
    public marker: HTMLElement = createMarker(p),
  ) {}
}

/**
 * A normal html element that may or may not have attribute behaviors and/or child node behaviors.
 *
 * It is possible for a PlainElementSymbol to not yield any instructions during compilation.
 */
export class PlainElementSymbol {
  public flags: SymbolFlags = SymbolFlags.isPlainElement;

  public isTarget: boolean = false;
  public templateController: TemplateControllerSymbol | null = null;
  public hasSlots: boolean = false;

  private _customAttributes: CustomAttributeSymbol[] | null = null;
  public get customAttributes(): CustomAttributeSymbol[] {
    if (this._customAttributes === null) {
      this._customAttributes = [];
      this.flags |= SymbolFlags.hasAttributes;
    }
    return this._customAttributes;
  }

  private _plainAttributes: PlainAttributeSymbol[] | null = null;
  public get plainAttributes(): PlainAttributeSymbol[] {
    if (this._plainAttributes === null) {
      this._plainAttributes = [];
      this.flags |= SymbolFlags.hasAttributes;
    }
    return this._plainAttributes;
  }

  private _childNodes: NodeSymbol[] | null = null;
  public get childNodes(): NodeSymbol[] {
    if (this._childNodes === null) {
      this._childNodes = [];
      this.flags |= SymbolFlags.hasChildNodes;
    }
    return this._childNodes;
  }

  public constructor(
    public physicalNode: HTMLElement,
  ) {}
}

/**
 * A standalone text node that has an interpolation.
 */
export class TextSymbol {
  public flags: SymbolFlags = SymbolFlags.isText | SymbolFlags.hasMarker;

  public constructor(
    p: IPlatform,
    public physicalNode: Text,
    public interpolation: Interpolation,
    public marker: HTMLElement = createMarker(p),
  ) {}
}

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

const elementInfoLookup = new WeakMap<CustomElementDefinition, Record<string, ElementInfo>>();

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
    public alias: string | undefined,
    public containerless: boolean,
  ) {}

  public static from(def: CustomElementDefinition | null, alias: string): ElementInfo | null {
    if (def === null) {
      return null;
    }
    let rec = elementInfoLookup.get(def);
    if (rec === void 0) {
      elementInfoLookup.set(def, rec = Object.create(null) as Record<string, ElementInfo>);
    }
    let info = rec[alias];
    if (info === void 0) {
      info = rec[alias] = new ElementInfo(def.name, alias === def.name ? void 0 : alias, def.containerless);
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
    }
    return info;
  }
}

const attrInfoLookup = new WeakMap<CustomAttributeDefinition, Record<string, AttrInfo>>();

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
    public alias: string | undefined,
    public isTemplateController: boolean,
    public noMultiBindings: boolean,
  ) {}

  public static from(def: CustomAttributeDefinition | null, alias: string): AttrInfo | null {
    if (def === null) {
      return null;
    }
    let rec = attrInfoLookup.get(def);
    if (rec === void 0) {
      attrInfoLookup.set(def, rec = Object.create(null) as Record<string, AttrInfo>);
    }
    let info = rec[alias];
    if (info === void 0) {
      info = rec[alias] = new AttrInfo(def.name, alias === def.name ? void 0 : alias, def.isTemplateController, def.noMultiBindings);
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
    }
    return info;
  }
}
