import { I18nService, RelativeTimeValueConverter } from '@aurelia/i18n';
import { EventAggregator } from '@aurelia/kernel';
import { assert, MockSignaler } from '@aurelia/testing';
import i18next from 'i18next';

describe('rt', function () {
  function setup() {
    const i18n = new I18nService({ i18next }, {}, new EventAggregator(), new MockSignaler());
    const sut = new RelativeTimeValueConverter(i18n);
    return { i18n, sut };
  }

  for (const value of [undefined, null, 'chaos', 123, true]) {
    it(`returns the value itself if the value is not a Date, for example: ${value}`, function () {
      const { sut } = setup();
      assert.equal(sut.toView(value), value);
    });
  }

  it('formats number by default as per current locale and default formatting options', function () {
    const { sut } = setup();
    const date = new Date();
    date.setHours(date.getHours() - 2);
    assert.equal(sut.toView(date), '2 hours ago');
  });

  it('formats a given number as per given and locale', function () {
    const { sut } = setup();
    const date = new Date();
    date.setHours(date.getHours() - 2);
    assert.equal(sut.toView(date, undefined, 'de'), 'vor 2 Stunden');
  });

  it('formats a given number as per given formatting options and locale', function () {
    const { sut } = setup();
    const date = new Date();
    date.setHours(date.getHours() - 2);
    assert.equal(sut.toView(date, { style: 'short' }, 'de'), 'vor 2 Std.');
  });
});
