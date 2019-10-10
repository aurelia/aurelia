import { existsSync, read, readdir, promises, createReadStream, Dirent } from 'fs';
import { join } from 'path';

const { readFile, writeFile, unlink } = promises;

const readdirOpts = {
  withFileTypes: true as true,
};

export async function getFiles(
  dir: string,
  isMatch: (dir: string, dirent: Dirent) => boolean = (dir, dirent) => true,
) {
  const files: File[] = [];
  let pending = 0;

  function $getFiles(
    resolve: (files: File[]) => void,
    reject: (err: NodeJS.ErrnoException) => void,
  ) {
    function walk(dir: string) {
      ++pending;

      function $readdir(err: NodeJS.ErrnoException | null, dirents: Dirent[]) {
        if (err !== null) {
          reject(err);
        }

        let dirent: Dirent;
        const direntsLength = dirents.length;

        for (let i = 0; i < direntsLength; ++i) {
          dirent = dirents[i];
          if (isMatch(dir, dirent)) {
            if (dirent.isDirectory()) {
              walk(join(dir, dirent.name));
            } else {
              files.push(new File(join(dir, dirent.name)));
            }
          }
        }

        if (--pending === 0) {
          resolve(files);
        }
      }

      readdir(dir, readdirOpts, $readdir);
    }

    walk(dir);
  }

  return new Promise($getFiles);
}

const emptyBuffer = Buffer.alloc(0);
const BUFFER_SIZE = 4096;

export class File {
  public readonly path: string;
  public content: Buffer;
  private buffer: Buffer;

  public constructor(path: string) {
    this.path = path;
    this.content = emptyBuffer;
    this.buffer = emptyBuffer;
  }

  public async restore(fromPath?: string, deleteFromPath: boolean = true) {
    if (typeof fromPath === 'string') {
      if (existsSync(fromPath)) {
        const content = await readFile(fromPath);
        await this.overwrite(content);

        if (deleteFromPath) {
          await unlink(fromPath);
        }
      }
    } else {
      await writeFile(this.path, this.buffer);
    }
  }

  public async saveAs(newPath: string) {
    await writeFile(newPath, this.content);
  }

  public async readContent() {
    return this.content = await readFile(this.path);
  }

  public async overwrite(newContent: Buffer) {
    await writeFile(this.path, newContent);
  }

  public async hasChanges() {
    if (this.content === emptyBuffer) {
      return false;
    }

    if (this.buffer === emptyBuffer) {
      this.buffer = Buffer.allocUnsafe(BUFFER_SIZE);
    }

    const content = this.content;
    const buffer = this.buffer;

    let offset = 0;
    let bytesRead = 0;

    const stream = createReadStream(this.path);

    function chunksAreEqual() {
      return content.compare(buffer, 0, bytesRead, offset, offset + bytesRead) === 0;
    }

    function streamCompare(
      resolve: (hasChanges: boolean) => void,
      reject: (err: NodeJS.ErrnoException) => void,
    ) {
      async function onStreamOpen(descriptor: number) {
        function $read(resolve: (bytesRead: number) => void) {
          function callback(err: NodeJS.ErrnoException | null, bytesRead: number) {
            if (err !== null) {
              reject(err);
            }

            resolve(bytesRead);
          }

          read(descriptor, buffer, 0, BUFFER_SIZE, BUFFER_SIZE, callback);
        }

        do {
          bytesRead = await new Promise($read);
          if (chunksAreEqual()) {
            offset += bytesRead;
          } else {
            stream.destroy();
            resolve(true);
          }
        } while (bytesRead === BUFFER_SIZE);

        stream.destroy();

        if (chunksAreEqual()) {
          resolve(false);
        } else {
          resolve(true);
        }
      }

      stream.on('open', onStreamOpen);
    }

    return new Promise(streamCompare);
  }
}
