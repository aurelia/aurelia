import * as AST from './analysis/ast';
import * as ts from 'typescript';
import { IPair } from './interfaces';

export class StaticDIConfiguration {
  public fileMap: Map<AST.IModule, ts.SourceFile> = new Map();
}
