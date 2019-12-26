/* eslint-disable no-await-in-loop */
import {
  IContainer,
  Key,
  Resolved,
  IResolver,
  Constructable,
  IFactory,
  Transformer,
  Registration,
  ILogger,
  Writable,
} from '@aurelia/kernel';
import {
  IFile,
  normalizePath,
  joinPath,
  isRelativeModulePath,
  resolvePath,
  FileKind,
  File,
  IFileSystem,
  Encoding,
} from '@aurelia/runtime-node';

import {
  JSDOM,
} from 'jsdom';
import {
  createSourceFile,
  ScriptTarget,
  Printer,
  createPrinter,
} from 'typescript';
import {
  dirname,
  basename,
  join,
} from 'path';

import {
  $ESModule,
  $ESScript,
  $DocumentFragment,
  $$ESModuleOrScript,
} from './ast/modules';
import {
  IModule,
  DeferredModule,
  Realm,
} from './realm';
import {
  MaybePromise,
  awaitIfPromise,
  computeCommonRootDirectory,
} from './util';
import {
  GlobalOptions,
  IGlobalOptions,
  EntryKind,
} from './global-options';

import {
  $String,
} from './types/string';
import {
  $Error,
} from './types/error';

import {
  NPMPackage,
  NPMPackageLoader,
} from '../system/npm-package-loader';
import {
  $CompilerOptions,
} from '../system/interfaces';
import {
  PatternMatcher,
} from '../system/pattern-matcher';
import { TransformationContext } from './ast/_shared';

export interface IEmitOptions {
  readonly outDir: string;
}

export class EmitOptions implements IEmitOptions {
  public constructor(
    public readonly outDir: string,
  ) {}

  public static create({
    outDir,
  }: IEmitOptions): EmitOptions {
    return new EmitOptions(
      outDir,
    );
  }
}

export class Workspace implements IContainer {
  public readonly options: GlobalOptions;

  private _jsdom: JSDOM | null = null;
  public get jsdom(): JSDOM {
    let jsdom = this._jsdom;
    if (jsdom === null) {
      jsdom = this._jsdom = new JSDOM('');
    }
    return jsdom;
  }

  private readonly _modules: $ESModule[] = [];
  public get modules(): readonly $ESModule[] {
    return this._modules;
  }

  private readonly _scripts: $ESScript[] = [];
  public get scripts(): readonly $ESScript[] {
    return this._scripts;
  }

  private readonly _files: IFile[] = [];
  public get files(): readonly IFile[] {
    return this._files;
  }

  private readonly logger: ILogger;
  private readonly fs: IFileSystem;
  private readonly loader: NPMPackageLoader;
  private readonly container: IContainer;

  private readonly compilerOptionsCache: Map<string, $CompilerOptions> = new Map();
  private readonly fileCache: Map<string, IFile> = new Map();
  private readonly moduleCache: Map<string, IModule> = new Map();
  private readonly scriptCache: Map<string, $ESScript> = new Map();

  public constructor(
    parentContainer: IContainer,
    options: IGlobalOptions,
  ) {
    this.logger = parentContainer.get(ILogger).root.scopeTo('Workspace');
    this.fs = parentContainer.get(IFileSystem);
    this.loader = parentContainer.get(NPMPackageLoader);
    options = this.options = GlobalOptions.create(options);

    this.container = parentContainer.createChild();
    this.container.register(Registration.instance(GlobalOptions, options));
    this.container.register(Registration.instance(Workspace, this));
  }

  public addModule(m: $ESModule): void {
    this._modules.push(m);
  }

  public addScript(s: $ESScript): void {
    this._scripts.push(s);
  }

