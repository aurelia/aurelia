"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternMatcher = void 0;
const kernel_1 = require("@aurelia/kernel");
const path_utils_js_1 = require("./path-utils.js");
const lookup = new WeakMap();
class PatternMatcher {
    constructor(logger, compilerOptions) {
        this.logger = logger;
        this.compilerOptions = compilerOptions;
        this.logger = logger.scopeTo(this.constructor.name);
        this.rootDir = path_utils_js_1.resolvePath(compilerOptions.__dirname);
        this.basePath = path_utils_js_1.joinPath(this.rootDir, compilerOptions.baseUrl);
        this.sources = Object.keys(compilerOptions.paths).map(x => new PatternSource(this.logger, this, x));
    }
    findMatch(files, specifier) {
        const sources = this.sources;
        const len = sources.length;
        let match;
        for (let i = 0; i < len; ++i) {
            match = sources[i].findMatch(files, specifier);
            if (match === null) {
                this.logger.trace(`Source pattern "${sources[i].pattern}" (path "${sources[i].patternPath}") is NOT a match for specifier "${specifier}"`);
            }
            else {
                this.logger.debug(`Source pattern "${sources[i].pattern}" is a match for specifier "${specifier}"`);
                return match;
            }
        }
        throw new Error(`Cannot resolve "${specifier}:`);
    }
    static getOrCreate(compilerOptions, container) {
        let matcher = lookup.get(compilerOptions);
        if (matcher === void 0) {
            if (compilerOptions.baseUrl !== void 0 && compilerOptions.paths !== void 0) {
                const logger = container.get(kernel_1.ILogger);
                matcher = new PatternMatcher(logger, compilerOptions);
            }
            else {
                matcher = null;
            }
            lookup.set(compilerOptions, matcher);
        }
        return matcher;
    }
}
exports.PatternMatcher = PatternMatcher;
class PatternSource {
    constructor(logger, matcher, pattern) {
        this.logger = logger;
        this.matcher = matcher;
        this.pattern = pattern;
        this.logger = logger.scopeTo(this.constructor.name);
        if (pattern.endsWith('*')) {
            this.hasWildcard = true;
            this.patternPath = pattern.slice(0, -1);
        }
        else {
            this.hasWildcard = false;
            this.patternPath = pattern;
        }
        this.isWildcard = pattern === '*';
        this.targets = matcher.compilerOptions.paths[pattern].map(x => new PatternTarget(this.logger, this, x));
    }
    findMatch(files, specifier) {
        if (this.isWildcard) {
            return this.findMatchCore(files, specifier);
        }
        if (this.hasWildcard) {
            if (specifier.startsWith(this.patternPath)) {
                return this.findMatchCore(files, specifier.replace(this.patternPath, ''));
            }
            return null;
        }
        if (this.patternPath === specifier) {
            return this.findMatchCore(files, specifier);
        }
        return null;
    }
    findMatchCore(files, specifier) {
        const targets = this.targets;
        const len = targets.length;
        let target;
        let match = null;
        for (let i = 0; i < len; ++i) {
            target = targets[i];
            match = target.findMatch(files, specifier);
            if (match !== null) {
                return match;
            }
        }
        return null;
    }
}
class PatternTarget {
    constructor(logger, source, pattern) {
        this.logger = logger;
        this.source = source;
        this.pattern = pattern;
        this.logger = logger.scopeTo(this.constructor.name);
        if (pattern.endsWith('*')) {
            this.hasWildcard = true;
            this.patternPath = path_utils_js_1.joinPath(source.matcher.basePath, pattern.slice(0, -1));
        }
        else {
            this.hasWildcard = false;
            this.patternPath = path_utils_js_1.joinPath(source.matcher.basePath, pattern);
        }
    }
    findMatch(files, specifier) {
        const targetPath = this.hasWildcard ? path_utils_js_1.joinPath(this.patternPath, specifier) : this.patternPath;
        const len = files.length;
        let file;
        for (let i = 0; i < len; ++i) {
            file = files[i];
            if (file.shortPath === targetPath || file.path === targetPath) {
                return file;
            }
        }
        return null;
    }
}
//# sourceMappingURL=pattern-matcher.js.map