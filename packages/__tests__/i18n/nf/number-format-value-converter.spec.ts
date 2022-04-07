import { I18nService, NumberFormatValueConverter } from '@aurelia/i18n';
import { EventAggregator } from '@aurelia/kernel';
import { assert, MockSignaler } from '@aurelia/testing';
import i18next from 'i18next';

describe('nf', function () {
  function createFixture() {
    const i18n = new I18nService({ i18next }, {}, new EventAggregator(), new MockSignaler());
    const sut = new NumberFormatValueConverter(i18n);
    return { i18n, sut };
  }

  for (const value of [undefined, null, 'chaos', new Date(), true]) {
    it(`returns the value itself if the value is not a number, for example: ${value}`, function () {
      const { sut } = createFixture();
      assert.equal(sut.toView(value), value);
    });
  }

  it('formats number by default as per current locale and default formatting options', function () {
    const { sut } = createFixture();
    assert.equal(sut.toView(123456789.12), '123,456,789.12');
  });

  it('formats a given number as per given formatting options', function () {
    const { sut } = createFixture();
    assert.equal(sut.toView(123456789.12, { style: 'currency', currency: 'EUR' }), '€123,456,789.12');
  });

  it('formats a given number as per given locale', function () {
    const { sut } = createFixture();
    assert.equal(sut.toView(123456789.12, undefined, 'de'), '123.456.789,12');
  });

  it('formats a given number as per given locale and formating options', function () {
    const { sut } = createFixture();
    assert.equal(sut.toView(123456789.12, { style: 'currency', currency: 'EUR' }, 'de'), '123.456.789,12\u00A0€');
  });
});
