/* eslint-disable */
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const packageJson = __importStar(require("../package.json"));
// TODO: generate this file automatically
const rootPath = process.cwd();
const testApps = [
    'jit-webpack-conventions-ts',
    'jit-webpack-vanilla-ts'
];
function camelCase(input) {
    const parts = input.split('-');
    return `${parts[0]}${parts.slice(1).map(x => `${x[0].toUpperCase()}${x.slice(1)}`).join('')}`;
}
exports.default = {
    'path': rootPath,
    'pkg': packageJson,
    '.circleci': {
        'path': path_1.join(rootPath, '.circleci')
    },
    '.vscode': {
        'path': path_1.join(rootPath, '.vscode')
    },
    'changelog': {
        'path': path_1.join(rootPath, 'docs', 'CHANGELOG.md')
    },
    'coverage': {
        'path': path_1.join(rootPath, 'coverage')
    },
    'dist': {
        'path': path_1.join(rootPath, 'dist')
    },
    'docs': {
        'path': path_1.join(rootPath, 'docs')
    },
    'examples': testApps.reduce((acc, app) => {
        acc[app] = {
            'path': path_1.join(rootPath, 'examples', app)
        };
        return acc;
    }, {}),
    'node_modules': {
        'path': path_1.join(rootPath, 'node_modules')
    },
    'packages': packageJson.workspaces.map(p => {
        const parts = p.split('/');
        const kebabName = parts[parts.length - 1];
        const camelName = camelCase(kebabName);
        const folder = parts.slice(0, -1).join('/');
        const path = path_1.join(rootPath, p);
        const nodeModules = path_1.join(path, 'node_modules');
        const coverage = path_1.join(rootPath, 'coverage', kebabName);
        const tsconfig = path_1.join(path, 'tsconfig.json');
        const changelog = path_1.join(path, 'CHANGELOG.md');
        const srcPath = path_1.join(path, 'src');
        const src = {
            path: srcPath,
            entry: path_1.join(srcPath, 'index.ts'),
        };
        const name = {
            kebab: kebabName,
            camel: camelName,
            npm: kebabName === 'aurelia'
                ? 'aurelia'
                : kebabName === 'au'
                    ? 'au'
                    : `@aurelia/${kebabName}`
        };
        return { path, folder, nodeModules, coverage, tsconfig, changelog, src, name };
    }),
    'scripts': {
        'path': path_1.join(rootPath, 'scripts'),
        'tsconfig.test': path_1.join(rootPath, 'scripts', 'tsconfig.test.json')
    },
    'test': {
        'path': path_1.join(rootPath, 'test'),
    },
    'package.json': {
        'path': path_1.join(rootPath, 'package.json')
    },
};
