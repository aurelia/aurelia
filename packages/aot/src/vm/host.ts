/* eslint-disable */
import { ILogger, IContainer, DI, LoggerConfiguration, LogLevel, ColorOptions, Registration, Writable } from '@aurelia/kernel';
import { I$Node, $SourceFile, $TemplateExpression, $TaggedTemplateExpression } from './ast';
import { IFileSystem, FileKind, IFile, IOptions } from '../system/interfaces';
import { NodeFileSystem } from '../system/file-system';
import { NPMPackage, NPMPackageLoader } from '../system/npm-package-loader';
import { createSourceFile, ScriptTarget, CompilerOptions } from 'typescript';
import { normalizePath, isRelativeModulePath, resolvePath, joinPath } from '../system/path-utils';
import { dirname } from 'path';
import { Intrinsics } from './intrinsics';
import { $EnvRec, $ModuleEnvRec, $GlobalEnvRec } from './environment';
import { $Undefined, $Object, $Function, $Null, $String } from './value';
import { $PropertyDescriptor } from './property-descriptor';
import { $DefinePropertyOrThrow } from './operations';

function comparePathLength(a: { path: { length: number } }, b: { path: { length: number } }): number {
  return a.path.length - b.path.length;
}

export class ResolveSet {
  private readonly modules: IModule[] = [];
  private readonly exportNames: string[] = [];
  private count: number = 0;

  public has(mod: IModule, exportName: string): boolean {
    const modules = this.modules;
    const exportNames = this.exportNames;
    const count = this.count;

    for (let i = 0; i < count; ++i) {
      if (exportNames[i] === exportName && modules[i] === mod) {
        return true;
      }
    }

    return false;
  }

  public add(mod: IModule, exportName: string): void {
    const index = this.count;
    this.modules[index] = mod;
    this.exportNames[index] = exportName;
    ++this.count;
  }

  public forEach(callback: (mod: IModule, exportName: string) => void): void {
    const modules = this.modules;
    const exportNames = this.exportNames;
    const count = this.count;

    for (let i = 0; i < count; ++i) {
      callback(modules[i], exportNames[i]);
    }
  }
}

export class ResolvedBindingRecord {
  public constructor(
    public readonly Module: IModule,
    public readonly BindingName: string,
  ) {}
}

// http://www.ecma-international.org/ecma-262/#sec-abstract-module-records
export interface IModule {
  /** This field is never used. Its only purpose is to help TS distinguish this interface from others. */
  readonly '<IModule>': unknown;

  '[[Environment]]': $ModuleEnvRec | $Undefined;

  readonly Host: Host;

  ResolveExport(exportName: string, resolveSet: ResolveSet): ResolvedBindingRecord | null | 'ambiguous';
}

export class DeferredModule implements IModule {
  public readonly '<IModule>': unknown;

  public '[[Environment]]': $ModuleEnvRec | $Undefined;

  public constructor(
    public readonly $file: IFile,
    public readonly Host: Host,
  ) {}

  public ResolveExport(exportName: string, resolveSet: ResolveSet): ResolvedBindingRecord | "ambiguous" | null {
    throw new Error('Method not implemented.');
  }
}

export class ExecutionContextStack extends Array<ExecutionContext> {
  public get top(): ExecutionContext {
    return this[this.length - 1];
  }

  public push(context: ExecutionContext): number {
    return super.push(context);
  }

  public pop(): ExecutionContext {
    return super.pop()!;
  }
}

// http://www.ecma-international.org/ecma-262/#sec-code-realms
export class Realm {
  public readonly stack: ExecutionContextStack = new ExecutionContextStack();

  public '[[Intrinsics]]': Intrinsics;
  public '[[GlobalObject]]': $Object;
  public '[[GlobalEnv]]': $GlobalEnvRec;
  public '[[TemplateMap]]': { '[[Site]]': $TemplateExpression | $TaggedTemplateExpression; '[[Array]]': $Object }[];
  public '[[HostDefined]]': any;

  private constructor(
    public readonly Host: Host,
  ) {
    (Host as Writable<Host>).realm = this;
  }

