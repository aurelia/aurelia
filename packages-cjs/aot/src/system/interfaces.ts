import {
  DI,
} from '@aurelia/kernel';
import {
  CompilerOptions,
} from 'typescript';

export const enum Encoding {
  utf8 = 'utf8',
  utf16le = 'utf16le',
  latin1 = 'latin1',
  base64 = 'base64',
  ascii = 'ascii',
  hex = 'hex',
  raw = 'raw',
}

export const enum FileKind {
  Unknown = 0,
  Script  = 1,
  Markup  = 2,
  Style   = 3,
  JSON    = 4,
}

export interface IStats {
  isFile(): boolean;
  isDirectory(): boolean;
  isSymbolicLink(): boolean;
}

export interface IDirent extends IStats {
  name: string;
}

export interface IFile {
  readonly shortPath: string;
  readonly kind: FileKind;

  readonly path: string;
  readonly dir: string;
  readonly rootlessPath: string;
  readonly name: string;
  readonly shortName: string;
  readonly ext: string;

  getContent(force?: boolean): Promise<string>;
  getContentSync(force?: boolean): string;
}

export interface IFileSystem {
  realpath(path: string): Promise<string>;
  realpathSync(path: string): string;

  readdir(path: string): Promise<readonly string[]>;
  readdir(path: string, withFileTypes: true): Promise<readonly IDirent[]>;
  readdirSync(path: string): readonly string[];
  readdirSync(path: string, withFileTypes: true): readonly IDirent[];

  mkdir(path: string): Promise<void>;
  mkdirSync(path: string): void;

  isReadable(path: string): Promise<boolean>;
  isReadableSync(path: string): boolean;

  fileExists(path: string): Promise<boolean>;
  fileExistsSync(path: string): boolean;

  stat(path: string): Promise<IStats>;
  statSync(path: string): IStats;

  lstat(path: string): Promise<IStats>;
  lstatSync(path: string): IStats;

  readFile(path: string, encoding: Encoding, cache?: boolean, force?: boolean): Promise<string>;
  readFileSync(path: string, encoding: Encoding, cache?: boolean, force?: boolean): string;

  ensureDir(path: string): Promise<void>;
  ensureDirSync(path: string): void;

  writeFile(path: string, content: string, encoding: Encoding): Promise<void>;
  writeFileSync(path: string, content: string, encoding: Encoding): void;

  rimraf(path: string): Promise<void>;

  getRealPath(path: string): Promise<string>;
  getRealPathSync(path: string): string;

  getChildren(path: string): Promise<readonly string[]>;
  getChildrenSync(path: string): readonly string[];

  getFiles(dir: string, loadContent?: boolean): Promise<readonly IFile[]>;
  getFilesSync(dir: string, loadContent?: boolean): readonly IFile[];
}

export interface $CompilerOptions extends CompilerOptions {
  readonly __dirname: string;
}

export const IFileSystem = DI.createInterface<IFileSystem>('IFileSystem');