  // http://www.ecma-international.org/ecma-262/#sec-hostresolveimportedmodule
  public ResolveImportedModule(
    realm: Realm,
    referencingModule: $ESModule,
    $specifier: $String,
  ): MaybePromise<IModule | $Error> {
    const specifier = normalizePath($specifier['[[Value]]']);
    const isRelative = isRelativeModulePath(specifier);
    const pkg = referencingModule.pkg;

    // Single file scenario; lazily resolve the import
    if (pkg === null) {
      if (!isRelative) {
        throw new Error(`Absolute module resolution not yet implemented for single-file scenario.`);
      }
      // TODO: this is currently just for the 262 test suite but we need to resolve the other stuff properly too for end users that don't want to use the package eager load mechanism
      const dir = referencingModule.$file.dir;
      const ext = '.js';
      const name = basename(specifier);
      const shortName = name.slice(0, -3);
      const path = joinPath(dir, name);
      const file = new File(this.fs, path, dir, specifier, name, shortName, ext);
      return this.getESModule(realm, file, null);
    }

    if (isRelative) {
      this.logger.debug(`[ResolveImport] resolving internal relative module: '${$specifier['[[Value]]']}' for ${referencingModule.$file.name}`);

      const filePath = resolvePath(dirname(referencingModule.$file.path), specifier);
      const files = pkg.files.filter(x => x.shortPath === filePath || x.path === filePath).sort(comparePathLength);
      if (files.length === 0) {
        throw new Error(`Cannot find file "${filePath}" (imported as "${specifier}" by "${referencingModule.$file.name}")`);
      }

      let file = files.find(x => x.kind === FileKind.Script);
      if (file === void 0) {
        // TODO: make this less messy/patchy
        file = files.find(x => x.kind === FileKind.Markup);
        if (file === void 0) {
          file = files[0];
          let deferred = this.moduleCache.get(file.path);
          if (deferred === void 0) {
            deferred = new DeferredModule(file, realm);
            this.moduleCache.set(file.path, deferred);
          }

          return deferred;
        }

        return this.getHTMLModule(realm, file, pkg);
      }

      return this.getESModule(realm, file, pkg);
    } else {
      const pkgDep = pkg.deps.find(n => n.refName === specifier || specifier.startsWith(`${n.refName}/`));
      if (pkgDep === void 0) {
        this.logger.debug(`[ResolveImport] resolving internal absolute module: '${$specifier['[[Value]]']}' for ${referencingModule.$file.name}`);

        const matcher = PatternMatcher.getOrCreate(referencingModule.compilerOptions, this.container);
        if (matcher !== null) {
          const file = matcher.findMatch(pkg.files, specifier);
          return this.getESModule(realm, file, pkg);
        } else {
          throw new Error(`Cannot resolve absolute file path without path mappings in tsconfig`);
        }
      } else {
        this.logger.debug(`[ResolveImport] resolving external absolute module: '${$specifier['[[Value]]']}' for ${referencingModule.$file.name}`);

        let $externalPkg: MaybePromise<NPMPackage>;
        if (pkg.loader.hasCachedPackage(pkgDep.refName)) {
          $externalPkg = pkg.loader.getCachedPackage(pkgDep.refName);
        } else {
          $externalPkg = pkg.loader.loadPackage(pkgDep);
        }

        return awaitIfPromise(
          $externalPkg,
          () => true,
          externalPkg => {
            if (pkgDep.refName !== specifier) {
              if (externalPkg.entryFile.shortName === specifier) {
                return this.getESModule(realm, externalPkg.entryFile, externalPkg);
              }

              let file = externalPkg.files.find(x => x.shortPath === externalPkg.dir && x.ext === '.js');
              if (file === void 0) {
                const indexModulePath = joinPath(externalPkg.dir, 'index');
                file = externalPkg.files.find(f => f.shortPath === indexModulePath && f.ext === '.js');
                if (file === void 0) {
                  const partialAbsolutePath = joinPath('node_modules', specifier);
                  file = externalPkg.files.find(f => f.shortPath.endsWith(partialAbsolutePath) && f.ext === '.js');
                  if (file === void 0) {
                    throw new Error(`Unable to resolve file "${externalPkg.dir}" or "${indexModulePath}" (refName="${pkgDep.refName}", entryFile="${externalPkg.entryFile.shortPath}", specifier=${specifier})`);
                  }
                }
              }

              return this.getESModule(realm, file, externalPkg);
            } else {
              return this.getESModule(realm, externalPkg.entryFile, externalPkg);
            }
          },
        );
      }
    }
  }

  public async loadEntryFiles(
    realm: Realm,
  ): Promise<readonly $$ESModuleOrScript[]> {
    const files: $$ESModuleOrScript[] = [];
    const entries = this.options.entries;
    for (const entry of entries) {
      switch (entry.kind) {
        case EntryKind.scriptFile:
          files.push(await this.loadEntryFileFromScriptFile(realm, entry.file));
          break;
        case EntryKind.moduleFile:
          files.push(await this.loadEntryFileFromModuleFile(realm, entry.file, entry.standalone));
          break;
        case EntryKind.packageDir:
          files.push(await this.loadEntryFileFromPackageDir(realm, entry.dir));
          break;
      }
    }

    return files;
  }

  public async loadEntryFileFromScriptFile(
    realm: Realm,
    fileOrPath: string | IFile,
  ): Promise<$ESScript> {
    const file = this.getFile(fileOrPath);

    this.logger.info(`Loading entry file from script file: ${file.path}`);

    return this.getESScript(realm, fileOrPath);
  }

