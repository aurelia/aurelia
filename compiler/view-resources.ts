import * as ts from 'typescript';
import {
  // IViewResources,
  // IResource,
  resourceKind,
  IResourceElement,
  IResourceAttribute,
  // IResourceValueConverter,
  // IResourceBindingBehavior,
  IBindable,
  IResourceBehavior,
  IAureliaModule
} from './interfaces';
// import { bindingMode } from './binding';
// import { hyphenate } from './util';
import { getBehaviorHtmlName } from './ts-util';

abstract class HtmlBehavior implements IResourceBehavior {

  name: string;
  htmlName: string;
  kind: resourceKind.element | resourceKind.attribute;
  // impl: ts.ClassDeclaration;
  bindables: Record<string, IBindable>;
  initializers: Record<string, ts.Expression>;
  lifeCycles: Record<string, boolean>;

  hasCreated: boolean;
  hasBind: boolean;
  hasAttached: boolean;
  hasDetached: boolean;
  hasUnbind: boolean;

  constructor(
    public owner: IAureliaModule,
    name: string
  ) {
    this.name = name;
    this.htmlName = getBehaviorHtmlName(name);
  }

  getBindable(htmlName: string) {
    return this.bindables[htmlName] || null;
  }

  get hasConstructor() {
    return this.lifeCycles.ctor === true;
  }
}

export class ElementResource extends HtmlBehavior implements IResourceElement {

  kind: resourceKind.element = resourceKind.element;
  htmlName: string;

  constructor(
    owner: IAureliaModule,
    name: string,
    public bindables: Record<string, IBindable>,
    public initializers: Record<string, ts.Expression>,
    public lifeCycles: Record<string, boolean>
  ) {
    super(owner, name);
  }

  get code(): ts.Expression | null {
    return null;

    // return ts.createCall(
    //   ts.createPropertyAccess(
    //     ts.createNew(
    //       ts.createIdentifier(this.impl.name.escapedText.toString()),
    //       /* type arguments */ undefined,
    //       /* arguments */undefined
    //     ),
    //     'applyTo'
    //   ),
    //   /* typeArguments */ undefined,
    //   /** arguments */
    //   [
    //     ts.createElementAccess(
    //       ts.createIdentifier(AbstractBinding.targetsAccessor),
    //       ts.createNumericLiteral(this.targetIndex.toString())
    //     ),
    //     ts.createLiteral(this.targetProperty),
    //     AbstractBinding.resolveBindingMode(this.mode),
    //     ts.createIdentifier('lookupFunctions')
    //   ]
    // );
  }
}

export class AttributeResource extends HtmlBehavior implements IResourceAttribute {

  kind: resourceKind.attribute = resourceKind.attribute;
  htmlName: string;
  primaryProperty?: IBindable;

  constructor(
    owner: IAureliaModule,
    name: string,
    public bindables: Record<string, IBindable>,
    public initializers: Record<string, ts.Expression>,
    public lifeCycles: Record<string, boolean>
  ) {
    super(owner, name);
    this.primaryProperty = this.getPrimaryProperty(bindables);
  }

  get code(): ts.Expression | null {
    return null;
  }

  private getPrimaryProperty(bindables: Record<string, IBindable>): IBindable | undefined {
    for (let prop in bindables) {
      let bindable = bindables[prop];
      if (bindable.primaryProperty) {
        return bindable;
      }
    }
    return undefined;
  }
}


// export class ViewResources implements IViewResources {

//   elements?: Record<string, IResourceElement> = {};
//   attributes?: Record<string, IResourceAttribute> = {};
//   valueConverters?: Record<string, IResourceValueConverter> = {};
//   bindingBehaviors?: Record<string, IResourceBindingBehavior> = {};
//   children?: IViewResources[] = [];

//   constructor(
//     public parent?: IViewResources
//   ) {

//   }

//   private register<TResource extends IResource, T extends TResource['kind']>(lookup: Record<string, TResource>, name: string, impl: ts.ClassDeclaration, kind: T) {
//     if (lookup[name]) {
//       return false;
//     }
//     lookup[name] = {
//       name: name,
//       kind: kind,
//       impl: impl
//     } as any;
//     return true;
//   }

//   private lookup<TLookup extends IResource>(register: Record<string, TLookup>, name: string): TLookup {
//     return register[name] || null;
//   }

//   setCustomElement(name: string, impl: ts.ClassDeclaration) {
//     let htmlName = hyphenate(name);
//     if (this.elements[htmlName]) {
//       return false;
//     }
//     this.elements[htmlName] = new ElementResource(htmlName, resourceKind.element, impl);
//     return true;
//   }

//   setCustomAttribute(name: string, impl: ts.ClassDeclaration): boolean {
//     let htmlName = hyphenate(name);
//     if (this.attributes[htmlName]) {
//       return false;
//     }
//     this.attributes[htmlName] = new AttributeResource(htmlName, resourceKind.attribute, impl);
//     return true;
//   }

//   setValueConverter(name: string, impl: ts.ClassDeclaration): boolean {
//     return this.register(this.valueConverters, name, impl, resourceKind.valueConverter);
//   }

//   setBindingBehavior(name: string, impl: ts.ClassDeclaration): boolean {
//     return this.register(this.bindingBehaviors, name, impl, resourceKind.bindingBehavior);
//   }

//   getCustomElement(name: string): IResourceElement {
//     return this.lookup(this.elements, name);
//   }

//   getCustomAttribute(name: string): IResourceAttribute {
//     return this.lookup(this.attributes, name);
//   }

//   getValueConverter(name: string): IResourceValueConverter {
//     return this.lookup(this.valueConverters, name);
//   }

//   getBindingBehavior(name: string): IResourceBindingBehavior {
//     return this.lookup(this.bindingBehaviors, name);
//   }
// }

