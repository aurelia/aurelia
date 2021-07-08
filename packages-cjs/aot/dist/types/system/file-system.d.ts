/// <reference types="node" />
import { Dirent, Stats } from 'fs';
import { ILogger } from '@aurelia/kernel';
import { FileKind, IFileSystem, IFile, Encoding } from './interfaces.js';
export declare class File implements IFile {
    private readonly fs;
    /**
     * The full, absolute, real path to the file.
     *
     * @example
     * 'd:/foo/bar.ts' // 'd:/foo/bar.ts' is the path
     */
    readonly path: string;
    /**
     * The full, absolute, real path to the folder containing the file.
     *
     * @example
     * 'd:/foo/bar.ts' // 'd:/foo' is the path
     */
    readonly dir: string;
    /**
     * A loosely defined human-readable identifier for the file, usually with the common root directory removed for improved clarity in logs.
     */
    readonly rootlessPath: string;
    /**
     * The leaf file name, including the extension.
     *
     * @example
     * './foo/bar.ts' // 'bar.ts' is the name
     */
    readonly name: string;
    /**
     * The leaf file name, excluding the extension.
     *
     * @example
     * './foo/bar.ts' // 'bar' is the shortName
     */
    readonly shortName: string;
    /**
     * The file extension, including the period. For .d.ts files, the whole part ".d.ts" must be included.
     *
     * @example
     * './foo/bar.ts' // '.ts' is the extension
     * './foo/bar.d.ts' // '.d.ts' is the extension
     */
    readonly ext: string;
    /**
     * Similar to `shortName`, but includes the rest of the path including the root.
     *
     * Used for conventional matching, e.g. "try adding .js, .ts, /index.js", etc.
     */
    readonly shortPath: string;
    readonly kind: FileKind;
    constructor(fs: IFileSystem, 
    /**
     * The full, absolute, real path to the file.
     *
     * @example
     * 'd:/foo/bar.ts' // 'd:/foo/bar.ts' is the path
     */
    path: string, 
    /**
     * The full, absolute, real path to the folder containing the file.
     *
     * @example
     * 'd:/foo/bar.ts' // 'd:/foo' is the path
     */
    dir: string, 
    /**
     * A loosely defined human-readable identifier for the file, usually with the common root directory removed for improved clarity in logs.
     */
    rootlessPath: string, 
    /**
     * The leaf file name, including the extension.
     *
     * @example
     * './foo/bar.ts' // 'bar.ts' is the name
     */
    name: string, 
    /**
     * The leaf file name, excluding the extension.
     *
     * @example
     * './foo/bar.ts' // 'bar' is the shortName
     */
    shortName: string, 
    /**
     * The file extension, including the period. For .d.ts files, the whole part ".d.ts" must be included.
     *
     * @example
     * './foo/bar.ts' // '.ts' is the extension
     * './foo/bar.d.ts' // '.d.ts' is the extension
     */
    ext: string);
    static getExtension(name: string): string | undefined;
    getContent(cache?: boolean, force?: boolean): Promise<string>;
    getContentSync(cache?: boolean, force?: boolean): string;
}
export declare class NodeFileSystem implements IFileSystem {
    private readonly logger;
    private readonly childrenCache;
    private readonly realPathCache;
    private readonly contentCache;
    private pendingReads;
    private maxConcurrentReads;
    constructor(logger: ILogger);
    realpath(path: string): Promise<string>;
    realpathSync(path: string): string;
    readdir(path: string): Promise<readonly string[]>;
    readdir(path: string, withFileTypes: true): Promise<readonly Dirent[]>;
    readdirSync(path: string): readonly string[];
    readdirSync(path: string, withFileTypes: true): readonly Dirent[];
    mkdir(path: string): Promise<void>;
    mkdirSync(path: string): void;
    isReadable(path: string): Promise<boolean>;
    isReadableSync(path: string): boolean;
    fileExists(path: string): Promise<boolean>;
    fileExistsSync(path: string): boolean;
    stat(path: string): Promise<Stats>;
    statSync(path: string): Stats;
    lstat(path: string): Promise<Stats>;
    lstatSync(path: string): Stats;
    readFile(path: string, encoding: Encoding, cache?: boolean, force?: boolean): Promise<string>;
    readFileSync(path: string, encoding: Encoding, cache?: boolean, force?: boolean): string;
    ensureDir(path: string): Promise<void>;
    ensureDirSync(path: string): void;
    writeFile(path: string, content: string, encoding: Encoding): Promise<void>;
    writeFileSync(path: string, content: string, encoding: Encoding): void;
    rimraf(path: string): Promise<void>;
    getRealPath(path: string): Promise<string>;
    getRealPathSync(path: string): string;
    getChildren(path: string): Promise<string[]>;
    getChildrenSync(path: string): string[];
    getFiles(root: string, loadContent?: boolean): Promise<File[]>;
    getFilesSync(root: string, loadContent?: boolean): File[];
}
//# sourceMappingURL=file-system.d.ts.map