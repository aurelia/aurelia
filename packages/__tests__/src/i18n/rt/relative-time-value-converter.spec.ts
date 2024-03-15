import { I18N, RelativeTimeValueConverter } from '@aurelia/i18n';
import { assert } from '@aurelia/testing';
import { createI18NContainer } from '../util.js';

describe('i18n/rt/relative-time-value-converter.spec.ts', function () {
  function createFixture() {
    const container = createI18NContainer();
    const i18n = container.get(I18N);
    const sut = container.invoke(RelativeTimeValueConverter);
    return { i18n, sut };
  }

  for (const value of [undefined, null, 'chaos', 123, true]) {
    it(`returns the value itself if the value is not a Date, for example: ${value}`, function () {
      const { sut } = createFixture();
      assert.equal(sut.toView(value), value);
    });
  }

  it('formats number by default as per current locale and default formatting options', function () {
    const { sut } = createFixture();
    const date = new Date();
    date.setHours(date.getHours() - 2);
    assert.equal(sut.toView(date), '2 hours ago');
  });

  it('formats a given number as per given and locale', function () {
    const { sut } = createFixture();
    const date = new Date();
    date.setHours(date.getHours() - 2);
    assert.equal(sut.toView(date, undefined, 'de'), 'vor 2 Stunden');
  });

  it('formats a given number as per given formatting options and locale', function () {
    const { sut } = createFixture();
    const date = new Date();
    date.setHours(date.getHours() - 2);
    assert.equal(sut.toView(date, { style: 'short' }, 'de'), 'vor 2 Std.');
  });
});
