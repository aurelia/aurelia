import * as ts from 'typescript';
import { bindingMode, TemplateFactory, TemplateFactoryBinding } from './interfaces'
import * as AST from './ast';

const AstNames = Object.getOwnPropertyNames(AST).filter(ast => ast !== 'Expression');

export interface ModuleExportedElements {
  name: string
}

export class Transformer {

  observerPropName = '$observer';
  templatePropName = '$html';
  bindingPropName = '$binding';

  constructor(
    public templateFactory: TemplateFactory
  ) {

  }

  public context: ts.TransformationContext;
  public hasExportedElement: boolean = false;
  public exportedElements: ModuleExportedElements[] = [];

  private fileVisitor = (file: ts.SourceFile) => {
    file = ts.visitEachChild(file, this.nodeVisitor, this.context);
    let observedProperties = this.templateFactory.observedProperties;
    let exportedElements = this.exportedElements.map(el => {
      return ts.createClassDeclaration(
        /* decorators */ undefined,
        /* modifiers */ undefined,
        this.getViewClassName(el.name),
        /* type parameters */ undefined,
        /* heritage clauses */ undefined,
        /* members */
        [
          this.createObserverProp(observedProperties),
          this.createTemplateProp(),
          this.createBindingsProp(),
          ts.createMethod(
            /* decorators */ undefined,
            /* modifiers */ undefined,
            /* asterisk token */ undefined,
            'applyTo',
            /* question token */ undefined,
            /* type params */ undefined,
            [
              ts.createParameter(
                /* decorators */ undefined,
                /** modifiers */ undefined,
                /** ... */ undefined,
                'anchor',
                /** question token */ undefined,
                ts.createLiteralTypeNode(ts.createLiteral('Element')),
                /** initializer */ undefined
              )
            ],
            /** type */ undefined,
            ts.createBlock(
              /** statements */
              [
                ts.createReturn(ts.createThis())
              ],
              /** multiline */ true
            )
          ),
          ...observedProperties.reduce((propDeclarations, op) => {
            return propDeclarations.concat([
              this.createObserverGetter(op),
              this.createObserverSetter(op)
            ]);
          }, /* observed properties init value */[]),
        ]
      );
    });
    return ts.updateSourceFileNode(file, [
      this.createImport(['Observer'], './framework/binding/property-observation'),
      this.createImport(['Template'], './framework/templating/template'),
      this.createImport(['hydrateBindings'], './framework/generated'),
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

  private isExportedClass(node: ts.Node): node is ts.ClassDeclaration & ts.ExportDeclaration {
    return node.kind === ts.SyntaxKind.ClassDeclaration
      && ((ts.getCombinedModifierFlags(node)
        | ts.ModifierFlags.Export) === ts.ModifierFlags.Export
      );
  }

  private bindingToArrayNode(dehydrated: AST.dehydratedAst): ts.ArrayLiteralExpression {
    return ts.createArrayLiteral(dehydrated.map(v => {
      return Array.isArray(v) ? this.bindingToArrayNode(v) : ts.createLiteral(v);
    }));
  }

  private getViewClassName(viewModelClass: string) {
    return `$${viewModelClass}`;
  }

  private createImport(names: string[], moduleName: string) {
    return ts.createImportDeclaration(
      /* decorators */undefined,
      /* modifiers */ undefined,
      ts.createImportClause(
        /* default */ undefined,
        ts.createNamedImports(names.map(n => ts.createImportSpecifier(
          /* propertyName */ undefined,
          /* target name */ ts.createIdentifier(n)
        )))
      ),
      ts.createLiteral(moduleName)
    );
  }

  private createObserverProp(observedProperties: string[]) {
    return ts.createProperty(
      /* decorators */ undefined,
      /* modifiers */ undefined,
      this.observerPropName,
      /* question token */ undefined,
      /* type node */ undefined,
      ts.createObjectLiteral(
        observedProperties.map(op => ts.createPropertyAssignment(
          op,
          ts.createNew(
            ts.createIdentifier('Observer'),
            /* type arguments */ undefined,
            /* arguments */
            [
              ts.createLiteral('')
            ]
          )
        )),
        /* multiline */ true
      )
    );
  }

  private createTemplateProp() {
    return ts.createProperty(
      /* decorators */ undefined,
      [
        ts.createToken(ts.SyntaxKind.PublicKeyword),
        ts.createToken(ts.SyntaxKind.StaticKeyword)
      ],
      this.templatePropName,
      /* question token */ undefined,
      /* type node */ undefined,
      ts.createNew(
        ts.createIdentifier('Template'),
        /* type arguments */ undefined,
        /* arguments */
        [
          ts.createLiteral(this.templateFactory.html)
        ]
      )
    );
  }

  private createBindingsProp() {
    return ts.createProperty(
      /* decorators */ undefined,
      [
        ts.createToken(ts.SyntaxKind.PublicKeyword),
        ts.createToken(ts.SyntaxKind.StaticKeyword)
      ],
      this.bindingPropName,
      /* question token */ undefined,
      /* type node */ undefined,
      ts.createCall(
        ts.createIdentifier('hydrateBindings'),
        /* type arguments */ undefined,
        /* arguments */
        [
          ts.createArrayLiteral(
            this.templateFactory.bindings.map(binding => {
              return ts.createArrayLiteral([
                ts.createLiteral(binding[0]),
                ts.createLiteral(binding[1]),
                this.bindingToArrayNode(binding[2].dehydrate()),
                binding[3] ? ts.createLiteral(binding[3]) : null,
                binding[4] ? ts.createLiteral(binding[4]) : null
              ].filter(Boolean))
            }),
            /* multiline */ true
          )
        ]
      ),
    );
  }

  private createObserverGetter(name: string) {
    return ts.createGetAccessor(
      /* decorators */undefined,
      [
        ts.createToken(ts.SyntaxKind.PublicKeyword)
      ],
      name,
      /* parameters */ undefined,
      /* type */ undefined,
      ts.createBlock([
        ts.createReturn(
          ts.createCall(
            ts.createPropertyAccess(
              ts.createPropertyAccess(
                ts.createThis(),
                this.observerPropName
              ),
              'getValue'
            ),
            /* type arguments */ undefined,
            /* arguments */ undefined
          )
        )
      ])
    );
  }

  private createObserverSetter(name: string, paramName = 'v', type?: string) {
    return ts.createSetAccessor(
      undefined,
      [
        ts.createToken(ts.SyntaxKind.PublicKeyword)
      ],
      name,
      [
        ts.createParameter(
          /* decorators */ undefined,
          /* modifiers */ undefined,
          /* dotdotdot token */undefined,
          paramName,
          /* question token */ undefined,
          /* type */ undefined,
          /* initializer */undefined
        )
      ],
      ts.createBlock([
        ts.createStatement(
          ts.createCall(
            ts.createPropertyAccess(
              ts.createPropertyAccess(
                ts.createThis(),
                this.observerPropName
              ),
              'setValue'
            ),
            /* type arguments */ undefined,
            /* arguments */
            [
              ts.createIdentifier(paramName)
            ]
          )
        )
      ])
    )
  }
}
