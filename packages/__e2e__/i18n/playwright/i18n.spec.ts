import { test, expect, Page } from '@playwright/test';
import de from '../public/locales/de/translation.json';
import en from '../public/locales/en/translation.json';

interface Spec {
  name: string;
  suts: { selector: string; expected?: string; expectedDe?: string }[];
  isHtmlContent?: boolean;
}

test.describe('i18n', () => {
  test.describe.configure({
    mode: 'parallel'
  });

  test.beforeEach(async ({ page, baseURL }) => {
    test.setTimeout(15000);
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
  });

  const assertContent = async (page: Page, selector: string, expected: string | undefined, isHtmlContent: boolean | undefined = false) => {
    if (isHtmlContent) {
      expect(await page.innerHTML(selector, { strict: true })).toContain(expected);
    } else {
      await expect(page.locator(selector)).toContainText(expected!);
    }
  };

  const changeCurrentLocaleToDe = async (page: Page) => {
    await page.click('#locale-changer-de');
    await new Promise(r => setTimeout(r, 16));
  }

  const dispatchedOn = new Date(2020, 1, 10, 5, 15).toString(), deliveredOn = new Date(2021, 1, 10, 5, 15).toString(),
    enDeliveredText = en.status_delivered.replace('{{date}}', deliveredOn),
    deDeliveredText = de.status_delivered.replace('{{date}}', deliveredOn);

  const enSpecificTests: Spec[] = [
    {
      name: 'should work for attribute translation',
      suts: [{ selector: `#i18n-attr[title="${en.simple.attr}"]`, expected: 'attribute test' }]
    },
    {
      name: 'should work for semicolon delimited multiple attributes',
      suts: [{ selector: `#i18n-multiple-attr[title="${en.simple.attr}"]`, expected: en.simple.text }]
    },
    {
      name: 'should work when same key is used for multiple attributes',
      suts: [{ selector: `#i18n-multiple-attr-same-key[title="${en.simple.attr}"][data-foo="${en.simple.attr}"]`, expected: en.simple.text }]
    },
  ];
  const deSpecificTests: Spec[] = [
    {
      name: 'should work for attribute translation',
      suts: [{ selector: `#i18n-attr[title="${de.simple.attr}"]`, expectedDe: 'attribute test' }]
    },
    {
      name: 'should work for semicolon delimited multiple attributes',
      suts: [{ selector: `#i18n-multiple-attr[title="${de.simple.attr}"]`, expectedDe: de.simple.text }]
    },
    {
      name: 'should work when same key is used for multiple attributes',
      suts: [{ selector: `#i18n-multiple-attr-same-key[title="${de.simple.attr}"][data-foo="${de.simple.attr}"]`, expectedDe: de.simple.text }]
    },
  ];
  const specs: Spec[] = [
    {
      name: 'should work for alias',
      suts: [{ selector: `#i18n-alias`, expected: en.simple.text, expectedDe: de.simple.text }]
    },
    {
      name: 'should work for simple text-content',
      suts: [{ selector: `#i18n-simple`, expected: en.simple.text, expectedDe: de.simple.text }]
    },
    {
      name: 'should work when key is bound from vm property',
      suts: [{ selector: `#i18n-vm-bound`, expected: en.simple.text, expectedDe: de.simple.text }]
    },
    {
      name: 'should work for nested translations',
      suts: [{ selector: `#i18n-nested`, expected: `${en.simple.text} ${en.simple.attr}`, expectedDe: `${de.simple.text} ${de.simple.attr}` }]
    },
    {
      name: 'should work interpolated key',
      suts: [{ selector: `#i18n-interpolated-key-expr`, expected: en.simple.text, expectedDe: de.simple.text }]
    },
    {
      name: 'should work for interpolation',
      suts: [
        { selector: `#i18n-interpolation`, expected: enDeliveredText, expectedDe: deDeliveredText },
        { selector: `#i18n-interpolation-custom`, expected: enDeliveredText, expectedDe: deDeliveredText },
        { selector: `#i18n-interpolation-es6`, expected: enDeliveredText, expectedDe: deDeliveredText },
      ]
    },
    {
      name: 'should work for context specific translation',
      suts: [
        { selector: `#i18n-ctx`, expected: en.status, expectedDe: de.status },
        {
          selector: `#i18n-ctx-dispatched`,
          expected: en.status_dispatched.replace('{{date}}', dispatchedOn),
          expectedDe: de.status_dispatched.replace('{{date}}', dispatchedOn),
        },
        { selector: `#i18n-ctx-delivered`, expected: enDeliveredText, expectedDe: deDeliveredText, },
      ]
    },
    {
      name: 'should work for pluralization',
      suts: [
        {
          selector: `#i18n-items-plural-0`,
          expected: en.itemWithCount_plural.replace('{{count}}', '0'),
          expectedDe: de.itemWithCount_plural.replace('{{count}}', '0')
        },
        {
          selector: `#i18n-items-plural-1`,
          expected: en.itemWithCount.replace('{{count}}', '1'),
          expectedDe: de.itemWithCount.replace('{{count}}', '1'),
        },
        {
          selector: `#i18n-items-plural-10`,
          expected: en.itemWithCount_plural.replace('{{count}}', '10'),
          expectedDe: de.itemWithCount_plural.replace('{{count}}', '10'),
        },
      ]
    },
    {
      name: 'should work for interval processing and nesting',
      suts: [
        { selector: `#i18n-interval-0`, expected: '0 items', expectedDe: '0 Artikel' },
        { selector: `#i18n-interval-1`, expected: '1 item', expectedDe: '1 Artikel' },
        { selector: `#i18n-interval-2`, expected: '2 items', expectedDe: '2 Artikel' },
        { selector: `#i18n-interval-3`, expected: '3 items', expectedDe: '3 Artikel' },
        { selector: `#i18n-interval-6`, expected: '6 items', expectedDe: '6 Artikel' },
        { selector: `#i18n-interval-7`, expected: 'a lot of items', expectedDe: 'viele Artikel' },
        { selector: `#i18n-interval-10`, expected: 'a lot of items', expectedDe: 'viele Artikel' },
      ]
    },
    {
      name: 'should work with html content', isHtmlContent: true,
      suts: [{ selector: `#i18n-html`, expected: en.html, expectedDe: de.html }]
    },
    {
      name: 'should work with prepend and append',
      suts: [{
        selector: `#i18n-prepend-append`,
        expected: `${en.pretest}Blue${en['post-test']}`,
        expectedDe: `${de.pretest}Blue${de['post-test']}`
      }]
    },
    {
      name: 'should work with "t" value converter',
      suts: [{ selector: `#i18n-t-vc`, expected: ' 10 items ', expectedDe: ' 10 Artikel ' }]
    },
    {
      name: 'should work with "t" binding behavior',
      suts: [{ selector: `#i18n-t-bb`, expected: ' 100 items ', expectedDe: ' 100 Artikel ' },]
    },
    {
      name: 'should work with "df" value converter',
      suts: [{ selector: `#i18n-df-vc`, expected: ' 2/10/2020 ', expectedDe: ' 10.2.2020 ' }]
    },
    {
      name: 'should work with "df" value converter for ISO date string',
      suts: [{ selector: `#i18n-df-vc-iso`, expected: ' 8/10/2019 ', expectedDe: ' 10.8.2019 ' }]
    },
    {
      name: 'should work with "df" value converter for integer',
      suts: [{ selector: `#i18n-df-vc-int`, expected: ' 1/1/1970 ', expectedDe: ' 1.1.1970 ' }]
    },
    {
      name: 'should work with "df" value converter for integer string',
      suts: [{ selector: `#i18n-df-vc-int-str`, expected: ' 1/1/1970 ', expectedDe: ' 1.1.1970 ' }]
    },
    {
      name: 'should work with "df" binding behavior',
      suts: [{ selector: `#i18n-df-bb`, expected: ' 10.2.2020 ', expectedDe: ' 10.2.2020 ' },]
    },
    {
      name: 'should work with "nf" value converter',
      suts: [{ selector: `#i18n-nf-vc`, expected: ' 123,456,789.12 ', expectedDe: ' 123.456.789,12 ' }]
    },
    {
      name: 'should work with "nf" binding behavior',
      suts: [{ selector: `#i18n-nf-bb`, expected: ' 123.456.789,12 ', expectedDe: ' 123.456.789,12 ' }]
    },
    {
      name: 'should work with "nf" value converter for currency',
      suts: [{ selector: `#i18n-nf-vc-cur`, expected: ' 123.456.789,12\u{00a0}€ ', expectedDe: ' 123.456.789,12\u{00a0}€ ' }]
    },
    {
      name: 'should work with "nf" binding behavior for currency',
      suts: [{ selector: `#i18n-nf-bb-cur`, expected: ' $123,456,789.12 ', expectedDe: ' 123.456.789,12\u{00a0}$ ' }]
    },
    {
      name: 'should work with "rt" value converter',
      suts: [{ selector: `#i18n-rt-vc`, expected: ' 2 hours ago ', expectedDe: ' vor 2 Stunden ' }]
    },
    {
      name: 'should work with "rt" binding behavior',
      suts: [{ selector: `#i18n-rt-bb`, expected: ' 2 hours ago ', expectedDe: ' vor 2 Stunden ' },]
    },
  ];

  test.describe('translates via HTML that', () => {
    for (const { name, suts, isHtmlContent } of [...enSpecificTests, ...specs]) {
      test(name, async ({ page }) => {
        for (const sut of suts) {
          await assertContent(page, sut.selector, sut.expected, isHtmlContent);
        }
      });
    }
    test('reacts to \'aurelia-relativetime-signal\' signal for relative time binding behavior', async ({ page }) => {
      await page.click('#rt-changer')
      await assertContent(page, '#i18n-rt-vc', ' 1 year ago ');
      await assertContent(page, '#i18n-rt-bb', ' 1 year ago ');
    });
  });

  test.describe('facilitates translation via code', () => {
    const tests = [
      {
        name: 'simple',
        suts: [{ selector: '#i18n-code-simple', expected: 'simple text' }]
      },
      {
        name: 'context-based',
        suts: [{ selector: '#i18n-code-context', expected: `dispatched on ${dispatchedOn}` }]
      },
      {
        name: 'plural',
        suts: [{ selector: '#i18n-code-plural', expected: '10 items' }]
      },
      {
        name: 'interval',
        suts: [{ selector: '#i18n-code-interval', expected: 'a lot of items' }]
      },
      {
        name: 'nf',
        suts: [{ selector: '#i18n-code-num', expected: '123,456,789' }]
      },
      ...['simple', 'locale', 'currency', 'text', 'minus'].map((part) => (
        {
          name: `uf - ${part}`,
          suts: [{ selector: `#i18n-code-num-uf-${part}`, expected: part === 'minus' ? '-123456789.12' : '123456789.12' }]
        })),
      {
        name: 'df',
        suts: [{ selector: '#i18n-code-date', expected: '2/10/2021' }]
      },
      {
        name: 'relative time',
        suts: [{ selector: '#i18n-code-rtime', expected: '2 hours ago' }]
      },
    ];
    for (const { name, suts } of tests) {
      test(name, async ({ page }) => {
        for (const sut of suts) {
          await assertContent(page, sut.selector, sut.expected);
        }
      });
    }
  });

  test('sets the src attribute of img elements by default', async ({ page }) => {
    await expect(page.locator('#i18n-img')).toHaveAttribute('src', en.imgPath);
  });

  test.describe('changes translation when', () => {

    test('key changes', async ({ page }) => {
      await page.click('#key-changer');
      await assertContent(page, '#i18n-vm-bound', en.simple.attr);
      await assertContent(page, '#i18n-interpolated-key-expr', en.simple.attr);
    });

    test('parameter changes', async ({ page }) => {
      await page.click('#params-changer');
      await assertContent(page, '#i18n-ctx-bound-vm-params', `dispatched on ${deliveredOn}`);
    });
  });

  test.describe('updates translation on locale change that', () => {

    test.beforeEach(async ({ page }) => {
      await changeCurrentLocaleToDe(page);
    });

    for (const { name, suts, isHtmlContent } of [...deSpecificTests, ...specs]) {
      test(name, async ({ page }) => {
        for (const sut of suts) {
          await assertContent(page, sut.selector, sut.expectedDe as string, isHtmlContent);
        }
      });
    }
  });

  test.describe('with custom elements', () => {
    test('can pass interpolated translations to custom elements bindables', async ({ page }) => {
      await assertContent(page, '[data-test-id=\'custom-element-interpolated\'] div', en.simple.text);
    });

    test('can bind to custom elements attributes', async ({ page }) => {
      await assertContent(page, '[data-test-id=\'custom-element-target-bindable\'] div', en.simple.text);
    });

    test('should support params', async ({ page }) => {
      await assertContent(page, '[data-test-id=\'custom-element-with-params\'] div', en.itemWithCount_plural.replace('{{count}}', '0'));
    });

    test('should support locale changes', async ({ page }) => {
      await changeCurrentLocaleToDe(page);
      await assertContent(page, '[data-test-id=\'custom-element-target-bindable\'] div', de.simple.text);
    });
  });

  test.describe('treating missing keys', () => {
    test('should by default replace the content with the missing key name', async ({ page }) => {
      await assertContent(page, '[data-test-id=\'missing-key\']', 'missing-key');
    });

    test('should allow to keep original content if key not found', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}?skipkey=true`!, { waitUntil: 'domcontentloaded' });
      await page.reload();

      await assertContent(page, '[data-test-id=\'missing-key\']', 'non-translated text');

      await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
      await page.reload();
    });
  });

  test('works with Backend', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}?fetchResource=true`!, { waitUntil: 'domcontentloaded' });

    await assertContent(page, `#i18n-simple`, en.simple.text);
    await changeCurrentLocaleToDe(page);

    await assertContent(page, `#i18n-simple`, de.simple.text);
    await page.goto(baseURL!);
  });
});
