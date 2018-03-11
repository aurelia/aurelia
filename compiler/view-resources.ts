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
  IResourceBehavior
} from './interfaces';
// import { bindingMode } from './binding';
// import { hyphenate } from './util';
import { getElementHtmlName } from './ts-util';

abstract class HtmlBehavior implements IResourceBehavior {

  name: string;
  htmlName: string;
  kind: resourceKind.element | resourceKind.attribute;
  impl: ts.ClassDeclaration;
  bindables: Record<string, IBindable>;
  initializers: Record<string, ts.Expression>;

  // private getBindableMode(classMember: ts.ClassElement) {
  //   // let decorators = classMember.decorators;
  //   // for (let i = 0, ii = decorators.length; ii > i; ++i) {
  //   //   let decorator = decorators[i];
  //   //   let expression = decorator.expression;
  //   //   if (ts.isCallExpression(expression)) {
  //   //     let config = expression.arguments[0];
  //   //     if (ts.isObjectBindingPattern(config)) {
  //   //       let properties = config.elements;
  //   //       if (properties) {
  //   //         for (let j = 0, jj = properties.length; jj > j; ++j) {
  //   //           let prop = properties[j];
  //   //           let initializer = prop.initializer;
  //   //           if (prop.name.toString() === 'defaultBindingMode' && initializer) {
  //   //             if (ts.isPropertyAccessExpression(initializer)) {
  //   //               let mode = initializer.name.toString();
  //   //               let obj = initializer.expression;
  //   //               if (ts.isIdentifier(obj) && obj.escapedText.toString() === 'bindingMode') {
  //   //                 return bindingMode[mode];
  //   //               }
  //   //             }
  //   //           }
  //   //         }
  //   //       }
  //   //     }
  //   //   } else {

  //   //   }
  //   // }
  //   return bindingMode.toView;
  // }

  protected hasBindableDecorator(member: ts.ClassElement): member is ts.PropertyDeclaration {
    if (!ts.isPropertyDeclaration(member)) {
      return false;
    }
    if (!member.decorators) {
      return false;
    }
    return member.decorators.some(decorator => (decorator.expression as ts.Identifier).text === 'bindable');
  }

  protected getBindables(): Record<string, IBindable> {
    let members = this.impl.members;
    if (!members) {
      return this.bindables = {};
    } else {
      return this.bindables = members.reduce((bindables, member) => {
        if (!member.decorators) {
          return bindables;
        }
        if (!this.hasBindableDecorator(member)) {
          return bindables;
        }
        // let name = (member.name as ts.Identifier).text;
        // let htmlName = hyphenate(name);
        // bindables[htmlName] = {
        //   name,
        //   attribute,
        //   type: 'string',
        //   defaultBindingMode: this.getBindableMode(member)
        // }
        return bindables;
      }, {} as Record<string, IBindable>);
    }
  }

  getBindable(htmlName: string) {
    return this.bindables[htmlName] || null;
  }
}

export class ElementResource extends HtmlBehavior implements IResourceElement {

  kind: resourceKind.element = resourceKind.element;
  htmlName: string;

  constructor(
    public name: string,
    public impl: ts.ClassDeclaration,
    public bindables: Record<string, IBindable>,
    public initializers: Record<string, ts.Expression>
  ) {
    super();
    this.htmlName = getElementHtmlName(impl.name);
  }

  get code(): ts.Expression {
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
  htmlName: string;
  constructor(
    public name: string,
    public kind: resourceKind.attribute,
    public impl: ts.ClassDeclaration,
    public bindables: Record<string, IBindable>
  ) {
    super();
    this.htmlName = getElementHtmlName(impl.name);
  }

  get code(): ts.Expression {
    return null;
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

