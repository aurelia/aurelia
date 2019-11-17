/* eslint-disable */
import { ILogger, IContainer, DI, LoggerConfiguration, LogLevel, ColorOptions, Registration } from '@aurelia/kernel';
import { I$Node, $SourceFile, $TemplateExpression, $TaggedTemplateExpression, $DocumentFragment } from './ast';
import { IFileSystem, FileKind, IFile, IOptions } from '../system/interfaces';
import { NodeFileSystem, File } from '../system/file-system';
import { NPMPackage, NPMPackageLoader } from '../system/npm-package-loader';
import { createSourceFile, ScriptTarget, CompilerOptions } from 'typescript';
import { normalizePath, isRelativeModulePath, resolvePath, joinPath } from '../system/path-utils';
import { dirname, basename } from 'path';
import { Intrinsics } from './intrinsics';
import { $EnvRec, $ModuleEnvRec, $GlobalEnvRec, $FunctionEnvRec } from './types/environment-record';
import { $PropertyDescriptor } from './types/property-descriptor';
import { $DefinePropertyOrThrow } from './operations';
import { JSDOM } from 'jsdom';
import { $String } from './types/string';
import { $Undefined } from './types/undefined';
import { $Object } from './types/object';
import { $Reference } from './types/reference';
import { $Any, $AnyNonEmpty } from './types/_shared';
import { $Function } from './types/function';
import { $Null } from './types/null';
import { $Boolean } from './types/boolean';

function comparePathLength(a: { path: { length: number } }, b: { path: { length: number } }): number {
  return a.path.length - b.path.length;
}

export class ResolveSet {
  private readonly modules: IModule[] = [];
  private readonly exportNames: $String[] = [];
  private count: number = 0;

  public has(mod: IModule, exportName: $String): boolean {
    const modules = this.modules;
    const exportNames = this.exportNames;
    const count = this.count;

    for (let i = 0; i < count; ++i) {
      if (exportNames[i].is(exportName) && modules[i] === mod) {
        return true;
      }
    }

    return false;
  }

  public add(mod: IModule, exportName: $String): void {
    const index = this.count;
    this.modules[index] = mod;
    this.exportNames[index] = exportName;
    ++this.count;
  }

  public forEach(callback: (mod: IModule, exportName: $String) => void): void {
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
    public readonly BindingName: $String,
  ) { }
}

// http://www.ecma-international.org/ecma-262/#sec-abstract-module-records
export interface IModule {
  /** This field is never used. Its only purpose is to help TS distinguish this interface from others. */
  readonly '<IModule>': unknown;

  '[[Environment]]': $ModuleEnvRec | $Undefined;
  '[[Namespace]]': $Object | $Undefined;
  '[[HostDefined]]': any;

  readonly realm: Realm;

  ResolveExport(ctx: ExecutionContext, exportName: $String, resolveSet: ResolveSet): ResolvedBindingRecord | null | 'ambiguous';
  GetExportedNames(ctx: ExecutionContext, exportStarSet: Set<IModule>): readonly $String[];
  Instantiate(ctx: ExecutionContext): void;
  /** @internal */
  _InnerModuleInstantiation(ctx: ExecutionContext, stack: IModule[], index: number): number;
}

export class DeferredModule implements IModule {
  public readonly '<IModule>': unknown;

  public '[[Environment]]': $ModuleEnvRec | $Undefined;
  public '[[Namespace]]': $Object | $Undefined;
  public '[[HostDefined]]': any;

  public constructor(
    public readonly $file: IFile,
    public readonly realm: Realm,
  ) { }

  public ResolveExport(ctx: ExecutionContext, exportName: $String, resolveSet: ResolveSet): ResolvedBindingRecord | "ambiguous" | null {
    throw new Error('Method not implemented.');
  }

  public GetExportedNames(ctx: ExecutionContext, exportStarSet: Set<IModule>): readonly $String[] {
    throw new Error('Method not implemented.');
  }

  public Instantiate(ctx: ExecutionContext): void {
    throw new Error('Method not implemented.');
  }

