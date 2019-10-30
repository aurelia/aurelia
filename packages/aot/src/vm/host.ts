import { ILogger, IContainer, DI, LoggerConfiguration, LogLevel, ColorOptions, Registration } from '@aurelia/kernel';
import { I$Node, $SourceFile } from './ast';
import { IFileSystem } from '../system/interfaces';
import { NodeFileSystem } from '../system/file-system';
import { NPMPackage, NPMPackageLoader } from '../system/npm-package-loader';
import { createSourceFile, ScriptTarget } from 'typescript';

export interface IOptions {
  readonly rootDir: string;
}
export const IOptions = DI.createInterface<IOptions>('IOptions').noDefault();

export class Host {
  public readonly container: IContainer;
  public readonly nodes: I$Node[] = [];
  public nodeCount: number = 0;

  private readonly logger: ILogger;

  public constructor(container?: IContainer) {
    if (container === void 0) {
      container = this.container = DI.createContainer();
      container.register(
        // eslint-disable-next-line no-undef
        LoggerConfiguration.create(console, LogLevel.info, ColorOptions.colors),
        Registration.singleton(IFileSystem, NodeFileSystem),
      );
    } else {
      this.container = container;
    }

    this.logger = container.get(ILogger).root.scopeTo('Host');
  }

  public async loadEntryFile(opts: IOptions): Promise<$SourceFile> {
    const pkg = await this.loadEntryPackage(opts);
    const file = pkg.entryFile;
    const sourceText = await file.getContent();
    const sourceFile = createSourceFile(file.path, sourceText, ScriptTarget.Latest, false);
    return new $SourceFile(file, sourceFile, this, pkg);
  }

  public registerNode(node: I$Node): number {
    const id = this.nodeCount;
    this.nodes[id] = node;
    ++this.nodeCount;
    return id;
  }

  private loadEntryPackage(opts: IOptions): Promise<NPMPackage> {
    this.logger.debug(`loadEntryPackage(${JSON.stringify(opts)})`);

    const container = this.container.createChild();
    Registration.instance(IOptions, opts).register(container);
    const loader = container.get(NPMPackageLoader);

    return loader.loadEntryPackage(opts.rootDir);
  }
}
