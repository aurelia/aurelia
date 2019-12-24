import {
  ILogger,
  PLATFORM,
  IContainer,
  Char,
} from '@aurelia/kernel';
import {
  IFileSystem,
  IFile,
  normalizePath,
  joinPath,
  Package,
} from '@aurelia/runtime-node';
import {
  basename,
  dirname,
  join,
} from 'path';

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

  private readonly pkgResolveCache: Map<string, string> = new Map();
  private readonly pkgResolvePromiseCache: Map<string, Promise<string>> = new Map();

  public static get inject() { return [IContainer, ILogger, IFileSystem]; }

  public constructor(
    public readonly container: IContainer,
    public readonly logger: ILogger,
    public readonly fs: IFileSystem,
  ) {
    this.logger = logger.root.scopeTo('NPMPackageLoader');
  }

  public async loadEntryPackage(
    pathOrFile: string | IFile,
  ): Promise<NPMPackage> {
    let path: string;
    let file: IFile | undefined;
    let isFile: boolean;
    if (typeof pathOrFile === 'string') {
      path = pathOrFile;
      file = void 0;
      isFile = false;
    } else {
      path = pathOrFile.path;
      file = pathOrFile;
      isFile = true;
    }

    this.logger.info(`loadEntryPackage(path="${path}")`);

    const fs = this.fs;
    if (!isFile) {
      const stat = await fs.stat(path);
      isFile = stat.isFile();
    }

    if (isFile) {
      const originalPath = path;
      path = dirname(path);

      while (true) {
        // eslint-disable-next-line no-await-in-loop
        if (await fs.isReadable(join(path, 'package.json'))) {
          break;
        }

        if (path === (path = dirname(path))) {
          throw new Error(`No package.json could be found in the directory of "${originalPath}" or any of its parent directories.`);
        }
      }
    }

    path = normalizePath(path);

    return this.loadPackageCore(path, null, file);
  }

  public hasCachedPackage(refName: string): boolean {
    return this.pkgCache.has(refName);
  }

  public getCachedPackage(refName: string): NPMPackage {
    const pkg = this.pkgCache.get(refName);
    if (pkg === void 0) {
      throw new Error(`Cannot resolve package ${refName}`);
    }
    return pkg;
  }

  /** @internal */
  public async loadPackage(issuer: NPMPackageDependency): Promise<NPMPackage> {
    const pkgCache = this.pkgCache;

    const pkg = pkgCache.get(issuer.refName);
    if (pkg === void 0) {
      const pkgPromiseCache = this.pkgPromiseCache;
      let pkgPromise = pkgPromiseCache.get(issuer.refName);
      if (pkgPromise === void 0) {
        pkgPromise = this.loadPackageCore(null, issuer);
        // Multiple deps may request the same package to load before one of them finished
        // so we store the promise to ensure the action is only invoked once.
        pkgPromiseCache.set(issuer.refName, pkgPromise);
      }

      return pkgPromise;
    }

    return pkg;
  }

  private async loadPackageCore(
    dir: null,
    issuer: NPMPackageDependency,
    entryFile?: IFile,
  ): Promise<NPMPackage>;
  private async loadPackageCore(
    dir: string,
    issuer: null,
    entryFile?: IFile,
  ): Promise<NPMPackage>;
  private async loadPackageCore(
    dir: string | null,
    issuer: NPMPackageDependency | null,
    entryFile?: IFile,
  ): Promise<NPMPackage> {

    const fs = this.fs;
    const pkgCache = this.pkgCache;

    const refName = dir === null ? issuer!.refName : dir;

    let pkg = pkgCache.get(refName);
    if (pkg === void 0) {
      if (dir === null) {
        dir = await this.resolvePackagePath(issuer!);
      }
      const pkgPath = joinPath(dir, 'package.json');

      const start = PLATFORM.now();
      const files = await fs.getFiles(dir);
      const end = PLATFORM.now();

      const pkgJsonFile = files.find(x => x.path === pkgPath);
      if (pkgJsonFile === void 0) {
        throw new Error(`No package.json found at "${pkgPath}"`);
      }

      const pkgJsonFileContent = await pkgJsonFile.getContent();
      pkg = new NPMPackage(this, files, issuer, pkgJsonFile, dir, pkgJsonFileContent, entryFile);
      this.logger.info(`loadPackageCore(\n  dir: ${dir},\n  issuer: ${issuer === null ? 'null' : issuer.issuer.pkgName}\n  specifier: ${refName}\n) discovered ${files.length} files in ${Math.round(end - start)}ms`);

      pkgCache.set(refName, pkg);

      // Delete the cached promise since it's not needed anymore; pkg is retrieved directly from normal cache now
      this.pkgPromiseCache.delete(refName);
    }

    return pkg;
  }

  private async resolvePackagePath(dep: NPMPackageDependency): Promise<string> {
    const pkgResolveCache = this.pkgResolveCache;
    const refName = dep.refName;
    const resolved = pkgResolveCache.get(refName);
    if (resolved === void 0) {
      const pkgResolvePromiseCache = this.pkgResolvePromiseCache;

      let resolvePromise = pkgResolvePromiseCache.get(refName);
      if (resolvePromise === void 0) {
        this.logger.trace(`resolvePackagePath(refName=${refName})`);

        resolvePromise = this.resolvePackagePathCore(dep);

        // Multiple deps may request the same refName to be resolved before one of them finished
        // so we store the promise to ensure the action is only invoked once.
        pkgResolvePromiseCache.set(refName, resolvePromise);
      } else {
        this.logger.trace(`resolvePackagePath(refName=${refName}) (from cached promise)`);
      }

      return resolvePromise;
    }

    return resolved;
  }

  private async resolvePackagePathCore(dep: NPMPackageDependency): Promise<string> {
    const fs = this.fs;
    const pkgResolveCache = this.pkgResolveCache;
    const refName = dep.refName;

    let resolvedPath = pkgResolveCache.get(refName);
    if (resolvedPath === void 0) {
      let dir = dep.issuer.dir;
      // Try top-level node_modules first as this eliminates a lot of fs reads from traversing
      if (dir.includes('node_modules')) {
        const [topLevelDir] = dir.split('node_modules');
        resolvedPath = joinPath(topLevelDir, 'node_modules', refName, 'package.json');
        // eslint-disable-next-line no-await-in-loop
        if (!(await fs.isReadable(resolvedPath))) {
          resolvedPath = void 0;
        }
      }

      if (resolvedPath === void 0) {
        while (true) {
          resolvedPath = joinPath(dir, 'node_modules', refName, 'package.json');
          // eslint-disable-next-line no-await-in-loop
          if (await fs.isReadable(resolvedPath)) {
            break;
          }

          const parent = normalizePath(dirname(dir));
          if (parent === dir) {
            throw new Error(`Unable to resolve npm dependency "${refName}" (requested from ${dep.issuer.pkgJsonFile.path})`);
          }

          dir = parent;
        }
      }

      const realPath = normalizePath(await fs.getRealPath(resolvedPath));
      if (realPath === resolvedPath) {
        this.logger.debug(`resolved "${refName}" directly to "${dirname(realPath)}"`);
      } else {
        this.logger.debug(`resolved "${refName}" to "${dirname(realPath)}" via symlink "${dirname(resolvedPath)}"`);

      }
      resolvedPath = normalizePath(dirname(realPath));
      pkgResolveCache.set(refName, resolvedPath);
      this.pkgResolvePromiseCache.delete(refName);
    }

    return resolvedPath;
  }
}

