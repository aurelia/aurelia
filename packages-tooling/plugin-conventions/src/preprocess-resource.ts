import { type ModifyCodeResult } from 'modify-code';
import type {
  CallExpression,
  ClassDeclaration,
  ClassElement,
  Expression,
  Node,
  PropertyDeclaration,
  SourceFile,
  Statement,
  TransformerFactory,
  MethodDeclaration,
  GetAccessorDeclaration,
} from 'typescript';
import pkg from 'typescript';
import { modifyCode } from './modify-code';
import { nameConvention } from './name-convention';
import { IFileUnit, IPreprocessOptions, ResourceType } from './options';
import { resourceName } from './resource-name';
import { createTypeCheckedTemplate, prependUtilityTypes } from './template-typechecking';

const {
  ModifierFlags,
  ScriptTarget,
  SyntaxKind,
  canHaveDecorators,
  canHaveModifiers,
  createPrinter,
  createSourceFile,
  getCombinedModifierFlags,
  getDecorators,
  getModifiers,
  isCallExpression,
  isClassDeclaration,
  isExpressionStatement,
  isIdentifier,
  isImportDeclaration,
  isObjectLiteralExpression,
  isPropertyDeclaration,
  isPropertyAccessExpression,
  isNamedImports,
  isStringLiteral,
  transform,
  visitEachChild,
  visitNode,
  getJSDocType,
  factory: {
    createIdentifier,
    createObjectLiteralExpression,
    createSpreadAssignment,
    updateClassDeclaration,
    updatePropertyDeclaration,
  },
} = pkg;

interface ICapturedImport {
  names: string[];
  start: number;
  end: number;
}

type AccessModifier = 'public' | 'protected' | 'private';
type MemberType = 'property' | 'method' | 'accessor';

export interface MethodArgument {
  name: string;
  type: string;
  isOptional: boolean;
  isSpread: boolean;
}

export interface ClassMember {
  accessModifier: AccessModifier;
  memberType: MemberType;
  name: string;
  dataType: string;
  methodArguments: MethodArgument[] | null;
}

export interface ClassMetadata {
  name: string;
  members: ClassMember[];
}

interface ITemplateMetadata {
  /** Identifier for the HTML import. */
  name?: string;
  /** Path to the module. */
  modulePath?: string;
  inlineTemplate?: string;
  classes: ClassMetadata[];
  // TODO(Sayan): we probably don't need the following; remove.
  start?: number;
  end?: number;
}

interface IPos {
  pos: number;
  end: number;
}

interface CustomElementDecorator {
  position: IPos;
  namePosition: IPos;
}

interface DefineElementInformation {
  position: IPos;
  modifiedContent: string;
}

type Modification = {
  remove?: IPos[];
  insert?: [number, string][];
};

interface IFoundResource {
  type?: ResourceType;
  classMetadata?: ClassMetadata;
  localDep?: string;
  modification?: Modification;
  implicitStatement?: IPos;
  runtimeImportName?: string;
  customElementDecorator?: CustomElementDecorator;
  defineElementInformation?: DefineElementInformation;
}

interface IResourceDecorator {
  type: ResourceType;
  expression?: CallExpression;
  originalDecorator: string;
}

interface IModifyResourceOptions {
  implicitElement?: IPos;
  localDeps: string[];
  modifications: Modification[];
  customElementDecorator?: CustomElementDecorator;
  transformHtmlImportSpecifier?: (path: string) => string;
  defineElementInformation?: DefineElementInformation;
  exportedClassMetadata?: ClassMetadata;
  experimentalTemplateTypeCheck: boolean;
  useConventions: boolean;
  templateMetadata: ITemplateMetadata[];
}

