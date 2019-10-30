/* eslint-disable */
import { ILogger, IContainer, DI, LoggerConfiguration, LogLevel, ColorOptions, Registration } from '@aurelia/kernel';
import { I$Node, $SourceFile } from './ast';
import { IFileSystem, FileKind, IFile, IOptions } from '../system/interfaces';
import { NodeFileSystem } from '../system/file-system';
import { NPMPackage, NPMPackageLoader } from '../system/npm-package-loader';
import { createSourceFile, ScriptTarget, CompilerOptions } from 'typescript';
import { normalizePath, isRelativeModulePath, resolvePath, joinPath } from '../system/path-utils';
import { dirname } from 'path';

function comparePathLength(a: { path: { length: number } }, b: { path: { length: number } }): number {
  return a.path.length - b.path.length;
}

// http://www.ecma-international.org/ecma-262/#sec-abstract-module-records
export interface IModule {
  /** This field is never used. Its only purpose is to help TS distinguish this interface from others. */
  '<IModule>': any;

  readonly host: Host;
}

export class DeferredModule implements IModule {
  '<IModule>': any;

  public constructor(
    public readonly $file: IFile,
    public readonly host: Host,
  ) {}
}

export class Host {
  public readonly nodes: I$Node[] = [];
  public nodeCount: number = 0;

  private readonly logger: ILogger;

  private readonly compilerOptionsCache: Map<string, CompilerOptions> = new Map();
  private readonly moduleCache: Map<string, IModule> = new Map();

  private readonly container: IContainer;

  public constructor(container?: IContainer) {
    if (container === void 0) {
      container = this.container = DI.createContainer();
      container.register(
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
    return this.getESModule(pkg.entryFile, pkg);
  }

  // http://www.ecma-international.org/ecma-262/#sec-hostresolveimportedmodule
  public HostResolveImportedModule(referencingModule: $SourceFile, specifier: string): IModule {
    specifier = normalizePath(specifier);
    const isRelative = isRelativeModulePath(specifier);
    const pkg = referencingModule.pkg;

    if (isRelative) {
      const filePath = resolvePath(dirname(referencingModule.$file.path), specifier);
      const files = pkg.files.filter(x => x.shortPath === filePath || x.path === filePath).sort(comparePathLength);
      if (files.length === 0) {
        throw new Error(`Cannot find file "${filePath}" (imported as "${specifier}" by "${referencingModule.$file.name}")`);
      }

      let file = files.find(x => x.kind === FileKind.Script);
      if (file === void 0) {
        file = files[0];
        let deferred = this.moduleCache.get(file.path);
        if (deferred === void 0) {
          deferred = new DeferredModule(file, this);
          this.moduleCache.set(file.path, deferred);
        }

        return deferred;
      }

      return this.getESModule(file, pkg);
    } else {
      const pkgDep = pkg.deps.find(n => n.refName === specifier || specifier.startsWith(n.refName + '/'));
      if (pkgDep === void 0) {
        if (referencingModule.matcher !== null) {
          const file = referencingModule.matcher.findMatch(pkg.files, specifier);
          return this.getESModule(file, pkg);
        } else {
          throw new Error(`Cannot resolve absolute file path without path mappings in tsconfig`);
        }
      } else {
        const container = referencingModule.pkg.container;
        const { rootDir } = container.get(IOptions);
        const fs = container.get(IFileSystem);
        let pkgPath = joinPath(rootDir, 'node_modules', pkgDep.refName, 'package.json');
        pkgPath = normalizePath(fs.getRealPathSync(pkgPath));

        const modulePath = joinPath(rootDir, 'node_modules', specifier);
        const externalPkg = referencingModule.pkg.loader.getCachedPackage(pkgPath);
        if (pkgDep.refName !== specifier) {
          let file = externalPkg.files.find(x => x.shortPath === modulePath && x.ext === '.js');
          if (file === void 0) {
            const indexModulePath = joinPath(modulePath, 'index');
            file = externalPkg.files.find(f => f.shortPath === indexModulePath && f.ext === '.js');
            if (file === void 0) {
              throw new Error(`Unable to resolve file "${modulePath}" or "${indexModulePath}"`);
            }
          }

          return this.getESModule(file, externalPkg);
        } else {
          return this.getESModule(externalPkg.entryFile, externalPkg);
        }
      }
    }
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

  private getESModule(file: IFile, pkg: NPMPackage): $SourceFile {
    let esm = this.moduleCache.get(file.path);
    if (esm === void 0) {
      const compilerOptions = this.getCompilerOptions(file.path, pkg);
      const sourceText = file.getContentSync();
      const sourceFile = createSourceFile(file.path, sourceText, ScriptTarget.Latest, false);
      esm = new $SourceFile(file, sourceFile, this, pkg, compilerOptions);

      this.moduleCache.set(file.path, esm);
    }

    return esm as $SourceFile;
  }

  private getCompilerOptions(path: string, pkg: NPMPackage): CompilerOptions {
    // TODO: this is a very simple/naive impl, needs more work for inheritance etc
    path = normalizePath(path);

    let compilerOptions = this.compilerOptionsCache.get(path);
    if (compilerOptions === void 0) {
      const dir = normalizePath(dirname(path));
      if (dir === path) {
        compilerOptions = {};
      } else {
        const tsConfigPath = joinPath(path, 'tsconfig.json');
        const tsConfigFile = pkg.files.find(x => x.path === tsConfigPath);
        if (tsConfigFile === void 0) {
          compilerOptions = this.getCompilerOptions(dir, pkg);
        } else {
          const tsConfigText = tsConfigFile.getContentSync();
          const tsConfigObj = JSON.parse(tsConfigText);
          compilerOptions = tsConfigObj.compilerOptions;
          if (compilerOptions === null || typeof compilerOptions !== 'object') {
            compilerOptions = {};
          }
        }
      }

      this.compilerOptionsCache.set(path, compilerOptions);
    }

    return compilerOptions;
  }
}
