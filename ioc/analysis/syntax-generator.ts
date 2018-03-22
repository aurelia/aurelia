import * as Graph from "../graph";
import * as ts from "typescript";

export class TypeScriptSyntaxGenerator {

  public create(graph: Graph.Node): ts.SourceFile {
    let sourceFile: ts.SourceFile;

    for (const edge of graph.outgoingEdges) {
      //edge.key.
    }

    return sourceFile;
  }
}
