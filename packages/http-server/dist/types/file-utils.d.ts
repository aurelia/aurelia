/// <reference types="node" />
import { Stats } from "fs";
export declare function readFile(path: string): Promise<Buffer>;
export declare function readFile(path: string, options: string): Promise<string>;
export declare function readFile(path: string, options: {
    encoding: BufferEncoding;
}): Promise<string>;
export declare function readFile(path: string, options: {
    encoding?: null;
}): Promise<Buffer>;
export declare function isReadable(path: string): Promise<boolean>;
export declare function ensureDir(path: string): Promise<void>;
export declare function exists(path: string): Promise<boolean>;
export declare function mkdir(path: string): Promise<void>;
export declare function rimraf(path: string): Promise<void>;
export declare function getStats(path: string): Promise<Stats>;
export declare function readdir(path: string): Promise<string[]>;
export declare function rmdir(path: string): Promise<void>;
export declare function unlink(path: string): Promise<void>;
//# sourceMappingURL=file-utils.d.ts.map