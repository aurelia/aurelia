"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonConventionalOptions = void 0;
/* eslint-disable no-template-curly-in-string */
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const testing_1 = require("@aurelia/testing");
const _shared_1 = require("./_shared");
exports.nonConventionalOptions = (0, plugin_conventions_1.preprocessOptions)({
    enableConventions: false,
    experimentalTemplateTypeCheck: true,
});
describe('type-checking/without-convention.basic', function () {
    for (const [lang, extn] of [['TypeScript', 'ts'], ['JavaScript', 'js'], ['ESM', 'mjs']]) {
        const isTs = lang === 'TypeScript';
        describe(`@customElement - language: ${lang}`, function () {
            describe('interpolation', function () {
                describe('short-hand assignment', function () {
                    it('single class - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('single class - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop1}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                    });
                    it('multiple classes - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}

@customElement({ name: 'bar', template })
export class Bar {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('multiple classes - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

@customElement({ name: 'bar', template })
export class Bar {
${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
                    });
                });
                describe('variable assignment', function () {
                    it('single class - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { customElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

@customElement({ name: 'foo', template: x })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('single class - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop1}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { customElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

@customElement({ name: 'foo', template: x })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                    });
                    it('multiple classes - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { customElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

@customElement({ name: 'foo', template: x })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}

@customElement({ name: 'bar', template: x })
export class Bar {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('multiple classes - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { customElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

@customElement({ name: 'foo', template: x })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}

@customElement({ name: 'bar', template: x })
export class Bar {
${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
                    });
                });
                describe('string literal assignment', function () {
                    it('single class - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { customElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

@customElement({ name: 'foo', template: '${markup}' })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('single class - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop1}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { customElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

@customElement({ name: 'foo', template: '${markup}' })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                    });
                    it('multiple classes - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { customElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

@customElement({ name: 'foo', template: '${markup}' })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}

@customElement({ name: 'bar', template: '${markup}' })
export class Bar {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('multiple classes - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { customElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

@customElement({ name: 'foo', template: '${markup}' })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}

@customElement({ name: 'bar', template: '${markup}' })
export class Bar {
${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
                    });
                });
                describe('static template property', function () {
                    describe('variable assignment', function () {
                        it('single class - pass', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo' })
export class Foo {
  ${isTs ? 'public ' : ''}static template = template;
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertSuccess)(entry, result.code);
                        });
                        it('single class - fail', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop1}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo' })
export class Foo {
  ${isTs ? 'public ' : ''}static template = template;
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                        });
                        it('multiple classes - pass', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo' })
export class Foo {
  ${isTs ? 'public ' : ''}static template = template;
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

@customElement({ name: 'bar' })
export class Bar {
  ${isTs ? 'public ' : ''}static template = template;
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertSuccess)(entry, result.code);
                        });
                        it('multiple classes - fail', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo' })
export class Foo {
  ${isTs ? 'public ' : ''}static template = template;
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

@customElement({ name: 'bar' })
export class Bar {
  ${isTs ? 'public ' : ''}static template = template;
  ${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
                        });
                    });
                    describe('string-literal assignment', function () {
                        it('single class - pass', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { customElement } from '@aurelia/runtime-html';

@customElement({ name: 'foo' })
export class Foo {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertSuccess)(entry, result.code);
                        });
                        it('single class - fail', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop1}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { customElement } from '@aurelia/runtime-html';

@customElement({ name: 'foo' })
export class Foo {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                        });
                        it('multiple classes - pass', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { customElement } from '@aurelia/runtime-html';

@customElement({ name: 'foo' })
export class Foo {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

@customElement({ name: 'bar' })
export class Bar {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertSuccess)(entry, result.code);
                        });
                        it('multiple classes - fail', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { customElement } from '@aurelia/runtime-html';

@customElement({ name: 'foo' })
export class Foo {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

@customElement({ name: 'bar' })
export class Bar {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
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
                        const result = (0, plugin_conventions_1.preprocessResource)({
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
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('single class - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop1}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
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
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                    });
                    it('multiple classes - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
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
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
    template,
  };
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('multiple classes - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
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
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
    template,
  };
  ${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
                    });
                });
                describe('variable assignment', function () {
                    it('single class - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
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
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('single class - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop1}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
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
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                    });
                    it('multiple classes - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
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
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
    template: x,
  };
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('multiple classes - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
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
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
    template: x,
  };
  ${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
                    });
                });
                describe('string literal assignment', function () {
                    it('single class - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
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
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('single class - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop1}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
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
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                    });
                    it('multiple classes - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
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
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
    template: '${markup}',
  };
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('multiple classes - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
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
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
    template: '${markup}',
  };
  ${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
                    });
                });
                describe('static template property', function () {
                    describe('variable assignment', function () {
                        it('single class - pass', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
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
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertSuccess)(entry, result.code);
                        });
                        it('single class - fail', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop1}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
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
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                        });
                        it('multiple classes - pass', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
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
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static template = template;
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
  };
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertSuccess)(entry, result.code);
                        });
                        it('multiple classes - fail', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
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
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static template = template;
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
  };
  ${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
                        });
                    });
                    describe('string-literal assignment', function () {
                        it('single class - pass', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
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
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertSuccess)(entry, result.code);
                        });
                        it('single class - fail', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop1}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}

export class Foo {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'foo',
  };
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                        });
                        it('multiple classes - pass', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}

export class Foo {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'foo',
  };
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
  };
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertSuccess)(entry, result.code);
                        });
                        it('multiple classes - fail', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
${isTs ? `import type { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';` : ''}

export class Foo {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'foo',
  };
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}

