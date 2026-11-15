import { resolve } from '@aurelia/kernel';
import { IExpressionParser } from '@aurelia/expression-parser';
import { tasksSettled } from '@aurelia/runtime';
import { DeferConfiguration } from '@aurelia/runtime-html';
import {
  BindingCommand,
  OneTimeBindingCommand,
  type IAttrMapper,
  type ICommandBuildInfo,
  type IInstruction,
} from '@aurelia/template-compiler';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/defer-compiler-review.spec.ts', function () {
  for (const beforeDefer of [true, false]) {
    for (const lazyCommand of [false, true]) {
      it(`defers a ${lazyCommand ? 'loaded' : 'registered'} host binding command written ${beforeDefer ? 'before' : 'after'} defer`, async function () {
        let builds = 0;
        const ReviewCommand = BindingCommand.define('review-once', class {
          public readonly ignoreAttr = false;
          private readonly command = resolve(OneTimeBindingCommand);
          public build(info: ICommandBuildInfo, parser: IExpressionParser, mapper: IAttrMapper): IInstruction {
            ++builds;
            return this.command.build(info, parser, mapper);
          }
        });
        const defer = `defer="when.bind: show${lazyCommand ? '; load.bind: load' : ''}"`;
        const binding = 'title.review-once="message"';
        const fixture = createFixture(
          `<div data-content ${beforeDefer ? `${binding} ${defer}` : `${defer} ${binding}`}>content</div>`,
          { show: false, message: 'loaded content', load: () => ReviewCommand },
          lazyCommand ? [DeferConfiguration] : [DeferConfiguration, ReviewCommand],
        );

        // A host's ordinary bindings belong to the raw deferred content just
        // like bindings on its children. Their authored order should not make
        // a command run early or require its module before the block loads.
        assert.strictEqual(fixture.queryBy('[data-content]'), null);
        assert.strictEqual(builds, 0, 'the deferred host has not been compiled');

        fixture.component.show = true;
        await new Promise<void>(resolve => setTimeout(resolve, 0));
        await tasksSettled();
        assert.strictEqual(builds, 1, 'the command builds once when content is compiled');
        assert.strictEqual(fixture.getBy('[data-content]')!.title, 'loaded content');
      });
    }
  }
});
