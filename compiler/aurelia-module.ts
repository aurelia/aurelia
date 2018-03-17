import * as ts from 'typescript';
import {
  // IAureliaModuleCompiler,
  IAureliaModule,
  ITemplateFactory,
  IResourceElement,
  IResourceAttribute,
  IResourceValueConverter,
  IResourceBindingBehavior,
  // resourceKind,
  IAureliaModuleStatements,
  IBindable,
  IFileUtils,
  // IResource,
} from "./interfaces";

import { ElementResource, AttributeResource } from './view-resources';
import { hyphenate } from './util';
import {
  // getBehaviorHtmlName,
  getBindableDecorator,
  getBindableDecoratorBindingMode,
  // getPrivateClassName,
  // getDecoratorByName,
  getBindableDecoratorPrimaryPropertyValue
} from './ts-util';
import { BindableProperty, IBindableConfig } from './bindable-property';
import {
  // removeClassExport,
  isCustomElement,
  getClassName,
  isCustomAttribute,
  isValueConverter,
  isBindingBehavior
} from './ts-class-util';
import { bindingMode } from './binding';
import { AureliaModuleTransformer } from './aurelia-module-transformer';


export class ResourceModule implements IAureliaModule {

  static globalModule: IAureliaModule;

  elements: Record<string, IResourceElement> = {};
  attributes: Record<string, IResourceAttribute> = {};
  valueConverters: Record<string, IResourceValueConverter> = {};
  bindingBehaviors: Record<string, IResourceBindingBehavior> = {};

  readonly file: ts.SourceFile;

  templates: HTMLTemplateElement[];
  templateFactories: ITemplateFactory[];
  mainResource?: IResourceElement;

  constructor(
    public fileName: string,
    text: string | undefined,
    public fileUtil: IFileUtils
  ) {
    if (text) {
      this.extractMetadata(this.file = ts.createSourceFile(
        fileName,
        text,
        ts.ScriptTarget.Latest
      ));
    }
  }

  private extractMetadata(file: ts.SourceFile) {
    file.getSourceFile().statements.forEach((statement: ts.Statement) => {
      if (isCustomElement(statement)) {
        this.addCustomElement(this.extractCustomElementMetdata(statement));
      } else if (isCustomAttribute(statement)) {
        this.addCustomAttribute(this.extractCustomAttributeMetadata(statement));
      } else if (isValueConverter(statement)) {
        console.log('TODO: implement value converter');
      } else if (isBindingBehavior(statement)) {
        console.log('TODO: implement binding behavior');
      }
    });
  }

  private extractCustomElementMetdata(klass: ts.ClassDeclaration): IResourceElement {
    let viewModelClassName = getClassName(klass);
    let bindables: Record<string, IBindable> = {};
    let initializers: Record<string, ts.Expression> = {};
    let lifeCycles: Record<string, boolean> = {};
    this.extractClassMemberMetadata(
      /* extract bindables of class members */ klass,
      /* into this object */ bindables,
      /* and this object */ initializers,
      /* and this object about life cycles */ lifeCycles
    );
    return new ElementResource(this, viewModelClassName, bindables, initializers, lifeCycles);
  }

  private extractCustomAttributeMetadata(klass: ts.ClassDeclaration): IResourceAttribute {
    let viewModelClassName = getClassName(klass);
    let bindables: Record<string, IBindable> = {};
    let initializers: Record<string, ts.Expression> = {};
    let lifeCycles: Record<string, boolean> = {};
    this.extractClassMemberMetadata(
      /* extract bindables of class members */ klass,
      /* into this object */ bindables,
      /* and this object */ initializers,
      /* and this object about life cycles */ lifeCycles
    );
    return new AttributeResource(this, viewModelClassName, bindables, initializers, lifeCycles);
  }

