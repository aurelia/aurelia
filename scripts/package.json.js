"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePackageJson = exports.loadPackageJson = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const project_1 = __importDefault(require("./project"));
/**
 * Reads and parses the content of a package.json file
 *
 * @param pathSegments - The path segments of the folder where the package.json is located, relative to the root of the project
 */
async function loadPackageJson(...pathSegments) {
    const path = path_1.join(project_1.default.path, ...pathSegments, 'package.json');
    return new Promise((resolve, reject) => {
        fs_1.readFile(path, (err, data) => {
            if (err) {
                reject(err);
            }
            if (!data) {
                throw new Error(`Empty file: ${path}`);
            }
            const str = data.toString('utf8');
            const json = JSON.parse(str);
            resolve(json);
        });
    });
}
exports.loadPackageJson = loadPackageJson;
/**
 * Stringifies and writes out the content of a package.json file
 *
 * @param pkg - The package.json as an object
 * @param pathSegments - The path segments of the folder where the package.json is located, relative to the root of the project
 */
async function savePackageJson(pkg, ...pathSegments) {
    const path = path_1.join(project_1.default.path, ...pathSegments, 'package.json');
    return new Promise((resolve, reject) => {
        const str = JSON.stringify(pkg, null, 2);
        fs_1.writeFile(path, str, { encoding: 'utf8' }, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}
exports.savePackageJson = savePackageJson;