export class Bar {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${isTs ? 'public ' : ''}static $au${isTs ? ': CustomElementStaticAuDefinition' : ''} = {
    type: 'custom-element',
    name: 'bar',
  };
  ${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
                        });
                    });
                });
            });
            it(`template controller - nested repeat object map - pass - language: ${lang}`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
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
${(0, _shared_1.prop)('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}

class Salt {
${(0, _shared_1.prop)('x', 'number', isTs)}

${(0, _shared_1.prop)('y', 'number', isTs)}
}

class Lime {
${(0, _shared_1.prop)('a', 'string', isTs)}

${(0, _shared_1.prop)('b', 'string', isTs)}
}

class Shot {
${(0, _shared_1.prop)('m', 'string', isTs)}

${(0, _shared_1.prop)('n', 'string', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, exports.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - nested repeat object map - fail - incorrect declaration - language: ${lang}`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v1">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
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
  ${(0, _shared_1.prop)('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}

class Salt {
${(0, _shared_1.prop)('x', 'number', isTs)}

${(0, _shared_1.prop)('y', 'number', isTs)}
}

class Lime {
${(0, _shared_1.prop)('a', 'string', isTs)}

${(0, _shared_1.prop)('b', 'string', isTs)}
}

class Shot {
${(0, _shared_1.prop)('m', 'string', isTs)}

${(0, _shared_1.prop)('n', 'string', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, exports.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property '.*v1\d+' does not exist on type '.*Foo.*'/], undefined, true);
            });
            it(`template controller - nested repeat object map - fail - incorrect usage - language: ${lang}`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.aa},\${lm.b})</template></template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
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
  ${(0, _shared_1.prop)('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}

class Salt {
${(0, _shared_1.prop)('x', 'number', isTs)}

${(0, _shared_1.prop)('y', 'number', isTs)}
}

class Lime {
${(0, _shared_1.prop)('a', 'string', isTs)}

${(0, _shared_1.prop)('b', 'string', isTs)}
}

class Shot {
${(0, _shared_1.prop)('m', 'string', isTs)}

${(0, _shared_1.prop)('n', 'string', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, exports.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property 'aa' does not exist on type 'Lime'/]);
            });
        });
        describe(`CustomElement.define - language: ${lang}`, function () {
            describe('interpolation', function () {
                describe('short-hand assignment', function () {
                    it('single class - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { CustomElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

export class Foo {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template }, Foo);
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('single class - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop1}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { CustomElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

export class Foo {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template }, Foo);
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                    });
                    it('multiple classes - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { CustomElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

export class Foo {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template }, Foo);

export class Bar {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'bar', template }, Bar);
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('multiple classes - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { CustomElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

export class Foo {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template }, Foo);

export class Bar {
  ${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
CustomElement.define({ name: 'bar', template }, Bar);
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
                    });
                });
                describe('variable assignment', function () {
                    it('single class - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { CustomElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

export class Foo {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template: x }, Foo);
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('single class - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop1}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { CustomElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

export class Foo {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template: x }, Foo);
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                    });
                    it('multiple classes - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { CustomElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

export class Foo {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template: x }, Foo);

export class Bar {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'bar', template: x }, Bar);
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('multiple classes - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { CustomElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

export class Foo {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template: x }, Foo);

export class Bar {
  ${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
CustomElement.define({ name: 'bar', template: x }, Bar);
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
                    });
                });
                describe('string literal assignment', function () {
                    it('single class - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { CustomElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

export class Foo {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template: '${markup}' }, Foo);
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('single class - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop1}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
import { CustomElement } from '@aurelia/runtime-html';
import x from './${markupFile}';

export class Foo {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo', template: '${markup}' }, Foo);
`,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                    });
                    it('multiple classes - pass', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
  import { CustomElement } from '@aurelia/runtime-html';
  import x from './${markupFile}';

  export class Foo {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
  }
  CustomElement.define({ name: 'foo', template: '${markup}' }, Foo);

  export class Bar {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
  }
  CustomElement.define({ name: 'bar', template: '${markup}' }, Bar);
  `,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertSuccess)(entry, result.code);
                    });
                    it('multiple classes - fail', function () {
                        const entry = `entry.${extn}`;
                        const markupFile = 'entry.html';
                        const markup = '${prop}';
                        const result = (0, plugin_conventions_1.preprocessResource)({
                            path: entry,
                            contents: `
  import { CustomElement } from '@aurelia/runtime-html';
  import x from './${markupFile}';

  export class Foo {
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
  }
  CustomElement.define({ name: 'foo', template: '${markup}' }, Foo);

  export class Bar {
  ${(0, _shared_1.prop)('prop1', 'string', isTs)}
  }
  CustomElement.define({ name: 'bar', template: '${markup}' }, Bar);
  `,
                            readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                        }, exports.nonConventionalOptions);
                        (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
                    });
                });
                describe('static template property', function () {
                    describe('variable assignment', function () {
                        it('single class - pass', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { CustomElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

export class Foo {
  ${isTs ? 'public ' : ''}static template = template;
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertSuccess)(entry, result.code);
                        });
                        it('single class - fail', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop1}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { CustomElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

export class Foo {
  ${isTs ? 'public ' : ''}static template = template;
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                        });
                        it('multiple classes - pass', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { CustomElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

export class Foo {
  ${isTs ? 'public ' : ''}static template = template;
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);

export class Bar {
  ${isTs ? 'public ' : ''}static template = template;
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'bar' }, Bar);
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertSuccess)(entry, result.code);
                        });
                        it('multiple classes - fail', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { CustomElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

export class Foo {
  ${isTs ? 'public ' : ''}static template = template;
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);

export class Bar {
  ${isTs ? 'public ' : ''}static template = template;
  ${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
CustomElement.define({ name: 'bar' }, Bar);
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
                        });
                    });
                    describe('string-literal assignment', function () {
                        it('single class - pass', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { CustomElement } from '@aurelia/runtime-html';

export class Foo {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertSuccess)(entry, result.code);
                        });
                        it('single class - fail', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop1}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { CustomElement } from '@aurelia/runtime-html';

export class Foo {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop1' does not exist on type '.*Foo.*'\./]);
                        });
                        it('multiple classes - pass', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { CustomElement } from '@aurelia/runtime-html';

export class Foo {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);

export class Bar {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'bar' }, Bar);
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertSuccess)(entry, result.code);
                        });
                        it('multiple classes - fail', function () {
                            const entry = `entry.${extn}`;
                            const markupFile = 'entry.html';
                            const markup = '${prop}';
                            const result = (0, plugin_conventions_1.preprocessResource)({
                                path: entry,
                                contents: `
import { CustomElement } from '@aurelia/runtime-html';

export class Foo {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${(0, _shared_1.prop)('prop', 'string', isTs)}
}
CustomElement.define({ name: 'foo' }, Foo);

export class Bar {
  ${isTs ? 'public ' : ''}static template = '${markup}';
  ${(0, _shared_1.prop)('prop1', 'string', isTs)}
}
CustomElement.define({ name: 'bar' }, Bar);
`,
                                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                            }, exports.nonConventionalOptions);
                            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'prop' does not exist on type '.*Bar.*'\./]);
                        });
                    });
                });
            });
            it(`template controller - nested repeat object map - pass - language: ${lang}`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { CustomElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

export class Foo {
${(0, _shared_1.prop)('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}
CustomElement.define({ name: 'foo', template }, Foo);

class Salt {
${(0, _shared_1.prop)('x', 'number', isTs)}

${(0, _shared_1.prop)('y', 'number', isTs)}
}

class Lime {
${(0, _shared_1.prop)('a', 'string', isTs)}

${(0, _shared_1.prop)('b', 'string', isTs)}
}

class Shot {
${(0, _shared_1.prop)('m', 'string', isTs)}

${(0, _shared_1.prop)('n', 'string', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, exports.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
            });
            it(`template controller - nested repeat object map - fail - incorrect declaration - language: ${lang}`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v1">(\${sh.m},\${sh.n}) - (\${lm.a},\${lm.b})</template></template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { CustomElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

export class Foo {
${(0, _shared_1.prop)('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}
CustomElement.define({ name: 'foo', template }, Foo);

class Salt {
${(0, _shared_1.prop)('x', 'number', isTs)}

${(0, _shared_1.prop)('y', 'number', isTs)}
}

class Lime {
${(0, _shared_1.prop)('a', 'string', isTs)}

${(0, _shared_1.prop)('b', 'string', isTs)}
}

class Shot {
${(0, _shared_1.prop)('m', 'string', isTs)}

${(0, _shared_1.prop)('n', 'string', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, exports.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property '.*v1\d+' does not exist on type '.*Foo.*'/], undefined, true);
            });
            it(`template controller - nested repeat object map - fail - incorrect usage - language: ${lang}`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `<template repeat.for="[sl, v] of prop">(\${sl.x},\${sl.y}) <template repeat.for="[sh, lm] of v">(\${sh.m},\${sh.n}) - (\${lm.aa},\${lm.b})</template></template>`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { CustomElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

export class Foo {
${(0, _shared_1.prop)('prop', 'Map<Salt, Map<Shot, Lime>>', isTs)}
}
CustomElement.define({ name: 'foo', template }, Foo);

class Salt {
${(0, _shared_1.prop)('x', 'number', isTs)}

${(0, _shared_1.prop)('y', 'number', isTs)}
}

class Lime {
${(0, _shared_1.prop)('a', 'string', isTs)}

${(0, _shared_1.prop)('b', 'string', isTs)}
}

class Shot {
${(0, _shared_1.prop)('m', 'string', isTs)}

${(0, _shared_1.prop)('n', 'string', isTs)}
}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, exports.nonConventionalOptions);
                (0, _shared_1.assertFailure)(entry, result.code, [/Property 'aa' does not exist on type 'Lime'/]);
            });
        });
        it(`interpolation - fail - reserved identifier prefix - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = `\${__Template_TypeCheck_Synthetic_Foo1}`;
            testing_1.assert.throws(() => {
                (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, exports.nonConventionalOptions);
            }, /Identifier '__Template_TypeCheck_Synthetic_Foo1' uses reserved prefix '__Template_TypeCheck_Synthetic_'; consider renaming it./);
        });
        for (const literal of ['true', 'false', 'null', 'undefined', '']) {
            it(`primitive literal - ${literal} - pass - language: ${lang}`, function () {
                const entry = `entry.${extn}`;
                const markupFile = 'entry.html';
                const markup = `${literal}`;
                const result = (0, plugin_conventions_1.preprocessResource)({
                    path: entry,
                    contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {}
`,
                    readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
                }, exports.nonConventionalOptions);
                (0, _shared_1.assertSuccess)(entry, result.code);
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
    }`
            };
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
import { Dep } from './${depFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Dep', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, exports.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code, additionalModules);
        });
        it(`nested property interpolation - fail - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '${prop.y}';
            const depFile = `dep${isTs ? '' : `.${extn}`}`;
            const additionalModules = {
                [depFile]: `export class Dep {
        ${isTs ? 'public constructor(public x: string) {}' : '/** @type {string} */x'}
    }`
            };
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
import { Dep } from './${depFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Dep', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, exports.nonConventionalOptions);
            (0, _shared_1.assertFailure)(entry, result.code, [/Property 'y' does not exist on type 'Dep'/], additionalModules);
        });
        it(`interpolation - method call - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '${prop().toUpperCase()}';
            const result = (0, plugin_conventions_1.preprocessResource)({
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
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, exports.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code);
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
    }`
            };
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';
import { Dep } from './${depFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'Dep', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, exports.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code, additionalModules);
        });
        it(`interpolation - $parent - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = '${$parent.x}';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, exports.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
        it(`interpolation - with pre-/postfix - pass - language: ${lang}`, function () {
            const entry = `entry.${extn}`;
            const markupFile = 'entry.html';
            const markup = 'pre ${prop} post';
            const result = (0, plugin_conventions_1.preprocessResource)({
                path: entry,
                contents: `
import { customElement } from '@aurelia/runtime-html';
import template from './${markupFile}';

@customElement({ name: 'foo', template })
export class Foo {
${(0, _shared_1.prop)('prop', 'string', isTs)}
}
`,
                readFile: (0, _shared_1.createMarkupReader)(markupFile, markup),
            }, exports.nonConventionalOptions);
            (0, _shared_1.assertSuccess)(entry, result.code);
        });
    }
});
//# sourceMappingURL=without-convention.basic.spec.js.map