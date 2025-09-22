import { assert } from '@aurelia/testing';

describe('error-system.spec.ts', function () {
  let originalDevFlag: boolean;

  beforeEach(function () {
    originalDevFlag = (globalThis as any)['__DEV__'];
  });

  afterEach(function () {
    (globalThis as any)['__DEV__'] = originalDevFlag;
  });

  describe('Error message format validation', function () {
    for (const code of ['AUR0001', 'AUR0151', 'AUR4000', 'AUR5000']) {
      it(`should follow AUR error code format for ${code}`, function () {
        assert.match(code, /^AUR\d{4}$/, `Error code should match format: ${code}`);
      });
    }

    for (const { input, expected } of [
      { input: 1, expected: 'AUR0001' },
      { input: 23, expected: 'AUR0023' },
      { input: 151, expected: 'AUR0151' },
      { input: 4000, expected: 'AUR4000' },
      { input: 5000, expected: 'AUR5000' },
    ]) {
      it(`should pad error code ${input} to ${expected}`, function () {
        const paddedCode = `AUR${String(input).padStart(4, '0')}`;
        assert.strictEqual(paddedCode, expected);
      });
    }
  });

  describe('Documentation link patterns', function () {
    const linkPatterns = [
      { range: '0001-to-0023', url: 'https://docs.aurelia.io/developer-guides/error-messages/0001-to-0023/aur0001' },
      { range: '0151-to-0179', url: 'https://docs.aurelia.io/developer-guides/error-messages/0151-to-0179/aur0151' },
      { range: '0203-to-0227', url: 'https://docs.aurelia.io/developer-guides/error-messages/0203-to-0227/aur0203' },
      { range: '4000-to-4002', url: 'https://docs.aurelia.io/developer-guides/error-messages/4000-to-4002/aur4000' },
      { range: '4100-to-4106', url: 'https://docs.aurelia.io/developer-guides/error-messages/4100-to-4106/aur4100' },
      { range: '4200-to-4206', url: 'https://docs.aurelia.io/developer-guides/error-messages/4200-to-4206/aur4200' },
      { range: '5000-to-5008', url: 'https://docs.aurelia.io/developer-guides/error-messages/5000-to-5008/aur5000' },
    ];

    for (const { url } of linkPatterns) {
      it(`should validate URL structure for ${url}`, function () {
        const baseUrl = 'https://docs.aurelia.io/developer-guides/error-messages/';
        assert.includes(url, baseUrl, `URL should contain base: ${url}`);
        assert.match(url, /\/\d+-to-\d+\/aur\d{4}$/, `URL should end with range/code: ${url}`);
      });
    }

    for (const { range, url } of linkPatterns) {
      it(`should validate range consistency for ${range}`, function () {
        assert.includes(url, range, `URL should contain range ${range}: ${url}`);
      });
    }
  });

  describe('Message interpolation patterns', function () {
    function mockGetMessageByCode(template: string, ...details: unknown[]): string {
      let result = template;
      for (let i = 0; i < details.length; ++i) {
        const regex = new RegExp(`{{${i}(:.*)?}}`, 'g');
        let matches = regex.exec(result);
        while (matches != null) {
          const method = matches[1]?.slice(1);
          let value = details[i] as any;
          if (value != null) {
            switch (method) {
              case 'element':
                value = value === '*' ? 'all elements' : `<${value} />`;
                break;
              default: {
                if (method?.startsWith('.')) {
                  value = String(value[method.slice(1)]);
                } else {
                  value = String(value);
                }
              }
            }
          }
          result = result.slice(0, matches.index) + value + result.slice(regex.lastIndex);
          matches = regex.exec(result);
        }
      }
      return result;
    }

    it('should substitute basic parameters', function () {
      const template = 'Error with {{0}} and {{1}}';
      const result = mockGetMessageByCode(template, 'first', 'second');
      assert.strictEqual(result, 'Error with first and second');
    });

    it('should handle element formatting', function () {
      const template = 'Invalid {{0:element}} found';

      const resultDiv = mockGetMessageByCode(template, 'div');
      assert.strictEqual(resultDiv, 'Invalid <div /> found');

      const resultWildcard = mockGetMessageByCode(template, '*');
      assert.strictEqual(resultWildcard, 'Invalid all elements found');
    });

    it('should handle property access', function () {
      const template = 'Service {{0:.name}} has error';
      const obj = { name: 'TestService', type: 'singleton' };
      const result = mockGetMessageByCode(template, obj);
      assert.strictEqual(result, 'Service TestService has error');
    });

    it('should handle null and undefined', function () {
      const template = 'Value is {{0}}';

      const resultNull = mockGetMessageByCode(template, null);
      assert.strictEqual(resultNull, 'Value is null');

      const resultUndefined = mockGetMessageByCode(template, undefined);
      assert.strictEqual(resultUndefined, 'Value is undefined');
    });

    it('should convert objects to strings', function () {
      const template = 'Object: {{0}}';
      const obj = { test: 'value' };
      const result = mockGetMessageByCode(template, obj);
      assert.strictEqual(result, 'Object: [object Object]');
    });

    it('should handle missing parameters gracefully', function () {
      const template = 'Error {{0}} with {{1}}';
      const result = mockGetMessageByCode(template, 'first');
      assert.strictEqual(result, 'Error first with {{1}}');
    });
  });

  describe('Production vs Development modes', function () {
    function mockCreateMappedError(code: number, isDev: boolean, ...details: unknown[]): string {
      const paddedCode = String(code).padStart(4, '0');

      if (isDev) {
        const message = 'Mock error message';
        const range = code < 100 ? '0001-to-0023' :
          code < 1000 ? '0151-to-0179' :
            code < 5000 ? '4000-to-4199' : '5000-to-5008';
        const link = `https://docs.aurelia.io/developer-guides/error-messages/${range}/aur${paddedCode}`;
        return `AUR${paddedCode}: ${message}\\n\\nFor more information, see: ${link}`;
      } else {
        return `AUR${paddedCode}:${details.map(String).join(',')}`;
      }
    }

    it('should format development errors with links', function () {
      const devError = mockCreateMappedError(1, true, 'ITestService');

      assert.includes(devError, 'AUR0001: Mock error message');
      assert.includes(devError, 'For more information, see:');
      assert.includes(devError, 'https://docs.aurelia.io/developer-guides/error-messages');
    });

    it('should format production errors minimally', function () {
      const prodError = mockCreateMappedError(1, false, 'ITestService', 'param2');

      assert.strictEqual(prodError, 'AUR0001:ITestService,param2');
      assert.notIncludes(prodError, 'For more information');
      assert.notIncludes(prodError, 'https://');
    });

    it('should handle empty parameters in production', function () {
      const prodError = mockCreateMappedError(1, false);
      assert.strictEqual(prodError, 'AUR0001:');
    });

    it('should handle null parameters in production', function () {
      const prodError = mockCreateMappedError(1, false, null, undefined);
      assert.strictEqual(prodError, 'AUR0001:null,undefined');
    });
  });

  describe('Error code ranges validation', function () {
    const packageRanges = [
      { name: 'kernel', min: 1, max: 23, range: '0001-to-0023' },
      { name: 'expression-parser', min: 151, max: 179, range: '0151-to-0179' },
      { name: 'runtime', min: 203, max: 227, range: '0203-to-0227' },
      { name: 'i18n', min: 4000, max: 4002, range: '4000-to-4002' },
      { name: 'validation', min: 4100, max: 4106, range: '4100-to-4106' },
      { name: 'validation-html', min: 4200, max: 4206, range: '4200-to-4206' },
      { name: 'fetch-client', min: 5000, max: 5008, range: '5000-to-5008' },
    ];

    for (let i = 0; i < packageRanges.length - 1; i++) {
      const current = packageRanges[i];
      const next = packageRanges[i + 1];
      it(`should validate ${current.name} range does not overlap with ${next.name}`, function () {
        assert.ok(current.max < next.min,
          `Range overlap: ${current.name} (${current.max}) should not overlap with ${next.name} (${next.min})`);
      });
    }

    for (const { name, min, max, range } of packageRanges) {
      it(`should validate range string format for ${name}`, function () {
        const expectedRange = `${String(min).padStart(4, '0')}-to-${String(max).padStart(4, '0')}`;
        assert.strictEqual(range, expectedRange, `Range string for ${name} should be ${expectedRange}, got ${range}`);
      });
    }

    for (const code of [1, 23, 151, 179, 203, 227, 4000, 4002, 4100, 4106, 4200, 4206, 5000, 5008]) {
      it(`should validate error code ${code} falls within defined range`, function () {
        const matchingRange = packageRanges.find(range => code >= range.min && code <= range.max);
        assert.notEqual(matchingRange, undefined, `Code ${code} should fall within a defined range`);
      });
    }
  });
});
