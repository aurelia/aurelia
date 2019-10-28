import { IContainer, DI, LoggerConfiguration, LogLevel, ColorOptions, Registration, ILogger } from '@aurelia/kernel';
import { Project } from './project';
import { NPMPackageLoader } from './system/npm-package-loader';
import { IFileSystem } from './system/interfaces';
import { NodeFileSystem } from './system/file-system';

export class Workspace {
  private constructor(private readonly container: IContainer) {}

  public static create(): Workspace {
    const container = DI.createContainer();
    container.register(
      LoggerConfiguration.create(console, LogLevel.info, ColorOptions.colors),
      Registration.singleton(IFileSystem, NodeFileSystem),
    );
    return new Workspace(container);
  }

  public async loadProject(rootDir: string): Promise<Project> {
    const loader = this.container.get(NPMPackageLoader);
    const logger = this.container.get(ILogger);
    const entryPkg = await loader.loadEntryPackage(rootDir);
    return new Project(rootDir, entryPkg, logger);
  }
}
