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

  it('injects customElement decorator', function () {
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

  it('injects customElement decorator for loosely equal class name', function () {
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

  it('injects customElement decorator for non-kebab case file name', function () {
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

  it('injects customElement decorator with existing runtime import', function () {
    const code = `import { containerless } from '@aurelia/runtime-html';

const A = 0;
@containerless()
export class FooBar {}

function b() {}
`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import { containerless, CustomElement } from '@aurelia/runtime-html';

const A = 0;
@containerless()
export class FooBar {}
CustomElement.define(__au2ViewDef, FooBar);


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

  it('does not inject customElement decorator for decorated resource', function () {
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

  it('supports customized name in customElement decorator when there is html file pair', function () {
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

  it('ignores customized name in customElement decorator when there is no html file pair. This default behaviour is like @noView in Aurelia 1.', function () {
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

  it('injects customAttribute decorator', function () {
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

  it('injects customAttribute decorator for non-kebab case file name', function () {
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

  it('skips existing customAttribute decorator', function () {
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

  it('injects templateController decorator', function () {
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

  it('injects templateController decorator for non-kebab case file name', function () {
    const code = `export class FooBarTemplateController {}\n`;
    const expected =  `import { CustomAttribute } from '@aurelia/runtime-html';
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

  it('skips existing templateController decorator', function () {
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

  it('injects valueConverter decorator', function () {
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

  it('injects valueConverter decorator for non-kebab case file name', function () {
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

  it('skips existing valueConverter decorator', function () {
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

  it('injects bindingBehavior decorator', function () {
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

  it('injects bindingBehavior decorator for non-kebab case file name', function () {
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

  it('skips existing bindingBehavior decorator', function () {
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

  it('injects bindingCommand decorator', function () {
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

  it('injects bindingCommand decorator for non-kebab case file name', function () {
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

  it('skips existing bindingCommand decorator', function () {
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

  it('injects new decorator before existing decorator', function () {
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

  it('injects customElement decorator with index file', function () {
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

  it('injects customElement decorator for loosely equal class name with index file', function () {
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