export function preprocessResource(unit: IFileUnit, options: IPreprocessOptions): ModifyCodeResult {
  const expectedResourceName = resourceName(unit.path);
  const sf = createSourceFile(unit.path, unit.contents, ScriptTarget.Latest, true);
  let exportedClassMetadata: ClassMetadata | undefined;
  let auImport: ICapturedImport = { names: [], start: 0, end: 0 };
  let runtimeImport: ICapturedImport = { names: [], start: 0, end: 0 };

  let implicitElement: IPos | undefined;
  let customElementDecorator: CustomElementDecorator | undefined; // for @customName('custom-name')
  let defineElementInformation: DefineElementInformation | undefined;
  const templateMetadata: ITemplateMetadata[] = [];

  // When there are multiple exported classes (e.g. local value converters),
  // they might be deps for composing the main implicit custom element.
  const localDeps: string[] = [];
  const modifications: Modification[] = [];

  sf.statements.forEach(s => {
    // Find existing import Aurelia, {customElement, templateController} from 'aurelia';
    const au = captureImport(s, 'aurelia', unit.contents);
    if (au) {
      // Assumes only one import statement for @aurelia/runtime-html
      auImport = au;
      return;
    }

    // Find existing import {customElement} from '@aurelia/runtime-html';
    const runtime = captureImport(s, '@aurelia/runtime-html', unit.contents);
    if (runtime) {
      // Assumes only one import statement for @aurelia/runtime-html
      runtimeImport = runtime;
      return;
    }

    const templateImport = captureTemplateImport(s, unit.contents);
    if (templateImport) {
      templateMetadata.push(templateImport);
      return;
    }
    if (tryCaptureCustomElementDefine(s, sf, templateMetadata)) return;

    // Only care about export class Foo {...}.
    // Note this convention simply doesn't work for
    //   class Foo {}
    //   export {Foo};
    const resource = findResource(s, expectedResourceName, unit.filePair, unit.contents, options.enableConventions, templateMetadata, sf);
    if (!resource) return;
    const {
      classMetadata,
      localDep,
      modification,
      implicitStatement,
      runtimeImportName,
      customElementDecorator: customName,
      defineElementInformation: $defineElementInformation,
    } = resource;

    if (localDep) localDeps.push(localDep);
    if (modification) modifications.push(modification);
    if (implicitStatement) implicitElement = implicitStatement;
    if (runtimeImportName && !auImport.names.includes(runtimeImportName)) {
      ensureTypeIsExported(runtimeImport.names, runtimeImportName);
    }
    if (classMetadata) {
      exportedClassMetadata = classMetadata;
    }
    if (customName) customElementDecorator = customName;
    if ($defineElementInformation) defineElementInformation = $defineElementInformation;
  });

  let m = modifyCode(unit.contents, unit.path);
  const hmrEnabled = options.hmr && exportedClassMetadata && process.env.NODE_ENV !== 'production';

  if (options.enableConventions || hmrEnabled) {
    if (runtimeImport.names.length) {
      let runtimeImportStatement = `import { ${runtimeImport.names.join(', ')} } from '@aurelia/runtime-html';`;
      if (runtimeImport.end === runtimeImport.start) runtimeImportStatement += '\n';
      m.replace(runtimeImport.start, runtimeImport.end, runtimeImportStatement);
    }
  }

  m = modifyResource(unit, m, {
    implicitElement,
    localDeps,
    modifications,
    customElementDecorator,
    transformHtmlImportSpecifier: options.transformHtmlImportSpecifier,
    defineElementInformation,
    exportedClassMetadata,
    experimentalTemplateTypeCheck: options.experimentalTemplateTypeCheck,
    useConventions: options.enableConventions ?? false,
    templateMetadata: templateMetadata
  });

  if (options.hmr && exportedClassMetadata && process.env.NODE_ENV !== 'production') {
    if (options.getHmrCode) {
      m.append(options.getHmrCode(exportedClassMetadata.name, unit.path));
    }
  }

  return m.transform();
}

