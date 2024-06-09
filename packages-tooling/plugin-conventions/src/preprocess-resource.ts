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
  isPropertyAccessExpression,
  isPropertyDeclaration,
  isNamedImports,
  isStringLiteral,
  transform,
  visitEachChild,
  visitNode,
  factory: {
    createIdentifier,
    createObjectLiteralExpression,
    createPropertyAssignment,
    createSpreadAssignment,
    updateCallExpression,
    updateClassDeclaration,
    updateExpressionStatement,
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

type ReplaceableDecorator = {
  isDefinitionPart: boolean;
  position: IPos;
  modifiedContent: string;
};

type BindableDecorator = ReplaceableDecorator & {
  isClassDecorator: boolean;
};

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
  className?: string;
  localDep?: string;
  modification?: Modification;
  implicitStatement?: IPos;
  runtimeImportName?: string;
  customElementDecorator?: CustomElementDecorator;
  defineElementInformation?: DefineElementInformation;
}

interface IResourceDecorator {
  type: ResourceType;
  expression: CallExpression;
}

interface IModifyResourceOptions {
  exportedClassName?: string;
  implicitElement?: IPos;
  localDeps: string[];
  modifications: Modification[];
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

    // Only care about export class Foo {...}.
    // Note this convention simply doesn't work for
    //   class Foo {}
    //   export {Foo};
    const resource = findResource(s, expectedResourceName, unit.filePair, unit.contents);
    if (!resource) return;
    const {
      className,
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
      modifications,
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
    modifications,
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
        const pos = implicitElement.pos;
        // When in-file deps are used, move the body of custom element to end of the file,
        // in order to avoid TS2449: Class '...' used before its declaration.
        if (customElementDecorator) {
          // @customElement('custom-name') CLASS -> CLASS CustomElement.define({ ...viewDef, name: 'custom-name', dependencies: [ ...viewDef.dependencies, ...localDeps ] }, exportedClassName);
          const elementStatement = unit.contents.slice(customElementDecorator.position.end, implicitElement.end);
          m.replace(pos, implicitElement.end, '');
          const name = unit.contents.slice(customElementDecorator.namePosition.pos, customElementDecorator.namePosition.end);
          m.append(`\n${elementStatement}\nCustomElement.define({ ...${viewDef}, name: ${name}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ] }, ${exportedClassName});\n`);// ${decoratorStatements}${bindableStatements}
        } else {
          // CLASS -> CLASS CustomElement.define({ ...viewDef, dependencies: [ ...viewDef.dependencies, ...localDeps ] }, exportedClassName);
          const elementStatement = unit.contents.slice(pos, implicitElement.end);
          m.replace(pos, implicitElement.end, '');
          m.append(`\n${elementStatement}\nCustomElement.define({ ...${viewDef}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ] }, ${exportedClassName});\n`);// ${decoratorStatements}${bindableStatements}
        }
      } else {
        if (customElementDecorator) {
          // @customElement('custom-name') CLASS -> CLASS CustomElement.define({ ...viewDef, name: 'custom-name' }, exportedClassName);
          const name = unit.contents.slice(customElementDecorator.namePosition.pos, customElementDecorator.namePosition.end);
          m.replace(customElementDecorator.position.pos - 1, customElementDecorator.position.end, '');
          m.insert(implicitElement.end, `\nCustomElement.define({ ...${viewDef}, name: ${name} }, ${exportedClassName});\n`); // ${decoratorStatements}${bindableStatements}
        } else {
          // CLASS -> CLASS CustomElement.define(viewDef, exportedClassName);
          let sb = viewDef;
          if (sb.startsWith('...')) {
            sb = `{ ${sb} }`;
          }
          m.insert(implicitElement.end, `\nCustomElement.define(${sb}, ${exportedClassName});\n`);
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

const KNOWN_RESOURCE_DECORATORS = ['customElement', 'customAttribute', 'valueConverter', 'bindingBehavior', 'bindingCommand', 'templateController'];

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

    const propertyAccessExpression = callExpression.expression;
    if (
      !isPropertyAccessExpression(propertyAccessExpression)
      || !(isIdentifier(propertyAccessExpression.expression) && propertyAccessExpression.expression.escapedText === 'CustomElement')
      || !(isIdentifier(propertyAccessExpression.name) && propertyAccessExpression.name.escapedText === 'define')
    ) return node;

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
    const newCallExpression = updateCallExpression(callExpression, propertyAccessExpression, undefined, [newDefinition, className]);
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
  // CustomElement.define
  if (isExpressionStatement(node)) {
    const statement = getText(node, code);
    if (!statement.startsWith('CustomElement.define')) return;
    const sf = createSourceFile('temp.ts', statement, ScriptTarget.Latest);
    const result = transform(sf, [createDefineElementTransformer()]);
    const modifiedContent = createPrinter().printFile(result.transformed[0]);
    return {
      defineElementInformation: {
        position: getPosition(node, code),
        modifiedContent
      }
    };
  }

  if (!isClassDeclaration(node) || !node.name || !isExported(node)) return;
  const pos = ensureTokenStart(node.pos, code);

  const className = node.name.text;
  const { name, type } = nameConvention(className);
  const isImplicitResource = isKindOfSame(name, expectedResourceName);

  const resourceType = collectClassDecorators(node);

  if (resourceType) {
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
      isImplicitResource &&
      resourceType.type === 'customElement' &&
      resourceType.expression.arguments.length === 1 &&
      isStringLiteral(resourceType.expression.arguments[0])
    ) {
      // @customElement('custom-name')
      const decorator = resourceType.expression;
      const customName = decorator.arguments[0];
      return {
        type: resourceType.type,
        className,
        implicitStatement: { pos: pos, end: node.end },
        customElementDecorator: {
          position: getPosition(decorator, code),
          namePosition: getPosition(customName, code)
        },
        runtimeImportName: filePair ? 'CustomElement' : undefined,
      };
    }
  } else {
    let resourceDefinitionStatement: string | undefined = '';
    let runtimeImportName: string | undefined;
    switch (type) {
      case 'customElement': {
        if (!isImplicitResource || !filePair) return;
        return {
          type: 'customElement',
          className,
          implicitStatement: { pos: pos, end: node.end },
          runtimeImportName: 'CustomElement',
        };
      }
      case 'customAttribute':
        resourceDefinitionStatement = createDefinitionStatement('ca');
        runtimeImportName = 'CustomAttribute';
        break;

      case 'templateController':
        resourceDefinitionStatement = createDefinitionStatement('tc');
        runtimeImportName = 'CustomAttribute';
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
      type,
      modification: {
        insert: resourceDefinitionStatement ? [[node.end, resourceDefinitionStatement]] : void 0
      },
      localDep: className,
    };

    if (runtimeImportName) {
      result.runtimeImportName = runtimeImportName;
    }

    return result;
  }

  function createDefinitionStatement(type: 'ca' | 'tc'): string {
    const superDefnIdentifier = `sup${className}Defn`;
    const superDefnStatement = `\nlet ${superDefnIdentifier} = { bindables: {} };\ntry { ${superDefnIdentifier} = CustomAttribute.getDefinition(${className}.prototype.constructor); } catch { /*ignore*/ }\n`;
    const bindableOption = `, bindables: { ...${superDefnIdentifier}.bindables }`;
    switch (type) {
      case 'ca': return `${superDefnStatement}CustomAttribute.define({ name: '${name}'${bindableOption} }, ${className});\n`;
      case 'tc': return `${superDefnStatement}CustomAttribute.define({ name: '${name}', isTemplateController: true${bindableOption} }, ${className});\n`;
    }
  }
}

function collectClassDecorators(node: ClassDeclaration): IResourceDecorator | undefined {

  // gather decorator information
  let resourceType: IResourceDecorator | undefined;
  // later these decorators will be replaced with the modified content

  if (!canHaveDecorators(node)) return resourceType;
  const decorators = getDecorators(node) ?? [];
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
    if (name == null) continue;

    if (KNOWN_RESOURCE_DECORATORS.includes(name)) {
      if (resourceExpression == null) continue;
      resourceType = {
        type: name as ResourceType,
        expression: resourceExpression
      };
      continue;
    }
  }

  return resourceType;
}

function getText(node: Node, code: string, offset = 0) {
  return code.slice(ensureTokenStart(node.pos + offset, code), node.end);
}

function getPosition(node: Node, code: string): IPos {
  return { pos: ensureTokenStart(node.pos, code), end: node.end };
}
