import { describe, it } from 'vitest';
import { MyApp } from '../src/my-app';
import { createFixture } from '@aurelia/testing';

describe('my-app', () => {
  it('should render message', async () => {
    const { assertText } = await createFixture(
      '<my-app></my-app>',
      {},
      [MyApp],
    ).started;

    assertText('Hello World!', { compact: true });
  });

});