const jsFilePattern = /\.[m]?js$/;
function modifyResource(unit: IFileUnit, m: ReturnType<typeof modifyCode>, options: IModifyResourceOptions) {
  const {
    implicitElement,
    localDeps,
    modifications,
    customElementDecorator,
    transformHtmlImportSpecifier = s => s,
    defineElementInformation,
    exportedClassMetadata,
    useConventions,
    templateMetadata,
  } = options;

  // TODO(typechecking/phaseN): support other languages
  const isJs = jsFilePattern.test(unit.path);
  if (!useConventions) {
    if (options.experimentalTemplateTypeCheck) {
      prependUtilityTypes(m, isJs);
      for (const templateImport of templateMetadata) {
        const classNames = templateImport.classes;
        if (classNames.length === 0) continue;
        emitTypeCheckedTemplate(
          () => templateImport.inlineTemplate ?? unit.readFile?.(templateImport.modulePath!),
          templateImport.classes,
          isJs
        );
      }
    }
  } else if (implicitElement && unit.filePair) {
    const viewDef = '__au2ViewDef';

    if (options.experimentalTemplateTypeCheck) {
      prependUtilityTypes(m, isJs);
      emitTypeCheckedTemplate(() => unit.readFile?.(`./${unit.filePair}`), [exportedClassMetadata!], isJs);
    }
    m.prepend(`import * as ${viewDef} from './${transformHtmlImportSpecifier(unit.filePair)}';\n`);

    if (defineElementInformation) {
      m.replace(defineElementInformation.position.pos, defineElementInformation.position.end, defineElementInformation.modifiedContent);
    } else {
      const elementStatement = unit.contents.slice(implicitElement.pos, implicitElement.end);
      if (elementStatement.includes('$au')) {
        const sf = createSourceFile('temp.ts', elementStatement, ScriptTarget.Latest, true);
        const result = transform(sf, [createAuResourceTransformer()]);
        const modified = createPrinter().printFile(result.transformed[0]);
        m.replace(implicitElement.pos, implicitElement.end, modified);
      } else if (localDeps.length) {
        const pos = implicitElement.pos;
        // When in-file deps are used, move the body of custom element to end of the file,
        // in order to avoid TS2449: Class '...' used before its declaration.
        if (customElementDecorator) {
          // @customElement('custom-name') CLASS -> CLASS CustomElement.define({ ...viewDef, name: 'custom-name', dependencies: [ ...viewDef.dependencies, ...localDeps ] }, exportedClassName);
          const elementStatement = unit.contents.slice(customElementDecorator.position.end, implicitElement.end);
          m.replace(pos, implicitElement.end, '');
          const name = unit.contents.slice(customElementDecorator.namePosition.pos, customElementDecorator.namePosition.end);
          m.append(`\n@customElement({ ...${viewDef}, name: ${name}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ] })${elementStatement}`);
        } else {
          // CLASS -> CLASS CustomElement.define({ ...viewDef, dependencies: [ ...viewDef.dependencies, ...localDeps ] }, exportedClassName);
          const elementStatement = unit.contents.slice(pos, implicitElement.end);
          m.replace(pos, implicitElement.end, '');
          m.append(`\n@customElement({ ...${viewDef}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ] })\n${elementStatement}`);
        }
      } else {
        if (customElementDecorator) {
          // @customElement('custom-name') CLASS -> CLASS CustomElement.define({ ...viewDef, name: 'custom-name' }, exportedClassName);
          const name = unit.contents.slice(customElementDecorator.namePosition.pos, customElementDecorator.namePosition.end);
          m.replace(customElementDecorator.position.pos - 1, customElementDecorator.position.end, '');
          m.insert(implicitElement.pos, `@customElement({ ...${viewDef}, name: ${name} })`);
        } else {
          // CLASS -> CLASS CustomElement.define(viewDef, exportedClassName);
          let sb = viewDef;
          if (sb.startsWith('...')) {
            sb = `{ ${sb} }`;
          }
          m.insert(implicitElement.pos, `@customElement(${sb})\n`);
        }
      }
    }
  }

  if (modifications.length) {
    for (const modification of modifications) {
      if (modification.remove) {
        for (const pos of modification.remove) {
          m.delete(pos.pos, pos.end);
        }
      }
      if (modification.insert) {
        for (const [pos, str] of modification.insert) {
          m.insert(pos, str);
        }
      }
    }
  }

  return m;

  function emitTypeCheckedTemplate(contentFactory: () => string | undefined, classes: ClassMetadata[], isJs: boolean): void {
    const htmlContent = contentFactory();
    if (!htmlContent) return;
    const typeCheckedTemplate = createTypeCheckedTemplate(htmlContent, classes, isJs);
    // console.log(typeCheckedTemplate);
    m.prepend(typeCheckedTemplate);
  }
}

function captureImport(s: Statement, lib: string, code: string): ICapturedImport | void {
  if (isImportDeclaration(s) &&
    isStringLiteral(s.moduleSpecifier) &&
    s.moduleSpecifier.text === lib &&
    s.importClause?.namedBindings &&
    isNamedImports(s.importClause.namedBindings)) {
    return {
      names: s.importClause.namedBindings.elements.map(e => e.name.text),
      start: ensureTokenStart(s.pos, code),
      end: s.end
    };
  }
}