  public _InnerModuleInstantiation(ctx: ExecutionContext, stack: IModule[], index: number): number {
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
  public readonly jsdom: JSDOM;
  public readonly nodes: I$Node[] = [];
  public nodeCount: number = 0;

  public readonly stack: ExecutionContextStack = new ExecutionContextStack();

  public '[[Intrinsics]]': Intrinsics;
  public '[[GlobalObject]]': $Object;
  public '[[GlobalEnv]]': $GlobalEnvRec;
  public '[[TemplateMap]]': { '[[Site]]': $TemplateExpression | $TaggedTemplateExpression; '[[Array]]': $Object }[];


  private readonly compilerOptionsCache: Map<string, CompilerOptions> = new Map();
  private readonly moduleCache: Map<string, IModule> = new Map();

  private constructor(
    public readonly container: IContainer,
    private readonly logger: ILogger,
    private readonly fs: IFileSystem,
  ) {
    this.jsdom = new JSDOM('');
  }

  // http://www.ecma-international.org/ecma-262/#sec-createrealm
  public static Create(container?: IContainer): Realm {
    if (container === void 0) {
      container = DI.createContainer();
      container.register(
        LoggerConfiguration.create(console, LogLevel.info, ColorOptions.colors),
        Registration.singleton(IFileSystem, NodeFileSystem),
      );
    }

    const logger = container.get(ILogger).root.scopeTo('Realm');
    const fs = container.get(IFileSystem);
    logger.debug('Creating new realm');

    // 1. Let realmRec be a new Realm Record.
    const realm = new Realm(container, logger, fs);

    // 2. Perform CreateIntrinsics(realmRec).
    new Intrinsics(realm);

    // 3. Set realmRec.[[GlobalObject]] to undefined.
    realm['[[GlobalObject]]'] = (void 0)!;

    // 4. Set realmRec.[[GlobalEnv]] to undefined.
    realm['[[GlobalEnv]]'] = (void 0)!;

    // 5. Set realmRec.[[TemplateMap]] to a new empty List.
    realm['[[TemplateMap]]'] = [];

    // 6. Return realmRec.

    // http://www.ecma-international.org/ecma-262/#sec-initializehostdefinedrealm

    // 1. Let realm be CreateRealm().
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
    const globalObj = $Object.ObjectCreate(newContext, 'GlobalObject', intrinsics['%ObjectPrototype%']);

    // 8. If the host requires that the this binding in realm's global scope return an object other than the global object, let thisValue be such an object created in an implementation-defined manner. Otherwise, let thisValue be undefined, indicating that realm's global this binding should be the global object.
    const thisValue = globalObj;

    // Note: the two steps above are consolidated with setrealmglobalobject steps

    // 9. Perform SetRealmGlobalObject(realm, global, thisValue).

    // http://www.ecma-international.org/ecma-262/#sec-setrealmglobalobject
    // 1. If globalObj is undefined, then
    // 1. a. Let intrinsics be realmRec.[[Intrinsics]].
    // 1. b. Set globalObj to ObjectCreate(intrinsics.[[%ObjectPrototype%]]).
    // 2. Assert: Type(globalObj) is Object.
    // 3. If thisValue is undefined, set thisValue to globalObj.
    // 4. Set realmRec.[[GlobalObject]] to globalObj.
    realm['[[GlobalObject]]'] = globalObj as $Object;

    // 5. Let newGlobalEnv be NewGlobalEnvironment(globalObj, thisValue).
    const newGlobalEnv = new $GlobalEnvRec(realm, globalObj as $Object, thisValue as $Object);

    // 6. Set realmRec.[[GlobalEnv]] to newGlobalEnv.
    realm['[[GlobalEnv]]'] = newGlobalEnv;

    // 7. Return realmRec.

    // 10. Let globalObj be ? SetDefaultGlobalBindings(realm).
    // http://www.ecma-international.org/ecma-262/#sec-setdefaultglobalbindings

    // 1. Let global be realmRec.[[GlobalObject]].
    const global = realm['[[GlobalObject]]'];

    // 2. For each property of the Global Object specified in clause 18, do
    // 2. a. Let name be the String value of the property name.
    // 2. b. Let desc be the fully populated data property descriptor for the property containing the specified attributes for the property. For properties listed in 18.2, 18.3, or 18.4 the value of the [[Value]] attribute is the corresponding intrinsic object from realmRec.
    // 2. c. Perform ? DefinePropertyOrThrow(global, name, desc).
    // 3. Return global.

    function def(propertyName: string, intrinsicName: keyof Intrinsics): void {
      const name = new $String(realm, propertyName);
      const desc = new $PropertyDescriptor(realm, name);
      desc['[[Writable]]'] = intrinsics.false;
      desc['[[Enumerable]]'] = intrinsics.false;
      desc['[[Configurable]]'] = intrinsics.false;
      desc['[[Value]]'] = intrinsics[intrinsicName];
      $DefinePropertyOrThrow(newContext, global, name, desc);
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

    // 11. Create any implementation-defined global object properties on globalObj.
    // 12. Return NormalCompletion(empty).

    logger.debug('Finished initializing realm');
    return realm;
  }

  public async loadEntryFile(): Promise<$SourceFile> {
    const opts = this.container.get(IOptions);

    this.logger.info(`Loading entry file: ${JSON.stringify(opts)}`);

    const pkg = await this.loadEntryPackage(opts);

    this.logger.info(`Finished loading entry file`);

    return this.getESModule(pkg.entryFile, pkg);
  }

  public async loadFile(file: IFile): Promise<$SourceFile> {
    return this.getESModule(file, null)
  }

  // http://www.ecma-international.org/ecma-262/#sec-hostresolveimportedmodule
  public HostResolveImportedModule(referencingModule: $SourceFile, $specifier: $String): IModule {
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
      return this.getESModule(file, null);
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
            deferred = new DeferredModule(file, this);
            this.moduleCache.set(file.path, deferred);
          }

          return deferred;
        }

        return this.getHTMLModule(file, pkg);
      }

