import { DI, IContainer } from '@aurelia/kernel';
import { IExpressionParser } from '@aurelia/expression-parser';
import {
  alias,
  BindingCommandInstance,
  bindingCommand,
  OneTimeBindingCommand,
  PropertyBindingInstruction,
  ICommandBuildInfo,
  IAttrMapper,
  BindingCommand,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/binding-commands.spec.ts', function () {
  describe('registration & resolution', function () {
    let container: IContainer;

    beforeEach(function () {
      container = DI.createContainer();
    });

    @bindingCommand('foo')
    class FooBindingCommand { }

    it('resolves to the same instance when impl was retrieved before registration', function () {
      const i1 = container.get(FooBindingCommand);
      container.register(FooBindingCommand);
      const i2 = container.get(BindingCommand.keyFrom('foo'));
      const i3 = BindingCommand.get(container, 'foo');
      assert.strictEqual(i1, i2);
      assert.strictEqual(i1, i3);
      const [_, i4] = container.getAll(FooBindingCommand);
      assert.strictEqual(i4, undefined);
    });

    it('resolves to the same instance when impl was retrieved after registration', function () {
      container.register(FooBindingCommand);
      const i1 = container.get(FooBindingCommand);
      const i2 = container.get(BindingCommand.keyFrom('foo'));
      const i3 = BindingCommand.get(container, 'foo');
      assert.strictEqual(i1, i2);
      assert.strictEqual(i1, i3);
      const [_, i4] = container.getAll(FooBindingCommand);
      assert.strictEqual(i4, undefined);
    });

    it('does not retrieve the intermediate container value converter registration', function () {
      const child1 = container.createChild();
      const child2 = child1.createChild();
      let id = 0;

      @bindingCommand('foo1')
      class Foo1 {
        id = ++id;
      }

      child1.register(Foo1);
      container.register(Foo1);

      BindingCommand.get(child2, 'foo1');
      assert.strictEqual(id, 1, `should create value converter only once`);

      BindingCommand.get(child1, 'foo1');
      assert.strictEqual(id, 2, `should create another value converter in the middle layer container`);
    });
  });

  describe('aliases', function () {
    const app = class {
      public value = 'wOOt';
    };

    @bindingCommand({ name: 'woot1', aliases: ['woot13'] })
    @alias(...['woot11', 'woot12'])
    class WootCommand implements BindingCommandInstance {
      public readonly ignoreAttr = false;
      public name = 'woot1';

      public static inject = [OneTimeBindingCommand];
      public constructor(private readonly oneTimeCmd: OneTimeBindingCommand) { }

      public build(info: ICommandBuildInfo, parser: IExpressionParser, mapper: IAttrMapper): PropertyBindingInstruction {
        return this.oneTimeCmd.build(info, parser, mapper);
      }
    }

    @bindingCommand({ name: 'woot2', aliases: ['woot23'] })
    @alias('woot21', 'woot22')
    class WootCommand2 implements BindingCommandInstance {
      public readonly ignoreAttr = false;
      public name = 'woot2';

      public static inject = [OneTimeBindingCommand];
      public constructor(private readonly oneTimeCmd: OneTimeBindingCommand) { }

      public build(info: ICommandBuildInfo, parser: IExpressionParser, mapper: IAttrMapper): PropertyBindingInstruction {
        return this.oneTimeCmd.build(info, parser, mapper);
      }
    }

    const resources: any[] = [WootCommand, WootCommand2];

    it('Simple spread Alias doesn\'t break def alias works on binding command', function () {
      const options = createFixture('<template> <a href.woot1="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
    });

    it('Simple spread Alias (1st position) works on binding command', function () {
      const options = createFixture('<template> <a href.woot11="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
    });

    it('Simple spread Alias (2nd position) works on binding command', function () {
      const options = createFixture('<template> <a href.woot12="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
    });

    it('Simple spread Alias doesn\'t break original binding command', function () {
      const options = createFixture('<template> <a href.woot13="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
    });

    it('Simple Alias doesn\'t break def alias works on binding command', function () {
      const options = createFixture('<template> <a href.woot23="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
    });

    it('Simple Alias (1st position) works on binding command', function () {
      const options = createFixture('<template> <a href.woot21="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
    });

    it('Simple Alias (2nd position) works on binding command', function () {
      const options = createFixture('<template> <a href.woot22="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
    });

    it('Simple Alias doesn\'t break original binding command', function () {
      const options = createFixture('<template> <a href.woot2="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
    });

  });

});
