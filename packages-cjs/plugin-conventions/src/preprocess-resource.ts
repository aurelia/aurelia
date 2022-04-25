import modifyCode, { ModifyCodeResult } from 'modify-code';
import { stringify } from 'querystring';
import * as ts from 'typescript';
import { nameConvention } from './name-convention.js';
import { IFileUnit, IPreprocessOptions, ResourceType } from './options.js';
import { resourceName } from './resource-name.js';

interface ICapturedImport {
  names: string[];
  start: number;
  end: number;
}

interface IPos {
  pos: number;
  end: number;
}

interface IFoundResource {
  className?: string;
  localDep?: string;
  needDecorator?: [number, string];
  implicitStatement?: IPos;
  runtimeImportName?: string;
  customName?: IPos;
}

interface IFoundDecorator {
  type: ResourceType;
  expression: ts.CallExpression;
}

interface IModifyResourceOptions {
  exportedClassName?: string;
  metadataImport: ICapturedImport;
  runtimeImport: ICapturedImport;
  implicitElement?: IPos;
  localDeps: string[];
  conventionalDecorators: [number, string][];
  customElementName?: IPos;
}

const hmrRuntimeModules = ['ICustomElementViewModel', 'CustomElement', 'LifecycleFlags', 'IHydrationContext', 'Controller'];
const hmrMetadataModules = ['Metadata'];