export class NPMPackage {
  public readonly pkgName: string;
  public readonly isAureliaPkg: boolean;
  public readonly isEntryPoint: boolean;
  public readonly hasSpecificEntryFile: boolean;
  public readonly entryFile: IFile;
  public readonly deps: readonly NPMPackageDependency[];

  public readonly container: IContainer;

  public constructor(
    public readonly loader: NPMPackageLoader,
    public readonly files: readonly IFile[],
    public readonly issuer: NPMPackageDependency | null,
    public readonly pkgJsonFile: IFile,
    public readonly dir: string,
    pkgJsonFileContent: string,
    entryFile?: IFile,
  ) {
    this.container = loader.container;

    const pkgJson = JSON.parse(pkgJsonFileContent) as Package;
    const pkgName = this.pkgName = typeof pkgJson.name === 'string' ? pkgJson.name : dir.slice(dir.lastIndexOf('/') + 1);
    const pkgModuleOrMain = typeof pkgJson.module === 'string' ? pkgJson.module : pkgJson.main;
    const isAureliaPkg = this.isAureliaPkg = pkgName.startsWith('@aurelia');
    const isEntryPoint = this.isEntryPoint = issuer === null;

    if (entryFile === void 0) {
      this.hasSpecificEntryFile = false;

      let entryFilePath = isAureliaPkg ? 'src/index.ts' : pkgModuleOrMain;
      if (entryFilePath === void 0) {
        entryFile = determineEntryFileByConvention(files, isEntryPoint);
      } else {
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
    } else {
      this.hasSpecificEntryFile = true;
    }

    this.entryFile = entryFile;

    if (pkgJson.dependencies instanceof Object) {
      this.deps = Object.keys(pkgJson.dependencies).map(name => new NPMPackageDependency(this, name));
    } else {
      this.deps = PLATFORM.emptyArray;
    }
  }
}

export class NPMPackageDependency {
  public constructor(
    public readonly issuer: NPMPackage,
    public readonly refName: string,
  ) {}
}
