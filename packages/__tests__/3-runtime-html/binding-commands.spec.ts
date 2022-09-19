import { IExpressionParser } from '@aurelia/runtime';
import {
  alias,
  CommandType,
  BindingCommandInstance,
  bindingCommand,
  OneTimeBindingCommand,
  PropertyBindingInstruction,
  ICommandBuildInfo,
  IAttrMapper,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('binding-commands', function () {

  const app = class {
    public value = 'wOOt';
  };

  describe('01. Aliases', function () {

    @bindingCommand({ name: 'woot1', aliases: ['woot13'] })
    @alias(...['woot11', 'woot12'])
    class WootCommand implements BindingCommandInstance {
      public readonly type: CommandType.None = CommandType.None;
      public name = 'woot1';

      public static inject = [OneTimeBindingCommand];
      public constructor(private readonly oneTimeCmd: OneTimeBindingCommand) {}

      public build(info: ICommandBuildInfo, parser: IExpressionParser, mapper: IAttrMapper): PropertyBindingInstruction {
        return this.oneTimeCmd.build(info, parser, mapper);
      }
    }

    @bindingCommand({ name: 'woot2', aliases: ['woot23'] })
    @alias('woot21', 'woot22')
    class WootCommand2 implements BindingCommandInstance {
      public readonly type: CommandType.None = CommandType.None;
      public name = 'woot2';

      public static inject = [OneTimeBindingCommand];
      public constructor(private readonly oneTimeCmd: OneTimeBindingCommand) {}

      public build(info: ICommandBuildInfo, parser: IExpressionParser, mapper: IAttrMapper): PropertyBindingInstruction {
        return this.oneTimeCmd.build(info, parser, mapper);
      }
    }

    const resources: any[] = [WootCommand, WootCommand2];

    it('Simple spread Alias doesn\'t break def alias works on binding command', async function () {
      const options = createFixture('<template> <a href.woot1="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
      await options.tearDown();
    });

    it('Simple spread Alias (1st position) works on binding command', async function () {
      const options = createFixture('<template> <a href.woot11="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
      await options.tearDown();
    });

    it('Simple spread Alias (2nd position) works on binding command', async function () {
      const options = createFixture('<template> <a href.woot12="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
      await options.tearDown();
    });

    it('Simple spread Alias doesn\'t break original binding command', async function () {
      const options = createFixture('<template> <a href.woot13="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias doesn\'t break def alias works on binding command', async function () {
      const options = createFixture('<template> <a href.woot23="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias (1st position) works on binding command', async function () {
      const options = createFixture('<template> <a href.woot21="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias (2nd position) works on binding command', async function () {
      const options = createFixture('<template> <a href.woot22="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
      await options.tearDown();
    });

    it('Simple Alias doesn\'t break original binding command', async function () {
      const options = createFixture('<template> <a href.woot2="value"></a> </template>', app, resources);
      assert.strictEqual(options.appHost.firstElementChild.getAttribute('href'), 'wOOt');
      await options.tearDown();
    });

  });

});
