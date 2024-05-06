import * as path from 'path';
import { preprocessResource, preprocessOptions } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';

describe('preprocessResource', function () {
  it('ignores file without html pair', function () {
    const code = `export class Foo {}\n`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo.js'),
        contents: code
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, code);
  });

  it('ignores file with html pair but wrong resource name', function () {
    const code = `export class Bar {}\n`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo.js'),
        contents: code,
        filePair: 'foo.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, code);
  });

  it('injects custom element definition', function () {
    const code = `\nexport class FooBar {}\n`;
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './foo-bar.html';

export class FooBar {}
CustomElement.define(__au2ViewDef, FooBar);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects custom element definition for loosely equal class name', function () {
    const code = `export class UAFooBarCustomElement {}\n`;
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './ua-foo-bar.html';
export class UAFooBarCustomElement {}
CustomElement.define(__au2ViewDef, UAFooBarCustomElement);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'ua-foo-bar.js'),
        contents: code,
        filePair: 'ua-foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects custom element definition for non-kebab case file name', function () {
    const code = `export class FooBar {}\n`;
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './FooBar.html';
export class FooBar {}
CustomElement.define(__au2ViewDef, FooBar);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects custom element definition with existing runtime import', function () {
    const code = `import { containerless } from '@aurelia/runtime-html';

const A = 0;
@containerless()
export class FooBar {}

function b() {}
`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import { containerless, CustomElement } from '@aurelia/runtime-html';

const A = 0;

export class FooBar {}
CustomElement.define({ ...__au2ViewDef, containerless: true }, FooBar);


function b() {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('does not inject custom element definition for decorated resource', function () {
    const code = `import { customElement } from '@aurelia/runtime-html';
import * as lorem from './lorem.html';

@customElement(lorem)
export class FooBar {}
`;
    const expected = `import { customElement } from '@aurelia/runtime-html';
import * as lorem from './lorem.html';

@customElement(lorem)
export class FooBar {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('supports customized name in custom element definition when there is html file pair', function () {
    const code = `import { customElement } from '@aurelia/runtime-html';

@customElement('lorem')
export class FooBar {}
`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import { customElement, CustomElement } from '@aurelia/runtime-html';


export class FooBar {}
CustomElement.define({ ...__au2ViewDef, name: 'lorem' }, FooBar);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('ignores customized name in custom element definition when there is no html file pair. This default behaviour is like @noView in Aurelia 1.', function () {
    const code = `import { customElement } from '@aurelia/runtime-html';

@customElement('lorem')
export class FooBar {}
`;
    const expected = `import { customElement } from '@aurelia/runtime-html';

@customElement('lorem')
export class FooBar {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects custom attribute definition', function () {
    const code = `export class FooBarCustomAttribute {}\n`;
    const expected = `import { CustomAttribute } from '@aurelia/runtime-html';
export class FooBarCustomAttribute {}
CustomAttribute.define('foo-bar', FooBarCustomAttribute);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects custom attribute definition for non-kebab case file name', function () {
    const code = `export class FooBarCustomAttribute {}\n`;
    const expected = `import { CustomAttribute } from '@aurelia/runtime-html';
export class FooBarCustomAttribute {}
CustomAttribute.define('foo-bar', FooBarCustomAttribute);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('skips existing custom attribute definition', function () {
    const code = `import { customAttribute } from 'aurelia';
@customAttribute('some-thing')
export class FooBar {}
`;
    const expected = `import { customAttribute } from 'aurelia';
@customAttribute('some-thing')
export class FooBar {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects template controller definition', function () {
    const code = `export class FooBarTemplateController {}\n`;
    const expected = `import { CustomAttribute } from '@aurelia/runtime-html';
export class FooBarTemplateController {}
CustomAttribute.define({ name: 'foo-bar', isTemplateController: true }, FooBarTemplateController);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects template controller definition for non-kebab case file name', function () {
    const code = `export class FooBarTemplateController {}\n`;
    const expected = `import { CustomAttribute } from '@aurelia/runtime-html';
export class FooBarTemplateController {}
CustomAttribute.define({ name: 'foo-bar', isTemplateController: true }, FooBarTemplateController);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('skips existing template controller definition', function () {
    const code = `import { templateController } from '@aurelia/runtime-html';
@templateController('some-thing')
export class FooBarCustomAttribute {}
`;
    const expected = `import { templateController } from '@aurelia/runtime-html';
@templateController('some-thing')
export class FooBarCustomAttribute {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects value converter definition', function () {
    const code = `export class FooBarValueConverter {}\n`;
    const expected = `import { ValueConverter } from '@aurelia/runtime-html';
export class FooBarValueConverter {}
ValueConverter.define('fooBar', FooBarValueConverter);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects value converter definition for non-kebab case file name', function () {
    const code = `export class FooBarValueConverter {}\n`;
    const expected = `import { ValueConverter } from '@aurelia/runtime-html';
export class FooBarValueConverter {}
ValueConverter.define('fooBar', FooBarValueConverter);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('skips existing value converter definition', function () {
    const code = `import { valueConverter } from '@aurelia/runtime-html';
@valueConverter('fooBar')
export class FooBar {}
`;
    const expected = `import { valueConverter } from '@aurelia/runtime-html';
@valueConverter('fooBar')
export class FooBar {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects binding behavior definition', function () {
    const code = `export class FooBarBindingBehavior {}\n`;
    const expected = `import { BindingBehavior } from '@aurelia/runtime-html';
export class FooBarBindingBehavior {}
BindingBehavior.define('fooBar', FooBarBindingBehavior);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects binding behavior definition for non-kebab case file name', function () {
    const code = `export class FooBarBindingBehavior {}\n`;
    const expected = `import { BindingBehavior } from '@aurelia/runtime-html';
export class FooBarBindingBehavior {}
BindingBehavior.define('fooBar', FooBarBindingBehavior);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('skips existing binding behavior definition', function () {
    const code = `import { bindingBehavior } from 'aurelia';
@bindingBehavior('fooBar')
export class FooBar {}
`;
    const expected = `import { bindingBehavior } from 'aurelia';
@bindingBehavior('fooBar')
export class FooBar {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects binding command definition', function () {
    const code = `export class FooBarBindingCommand {}\n`;
    const expected = `import { BindingCommand } from '@aurelia/runtime-html';
export class FooBarBindingCommand {}
BindingCommand.define('foo-bar', FooBarBindingCommand);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects binding command definition for non-kebab case file name', function () {
    const code = `export class FooBarBindingCommand {}\n`;
    const expected = `import { BindingCommand } from '@aurelia/runtime-html';
export class FooBarBindingCommand {}
BindingCommand.define('foo-bar', FooBarBindingCommand);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('skips existing binding command definition', function () {
    const code = `import { bindingCommand } from '@aurelia/runtime-html';
@bindingCommand('lorem')
export class FooBarBindingCommand {}
`;
    const expected = `import { bindingCommand } from '@aurelia/runtime-html';
@bindingCommand('lorem')
export class FooBarBindingCommand {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('merges CustomElement.define', function () {
    const code = `import { CustomElement } from '@aurelia/runtime-html'
export class FooBar {}
CustomElement.define({ name: 'lorem', bindables: ['value'] }, FooBar);
`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import { CustomElement } from '@aurelia/runtime-html';
export class FooBar {}
CustomElement.define({ ...__au2ViewDef, name: "lorem", bindables: ["value"] }, FooBar);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('merges $au - custom element', function () {
    const code = `
export class FooBar {
  static $au = { type: 'custom-element', name: 'foo-bar', bindables: ['x'] };
  x: string;
}
`;
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './foo-bar.html';

export class FooBar {
    static $au = { ...__au2ViewDef, type: "custom-element", name: "foo-bar", bindables: ["x"] };
    x: string;
}

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  // #region containerless
  for (const isCall of [true, false]) {
    const deco = `@containerless${isCall ? '()' : ''}`;

    it(`rewrites ${deco} to CustomElement.define`, function () {
      const code = `import { containerless } from '@aurelia/runtime-html'
${deco}
export class FooBar {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { containerless, CustomElement } from '@aurelia/runtime-html';

export class FooBar {}
CustomElement.define({ ...__au2ViewDef, containerless: true }, FooBar);

`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

    it(`rewrites ${deco} to CustomElement.define - with @customElement`, function () {
      const code = `import { containerless, customElement } from '@aurelia/runtime-html'
${deco}
@customElement('foo-bar')
export class FooBar {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { containerless, customElement, CustomElement } from '@aurelia/runtime-html';


export class FooBar {}
CustomElement.define({ ...__au2ViewDef, name: 'foo-bar', containerless: true }, FooBar);

`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

    it(`rewrites ${deco} to CustomElement.define - with local deps`, function () {
      const code = `import { containerless } from '@aurelia/runtime-html'
${deco}
export class FooBar {}

export class BarCustomAttribute {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { containerless, CustomElement, CustomAttribute } from '@aurelia/runtime-html';


export class BarCustomAttribute {}
CustomAttribute.define('bar', BarCustomAttribute);



export class FooBar {}
CustomElement.define({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, BarCustomAttribute ], containerless: true }, FooBar);
`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

    it(`rewrites ${deco} to CustomElement.define - with local deps - with @customElement`, function () {
      const code = `import { containerless , customElement } from '@aurelia/runtime-html'
${deco}
@customElement('foo-bar')
export class FooBar {}

export class BarCustomAttribute {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { containerless, customElement, CustomElement, CustomAttribute } from '@aurelia/runtime-html';


export class BarCustomAttribute {}
CustomAttribute.define('bar', BarCustomAttribute);



export class FooBar {}
CustomElement.define({ ...__au2ViewDef, name: 'foo-bar', dependencies: [ ...__au2ViewDef.dependencies, BarCustomAttribute ], containerless: true }, FooBar);
`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });
  }
  // #endregion

  // #region useShadowDOM
  for (const isCall of [true, false]) {
    const deco1 = `@useShadowDOM${isCall ? '()' : ''}`;

    it(`rewrites ${deco1} to CustomElement.define`, function () {
      const code = `import { useShadowDOM } from '@aurelia/runtime-html'
${deco1}
export class FooBar {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { useShadowDOM, CustomElement } from '@aurelia/runtime-html';

export class FooBar {}
CustomElement.define({ ...__au2ViewDef, shadowOptions: { mode: 'open' } }, FooBar);

`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

    it(`rewrites ${deco1} to CustomElement.define - with @customElement`, function () {
      const code = `import { useShadowDOM, customElement } from '@aurelia/runtime-html'
${deco1}
@customElement('foo-bar')
export class FooBar {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { useShadowDOM, customElement, CustomElement } from '@aurelia/runtime-html';


export class FooBar {}
CustomElement.define({ ...__au2ViewDef, name: 'foo-bar', shadowOptions: { mode: 'open' } }, FooBar);

`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

    it(`rewrites ${deco1} to CustomElement.define - with local deps`, function () {
      const code = `import { useShadowDOM } from '@aurelia/runtime-html'
${deco1}
export class FooBar {}

export class BarCustomAttribute {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { useShadowDOM, CustomElement, CustomAttribute } from '@aurelia/runtime-html';


export class BarCustomAttribute {}
CustomAttribute.define('bar', BarCustomAttribute);



export class FooBar {}
CustomElement.define({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, BarCustomAttribute ], shadowOptions: { mode: 'open' } }, FooBar);
`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

    it(`rewrites ${deco1} to CustomElement.define - with local deps - with @customElement`, function () {
      const code = `import { useShadowDOM, customElement } from '@aurelia/runtime-html'
${deco1}
@customElement('foo-bar')
export class FooBar {}

export class BarCustomAttribute {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { useShadowDOM, customElement, CustomElement, CustomAttribute } from '@aurelia/runtime-html';


export class BarCustomAttribute {}
CustomAttribute.define('bar', BarCustomAttribute);



export class FooBar {}
CustomElement.define({ ...__au2ViewDef, name: 'foo-bar', dependencies: [ ...__au2ViewDef.dependencies, BarCustomAttribute ], shadowOptions: { mode: 'open' } }, FooBar);
`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

    if (!isCall) continue;
    for (const options of ['{ mode: \'open\' }', '{ mode: \'closed\' }', 'options']) {
      const deco2 = `@useShadowDOM(${options})`;

      it(`rewrites ${deco2} to CustomElement.define`, function () {
        const code = `import { useShadowDOM } from '@aurelia/runtime-html'
${deco2}
export class FooBar {}
`;
        const expected = `import * as __au2ViewDef from './foo-bar.html';
import { useShadowDOM, CustomElement } from '@aurelia/runtime-html';

export class FooBar {}
CustomElement.define({ ...__au2ViewDef, shadowOptions: ${options} }, FooBar);

`;
        const result = preprocessResource(
          {
            path: path.join('bar', 'foo-bar.js'),
            contents: code,
            filePair: 'foo-bar.html'
          },
          preprocessOptions({ hmr: false })
        );
        assert.equal(result.code, expected);
      });

      it(`rewrites ${deco2} to CustomElement.define - with @customElement`, function () {
        const code = `import { useShadowDOM, customElement } from '@aurelia/runtime-html'
${deco2}
@customElement('foo-bar')
export class FooBar {}
`;
        const expected = `import * as __au2ViewDef from './foo-bar.html';
import { useShadowDOM, customElement, CustomElement } from '@aurelia/runtime-html';


export class FooBar {}
CustomElement.define({ ...__au2ViewDef, name: 'foo-bar', shadowOptions: ${options} }, FooBar);

`;
        const result = preprocessResource(
          {
            path: path.join('bar', 'foo-bar.js'),
            contents: code,
            filePair: 'foo-bar.html'
          },
          preprocessOptions({ hmr: false })
        );
        assert.equal(result.code, expected);
      });

      it(`rewrites ${deco2} to CustomElement.define - with local deps`, function () {
        const code = `import { useShadowDOM } from '@aurelia/runtime-html'
${deco2}
export class FooBar {}

export class BarCustomAttribute {}
`;
        const expected = `import * as __au2ViewDef from './foo-bar.html';
import { useShadowDOM, CustomElement, CustomAttribute } from '@aurelia/runtime-html';


export class BarCustomAttribute {}
CustomAttribute.define('bar', BarCustomAttribute);



export class FooBar {}
CustomElement.define({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, BarCustomAttribute ], shadowOptions: ${options} }, FooBar);
`;
        const result = preprocessResource(
          {
            path: path.join('bar', 'foo-bar.js'),
            contents: code,
            filePair: 'foo-bar.html'
          },
          preprocessOptions({ hmr: false })
        );
        assert.equal(result.code, expected);
      });

      it(`rewrites ${deco2} to CustomElement.define - with local deps - with @customElement`, function () {
        const code = `import { useShadowDOM, customElement } from '@aurelia/runtime-html'
${deco2}
@customElement('foo-bar')
export class FooBar {}

export class BarCustomAttribute {}
`;
        const expected = `import * as __au2ViewDef from './foo-bar.html';
import { useShadowDOM, customElement, CustomElement, CustomAttribute } from '@aurelia/runtime-html';


export class BarCustomAttribute {}
CustomAttribute.define('bar', BarCustomAttribute);



export class FooBar {}
CustomElement.define({ ...__au2ViewDef, name: 'foo-bar', dependencies: [ ...__au2ViewDef.dependencies, BarCustomAttribute ], shadowOptions: ${options} }, FooBar);
`;
        const result = preprocessResource(
          {
            path: path.join('bar', 'foo-bar.js'),
            contents: code,
            filePair: 'foo-bar.html'
          },
          preprocessOptions({ hmr: false })
        );
        assert.equal(result.code, expected);
      });
    }
  }
  // #endregion

  // #region capture
  for (const [deco, options] of [['@capture()', 'true'], ['@capture(() => true)', '() => true'], ['@capture(filter)', 'filter']]) {
    it(`rewrites ${deco} to CustomElement.define`, function () {
      const code = `import { capture } from '@aurelia/runtime-html'
${deco}
export class FooBar {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { capture, CustomElement } from '@aurelia/runtime-html';

export class FooBar {}
CustomElement.define({ ...__au2ViewDef, capture: ${options} }, FooBar);

`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

    it(`rewrites ${deco} to CustomElement.define - with @customElement`, function () {
      const code = `import { capture, customElement } from '@aurelia/runtime-html'
${deco}
@customElement('foo-bar')
export class FooBar {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { capture, customElement, CustomElement } from '@aurelia/runtime-html';


export class FooBar {}
CustomElement.define({ ...__au2ViewDef, name: 'foo-bar', capture: ${options} }, FooBar);

`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

    it(`rewrites ${deco} to CustomElement.define - with local deps`, function () {
      const code = `import { capture } from '@aurelia/runtime-html'
${deco}
export class FooBar {}

export class BarCustomAttribute {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { capture, CustomElement, CustomAttribute } from '@aurelia/runtime-html';


export class BarCustomAttribute {}
CustomAttribute.define('bar', BarCustomAttribute);



export class FooBar {}
CustomElement.define({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, BarCustomAttribute ], capture: ${options} }, FooBar);
`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

    it(`rewrites ${deco} to CustomElement.define - with local deps - with @customElement`, function () {
      const code = `import { capture, customElement } from '@aurelia/runtime-html'
${deco}
@customElement('foo-bar')
export class FooBar {}

export class BarCustomAttribute {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { capture, customElement, CustomElement, CustomAttribute } from '@aurelia/runtime-html';


export class BarCustomAttribute {}
CustomAttribute.define('bar', BarCustomAttribute);



export class FooBar {}
CustomElement.define({ ...__au2ViewDef, name: 'foo-bar', dependencies: [ ...__au2ViewDef.dependencies, BarCustomAttribute ], capture: ${options} }, FooBar);
`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

  }
  // #endregion

  // #region alias
  for (const [decoratorOptions, definitionOptions] of [
    [`...['alias1']`, `['alias1']`],
    [`'alias1'`, `['alias1']`],
    [`...['alias1', 'alias2']`, `['alias1', 'alias2']`],
    [`'alias1', 'alias2'`, `['alias1', 'alias2']`],
  ]) {
    const deco = `@alias(${decoratorOptions})`;

    it(`rewrites ${deco} to CustomElement.define`, function () {
      const code = `import { alias } from '@aurelia/runtime-html'
${deco}
export class FooBar {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { alias, CustomElement } from '@aurelia/runtime-html';

export class FooBar {}
CustomElement.define({ ...__au2ViewDef, aliases: ${definitionOptions} }, FooBar);

`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

    it(`rewrites ${deco} to CustomElement.define - with @customElement`, function () {
      const code = `import { alias, customElement } from '@aurelia/runtime-html'
${deco}
@customElement('foo-bar')
export class FooBar {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { alias, customElement, CustomElement } from '@aurelia/runtime-html';


export class FooBar {}
CustomElement.define({ ...__au2ViewDef, name: 'foo-bar', aliases: ${definitionOptions} }, FooBar);

`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

    it(`rewrites ${deco} to CustomElement.define - with local deps`, function () {
      const code = `import { alias } from '@aurelia/runtime-html'
${deco}
export class FooBar {}

export class BarCustomAttribute {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { alias, CustomElement, CustomAttribute } from '@aurelia/runtime-html';


export class BarCustomAttribute {}
CustomAttribute.define('bar', BarCustomAttribute);



export class FooBar {}
CustomElement.define({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, BarCustomAttribute ], aliases: ${definitionOptions} }, FooBar);
`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

    it(`rewrites ${deco} to CustomElement.define - with local deps - with @customElement`, function () {
      const code = `import { alias, customElement } from '@aurelia/runtime-html'
${deco}
@customElement('foo-bar')
export class FooBar {}

export class BarCustomAttribute {}
`;
      const expected = `import * as __au2ViewDef from './foo-bar.html';
import { alias, customElement, CustomElement, CustomAttribute } from '@aurelia/runtime-html';


export class BarCustomAttribute {}
CustomAttribute.define('bar', BarCustomAttribute);



export class FooBar {}
CustomElement.define({ ...__au2ViewDef, name: 'foo-bar', dependencies: [ ...__au2ViewDef.dependencies, BarCustomAttribute ], aliases: ${definitionOptions} }, FooBar);
`;
      const result = preprocessResource(
        {
          path: path.join('bar', 'foo-bar.js'),
          contents: code,
          filePair: 'foo-bar.html'
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });

  }
  // #endregion

  // #region bindables
  it(`rewrites bindables`, function () {
    const code = `import { bindable } from '@aurelia/runtime-html'
@bindable('b')
@bindable('c')
export class FooBar {
  @bindable x;
  @bindable() y;
  @bindable({ attribute: 'z-z', mode: 'fromView', primary: true, set(v) { return Boolean(v); } }) z;
  @bindable(opts) a;
}
`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import { bindable, CustomElement } from '@aurelia/runtime-html';


export class FooBar {
   x;
   y;
   z;
   a;
}
CustomElement.define({ ...__au2ViewDef, bindables: [ ...__au2ViewDef.bindables, 'b', 'c', 'x', 'y', { name: 'z', ...{ attribute: 'z-z', mode: 'fromView', primary: true, set(v) { return Boolean(v); } } }, { name: 'a', ...opts } ] }, FooBar);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it(`rewrites bindables - with @customElement after @bindable`, function () {
    const code = `import { bindable } from '@aurelia/runtime-html'
@bindable('b')
@bindable('c')
@customElement('foo-bar')
export class FooBar {
  @bindable x;
  @bindable() y;
  @bindable({ attribute: 'z-z', mode: 'fromView', primary: true, set(v) { return Boolean(v); } }) z;
  @bindable(opts) a;
}
`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import { bindable, CustomElement } from '@aurelia/runtime-html';



export class FooBar {
   x;
   y;
   z;
   a;
}
CustomElement.define({ ...__au2ViewDef, name: 'foo-bar', bindables: [ ...__au2ViewDef.bindables, 'b', 'c', 'x', 'y', { name: 'z', ...{ attribute: 'z-z', mode: 'fromView', primary: true, set(v) { return Boolean(v); } } }, { name: 'a', ...opts } ] }, FooBar);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });
  it(`rewrites bindables - with @customElement before @bindable`, function () {
    const code = `import { bindable } from '@aurelia/runtime-html'
@customElement('foo-bar')
@bindable('b')
@bindable('c')
export class FooBar {
  @bindable x;
  @bindable() y;
  @bindable({ attribute: 'z-z', mode: 'fromView', primary: true, set(v) { return Boolean(v); } }) z;
  @bindable(opts) a;
}
`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import { bindable, CustomElement } from '@aurelia/runtime-html';



export class FooBar {
   x;
   y;
   z;
   a;
}
CustomElement.define({ ...__au2ViewDef, name: 'foo-bar', bindables: [ ...__au2ViewDef.bindables, 'b', 'c', 'x', 'y', { name: 'z', ...{ attribute: 'z-z', mode: 'fromView', primary: true, set(v) { return Boolean(v); } } }, { name: 'a', ...opts } ] }, FooBar);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it(`rewrites bindables - with local deps`, function () {
    const code = `import { bindable } from '@aurelia/runtime-html'
@bindable('b')
@bindable('c')
export class FooBar {}

export class BarCustomAttribute {}
`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import { bindable, CustomElement, CustomAttribute } from '@aurelia/runtime-html';



export class BarCustomAttribute {}
CustomAttribute.define('bar', BarCustomAttribute);



export class FooBar {}
CustomElement.define({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, BarCustomAttribute ], bindables: [ ...__au2ViewDef.bindables, 'b', 'c' ] }, FooBar);
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it(`rewrites bindables - with local deps - with @customElement`, function () {
    const code = `import { bindable } from '@aurelia/runtime-html'
@bindable('b')
@bindable('c')
@customElement('foo-bar')
export class FooBar {}

export class BarCustomAttribute {}
`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import { bindable, CustomElement, CustomAttribute } from '@aurelia/runtime-html';



export class BarCustomAttribute {}
CustomAttribute.define('bar', BarCustomAttribute);



export class FooBar {}
CustomElement.define({ ...__au2ViewDef, name: 'foo-bar', dependencies: [ ...__au2ViewDef.dependencies, BarCustomAttribute ], bindables: [ ...__au2ViewDef.bindables, 'b', 'c' ] }, FooBar);
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it(`does not support field-level @bindables with local deps`, function () {
    const code = `import { bindable } from '@aurelia/runtime-html'
@bindable('b')
@bindable('c')
export class FooBar {
  @bindable x;
}

export class BarCustomAttribute {}
`;
    assert.throws(() => preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    ), /@bindable decorators on fields.+not supported.+local dependencies.*BarCustomAttribute/);
  });

  it(`rewrites bindables - custom attribute`, function () {
    const code = `import { bindable } from '@aurelia/runtime-html'
@bindable('b')
@bindable('c')
export class FooBarCustomAttribute {
  @bindable x;
  @bindable() y;
  @bindable({ attribute: 'z-z', mode: 'fromView', primary: true, set(v) { return Boolean(v); } }) z;
  @bindable(opts) a;
}
`;
    const expected = `import { bindable, CustomAttribute } from '@aurelia/runtime-html';


export class FooBarCustomAttribute {
   x;
   y;
   z;
   a;
}
CustomAttribute.define({ name: 'foo-bar', bindables: [ 'b', 'c', 'x', 'y', { name: 'z', ...{ attribute: 'z-z', mode: 'fromView', primary: true, set(v) { return Boolean(v); } } }, { name: 'a', ...opts } ] }, FooBarCustomAttribute);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it(`rewrites bindables - template controller`, function () {
    const code = `import { bindable } from '@aurelia/runtime-html'
@bindable('b')
@bindable('c')
export class FooBarTemplateController {
  @bindable x;
  @bindable() y;
  @bindable({ attribute: 'z-z', mode: 'fromView', primary: true, set(v) { return Boolean(v); } }) z;
  @bindable(opts) a;
}
`;
    const expected = `import { bindable, CustomAttribute } from '@aurelia/runtime-html';


export class FooBarTemplateController {
   x;
   y;
   z;
   a;
}
CustomAttribute.define({ name: 'foo-bar', isTemplateController: true, bindables: [ 'b', 'c', 'x', 'y', { name: 'z', ...{ attribute: 'z-z', mode: 'fromView', primary: true, set(v) { return Boolean(v); } } }, { name: 'a', ...opts } ] }, FooBarTemplateController);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });
  // #endregion

  // #region inject
  it(`rewrites @inject - custom element`, function () {
    const code = `import { inject } from '@aurelia/kernel';
@inject(A, B)
export class FooBar {}
`;
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './foo-bar.html';
import { inject } from '@aurelia/kernel';

export class FooBar {}
CustomElement.define(__au2ViewDef, FooBar);
Reflect.defineProperty(FooBar, 'inject', { value: [A, B], writable: true, configurable: true, enumerable: true });
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it(`rewrites @inject - custom attribute`, function () {
    const code = `import { inject } from '@aurelia/kernel';
@inject(A, B)
export class FooCustomAttribute {}
`;
    const expected = `import { CustomAttribute } from '@aurelia/runtime-html';
import { inject } from '@aurelia/kernel';

export class FooCustomAttribute {}
CustomAttribute.define('foo', FooCustomAttribute);

Reflect.defineProperty(FooCustomAttribute, 'inject', { value: [A, B], writable: true, configurable: true, enumerable: true });
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it(`rewrites @inject - template controller`, function () {
    const code = `import { inject } from '@aurelia/kernel';
@inject(A, B)
export class FooTemplateController {}
`;
    const expected = `import { CustomAttribute } from '@aurelia/runtime-html';
import { inject } from '@aurelia/kernel';

export class FooTemplateController {}
CustomAttribute.define({ name: 'foo', isTemplateController: true }, FooTemplateController);

Reflect.defineProperty(FooTemplateController, 'inject', { value: [A, B], writable: true, configurable: true, enumerable: true });
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it(`rewrites @inject - value converter`, function () {
    const code = `import { inject } from '@aurelia/kernel';
@inject(A, B)
export class FooValueConverter {}
`;
    const expected = `import { ValueConverter } from '@aurelia/runtime-html';
import { inject } from '@aurelia/kernel';

export class FooValueConverter {}
ValueConverter.define('foo', FooValueConverter);

Reflect.defineProperty(FooValueConverter, 'inject', { value: [A, B], writable: true, configurable: true, enumerable: true });
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it(`rewrites @inject - binding behavior`, function () {
    const code = `import { inject } from '@aurelia/kernel';
@inject(A, B)
export class FooBindingBehavior {}
`;
    const expected = `import { BindingBehavior } from '@aurelia/runtime-html';
import { inject } from '@aurelia/kernel';

export class FooBindingBehavior {}
BindingBehavior.define('foo', FooBindingBehavior);

Reflect.defineProperty(FooBindingBehavior, 'inject', { value: [A, B], writable: true, configurable: true, enumerable: true });
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it(`rewrites @inject - binding command`, function () {
    const code = `import { inject } from '@aurelia/kernel';
@inject(A, B)
export class FooBindingCommand {}
`;
    const expected = `import { BindingCommand } from '@aurelia/runtime-html';
import { inject } from '@aurelia/kernel';

export class FooBindingCommand {}
BindingCommand.define('foo', FooBindingCommand);

Reflect.defineProperty(FooBindingCommand, 'inject', { value: [A, B], writable: true, configurable: true, enumerable: true });
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it(`rewrites @inject - general class`, function () {
    const code = `import { inject } from '@aurelia/kernel';
@inject(A, B)
export class Foo {}

@inject(C, D)
export class Bar {}
`;
    const expected = `import { inject } from '@aurelia/kernel';

export class Foo {}
Reflect.defineProperty(Foo, 'inject', { value: [A, B], writable: true, configurable: true, enumerable: true });


export class Bar {}
Reflect.defineProperty(Bar, 'inject', { value: [C, D], writable: true, configurable: true, enumerable: true });
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });
  // #endregion
});

describe('preprocessResource for complex resource', function () {

  it('injects various decorators when there is no implicit custom element', function () {
    const code = `import {Foo} from './foo.js';
import Aurelia, { valueConverter } from 'aurelia';

export class LeaveMeAlone {}

export class LoremCustomAttribute {

}

@valueConverter('one')
export class ForOne {
  toView(value) {
    return value;
  }
}

export class TheSecondValueConverter {
  toView(value) {
    return value;
  }
}

export class SomeBindingBehavior {

}

export class AbcBindingCommand {

}
`;
    const expected = `import { CustomAttribute, ValueConverter, BindingBehavior, BindingCommand } from '@aurelia/runtime-html';
import {Foo} from './foo.js';
import Aurelia, { valueConverter } from 'aurelia';

export class LeaveMeAlone {}

export class LoremCustomAttribute {

}
CustomAttribute.define('lorem', LoremCustomAttribute);


@valueConverter('one')
export class ForOne {
  toView(value) {
    return value;
  }
}

export class TheSecondValueConverter {
  toView(value) {
    return value;
  }
}
ValueConverter.define('theSecond', TheSecondValueConverter);


export class SomeBindingBehavior {

}
BindingBehavior.define('some', SomeBindingBehavior);


export class AbcBindingCommand {

}
BindingCommand.define('abc', AbcBindingCommand);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects various decorators when there is implicit custom element', function () {
    const code = `import {Foo} from './foo.js';
import { templateController, other } from '@aurelia/runtime-html';

export class LeaveMeAlone {}

export class FooBar {}

export class LoremCustomAttribute {

}

@templateController('one')
export class ForOne {
}

export class TheSecondValueConverter {
  toView(value: string): string {
    return value;
  }
}

export class SomeBindingBehavior {

}

export class AbcBindingCommand {

}
`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import {Foo} from './foo.js';
import { templateController, other, CustomElement, CustomAttribute, ValueConverter, BindingBehavior, BindingCommand } from '@aurelia/runtime-html';

export class LeaveMeAlone {}



export class LoremCustomAttribute {

}
CustomAttribute.define('lorem', LoremCustomAttribute);


@templateController('one')
export class ForOne {
}

export class TheSecondValueConverter {
  toView(value: string): string {
    return value;
  }
}
ValueConverter.define('theSecond', TheSecondValueConverter);


export class SomeBindingBehavior {

}
BindingBehavior.define('some', SomeBindingBehavior);


export class AbcBindingCommand {

}
BindingCommand.define('abc', AbcBindingCommand);


export class FooBar {}
CustomElement.define({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, LoremCustomAttribute, ForOne, TheSecondValueConverter, SomeBindingBehavior, AbcBindingCommand ] }, FooBar);
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.ts'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );

    assert.equal(result.code, expected);
  });

  it('injects various decorators when there is implicit custom element with customized name', function () {
    const code = `import {Foo} from './foo.js';
import { templateController, customElement, other } from '@aurelia/runtime-html';

export class LeaveMeAlone {}

@customElement('lorem')
export class FooBar {}

export class LoremCustomAttribute {

}

@templateController('one')
export class ForOne {
}

export class TheSecondValueConverter {
  toView(value: string): string {
    return value;
  }
}

export class SomeBindingBehavior {

}

export class AbcBindingCommand {

}
`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import {Foo} from './foo.js';
import { templateController, customElement, other, CustomElement, CustomAttribute, ValueConverter, BindingBehavior, BindingCommand } from '@aurelia/runtime-html';

export class LeaveMeAlone {}



export class LoremCustomAttribute {

}
CustomAttribute.define('lorem', LoremCustomAttribute);


@templateController('one')
export class ForOne {
}

export class TheSecondValueConverter {
  toView(value: string): string {
    return value;
  }
}
ValueConverter.define('theSecond', TheSecondValueConverter);


export class SomeBindingBehavior {

}
BindingBehavior.define('some', SomeBindingBehavior);


export class AbcBindingCommand {

}
BindingCommand.define('abc', AbcBindingCommand);



export class FooBar {}
CustomElement.define({ ...__au2ViewDef, name: 'lorem', dependencies: [ ...__au2ViewDef.dependencies, LoremCustomAttribute, ForOne, TheSecondValueConverter, SomeBindingBehavior, AbcBindingCommand ] }, FooBar);
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.ts'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('makes sure implicit custom element is after in-file dependencies', function () {
    const code = `export class FooBar {}

export class SomeValueConverter {
  toView(value: string): string {
    return value;
  }
}
`;
    const expected = `import { CustomElement, ValueConverter } from '@aurelia/runtime-html';
import * as __au2ViewDef from './foo-bar.html';


export class SomeValueConverter {
  toView(value: string): string {
    return value;
  }
}
ValueConverter.define('some', SomeValueConverter);


export class FooBar {}
CustomElement.define({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, SomeValueConverter ] }, FooBar);
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.ts'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects new definition after existing decorator', function () {
    const code = `import { something } from '@aurelia/runtime-html';
@something
export class FooBar {}

@something()
export class SomeValueConverter {
  toView(value: string): string {
    return value;
  }
}
`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import { something, CustomElement, ValueConverter } from '@aurelia/runtime-html';


@something()
export class SomeValueConverter {
  toView(value: string): string {
    return value;
  }
}
ValueConverter.define('some', SomeValueConverter);


@something
export class FooBar {}
CustomElement.define({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, SomeValueConverter ] }, FooBar);
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.ts'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects custom element definition with index file', function () {
    const code = `\nexport class FooBar {}\n`;
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './index.html';

export class FooBar {}
CustomElement.define(__au2ViewDef, FooBar);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar', 'index.js'),
        contents: code,
        filePair: 'index.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

  it('injects custom element definition for loosely equal class name with index file', function () {
    const code = `export class UAFooBarCustomElement {}\n`;
    const expected = `import { CustomElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './index.html';
export class UAFooBarCustomElement {}
CustomElement.define(__au2ViewDef, UAFooBarCustomElement);

`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'ua-foo-bar', 'index.js'),
        contents: code,
        filePair: 'index.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });
});
