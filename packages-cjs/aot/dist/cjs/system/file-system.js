"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeFileSystem = exports.File = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const kernel_1 = require("@aurelia/kernel");
const path_utils_js_1 = require("./path-utils.js");
const { access, lstat, mkdir, readdir, readFile, realpath, rmdir, stat, unlink, writeFile, } = fs_1.promises;
function compareFilePath(a, b) {
    return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
}
function shouldTraverse(path) {
    // By default convention we don't traverse any path that starts with a dot because those shouldn't contain application code
    // For example: .git, .vscode, .circleci, etc.
    // We also exclude node_modules. But everything else is traversed by default.
    // TODO: make this configurable
    return path.charCodeAt(0) !== 46 /* Dot */ && path !== 'node_modules';
}
class File {
    constructor(fs, 
    /**
     * The full, absolute, real path to the file.
     *
     * @example
     * 'd:/foo/bar.ts' // 'd:/foo/bar.ts' is the path
     */
    path, 
    /**
     * The full, absolute, real path to the folder containing the file.
     *
     * @example
     * 'd:/foo/bar.ts' // 'd:/foo' is the path
     */
    dir, 
    /**
     * A loosely defined human-readable identifier for the file, usually with the common root directory removed for improved clarity in logs.
     */
    rootlessPath, 
    /**
     * The leaf file name, including the extension.
     *
     * @example
     * './foo/bar.ts' // 'bar.ts' is the name
     */
    name, 
    /**
     * The leaf file name, excluding the extension.
     *
     * @example
     * './foo/bar.ts' // 'bar' is the shortName
     */
    shortName, 
    /**
     * The file extension, including the period. For .d.ts files, the whole part ".d.ts" must be included.
     *
     * @example
     * './foo/bar.ts' // '.ts' is the extension
     * './foo/bar.d.ts' // '.d.ts' is the extension
     */
    ext) {
        this.fs = fs;
        this.path = path;
        this.dir = dir;
        this.rootlessPath = rootlessPath;
        this.name = name;
        this.shortName = shortName;
        this.ext = ext;
        this.shortPath = `${dir}/${shortName}`;
        switch (ext) {
            case '.js':
            case '.ts':
            case '.d.ts':
            case '.jsx':
            case '.tsx':
                this.kind = 1 /* Script */;
                break;
            case '.html':
                this.kind = 2 /* Markup */;
                break;
            case '.css':
                this.kind = 3 /* Style */;
                break;
            case '.json':
                this.kind = 4 /* JSON */;
                break;
            default:
                this.kind = 0 /* Unknown */;
        }
    }
    static getExtension(name) {
        const lastDotIndex = name.lastIndexOf('.');
        if (lastDotIndex <= 0) {
            return void 0;
        }
        const lastPart = name.slice(lastDotIndex);
        switch (lastPart) {
            case '.ts':
                return name.endsWith('.d.ts') ? '.d.ts' : '.ts';
            case '.map': {
                const extensionlessName = name.slice(0, lastDotIndex);
                const secondDotIndex = extensionlessName.lastIndexOf('.');
                if (secondDotIndex === -1) {
                    return void 0;
                }
                return name.slice(secondDotIndex);
            }
            default:
                return lastPart;
        }
    }
    getContent(cache = false, force = false) {
        return this.fs.readFile(this.path, "utf8" /* utf8 */, cache, force);
    }
    getContentSync(cache = false, force = false) {
        return this.fs.readFileSync(this.path, "utf8" /* utf8 */, cache, force);
    }
}
exports.File = File;
const tick = {
    current: void 0,
    wait() {
        if (tick.current === void 0) {
            tick.current = new Promise(function (resolve) {
                setTimeout(function () {
                    tick.current = void 0;
                    resolve();
                });
            });
        }
        return tick.current;
    }
};
let NodeFileSystem = class NodeFileSystem {
    constructor(logger) {
        this.logger = logger;
        this.childrenCache = new Map();
        this.realPathCache = new Map();
        this.contentCache = new Map();
        this.pendingReads = 0;
        this.maxConcurrentReads = 0;
        this.logger = logger.scopeTo(this.constructor.name);
        this.logger.info('constructor');
    }
    async realpath(path) {
        this.logger.trace(`realpath(path: ${path})`);
        return realpath(path);
    }
    realpathSync(path) {
        this.logger.trace(`realpathSync(path: ${path})`);
        return fs_1.realpathSync(path);
    }
    async readdir(path, withFileTypes) {
        this.logger.trace(`readdir(path: ${path}, withFileTypes: ${withFileTypes})`);
        if (withFileTypes === true) {
            return readdir(path, { withFileTypes: true });
        }
        return readdir(path);
    }
    readdirSync(path, withFileTypes) {
        this.logger.trace(`readdirSync(path: ${path}, withFileTypes: ${withFileTypes})`);
        if (withFileTypes === true) {
            return fs_1.readdirSync(path, { withFileTypes: true });
        }
        return fs_1.readdirSync(path);
    }
    async mkdir(path) {
        this.logger.trace(`mkdir(path: ${path})`);
        return mkdir(path, { recursive: true });
    }
    mkdirSync(path) {
        this.logger.trace(`mkdirSync(path: ${path})`);
        fs_1.mkdirSync(path, { recursive: true });
    }
    async isReadable(path) {
        this.logger.trace(`isReadable(path: ${path})`);
        try {
            await access(path, fs_1.constants.F_OK);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    isReadableSync(path) {
        this.logger.trace(`isReadableSync(path: ${path})`);
        try {
            fs_1.accessSync(path, fs_1.constants.F_OK);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    async fileExists(path) {
        this.logger.trace(`fileExists(path: ${path})`);
        try {
            return (await stat(path)).isFile();
        }
        catch (err) {
            return false;
        }
    }
    fileExistsSync(path) {
        this.logger.trace(`fileExistsSync(path: ${path})`);
        try {
            return fs_1.statSync(path).isFile();
        }
        catch (err) {
            return false;
        }
    }
    async stat(path) {
        this.logger.trace(`stat(path: ${path})`);
        return stat(path);
    }
    statSync(path) {
        this.logger.trace(`statSync(path: ${path})`);
        return fs_1.statSync(path);
    }
    async lstat(path) {
        this.logger.trace(`lstat(path: ${path})`);
        return lstat(path);
    }
    lstatSync(path) {
        this.logger.trace(`lstatSync(path: ${path})`);
        return fs_1.lstatSync(path);
    }
    async readFile(path, encoding, cache = false, force = false) {
        this.logger.trace(`readFile(path: ${path}, encoding: ${encoding}, cache: ${cache}, force: ${force})`);
        const contentCache = this.contentCache;
        let content = contentCache.get(path);
        if (content === void 0 || force) {
            try {
                while (this.maxConcurrentReads > 0 && this.maxConcurrentReads < this.pendingReads) {
                    // eslint-disable-next-line no-await-in-loop
                    await tick.wait();
                }
                ++this.pendingReads;
                content = await readFile(path, encoding);
                --this.pendingReads;
            }
            catch (err) {
                if (err.code === 'EMFILE') {
                    --this.pendingReads;
                    this.maxConcurrentReads = this.pendingReads;
                    await tick.wait();
                    return this.readFile(path, encoding, cache, force);
                }
                throw err;
            }
            if (cache) {
                contentCache.set(path, content);
            }
        }
        return content;
    }
    readFileSync(path, encoding, cache = false, force = false) {
        this.logger.trace(`readFileSync(path: ${path}, encoding: ${encoding}, cache: ${cache}, force: ${force})`);
        const contentCache = this.contentCache;
        let content = contentCache.get(path);
        if (content === void 0 || force) {
            content = fs_1.readFileSync(path, encoding);
            if (cache) {
                contentCache.set(path, content);
            }
        }
        return content;
    }
    async ensureDir(path) {
        this.logger.trace(`ensureDir(path: ${path})`);
        if (await new Promise(res => { fs_1.exists(path, res); })) {
            return;
        }
        return this.mkdir(path);
    }
    ensureDirSync(path) {
        this.logger.trace(`ensureDirSync(path: ${path})`);
        if (fs_1.existsSync(path)) {
            return;
        }
        this.mkdirSync(path);
    }
    async writeFile(path, content, encoding) {
        this.logger.trace(`writeFile(path: ${path}, content: ${content}, encoding: ${encoding})`);
        await this.ensureDir(path_1.dirname(path));
        return writeFile(path, content, { encoding: encoding });
    }
    writeFileSync(path, content, encoding) {
        this.logger.trace(`readFileSync(path: ${path}, content: ${content}, encoding: ${encoding})`);
        this.ensureDirSync(path_1.dirname(path));
        fs_1.writeFileSync(path, content, encoding);
    }
    async rimraf(path) {
        this.logger.trace(`rimraf(path: ${path})`);
        try {
            const stats = await lstat(path);
            if (stats.isDirectory()) {
                await Promise.all((await readdir(path)).map(async (x) => this.rimraf(path_1.join(path, x))));
                await rmdir(path);
            }
            else if (stats.isFile() || stats.isSymbolicLink()) {
                await unlink(path);
            }
        }
        catch (err) {
            this.logger.error(`rimraf failed`, err);
        }
    }
    async getRealPath(path) {
        path = path_utils_js_1.normalizePath(path);
        const realPathCache = this.realPathCache;
        let real = realPathCache.get(path);
        if (real === void 0) {
            real = path_utils_js_1.normalizePath(await realpath(path));
            realPathCache.set(path, real);
        }
        return real;
    }
    getRealPathSync(path) {
        path = path_utils_js_1.normalizePath(path);
        const realPathCache = this.realPathCache;
        let real = realPathCache.get(path);
        if (real === void 0) {
            real = path_utils_js_1.normalizePath(fs_1.realpathSync(path));
            realPathCache.set(path, real);
        }
        return real;
    }
    async getChildren(path) {
        const childrenCache = this.childrenCache;
        let children = childrenCache.get(path);
        if (children === void 0) {
            children = (await readdir(path)).filter(shouldTraverse);
            childrenCache.set(path, children);
        }
        return children;
    }
    getChildrenSync(path) {
        const childrenCache = this.childrenCache;
        let children = childrenCache.get(path);
        if (children === void 0) {
            children = fs_1.readdirSync(path).filter(shouldTraverse);
            childrenCache.set(path, children);
        }
        return children;
    }
    async getFiles(root, loadContent = false) {
        const files = [];
        const seen = {};
        const walk = async (dir, name) => {
            const path = await this.getRealPath(path_utils_js_1.joinPath(dir, name));
            if (seen[path] === void 0) {
                seen[path] = true;
                const stats = await stat(path);
                if (stats.isFile()) {
                    const ext = File.getExtension(path);
                    if (ext !== void 0) {
                        const rootlessPath = path.slice(path_1.dirname(root).length);
                        const shortName = name.slice(0, -ext.length);
                        const file = new File(this, path, dir, rootlessPath, name, shortName, ext);
                        if (loadContent) {
                            await this.readFile(path, "utf8" /* utf8 */, true);
                        }
                        files.push(file);
                    }
                }
                else if (stats.isDirectory()) {
                    await Promise.all((await this.getChildren(path)).map(async (x) => walk(path, x)));
                }
            }
        };
        await Promise.all((await this.getChildren(root)).map(async (x) => walk(root, x)));
        return files.sort(compareFilePath);
    }
    getFilesSync(root, loadContent = false) {
        const files = [];
        const seen = {};
        const walk = (dir, name) => {
            const path = this.getRealPathSync(path_utils_js_1.joinPath(dir, name));
            if (seen[path] === void 0) {
                seen[path] = true;
                const stats = fs_1.statSync(path);
                if (stats.isFile()) {
                    const ext = File.getExtension(path);
                    if (ext !== void 0) {
                        const rootlessPath = path.slice(path_1.dirname(root).length);
                        const shortName = name.slice(0, -ext.length);
                        const file = new File(this, path, dir, rootlessPath, name, shortName, ext);
                        if (loadContent) {
                            this.readFileSync(path, "utf8" /* utf8 */, true);
                        }
                        files.push(file);
                    }
                }
                else if (stats.isDirectory()) {
                    this.getChildrenSync(path).forEach(x => { walk(path, x); });
                }
            }
        };
        this.getChildrenSync(root).forEach(x => { walk(root, x); });
        return files.sort(compareFilePath);
    }
};
NodeFileSystem = __decorate([
    __param(0, kernel_1.ILogger)
], NodeFileSystem);
exports.NodeFileSystem = NodeFileSystem;
//# sourceMappingURL=file-system.js.map