  public async loadEntryFileFromModuleFile(
    realm: Realm,
    fileOrPath: string | IFile,
    standalone?: boolean,
  ): Promise<$ESModule> {
    const file = this.getFile(fileOrPath);

    if (standalone === true) {
      this.logger.info(`Loading entry file from module file (standalone): ${file.path}`);

      return this.getESModule(realm, file, null);
    } else {
      this.logger.info(`Loading entry file from module file: ${file.path}`);

      const pkg = await this.loadEntryPackage(file);
      return this.getESModule(realm, file, pkg);
    }
  }

  public async loadEntryFileFromPackageDir(
    realm: Realm,
    dir: string,
  ): Promise<$ESModule> {
    this.logger.info(`Loading entry file from package dir: "${dir}"`);

    const pkg = await this.loadEntryPackage(dir);
    return this.getESModule(realm, pkg.entryFile, pkg);
  }

  public async emit(
    opts: IEmitOptions,
  ): Promise<void> {
    const options = EmitOptions.create(opts);
    const outDir = options.outDir;
    const fs = this.fs;

    const transformContext = new TransformationContext();
    const printer: Printer = createPrinter({ removeComments: false });

    const inputs = [
      ...this._modules,
      ...this._scripts,
    ];

    const commonRootDir = computeCommonRootDirectory(inputs.map(getDirFromFile));
    const commonRootDirLength = commonRootDir.length;

    this.logger.info(`Emitting ${inputs.length} files (with common root dir: "${commonRootDir}") to: "${outDir}"`);

    const emitObjs = inputs.map(input => EmitObject.create(
      /* fs                  */fs,
      /* input               */input,
      /* transformContext    */transformContext,
      /* printer             */printer,
      /* outDir              */outDir,
      /* commonRootDirLength */commonRootDirLength,
    ));
    await Promise.all(emitObjs.map(x => x.emit()));

    this.logger.info(`Emit finished`);
  }

  // #region IServiceLocator api
  public has<K extends Key>(key: K | Key, searchAncestors: boolean): boolean {
    return this.container.has(key, searchAncestors);
  }

  public get<K extends Key>(key: K | Key): Resolved<K> {
    return this.container.get(key);
  }

  public getAll<K extends Key>(key: K | Key): readonly Resolved<K>[] {
    return this.container.getAll(key);
  }
  // #endregion

  // #region IContainer api
  public register(...params: unknown[]): IContainer {
    return this.container.register(...params);
  }

