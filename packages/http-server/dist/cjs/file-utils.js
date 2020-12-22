"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlink = exports.rmdir = exports.readdir = exports.getStats = exports.rimraf = exports.mkdir = exports.exists = exports.ensureDir = exports.isReadable = exports.readFile = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
async function readFile(path, options) {
    return new Promise(function (resolve, reject) {
        fs_1.readFile(path, options, function (err, data) {
            if (err !== null) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
exports.readFile = readFile;
async function isReadable(path) {
    return new Promise(function (resolve) {
        fs_1.access(path, fs_1.constants.F_OK, (err) => {
            resolve(err === null);
        });
    });
}
exports.isReadable = isReadable;
async function ensureDir(path) {
    if (await exists(path)) {
        return;
    }
    return mkdir(path);
}
exports.ensureDir = ensureDir;
async function exists(path) {
    return new Promise(res => { fs_1.exists(path, res); });
}
exports.exists = exists;
async function mkdir(path) {
    return new Promise(function (resolve, reject) {
        fs_1.mkdir(path, { recursive: true }, function (err) {
            if (err !== null) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
exports.mkdir = mkdir;
async function rimraf(path) {
    const stats = await getStats(path);
    if (stats.isDirectory()) {
        await Promise.all((await readdir(path)).map(async (x) => rimraf(path_1.join(path, x))));
        await rmdir(path);
    }
    else if (stats.isFile() || stats.isSymbolicLink()) {
        await unlink(path);
    }
}
exports.rimraf = rimraf;
async function getStats(path) {
    return new Promise(function (resolve, reject) {
        fs_1.lstat(path, function (err, $stats) {
            if (err !== null) {
                reject(err);
            }
            else {
                resolve($stats);
            }
        });
    });
}
exports.getStats = getStats;
async function readdir(path) {
    return new Promise(function (resolve, reject) {
        fs_1.readdir(path, function (err, files) {
            if (err !== null) {
                reject(err);
            }
            else {
                resolve(files);
            }
        });
    });
}
exports.readdir = readdir;
async function rmdir(path) {
    return new Promise(function (resolve, reject) {
        fs_1.rmdir(path, function (err) {
            if (err !== null) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
exports.rmdir = rmdir;
async function unlink(path) {
    return new Promise(function (resolve, reject) {
        fs_1.unlink(path, function (err) {
            if (err !== null) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
exports.unlink = unlink;
//# sourceMappingURL=file-utils.js.map