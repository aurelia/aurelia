import {
  type CallExpression,
  type Statement,
  type Node,
  type SourceFile,
  type TransformerFactory,
  type ExpressionStatement,
  type ClassDeclaration,
  type Identifier,
} from 'typescript';
import { type ModifyCodeResult } from 'modify-code';
import { nameConvention } from './name-convention';
import { IFileUnit, IPreprocessOptions, ResourceType } from './options';
import { resourceName } from './resource-name';

import pkg from 'typescript';
import { modifyCode } from './modify-code';
const {
  createSourceFile,
  ScriptTarget,
  isImportDeclaration,
  isStringLiteral,
  isNamedImports,
  isClassDeclaration,
  canHaveModifiers,
  getModifiers,
  SyntaxKind,
  canHaveDecorators,
  getDecorators,
  isCallExpression,
  isIdentifier,
  visitEachChild,
  visitNode,
  isExpressionStatement,
  isObjectLiteralExpression,
  transform,
  createPrinter,
  isPropertyDeclaration,
  getCombinedModifierFlags,
  ModifierFlags,
  factory: {
    createSpreadAssignment,
    createIdentifier,
    createObjectLiteralExpression,
    updateCallExpression,
    updateExpressionStatement,
    createPropertyAssignment,
    updateClassDeclaration,
    updatePropertyDeclaration,
  }
} = pkg;

interface ICapturedImport {
  names: string[];
  start: number;
  end: number;
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

interface IFoundResource {
  className?: string;
  localDep?: string;
  needDefinition?: [number, string];
  implicitStatement?: IPos;
  runtimeImportName?: string;
  customElementDecorator?: CustomElementDecorator;
  defineElementInformation?: DefineElementInformation;
}

interface IFoundDecorator {
  type: ResourceType;
  expression: CallExpression;
}

interface IModifyResourceOptions {
  exportedClassName?: string;
  implicitElement?: IPos;
  localDeps: string[];
  definitions: [number, string][];
  customElementDecorator?: CustomElementDecorator;
  transformHtmlImportSpecifier?: (path: string) => string;
  defineElementInformation?: DefineElementInformation;
}

export function preprocessResource(unit: IFileUnit, options: IPreprocessOptions): ModifyCodeResult {
  const expectedResourceName = resourceName(unit.path);
  const sf = createSourceFile(unit.path, unit.contents, ScriptTarget.Latest);
  let exportedClassName: string | undefined;
  let auImport: ICapturedImport = { names: [], start: 0, end: 0 };
  let runtimeImport: ICapturedImport = { names: [], start: 0, end: 0 };

  let implicitElement: IPos | undefined;
  let customElementDecorator: CustomElementDecorator | undefined; // for @customName('custom-name')
  let defineElementInformation: DefineElementInformation | undefined;

  // When there are multiple exported classes (e.g. local value converters),
  // they might be deps for composing the main implicit custom element.
  const localDeps: string[] = [];
  const definitions: [number, string][] = [];

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

    // Only care about export class Foo {...}.
    // Note this convention simply doesn't work for
    //   class Foo {}
    //   export {Foo};
    const resource = findResource(s, expectedResourceName, unit.filePair, unit.contents);
    if (!resource) return;
    const {
      className,
      localDep,
      needDefinition,
      implicitStatement,
      runtimeImportName,
      customElementDecorator: customName,
      defineElementInformation: $defineElementInformation,
    } = resource;

    if (localDep) localDeps.push(localDep);
    if (needDefinition) definitions.push(needDefinition);
    if (implicitStatement) implicitElement = implicitStatement;
    if (runtimeImportName && !auImport.names.includes(runtimeImportName)) {
      ensureTypeIsExported(runtimeImport.names, runtimeImportName);
    }
    if (className) {
      exportedClassName = className;
    }
    if (customName) customElementDecorator = customName;
    if ($defineElementInformation) defineElementInformation = $defineElementInformation;
  });

  let m = modifyCode(unit.contents, unit.path);
  const hmrEnabled = options.hmr && exportedClassName && process.env.NODE_ENV !== 'production';

  if (options.enableConventions || hmrEnabled) {
    if (runtimeImport.names.length) {
      let runtimeImportStatement = `import { ${runtimeImport.names.join(', ')} } from '@aurelia/runtime-html';`;
      if (runtimeImport.end === runtimeImport.start) runtimeImportStatement += '\n';
      m.replace(runtimeImport.start, runtimeImport.end, runtimeImportStatement);
    }
  }

  if (options.enableConventions) {
    m = modifyResource(unit, m, {
      exportedClassName,
      implicitElement,
      localDeps,
      definitions: definitions,
      customElementDecorator,
      transformHtmlImportSpecifier: options.transformHtmlImportSpecifier,
      defineElementInformation,
    });
  }

  if (options.hmr && exportedClassName && process.env.NODE_ENV !== 'production') {
    if (options.getHmrCode) {
      m.append(options.getHmrCode(exportedClassName, unit.path));
    }
  }

  return m.transform();
}