  // http://www.ecma-international.org/ecma-262/#sec-createrealm
  public static Create(Host: Host): Realm {
    // 1. Let realmRec be a new Realm Record.
    const realmRec = new Realm(Host);

    // 2. Perform CreateIntrinsics(realmRec).
    new Intrinsics(realmRec);

    // 3. Set realmRec.[[GlobalObject]] to undefined.
    realmRec['[[GlobalObject]]'] = (void 0)!;

    // 4. Set realmRec.[[GlobalEnv]] to undefined.
    realmRec['[[GlobalEnv]]'] = (void 0)!;

    // 5. Set realmRec.[[TemplateMap]] to a new empty List.
    realmRec['[[TemplateMap]]'] = [];

    // 6. Return realmRec.
    return realmRec;
  }
}

export class ExecutionContext {
  public Function!: $Function | $Null;
  public Realm!: Realm;
  public ScriptOrModule!: IModule | $Null;
  public LexicalEnvironment!: $EnvRec;
  public VariableEnvironment!: $EnvRec;
}

export class Host {
  public readonly nodes: I$Node[] = [];
  public nodeCount: number = 0;

  public readonly realm!: Realm; // Set by realm constructor

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
    this.logger.info('Initializing realm');

    // http://www.ecma-international.org/ecma-262/#sec-initializehostdefinedrealm

    // 1. Let realm be CreateRealm().
    const realm = Realm.Create(this);
    const intrinsics = realm['[[Intrinsics]]'];

    // 2. Let newContext be a new execution context.
    const newContext = new ExecutionContext();

    // 3. Set the Function of newContext to null.
    newContext.Function = intrinsics.null;

    // 4. Set the Realm of newContext to realm.
    newContext.Realm = realm;

    // 5. Set the ScriptOrModule of newContext to null.
    newContext.ScriptOrModule = intrinsics.null;

    // 6. Push newContext onto the execution context stack; newContext is now the running execution context.
    realm.stack.push(newContext);

    // 7. If the host requires use of an exotic object to serve as realm's global object, let global be such an object created in an implementation-defined manner. Otherwise, let global be undefined, indicating that an ordinary object should be created as the global object.
    let global = intrinsics.undefined as $Undefined | $Object;

    // 8. If the host requires that the this binding in realm's global scope return an object other than the global object, let thisValue be such an object created in an implementation-defined manner. Otherwise, let thisValue be undefined, indicating that realm's global this binding should be the global object.
    let thisValue = intrinsics.undefined as $Undefined | $Object;

    // 9. Perform SetRealmGlobalObject(realm, global, thisValue).
    // http://www.ecma-international.org/ecma-262/#sec-setrealmglobalobject
    (function (host: Host, realmRec: Realm, globalObj: $Object | $Undefined, thisValue: $Object | $Undefined) {
      // 1. If globalObj is undefined, then
      if (globalObj.isUndefined) {
        // 1. a. Let intrinsics be realmRec.[[Intrinsics]].
        // 1. b. Set globalObj to ObjectCreate(intrinsics.[[%ObjectPrototype%]]).
        globalObj = $Object.Create('GlobalObject', intrinsics['%ObjectPrototype%']);
      }

      // 2. Assert: Type(globalObj) is Object.
      // 3. If thisValue is undefined, set thisValue to globalObj.
      if (thisValue.isUndefined) {
        thisValue = globalObj;
      }

      // 4. Set realmRec.[[GlobalObject]] to globalObj.
      realmRec['[[GlobalObject]]'] = globalObj as $Object;

      // 5. Let newGlobalEnv be NewGlobalEnvironment(globalObj, thisValue).
      const newGlobalEnv = new $GlobalEnvRec(host, globalObj as $Object, thisValue as $Object);

      // 6. Set realmRec.[[GlobalEnv]] to newGlobalEnv.
      realmRec['[[GlobalEnv]]'] = newGlobalEnv;

      // 7. Return realmRec.
    })(this, realm, global, thisValue);

