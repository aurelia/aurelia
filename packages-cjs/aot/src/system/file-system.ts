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
} from '@aurelia/runtime';
import {
  ILogger,
} from '@aurelia/kernel';
import {
  FileKind,
  IFileSystem,
  IFile,
  Encoding,
} from './interfaces.js';
import {
  normalizePath,
  joinPath,
} from './path-utils.js';
import type {
  WriteFileOptions,
} from 'fs';

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
  /**
   * Similar to `shortName`, but includes the rest of the path including the root.
   *
   * Used for conventional matching, e.g. "try adding .js, .ts, /index.js", etc.
   */
  public readonly shortPath: string;
  public readonly kind: FileKind;

  public constructor(
    private readonly fs: IFileSystem,
    /**
     * The full, absolute, real path to the file.
     *
     * @example
     * 'd:/foo/bar.ts' // 'd:/foo/bar.ts' is the path
     */
    public readonly path: string,
    /**
     * The full, absolute, real path to the folder containing the file.
     *
     * @example
     * 'd:/foo/bar.ts' // 'd:/foo' is the path
     */
    public readonly dir: string,
    /**
     * A loosely defined human-readable identifier for the file, usually with the common root directory removed for improved clarity in logs.
     */
    public readonly rootlessPath: string,
    /**
     * The leaf file name, including the extension.
     *
     * @example
     * './foo/bar.ts' // 'bar.ts' is the name
     */
    public readonly name: string,
    /**
     * The leaf file name, excluding the extension.
     *
     * @example
     * './foo/bar.ts' // 'bar' is the shortName
     */
    public readonly shortName: string,
    /**
     * The file extension, including the period. For .d.ts files, the whole part ".d.ts" must be included.
     *
     * @example
     * './foo/bar.ts' // '.ts' is the extension
     * './foo/bar.d.ts' // '.d.ts' is the extension
     */
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

  public getContent(cache: boolean = false, force: boolean = false): Promise<string> {
    return this.fs.readFile(this.path, Encoding.utf8, cache, force);
  }

  public getContentSync(cache: boolean = false, force: boolean = false): string {
    return this.fs.readFileSync(this.path, Encoding.utf8, cache, force);
  }
}

const tick = {
  current: void 0 as (undefined | Promise<void>),
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

export class NodeFileSystem implements IFileSystem {
  private readonly childrenCache: Map<string, string[]> = new Map();
  private readonly realPathCache: Map<string, string> = new Map();
  private readonly contentCache: Map<string, string> = new Map();

  private pendingReads: number = 0;
  private maxConcurrentReads: number = 0;

  public constructor(
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo(this.constructor.name);
    this.logger.info('constructor');
  }

  public async realpath(path: string): Promise<string> {
    this.logger.trace(`realpath(path: ${path})`);

    return realpath(path);
  }

  public realpathSync(path: string): string {
    this.logger.trace(`realpathSync(path: ${path})`);

    return realpathSync(path);
  }

  public async readdir(path: string): Promise<readonly string[]>;
  public async readdir(path: string, withFileTypes: true): Promise<readonly Dirent[]>;
  public async readdir(path: string, withFileTypes?: true): Promise<readonly string[] | readonly Dirent[]> {
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

  public async mkdir(path: string): Promise<void> {
    this.logger.trace(`mkdir(path: ${path})`);

    return mkdir(path, { recursive: true }) as unknown as Promise<void>;
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

  public async stat(path: string): Promise<Stats> {
    this.logger.trace(`stat(path: ${path})`);

    return stat(path);
  }

  public statSync(path: string): Stats {
    this.logger.trace(`statSync(path: ${path})`);

    return statSync(path);
  }

  public async lstat(path: string): Promise<Stats> {
    this.logger.trace(`lstat(path: ${path})`);

    return lstat(path);
  }

  public lstatSync(path: string): Stats {
    this.logger.trace(`lstatSync(path: ${path})`);

    return lstatSync(path);
  }

  public async readFile(path: string, encoding: Encoding, cache: boolean = false, force: boolean = false): Promise<string> {
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
        content = await readFile(path, encoding as BufferEncoding) as string;
        --this.pendingReads;
      } catch (err) {
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

  public readFileSync(path: string, encoding: Encoding, cache: boolean = false, force: boolean = false): string {
    this.logger.trace(`readFileSync(path: ${path}, encoding: ${encoding}, cache: ${cache}, force: ${force})`);

    const contentCache = this.contentCache;
    let content = contentCache.get(path);
    if (content === void 0 || force) {
      content = readFileSync(path, encoding as BufferEncoding);
      if (cache) {
        contentCache.set(path, content);
      }
    }

    return content;
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

    return writeFile(path, content, { encoding: encoding as BufferEncoding });
  }

  public writeFileSync(path: string, content: string, options: WriteFileOptions): void {
    this.logger.trace(`readFileSync(path: ${path}, content: ${content}, encoding: ${options})`);

    this.ensureDirSync(dirname(path));

    writeFileSync(path, content, options);
  }

  public async rimraf(path: string): Promise<void> {
    this.logger.trace(`rimraf(path: ${path})`);

    try {
      const stats = await lstat(path);
      if (stats.isDirectory()) {
        await Promise.all((await readdir(path)).map(async x => this.rimraf(join(path, x))));
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

    const realPathCache = this.realPathCache;
    let real = realPathCache.get(path);
    if (real === void 0) {
      real = normalizePath(await realpath(path));
      realPathCache.set(path, real);
    }

    return real;
  }

  public getRealPathSync(path: string): string {
    path = normalizePath(path);

    const realPathCache = this.realPathCache;
    let real = realPathCache.get(path);
    if (real === void 0) {
      real = normalizePath(realpathSync(path));
      realPathCache.set(path, real);
    }

    return real;
  }

  public async getChildren(path: string): Promise<string[]> {
    const childrenCache = this.childrenCache;
    let children = childrenCache.get(path);
    if (children === void 0) {
      children = (await readdir(path)).filter(shouldTraverse);
      childrenCache.set(path, children);
    }

    return children;
  }

  public getChildrenSync(path: string): string[] {
    const childrenCache = this.childrenCache;
    let children = childrenCache.get(path);
    if (children === void 0) {
      children = readdirSync(path).filter(shouldTraverse);
      childrenCache.set(path, children);
    }

    return children;
  }

  public async getFiles(root: string, loadContent: boolean = false): Promise<File[]> {
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
            const file = new File(this, path, dir, rootlessPath, name, shortName, ext);
            if (loadContent) {
              await this.readFile(path, Encoding.utf8, true);
            }
            files.push(file);
          }
        } else if (stats.isDirectory()) {
          await Promise.all((await this.getChildren(path)).map(async x => walk(path, x)));
        }
      }
    };

    await Promise.all((await this.getChildren(root)).map(async x => walk(root, x)));

    return files.sort(compareFilePath);
  }

  public getFilesSync(root: string, loadContent: boolean = false): File[] {
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
            const file = new File(this, path, dir, rootlessPath, name, shortName, ext);
            if (loadContent) {
              this.readFileSync(path, Encoding.utf8, true);
            }
            files.push(file);
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