function captureTemplateImport(s: Statement, code: string): ITemplateMetadata | void {
  if (
    isImportDeclaration(s)
    && isStringLiteral(s.moduleSpecifier)
    && s.moduleSpecifier.text.endsWith('.html') // Start small, only support html for now. TODO: Support other template extensions later.
    && s.importClause?.name != null
    && isIdentifier(s.importClause.name)
  ) return {
    name: s.importClause.name.text,
    modulePath: s.moduleSpecifier.text,
    classes: [],
    start: ensureTokenStart(s.pos, code),
    end: s.end
  };
}

function getClassMembers(node: ClassDeclaration, sf: SourceFile): ClassMember[] {
  return node.members.reduce((acc: ClassMember[], m: ClassElement) => {
    const name = m.name;
    if (name == null) return acc;
    let memberType: MemberType | null = null;
    switch (m.kind) {
      case SyntaxKind.PropertyDeclaration:
        memberType = 'property';
        break;
      case SyntaxKind.MethodDeclaration:
        memberType = 'method';
        break;
      case SyntaxKind.GetAccessor:
        memberType = 'accessor';
        break;
    }
    if (memberType === null) return acc;
    if (isIdentifier(name)) {
      const flags = getCombinedModifierFlags(m);
      const accessModifier: AccessModifier = flags & ModifierFlags.Private
        ? 'private'
        : flags & ModifierFlags.Protected
          ? 'protected'
          : 'public'
        ;
      acc.push({
        name: name.escapedText.toString(),
        accessModifier: accessModifier!,
        memberType,
        dataType: ((m as PropertyDeclaration | MethodDeclaration | GetAccessorDeclaration).type ?? getJSDocType(m))?.getText(sf) ?? 'any',
        methodArguments: memberType === 'method'
          ? (m as MethodDeclaration).parameters.map(p => ({
            name: p.name.getText(sf),
            type: (p.type ?? getJSDocType(p))?.getText(sf) ?? 'any',
            isOptional: p.questionToken != null,
            isSpread: p.dotDotDotToken != null
          }))
          : null
      });
    }
    return acc;
  }, [] as ClassMember[]);
}

function tryCaptureCustomElementDefine(s: Statement, sf: SourceFile, templateMetadata: ITemplateMetadata[]): boolean {
  if (!isExpressionStatement(s) || !isCallExpression(s.expression)) return false;

  // TODO(typechecking/phase2): support other kind of expressions

  // CustomElement.define({ ...viewDef, name: 'custom-name' }, exportedClassName);
  const propAccExpr = s.expression.expression;
  if (
    !isPropertyAccessExpression(propAccExpr)
    || !isIdentifier(propAccExpr.expression) || propAccExpr.expression.escapedText !== 'CustomElement'
    || !isIdentifier(propAccExpr.name) || propAccExpr.name.escapedText !== 'define'
  ) return false;

  const [defn, className] = s.expression.arguments;
  if (!isIdentifier(className)) return false;

  const name = className.escapedText.toString();
  // This is a second pass of the source file; this needs to be optimized. Waiting for feature-completion first.
  const classDeclaration = sf.statements.find(s => isClassDeclaration(s) && s.name != null && s.name.text === name) as ClassDeclaration;
  const $class: ClassMetadata = { name, members: getClassMembers(classDeclaration, sf) };
  return tryCollectTemplateMetadataFromDefinition(defn, $class, templateMetadata);
}

// This method mutates runtimeExports.
function ensureTypeIsExported(runtimeExports: string[], type: string) {
  if (!runtimeExports.includes(type)) {
    runtimeExports.push(type);
  }
}

// TypeScript parsed statement could contain leading white spaces.
// This find the exact starting position for latter code injection.
function ensureTokenStart(start: number, code: string) {
  while (start < code.length - 1 && /^\s$/.exec(code[start])) start++;
  return start;
}

function isExported(node: Node): boolean {
  if (!canHaveModifiers(node)) return false;
  const modifiers = getModifiers(node);
  if (modifiers === void 0) return false;
  for (const mod of modifiers) {
    if (mod.kind === SyntaxKind.ExportKeyword) return true;
  }
  return false;
}

