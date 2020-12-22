"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceHost = exports.EntrySourceFileProvider = exports.SpecificSourceFileProvider = void 0;
const kernel_1 = require("@aurelia/kernel");
const path_1 = require("path");
const typescript_1 = require("typescript");
const jsdom_1 = require("jsdom");
const interfaces_js_1 = require("./system/interfaces.js");
const path_utils_js_1 = require("./system/path-utils.js");
const npm_package_loader_js_1 = require("./system/npm-package-loader.js");
const file_system_js_1 = require("./system/file-system.js");
const realm_js_1 = require("./vm/realm.js");
const modules_js_1 = require("./vm/ast/modules.js");
const pattern_matcher_js_1 = require("./system/pattern-matcher.js");
const agent_js_1 = require("./vm/agent.js");
function comparePathLength(a, b) {
    return a.path.length - b.path.length;
}
class SpecificSourceFileProvider {
    constructor(host, file, mode) {
        this.host = host;
        this.file = file;
        this.mode = mode;
    }
    async GetSourceFiles(ctx) {
        return [
            await this.host.loadSpecificFile(ctx, this.file, this.mode),
        ];
    }
}
exports.SpecificSourceFileProvider = SpecificSourceFileProvider;
class EntrySourceFileProvider {
    constructor(host, dir) {
        this.host = host;
        this.dir = dir;
    }
    async GetSourceFiles(ctx) {
        return [
            await this.host.loadEntryFile(ctx, this.dir),
        ];
    }
}
exports.EntrySourceFileProvider = EntrySourceFileProvider;
class ServiceHost {
    constructor(container, logger = container.get(kernel_1.ILogger), fs = container.get(interfaces_js_1.IFileSystem)) {
        this.container = container;
        this.logger = logger;
        this.fs = fs;
        this._jsdom = null;
        this.compilerOptionsCache = new Map();
        this.moduleCache = new Map();
        this.scriptCache = new Map();
        this.agent = new agent_js_1.Agent(logger);
    }
    get jsdom() {
        let jsdom = this._jsdom;
        if (jsdom === null) {
            jsdom = this._jsdom = new jsdom_1.JSDOM('');
        }
        return jsdom;
    }
    async loadEntryFile(ctx, dir) {
        this.logger.info(`Loading entry file at: ${dir}`);
        const pkg = await this.loadEntryPackage(dir);
        this.logger.info(`Finished loading entry file`);
        return this.getESModule(ctx, pkg.entryFile, pkg);
    }
    async loadSpecificFile(ctx, file, mode) {
        if (mode === 'module') {
            return this.getESModule(ctx, file, null);
        }
        else {
            return this.getESScript(ctx, file);
        }
    }
    executeEntryFile(dir) {
        const container = this.container.createChild();
        container.register(kernel_1.Registration.instance(agent_js_1.ISourceFileProvider, new EntrySourceFileProvider(this, dir)));
        return this.agent.RunJobs(container);
    }
    executeSpecificFile(file, mode) {
        const container = this.container.createChild();
        container.register(kernel_1.Registration.instance(agent_js_1.ISourceFileProvider, new SpecificSourceFileProvider(this, file, mode)));
        return this.agent.RunJobs(container);
    }
    executeProvider(provider) {
        const container = this.container.createChild();
        container.register(kernel_1.Registration.instance(agent_js_1.ISourceFileProvider, provider));
        return this.agent.RunJobs(container);
    }
    // http://www.ecma-international.org/ecma-262/#sec-hostresolveimportedmodule
    ResolveImportedModule(ctx, referencingModule, $specifier) {
        const specifier = path_utils_js_1.normalizePath($specifier['[[Value]]']);
        const isRelative = path_utils_js_1.isRelativeModulePath(specifier);
        const pkg = referencingModule.pkg;
        // Single file scenario; lazily resolve the import
        if (pkg === null) {
            if (!isRelative) {
                throw new Error(`Absolute module resolution not yet implemented for single-file scenario.`);
            }
            // TODO: this is currently just for the 262 test suite but we need to resolve the other stuff properly too for end users that don't want to use the package eager load mechanism
            const dir = referencingModule.$file.dir;
            const ext = '.js';
            const name = path_1.basename(specifier);
            const shortName = name.slice(0, -3);
            const path = path_utils_js_1.joinPath(dir, name);
            const file = new file_system_js_1.File(this.fs, path, dir, specifier, name, shortName, ext);
            return this.getESModule(ctx, file, null);
        }
        if (isRelative) {
            this.logger.debug(`[ResolveImport] resolving internal relative module: '${$specifier['[[Value]]']}' for ${referencingModule.$file.name}`);
            const filePath = path_utils_js_1.resolvePath(path_1.dirname(referencingModule.$file.path), specifier);
            const files = pkg.files.filter(x => x.shortPath === filePath || x.path === filePath).sort(comparePathLength);
            if (files.length === 0) {
                throw new Error(`Cannot find file "${filePath}" (imported as "${specifier}" by "${referencingModule.$file.name}")`);
            }
            let file = files.find(x => x.kind === 1 /* Script */);
            if (file === void 0) {
                // TODO: make this less messy/patchy
                file = files.find(x => x.kind === 2 /* Markup */);
                if (file === void 0) {
                    file = files[0];
                    let deferred = this.moduleCache.get(file.path);
                    if (deferred === void 0) {
                        deferred = new realm_js_1.DeferredModule(file, ctx.Realm);
                        this.moduleCache.set(file.path, deferred);
                    }
                    return deferred;
                }
                return this.getHTMLModule(ctx, file, pkg);
            }
            return this.getESModule(ctx, file, pkg);
        }
        else {
            const pkgDep = pkg.deps.find(n => n.refName === specifier || specifier.startsWith(`${n.refName}/`));
            if (pkgDep === void 0) {
                this.logger.debug(`[ResolveImport] resolving internal absolute module: '${$specifier['[[Value]]']}' for ${referencingModule.$file.name}`);
                const matcher = pattern_matcher_js_1.PatternMatcher.getOrCreate(referencingModule.compilerOptions, this.container);
                if (matcher !== null) {
                    const file = matcher.findMatch(pkg.files, specifier);
                    return this.getESModule(ctx, file, pkg);
                }
                else {
                    throw new Error(`Cannot resolve absolute file path without path mappings in tsconfig`);
                }
            }
            else {
                this.logger.debug(`[ResolveImport] resolving external absolute module: '${$specifier['[[Value]]']}' for ${referencingModule.$file.name}`);
                const externalPkg = pkg.loader.getCachedPackage(pkgDep.refName);
                if (pkgDep.refName !== specifier) {
                    if (externalPkg.entryFile.shortName === specifier) {
                        return this.getESModule(ctx, externalPkg.entryFile, externalPkg);
                    }
                    let file = externalPkg.files.find(x => x.shortPath === externalPkg.dir && x.ext === '.js');
                    if (file === void 0) {
                        const indexModulePath = path_utils_js_1.joinPath(externalPkg.dir, 'index');
                        file = externalPkg.files.find(f => f.shortPath === indexModulePath && f.ext === '.js');
                        if (file === void 0) {
                            const partialAbsolutePath = path_utils_js_1.joinPath('node_modules', specifier);
                            file = externalPkg.files.find(f => f.shortPath.endsWith(partialAbsolutePath) && f.ext === '.js');
                            if (file === void 0) {
                                throw new Error(`Unable to resolve file "${externalPkg.dir}" or "${indexModulePath}" (refName="${pkgDep.refName}", entryFile="${externalPkg.entryFile.shortPath}", specifier=${specifier})`);
                            }
                        }
                    }
                    return this.getESModule(ctx, file, externalPkg);
                }
                else {
                    return this.getESModule(ctx, externalPkg.entryFile, externalPkg);
                }
            }
        }
    }
    dispose() {
        this.agent.dispose();
        this.agent = void 0;
        this.compilerOptionsCache.clear();
        this.compilerOptionsCache = void 0;
        for (const mod of this.moduleCache.values()) {
            mod.dispose();
        }
        this.moduleCache.clear();
        this.moduleCache = void 0;
        this.container = void 0;
    }
    loadEntryPackage(dir) {
        this.logger.trace(`loadEntryPackage(${dir})`);
        const loader = this.container.get(npm_package_loader_js_1.NPMPackageLoader);
        return loader.loadEntryPackage(dir);
    }
    getHTMLModule(ctx, file, pkg) {
        let hm = this.moduleCache.get(file.path);
        if (hm === void 0) {
            const sourceText = file.getContentSync();
            const template = this.jsdom.window.document.createElement('template');
            template.innerHTML = sourceText;
            hm = new modules_js_1.$DocumentFragment(this.logger, file, template.content, ctx.Realm, pkg);
            this.moduleCache.set(file.path, hm);
        }
        return hm;
    }
    getESScript(ctx, file) {
        let script = this.scriptCache.get(file.path);
        if (script === void 0) {
            const sourceText = file.getContentSync();
            const sf = typescript_1.createSourceFile(file.path, sourceText, typescript_1.ScriptTarget.Latest, false);
            script = new modules_js_1.$ESScript(this.logger, file, sf, ctx.Realm);
            this.scriptCache.set(file.path, script);
        }
        return script;
    }
    getESModule(ctx, file, pkg) {
        let esm = this.moduleCache.get(file.path);
        if (esm === void 0) {
            const compilerOptions = this.getCompilerOptions(file.path, pkg);
            const sourceText = file.getContentSync();
            const sf = typescript_1.createSourceFile(file.path, sourceText, typescript_1.ScriptTarget.Latest, false);
            esm = new modules_js_1.$ESModule(this.logger, file, sf, ctx.Realm, pkg, this, compilerOptions);
            this.moduleCache.set(file.path, esm);
        }
        return esm;
    }
    getCompilerOptions(path, pkg) {
        // TODO: this is a very simple/naive impl, needs more work for inheritance etc
        path = path_utils_js_1.normalizePath(path);
        let compilerOptions = this.compilerOptionsCache.get(path);
        if (compilerOptions === void 0) {
            const dir = path_utils_js_1.normalizePath(path_1.dirname(path));
            if (dir === path || pkg === null /* TODO: maybe still try to find tsconfig? */) {
                compilerOptions = {
                    __dirname: '',
                };
            }
            else {
                const tsConfigPath = path_utils_js_1.joinPath(path, 'tsconfig.json');
                const tsConfigFile = pkg.files.find(x => x.path === tsConfigPath);
                if (tsConfigFile === void 0) {
                    compilerOptions = this.getCompilerOptions(dir, pkg);
                }
                else {
                    const tsConfigText = tsConfigFile.getContentSync();
                    // tsconfig allows some stuff that's not valid JSON, so parse it as a JS object instead
                    // eslint-disable-next-line no-new-func,@typescript-eslint/no-implied-eval
                    const tsConfigObj = new Function(`return ${tsConfigText}`)();
                    compilerOptions = tsConfigObj.compilerOptions;
                    if (compilerOptions === null || typeof compilerOptions !== 'object') {
                        compilerOptions = {
                            __dirname: tsConfigFile.dir,
                        };
                    }
                    else {
                        compilerOptions.__dirname = tsConfigFile.dir;
                    }
                }
            }
            this.compilerOptionsCache.set(path, compilerOptions);
        }
        return compilerOptions;
    }
}
exports.ServiceHost = ServiceHost;
//# sourceMappingURL=service-host.js.map