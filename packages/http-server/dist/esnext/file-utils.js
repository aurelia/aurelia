import { readFile as $readFile, constants, access, exists as $exists, mkdir as $mkdir, lstat, readdir as $readdir, rmdir as $rmdir, unlink as $unlink } from "fs";
import { join } from 'path';
export async function readFile(path, options) {
    return new Promise(function (resolve, reject) {
        $readFile(path, options, function (err, data) {
            if (err !== null) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
export async function isReadable(path) {
    return new Promise(function (resolve) {
        access(path, constants.F_OK, (err) => {
            resolve(err === null);
        });
    });
}
export async function ensureDir(path) {
    if (await exists(path)) {
        return;
    }
    return mkdir(path);
}
export async function exists(path) {
    return new Promise(res => { $exists(path, res); });
}
export async function mkdir(path) {
    return new Promise(function (resolve, reject) {
        $mkdir(path, { recursive: true }, function (err) {
            if (err !== null) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
export async function rimraf(path) {
    const stats = await getStats(path);
    if (stats.isDirectory()) {
        await Promise.all((await readdir(path)).map(async (x) => rimraf(join(path, x))));
        await rmdir(path);
    }
    else if (stats.isFile() || stats.isSymbolicLink()) {
        await unlink(path);
    }
}
export async function getStats(path) {
    return new Promise(function (resolve, reject) {
        lstat(path, function (err, $stats) {
            if (err !== null) {
                reject(err);
            }
            else {
                resolve($stats);
            }
        });
    });
}
export async function readdir(path) {
    return new Promise(function (resolve, reject) {
        $readdir(path, function (err, files) {
            if (err !== null) {
                reject(err);
            }
            else {
                resolve(files);
            }
        });
    });
}
export async function rmdir(path) {
    return new Promise(function (resolve, reject) {
        $rmdir(path, function (err) {
            if (err !== null) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
export async function unlink(path) {
    return new Promise(function (resolve, reject) {
        $unlink(path, function (err) {
            if (err !== null) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
//# sourceMappingURL=file-utils.js.map