import * as ts from 'typescript';

namespace Au {
  export function run() {
    return ts.transpileModule(`export class App {\n}`, {
      fileName: 'app.au',
      compilerOptions: {
        target: ts.ScriptTarget.ES5
      },
      transformers: {
        before: [
          new Transformer().transform
        ]
      }
    });
  }

  export class Transformer {

    public context: ts.TransformationContext;
    public hasExportClass: boolean = false;

    private fileVisitor = (file: ts.SourceFile) => {
      ts.visitEachChild(file, this.nodeVisitor, this.context);
      if (this.hasExportClass) {
        return ts.updateSourceFileNode(file, [
          ts.createImportDeclaration(
            undefined,
            undefined,
            ts.createImportClause(
              undefined,
              ts.createNamedImports([
                ts.createImportSpecifier(
                  ts.createIdentifier('AccessScope'),
                  ts.createIdentifier('AccessScope')
                ),
              ])
            ),
            ts.createLiteral('./core')
          ),
          ts.createClassDeclaration(
            undefined,
            undefined,
            '$App',
            [
              ts.createTypeParameterDeclaration('container')
            ],
            [],
            [
              ts.createProperty(
                undefined,
                undefined,
                '$observers',
                undefined,
                undefined,
                ts.createObjectLiteral([
                  ts.createPropertyAssignment(
                    'name',
                    ts.createNew(ts.createIdentifier('Observer'), [], [ts.createLiteral('')])
                  )
                ], true)
              )
            ]
          ),
          ...file.statements
        ]);
      }
      return file;
    }

    private nodeVisitor = (node: ts.Node): ts.Node => {
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          this.hasExportClass = !!(ts.getCombinedModifierFlags(node) | ts.ModifierFlags.Export);
      }
      return ts.visitEachChild(node, this.nodeVisitor, this.context);
    }

    transform = (context: ts.TransformationContext) => {
      this.context = context;
      return this.fileVisitor;
      // return (sourceFile: ts.SourceFile) => {
      //   // ts.setTextRange()
      //   ts.updateSourceFileNode(sourceFile, [
      //     ts.createImportDeclaration(
      //       /** No decorators */ undefined,
      //       /** No modifier */ undefined,
      //       ts.createImportClause(
      //         /** name of export */ undefined,
      //         ts.createNamedImports([
      //           // ts.createIdentifier('AccessScope'),
      //           // ts.createIdentifier('AccessScope')
      //           // ts.createImportSpecifier(ts.createIdentifier('AccessScope'), ts.createIdentifier('AccessScope'))
      //         ])
      //       ),
      //       ts.createLiteral('./framework')
      //     ),
      //     ...sourceFile.statements
      //   ]);
      // }

      // function visit(node: ts.Node) {

      // }
      // context.onSubstituteNode = (hint, node) => {
      //   if (ts.isIdentifier(node)
      //     && ts.isNamedExports(node)
      //     && ts.isClassDeclaration(node)
      //     && node.escapedText === 'App'
      //   ) {
      //     ts.updateSourceFilets.createImportDeclaration(
      //       /** No decorators */ undefined,
      //       /** No modifier */ undefined,
      //       ts.createImportClause(
      //         /** name of export */ undefined,
      //         ts.createNamedImports([
      //           ts.createImportSpecifier()
      //         ])
      //       ),
      //       ts.createLiteral('./framework')
      //     )
      //   }
      // }
    }
  }
}