      return this.getESModule(file, pkg);
    } else {
      const pkgDep = pkg.deps.find(n => n.refName === specifier || specifier.startsWith(n.refName + '/'));
      if (pkgDep === void 0) {
        this.logger.debug(`[ResolveImport] resolving internal absolute module: '${$specifier['[[Value]]']}' for ${referencingModule.$file.name}`);

        if (referencingModule.matcher !== null) {
          const file = referencingModule.matcher.findMatch(pkg.files, specifier);
          return this.getESModule(file, pkg);
        } else {
          throw new Error(`Cannot resolve absolute file path without path mappings in tsconfig`);
        }
      } else {
        this.logger.debug(`[ResolveImport] resolving external absolute module: '${$specifier['[[Value]]']}' for ${referencingModule.$file.name}`);

        const externalPkg = pkg.loader.getCachedPackage(pkgDep.refName);
        if (pkgDep.refName !== specifier) {
          if (externalPkg.entryFile.shortName === specifier) {
            return this.getESModule(externalPkg.entryFile, externalPkg);
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

          return this.getESModule(file, externalPkg);
        } else {
          return this.getESModule(externalPkg.entryFile, externalPkg);
        }
      }
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-getactivescriptormodule
  public GetActiveScriptOrModule(): $SourceFile {
    const stack = this.stack;

    // 1. If the execution context stack is empty, return null.
    if (stack.length === 0) {
      // We're throwing here for now. Not sure in which scenario this could be null that would not throw at some point.
      throw new Error(`GetActiveScriptOrModule: stack is empty`);
    }

    // 2. Let ec be the topmost execution context on the execution context stack whose ScriptOrModule component is not null.
    let ec: ExecutionContext;
    let i = stack.length;
    while (i-- > 0) {
      ec = stack[i];
      if (!ec.ScriptOrModule.isNull) {
        return ec.ScriptOrModule;
      }
    }

    // 3. If no such execution context exists, return null. Otherwise, return ec's ScriptOrModule component.

    // We're throwing here for now. Not sure in which scenario this could be null that would not throw at some point.
    throw new Error(`GetActiveScriptOrModule: stack has no execution context with an active module`);
  }

  // http://www.ecma-international.org/ecma-262/#sec-resolvebinding
  public ResolveBinding(name: $String, env?: $EnvRec): $Reference {
    // 1. If env is not present or if env is undefined, then
    if (env === void 0) {
      // 1. a. Set env to the running execution context's LexicalEnvironment.
      env = this.stack.top.LexicalEnvironment;
    }

    // 2. Assert: env is a Lexical Environment.
    // 3. If the code matching the syntactic production that is being evaluated is contained in strict mode code, let strict be true, else let strict be false.
    const strict = this['[[Intrinsics]]'].true; // TODO: pass strict mode from source node

    // 4. Return ? GetIdentifierReference(env, name, strict).
    return this.GetIdentifierReference(env, name, strict);
  }

  // http://www.ecma-international.org/ecma-262/#sec-getthisenvironment
  public GetThisEnvironment(): $FunctionEnvRec | $GlobalEnvRec | $ModuleEnvRec {
    // 1. Let lex be the running execution context's LexicalEnvironment.
    let envRec = this.stack.top.LexicalEnvironment;

    // 2. Repeat,
    while (true) {
      // 2. a. Let envRec be lex's EnvironmentRecord.
      // 2. b. Let exists be envRec.HasThisBinding().
      if (envRec.HasThisBinding(this.stack.top).isTruthy) {
        // 2. c. If exists is true, return envRec.
        return envRec as $FunctionEnvRec | $GlobalEnvRec | $ModuleEnvRec;
      }

      // 2. d. Let outer be the value of lex's outer environment reference.
      // 2. e. Assert: outer is not null.
      // 2. f. Set lex to outer.
      envRec = envRec.outer as $EnvRec;
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-resolvethisbinding
  public ResolveThisBinding(): $AnyNonEmpty {
    // 1. Let envRec be GetThisEnvironment().
    const envRec = this.GetThisEnvironment();

    // 2. Return ? envRec.GetThisBinding().
    return envRec.GetThisBinding(this.stack.top);
  }

  // #region helper methods
  public GetCurrentLexicalEnvironment(): $EnvRec {
    return this.stack.top.LexicalEnvironment;
  }
  public SetCurrentLexicalEnvironment(envRec: $EnvRec) {
    this.stack.top.LexicalEnvironment = envRec;
  }
  // #endregion

  public registerNode(node: I$Node): number {
    const id = this.nodeCount;
    this.nodes[id] = node;
    ++this.nodeCount;
    return id;
  }

  // http://www.ecma-international.org/ecma-262/#sec-getidentifierreference
  private GetIdentifierReference(
    lex: $EnvRec | $Null,
    name: $String,
    strict: $Boolean,
  ): $Reference {
    const intrinsics = this['[[Intrinsics]]'];

    // 1. If lex is the value null, then
    if (lex.isNull) {
      // 1. a. Return a value of type Reference whose base value component is undefined, whose referenced name component is name, and whose strict reference flag is strict.
      return new $Reference(this, intrinsics.undefined, name, strict, intrinsics.undefined);
    }

    // 2. Let envRec be lex's EnvironmentRecord.
    const envRec = lex;

    // 3. Let exists be ? envRec.HasBinding(name).
    const exists = envRec.HasBinding(this.stack.top, name);

    // 4. If exists is true, then
    if (exists.isTruthy) {
      // 4. a. Return a value of type Reference whose base value component is envRec, whose referenced name component is name, and whose strict reference flag is strict.
      return new $Reference(this, envRec, name, strict, intrinsics.undefined);
    }
    // 5. Else,
    else {
      // 5. a. Let outer be the value of lex's outer environment reference.
      const outer = lex.outer;

      // 5. b. Return ? GetIdentifierReference(outer, name, strict).
      return this.GetIdentifierReference(outer, name, strict);
    }
  }

  private loadEntryPackage(opts: IOptions): Promise<NPMPackage> {
    this.logger.trace(`loadEntryPackage(${JSON.stringify(opts)})`);

    const loader = this.container.get(NPMPackageLoader);

    return loader.loadEntryPackage(opts.rootDir);
  }

  private getHTMLModule(file: IFile, pkg: NPMPackage): $DocumentFragment {
    let hm = this.moduleCache.get(file.path);
    if (hm === void 0) {
      const sourceText = file.getContentSync();
      const template = this.jsdom.window.document.createElement('template');
      template.innerHTML = sourceText;
      hm = new $DocumentFragment(file, template.content, this, pkg);

      this.moduleCache.set(file.path, hm);
    }

    return hm as $DocumentFragment;
  }

  private getESModule(file: IFile, pkg: NPMPackage | null): $SourceFile {
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

  private getCompilerOptions(path: string, pkg: NPMPackage | null): CompilerOptions {
    // TODO: this is a very simple/naive impl, needs more work for inheritance etc
    path = normalizePath(path);

    let compilerOptions = this.compilerOptionsCache.get(path);
    if (compilerOptions === void 0) {
      const dir = normalizePath(dirname(path));
      if (dir === path || pkg === null/* TODO: maybe still try to find tsconfig? */) {
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

export class ExecutionContext {
  public Function!: $Function | $Null;
  public Realm!: Realm;
  public ScriptOrModule!: $SourceFile | $Null;
  public LexicalEnvironment!: $EnvRec;
  public VariableEnvironment!: $EnvRec;

  public suspend(): void {

  }
}
