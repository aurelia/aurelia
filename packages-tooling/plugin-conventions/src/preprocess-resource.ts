import {
  type TransformerFactory,
  type CallExpression,
  type Node,
  type ObjectLiteralExpression,
  type SourceFile,
  type ClassDeclaration,
  type Identifier,
  type PropertyDeclaration,
} from 'typescript';
import { type ModifyCodeResult } from 'modify-code';
import { nameConvention } from './name-convention';
import { IFileUnit, IPreprocessOptions, ResourceType } from './options';
import { resourceName } from './resource-name';

import pkg from 'typescript';
import { modifyCode } from './modify-code';
import { kebabCase } from '@aurelia/kernel';
const {
  ModifierFlags,
  createSourceFile,
  ScriptTarget,
  isStringLiteral,
  isClassDeclaration,
  canHaveModifiers,
  getModifiers,
  SyntaxKind,
  canHaveDecorators,
  getDecorators,
  isCallExpression,
  isIdentifier,
  getCombinedModifierFlags,
  visitNode,
  visitEachChild,
  transform,
  createPrinter,
  factory,
} = pkg;
const {
  createSpreadAssignment,
  createIdentifier,
  createObjectLiteralExpression,
  updatePropertyDeclaration,
  updateClassDeclaration
} = factory;

interface IPos {
  pos: number;
  end: number;
}

interface Decorator {
  position: IPos;
  namePosition: IPos;
}

interface AuResource {
  definition: string;
  position: IPos;
}

interface IFoundResource {
  className: string;
  localDep?: string;
  implicitStatement?: IPos;
  customElementDecorator?: Decorator;
  auResource?: AuResource;
}

interface IFoundDecorator {
  type: ResourceType;
  expression: CallExpression;
}

interface IModifyResourceOptions {
  exportedClassName?: string;
  implicitElement?: IPos;
  localDeps: string[];
  customElementDecorator?: Decorator;
  transformHtmlImportSpecifier?: (path: string) => string;
  auResources: AuResource[];
}

