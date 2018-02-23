import * as ts from 'typescript';
import { bindingMode, TemplateFactory, TemplateFactoryBinding } from './interfaces'
import * as AST from './ast';

const AstNames = Object.getOwnPropertyNames(AST).filter(ast => ast !== 'Expression');

export interface ModuleExportedElements {
  name: string
}

export class Transformer {

  constructor(
    public templateFactory: TemplateFactory
  ) {

  }

  public context: ts.TransformationContext;
  public hasExportedElement: boolean = false;
  public exportedElements: ModuleExportedElements[] = [];

  private fileVisitor = (file: ts.SourceFile) => {
    file = ts.visitEachChild(file, this.nodeVisitor, this.context);
    let observedProperties = Array.from(new Set<string>(this.templateFactory.bindings.reduce(
      (props, binding) => props.concat(binding[2].observedProperties),
      []
    )));
    let exportedElements = this.exportedElements.map(el => {
      const baseClassName = `$${el.name}`;
      return ts.createClassDeclaration(
        undefined,
        undefined,
        baseClassName,
        undefined,
        undefined,
        [
          ts.createProperty(
            undefined,
            undefined,
            '$observers',
            undefined,
            undefined,
            ts.createObjectLiteral(
              observedProperties.map(op => ts.createPropertyAssignment(
                op,
                ts.createNew(ts.createIdentifier('Observer'), [], [ts.createLiteral('')])
              )),
              /* multiline */true
            )
          ),
          ts.createProperty(
            undefined,
            undefined,
            '$html',
            undefined,
            undefined,
            ts.createLiteral(this.templateFactory.html)
          ),
          ...observedProperties.reduce((propDeclarations, op) => {
            return propDeclarations.concat([
              ts.createGetAccessor(
                undefined,
                undefined,
                op,
                undefined,
                undefined,
                ts.createBlock([
                  ts.createReturn(
                    ts.createCall(
                      ts.createPropertyAccess(
                        ts.createPropertyAccess(
                          ts.createThis(),
                          '$observer'
                        ),
                        'getValue'
                      ), [], []
                    )
                  )
                ])
              ),
              ts.createSetAccessor(
                undefined,
                undefined,
                op,
                [
                  ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    'value',
                    undefined,
                    undefined,
                    undefined
                  )
                ],
                ts.createBlock([
                  ts.createStatement(
                    ts.createCall(
                      ts.createPropertyAccess(
                        ts.createPropertyAccess(
                          ts.createThis(),
                          '$observer'
                        ),
                        'setValue'
                      ), [],
                      [
                        ts.createIdentifier('value')
                      ]
                    )
                  )
                ])
              )
            ]);
          }, [])

        ]
      );
    });
    return ts.updateSourceFileNode(file, [
      ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
          undefined,
          ts.createNamedImports(AstNames.map(ast => ts.createImportSpecifier(
            undefined,
            ts.createIdentifier(ast)
          )))
        ),
        ts.createLiteral('./core')
      ),
      ...exportedElements,
      ...file.statements
    ]);
  }

  private nodeVisitor = (node: ts.Node): ts.Node => {
    if (this.isExportedClass(node)) {
      this.exportedElements = this.exportedElements || [];
      let exportedElement = this.exportedElements.find(e => e.name === node.name.escapedText);
      if (!exportedElement) {
        exportedElement = { name: node.name.escapedText.toString() };
        this.exportedElements.push(exportedElement);
      }
      return this.updateClass(node);
    }
    return ts.visitEachChild(node, this.nodeVisitor, this.context);
  }

  transform = (context: ts.TransformationContext) => {
    this.context = context;
    return this.fileVisitor;
  }

  updateClass(node: ts.ClassDeclaration) {
    return ts.updateClassDeclaration(
      node,
      [...(Array.isArray(node.decorators) ? node.decorators : [])],
      [...node.modifiers],
      node.name,
      undefined,
      [
        ts.createHeritageClause(
          ts.SyntaxKind.ExtendsKeyword,
          [
            ts.createExpressionWithTypeArguments(
              undefined,
              ts.createIdentifier(`$${node.name.escapedText.toString()}`)
            )
          ]
        ),
      ],
      [...node.members]
    );
  }

  generateViewClass(file: ts.SourceFile) {

  }

  private isExportedClass(node: ts.Node): node is ts.ClassDeclaration & ts.ExportDeclaration {
    return node.kind === ts.SyntaxKind.ClassDeclaration
      && ((ts.getCombinedModifierFlags(node)
        | ts.ModifierFlags.Export) === ts.ModifierFlags.Export
      );
  }
}
