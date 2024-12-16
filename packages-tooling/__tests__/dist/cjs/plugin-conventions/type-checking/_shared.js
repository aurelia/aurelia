"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertFailure = exports.assertSuccess = exports.createMarkupReader = exports.compileProcessedCode = exports.$basename = exports.options = exports.assetTypes = exports.assetsTypeFile = void 0;
const testing_1 = require("@aurelia/testing");
const os_1 = require("os");
const path_1 = require("path");
const typescript_1 = require("typescript");
exports.assetsTypeFile = 'assets-modules.d.ts';
exports.assetTypes = `
declare module '*.html' {
export const name: string;
export const template: string;
export default template;
export const dependencies: string[];
export const containerless: boolean | undefined;
export const shadowOptions: { mode: 'open' | 'closed'} | undefined;
}

declare module '*.css'
`;
exports.options = {
    baseUrl: '.',
    skipLibCheck: true,
    module: typescript_1.ModuleKind.ES2022,
    moduleResolution: typescript_1.ModuleResolutionKind.Node10,
    noEmit: true,
    allowJs: true,
};
function $basename(path) {
    const filename = (0, path_1.basename)(path);
    if (filename.endsWith('.d.ts') || filename.startsWith('entry'))
        return filename;
    return filename.replace(/\.ts$/, '');
}
exports.$basename = $basename;
function compileProcessedCode(entryPoint, modules = {}) {
    modules = { ...modules, [exports.assetsTypeFile]: exports.assetTypes };
    const fileNames = Object.keys(modules);
    const host = (0, typescript_1.createCompilerHost)(exports.options);
    const program = (0, typescript_1.createProgram)([entryPoint, exports.assetsTypeFile], exports.options, {
        ...host,
        getSourceFile: (path, languageVersion) => {
            const fileName = $basename(path);
            return fileNames.includes(fileName)
                ? (0, typescript_1.createSourceFile)(path, modules[fileName], languageVersion)
                : host.getSourceFile(path, languageVersion);
        },
        readFile: (path) => { var _a; return (_a = modules[$basename(path)]) !== null && _a !== void 0 ? _a : host.readFile(path); },
        fileExists: (path) => {
            const exists = fileNames.includes($basename(path)) ? true : host.fileExists(path);
            return exists;
        },
    });
    const emitResult = program.emit();
    // Need to incorporate the sourcemap from the HTML template??
    return (0, typescript_1.getPreEmitDiagnostics)(program)
        .concat(emitResult.diagnostics)
        .map(d => (0, typescript_1.flattenDiagnosticMessageText)(d.messageText, os_1.EOL));
}
exports.compileProcessedCode = compileProcessedCode;
function createMarkupReader(fileName, content) {
    return (path) => {
        const $fileName = $basename(path);
        if ($fileName === fileName)
            return content;
        throw new Error(`unexpected path: ${path}`);
    };
}
exports.createMarkupReader = createMarkupReader;
function assertSuccess(entry, code, additionalModules = {}) {
    const errors = compileProcessedCode(entry, { [entry]: code, ...additionalModules });
    testing_1.assert.deepStrictEqual(errors, [], `Errors: ${errors.join(os_1.EOL)}${os_1.EOL}Code: ${code}`);
}
exports.assertSuccess = assertSuccess;
function assertFailure(entry, code, expectedErrors, additionalModules = {}, isPartial = false) {
    const errors = compileProcessedCode(entry, { [entry]: code, ...additionalModules });
    const len = expectedErrors.length;
    if (!isPartial) {
        testing_1.assert.strictEqual(errors.length, len, `Mismatch in number of errors.${os_1.EOL}Errors: ${errors.join(os_1.EOL)}${os_1.EOL}Code: ${code}`);
    }
    for (let i = 0; i < len; i++) {
        const pattern = expectedErrors[i];
        testing_1.assert.strictEqual(errors.some(e => pattern.test(e)), true, `Expected error not found: ${pattern}${os_1.EOL}Errors: ${errors.join(os_1.EOL)}${os_1.EOL}Code: ${code}`);
    }
}
exports.assertFailure = assertFailure;
//# sourceMappingURL=_shared.js.map