import { strict as $assert } from 'assert';
import { navigate, getElement, quit } from './util';

const $ = {
  viewport(name) {
    return `au-viewport[name="${name}"]`;
  },
  gotoAnchor(value) {
    return `a[goto="${value}"]`;
  },
};

async function click(selector) {
  const element = await getElement(selector);
  await element.click();
}

const assert = {
  async textContentEqual(selector, expected) {
    const element = await getElement(selector);
    const actual = await element.getText();
    $assert.equal(actual, expected, `Expected textContent of selector '${selector}' to be '${expected}', but got: '${actual}'`);
  },
};

describe(`my-app page`, function () {
  it(`loads`, async function () {
    await navigate.to('');
  });

  it(`can goto('a-1') -> goto('a-2') -> back() -> forward()`, async function () {
    await navigate.to(``);
    await assert.textContentEqual($.viewport('main'), '');

    await click($.gotoAnchor('a-1'));
    await assert.textContentEqual($.viewport('main'), 'a-1');

    await click($.gotoAnchor('a-2'));
    await assert.textContentEqual($.viewport('main'), 'a-2');

    await navigate.back();
    await assert.textContentEqual($.viewport('main'), 'a-1');

    await navigate.forward();
    await assert.textContentEqual($.viewport('main'), 'a-2');
  });

  after(async function () {
    await quit();
  });
});
