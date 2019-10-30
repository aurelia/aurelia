/* eslint-disable import/no-nodejs-modules */
import { ILogger, PLATFORM, IContainer } from '@aurelia/kernel';
import { Char } from '@aurelia/jit';
import { IFileSystem, IFile } from './interfaces';
import { normalizePath, joinPath } from './path-utils';
import { basename } from 'path';
import { Package } from './package-types';

function countSlashes(path: string): number {
  let count = 0;
  const len = path.length;

  for (let i = 0; i < len; ++i) {
    if (path.charCodeAt(i) === Char.Slash) {
      ++count;
    }
  }

  return count;
}

function createFileComparer(preferredNames: readonly string[]) {
  const len = preferredNames.length;
  let name: string = '';

  return function compareFiles(a: IFile, b: IFile): number {
    const aName = basename(a.path);
    const bName = basename(b.path);

    const aDepth = countSlashes(a.path);
    const bDepth = countSlashes(b.path);

    if (aDepth === bDepth) {
      /*
       * If both files are in the same folder, use "absolute" priorities between the convention-based
       * names and fall back to alphabetic sort.
       * Examples:
       *
       * - a = src/foo.js
       * - b = src/index.js <-- this one wins (the one with the convention wins)
       *
       * - a = src/foo.js
       * - b = src/startup.js <-- this one wins (the one with the convention wins)
       *
       * - a = src/startup.js
       * - b = src/index.js <-- this one wins (the one with the higher priority convention wins)
       *
       * - a = src/foo.js
       * - b = src/bar.js <-- this one wins (none match a convention, so sort alphabetically)
       */
      for (let i = 0; i < len; ++i) {
        name = preferredNames[i];
        if (aName === name) {
          return -1;
        }

        if (bName === name) {
          return 1;
        }
      }

      return aName < bName ? -1 : aName > bName ? 1 : 0;
    }

    if (aName === bName) {
      /*
      * The directory depth is different but the names are the same, so sort according to depth.
      * Examples:
      *
      * - a = src/foo.js <-- this one wins (the higher level path wins, even if it alphabetically comes last)
      * - b = src/bar/foo.js
      *
      * - a = src/foobarbazqux.js <-- this one wins (the higher level path wins, path length or other factors have no effect)
      * - b = src/a/b.js
      */
      return aDepth - bDepth;
    }

    /*
     * Depth is different and so are the names. Here, we group the different conventions together
     * so that they each have the same effective priority.
     * Examples:
     *
     * - a = src/foo.js
     * - b = src/bar/index.js <-- this one wins (the one with the convention wins, even if it is deeper level)
     *
     * - a = src/index.js <-- this one wins (both match same convention, so highest level wins)
     * - b = src/bar/index.js
     *
     * - a = src/startup.js <-- this one wins (both match any convention, so highest level wins)
     * - b = src/bar/index.js
     *
     * - a = src/foo.js <-- this one wins (none match a convention, so highest level wins)
     * - b = src/bar/baz.js
     */
    if (preferredNames.includes(aName)) {
      if (preferredNames.includes(bName)) {
        return aDepth - bDepth;
      }

      return -1;
    }

    if (preferredNames.includes(bName)) {
      return 1;
    }

    return aDepth - bDepth;
  };
}

// Node conventions
const compareExternalModuleEntryFile = createFileComparer([
  'index.js',
  'app.js',
  'server.js',
]);

// Aurelia conventions (TODO: make this configurable)
const compareApplicationEntryFile = createFileComparer([
  'index.ts',
  'index.js',
  'startup.ts',
  'startup.js',
  'main.ts',
  'main.js',
]);

/**
 * Returns `true` if this is an absolute POSIX, UNC or DOS path.
 *
 * Assumes path has already been normalized with `normalizePath`
 */
function isRootedDiskPath(path: string): boolean {
  const ch0 = path.charCodeAt(0);
  return (
    ch0 === Char.Slash
    || (
      ch0 >= Char.LowerA
      && ch0 <= Char.LowerZ
      && path.charCodeAt(1) === Char.Colon
    )
  );
}

