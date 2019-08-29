import { preprocessResource, preprocessOptions } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';
import * as path from 'path';

describe('preprocessResource', function () {
  it('ignores file without html pair', function () {
    const code = `export class Foo {}\n`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo.js'),
        contents: code
      },
      preprocessOptions()
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
      preprocessOptions()
    );
    assert.equal(result.code, code);
  });

  it('injects customElement decorator', function () {
    const code = `export class FooBar {}\n`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import { customElement } from '@aurelia/runtime';
@customElement(__au2ViewDef)
export class FooBar {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions()
    );
    assert.equal(result.code, expected);
  });

  it('injects customElement decorator for non-kebab case file name', function () {
    const code = `export class FooBar {}\n`;
    const expected = `import * as __au2ViewDef from './FooBar.html';
import { customElement } from '@aurelia/runtime';
@customElement(__au2ViewDef)
export class FooBar {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions()
    );
    assert.equal(result.code, expected);
  });

  it('injects customElement decorator with existing runtime import', function () {
    const code = `import { containerless } from '@aurelia/runtime';

const A = 0;
@containerless()
export class FooBar {}

function b() {}
`;
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import { containerless, customElement } from '@aurelia/runtime';

const A = 0;
@containerless()
@customElement(__au2ViewDef)
export class FooBar {}

function b() {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions()
    );
    assert.equal(result.code, expected);
  });

  it('injects customAttribute decorator', function () {
    const code = `export class FooBarCustomAttribute {}\n`;
    const expected = `import { customAttribute } from '@aurelia/runtime';
@customAttribute('foo-bar')
export class FooBarCustomAttribute {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code
      },
      preprocessOptions()
    );
    assert.equal(result.code, expected);
  });

  it('injects customAttribute decorator for non-kebab case file name', function () {
    const code = `export class FooBarCustomAttribute {}\n`;
    const expected = `import { customAttribute } from '@aurelia/runtime';
@customAttribute('foo-bar')
export class FooBarCustomAttribute {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions()
    );
    assert.equal(result.code, expected);
  });

  it('injects valueConverter decorator', function () {
    const code = `export class FooBarValueConverter {}\n`;
    const expected = `import { valueConverter } from '@aurelia/runtime';
@valueConverter('fooBar')
export class FooBarValueConverter {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code
      },
      preprocessOptions()
    );
    assert.equal(result.code, expected);
  });

  it('injects valueConverter decorator for non-kebab case file name', function () {
    const code = `export class FooBarValueConverter {}\n`;
    const expected = `import { valueConverter } from '@aurelia/runtime';
@valueConverter('fooBar')
export class FooBarValueConverter {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions()
    );
    assert.equal(result.code, expected);
  });

  it('injects bindingBehavior decorator', function () {
    const code = `export class FooBarBindingBehavior {}\n`;
    const expected = `import { bindingBehavior } from '@aurelia/runtime';
@bindingBehavior('fooBar')
export class FooBarBindingBehavior {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code
      },
      preprocessOptions()
    );
    assert.equal(result.code, expected);
  });

  it('injects bindingBehavior decorator for non-kebab case file name', function () {
    const code = `export class FooBarBindingBehavior {}\n`;
    const expected = `import { bindingBehavior } from '@aurelia/runtime';
@bindingBehavior('fooBar')
export class FooBarBindingBehavior {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions()
    );
    assert.equal(result.code, expected);
  });

  it('injects bindingCommand decorator', function () {
    const code = `export class FooBarBindingCommand {}\n`;
    const expected = `import { bindingCommand } from '@aurelia/jit';
@bindingCommand('foo-bar')
export class FooBarBindingCommand {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.js'),
        contents: code
      },
      preprocessOptions()
    );
    assert.equal(result.code, expected);
  });

  it('injects bindingCommand decorator for non-kebab case file name', function () {
    const code = `export class FooBarBindingCommand {}\n`;
    const expected = `import { bindingCommand } from '@aurelia/jit';
@bindingCommand('foo-bar')
export class FooBarBindingCommand {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'FooBar.js'),
        contents: code,
        filePair: 'FooBar.html'
      },
      preprocessOptions()
    );
    assert.equal(result.code, expected);
  });
});

describe('preprocessResource for complex resource', function () {

  it('injects various decorators when there is no implicit custom element', function () {
    const code = `import {Foo} from './foo';
import { valueConverter } from '@aurelia/runtime';

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
    const expected = `import { bindingCommand } from '@aurelia/jit';
import {Foo} from './foo';
import { valueConverter, customAttribute, bindingBehavior } from '@aurelia/runtime';

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
      preprocessOptions()
    );
    assert.equal(result.code, expected);
  });

  it('injects various decorators when there is implicit custom element', function () {
    const code = `import {Foo} from './foo';
import { valueConverter } from '@aurelia/runtime';
import { other } from '@aurelia/jit';

export class LeaveMeAlone {}

export class FooBar {}

export class LoremCustomAttribute {

}

@valueConverter('one')
export class ForOne {
  toView(value: number): string {
    return '' + value;
  }
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
import {Foo} from './foo';
import { valueConverter, customElement, customAttribute, bindingBehavior } from '@aurelia/runtime';
import { other, bindingCommand } from '@aurelia/jit';

export class LeaveMeAlone {}



@customAttribute('lorem')
export class LoremCustomAttribute {

}

@valueConverter('one')
export class ForOne {
  toView(value: number): string {
    return '' + value;
  }
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
export class FooBar {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.ts'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions()
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
    const expected = `import * as __au2ViewDef from './foo-bar.html';
import { customElement, valueConverter } from '@aurelia/runtime';


@valueConverter('some')
export class SomeValueConverter {
  toView(value: string): string {
    return value;
  }
}

@customElement({ ...__au2ViewDef, dependencies: [ ...__au2ViewDef.dependencies, SomeValueConverter ] })
export class FooBar {}
`;
    const result = preprocessResource(
      {
        path: path.join('bar', 'foo-bar.ts'),
        contents: code,
        filePair: 'foo-bar.html'
      },
      preprocessOptions()
    );
    assert.equal(result.code, expected);
  });
});
