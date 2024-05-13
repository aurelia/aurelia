import {
  type CallExpression,
  type Statement,
  type Node,
  type SourceFile,
  type TransformerFactory,
  type ExpressionStatement,
  type ClassDeclaration,
  type Identifier,
  type Decorator,
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
  isArrayLiteralExpression,
  isCallExpression,
  isClassDeclaration,
  isExpressionStatement,
  isIdentifier,
  isImportDeclaration,
  isObjectLiteralExpression,
  isPropertyAccessExpression,
  isPropertyDeclaration,
  isNamedImports,
  isSpreadElement,
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
  ceDecorators?: ReplaceableDecorator[];
  bindables?: BindableDecorator[];
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
  ceDecorators?: ReplaceableDecorator[];
  ceBindables?: BindableDecorator[];
}

interface DecoratorInformation {
  resourceType: IResourceDecorator | undefined;
  decorators: ReplaceableDecorator[];
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
  let ceDecorators: ReplaceableDecorator[] | undefined;
  let ceBindables: BindableDecorator[] | undefined;

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
      ceDecorators: $ceDecorators,
      bindables: $bindables
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
    if ($ceDecorators) ceDecorators = $ceDecorators;
    if ($bindables?.length && resource.type === 'customElement') ceBindables = $bindables;
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
      ceDecorators,
      ceBindables,
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
    ceDecorators,
    ceBindables,
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
        // this is needed to avoid conflicting code modification
        if (ceBindables?.find((ceb) => !ceb.isClassDecorator) != null) throw new Error(
          `@bindable decorators on fields are not supported by the convention plugin, when there are local dependencies (${localDeps.join(',')}) found.
Either move the dependencies to another source file, or consider using @bindable(string) decorator on class level.`);
        // eslint-disable-next-line prefer-const
        let { statement: decoratorStatements, effectivePos: pos } = processDecorators(ceDecorators, implicitElement.pos, m);
        let bindableStatements = '';
        ({ statement: bindableStatements, effectivePos: pos } = processBindables(ceBindables, pos, m, viewDef));

