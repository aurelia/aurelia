/* eslint-disable no-template-curly-in-string */
import { preprocessOptions, preprocessResource } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';
import { EOL } from 'os';
import {
  ModuleKind,
  ModuleResolutionKind,
  createCompilerHost,
  createProgram,
  createSourceFile,
  flattenDiagnosticMessageText,
  getPreEmitDiagnostics,
  type CompilerOptions,
} from "typescript";
import { basename } from 'path';

describe.only('preprocess-resource.typechecking', function () {

  const assetsTypeFile = 'assets-modules.d.ts';
  const assetTypes = `
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
  const options: CompilerOptions = {
    baseUrl: '.',
    skipLibCheck: true,
    module: ModuleKind.ES2022,
    moduleResolution: ModuleResolutionKind.Node10,
    noEmit: true,
    allowJs: true,
  };

  function $basename(path: string): string {
    const filename = basename(path);
    if (filename.endsWith('.d.ts') || filename.startsWith('entry')) return filename;
    return filename.replace(/\.ts$/, '');
  }

  type $Module = Record<string, string>;
  function compileProcessedCode(entryPoint: string, modules: $Module = {}): string[] {
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

  function createMarkupReader(fileName: string, content: string) {
    return (path: string) => {
      const $fileName = $basename(path);
      if ($fileName === fileName) return content;
      throw new Error(`unexpected path: ${path}`);
    };
  }

  function assertSuccess(entry: string, code: string, additionalModules: $Module = {}) {
    const errors = compileProcessedCode(entry, { [entry]: code, ...additionalModules });
    assert.deepStrictEqual(errors, [], `Errors: ${errors.join(EOL)}${EOL}Code: ${code}`);
  }

  function assertFailure(entry: string, code: string, expectedErrors: RegExp[], additionalModules: $Module = {}) {
    const errors = compileProcessedCode(entry, { [entry]: code, ...additionalModules });
    const len = expectedErrors.length;
    assert.strictEqual(errors.length, len, `Mismatch in number of errors.${EOL}Errors: ${errors.join(EOL)}${EOL}Code: ${code}`);
    for (let i = 0; i < len; i++) {
      const pattern = expectedErrors[i];
      assert.strictEqual(errors.some(e => pattern.test(e)), true, `Expected error not found: ${pattern}${EOL}Errors: ${errors.join(EOL)}${EOL}Code: ${code}`);
    }
  }

  describe('without conventions', function () {
    const options = preprocessOptions({
      enableConventions: false,
      typeCheckTemplate: true,
    });

    for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
      const isTs = lang === 'TypeScript';
      describe(`@customElement - language: ${lang}`, function () {
        describe('interpolation', function () {
          describe('short-hand assignment', function () {
            it('single class - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { customElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  @customElement({ name: 'foo', template })
  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('single class - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop1}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { customElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  @customElement({ name: 'foo', template })
  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
            });

            it('multiple classes - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { customElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  @customElement({ name: 'foo', template })
  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  @customElement({ name: 'bar', template })
  export class Bar {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('multiple classes - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { customElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  @customElement({ name: 'foo', template })
  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  @customElement({ name: 'bar', template })
  export class Bar {
    ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
            });
          });

          describe('variable assignment', function () {
            it('single class - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
import { customElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

@customElement({ name: 'foo', template: x })
export class Foo {
  ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('single class - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop1}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
import { customElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

@customElement({ name: 'foo', template: x })
export class Foo {
  ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
            });

            it('multiple classes - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { customElement } from '@aurelia/runtime-html';
  import x from './${markupFile}';

  @customElement({ name: 'foo', template: x })
  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  @customElement({ name: 'bar', template: x })
  export class Bar {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('multiple classes - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { customElement } from '@aurelia/runtime-html';
  import x from './${markupFile}';

  @customElement({ name: 'foo', template: x })
  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  @customElement({ name: 'bar', template: x })
  export class Bar {
    ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
            });
          });

          describe('string literal assignment', function () {
            it('single class - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
import { customElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

@customElement({ name: 'foo', template: '${markup}' })
export class Foo {
  ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('single class - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop1}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
import { customElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

@customElement({ name: 'foo', template: '${markup}' })
export class Foo {
  ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
            });

            it('multiple classes - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { customElement } from '@aurelia/runtime-html';
  import x from './${markupFile}';

  @customElement({ name: 'foo', template: '${markup}' })
  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  @customElement({ name: 'bar', template: '${markup}' })
  export class Bar {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('multiple classes - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { customElement } from '@aurelia/runtime-html';
  import x from './${markupFile}';

  @customElement({ name: 'foo', template: '${markup}' })
  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  @customElement({ name: 'bar', template: '${markup}' })
  export class Bar {
    ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
            });
          });

          describe('static template property', function () {
            describe('variable assignment', function () {
              it('single class - pass', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { customElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  @customElement({ name: 'foo' })
  export class Foo {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertSuccess(entry, result.code);
              });

              it('single class - fail', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop1}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { customElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  @customElement({ name: 'foo' })
  export class Foo {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
              });

              it('multiple classes - pass', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { customElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  @customElement({ name: 'foo' })
  export class Foo {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  @customElement({ name: 'bar' })
  export class Bar {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertSuccess(entry, result.code);
              });

              it('multiple classes - fail', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { customElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  @customElement({ name: 'foo' })
  export class Foo {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  @customElement({ name: 'bar' })
  export class Bar {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
              });
            });

            describe('string-literal assignment', function () {
              it('single class - pass', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { customElement } from '@aurelia/runtime-html';

  @customElement({ name: 'foo' })
  export class Foo {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertSuccess(entry, result.code);
              });

              it('single class - fail', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop1}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { customElement } from '@aurelia/runtime-html';

  @customElement({ name: 'foo' })
  export class Foo {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
              });

              it('multiple classes - pass', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { customElement } from '@aurelia/runtime-html';

  @customElement({ name: 'foo' })
  export class Foo {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  @customElement({ name: 'bar' })
  export class Bar {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertSuccess(entry, result.code);
              });

              it('multiple classes - fail', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { customElement } from '@aurelia/runtime-html';

  @customElement({ name: 'foo' })
  export class Foo {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  @customElement({ name: 'bar' })
  export class Bar {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
              });
            });
          });
        });
      });

      describe(`$au - language: ${lang}`, function () {
        describe('interpolation', function () {
          describe('short-hand assignment', function () {
            it('single class - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
      template,
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('single class - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop1}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
      template,
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
            });

            it('multiple classes - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
      template,
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  export class Bar {
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'bar',
      template,
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('multiple classes - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
      template,
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  export class Bar {
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'bar',
      template,
    };
    ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
            });
          });

          describe('variable assignment', function () {
            it('single class - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
import x from './${markupFile}';

export class Foo {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'foo',
    template: x,
  };
  ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('single class - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop1}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
import x from './${markupFile}';

export class Foo {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'foo',
    template: x,
  };
  ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
            });

            it('multiple classes - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
  import x from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
      template: x,
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  export class Bar {
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'bar',
      template: x,
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('multiple classes - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
  import x from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
      template: x,
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  export class Bar {
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'bar',
      template: x,
    };
    ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
            });
          });

          describe('string literal assignment', function () {
            it('single class - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
import x from './${markupFile}';

export class Foo {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'foo',
    template: '${markup}',
  };
  ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('single class - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop1}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
import x from './${markupFile}';

export class Foo {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'foo',
    template: '${markup}',
  };
  ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
            });

            it('multiple classes - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
  import x from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
      template: '${markup}',
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  export class Bar {
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'bar',
      template: '${markup}',
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('multiple classes - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
  import x from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
      template: '${markup}',
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  export class Bar {
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'bar',
      template: '${markup}',
    };
    ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
  }
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
            });
          });

          describe('static template property', function () {
            describe('variable assignment', function () {
              it('single class - pass', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertSuccess(entry, result.code);
              });

              it('single class - fail', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop1}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
              });

              it('multiple classes - pass', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  export class Bar {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'bar',
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertSuccess(entry, result.code);
              });

              it('multiple classes - fail', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  export class Bar {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'bar',
    };
    ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
              });
            });

            describe('string-literal assignment', function () {
              it('single class - pass', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}

  export class Foo {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertSuccess(entry, result.code);
              });

              it('single class - fail', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop1}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}

  export class Foo {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
              });

              it('multiple classes - pass', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}

  export class Foo {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  export class Bar {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'bar',
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertSuccess(entry, result.code);
              });

              it('multiple classes - fail', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  ${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}

  export class Foo {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'foo',
    };
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }

  export class Bar {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
      type: 'custom-element',
      name: 'bar',
    };
    ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
  }
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
              });
            });
          });
        });
      });

      describe(`CustomElement.define - language: ${lang}`, function () {
        describe('interpolation', function () {
          describe('short-hand assignment', function () {
            it('single class - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { CustomElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo', template }, Foo);
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('single class - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop1}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { CustomElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo', template }, Foo);
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
            });

            it('multiple classes - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { CustomElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo', template }, Foo);

  export class Bar {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'bar', template }, Bar);
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('multiple classes - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { CustomElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo', template }, Foo);

  export class Bar {
    ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'bar', template }, Bar);
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
            });
          });

          describe('variable assignment', function () {
            it('single class - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
import { CustomElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

export class Foo {
  ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
CustomElement.define({ name: 'foo', template: x }, Foo);
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('single class - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop1}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
import { CustomElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

export class Foo {
  ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
CustomElement.define({ name: 'foo', template: x }, Foo);
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
            });

            it('multiple classes - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { CustomElement } from '@aurelia/runtime-html';
  import x from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo', template: x }, Foo);

  export class Bar {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'bar', template: x }, Bar);
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('multiple classes - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { CustomElement } from '@aurelia/runtime-html';
  import x from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo', template: x }, Foo);

  export class Bar {
    ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'bar', template: x }, Bar);
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
            });
          });

          describe('string literal assignment', function () {
            it('single class - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { CustomElement } from '@aurelia/runtime-html';
  import x from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo', template: '${markup}' }, Foo);
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('single class - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop1}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
  import { CustomElement } from '@aurelia/runtime-html';
  import x from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo', template: '${markup}' }, Foo);
  `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
            });

            it('multiple classes - pass', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
    import { CustomElement } from '@aurelia/runtime-html';
    import x from './${markupFile}';

    export class Foo {
      ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
    }
    CustomElement.define({ name: 'foo', template: '${markup}' }, Foo);

    export class Bar {
      ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
    }
    CustomElement.define({ name: 'bar', template: '${markup}' }, Bar);
    `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertSuccess(entry, result.code);
            });

            it('multiple classes - fail', function () {
              const entry = `entry.${extn}`;
              const markupFile = 'entry.html';
              const markup = '${prop}';
              const result = preprocessResource(
                {
                  path: entry,
                  contents: `
    import { CustomElement } from '@aurelia/runtime-html';
    import x from './${markupFile}';

    export class Foo {
      ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
    }
    CustomElement.define({ name: 'foo', template: '${markup}' }, Foo);

    export class Bar {
      ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
    }
    CustomElement.define({ name: 'bar', template: '${markup}' }, Bar);
    `,
                  readFile: createMarkupReader(markupFile, markup),
                }, options);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
            });
          });

          describe('static template property', function () {
            describe('variable assignment', function () {
              it('single class - pass', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { CustomElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo' }, Foo);
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertSuccess(entry, result.code);
              });

              it('single class - fail', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop1}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { CustomElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo' }, Foo);
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
              });

              it('multiple classes - pass', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { CustomElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo' }, Foo);

  export class Bar {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'bar' }, Bar);
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertSuccess(entry, result.code);
              });

              it('multiple classes - fail', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { CustomElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  export class Foo {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo' }, Foo);

  export class Bar {
    ${isTs ? 'public ' : ''}static template = template;
    ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'bar' }, Bar);
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
              });
            });

            describe('string-literal assignment', function () {
              it('single class - pass', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { CustomElement } from '@aurelia/runtime-html';

  export class Foo {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo' }, Foo);
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertSuccess(entry, result.code);
              });

              it('single class - fail', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop1}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { CustomElement } from '@aurelia/runtime-html';

  export class Foo {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo' }, Foo);
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Foo'\./]);
              });

              it('multiple classes - pass', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { CustomElement } from '@aurelia/runtime-html';

  export class Foo {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo' }, Foo);

  export class Bar {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'bar' }, Bar);
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertSuccess(entry, result.code);
              });

              it('multiple classes - fail', function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = '${prop}';
                const result = preprocessResource(
                  {
                    path: entry,
                    contents: `
  import { CustomElement } from '@aurelia/runtime-html';

  export class Foo {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'foo' }, Foo);

  export class Bar {
    ${isTs ? 'public ' : ''}static template = '${markup}';
    ${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
  }
  CustomElement.define({ name: 'bar' }, Bar);
  `,
                    readFile: createMarkupReader(markupFile, markup),
                  }, options);

                assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Bar'\./]);
              });
            });
          });
        });
      });

      it(`nested property interpolation - pass - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '${prop.x}';
        const depFile = `dep${isTs ? '' : `.${extn}`}`;
        const additionalModules = {
          [depFile]: `export class Dep {
          ${isTs ? 'public constructor(public x: string) {}' : '/** @type {string} */x'}
      }`};
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
import { Dep } from './${depFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Dep} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Dep' : ''};
}
`,
            readFile: createMarkupReader(markupFile,  markup),
          }, options);

        assertSuccess(entry, result.code, additionalModules);
      });

      it(`nested property interpolation - fail - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '${prop.y}';
        const depFile = `dep${isTs ? '' : `.${extn}`}`;
        const additionalModules = {
          [depFile]: `export class Dep {
          ${isTs ? 'public constructor(public x: string) {}' : '/** @type {string} */x'}
      }`};
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
import { Dep } from './${depFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @type {Dep} */'}
${isTs ? 'public ' : ''}prop${isTs ? ': Dep' : ''};
}
`,
            readFile: createMarkupReader(markupFile,  markup),
          }, options);

        assertFailure(entry, result.code, [/Property 'y' does not exist on type 'Dep'/], additionalModules);
      });

      it(`custom-element bindable - pass - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '<ce-one prop.bind="prop"></ce-one>';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, options);

        assertSuccess(entry, result.code);
      });

      it(`custom-element bindable - fail - incorrect host property - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '<ce-one prop.bind="prop"></ce-one>';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, options);

        assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Foo'/]);
      });

      // TODO: make this work; probably need to use something like webpack plugin to access to the complete TS project
      it.skip(`custom-element bindable - fail - incorrect CE bindable - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '<ce-one prop.bind="prop"></ce-one>';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop1}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, options);

        assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'CeOne'/]);
      });

      it(`custom-element bindable - short-hand - pass - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '<ce-one prop.bind></ce-one>';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, options);

        assertSuccess(entry, result.code);
      });

      it(`custom-element bindable - short-hand - fail - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '<ce-one prop.bind></ce-one>';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement, bindable } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'ce-one', template: '\${prop}' })