function modifyResource(unit: IFileUnit, m: ReturnType<typeof modifyCode>, options: IModifyResourceOptions) {
  const {
    implicitElement,
    localDeps,
    definitions,
    customElementDecorator,
    transformHtmlImportSpecifier = s => s,
    exportedClassName,
    defineElementInformation,
  } = options;

  if (implicitElement && unit.filePair) {
    const viewDef = '__au2ViewDef';
    m.prepend(`import * as ${viewDef} from './${transformHtmlImportSpecifier(unit.filePair)}';\n`);

    if (defineElementInformation) {
      m.replace(defineElementInformation.position.pos, defineElementInformation.position.end, defineElementInformation.modifiedContent);
    } else {
      const elementStatement = unit.contents.slice(implicitElement.pos, implicitElement.end);
      if (elementStatement.includes('$au')) {
        const sf = createSourceFile('temp.ts', elementStatement, ScriptTarget.Latest);
        const result = transform(sf, [createAuResourceTransformer()]);
        const modified = createPrinter().printFile(result.transformed[0]);
        m.replace(implicitElement.pos, implicitElement.end, modified);
      } else if (localDeps.length) {
        // When in-file deps are used, move the body of custom element to end of the file,
        // in order to avoid TS2449: Class '...' used before its declaration.

        if (customElementDecorator) {
          // @customElement('custom-name') CLASS -> CLASS defineElement({ ...viewDef, name: 'custom-name', dependencies: [ ...viewDef.dependencies, ...localDeps ] }, exportedClassName);
          const elementStatement = unit.contents.slice(customElementDecorator.position.end, implicitElement.end);
          m.replace(implicitElement.pos, implicitElement.end, '');
          const name = unit.contents.slice(customElementDecorator.namePosition.pos, customElementDecorator.namePosition.end);
          m.append(`\n${elementStatement}\ndefineElement({ ...${viewDef}, name: ${name}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ] }, ${exportedClassName});\n`);
        } else {
          // CLASS -> CLASS defineElement({ ...viewDef, dependencies: [ ...viewDef.dependencies, ...localDeps ] }, exportedClassName);
          const elementStatement = unit.contents.slice(implicitElement.pos, implicitElement.end);
          m.replace(implicitElement.pos, implicitElement.end, '');
          m.append(`\n${elementStatement}\ndefineElement({ ...${viewDef}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ] }, ${exportedClassName});\n`);
        }
      } else {
        if (customElementDecorator) {
          // @customElement('custom-name') CLASS -> CLASS defineElement({ ...viewDef, name: 'custom-name' }, exportedClassName);
          const name = unit.contents.slice(customElementDecorator.namePosition.pos, customElementDecorator.namePosition.end);
          m.replace(customElementDecorator.position.pos - 1, customElementDecorator.position.end, '');
          m.insert(implicitElement.end, `\ndefineElement({ ...${viewDef}, name: ${name} }, ${exportedClassName});\n`);
        } else {
          // CLASS -> CLASS defineElement(viewDef, exportedClassName);
          m.insert(implicitElement.end, `\ndefineElement(${viewDef}, ${exportedClassName});\n`);
        }
      }
    }
  }

  if (definitions.length) {
    definitions.forEach(([pos, str]) => m.insert(pos, str));
  }

  return m;
}

