/* eslint-disable import/no-nodejs-modules */
import {
  accessSync,
  constants,
  Dirent,
  exists,
  existsSync,
  lstatSync,
  mkdirSync,
  promises,
  readdirSync,
  readFileSync,
  realpathSync,
  Stats,
  statSync,
  writeFileSync,
} from 'fs';
import {
  dirname,
  join,
} from 'path';
import {
  Char,
} from '@aurelia/jit';
import {
  ILogger,
} from '@aurelia/kernel';
import {
  FileKind,
  IFileSystem,
  IFile,
  Encoding,
} from './interfaces';
import {
  normalizePath,
  joinPath,
} from './path-utils';

const {
  access,
  lstat,
  mkdir,
  readdir,
  readFile,
  realpath,
  rmdir,
  stat,
  unlink,
  writeFile,
} = promises;

function compareFilePath(a: File, b: File) {
  return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
}

function shouldTraverse(path: string) {
  // By default convention we don't traverse any path that starts with a dot because those shouldn't contain application code
  // For example: .git, .vscode, .circleci, etc.
  // We also exclude node_modules. But everything else is traversed by default.
  // TODO: make this configurable
  return path.charCodeAt(0) !== Char.Dot && path !== 'node_modules';
}

export class File implements IFile {
  public readonly shortPath: string;
  public readonly kind: FileKind;

  public constructor(
    private readonly fs: IFileSystem,
    public readonly path: string,
    public readonly dir: string,
    public readonly rootlessPath: string,
    public readonly name: string,
    public readonly shortName: string,
    public readonly ext: string,
  ) {
    this.shortPath = `${dir}/${shortName}`;
    switch (ext) {
      case '.js':
      case '.ts':
      case '.d.ts':
      case '.jsx':
      case '.tsx':
        this.kind = FileKind.Script;
        break;
      case '.html':
        this.kind = FileKind.Markup;
        break;
      case '.css':
        this.kind = FileKind.Style;
        break;
      case '.json':
        this.kind = FileKind.JSON;
        break;
      default:
        this.kind = FileKind.Unknown;
    }
  }

  public static getExtension(name: string): string | undefined {
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

  public getContent(): Promise<string> {
    return this.fs.readFile(this.path, Encoding.utf8);
  }

  public getContentSync(): string {
    return this.fs.readFileSync(this.path, Encoding.utf8);
  }
}

export class NodeFileSystem implements IFileSystem {
  private readonly childrenCache: Record<string, string[] | undefined> = Object.create(null);
  private readonly realPathCache: Record<string, string | undefined> = Object.create(null);

  public constructor(
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo(this.constructor.name);
    this.logger.info('constructor');
  }

  public realpath(path: string): Promise<string> {
    this.logger.trace(`realpath(path: ${path})`);

    return realpath(path);
  }

  public realpathSync(path: string): string {
    this.logger.trace(`realpathSync(path: ${path})`);

    return realpathSync(path);
  }

  public readdir(path: string): Promise<readonly string[]>;
  public readdir(path: string, withFileTypes: true): Promise<readonly Dirent[]>;
  public readdir(path: string, withFileTypes?: true): Promise<readonly string[] | readonly Dirent[]> {
    this.logger.trace(`readdir(path: ${path}, withFileTypes: ${withFileTypes})`);

    if (withFileTypes === true) {
      return readdir(path, { withFileTypes: true });
    }

    return readdir(path);
  }

  public readdirSync(path: string): readonly string[];
  public readdirSync(path: string, withFileTypes: true): readonly Dirent[];
  public readdirSync(path: string, withFileTypes?: true): readonly string[] | readonly Dirent[] {
    this.logger.trace(`readdirSync(path: ${path}, withFileTypes: ${withFileTypes})`);

    if (withFileTypes === true) {
      return readdirSync(path, { withFileTypes: true });
    }

    return readdirSync(path);
  }

  public mkdir(path: string): Promise<void> {
    this.logger.trace(`mkdir(path: ${path})`);

    return mkdir(path, { recursive: true });
  }

  public mkdirSync(path: string): void {
    this.logger.trace(`mkdirSync(path: ${path})`);

    mkdirSync(path, { recursive: true });
  }

