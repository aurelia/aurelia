import { ILogger } from '@aurelia/kernel';
import { NPMPackage } from './system/npm-package-loader';
import { I$Node } from './vm/ast';

export class Project {
  public readonly nodes: I$Node[] = [];
  public nodeCount: number = 0;

  public constructor(
    public readonly rootDir: string,
    public readonly entryPkg: NPMPackage,
    public readonly logger: ILogger,
  ) {}

  public registerNode(node: I$Node): number {
    const id = this.nodeCount;
    this.nodes[id] = node;
    ++this.nodeCount;
    return id;
  }
}