function isRelativeModulePath(path: string): boolean {
  const ch0 = path.charCodeAt(0);
  if (ch0 === Char.Dot) {
    const ch1 = path.charCodeAt(1);
    if (ch1 === Char.Dot) {
      return path.charCodeAt(2) === Char.Slash || path.length === 2;
    }

    return ch1 === Char.Slash || path.length === 1;
  }

  return isRootedDiskPath(path);
}

function determineEntryFileByConvention(
  files: readonly IFile[],
  isPrimaryEntryPoint: boolean,
): IFile {
  if (isPrimaryEntryPoint) {
    return files.slice().sort(compareApplicationEntryFile)[0];
  }

  return files.slice().sort(compareExternalModuleEntryFile)[0];
}

export class NPMPackageLoader {
  private readonly pkgCache: Map<string, NPMPackage> = new Map();
  private readonly pkgPromiseCache: Map<string, Promise<NPMPackage>> = new Map();

  public static get inject() { return [IContainer, ILogger, IFileSystem]; }

  public constructor(
    public readonly container: IContainer,
    public readonly logger: ILogger,
    public readonly fs: IFileSystem,
  ) {
    this.logger = logger.root.scopeTo('NPMPackageLoader');
  }

  public async loadEntryPackage(
    projectDir: string,
  ): Promise<NPMPackage> {
    const start = PLATFORM.now();

    this.logger.info(`load()`);

    projectDir = normalizePath(projectDir);
    const nodeModulesDir = joinPath(projectDir, 'node_modules');
    const entryPkg = await this.loadPackage(nodeModulesDir, projectDir, null);
    await entryPkg.loadDependencies();

    this.pkgPromiseCache.clear();

    const end = PLATFORM.now();

    const packages = Array.from(this.pkgCache.values());
    const pkgCount = packages.length;
    const fileCount = packages.reduce((count, pkg) => count + pkg.files.length, 0);

    this.logger.info(`Discovered ${fileCount} files across ${pkgCount} packages in ${Math.round(end - start)}ms`);
    for (const pkg of packages) {
      this.logger.info(`- ${pkg.pkgName}: ${pkg.files.length} files`);
    }

    return entryPkg;
  }

  /** @internal */
  public async loadPackage(
    nodeModulesDir: string,
    dir: string,
    issuer: NPMPackageDependency | null,
  ): Promise<NPMPackage> {
    const fs = this.fs;
    const pkgPromiseCache = this.pkgPromiseCache;

    const pkgPath = normalizePath(await fs.getRealPath(joinPath(dir, 'package.json')));
    let pkgPromise = pkgPromiseCache.get(pkgPath);
    if (pkgPromise === void 0) {
      pkgPromise = this.loadPackageCore(nodeModulesDir, pkgPath, issuer);
      // Multiple deps may request the same package to load before one of them finished
      // so we store the promise to ensure the action is only invoked once.
      pkgPromiseCache.set(pkgPath, pkgPromise);
    }

    return pkgPromise;
  }

  private async loadPackageCore(
    nodeModulesDir: string,
    pkgPath: string,
    issuer: NPMPackageDependency | null,
  ): Promise<NPMPackage> {
    this.logger.info(`loadPackageCore(\n  pkgPath: ${pkgPath},\n  issuer: ${issuer === null ? 'null' : issuer.issuer.pkgName}\n)`);

    const fs = this.fs;
    const pkgCache = this.pkgCache;

    let pkg = pkgCache.get(pkgPath);
    if (pkg === void 0) {
      const pkgDir = pkgPath.slice(0, -'package.json'.length - 1);
      const files = await fs.getFiles(pkgDir);

      const pkgJsonFile = files.find(x => x.path === pkgPath);
      if (pkgJsonFile === void 0) {
        throw new Error(`No package.json found at "${pkgPath}"`);
      }

      const pkgJsonFileContent = await pkgJsonFile.getContent();
      pkg = new NPMPackage(nodeModulesDir, this, files, issuer, pkgJsonFile, pkgDir, pkgJsonFileContent);
      pkgCache.set(pkgPath, pkg);
    }

    return pkg;
  }
}