export function preprocessResource(unit: IFileUnit, options: IPreprocessOptions): ModifyCodeResult {
  const expectedResourceName = resourceName(unit.path);
  const sf = ts.createSourceFile(unit.path, unit.contents, ts.ScriptTarget.Latest);
  let exportedClassName: string | undefined;
  let auImport: ICapturedImport = { names: [], start: 0, end: 0 };
  let runtimeImport: ICapturedImport = { names: [], start: 0, end: 0 };
  let metadataImport: ICapturedImport = { names: [], start: 0, end: 0 };

  let implicitElement: IPos | undefined;
  let customElementName: IPos | undefined; // for @customName('custom-name')

  // When there are multiple exported classes (e.g. local value converters),
  // they might be deps for composing the main implicit custom element.
  const localDeps: string[] = [];
  const conventionalDecorators: [number, string][] = [];

  sf.statements.forEach(s => {
    // Find existing import Aurelia, {customElement, templateController} from 'aurelia';
    const au = captureImport(s, 'aurelia', unit.contents);
    if (au) {
      // Assumes only one import statement for @aurelia/runtime-html
      auImport = au;
      return;
    }

    // Find existing import {Metadata} from '@aurelia/metadata';
    const metadata = captureImport(s, '@aurelia/metadata', unit.contents);
    if (metadata) {
      // Assumes only one import statement for @aurelia/runtime-html
      metadataImport = metadata;
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
    const resource = findResource(s, expectedResourceName, unit.filePair, unit.isViewPair, unit.contents);
    if (!resource) return;
    const {
      className,
      localDep,
      needDecorator,
      implicitStatement,
      runtimeImportName,
      customName
    } = resource;

    if (localDep) localDeps.push(localDep);
    if (needDecorator) conventionalDecorators.push(needDecorator);
    if (implicitStatement) implicitElement = implicitStatement;
    if (runtimeImportName && !auImport.names.includes(runtimeImportName)) {
      ensureTypeIsExported(runtimeImport.names, runtimeImportName);
    }
    if (className) exportedClassName = className;
    hmrRuntimeModules.forEach(m => {
      if (!auImport.names.includes(m)) {
        ensureTypeIsExported(runtimeImport.names, m);
      }
    });
    hmrMetadataModules.forEach(m => {
      if (!auImport.names.includes(m)) {
        ensureTypeIsExported(metadataImport.names, m);
      }
    });
    if (customName) customElementName = customName;
  });

  return modifyResource(unit, {
    runtimeImport,
    metadataImport,
    exportedClassName,
    implicitElement,
    localDeps,
    conventionalDecorators,
    customElementName
  });
}

function modifyResource(unit: IFileUnit, options: IModifyResourceOptions) {
  const {
    metadataImport,
    exportedClassName,
    runtimeImport,
    implicitElement,
    localDeps,
    conventionalDecorators,
    customElementName
  } = options;

  const m = modifyCode(unit.contents, unit.path);
  if (implicitElement && unit.filePair) {
    // @view() for foo.js and foo-view.html
    // @customElement() for foo.js and foo.html
    const dec = unit.isViewPair ? 'view' : 'customElement';

    const viewDef = '__au2ViewDef';
    m.prepend(`import * as ${viewDef} from './${unit.filePair}';\n`);

    if (localDeps.length) {
      // When in-file deps are used, move the body of custom element to end of the file,
      // in order to avoid TS2449: Class '...' used before its declaration.
      const elementStatement = unit.contents.slice(implicitElement.pos, implicitElement.end);
      m.replace(implicitElement.pos, implicitElement.end, '');

      if (customElementName) {
        const name = unit.contents.slice(customElementName.pos, customElementName.end);
        // Overwrite element name
        m.append(`\n${elementStatement.substring(0, customElementName.pos - implicitElement.pos)}{ ...${viewDef}, name: ${name}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ] }${elementStatement.substring(customElementName.end - implicitElement.pos)}\n`);
      } else {
        m.append(`\n@${dec}({ ...${viewDef}, dependencies: [ ...${viewDef}.dependencies, ${localDeps.join(', ')} ] })\n${elementStatement}\n`);
      }
    } else {
      if (customElementName) {
        // Overwrite element name
        const name = unit.contents.slice(customElementName.pos, customElementName.end);
        m.replace(customElementName.pos, customElementName.end, `{ ...${viewDef}, name: ${name} }`);
      } else {
        conventionalDecorators.push([implicitElement.pos, `@${dec}(${viewDef})\n`]);
      }
    }
  }

  if (metadataImport.names.length) {
    let metadataImportStatement = `import { Metadata } from '@aurelia/metadata';`;
    if (metadataImport.end === metadataImport.start)
      metadataImportStatement += '\n';
    console.log(metadataImportStatement);
    m.replace(metadataImport.start, metadataImport.end, metadataImportStatement);
  }

  if (conventionalDecorators.length) {
    if (runtimeImport.names.length) {
      let runtimeImportStatement = `import { ${runtimeImport.names.join(', ')} } from '@aurelia/runtime-html';`;
      if (runtimeImport.end === runtimeImport.start) runtimeImportStatement += '\n';
      m.replace(runtimeImport.start, runtimeImport.end, runtimeImportStatement);
    }

    conventionalDecorators.forEach(([pos, str]) => m.insert(pos, str));
  }

  if (exportedClassName && process.env.NODE_ENV !== 'production') {
    const hmr = `
      if ((module as any).hot) {
          let aurelia = (module as any).hot.data?.aurelia;
          document.addEventListener('au-started', (event) => {aurelia= (event as any).detail; });
          const hot = (module as any).hot;
          const controllers: Controller<ICustomElementViewModel>[] = [];
          const ogCreated = (${exportedClassName}.prototype as any).created;

          (${exportedClassName}.prototype as any).created = (controller) => {
            ogCreated && ogCreated(controller);
            controllers.push(controller as Controller<ICustomElementViewModel>);
          }

          hot.accept();
          hot.dispose(function (data) {
            data.controllers = controllers;
            data.aurelia = aurelia;
          });

          if (hot.data?.aurelia) {

            const newDefinition = CustomElement.getDefinition(${exportedClassName});
            Metadata.define(newDefinition.name, newDefinition, ${exportedClassName});
            Metadata.define(newDefinition.name, newDefinition, newDefinition);
            (hot.data.aurelia.container as any).res[CustomElement.keyFrom(newDefinition.name)] = newDefinition;


            (hot.data.controllers as typeof controllers).forEach(controller => {
              const values = { ...controller.viewModel };
              const hydrationContext = controller.container.get(IHydrationContext)
              const hydrationInst = hydrationContext.instruction;

              Object.keys(values).forEach(key => {
                if (!controller.bindings?.some(y => (y as any).sourceExpression?.name === key && (y as any).targetProperty)) {
                  delete values[key];
                }
              });
              const h = (controller as any).host;
              delete (controller as any)._compiledDef;
              (controller.viewModel as any) = new ${exportedClassName}();
              (controller.definition as any) = newDefinition;
              Object.assign(controller.viewModel, values);
              (controller.hooks as any) = new (controller.hooks as any).constructor(controller.viewModel);
              (controller as any)._hydrateCustomElement(hydrationInst, hydrationContext);
              h.parentNode.replaceChild((controller as any).host, h);
              (controller as any).hostController = null;
              (controller as any).deactivate(controller, controller.parent ?? null, LifecycleFlags.none);
              (controller as any).activate(controller, controller.parent ?? null, LifecycleFlags.none);
            });
          }
        }`;
    m.append(hmr);
  }

  return m.transform();
}

function captureImport(s: ts.Statement, lib: string, code: string): ICapturedImport | void {
  if (ts.isImportDeclaration(s) &&
    ts.isStringLiteral(s.moduleSpecifier) &&
    s.moduleSpecifier.text === lib &&
    s.importClause &&
    s.importClause.namedBindings &&
    ts.isNamedImports(s.importClause.namedBindings)) {
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

function isExported(node: ts.Node): boolean {
  if (!node.modifiers) return false;
  for (const mod of node.modifiers) {
    if (mod.kind === ts.SyntaxKind.ExportKeyword) return true;
  }
  return false;
}

const KNOWN_DECORATORS = ['view', 'customElement', 'customAttribute', 'valueConverter', 'bindingBehavior', 'bindingCommand', 'templateController'];

function findDecoratedResourceType(node: ts.Node): IFoundDecorator | void {
  if (!node.decorators) return;
  for (const d of node.decorators) {
    if (!ts.isCallExpression(d.expression)) return;
    const exp = d.expression.expression;
    if (ts.isIdentifier(exp)) {
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

function findResource(node: ts.Node, expectedResourceName: string, filePair: string | undefined, isViewPair: boolean | undefined, code: string): IFoundResource | void {
  if (!ts.isClassDeclaration(node)) return;
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
      foundType.type !== 'customElement' &&
      foundType.type !== 'view'
    ) {
      return { localDep: className };
    }

    if (
      isImplicitResource &&
      foundType.type === 'customElement' &&
      foundType.expression.arguments.length === 1 &&
      ts.isStringLiteral(foundType.expression.arguments[0])
    ) {
      // @customElement('custom-name')
      const customName = foundType.expression.arguments[0] as ts.StringLiteral;
      return {
        className,
        implicitStatement: { pos: pos, end: node.end },
        customName: { pos: ensureTokenStart(customName.pos, code), end: customName.end }
      };
    }
  } else {
    if (type === 'customElement') {
      // Custom element can only be implicit resource
      if (isImplicitResource && filePair) {
        return {
          className,
          implicitStatement: { pos: pos, end: node.end },
          runtimeImportName: isViewPair ? 'view' : 'customElement'
        };
      }
    } else {
      const result: IFoundResource = {
        className,
        needDecorator: [pos, `@${type}('${name}')\n`],
        localDep: className,
      };

      result.runtimeImportName = type;

      return result;
    }
  }
}
