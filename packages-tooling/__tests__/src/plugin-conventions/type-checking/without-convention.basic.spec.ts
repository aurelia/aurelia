/* eslint-disable no-template-curly-in-string */
import {
  preprocessOptions,
  preprocessResource,
} from '@aurelia/plugin-conventions';
import {
  assert,
} from '@aurelia/testing';
import {
  assertFailure,
  assertSuccess,
  createMarkupReader,
  prop,
} from './_shared';

export const nonConventionalOptions = preprocessOptions({
  enableConventions: false,
  experimentalTemplateTypeCheck: true,
});

describe('type-checking/without-convention.basic', function () {

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
${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
${prop('prop', 'string', isTs)}
}

@customElement({ name: 'bar', template })
export class Bar {
${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}

@customElement({ name: 'bar', template })
export class Bar {
${prop('prop1', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
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
${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
${prop('prop', 'string', isTs)}
}

@customElement({ name: 'bar', template: x })
export class Bar {
${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
${prop('prop', 'string', isTs)}
}

@customElement({ name: 'bar', template: x })
export class Bar {
${prop('prop1', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
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
${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
${prop('prop', 'string', isTs)}
}

@customElement({ name: 'bar', template: '${markup}' })
export class Bar {
${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
${prop('prop', 'string', isTs)}
}

@customElement({ name: 'bar', template: '${markup}' })
export class Bar {
${prop('prop1', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}

@customElement({ name: 'bar' })
export class Bar {
  ${isTs ? 'public ' : ''}static template = template;
  ${prop('prop', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}

@customElement({ name: 'bar' })
export class Bar {
  ${isTs ? 'public ' : ''}static template = template;
  ${prop('prop1', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}

@customElement({ name: 'bar' })
export class Bar {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${prop('prop', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}

@customElement({ name: 'bar' })
export class Bar {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${prop('prop1', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
    template,
  };
  ${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
    template,
  };
  ${prop('prop1', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
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
${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
    template: x,
  };
  ${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
    template: x,
  };
  ${prop('prop1', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
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
${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
    template: '${markup}',
  };
  ${prop('prop', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
    template: '${markup}',
  };
  ${prop('prop1', 'string', isTs)}
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static template = template;
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
  };
  ${prop('prop', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static template = template;
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
  };
  ${prop('prop1', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
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
                }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
  };
  ${prop('prop', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
  };
  ${prop('prop1', 'string', isTs)}
}
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
            });
          });
        });
      });

      it(`template controller - nested repeat object map - pass - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
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
${prop('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}

class Salt {
${prop('x', 'number', isTs)}

${prop('y', 'number', isTs)}
}

class Lime {
${prop('a', 'string', isTs)}

${prop('b', 'string', isTs)}
}

class Shot {
${prop('m', 'string', isTs)}

${prop('n', 'string', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - nested repeat object map - fail - incorrect declaration - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v1">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
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
  ${prop('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}

class Salt {
${prop('x', 'number', isTs)}

${prop('y', 'number', isTs)}
}

class Lime {
${prop('a', 'string', isTs)}

${prop('b', 'string', isTs)}
}

class Shot {
${prop('m', 'string', isTs)}

${prop('n', 'string', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property '.*v1\d+' does not exist on type '.*Foo.*'/], undefined, true);
      });

      it(`template controller - nested repeat object map - fail - incorrect usage - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.aa},\${lm.b})</template></template>`;
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
  ${prop('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}

class Salt {
${prop('x', 'number', isTs)}

${prop('y', 'number', isTs)}
}

class Lime {
${prop('a', 'string', isTs)}

${prop('b', 'string', isTs)}
}

class Shot {
${prop('m', 'string', isTs)}

${prop('n', 'string', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'aa' does not exist on type 'Lime'/]);
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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template }, Foo);
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template }, Foo);
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template }, Foo);

export class Bar {
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'bar', template }, Bar);
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template }, Foo);

export class Bar {
  ${prop('prop1', 'string', isTs)}
}
CustomElement.define({ name: 'bar', template }, Bar);
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template: x }, Foo);
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template: x }, Foo);
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template: x }, Foo);

export class Bar {
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'bar', template: x }, Bar);
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template: x }, Foo);

export class Bar {
  ${prop('prop1', 'string', isTs)}
}
CustomElement.define({ name: 'bar', template: x }, Bar);
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template: '${markup}' }, Foo);
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template: '${markup}' }, Foo);
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
  ${prop('prop', 'string', isTs)}
  }
  CustomElement.define({ name: 'foo', template: '${markup}' }, Foo);

  export class Bar {
  ${prop('prop', 'string', isTs)}
  }
  CustomElement.define({ name: 'bar', template: '${markup}' }, Bar);
  `,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
  }
  CustomElement.define({ name: 'foo', template: '${markup}' }, Foo);

  export class Bar {
  ${prop('prop1', 'string', isTs)}
  }
  CustomElement.define({ name: 'bar', template: '${markup}' }, Bar);
  `,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);

export class Bar {
  ${isTs ? 'public ' : ''}static template = template;
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'bar' }, Bar);
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);

export class Bar {
  ${isTs ? 'public ' : ''}static template = template;
  ${prop('prop1', 'string', isTs)}
}
CustomElement.define({ name: 'bar' }, Bar);
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

              assertFailure(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);

export class Bar {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'bar' }, Bar);
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

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
  ${prop('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);

export class Bar {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${prop('prop1', 'string', isTs)}
}
CustomElement.define({ name: 'bar' }, Bar);
`,
                  readFile: createMarkupReader(markupFile, markup),
                }, nonConventionalOptions);

              assertFailure(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
            });
          });
        });
      });

      it(`template controller - nested repeat object map - pass - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { CustomElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

export class Foo {
${prop('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}
CustomElement.define({ name: 'foo', template }, Foo);

class Salt {
${prop('x', 'number', isTs)}

${prop('y', 'number', isTs)}
}

class Lime {
${prop('a', 'string', isTs)}

${prop('b', 'string', isTs)}
}

class Shot {
${prop('m', 'string', isTs)}

${prop('n', 'string', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`template controller - nested repeat object map - fail - incorrect declaration - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v1">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { CustomElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

export class Foo {
${prop('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}
CustomElement.define({ name: 'foo', template }, Foo);

class Salt {
${prop('x', 'number', isTs)}

${prop('y', 'number', isTs)}
}

class Lime {
${prop('a', 'string', isTs)}

${prop('b', 'string', isTs)}
}

class Shot {
${prop('m', 'string', isTs)}

${prop('n', 'string', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property '.*v1\d+' does not exist on type '.*Foo.*'/], undefined, true);
      });

      it(`template controller - nested repeat object map - fail - incorrect usage - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.aa},\${lm.b})</template></template>`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { CustomElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

export class Foo {
${prop('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}
CustomElement.define({ name: 'foo', template }, Foo);

class Salt {
${prop('x', 'number', isTs)}

${prop('y', 'number', isTs)}
}

class Lime {
${prop('a', 'string', isTs)}

${prop('b', 'string', isTs)}
}

class Shot {
${prop('m', 'string', isTs)}

${prop('n', 'string', isTs)}
}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'aa' does not exist on type 'Lime'/]);
      });
    });

    it(`interpolation - fail - reserved identifier prefix - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = `\${__Template_TypeCheck_Synthetic_Foo1}`;
      assert.throws(() => {
        preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);
      }, /Identifier '__Template_TypeCheck_Synthetic_Foo1' uses reserved prefix '__Template_TypeCheck_Synthetic_'; consider renaming it./);
    });

    for (const literal of ['true', 'false', 'null', 'undefined', '']) {
      it(`primitive literal - ${literal} - pass - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = `${literal}`;
        const result = preprocessResource(
          {
            path: entry,
            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {}
`,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });
    }

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
${prop('prop', 'Dep', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

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
${prop('prop', 'Dep', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertFailure(entry, result.code, [/Property 'y' does not exist on type 'Dep'/], additionalModules);
    });

    it(`interpolation - method call - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '${prop().toUpperCase()}';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : '/** @returns {string} */'}
${isTs ? 'public ' : ''}prop()${isTs ? ': string' : ''} { return 'foo'; }
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertSuccess(entry, result.code);
    });

    it(`interpolation - nested method call - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '${prop.x().toUpperCase()}';
      const depFile = `dep${isTs ? '' : `.${extn}`}`;
      const additionalModules = {
        [depFile]: `export class Dep {
        ${isTs ? '' : '/** @returns {string} */'}
        ${isTs ? 'public ' : ''}x()${isTs ? ': string' : ''} { return 'foo'; }
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
${prop('prop', 'Dep', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertSuccess(entry, result.code, additionalModules);
    });

    it(`interpolation - $parent - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = '${$parent.x}';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertSuccess(entry, result.code);
    });

    it(`interpolation - with pre-/postfix - pass - language: ${lang}`, function () {
      const entry = `entry.${extn}`;
      const markupFile = 'entry.html';
      const markup = 'pre ${prop} post';
      const result = preprocessResource(
        {
          path: entry,
          contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${prop('prop', 'string', isTs)}
}
`,
          readFile: createMarkupReader(markupFile, markup),
        }, nonConventionalOptions);

      assertSuccess(entry, result.code);
    });

    describe.only('union typed', function () {
      it(`property - pass - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '${prop.toString()}';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
      import { customElement } from '@aurelia/runtime-html';
      import template from './${markupFile}';

      @customElement({ name: 'foo', template })
      export class Foo {
      ${prop('prop', 'string | number', isTs)}
      }
      `,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`property - fail - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '${prop.toExponential(2)}';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
          import { customElement } from '@aurelia/runtime-html';
          import template from './${markupFile}';

          @customElement({ name: 'foo', template })
          export class Foo {
          ${prop('prop', 'string | number', isTs)}
          }
          `,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'toExponential' does not exist on type 'string \| number'/]);
      });

      it(`accessor - pass - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '${prop.toString()}';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
    import { customElement } from '@aurelia/runtime-html';
    import template from './${markupFile}';

    @customElement({ name: 'foo', template })
    export class Foo {
    ${isTs ? '' : `
    /**
     * @public
     * @type {string|number}
     */
    `}
    ${isTs ? `public ` : ''}get prop()${isTs ? `: string | number` : ''} { return 'foo'; };
    }
    `,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

      it(`accessor - fail - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '${prop.toExponential(2)}';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
        import { customElement } from '@aurelia/runtime-html';
        import template from './${markupFile}';

        @customElement({ name: 'foo', template })
        export class Foo {
        ${isTs ? '' : `
        /**
         * @public
         * @type {string|number}
         */
        `}
        ${isTs ? `public ` : ''}get prop()${isTs ? `: string | number` : ''} { return 'foo'; };
        }
        `,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertFailure(entry, result.code, [/Property 'toExponential' does not exist on type 'string \| number'/]);
      });

      it.only(`method - pass - language: ${lang}`, function () {
        const entry = `entry.${extn}`;
        const markupFile = 'entry.html';
        const markup = '${prop(\'foo\', 42, bar)}';
        const result = preprocessResource(
          {
            path: entry,
            contents: `
          import { customElement } from '@aurelia/runtime-html';
          import template from './${markupFile}';

          @customElement({ name: 'foo', template })
          export class Foo {
          ${prop('bar', 'number | boolean', isTs)}
          ${isTs ? '' : `
          /**
           * @param {string | number} x
           * @param {number | string} y
           * @param {number | boolean} z
           * @returns {string}
           * @public
           */
          `}
          ${isTs ? `public ` : ''}prop(x${isTs ? `: string | number` : ''}, y${isTs ? `: number | string` : ''}, z${isTs ? `: number | boolean` : ''})${isTs ? `: string` : ''} { return 'foo'; };
          }
          `,
            readFile: createMarkupReader(markupFile, markup),
          }, nonConventionalOptions);

        assertSuccess(entry, result.code);
      });

    });
    // TODO(Sayan): union typed method argument
    // TODO(Sayan): overloaded method

    describe('access modifier', function () {
      for (const am of ['public', 'protected', 'private'] as const) {
        it(`${am} property - language: ${lang}`, function () {
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
${prop('prop', 'string', isTs, am)}
}
`,
              readFile: createMarkupReader(markupFile, markup),
            }, nonConventionalOptions);

          assertSuccess(entry, result.code);
        });

        it(`${am} accessor - language: ${lang}`, function () {
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
${isTs ? '' : `
/**
 * @${am}
 * @type {string}
 */
`}
${isTs ? `${am} ` : ''}get prop()${isTs ? `: string` : ''} { return 'foo'; };
}
`,
              readFile: createMarkupReader(markupFile, markup),
            }, nonConventionalOptions);

          assertSuccess(entry, result.code);
        });

        describe(`${am} method - language: ${lang}`, function () {
          it(`without argument - pass`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '${prop()}';
            const result = preprocessResource(
              {
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${isTs ? '' : `
/**
 * @${am}
 * @returns {string}
 */
`}
${isTs ? `${am} ` : ''}prop()${isTs ? `: string` : ''} { return 'foo'; };
}
`,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertSuccess(entry, result.code);
          });

          it(`with arguments - pass`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '${prop(\'foo\', 42)}';
            const result = preprocessResource(
              {
                path: entry,
                contents: `
  import { customElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  @customElement({ name: 'foo', template })
  export class Foo {
  ${isTs ? '' : `
  /**
   * @param {string} x
   * @param {number} y
   * @returns {string}
   * @${am}
   */
  `}
  ${isTs ? `${am} ` : ''}prop(x${isTs ? `: string` : ''}, y${isTs ? `: number` : ''})${isTs ? `: string` : ''} { return 'foo'; };
  }
  `,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertSuccess(entry, result.code);
          });

          it(`with arguments - fail`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '${prop(42, \'foo\')}';
            const result = preprocessResource(
              {
                path: entry,
                contents: `
  import { customElement } from '@aurelia/runtime-html';
  import template from './${markupFile}';

  @customElement({ name: 'foo', template })
  export class Foo {
  ${isTs ? '' : `
  /**
   * @param {string} x
   * @param {number} y
   * @returns {string}
   * @${am}
   */
  `}
  ${isTs ? `${am} ` : ''}prop(x${isTs ? `: string` : ''}, y${isTs ? `: number` : ''})${isTs ? `: string` : ''} { return 'foo'; };
  }
  `,
                readFile: createMarkupReader(markupFile, markup),
              }, nonConventionalOptions);

            assertFailure(entry, result.code, [/Argument of type 'number' is not assignable to parameter of type 'string'/]);
          });
        });
      }
    });
  }
});
