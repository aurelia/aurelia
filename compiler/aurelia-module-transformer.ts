import * as ts from 'typescript';
import {
  // IAureliaModuleCompiler,
  IAureliaModule,
  // ITemplateFactory,
  IResourceElement,
  // IResourceAttribute,
  // IResourceValueConverter,
  // IResourceBindingBehavior,
  // resourceKind,
  // IAureliaModuleStatements,
  // IBindable,
  // IResource,
} from "./interfaces";

// import { ElementResource, AttributeResource } from './view-resources';
import {
  // hyphenate,
  arrayRemove
} from './util';
import {
  // getBehaviorHtmlName,
  getBindableDecorator,
  // getBindableDecoratorBindingMode,
  getPrivateClassName,
  getDecoratorByName,
  // getBindableDecoratorPrimaryPropertyValue
} from './ts-util';
// import { BindableProperty, IBindableConfig } from './bindable-property';
import {
  removeClassExport,
  isCustomElement,
  getClassName,
  isCustomAttribute,
  // isValueConverter,
  // isBindingBehavior
} from './ts-class-util';
// import { bindingMode } from './binding';


/**
 * Transform a source file based on metada given by an Aurelia Module
 */
export class AureliaModuleTransformer {
  constructor(
    public module: IAureliaModule,
    public file: ts.SourceFile,
    public scriptTarget: ts.ScriptTarget = ts.ScriptTarget.Latest
  ) {

  }

  transform(): ts.Statement[] {
    let updatedStatements = this.file.getSourceFile().statements.reduce((statements: ts.Statement[], statement: ts.Statement, idx: number) => {
      // console.log(statement, this.isCustomElement(statement));
      if (isCustomElement(statement)) {
        return statements.concat(this.transformCustomElement(statement));
      } else if (isCustomAttribute(statement)) {
        // return statements.concat(this.transformCustomAttribute(statement));
        throw new Error('Custom attribute not supported');
      } else {
        return statements.concat(statement);
      }
    }, []);
    return updatedStatements;
  }

  private transformCustomElement(klass: ts.ClassDeclaration): ts.ClassDeclaration {

    let viewModelClassName = getClassName(klass);
    let privateBaseClassName = getPrivateClassName(viewModelClassName);
    // let htmlName = getBehaviorHtmlName(klass);

    /**
     * Upgrade
     */
    klass = ts.updateClassDeclaration(
      klass,
      Array.isArray(klass.decorators) ? this.updateElementDecorators([...klass.decorators]) : undefined,
      klass.modifiers,
      ts.createIdentifier(privateBaseClassName),
      klass.typeParameters,
      klass.heritageClauses!,
      klass.members
    );

    klass = removeClassExport(/* unexport, export view class with this name instead */ klass);
    klass = this.updateCustomElementClassMembers(klass, this.module.mainResource!);

    return klass;

    // classMembers.forEach((member, idx) => {
    //   if (!ctor && ts.isConstructorDeclaration(member)) {
    //     ctor = member;
    //     ctorIndex = idx;
    //     return;
    //   }
    //   if (!ts.isMethodDeclaration(member)) {
    //     return;
    //   }
    //   if (!bindMethod && member.name.toString() === 'bind') {
    //     bindMethod = member;
    //     bindMethodIndex = idx;
    //   }
    // });

    // if (ctor) {
    //   ctor = ts.createConstructor(
    //     undefined,
    //     undefined,
    //     undefined,
    //     ts.createBlock([
    //       ts.createStatement(
    //         ts.createCall(
    //           ts.createSuper(),
    //           undefined,
    //           undefined
    //         ),
    //       ),
    //       ...ctor.body.statements
    //     ], /* multiline */ true)
    //   );
    //   classMembers.splice(ctorIndex, 1, ctor);
    // }

    // if (bindMethod) {
    //   bindMethodIndex = classMembers.indexOf(bindMethod);
    //   bindMethodBody = (bindMethod as ts.MethodDeclaration).body;
    // } else {
    //   bindMethod = {} as any;
    //   bindMethodBody = ts.createBlock([]);
    // }
    // bindMethod = ts.createMethod(
    //   bindMethod.decorators,
    //   bindMethod.modifiers,
    //   bindMethod.asteriskToken,
    //   'bind',
    //   bindMethod.questionToken,
    //   bindMethod.typeParameters,
    //   bindMethod.parameters,
    //   bindMethod.type,
    //   ts.createBlock(
    //     [
    //       ts.createStatement(
    //         ts.createCall(
    //           ts.createPropertyAccess(
    //             ts.createSuper(),
    //             ts.createIdentifier('bind')
    //           ),
    //           undefined,
    //           undefined
    //         ),
    //       ),
    //       ...bindMethodBody.statements
    //     ],
    //     /** multiline */ true
    //   )
    // );

    // classMembers.splice(
    //   bindMethodIndex === -1 ? (ctor ? 1 : 0) : bindMethodIndex,
    //   bindMethodIndex === -1 ? 0 : 1,
    //   bindMethod
    // );
  }