  public registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>): IResolver<T> {
    return this.container.registerResolver(key, resolver);
  }

  public registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean {
    return this.container.registerTransformer(key, transformer);
  }

  public getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null {
    return this.container.getResolver(key, autoRegister);
  }

  public getFactory<T extends Constructable>(key: T): IFactory<T> | null {
    return this.container.getFactory(key);
  }

  public createChild(): IContainer {
    return this.container.createChild();
  }

  // #endregion

  public loadEntryPackage(pathOrFile: string | IFile): Promise<NPMPackage> {
    this.logger.trace(`loadEntryPackage(path="${typeof pathOrFile === 'string' ? pathOrFile : pathOrFile.path}")`);

    return this.loader.loadEntryPackage(pathOrFile);
  }

  public getHTMLModule(
    realm: Realm,
    file: IFile,
    pkg: NPMPackage,
  ): $DocumentFragment {
    let hm = this.moduleCache.get(file.path);
    if (hm === void 0) {
      const sourceText = file.getContentSync();
      const template = this.jsdom.window.document.createElement('template');
      template.innerHTML = sourceText;
      hm = new $DocumentFragment(
        /* logger */this.logger,
        /* $file  */file,
        /* node   */template.content,
        /* realm  */realm,
        /* pkg    */pkg,
      );

      this.moduleCache.set(file.path, hm);
    }

    return hm as $DocumentFragment;
  }

  public getESScript(
    realm: Realm,
    fileOrPath: IFile | string,
  ): $ESScript {
    const file = this.getFile(fileOrPath);
    let script = this.scriptCache.get(file.path);
    if (script === void 0) {
      const sourceText = file.getContentSync();
      const sf = createSourceFile(file.path, sourceText, ScriptTarget.Latest, false);
      script = new $ESScript(
        /* logger */this.logger,
        /* $file  */file,
        /* node   */sf,
        /* realm  */realm,
        /* ws     */this,
      );

      this._scripts.push(script);
      this.scriptCache.set(file.path, script);
    }

    return script as $ESScript;
  }

  public getESModule(
    realm: Realm,
    file: IFile,
    pkg: NPMPackage | null,
  ): $ESModule {
    let esm = this.moduleCache.get(file.path);
    if (esm === void 0) {
      const compilerOptions = this.getCompilerOptions(file.path, pkg);
      const sourceText = file.getContentSync();
      const sf = createSourceFile(file.path, sourceText, ScriptTarget.Latest, false);
      esm = new $ESModule(
        /* logger          */this.logger,
        /* $file           */file,
        /* node            */sf,
        /* realm           */realm,
        /* pkg             */pkg,
        /* compilerOptions */compilerOptions,
        /* ws              */this,
      );

      this._modules.push(esm as $ESModule);
      this.moduleCache.set(file.path, esm);
    }

    return esm as $ESModule;
  }

  public getCompilerOptions(
    path: string,
    pkg: NPMPackage | null,
  ): $CompilerOptions {
    // TODO: this is a very simple/naive impl, needs more work for inheritance etc
    path = normalizePath(path);

    let compilerOptions = this.compilerOptionsCache.get(path);
    if (compilerOptions === void 0) {
      const dir = normalizePath(dirname(path));
      if (dir === path || pkg === null/* TODO: maybe still try to find tsconfig? */) {
        compilerOptions = {
          __dirname: '',
        };
      } else {
        const tsConfigPath = joinPath(path, 'tsconfig.json');
        const tsConfigFile = pkg.files.find(x => x.path === tsConfigPath);
        if (tsConfigFile === void 0) {
          compilerOptions = this.getCompilerOptions(dir, pkg);
        } else {
          const tsConfigText = tsConfigFile.getContentSync();
          // tsconfig allows some stuff that's not valid JSON, so parse it as a JS object instead
          // eslint-disable-next-line no-new-func
          const tsConfigObj = new Function(`return ${tsConfigText}`)();
          compilerOptions = tsConfigObj.compilerOptions;
          if (compilerOptions === null || typeof compilerOptions !== 'object') {
            compilerOptions = {
              __dirname: tsConfigFile.dir,
            };
          } else {
            (compilerOptions as Writable<$CompilerOptions>).__dirname = tsConfigFile.dir;
          }
        }
      }

      this.compilerOptionsCache.set(path, compilerOptions);
    }

    return compilerOptions;
  }

  public dispose(): void {
    this.compilerOptionsCache.clear();
    for (const mod of this.moduleCache.values()) {
      mod.dispose();
    }
    this.moduleCache.clear();
    this.scriptCache.clear();
    this.fileCache.clear();
    this._scripts.length = 0;
    this._modules.length = 0;
    this._files.length = 0;
  }

  private getFile(fileOrPath: IFile | string): IFile {
    const cache = this.fileCache;
    let path: string;
    let file: IFile | undefined;

    if (typeof fileOrPath === 'string') {
      path = fileOrPath;
      file = void 0;
    } else {
      path = fileOrPath.path;
      file = fileOrPath;
    }

    if (!cache.has(path)) {
      if (file === void 0) {
        file = this.fs.getFileSync(path);
      }
      this._files.push(file);
      cache.set(path, file);
    } else if (file === void 0) {
      file = cache.get(path)!;
    }

    return file;
  }
}

function comparePathLength(a: { path: { length: number } }, b: { path: { length: number } }): number {
  return a.path.length - b.path.length;
}

function getDirFromFile(value: { $file: { dir: string }}): string {
  return value.$file.dir;
}

class EmitObject {
  public constructor(
    private readonly fs: IFileSystem,
    public readonly input: $$ESModuleOrScript,
    public readonly outPath: string,
    public readonly outContent: string | null,
  ) {}

  public static create(
    fs: IFileSystem,
    input: $$ESModuleOrScript,
    transformContext: TransformationContext,
    printer: Printer,
    outDir: string,
    commonRootDirLength: number,
  ): EmitObject {
    let outPath = join(outDir, input.$file.path.slice(commonRootDirLength));
    if (outPath.endsWith('.ts')) {
      outPath = `${outPath.slice(0, -2)}js`;
    }

    const transformed = input.transform(transformContext);
    if (transformed === void 0) {
      return new EmitObject(
        fs,
        input,
        outPath,
        null,
      );
    }

    const content = printer.printFile(transformed);
    return new EmitObject(
      fs,
      input,
      outPath,
      content,
    );
  }

  public async emit(): Promise<void> {
    if (this.outContent !== null) {
      return this.fs.writeFile(this.outPath, this.outContent, Encoding.utf8);
    }
  }
}