function captureImport(s: Statement, lib: string, code: string): ICapturedImport | void {
  if (isImportDeclaration(s) &&
    isStringLiteral(s.moduleSpecifier) &&
    s.moduleSpecifier.text === lib &&
    s.importClause &&
    s.importClause.namedBindings &&
    isNamedImports(s.importClause.namedBindings)) {
    return {
      names: s.importClause.namedBindings.elements.map(e => e.name.text),
      start: ensureTokenStart(s.pos, code),
      end: s.end
    };
  }
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

const KNOWN_DECORATORS = ['view', 'customElement', 'customAttribute', 'valueConverter', 'bindingBehavior', 'bindingCommand', 'templateController'];

function findDecoratedResourceType(node: Node): IFoundDecorator | void {
  if (!canHaveDecorators(node)) return;
  const decorators = getDecorators(node);
  if (decorators === void 0) return;
  for (const d of decorators) {
    if (!isCallExpression(d.expression)) return;
    const exp = d.expression.expression;
    if (isIdentifier(exp)) {
      const name = exp.text;
      if (KNOWN_DECORATORS.includes(name)) {
        return {
          type: name as ResourceType,
          expression: d.expression
        };
      }
    }
  }
}

function isKindOfSame(name1: string, name2: string): boolean {
  return name1.replace(/-/g, '') === name2.replace(/-/g, '');
}

function createDefineElementTransformer(): TransformerFactory<SourceFile> {
  return function factory(context) {
    function visit(node: Node): Node {
      if (isExpressionStatement(node)) return visitExpression(node);
      return visitEachChild(node, visit, context);
    }
    return (node => visitNode(node, visit));
  } as TransformerFactory<SourceFile>;

  function visitExpression(node: ExpressionStatement): Node {
    const callExpression = node.expression;
    if (!isCallExpression(callExpression)) return node;

    const identifier = callExpression.expression;
    if (!isIdentifier(identifier) || identifier.escapedText !== 'defineElement') return node;

    const $arguments = callExpression.arguments;
    if ($arguments.length !== 2) return node;

    const [definitionExpression, className] = $arguments;
    if (!isIdentifier(className)) return node;
    if (!isStringLiteral(definitionExpression) && !isObjectLiteralExpression(definitionExpression)) return node;

    const spreadAssignment = createSpreadAssignment(createIdentifier('__au2ViewDef'));
    const newDefinition = isStringLiteral(definitionExpression)
      ? createObjectLiteralExpression([
        spreadAssignment,
        createPropertyAssignment('name', definitionExpression),
      ])
      : createObjectLiteralExpression([
        spreadAssignment,
        ...definitionExpression.properties,
      ]);
    const newCallExpression = updateCallExpression(callExpression, identifier, undefined, [newDefinition, className]);
    return updateExpressionStatement(node, newCallExpression);
  }
}

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
      if (!isPropertyDeclaration(member)) return member;

      const name = (member.name as Identifier).escapedText;
      if (name !== '$au') return member;

      const modifiers = getCombinedModifierFlags(member);
      if ((modifiers & ModifierFlags.Static) === 0) return member;

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

function findResource(node: Node, expectedResourceName: string, filePair: string | undefined, code: string): IFoundResource | void {
  // defineElement
  if (isExpressionStatement(node)) {
    const pos = ensureTokenStart(node.pos, code);
    const statement = code.slice(pos, node.end);
    if (!statement.startsWith('defineElement')) return;
    const sf = createSourceFile('temp.ts', statement, ScriptTarget.Latest);
    const result = transform(sf, [createDefineElementTransformer()]);
    const modifiedContent = createPrinter().printFile(result.transformed[0]);
    return {
      defineElementInformation: {
        position: { pos, end: node.end },
        modifiedContent
      }
    };
  }

  if (!isClassDeclaration(node)) return;
  if (!node.name) return;
  if (!isExported(node)) return;
  const pos = ensureTokenStart(node.pos, code);

  const className = node.name.text;
  const { name, type } = nameConvention(className);
  const isImplicitResource = isKindOfSame(name, expectedResourceName);
  const foundType = findDecoratedResourceType(node);

  if (foundType) {
    // Explicitly decorated resource
    if (
      !isImplicitResource &&
      foundType.type !== 'customElement'
    ) {
      return {
        localDep: className
      };
    }

    if (
      isImplicitResource &&
      foundType.type === 'customElement' &&
      foundType.expression.arguments.length === 1 &&
      isStringLiteral(foundType.expression.arguments[0])
    ) {
      // @customElement('custom-name')
      const decorator = foundType.expression;
      const customName = decorator.arguments[0];
      return {
        className,
        implicitStatement: { pos: pos, end: node.end },
        customElementDecorator: {
          position: { pos: ensureTokenStart(decorator.pos, code), end: decorator.end },
          namePosition: { pos: ensureTokenStart(customName.pos, code), end: customName.end }
        },
        runtimeImportName: filePair ? 'defineElement' : undefined
      };
    }
  } else {
    if (type === 'customElement') {
      // Custom element can only be implicit resource
      if (isImplicitResource && filePair) {
        return {
          className,
          implicitStatement: { pos: pos, end: node.end },
          runtimeImportName: 'defineElement'
        };
      }
    } else {
      let resourceDefinitionStatement: string | undefined;
      let runtimeImportName: string | undefined;
      switch (type) {
        case 'customAttribute':
          resourceDefinitionStatement = `\ndefineAttribute('${name}', ${className});\n`;
          runtimeImportName = 'defineAttribute';
          break;

        case 'templateController':
          resourceDefinitionStatement = `\ndefineAttribute({ name: '${name}', isTemplateController: true }, ${className});\n`;
          runtimeImportName = 'defineAttribute';
          break;

        case 'valueConverter':
          resourceDefinitionStatement = `\nValueConverter.define('${name}', ${className});\n`;
          runtimeImportName = 'ValueConverter';
          break;

        case 'bindingBehavior':
          resourceDefinitionStatement = `\nBindingBehavior.define('${name}', ${className});\n`;
          runtimeImportName = 'BindingBehavior';
          break;

        case 'bindingCommand':
          resourceDefinitionStatement = `\nBindingCommand.define('${name}', ${className});\n`;
          runtimeImportName = 'BindingCommand';
          break;
      }
      const result: IFoundResource = {
        needDefinition: resourceDefinitionStatement ? [node.end, resourceDefinitionStatement] : void 0,
        localDep: className,
      };

      if (runtimeImportName) {
        result.runtimeImportName = runtimeImportName;
      }

      return result;
    }
  }
}
