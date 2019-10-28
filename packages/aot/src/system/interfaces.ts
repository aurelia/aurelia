import { DI } from '@aurelia/kernel';

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

  getContent(): Promise<string>;
  getContentSync(): string;
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

  fileExists(path: string): Promise<boolean>;
  fileExistsSync(path: string): boolean;

  stat(path: string): Promise<IStats>;
  statSync(path: string): IStats;

  lstat(path: string): Promise<IStats>;
  lstatSync(path: string): IStats;

  readFile(path: string, encoding: Encoding): Promise<string>;
  readFileSync(path: string, encoding: Encoding): string;

  ensureDir(path: string): Promise<void>;
  ensureDirSync(path: string): void;

  writeFile(path: string, content: string, encoding: Encoding): Promise<void>;
  writeFileSync(path: string, content: string, encoding: Encoding): void;

  rimraf(path: string): Promise<void>;

  getRealPath(path: string): Promise<string>;
  getRealPathSync(path: string): string;

  getChildren(path: string): Promise<readonly string[]>;
  getChildrenSync(path: string): readonly string[];

  getFiles(packageDir: string): Promise<readonly IFile[]>;
  getFilesSync(packageDir: string): readonly IFile[];
}

export const IFileSystem = DI.createInterface<IFileSystem>('IFileSystem').noDefault();