    // 10. Let globalObj be ? SetDefaultGlobalBindings(realm).
    // http://www.ecma-international.org/ecma-262/#sec-setdefaultglobalbindings
    (function (host: Host, realmRec: Realm) {
      // 1. Let global be realmRec.[[GlobalObject]].
      const global = realmRec['[[GlobalObject]]'];

      // 2. For each property of the Global Object specified in clause 18, do
      // 2. a. Let name be the String value of the property name.
      // 2. b. Let desc be the fully populated data property descriptor for the property containing the specified attributes for the property. For properties listed in 18.2, 18.3, or 18.4 the value of the [[Value]] attribute is the corresponding intrinsic object from realmRec.
      // 2. c. Perform ? DefinePropertyOrThrow(global, name, desc).
      // 3. Return global.

      function def(propertyName: string, intrinsicName: keyof Intrinsics): void {
        const name = new $String(host, propertyName);
        const desc = new $PropertyDescriptor(host, name);
        desc['[[Writable]]'] = intrinsics.false;
        desc['[[Enumerable]]'] = intrinsics.false;
        desc['[[Configurable]]'] = intrinsics.false;
        desc['[[Value]]'] = intrinsics[intrinsicName];
        $DefinePropertyOrThrow(global, name, desc);
      }

      // http://www.ecma-international.org/ecma-262/#sec-value-properties-of-the-global-object
      def('Infinity', 'Infinity');
      def('NaN', 'NaN');
      def('undefined', 'undefined');

      // http://www.ecma-international.org/ecma-262/#sec-function-properties-of-the-global-object
      def('eval', '%eval%');
      def('isFinite', '%isFinite%');
      def('isNaN', '%isNaN%');
      def('parseFloat', '%parseFloat%');
      def('parseInt', '%parseInt%');
      def('decodeURI', '%decodeURI%');
      def('decodeURIComponent', '%decodeURIComponent%');
      def('encodeURI', '%encodeURI%');
      def('encodeURIComponent', '%encodeURIComponent%');

      // http://www.ecma-international.org/ecma-262/#sec-constructor-properties-of-the-global-object
      def('Array', '%Array%');
      def('ArrayBuffer', '%ArrayBuffer%');
      def('Boolean', '%Boolean%');
      def('DataView', '%DataView%');
      def('Date', '%Date%');
      def('Error', '%Error%');
      def('EvalError', '%EvalError%');
      def('Float32Array', '%Float32Array%');
      def('Float64Array', '%Float64Array%');
      def('Function', '%Function%');
      def('Int8Array', '%Int8Array%');
      def('Int16Array', '%Int16Array%');
      def('Int32Array', '%Int32Array%');
      def('Map', '%Map%');
      def('Number', '%Number%');
      def('Object', '%Object%');
      def('Promise', '%Promise%');
      def('Proxy', '%Proxy%');
      def('RangeError', '%RangeError%');
      def('ReferenceError', '%ReferenceError%');
      def('RegExp', '%RegExp%');
      def('Set', '%Set%');
      def('SharedArrayBuffer', '%SharedArrayBuffer%');
      def('String', '%String%');
      def('Symbol', '%Symbol%');
      def('SyntaxError', '%SyntaxError%');
      def('TypeError', '%TypeError%');
      def('Uint8Array', '%Uint8Array%');
      def('Uint8ClampedArray', '%Uint8ClampedArray%');
      def('Uint16Array', '%Uint16Array%');
      def('Uint32Array', '%Uint32Array%');
      def('URIError', '%URIError%');
      def('WeakMap', '%WeakMap%');
      def('WeakSet', '%WeakSet%');

      // http://www.ecma-international.org/ecma-262/#sec-other-properties-of-the-global-object
      def('Atomics', '%Atomics%');
      def('JSON', '%JSON%');
      def('Math', '%Math%');
      def('Reflect', '%Reflect%');
    })(this, realm);

    // 11. Create any implementation-defined global object properties on globalObj.
    // 12. Return NormalCompletion(empty).

    this.logger.info('Finished initializing realm');
  }

  public async loadEntryFile(opts: IOptions): Promise<$SourceFile> {
    this.logger.info(`Loading entry file: ${JSON.stringify(opts)}`);

    const pkg = await this.loadEntryPackage(opts);

    this.logger.info(`Finished loading entry file`);

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
          // tsconfig allows some stuff that's not valid JSON, so parse it as a JS object instead
          const tsConfigObj = new Function(`return ${tsConfigText}`)();
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