const KNOWN_RESOURCE_DECORATORS = ['customElement', 'customAttribute', 'valueConverter', 'bindingBehavior', 'bindingCommand', 'templateController', 'noView', 'inlineView'];

function isKindOfSame(name1: string, name2: string): boolean {
  return name1.replace(/-/g, '') === name2.replace(/-/g, '');
}

function isStaticPropertyDeclaration(node: ClassElement, name: string): node is PropertyDeclaration {
  return isPropertyDeclaration(node)
    && isIdentifier(node.name)
    && node.name.escapedText === name
    && (getCombinedModifierFlags(node) & ModifierFlags.Static) !== 0;
}
function isStatic$auProperty(member: ClassElement): member is PropertyDeclaration {
  return isStaticPropertyDeclaration(member, '$au');
}

/**
 * Adds the className to the templateMetadata as per the definition expression.
 * @returns {boolean} `true` if the templateMetadata is updated; else `false`.
 */
function tryCollectTemplateMetadataFromDefinition(defnExpr: Expression | undefined, $class: ClassMetadata, templateMetadata: ITemplateMetadata[]): boolean {
  // TODO(typechecking/phase2): support non-object literal.
  if (defnExpr == null || !isObjectLiteralExpression(defnExpr)) return false;

  let templateMetadataUpdated = false;
  for (const p of defnExpr.properties) {
    switch (p.kind) {
      case SyntaxKind.ShorthandPropertyAssignment:
        if (p.name.text === 'template') {
          templateMetadataUpdated = templateMetadata.find(ti => ti.name === 'template')?.classes.push($class) != null;
        }
        break;
      case SyntaxKind.PropertyAssignment: {
        const l = p.name;
        if (isIdentifier(l) && l.text === 'template') {
          const value = p.initializer;
          if (isIdentifier(value)) {
            templateMetadataUpdated = templateMetadata.find(ti => ti.name === value.text)?.classes.push($class) != null;
          } else if (isStringLiteral(value)) {
            templateMetadata.push({
              inlineTemplate: value.text,
              classes: [$class],
            });
            templateMetadataUpdated = true;
          }
        }
        break;
      }
      // TODO(typechecking/phase2): support object literal with spread assignment.
      default:
        break;
    }
  }
  return templateMetadataUpdated;
}

function tryCollectTemplateMetadataFromStaticTemplate(member: ClassElement, $class: ClassMetadata, templateMetadata: ITemplateMetadata[]): boolean {
  if (!isStaticPropertyDeclaration(member, 'template')) return false;
  const initializer = member.initializer;
  if (!initializer) return false;
  // case 1: static template = '...'
  if (isStringLiteral(initializer)) {
    templateMetadata.push({
      inlineTemplate: initializer.text,
      classes: [$class],
    });
    return true;
  }
  // case 2: static template = importedTemplate
  if (isIdentifier(initializer)) {
    return templateMetadata.find(ti => ti.name === initializer.text)?.classes.push($class) != null;
  }
  return false;
}

/**
 * This merges the imports from the conventional template file (__au2ViewDef) with the `$au` object in the class.
 */
function createAuResourceTransformer(): TransformerFactory<SourceFile> {
  return function factory(context) {
    function visit(node: Node): Node {
      if (isClassDeclaration(node)) return visitClass(node);
      return visitEachChild(node, visit, context);
    }
    return (node => visitNode(node, visit));
  } as TransformerFactory<SourceFile>;

  function visitClass(node: ClassDeclaration): Node {
    const newMembers = node.members.map(member => {
      if (!isStatic$auProperty(member)) return member;

      const initializer = member.initializer;
      if (initializer == null || !isObjectLiteralExpression(initializer)) return member;

      const spreadAssignment = createSpreadAssignment(createIdentifier('__au2ViewDef'));
      const newInitializer = createObjectLiteralExpression([spreadAssignment, ...initializer.properties]);
      return updatePropertyDeclaration(
        member,
        member.modifiers,
        member.name,
        member.questionToken,
        member.type,
        newInitializer);
    });
    return updateClassDeclaration(node, node.modifiers, node.name, node.typeParameters, node.heritageClauses, newMembers);
  }
}

