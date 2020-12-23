import {
  readFile as $readFile,
  constants,
  access,
  exists as $exists,
  mkdir as $mkdir,
  lstat,
  readdir as $readdir,
  Stats,
  rmdir as $rmdir,
  unlink as $unlink
} from "fs";
import { join } from 'path';

export async function readFile(path: string): Promise<Buffer>;
export async function readFile(path: string, options: string): Promise<string>;
export async function readFile(path: string, options: { encoding: BufferEncoding }): Promise<string>;
export async function readFile(path: string, options: { encoding?: null }): Promise<Buffer>;
export async function readFile(path: string, options?: string | { encoding?: null | BufferEncoding; flag?: string } | null) {

  return new Promise<string | Buffer>(function (resolve, reject) {
    $readFile(path, options, function (err, data) {
      if (err !== null) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

}

export async function isReadable(path: string): Promise<boolean> {
  return new Promise(function (resolve) {
    access(path, constants.F_OK, (err) => {
      resolve(err === null);
    });
  });
}

export async function ensureDir(path: string): Promise<void> {

  if (await exists(path)) { return; }

  return mkdir(path);
}

export async function exists(path: string) {
  return new Promise<boolean>(res => { $exists(path, res); });
}

export async function mkdir(path: string): Promise<void> {
  return new Promise<void>(function (resolve, reject) {
    $mkdir(path, { recursive: true }, function (err) {
      if (err !== null) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function rimraf(path: string): Promise<void> {
  const stats = await getStats(path);

  if (stats.isDirectory()) {
    await Promise.all((await readdir(path)).map(async x => rimraf(join(path, x))));
    await rmdir(path);
  } else if (stats.isFile() || stats.isSymbolicLink()) {
    await unlink(path);
  }
}

export async function getStats(path: string): Promise<Stats> {
  return new Promise<Stats>(function (resolve, reject) {
    lstat(path, function (err, $stats) {
      if (err !== null) {
        reject(err);
      } else {
        resolve($stats);
      }
    });
  });
}

export async function readdir(path: string): Promise<string[]> {
  return new Promise<string[]>(function (resolve, reject) {
    $readdir(path, function (err, files) {
      if (err !== null) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

export async function rmdir(path: string) {
  return new Promise<void>(function (resolve, reject) {
    $rmdir(path, function (err) {
      if (err !== null) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function unlink(path: string) {
  return new Promise<void>(function (resolve, reject) {
    $unlink(path, function (err) {
      if (err !== null) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
