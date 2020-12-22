"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NPMPackageDependency = exports.NPMPackage = exports.NPMPackageLoader = void 0;
const kernel_1 = require("@aurelia/kernel");
const interfaces_js_1 = require("./interfaces.js");
const path_utils_js_1 = require("./path-utils.js");
const path_1 = require("path");
function countSlashes(path) {
    let count = 0;
    const len = path.length;
    for (let i = 0; i < len; ++i) {
        if (path.charCodeAt(i) === 47 /* Slash */) {
            ++count;
        }
    }
    return count;
}
function createFileComparer(preferredNames) {
    const len = preferredNames.length;
    let name = '';
    return function compareFiles(a, b) {
        const aName = path_1.basename(a.path);
        const bName = path_1.basename(b.path);
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
function determineEntryFileByConvention(files, isPrimaryEntryPoint) {
    if (isPrimaryEntryPoint) {
        return files.slice().sort(compareApplicationEntryFile)[0];
    }
    return files.slice().sort(compareExternalModuleEntryFile)[0];
}
class NPMPackageLoader {
    constructor(container, logger, fs) {
        this.container = container;
        this.logger = logger;
        this.fs = fs;
        this.pkgCache = new Map();
        this.pkgPromiseCache = new Map();
        this.pkgResolveCache = new Map();
        this.pkgResolvePromiseCache = new Map();
        this.logger = logger.root.scopeTo('NPMPackageLoader');
    }
    static get inject() { return [kernel_1.IContainer, kernel_1.ILogger, interfaces_js_1.IFileSystem]; }
    async loadEntryPackage(projectDir) {
        const start = Date.now();
        this.logger.info(`load()`);
        projectDir = path_utils_js_1.normalizePath(projectDir);
        const entryPkg = await this.loadPackageCore(projectDir, null);
        await entryPkg.loadDependencies();
        this.pkgPromiseCache.clear();
        const end = Date.now();
        const packages = Array.from(this.pkgCache.values());
        const pkgCount = packages.length;
        const fileCount = packages.reduce((count, pkg) => count + pkg.files.length, 0);
        this.logger.info(`Discovered ${fileCount} files across ${pkgCount} packages in ${Math.round(end - start)}ms`);
        for (const pkg of packages) {
            this.logger.info(`- ${pkg.pkgName}: ${pkg.files.length} files`);
        }
        return entryPkg;
    }
    getCachedPackage(refName) {
        const pkg = this.pkgCache.get(refName);
        if (pkg === void 0) {
            throw new Error(`Cannot resolve package ${refName}`);
        }
        return pkg;
    }
    /** @internal */
    async loadPackage(issuer) {
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
    async loadPackageCore(dir, issuer) {
        this.logger.info(`loadPackageCore(\n  dir: ${dir},\n  issuer: ${issuer === null ? 'null' : issuer.issuer.pkgName}\n)`);
        const fs = this.fs;
        const pkgCache = this.pkgCache;
        const refName = dir === null ? issuer.refName : dir;
        let pkg = pkgCache.get(refName);
        if (pkg === void 0) {
            if (dir === null) {
                dir = await this.resolvePackagePath(issuer);
            }
            const pkgPath = path_utils_js_1.joinPath(dir, 'package.json');
            const files = await fs.getFiles(dir);
            const pkgJsonFile = files.find(x => x.path === pkgPath);
            if (pkgJsonFile === void 0) {
                throw new Error(`No package.json found at "${pkgPath}"`);
            }
            const pkgJsonFileContent = await pkgJsonFile.getContent();
            pkg = new NPMPackage(this, files, issuer, pkgJsonFile, dir, pkgJsonFileContent);
            pkgCache.set(refName, pkg);
        }
        return pkg;
    }
    async resolvePackagePath(dep) {
        const pkgResolvePromiseCache = this.pkgResolvePromiseCache;
        const refName = dep.refName;
        let resolvePromise = pkgResolvePromiseCache.get(refName);
        if (resolvePromise === void 0) {
            resolvePromise = this.resolvePackagePathCore(dep);
            // Multiple deps may request the same refName to be resolved before one of them finished
            // so we store the promise to ensure the action is only invoked once.
            pkgResolvePromiseCache.set(refName, resolvePromise);
        }
        return resolvePromise;
    }
    async resolvePackagePathCore(dep) {
        const fs = this.fs;
        const pkgResolveCache = this.pkgResolveCache;
        const refName = dep.refName;
        let resolvedPath = pkgResolveCache.get(refName);
        if (resolvedPath === void 0) {
            let dir = dep.issuer.dir;
            while (true) {
                resolvedPath = path_utils_js_1.joinPath(dir, 'node_modules', refName, 'package.json');
                // eslint-disable-next-line no-await-in-loop
                if (await fs.isReadable(resolvedPath)) {
                    break;
                }
                const parent = path_utils_js_1.normalizePath(path_1.dirname(dir));
                if (parent === dir) {
                    throw new Error(`Unable to resolve npm dependency "${refName}"`);
                }
                dir = parent;
            }
            const realPath = path_utils_js_1.normalizePath(await fs.getRealPath(resolvedPath));
            if (realPath === resolvedPath) {
                this.logger.debug(`resolved "${refName}" directly to "${path_1.dirname(realPath)}"`);
            }
            else {
                this.logger.debug(`resolved "${refName}" to "${path_1.dirname(realPath)}" via symlink "${path_1.dirname(resolvedPath)}"`);
            }
            resolvedPath = path_utils_js_1.normalizePath(path_1.dirname(realPath));
            pkgResolveCache.set(refName, resolvedPath);
        }
        return resolvedPath;
    }
}
exports.NPMPackageLoader = NPMPackageLoader;
class NPMPackage {
    constructor(loader, files, issuer, pkgJsonFile, dir, pkgJsonFileContent) {
        this.loader = loader;
        this.files = files;
        this.issuer = issuer;
        this.pkgJsonFile = pkgJsonFile;
        this.dir = dir;
        this.container = loader.container;
        const pkgJson = this.pkgJson = JSON.parse(pkgJsonFileContent);
        const pkgName = this.pkgName = typeof pkgJson.name === 'string' ? pkgJson.name : dir.slice(dir.lastIndexOf('/') + 1);
        const pkgModuleOrMain = typeof pkgJson.module === 'string' ? pkgJson.module : pkgJson.main;
        const isAureliaPkg = this.isAureliaPkg = pkgName.startsWith('@aurelia');
        const isEntryPoint = this.isEntryPoint = issuer === null;
        let entryFilePath = isAureliaPkg ? 'src/index.ts' : pkgModuleOrMain;
        let entryFile;
        if (entryFilePath === void 0) {
            entryFile = determineEntryFileByConvention(files, isEntryPoint);
        }
        else {
            if (entryFilePath.startsWith('.')) {
                entryFilePath = entryFilePath.slice(1);
            }
            entryFile = files.find(x => x.path.endsWith(entryFilePath));
            if (entryFile === void 0) {
                const withJs = `${entryFilePath}.js`;
                entryFile = files.find(x => x.path.endsWith(withJs));
                if (entryFile === void 0) {
                    const withIndexJs = path_utils_js_1.joinPath(entryFilePath, 'index.js');
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
        }
        else {
            this.deps = kernel_1.emptyArray;
        }
    }
    /** @internal */
    async loadDependencies() {
        await Promise.all(this.deps.map(loadDependency));
    }
}
exports.NPMPackage = NPMPackage;
async function loadDependency(dep) {
    await dep.load();
    await dep.pkg.loadDependencies();
}
class NPMPackageDependency {
    constructor(issuer, refName) {
        this.issuer = issuer;
        this.refName = refName;
        this._pkg = void 0;
        this.loadPromise = void 0;
    }
    get pkg() {
        const pkg = this._pkg;
        if (pkg === void 0) {
            throw new Error(`Package ${this.refName} is not yet loaded`);
        }
        return pkg;
    }
    /** @internal */
    async load() {
        if (this._pkg === void 0) {
            if (this.loadPromise === void 0) {
                // Multiple deps may request the same package to load before one of them finished
                // so we store the promise to ensure the action is only invoked once.
                this.loadPromise = this.loadCore();
            }
            return this.loadPromise;
        }
    }
    async loadCore() {
        this._pkg = await this.issuer.loader.loadPackage(this);
        this.loadPromise = void 0;
        // Freeze it as an extra measure to prove that we're not getting race conditions
        Object.freeze(this);
    }
}
exports.NPMPackageDependency = NPMPackageDependency;
//# sourceMappingURL=npm-package-loader.js.map