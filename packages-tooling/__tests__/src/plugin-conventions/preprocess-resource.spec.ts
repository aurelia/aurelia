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
    const expected = `import { customElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './foo-bar.html';

@customElement(__au2ViewDef)
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

  it('injects custom element definition for loosely equal class name', function () {
    const code = `export class UAFooBarCustomElement {}\n`;
    const expected = `import { customElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './ua-foo-bar.html';
@customElement(__au2ViewDef)
export class UAFooBarCustomElement {}
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
    const expected = `import { customElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './FooBar.html';
@customElement(__au2ViewDef)
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

  it('injects custom element definition with existing runtime import', function () {
    const code = `import { containerless } from '@aurelia/runtime-html';

const A = 0;
@containerless()
export class FooBar {}

function b() {}
`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import { containerless, customElement } from '@aurelia/runtime-html';

const A = 0;
@customElement(__au2ViewDef)
@containerless()
export class FooBar {}

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
import { customElement } from '@aurelia/runtime-html';

@customElement({ ...__au2ViewDef, name: 'lorem' })
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
    const expected = `import { customAttribute } from '@aurelia/runtime-html';
@customAttribute('foo-bar')
export class FooBarCustomAttribute {}
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
    const expected = `import { customAttribute } from '@aurelia/runtime-html';
@customAttribute('foo-bar')
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
    const expected = `import { templateController } from '@aurelia/runtime-html';
@templateController('foo-bar')
export class FooBarTemplateController {}
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
    const expected = `import { templateController } from '@aurelia/runtime-html';
@templateController('foo-bar')
export class FooBarTemplateController {}
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
    const expected = `import { valueConverter } from '@aurelia/runtime-html';
@valueConverter('fooBar')
export class FooBarValueConverter {}
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
    const expected = `import { valueConverter } from '@aurelia/runtime-html';
@valueConverter('fooBar')
export class FooBarValueConverter {}
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
    const expected = `import { bindingBehavior } from '@aurelia/runtime-html';
@bindingBehavior('fooBar')
export class FooBarBindingBehavior {}
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
    const expected = `import { bindingBehavior } from '@aurelia/runtime-html';
@bindingBehavior('fooBar')
export class FooBarBindingBehavior {}
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
    const expected = `import { bindingCommand } from '@aurelia/runtime-html';
@bindingCommand('foo-bar')
export class FooBarBindingCommand {}
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
    const expected = `import { bindingCommand } from '@aurelia/runtime-html';
@bindingCommand('foo-bar')
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

  it('merges $au - custom element', function () {
    const code = `
export class FooBar {
  static $au = { type: 'custom-element', name: 'foo-bar', bindables: ['x'] };
  x: string;
}
`;
    // eslint-disable-next-line prefer-regex-literals
    const expected = new RegExp(`import { customElement } from '@aurelia/runtime-html';
import \\* as __au2ViewDef from './foo-bar.html';

export class FooBar {
    static \\$au = { ...__au2ViewDef, type: ["']custom-element["'], name: ["']foo-bar["'], bindables: \\[["']x["']\\] };
    x: string;
}

`);
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions({ hmr: false })
    );
    assert.match(result.code, expected);
  });

  for (const nvDeco of ['noView', 'noView()']) {
    it(nvDeco, function () {
      const code = `
import { noView } from '@aurelia/compat-v1';

@${nvDeco}
export class FooBar {
}
`;
      const expected = `import { customElement } from '@aurelia/runtime-html';

import { noView } from '@aurelia/compat-v1';

@customElement('foo-bar')
@${nvDeco}
export class FooBar {
}
`;
      const result = preprocessResource(
        {
          path: path.join('foo-bar.js'),
          contents: code,
        },
        preprocessOptions({ hmr: false })
      );
      assert.equal(result.code, expected);
    });
  }

  it('inlineView', function () {
    const code = `
import { inlineView } from '@aurelia/compat-v1';

@inlineView('fizz-buzz')
export class FooBar {
}
`;
    const expected = `import { customElement } from '@aurelia/runtime-html';

import { inlineView } from '@aurelia/compat-v1';

@customElement('foo-bar')
@inlineView('fizz-buzz')
export class FooBar {
}
`;
    const result = preprocessResource(
      {
        path: path.join('foo-bar.js'),
        contents: code,
      },
      preprocessOptions({ hmr: false })
    );
    assert.equal(result.code, expected);
  });

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
    const expected = `import { customAttribute, bindingBehavior, bindingCommand } from '@aurelia/runtime-html';
import {Foo} from './foo.js';
import Aurelia, { valueConverter } from 'aurelia';

export class LeaveMeAlone {}

@customAttribute('lorem')
export class LoremCustomAttribute {

}

@valueConverter('one')
export class ForOne {
  toView(value) {
    return value;
  }
}

@valueConverter('theSecond')
export class TheSecondValueConverter {
  toView(value) {
    return value;
  }
}

@bindingBehavior('some')
export class SomeBindingBehavior {

}

@bindingCommand('abc')
export class AbcBindingCommand {

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
import { templateController, other, customElement, customAttribute, valueConverter, bindingBehavior, bindingCommand } from '@aurelia/runtime-html';

export class LeaveMeAlone {}



@customAttribute('lorem')
export class LoremCustomAttribute {

}

@templateController('one')
export class ForOne {
}

@valueConverter('theSecond')
export class TheSecondValueConverter {
  toView(value: string): string {
    return value;
  }
}

@bindingBehavior('some')
export class SomeBindingBehavior {

}

@bindingCommand('abc')
export class AbcBindingCommand {

}

@customElement({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, LoremCustomAttribute, ForOne, TheSecondValueConverter, SomeBindingBehavior, AbcBindingCommand ] })
export class FooBar {}`;
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
import { templateController, customElement, other, customAttribute, valueConverter, bindingBehavior, bindingCommand } from '@aurelia/runtime-html';

export class LeaveMeAlone {}



@customAttribute('lorem')
export class LoremCustomAttribute {

}

@templateController('one')
export class ForOne {
}

@valueConverter('theSecond')
export class TheSecondValueConverter {
  toView(value: string): string {
    return value;
  }
}

@bindingBehavior('some')
export class SomeBindingBehavior {

}

@bindingCommand('abc')
export class AbcBindingCommand {

}

@customElement({ ...__au2ViewDef, name: 'lorem', dependencies: [ ...__au2ViewDef.dependencies, LoremCustomAttribute, ForOne, TheSecondValueConverter, SomeBindingBehavior, AbcBindingCommand ] })
export class FooBar {}`;
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
    const expected = `import { customElement, valueConverter } from '@aurelia/runtime-html';
import * as __au2ViewDef from './foo-bar.html';


@valueConverter('some')
export class SomeValueConverter {
  toView(value: string): string {
    return value;
  }
}

@customElement({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, SomeValueConverter ] })
export class FooBar {}`;
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
import { something, customElement, valueConverter } from '@aurelia/runtime-html';


@valueConverter('some')
@something()
export class SomeValueConverter {
  toView(value: string): string {
    return value;
  }
}

@customElement({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, SomeValueConverter ] })
@something
export class FooBar {}`;
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
    const expected = `import { customElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './index.html';

@customElement(__au2ViewDef)
export class FooBar {}
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
    const expected = `import { customElement } from '@aurelia/runtime-html';
import * as __au2ViewDef from './index.html';
@customElement(__au2ViewDef)
export class UAFooBarCustomElement {}
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
