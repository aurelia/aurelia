import { DateFormatValueConverter, I18N } from '@aurelia/i18n';
import { assert } from '@aurelia/testing';
import { createI18NContainer } from '../util.js';

describe('i18n/df/date-format-value-converter.spec.ts', function () {

  async function createFixture() {
    const container = createI18NContainer();
    const i18n = container.get(I18N);
    const sut = container.invoke(DateFormatValueConverter);
    await i18n.setLocale('en');
    return { i18n, sut };
  }

  for (const value of [undefined, null, '', '   ', 'test']) {
    it(`returns the value itself if the value is falsy for date - '${value}'`, async function () {
      const { sut } = await createFixture();
      assert.equal(sut.toView(value), value);
    });
  }

  it('should display only the date in the active locale format by default', async function () {
    const { sut } = await createFixture();
    assert.equal(sut.toView(new Date(2000, 0, 17, 0, 0, 1)), '1/17/2000');
  });

  it('should display date in the previously modified locale', async function () {
    const { sut, i18n } = await createFixture();
    await i18n.setLocale('de');
    assert.equal(sut.toView(new Date(2000, 0, 17, 0, 0, 1)), '17.1.2000');
  });

  it('respects given locale', async function () {
    const { sut } = await createFixture();
    assert.equal(sut.toView(new Date(2000, 0, 17, 0, 0, 1), undefined, 'de'), '17.1.2000');
  });

  it('displays date time when appropriate options are provided', async function () {
    const options = {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    } as const;
    const { sut } = await createFixture();
    assert.equal(sut.toView(new Date(2000, 0, 17, 17, 0, 1), options), '01/17/2000, 17:00:01');
  });

  it('can handle datetime as ISO 8601 string', async function () {
    const { sut } = await createFixture();
    assert.equal(sut.toView('2019-08-10T13:42:35.209Z'), '8/10/2019');
  });

  it('should interpret input `0` as `new Date(0)`', async function () {
    const { sut } = await createFixture();
    assert.equal(sut.toView(0), new Date(0).toLocaleDateString('en'));
  });

  it('should interpret input `"0"` as `new Date(0)`', async function () {
    const { sut } = await createFixture();
    assert.equal(sut.toView('0'), new Date(0).toLocaleDateString('en'));
  });
});
