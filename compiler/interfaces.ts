import * as ts from 'typescript';
import { Expression, TemplateLiteral } from './ast'
import * as AST from './ast';
import { bindingMode, delegationStrategy, AbstractBinding } from './binding';

const AstNames = Object.getOwnPropertyNames(AST).filter(ast => ast !== 'Expression');

export enum bindingType {
  binding = 1,
  listener = 2,
  ref = 3,
  text = 4,
}

export { bindingMode, delegationStrategy };

export const ELEMENT_REF_KEY = 'element';

export interface TemplateFactoryBinding {
  0: /** targetIndex */ number,
  1: /** bindingType */ bindingType,
  2: /** expression */ Expression,
  3?: /** attr or Event or ref type */ string,
  4?: /** bindingMode */ bindingMode | delegationStrategy
};

export interface AstRegistryRecord {
  id: number;
  ast: Expression;
}

export class TemplateFactory {

  static astId: number = 1;
  static astRegistry: Record<string, AstRegistryRecord> = {};

  static addAst(expression: string, ast: Expression) {
    return this.astRegistry[expression]
      || (this.astRegistry[expression] = {
        id: this.astId++,
        ast
      });
  }

  // static emitAst(): string {
  //   const file = ts.createSourceFile('fake.js', '', ts.ScriptTarget.Latest);
  //   return [
  //     `export const getAst = id => Asts[id];`,
  //     `const Asts = { ${
  //     Object.keys(this.astRegistry)
  //       .map(exp => {
  //         let record = this.astRegistry[exp];
  //         return `${record.id}: ${record.ast.code.getText(file)}`;
  //       })
  //     }`
  //   ].join('\n');
  // }
  static emitAst(): ts.SourceFile {
    let file = ts.createSourceFile('src/asts.js', `/* Aurelia Compiler - auto generated file */`, ts.ScriptTarget.Latest, true);
    return ts.updateSourceFileNode(file, [
      ...file.statements,
      ts.createImportDeclaration(
        /*decorators*/ undefined,
        /*modifiers*/ undefined,
        ts.createImportClause(
          undefined,
          ts.createNamedImports(
            AstNames.map(n => ts.createImportSpecifier(undefined, ts.createIdentifier(n)))
          )
        ),
        ts.createLiteral('./framework/binding/ast')
      ),
      // ts.createExportAssignment(
      //   undefined,
      //   undefined,
      //   false,
      //   ts.createArrowFunction(
      //     [

      //     ],
      //     undefined,
      //     [
      //       ts.createParameter(
      //         undefined,
      //         undefined,
      //         undefined,
      //         'id'
      //       )
      //     ],
      //     undefined,
      //     ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      //     ts.createElementAccess(
      //       ts.createIdentifier('Asts'),
      //       ts.createIdentifier('id')
      //     )
      //   )
      // ),
      ts.createVariableStatement(
        /*modifiers*/
        [
          ts.createToken(ts.SyntaxKind.ExportKeyword)
        ],
        [
          ts.createVariableDeclaration(
            'getAst',
            /*type*/ undefined,
            ts.createArrowFunction(
              undefined,
              undefined,
              [
                ts.createParameter(
                  undefined,
                  undefined,
                  undefined,
                  'id'
                )
              ],
              undefined,
              ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              ts.createElementAccess(
                ts.createIdentifier('Asts'),
                ts.createIdentifier('id')
              )
            )
          )
        ]
      ),
      ts.createVariableStatement(
        /*modifiers*/ undefined,
        [
          ts.createVariableDeclaration(
            'Asts',
            /*type*/ undefined,
            ts.createObjectLiteral([
              ...Object.keys(this.astRegistry)
                .map(exp => {
                  let record = this.astRegistry[exp];
                  return ts.createPropertyAssignment(
                    ts.createLiteral(record.id),
                    record.ast.code
                  );
                })
            ], /*multiline*/ true)
          )
        ]
      )
    ]);
  }

  html: string = '';
  bindings: AbstractBinding[] = [];

  get observedProperties(): string[] {
    return Array.from(new Set<string>(this.bindings.reduce(
      (props, binding) => props.concat(binding.observedProperties),
      []
    )));
  }

  get lastTargetIndex() {
    const bindings = this.bindings;
    const lastBinding = bindings[bindings.length - 1];
    return lastBinding ? lastBinding.targetIndex : -1;
  }
}

export interface IInsepctionInfo {
  defaultBindingMode?: bindingMode;
  attrName?: string;
  attrValue?: string;
  command?: string;
}

export interface IBindingLanguage {
  inspectAttribute(
    elementName: Element,
    attrName: string,
    attrValue: string,
    targetIndex: number
  ): AbstractBinding;

  inspectTextContent(value: string): TemplateLiteral | null;
}

export interface ResourcesBag {
  attributes?: Record<string, any>;
  elements?: Record<string, any>;
}
