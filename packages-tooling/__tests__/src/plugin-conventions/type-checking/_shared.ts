import { assert } from '@aurelia/testing';
import { EOL } from 'os';
import { basename } from 'path';
import {
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget,
  createCompilerHost,
  createProgram,
  createSourceFile,
  flattenDiagnosticMessageText,
  getPreEmitDiagnostics,
  type CompilerOptions,
} from "typescript";

export const assetsTypeFile = 'assets-modules.d.ts';
export const assetTypes = `
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
export const options: CompilerOptions = {
  baseUrl: '.',
  skipLibCheck: true,
  module: ModuleKind.ES2022,
  moduleResolution: ModuleResolutionKind.Node10,
  noEmit: true,
  allowJs: true,
  target: ScriptTarget.ES2020,
  types: [] // prevents crawling node_modules/@types/* (cuts test execution time in half)
};

export function $basename(path: string): string {
  const filename = basename(path);
  if (filename.endsWith('.d.ts') || filename.startsWith('entry')) return filename;
  return filename.replace(/\.ts$/, '');
}

export type $Module = Record<string, string>;
export function compileProcessedCode(entryPoint: string, modules: $Module = {}): string[] {
  modules = { ...modules, [assetsTypeFile]: assetTypes };
  const fileNames = Object.keys(modules);
  const host = createCompilerHost(options);
  const program = createProgram([entryPoint, assetsTypeFile], options, {
    ...host,
    getSourceFile: (path, languageVersion) => {
      const fileName = $basename(path);
      return fileNames.includes(fileName)
        ? createSourceFile(path, modules[fileName], languageVersion)
        : host.getSourceFile(path, languageVersion);
    },
    readFile: (path) => modules[$basename(path)] ?? host.readFile(path),
    fileExists: (path) => {
      const exists = fileNames.includes($basename(path)) ? true : host.fileExists(path);
      return exists;
    },
  });
  const emitResult = program.emit();
  // Need to incorporate the sourcemap from the HTML template??
  return getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)
    .map(d => flattenDiagnosticMessageText(d.messageText, EOL));
}

export function createMarkupReader(fileName: string, content: string) {
  return (path: string) => {
    const $fileName = $basename(path);
    if ($fileName === fileName) return content;
    throw new Error(`unexpected path: ${path}`);
  };
}

export function assertSuccess(entry: string, code: string, additionalModules: $Module = {}) {
  const errors = compileProcessedCode(entry, { [entry]: code, ...additionalModules });
  assert.deepStrictEqual(errors, [], `Errors: ${errors.join(EOL)}${EOL}Code: ${code}`);
}

export function assertFailure(entry: string, code: string, expectedErrors: RegExp[], additionalModules: $Module = {}, isPartial: boolean = false) {
  const errors = compileProcessedCode(entry, { [entry]: code, ...additionalModules });
  const len = expectedErrors.length;
  if (!isPartial) {
    assert.strictEqual(errors.length, len, `Mismatch in number of errors.${EOL}Errors: ${errors.join(EOL)}${EOL}Code: ${code}`);
  }
  for (let i = 0; i < len; i++) {
    const pattern = expectedErrors[i];
    assert.strictEqual(errors.some(e => pattern.test(e)), true, `Expected error not found: ${pattern}${EOL}Errors: ${errors.join(EOL)}${EOL}Code: ${code}`);
  }
}

export function prop(
  name: string,
  type: string,
  isTs: boolean,
  accessModifier: 'public' | 'protected' | 'private' = 'public',
) {
  return `${isTs ? '' : `
/**
 * @${accessModifier}
 * @type {${type}}
 */`}
${isTs ? `${accessModifier} ` : ''}${name}${isTs ? `: ${type}` : ''};`;
}