export class CeOne {
@bindable
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? 'public ' : ''}prop1${isTs ? ': string' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, options);

        assertFailure(entry, result.code, [/Property 'prop' does not exist on type 'Foo'/]);
      });
    }
  });

  describe('with convention', function () {
    const options = preprocessOptions({
      enableConventions: true,
      typeCheckTemplate: true,
    });

    for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']] as const) {
      const isTs = lang === 'TypeScript';
      it(`without decorator - pass - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '${prop}';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
            filePair: markupFile,
          }, options);

        assertSuccess(entry, result.code);
      });

      it(`without decorator - fail - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '${prop1}';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';

export class Entry {
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
            filePair: markupFile,
          }, options);

        assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Entry'\./]);
      });

      it(`with decorator - pass - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '${prop}';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement('ent-ry')
export class Entry {
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
            filePair: markupFile,
          }, options);

        assertSuccess(entry, result.code);
      });

      it(`with decorator - fail - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '${prop1}';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement('ent-ry')
export class Entry {
${isTs ? 'public ' : ''}prop${isTs ? ': string' : ''};
}
`,
            readFile: createMarkupReader(markupFile, markup),
            filePair: markupFile,
          }, options);

        assertFailure(entry, result.code, [/Property 'prop1' does not exist on type 'Entry'\./]);
      });
    }
  });
});