        // When in-file deps are used, move the body of custom element to end of the file,
        // in order to avoid TS2449: Class '...' used before its declaration.
        if (customElementDecorator) {
          // @customElement('custom-name') CLASS -> CLASS CustomElement.define({ ...viewDef, name: 'custom-name', dependencies: [ ...viewDef.dependencies, ...localDeps ] }, exportedClassName);
          const elementStatement = unit.contents.slice(customElementDecorator.position.end, implicitElement.end);
          m.replace(pos, implicitElement.end, '');
          const name = unit.contents.slice(customElementDecorator.namePosition.pos, customElementDecorator.namePosition.end);
          m.append(`\n${elementStatement}\nCustomElement.define({ ...${viewDef}, name: ${name}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ]${decoratorStatements}${bindableStatements} }, ${exportedClassName});\n`);
        } else {
          // CLASS -> CLASS CustomElement.define({ ...viewDef, dependencies: [ ...viewDef.dependencies, ...localDeps ] }, exportedClassName);
          const elementStatement = unit.contents.slice(pos, implicitElement.end);
          m.replace(pos, implicitElement.end, '');
          m.append(`\n${elementStatement}\nCustomElement.define({ ...${viewDef}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ]${decoratorStatements}${bindableStatements} }, ${exportedClassName});\n`);
        }
      } else {
        const pos = implicitElement.pos;
        const { statement: decoratorStatements } = processDecorators(ceDecorators, pos, m);
        const { statement: bindableStatements } = processBindables(ceBindables, pos, m, viewDef);
        if (customElementDecorator) {
          // @customElement('custom-name') CLASS -> CLASS CustomElement.define({ ...viewDef, name: 'custom-name' }, exportedClassName);
          const name = unit.contents.slice(customElementDecorator.namePosition.pos, customElementDecorator.namePosition.end);
          m.replace(customElementDecorator.position.pos - 1, customElementDecorator.position.end, '');
          m.insert(implicitElement.end, `\nCustomElement.define({ ...${viewDef}, name: ${name}${decoratorStatements}${bindableStatements} }, ${exportedClassName});\n`);
        } else {
          // CLASS -> CLASS CustomElement.define(viewDef, exportedClassName);
          let sb = viewDef;
          if (decoratorStatements) {
            sb = `...${sb}${decoratorStatements}`;
          }
          if (bindableStatements) {
            sb = `${(sb.startsWith('...') ? '' : '...')}${sb}${bindableStatements}`;
          }
          if (sb.startsWith('...')) {
            sb = `{ ${sb} }`;
          }
          m.insert(implicitElement.end, `\nCustomElement.define(${sb}, ${exportedClassName});\n`);
        }
      }
    }

    for (const d of (ceDecorators ?? [])) {
      if (d.isDefinitionPart) continue;
      const end = d.position.end;
      m.insert(implicitElement.end, d.modifiedContent);
      m.replace(d.position.pos, end, '');
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

function processDecorators(decorators: ReplaceableDecorator[] | undefined, classPos: number, m: ReturnType<typeof modifyCode>): { statement: string; effectivePos: number } {
  let statement = '';
  if (decorators == null) return { statement, effectivePos: classPos };
  for (const d of decorators) {
    if (!d.isDefinitionPart) continue;
    const end = d.position.end;
    m.replace(d.position.pos, end, '');
    statement += `, ${d.modifiedContent}`;
    classPos = Math.max(classPos, end);
  }
  return { statement, effectivePos: classPos };
}

function processBindables(bindables: BindableDecorator[] | undefined, classPos: number, m: ReturnType<typeof modifyCode>, viewDef: string): { statement: string; effectivePos: number } {
  let statement = '';
  if (!bindables) return { statement, effectivePos: classPos };
  const statements: string[] = [];
  for (const ceb of bindables) {
    const end = ceb.position.end;
    m.replace(ceb.position.pos, end, '');
    statements.push(ceb.modifiedContent);
    classPos = Math.max(classPos, end);
  }
  if (statements.length > 0) {
    statement = `, bindables: [ ...${viewDef}.bindables, ${statements.join(', ')} ]`;
  }
  return { statement, effectivePos: classPos };
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

  const { resourceType, decorators } = collectClassDecorators(node, code);

  const bindables: BindableDecorator[] = collectBindables(node, code);

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
        ceDecorators: decorators,
        bindables
      };
    }
  } else {
    let resourceDefinitionStatement: string | undefined = '';
    let runtimeImportName: string | undefined;
    switch (type) {
      case 'customElement': {
        if (!isImplicitResource || !filePair) {
          const { content, remove } = rewriteNonDefinitionDecorators();
          if (!content && !remove.length) return;
          return {
            modification: {
              remove,
              insert: content ? [[node.end, content]] : void 0
            }
          };
        }
        return {
          type: 'customElement',
          className,
          implicitStatement: { pos: pos, end: node.end },
          runtimeImportName: 'CustomElement',
          ceDecorators: decorators,
          bindables
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
    const remove = bindables.map(b => b.position);
    const { content: additionalContent, remove: $remove  } = rewriteNonDefinitionDecorators();
    remove.push(...$remove);

    const insertContent = `${resourceDefinitionStatement}${additionalContent}`;
    const result: IFoundResource = {
      type,
      modification: {
        remove,
        insert: insertContent ? [[node.end, insertContent]] : void 0
      },
      localDep: className,
    };

    if (runtimeImportName) {
      result.runtimeImportName = runtimeImportName;
    }

    return result;
  }

  function createDefinitionStatement(type: 'ca' | 'tc'): string {
    const bindableStatements = bindables.map(x => x.modifiedContent).join(', ');
    const bindableOption = bindableStatements ? `, bindables: [ ${bindableStatements} ]` : '';
    switch (type) {
      case 'ca': return `\nCustomAttribute.define(${(bindableOption ? `{ name: '${name}'${bindableOption} }` : `'${name}'`)}, ${className});\n`;
      case 'tc': return `\nCustomAttribute.define({ name: '${name}', isTemplateController: true${bindableOption} }, ${className});\n`;
    }
  }
  function rewriteNonDefinitionDecorators() {
    const remove: IPos[] = [];
    let content = '';
    for (const d of decorators) {
      if (d.isDefinitionPart) continue;
      remove.push(d.position);
      content += `\n${d.modifiedContent}`;
    }
    return { remove, content };
  }
}

function collectClassDecorators(node: ClassDeclaration, code: string): DecoratorInformation {

  // gather decorator information
  let resourceType: IResourceDecorator | undefined;
  // later these decorators will be replaced with the modified content
  const ceDecorators: ReplaceableDecorator[] = [];

  if (!canHaveDecorators(node)) return { resourceType, decorators: ceDecorators };
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

    let isDefinitionPart = true;
    let modifiedContent: string | undefined;
    switch (name) {
      case 'containerless':
        modifiedContent = 'containerless: true';
        break;

      case 'useShadowDOM':
        modifiedContent = `shadowOptions: ${getFirstArgumentOrDefault(d, '{ mode: \'open\' }')}`;
        break;

      case 'capture':
        modifiedContent = `capture: ${getFirstArgumentOrDefault(d, 'true')}`;
        break;

      case 'alias': {
        if (!isCallExpression(d.expression)) continue;

        const args = d.expression.arguments;
        const numArgs = args.length;
        if (numArgs === 0) continue;

        let ceDefinitionOptions: string | undefined;
        if (numArgs === 1) {
          // this can be a string literal, identifier, or a spread element
          const firstArg = args[0];
          if (isStringLiteral(firstArg) || isIdentifier(firstArg)) ceDefinitionOptions = `[${getText(firstArg, code)}]`;
          else if (isSpreadElement(firstArg) && isArrayLiteralExpression(firstArg.expression)) ceDefinitionOptions = `${getText(firstArg, code, 3)}`;
          else continue;
        } else {
          let unexpectedArgument = false;
          const aliases: string[] = [];
          for (let i = 0; i < numArgs; i++) {
            const arg = args[i];
            if (!isStringLiteral(arg) && !isIdentifier(arg)) {
              unexpectedArgument = true;
              break;
            }
            aliases.push(getText(arg, code));
          }
          if (unexpectedArgument || aliases.length === 0) continue;
          ceDefinitionOptions = `[${aliases.join(', ')}]`;
        }

        modifiedContent = `aliases: ${ceDefinitionOptions}`;
        break;
      }

      case 'inject': {
        if (!isCallExpression(d.expression)) continue;

        isDefinitionPart = false;
        modifiedContent = `Reflect.defineProperty(${getText(node.name!, code)}, 'inject', { value: [${d.expression.arguments.map(a => getText(a, code)).join(', ')}], writable: true, configurable: true, enumerable: true });`;
        break;
      }
    }
    if (modifiedContent != null) {
      ceDecorators.push({ isDefinitionPart, position: getPosition(d, code), modifiedContent });
    }
  }

  return { resourceType, decorators: ceDecorators };

  function getFirstArgumentOrDefault(decorator: Decorator, defaultValue: string) {
    if (!isCallExpression(decorator.expression) || decorator.expression.arguments.length === 0) return defaultValue;
    const argument = decorator.expression.arguments[0];
    return getText(argument, code);
  }
}

function collectBindables(node: ClassDeclaration, code: string): BindableDecorator[] {
  const bindables: BindableDecorator[] = [];

  // class-level decorators
  if (canHaveDecorators(node)) {
    for (const decorator of (getDecorators(node) ?? [])) {
      const de = decorator.expression;
      if (!isCallExpression(de)) continue;

      const decoratorName = getText(de.expression, code);
      if (decoratorName !== 'bindable') continue;

      const args = de.arguments;
      if (args.length !== 1) throw new Error(`Invalid @bindable class-level decorator found at position ${decorator.pos}. Did you forget to provide a property name?`);

      bindables.push({
        isDefinitionPart: true,
        isClassDecorator: true,
        position: getPosition(decorator, code),
        modifiedContent: getText(args[0], code)
      });
    }
  }

  // field-level decorators
  for (const member of node.members) {
    if (!isPropertyDeclaration(member) || !canHaveDecorators(member)) continue;
    const decorators = getDecorators(member);
    if (decorators == null || decorators.length === 0) continue;
    for (const decorator of decorators) {
      const de = decorator.expression;

      if (isIdentifier(de)) {
        const decoratorName = getText(de, code);
        if (decoratorName !== 'bindable') continue;
        // case 1: @bindable x
        bindables.push({
          isDefinitionPart: true,
          isClassDecorator: false,
          position: getPosition(decorator, code),
          modifiedContent: `'${getText(member.name, code)}'`
        });
      } else if (isCallExpression(de)) {
        const decoratorName = getText(de.expression, code);
        if (decoratorName !== 'bindable') continue;

        const args = de.arguments;
        // case 2: @bindable() x
        if (args.length === 0) {
          bindables.push({
            isDefinitionPart: true,
            isClassDecorator: false,
            position: getPosition(decorator, code),
            modifiedContent: `'${getText(member.name, code)}'`
          });
        } else if (args.length === 1) {
          // case 3: @bindable({...}) x
          const definition = getText(args[0], code);
          const name = getText(member.name, code);
          bindables.push({
            isDefinitionPart: true,
            isClassDecorator: false,
            position: getPosition(decorator, code),
            modifiedContent: `{ name: '${name}', ...${definition} }`
          });
        } else throw new Error(`Invalid @bindable field-level decorator found at position ${decorator.pos}. Expected 0 or 1 argument, got ${args.length} instead.`);
      }
    }
  }
  return bindables;
}

function getText(node: Node, code: string, offset = 0) {
  return code.slice(ensureTokenStart(node.pos + offset, code), node.end);
}

function getPosition(node: Node, code: string): IPos {
  return { pos: ensureTokenStart(node.pos, code), end: node.end };
}
