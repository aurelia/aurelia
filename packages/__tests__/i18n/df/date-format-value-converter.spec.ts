import { DateFormatValueConverter, I18nService } from '@aurelia/i18n';
import { EventAggregator } from '@aurelia/kernel';
import { assert, MockSignaler } from '@aurelia/testing';
import i18next from 'i18next';

describe('df', function () {

  function setup() {
    const i18n = new I18nService({ i18next }, {}, new EventAggregator(), new MockSignaler());
    const sut = new DateFormatValueConverter(i18n);
    return { i18n, sut };
  }

  for (const value of [undefined, null, '', '   ', 'test']) {
    it(`returns the value itself if the value is falsy for date - '${value}'`, function () {
      const { sut } = setup();
      assert.equal(sut.toView(value), value);
    });
  }

  it('should display only the date in the active locale format by default', function () {
    const { sut } = setup();
    assert.equal(sut.toView(new Date(2000, 0, 17, 0, 0, 1)), '1/17/2000');
  });

  it('should display date in the previously modified locale', async function () {
    const { sut, i18n } = setup();
    await i18n.setLocale('de');
    assert.equal(sut.toView(new Date(2000, 0, 17, 0, 0, 1)), '17.1.2000');
  });

  it('respects given locale', function () {
    const { sut } = setup();
    assert.equal(sut.toView(new Date(2000, 0, 17, 0, 0, 1), undefined, 'de'), '17.1.2000');
  });

  it('displays date time when appropriate options are provided', function () {
    const options = {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    };
    const { sut } = setup();
    assert.equal(sut.toView(new Date(2000, 0, 17, 0, 0, 1), options), '01/17/2000, 00:00:01');
  });

  it('can handle datetime as ISO 8601 string', function () {
    const { sut } = setup();
    assert.equal(sut.toView('2019-08-10T13:42:35.209Z'), '8/10/2019');
  });

  it('should interpret input `0` as `new Date(0)`', function () {
    const { sut } = setup();
    assert.equal(sut.toView(0), new Date(0).toLocaleDateString());
  });

  it('should interpret input `"0"` as `new Date(0)`', function () {
    const { sut } = setup();
    assert.equal(sut.toView('0'), new Date(0).toLocaleDateString());
  });
});
