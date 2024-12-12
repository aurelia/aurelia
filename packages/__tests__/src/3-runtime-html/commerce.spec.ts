import { createCommerceFixture } from './commerce';

describe('3-runtime-html/commerce.spec.ts', function () {
  it('works', async function () {
    const { start, stop, appShell } = createCommerceFixture();

    await start();

    await stop();
  });
});
