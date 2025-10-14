import { BrowserPlatform } from '@aurelia/platform-browser';
import { setPlatform, onFixtureCreated, type IFixture } from '@aurelia/testing';
import { beforeAll, afterEach } from 'vitest';

// Sets up the Aurelia environment for testing
function bootstrapTextEnv() {
  const platform = new BrowserPlatform(window);
  setPlatform(platform);
  BrowserPlatform.set(globalThis, platform);
}

const fixtures: IFixture<object>[] = [];
beforeAll(() => {
  bootstrapTextEnv();
  onFixtureCreated(fixture => {
    fixtures.push(fixture);
  });
});

afterEach(() => {
  fixtures.forEach(async f => {
    try {
      await f.stop(true);
    } catch {
      // ignore
    }
  });
  fixtures.length = 0;
});