export class NPMPackage {
  public readonly pkgJson: Package;
  public readonly pkgName: string;
  public readonly isAureliaPkg: boolean;
  public readonly isEntryPoint: boolean;
  public readonly entryFile: IFile;
  public readonly deps: readonly NPMPackageDependency[];

  public constructor(
    public readonly nodeModulesDir: string,
    public readonly loader: NPMPackageLoader,
    public readonly files: readonly IFile[],
    public readonly issuer: NPMPackageDependency | null,
    public readonly pkgJsonFile: IFile,
    dir: string,
    pkgJsonFileContent: string,
  ) {
    const pkgJson = this.pkgJson = JSON.parse(pkgJsonFileContent) as Package;
    const pkgName = this.pkgName = typeof pkgJson.name === 'string' ? pkgJson.name : dir.slice(dir.lastIndexOf('/') + 1);
    const pkgModuleOrMain = typeof pkgJson.module === 'string' ? pkgJson.module : pkgJson.main;
    const isAureliaPkg = this.isAureliaPkg = pkgName.startsWith('@aurelia');
    const isEntryPoint = this.isEntryPoint = issuer === null;

    let entryFilePath = isAureliaPkg ? 'src/index.ts' : pkgModuleOrMain;
    let entryFile: IFile | undefined;
    if (entryFilePath === void 0) {
      entryFile = determineEntryFileByConvention(files, isEntryPoint);
    } else {
      entryFilePath = entryFilePath.toLowerCase();
      if (entryFilePath.startsWith('.')) {
        entryFilePath = entryFilePath.slice(1);
      }
      entryFile = files.find(x => x.path.endsWith(entryFilePath!));
      if (entryFile === void 0) {
        const withJs = `${entryFilePath}.js`;
        entryFile = files.find(x => x.path.endsWith(withJs));
        if (entryFile === void 0) {
          const withIndexJs = joinPath(entryFilePath, 'index.js');
          entryFile = files.find(x => x.path.endsWith(withIndexJs));
        }
      }
    }

    if (entryFile === void 0) {
      throw new Error(`No entry file could be located for package ${pkgName}`);
    }

    this.entryFile = entryFile;

    if (pkgJson.dependencies instanceof Object) {
      this.deps = Object.keys(pkgJson.dependencies).map(name => new NPMPackageDependency(this, name));
    } else {
      this.deps = PLATFORM.emptyArray;
    }
  }

  /** @internal */
  public async loadDependencies(): Promise<void> {
    await Promise.all(this.deps.map(loadDependency));
  }
}

async function loadDependency(dep: NPMPackageDependency): Promise<void> {
  await dep.load();
  await dep.pkg.loadDependencies();
}

export class NPMPackageDependency {
  public get pkg(): NPMPackage {
    const pkg = this._pkg;
    if (pkg === void 0) {
      throw new Error(`Package ${this.refName} is not yet loaded`);
    }
    return pkg;
  }

  private _pkg: NPMPackage | undefined = void 0;
  private loadPromise: Promise<void> | undefined = void 0;

  public readonly dir: string;

  public constructor(
    public readonly issuer: NPMPackage,
    public readonly refName: string,
  ) {
    this.dir = isRelativeModulePath(refName) ? refName : joinPath(issuer.nodeModulesDir, refName);
  }

  /** @internal */
  public async load(): Promise<void> {
    if (this._pkg === void 0) {
      if (this.loadPromise === void 0) {
        // Multiple deps may request the same package to load before one of them finished
        // so we store the promise to ensure the action is only invoked once.
        this.loadPromise = this.loadCore();
      }

      return this.loadPromise;
    }
  }

  private async loadCore(): Promise<void> {
    this._pkg = await this.issuer.loader.loadPackage(this.issuer.nodeModulesDir, this.dir, this);

    this.loadPromise = void 0;

    // Freeze it as an extra measure to prove that we're not getting race conditions
    Object.freeze(this);
  }
}
