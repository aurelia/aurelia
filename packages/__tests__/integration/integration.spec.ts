import { assert, fail } from '@aurelia/testing';
import { startup, TestExecutionContext } from './app/startup';

describe.only('app', function () {

  function getText(el: Element) {
    return el && el.textContent.replace(/\s\s+/g, ' ').trim();
  }

  async function executeTest(testFunction: (ctx: TestExecutionContext) => Promise<void> | void) {
    const ctx = await startup();
    try {
      await testFunction(ctx);
    } catch (e) {
      fail(e);
    } finally {
      await ctx.tearDown();
    }
  }

  it('has some readonly texts', async function () {
    await executeTest(({ host }) => {
      const actual = Array.from(host.querySelectorAll('read-only-text')).map(getText);
      const expected = new Array(actual.length).fill(0).map((_, i) => `text${i}`);

      assert.deepStrictEqual(actual, expected);
    });
  });

  it('changes in bound VM properties are correctly reflected in the read-only-texts', async function () {
    await executeTest(async ({ host, ctx }) => {
      (host.querySelector('button#staticTextChanger') as unknown as HTMLButtonElement).click();
      await ctx.lifecycle.nextFrame;

      const actual = Array.from(host.querySelectorAll('read-only-text')).map(getText);
      const expected = ['text0', 'text1', 'newText2', 'newText3'];

      assert.deepStrictEqual(actual, expected);
    });
  });
});