  public async isReadable(path: string): Promise<boolean> {
    this.logger.trace(`isReadable(path: ${path})`);

    try {
      await access(path, constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }

  public isReadableSync(path: string): boolean {
    this.logger.trace(`isReadableSync(path: ${path})`);

    try {
      accessSync(path, constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }

  public async fileExists(path: string): Promise<boolean> {
    this.logger.trace(`fileExists(path: ${path})`);

    try {
      return (await stat(path)).isFile();
    } catch (err) {
      return false;
    }
  }

  public fileExistsSync(path: string): boolean {
    this.logger.trace(`fileExistsSync(path: ${path})`);

    try {
      return statSync(path).isFile();
    } catch (err) {
      return false;
    }
  }

  public stat(path: string): Promise<Stats> {
    this.logger.trace(`stat(path: ${path})`);

    return stat(path);
  }

  public statSync(path: string): Stats {
    this.logger.trace(`statSync(path: ${path})`);

    return statSync(path);
  }

  public lstat(path: string): Promise<Stats> {
    this.logger.trace(`lstat(path: ${path})`);

    return lstat(path);
  }

  public lstatSync(path: string): Stats {
    this.logger.trace(`lstatSync(path: ${path})`);

    return lstatSync(path);
  }

  public readFile(path: string, encoding: Encoding): Promise<string> {
    this.logger.trace(`readFile(path: ${path}, encoding: ${encoding})`);

    return readFile(path, { encoding }) as Promise<string>;
  }

  public readFileSync(path: string, encoding: Encoding): string {
    this.logger.trace(`readFileSync(path: ${path}, encoding: ${encoding})`);

    return readFileSync(path, encoding);
  }

  public async ensureDir(path: string): Promise<void> {
    this.logger.trace(`ensureDir(path: ${path})`);

    if (await new Promise<boolean>(res => { exists(path, res); })) {
      return;
    }

    return this.mkdir(path);
  }

  public ensureDirSync(path: string): void {
    this.logger.trace(`ensureDirSync(path: ${path})`);

    if (existsSync(path)) {
      return;
    }

    this.mkdirSync(path);
  }

  public async writeFile(path: string, content: string, encoding: Encoding): Promise<void> {
    this.logger.trace(`writeFile(path: ${path}, content: ${content}, encoding: ${encoding})`);

    await this.ensureDir(dirname(path));

    return writeFile(path, content, { encoding });
  }

  public writeFileSync(path: string, content: string, encoding: Encoding): void {
    this.logger.trace(`readFileSync(path: ${path}, content: ${content}, encoding: ${encoding})`);

    this.ensureDirSync(dirname(path));

    writeFileSync(path, content, encoding);
  }

  public async rimraf(path: string): Promise<void> {
    this.logger.trace(`rimraf(path: ${path})`);

    try {
      const stats = await lstat(path);
      if (stats.isDirectory()) {
        await Promise.all((await readdir(path)).map(x => this.rimraf(join(path, x))));
        await rmdir(path);
      } else if (stats.isFile() || stats.isSymbolicLink()) {
        await unlink(path);
      }
    } catch (err) {
      this.logger.error(`rimraf failed`, err);
    }
  }

  public async getRealPath(path: string): Promise<string> {
    path = normalizePath(path);
    let real = this.realPathCache[path];
    if (real === void 0) {
      real = this.realPathCache[path] = normalizePath(await realpath(path));
    }
    return real;
  }

  public getRealPathSync(path: string): string {
    path = normalizePath(path);
    let real = this.realPathCache[path];
    if (real === void 0) {
      real = this.realPathCache[path] = normalizePath(realpathSync(path));
    }
    return real;
  }

  public async getChildren(path: string): Promise<string[]> {
    let children = this.childrenCache[path];
    if (children === void 0) {
      children = this.childrenCache[path] = (await readdir(path)).filter(shouldTraverse);
    }
    return children;
  }

  public getChildrenSync(path: string): string[] {
    let children = this.childrenCache[path];
    if (children === void 0) {
      children = this.childrenCache[path] = readdirSync(path).filter(shouldTraverse);
    }
    return children;
  }

  public async getFiles(root: string): Promise<File[]> {
    const files: File[] = [];
    const seen: Record<string, true | undefined> = {};

    const walk = async (dir: string, name: string): Promise<void> => {
      const path = await this.getRealPath(joinPath(dir, name));

      if (seen[path] === void 0) {
        seen[path] = true;

        const stats = await stat(path);

        if (stats.isFile()) {
          const ext = File.getExtension(path);

          if (ext !== void 0) {
            const rootlessPath = path.slice(dirname(root).length);
            const shortName = name.slice(0, -ext.length);
            files.push(new File(this, path, dir, rootlessPath, name, shortName, ext));
          }
        } else if (stats.isDirectory()) {
          await Promise.all((await this.getChildren(path)).map(x => walk(path, x)));
        }
      }
    };

    await Promise.all((await this.getChildren(root)).map(x => walk(root, x)));

    return files.sort(compareFilePath);
  }

  public getFilesSync(root: string): File[] {
    const files: File[] = [];
    const seen: Record<string, true | undefined> = {};

    const walk = (dir: string, name: string): void => {
      const path = this.getRealPathSync(joinPath(dir, name));

      if (seen[path] === void 0) {
        seen[path] = true;

        const stats = statSync(path);

        if (stats.isFile()) {
          const ext = File.getExtension(path);

          if (ext !== void 0) {
            const rootlessPath = path.slice(dirname(root).length);
            const shortName = name.slice(0, -ext.length);
            files.push(new File(this, path, dir, rootlessPath, name, shortName, ext));
          }
        } else if (stats.isDirectory()) {
          this.getChildrenSync(path).forEach(x => { walk(path, x); });
        }
      }
    };

    this.getChildrenSync(root).forEach(x => { walk(root, x); });

    return files.sort(compareFilePath);
  }
}