  private extractClassMemberMetadata(
    klass: ts.ClassDeclaration,
    bindables: Record<string, IBindable>,
    initializers: Record<string, ts.Expression>,
    lifeCycles: Record<string, boolean>,
    isAttr: boolean = false
  ) {
    let primary: IBindable | undefined;
    klass.members.forEach(member => {
      if (ts.isConstructorDeclaration(member)) {
        lifeCycles.ctor = true;
        return;
      }
      // let $decorators = member.decorators;
      // if (!$decorators) {
      //   return;
      // }
      if (!ts.isPropertyDeclaration(member)) {
        return;
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
      if (member.initializer) {
        initializers[memberName] = member.initializer;
      }
      let bindableDecorator = getBindableDecorator(member);
      if (bindableDecorator === null) {
        return;
      }
      let bindableAttrName = hyphenate(memberName);
      let bindableConfig: IBindableConfig = {
        name: memberName,
        defaultBindingMode: getBindableDecoratorBindingMode(bindableDecorator) || bindingMode.toView,
        defaultValue: member.initializer,
        // primaryProperty: getBindableDecoratorPrimaryPropertyValue(bindableDecorator)
      };
      let bindable = bindables[bindableAttrName] = new BindableProperty(bindableConfig);
      if (isAttr) {
        let isPrimary = getBindableDecoratorPrimaryPropertyValue(bindableDecorator);
        if (isPrimary) {
          if (primary) {
            throw new Error('Cannot have two custom primary properties on one custom attribute.');
          }
          primary = bindable;
          bindable.primaryProperty = true;
        }
      }
    });
  }

  getGlobalResources() {
    return ResourceModule.globalModule;
  }

  addFactory(factory: ITemplateFactory) {
    (this.templateFactories || (this.templateFactories = [])).push(factory);
    return this;
  }

  getCustomElement(htmlName: string) {
    return this.elements[htmlName] || null;
  }

  getCustomElements(): IResourceElement[] {
    return Object.keys(this.elements).map(el => this.elements[el]);
  }

  addCustomElement(el: IResourceElement): IResourceElement {
    if (this.elements[el.htmlName]) {
      throw new Error('Custom element with same name already existed');
    }
    if (!this.mainResource) {
      this.mainResource = el;
    }
    return this.elements[el.htmlName] = el;
  }

  getCustomAttribute(htmlName: string) {
    return this.attributes[htmlName] || null;
  }

  getCustomAttributes(): IResourceAttribute[] {
    return Object.keys(this.attributes).map(attr => this.attributes[attr]);
  }

  addCustomAttribute(attr: IResourceAttribute): IResourceAttribute {
    if (this.attributes[attr.htmlName]) {
      throw new Error('Custom attribute with same name already existed');
    }
    return this.attributes[attr.htmlName] = attr;
  }

  getValueConverters(): IResourceValueConverter[] {
    return Object.keys(this.valueConverters).map(vc => this.valueConverters[vc]);
  }

  getBindingBehaviors(): IResourceBindingBehavior[] {
    return Object.keys(this.bindingBehaviors).map(bb => this.bindingBehaviors[bb]);
  }

  toStatements(file: ts.SourceFile, emitImports?: boolean): IAureliaModuleStatements {
    let factories = this.templateFactories;
    let mainFactory = factories[0];
    let mainFactoryCode = mainFactory.getCode(emitImports);
    let depModules: IAureliaModuleStatements[] = [];
    // for (let i = 1, ii = factories.length; ii > i; ++i) {
    //   let factory = factories[i];
    // let deps = mainFactory.dependencies;
    // for (let j = 0, jj = deps.length; jj > j; ++j) {
    //   let dep = deps[j];
    //   let statements = dep.toStatements();
    //   depModules.push(statements);
    // }
    // depModules[i] = factory.owner.toStatements();
    // }
    return {
      imports: mainFactoryCode.imports,
      view: mainFactoryCode.view,
      originals: new AureliaModuleTransformer(this, file).transform(),
      // originals: [
      //   ...this.file.statements
      // ],
      deps: depModules
    };
  }

  toSourceFile(emitImport?: boolean): ts.SourceFile {
    // let importsEmitted = false;
    let imports: ts.ImportDeclaration[];
    // let templateViews: ts.ClassDeclaration[] = [];
    let file = ts.createSourceFile(this.fileName, '', ts.ScriptTarget.Latest);

    let factories = this.templateFactories;
    let mainFactory = factories[0];
    let mainFactoryCode = mainFactory.getCode();
    imports = mainFactoryCode.imports;
    // let statements: ts.Statement[] = [...mainFactoryCode.imports];

    // for (let i = 1, ii = factories.length; ii > i; ++i) {
    //   let factory = factories[i];
    // }

    // let templateCodes = this.templateFactories.forEach(tf => {
    //   let code = tf.getCode(emitImport && !imports ? true : false);
    //   if (!imports) {
    //     imports = code.imports;
    //     statements.push(...code.imports);
    //   }
    //   statements.push(code.view);
    //   templateViews.push(code.view);
    // });

    // let templateFiles = this.templateFactories.map(tf => {
    //   return tf.transform(emitImport && !importsEmitted ? true : false)
    // });
    return ts.updateSourceFileNode(file, [
      ...imports,
      ...this.file.statements,
      // ...statements,
      // ...templateFiles.reduce((statements, tf) => statements.concat(tf.statements), []),
    ]);
  }

  compile(): string {
    return ts.createPrinter().printFile(this.toSourceFile(true));
  }

  toString(): string {
    try {
      let synthesizedFile = ts.createSourceFile(this.fileName, '', ts.ScriptTarget.Latest);
      let moduleStatements = this.toStatements(this.file, true);
      // let mainTemplate = this.templateFactories[0];

      return ts.createPrinter().printFile(ts.updateSourceFileNode(synthesizedFile, [
        ...moduleStatements.imports,
        // ...moduleStatements.deps.reduce((stms, mdule) => {
        //   return stms.concat([
        //     ...mdule.originals,
        //     mdule.view
        //   ])
        // }, [] as ts.Statement[]),
        ...moduleStatements.originals,
        moduleStatements.view
      ]));
    } catch (ex) {
      console.log(ex);
      return '';
    }
  }

  toJSON() {
    throw new Error('IAureliaModule.toJson() not implemented.');
  }
}