  private updateCustomElementClassMembers(klass: ts.ClassDeclaration, metadata: IResourceElement): ts.ClassDeclaration {
    let factory = this.module.templateFactories[0];
    let observedProperties: string[] = factory ? factory.observedProperties : [];
    let shouldDefineObservers = observedProperties.length > 0;
    let members = klass.members.reduce((allMembers: ts.ClassElement[], member) => {
      let $decorators = [...(Array.isArray(member.decorators) ? member.decorators : [])];
      if (ts.isConstructorDeclaration(member) && shouldDefineObservers) {
        allMembers.push(this.updateConstructor(member, observedProperties, metadata.initializers));
        return allMembers;
        // return this.updateConstructor(member, observedProperties, metadata.initializers);
      }
      if (!ts.isPropertyDeclaration(member)) {
        allMembers.push(member);
        return allMembers;
        // return member;
      }
      let nameAst = member.name;
      if (ts.isComputedPropertyName(nameAst)) {
        // Too complex for start
        // TODO: support computed property
        throw new Error('Cannot use bindable on computed property');
      }
      let memberName: string;
      if (ts.isIdentifier(nameAst)) {
        memberName = nameAst.escapedText.toString();
      } else {
        memberName = nameAst.text.toString();
      }
      if (observedProperties.includes(memberName)) {
        return allMembers;
        // return null!;
      }

      let bindableDecorator = getBindableDecorator(member);
      if (bindableDecorator === null) {
        return allMembers;
        // return member;
      }
      arrayRemove($decorators, bindableDecorator);
      allMembers.push(ts.updateProperty(
        member,
        $decorators,
        member.modifiers,
        nameAst,
        member.questionToken,
        member.type,
        member.initializer
      ));
      return allMembers;
    }, !metadata.hasConstructor && shouldDefineObservers
        ? [this.updateConstructor(ts.createConstructor(undefined, undefined, [], undefined), observedProperties, metadata.initializers)]
        : []
    );
    return ts.updateClassDeclaration(
      klass,
      klass.decorators,
      klass.modifiers,
      klass.name,
      klass.typeParameters,
      klass.heritageClauses!,
      members
    );
  }

  private updateElementDecorators(decorators: ts.Decorator[]): ts.Decorator[] {
    let customElementDecorator = getDecoratorByName(decorators, 'customElement');
    if (customElementDecorator) {
      arrayRemove(decorators, customElementDecorator);
    }
    return decorators;
  }

  // private transformCustomAttribute(klass: ts.ClassDeclaration): ts.ClassDeclaration {

  //   let viewModelClassName = getClassName(klass);
  //   let htmlName = getBehaviorHtmlName(klass);
  //   let classMembers = [...klass.members];
  //   let bindables: Record<string, IBindable> = {};
  //   let initializers: Record<string, ts.Expression> = {};

  //   /* Upgrade */
  //   klass = ts.updateClassDeclaration(
  //     klass,
  //     Array.isArray(klass.decorators) ? this.updateAttributeDecorators(klass.decorators) : undefined,
  //     klass.modifiers,
  //     klass.name,
  //     klass.typeParameters,
  //     klass.heritageClauses!,
  //     classMembers
  //   );

  //   klass = this.updateCustomElementClassMembers(
  //     /* extract bindables of class members */ klass,
  //     /* into this object */ bindables,
  //     /* and this object */ initializers,
  //     /* is custom attribute */ true
  //   );

  //   /* Register resource */
  //   this.attributes[htmlName] = new AttributeResource(this, viewModelClassName, klass, bindables, initializers);
  //   return klass;
  // }

  // private updateAttributeDecorators(decorators: ts.Decorator[]): ts.Decorator[] {
  //   let customAttrDecorator = getDecoratorByName(decorators, 'customAttribute');
  //   if (customAttrDecorator) {
  //     arrayRemove(decorators, customAttrDecorator);
  //   }
  //   return decorators;
  // }

  private createDefineObservers(observedProperties: string[], initializers: Record<string, ts.Expression>) {
    return ts.createStatement(
      ts.createCall(
        ts.createPropertyAccess(
          ts.createIdentifier('Object'),
          'defineProperty'
        ),
        /*typeArguments*/ undefined,
        /*arguments*/
        [
          ts.createThis(),
          ts.createLiteral('$observers'),
          ts.createObjectLiteral(
            [
              ts.createPropertyAssignment(
                'value',
                ts.createObjectLiteral(
                  observedProperties.map(op => {
                    return ts.createPropertyAssignment(
                      op,
                      ts.createNew(
                        ts.createIdentifier('Observer'),
                        /* type arguments */ undefined,
                        /* arguments */ op in initializers
                          ? [initializers[op]]
                          : undefined
                      )
                    )
                  }),
                  /* multiline */ true
                )
              ),
              ts.createPropertyAssignment('configurable', ts.createTrue())
            ],
            /*multiline*/ true
          )
        ]
      ),
    );
  }

  private updateConstructor(
    ctor: ts.ConstructorDeclaration,
    observedProperties: string[],
    initializers: Record<string, ts.Expression>
  ): ts.ConstructorDeclaration {
    return ts.updateConstructor(
      ctor,
      ctor.decorators,
      ctor.modifiers,
      ctor.parameters,
      ts.createBlock(
        // TODO: handle super()
        ctor.body && ctor.body.statements
          ? [
            this.createDefineObservers(observedProperties, initializers),
            ...ctor.body!.statements
          ]
          : [this.createDefineObservers(observedProperties, initializers)],
        /* multiline */ true
      )
    )
  }
}