export function preprocessResource(unit: IFileUnit, options: IPreprocessOptions): ModifyCodeResult {
  const expectedResourceName = resourceName(unit.path);
  const sf = createSourceFile(unit.path, unit.contents, ScriptTarget.Latest);
  let exportedClassName: string | undefined;
  const auResources: AuResource[] = [];

  let implicitElement: IPos | undefined;
  let customElementDecorator: Decorator | undefined; // for @customName('custom-name')

  // When there are multiple exported classes (e.g. local value converters),
  // they might be deps for composing the main implicit custom element.
  const localDeps: string[] = [];

  sf.statements.forEach(s => {
    // Only care about export class Foo {...}.
    // Note this convention simply doesn't work for
    //   class Foo {}
    //   export {Foo};
    const resource = findResource(s, expectedResourceName, unit.filePair, unit.isViewPair, unit.contents);
    if (!resource) return;
    const {
      className,
      localDep,
      implicitStatement,
      customElementDecorator: customName,
      auResource
    } = resource;

    if (localDep) localDeps.push(localDep);
    if (implicitStatement) implicitElement = implicitStatement;
    if (className && options.hmr && process.env.NODE_ENV !== 'production') {
      exportedClassName = className;
    }
    if (customName) customElementDecorator = customName;
    if (auResource) auResources.push(auResource);
  });

  let m = modifyCode(unit.contents, unit.path);

  if (options.enableConventions) {
    m = modifyResource(unit, m, {
      exportedClassName,
      implicitElement,
      localDeps,
      customElementDecorator,
      auResources,
      transformHtmlImportSpecifier: options.transformHtmlImportSpecifier,
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
    customElementDecorator,
    transformHtmlImportSpecifier = s => s,
    auResources,
  } = options;

  if (implicitElement && unit.filePair) {

    const viewDef = '__au2ViewDef';
    m.prepend(`import * as ${viewDef} from './${transformHtmlImportSpecifier(unit.filePair)}';\n`);

    const elementStatement = unit.contents.slice(implicitElement.pos, implicitElement.end);
    if (elementStatement.includes('$au')) {
      const sf = createSourceFile('temp.ts', elementStatement, ScriptTarget.Latest);
      const result = transform(sf, [createAuResourceTransformer()]);
      const modified = createPrinter().printFile(result.transformed[0]);
      m.replace(implicitElement.pos, implicitElement.end, modified);
    } else if (localDeps.length) {
        // When in-file deps are used, move the body of custom element to end of the file,
        // in order to avoid TS2449: Class '...' used before its declaration.
        m.replace(implicitElement.pos, implicitElement.end, '');
        const beginningClassBody = elementStatement.indexOf('{');
        if (customElementDecorator) {
          // Overwrite element name
          const name = unit.contents.slice(customElementDecorator.namePosition.pos, customElementDecorator.namePosition.end);
          const modifiedContent = `${elementStatement.substring(elementStatement.indexOf('export class'), beginningClassBody + 1)
            }\nstatic $au = { type: 'custom-element', ...${viewDef}, name: ${name}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ] };\n${elementStatement.substring(beginningClassBody + 1)}`;
          m.append(modifiedContent);
        } else {
          const modifiedContent = `${elementStatement.substring(0, beginningClassBody + 1)
            }\nstatic $au = { type: 'custom-element', ...${viewDef}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ] };\n${elementStatement.substring(beginningClassBody + 1)}`;
          m.append(modifiedContent);
        }
    } else {
      const beginningClassBody = unit.contents.indexOf('{', implicitElement.pos) + 1;
      if (customElementDecorator) {
        // Overwrite element name
        const name = unit.contents.slice(customElementDecorator.namePosition.pos, customElementDecorator.namePosition.end);
        // remove he decorator
        m.replace(customElementDecorator.position.pos - 1, customElementDecorator.position.end, '');
        m.insert(beginningClassBody, `\nstatic $au = { type: 'custom-element', ...${viewDef}, name: ${name} };\n`);
      } else {
        m.insert(beginningClassBody, `\nstatic $au = { type: 'custom-element', ...${viewDef} };\n`);
      }
    }
  }

  auResources.forEach(auResource => {
    // Assumption: when someone is using the $au property, they are defining the resource completely and thus needs no modification.
    if (unit.contents.slice(auResource.position.pos, auResource.position.end).includes('$au')) return;
    const beginningClassBody = unit.contents.indexOf('{', auResource.position.pos) + 1;
    m.insert(beginningClassBody, auResource.definition);
  });
  return m;
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
      if (member.kind !== SyntaxKind.PropertyDeclaration) return member;

      const propertyDeclaration = member as PropertyDeclaration;
      const name = (propertyDeclaration.name as Identifier).escapedText;
      if (name !== '$au') return propertyDeclaration;

      const modifiers = getCombinedModifierFlags(propertyDeclaration);
      if ((modifiers & ModifierFlags.Static) === 0) return propertyDeclaration;

      const initializer = propertyDeclaration.initializer;
      if (!initializer || initializer.kind !== SyntaxKind.ObjectLiteralExpression) return propertyDeclaration;

      const spreadAssignment = createSpreadAssignment(createIdentifier('__au2ViewDef'));
      const newInitializer = createObjectLiteralExpression([spreadAssignment, ...(initializer as ObjectLiteralExpression).properties]);
      return updatePropertyDeclaration(
        propertyDeclaration,
        propertyDeclaration.modifiers,
        propertyDeclaration.name,
        propertyDeclaration.questionToken,
        propertyDeclaration.type,
        newInitializer);
    });
    return updateClassDeclaration(node, node.modifiers, node.name, node.typeParameters, node.heritageClauses, newMembers);
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
  if(modifiers === void 0) return false;
  for (const mod of modifiers) {
    if (mod.kind === SyntaxKind.ExportKeyword) return true;
  }
  return false;
}

const KNOWN_DECORATORS = ['view', 'customElement', 'customAttribute', 'valueConverter', 'bindingBehavior', 'bindingCommand', 'templateController'];

function findDecoratedResourceType(node: Node): IFoundDecorator | void {
  if (!canHaveDecorators(node)) return;
  const decorators = getDecorators(node);
  if(decorators === void 0) return;
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

function findResource(node: Node, expectedResourceName: string, filePair: string | undefined, isViewPair: boolean | undefined, code: string): IFoundResource | void {
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
        className,
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
          namePosition: { pos: ensureTokenStart(customName.pos, code), end: customName.end}
        }
      };
    }

    return {
      className,
    };

  } else {
    if (type === 'customElement') {
      // Custom element can only be implicit resource
      if (isImplicitResource && filePair) {
        return {
          className,
          implicitStatement: { pos: pos, end: node.end },
        };
      }
    } else {
      return {
        className,
        localDep: className,
        auResource: {
          definition: `\nstatic $au = { type: '${kebabCase(type)}', name: '${name}' };\n`,
          position: { pos: pos, end: node.end },
        },
      };
    }
  }
}