function findResource(
  node: Node,
  expectedResourceName: string,
  filePair: string | undefined,
  code: string,
  useConvention: boolean | undefined,
  templateMetadata: ITemplateMetadata[],
  sf: SourceFile,
): IFoundResource | void {

  // Ignore non-class declarations, anonymous classes, and non-exported classes (in case convention is used).
  if (!isClassDeclaration(node) || !node.name || !isExported(node) && !useConvention) return;
  const pos = ensureTokenStart(node.pos, code);

  const className = node.name.text;
  const $class = { name: className, members: getClassMembers(node, sf) };
  const { name, type } = nameConvention(className);
  const isImplicitResource = isKindOfSame(name, expectedResourceName);

  const resourceType = collectClassDecorators(node);

  if (resourceType) {
    const decorator = resourceType.expression;
    const decoratorArgs = decorator?.arguments;
    const numArguments = decoratorArgs?.length ?? 0;

    // map the classes to the template imports to classes - @customElement decorator
    if (resourceType.type === 'customElement') {
      if (numArguments === 1) tryCollectTemplateMetadataFromDefinition(decoratorArgs?.[0], $class, templateMetadata);
      for (const member of node.members) {
        // static template property
        tryCollectTemplateMetadataFromStaticTemplate(member, $class, templateMetadata);
      }
    }

    // Explicitly decorated resource
    if (
      !isImplicitResource &&
      resourceType.type !== 'customElement'
    ) {
      return {
        localDep: className
      };
    }

    if (
         isImplicitResource
      && (resourceType.originalDecorator === 'noView' || resourceType.originalDecorator === 'inlineView')
      && !filePair
    ) {
      return {
        type: resourceType.type,
        modification: {
          insert: [[getPosition(node, code).pos, `@customElement('${name}')\n`]]
        },
        classMetadata: $class,
        runtimeImportName: 'customElement',
      };
    }

    if (
      isImplicitResource &&
      resourceType.type === 'customElement' &&
      numArguments === 1 &&
      isStringLiteral(decoratorArgs![0])
    ) {
      // @customElement('custom-name')
      const customName = decoratorArgs![0];
      return {
        type: resourceType.type,
        classMetadata: $class,
        implicitStatement: { pos: pos, end: node.end },
        customElementDecorator: {
          position: getPosition(decorator!, code),
          namePosition: getPosition(customName, code)
        },
        runtimeImportName: filePair ? type : undefined,
      };
    }

  } else {
    if (type === 'customElement') {
      for (const m of node.members) {
        // static $au property and/or static template property
        if (isStatic$auProperty(m)) {
          tryCollectTemplateMetadataFromDefinition(m.initializer, $class, templateMetadata);
        }
        tryCollectTemplateMetadataFromStaticTemplate(m, $class, templateMetadata);
      }

      if (!isImplicitResource || !filePair) return;
      return {
        type,
        classMetadata: $class,
        implicitStatement: { pos: pos, end: node.end },
        runtimeImportName: type,
      };
    }
    return {
      type,
      modification: {
        insert: [[getPosition(node, code).pos, `@${type}('${name}')\n`]]
      },
      localDep: className,
      runtimeImportName: type,
    };
  }
}

function collectClassDecorators(node: ClassDeclaration): IResourceDecorator | undefined {

  if (!canHaveDecorators(node)) return;

  const decorators = getDecorators(node) ?? [];
  if (decorators.length === 0) return;

  for (const d of decorators) {
    let name: string | undefined;
    let resourceExpression: CallExpression | undefined;
    if (isCallExpression(d.expression)) {
      const exp = d.expression.expression;
      if (isIdentifier(exp)) {
        name = exp.text;
        resourceExpression = d.expression;
      }
    } else if (isIdentifier(d.expression)) {
      name = d.expression.text;
    }

    const isViewCe = name === 'noView' || name === 'inlineView';
    if (
      name == null
      || !KNOWN_RESOURCE_DECORATORS.includes(name)
      || (name !== 'noView' && resourceExpression == null)
    ) continue;

    return {
      type: (isViewCe ? 'customElement' : name) as ResourceType,
      expression: resourceExpression,
      originalDecorator: name,
    };
  }
}

function getPosition(node: Node, code: string): IPos {
  return { pos: ensureTokenStart(node.pos, code), end: node.end };
}
