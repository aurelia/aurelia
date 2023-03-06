import { assert } from '@aurelia/testing';
import { EqualsRule, LengthRule, RangeRule, RegexRule, RequiredRule, SizeRule } from '@aurelia/validation';

describe('validation/rules.spec.ts', function () {
  const requiredRuleDataRows = [
    { value: null,      isValid: false },
    { value: undefined, isValid: false },
    { value: '',        isValid: false },
    { value: true,      isValid: true  },
    { value: false,     isValid: true  },
    { value: '1',       isValid: true  },
    { value: 'chaos',   isValid: true  },
    { value: 0,         isValid: true  },
    { value: 1,         isValid: true  },
  ];
  for (const {value, isValid} of requiredRuleDataRows) {
    it(`RequiredRule#execute validates ${value} to be ${isValid}`, function () {
      const sut = new RequiredRule();
      assert.equal(sut.execute(value), isValid);
    });
  }

  const regexRuleDataRows = [
    { value: null,      isValid: true  },
    { value: undefined, isValid: true  },
    { value: '',        isValid: true  },
    { value: 'foobar',  isValid: true  },
    { value: 'barbar',  isValid: false },
  ];
  for(const { value, isValid } of regexRuleDataRows) {
    it(`RegexRule#execute validates ${value} to be ${isValid}`, function () {
      const sut = new RegexRule(/foo/);
      assert.equal(sut.execute(value), isValid);
    });
  }

  const lengthRuleDataRows = [
    { value: null,      length: void 0, isMax: true,  isValid: true  },
    { value: null,      length: void 0, isMax: false, isValid: true  },
    { value: undefined, length: void 0, isMax: true,  isValid: true  },
    { value: undefined, length: void 0, isMax: false, isValid: true  },
    { value: '',        length: 1,      isMax: true,  isValid: true  },
    { value: '',        length: 1,      isMax: false, isValid: true  },
    { value: 'foo',     length: 5,      isMax: true,  isValid: true  },
    { value: 'foobar',  length: 5,      isMax: true,  isValid: false },
    { value: 'fooba',   length: 5,      isMax: true,  isValid: true  },
    { value: 'foo',     length: 5,      isMax: false, isValid: false },
    { value: 'foobar',  length: 5,      isMax: false, isValid: true  },
    { value: 'fooba',   length: 5,      isMax: false, isValid: true  },
  ];
  for(const { value, length, isMax, isValid } of lengthRuleDataRows) {
    it(`LengthRule#execute validates ${value} to be ${isValid} for length constraint ${length}`, function () {
      const sut = new LengthRule(length, isMax);
      assert.equal(sut.messageKey, isMax ? 'maxLength' : 'minLength');
      assert.equal(sut.execute(value), isValid);
    });
  }

  const sizeRuleDataRows = [
    { value: null,                  count: void 0,  isMax: true,  isValid: true  },
    { value: null,                  count: void 0,  isMax: false, isValid: true  },
    { value: undefined,             count: void 0,  isMax: true,  isValid: true  },
    { value: undefined,             count: void 0,  isMax: false, isValid: true  },
    { value: [],                    count: 1,       isMax: true,  isValid: true  },
    { value: [],                    count: 1,       isMax: false, isValid: false },
    { value: ['foobar'],            count: 2,       isMax: true,  isValid: true  },
    { value: ['foobar'],            count: 2,       isMax: false, isValid: false },
    { value: ['foo', 'bar'],        count: 2,       isMax: true,  isValid: true  },
    { value: ['foo', 'bar', 'fu'],  count: 2,       isMax: true,  isValid: false },
    { value: ['foo', 'bar'],        count: 2,       isMax: false, isValid: true  },
    { value: ['foo', 'bar', 'fu'],  count: 2,       isMax: false, isValid: true  },
  ];
  for(const { value, count, isMax, isValid } of sizeRuleDataRows) {
    it(`SizeRule#execute validates ${value} to be ${isValid} for count constraint ${count}`, function () {
      const sut = new SizeRule(count, isMax);
      assert.equal(sut.messageKey, isMax ? 'maxItems' : 'minItems');
      assert.equal(sut.execute(value), isValid);
    });
  }

  const rangeRuleDataRows = [
    { value: NaN,       range: { min: 42,         max: undefined }, isInclusive: true,  isValid: false, key: 'min'     },
    { value: NaN,       range: { min: 42,         max: undefined }, isInclusive: false, isValid: false, key: 'min'     },
    { value: NaN,       range: { min: undefined,  max: 42        }, isInclusive: true,  isValid: false, key: 'max'     },
    { value: NaN,       range: { min: undefined,  max: 42        }, isInclusive: false, isValid: false, key: 'max'     },
    { value: NaN,       range: { min: 39,         max: 42        }, isInclusive: false, isValid: false, key: 'between' },
    { value: NaN,       range: { min: 39,         max: 42        }, isInclusive: true,  isValid: false, key: 'range'   },
    { value: null,      range: { min: 42,         max: undefined }, isInclusive: true,  isValid: true,  key: 'min'     },
    { value: null,      range: { min: 42,         max: undefined }, isInclusive: false, isValid: true,  key: 'min'     },
    { value: null,      range: { min: undefined,  max: 42        }, isInclusive: true,  isValid: true,  key: 'max'     },
    { value: null,      range: { min: undefined,  max: 42        }, isInclusive: false, isValid: true,  key: 'max'     },
    { value: null,      range: { min: 39,         max: 42        }, isInclusive: false, isValid: true,  key: 'between' },
    { value: null,      range: { min: 39,         max: 42        }, isInclusive: true,  isValid: true,  key: 'range'   },
    { value: undefined, range: { min: 42,         max: undefined }, isInclusive: true,  isValid: true,  key: 'min'     },
    { value: undefined, range: { min: 42,         max: undefined }, isInclusive: false, isValid: true,  key: 'min'     },
    { value: undefined, range: { min: undefined,  max: 42        }, isInclusive: true,  isValid: true,  key: 'max'     },
    { value: undefined, range: { min: undefined,  max: 42        }, isInclusive: false, isValid: true,  key: 'max'     },
    { value: undefined, range: { min: 39,         max: 42        }, isInclusive: false, isValid: true,  key: 'between' },
    { value: undefined, range: { min: 39,         max: 42        }, isInclusive: true,  isValid: true,  key: 'range'   },
    { value: -41000,    range: { min: 42,         max: undefined }, isInclusive: true,  isValid: false, key: 'min'     },
    { value: 41,        range: { min: 42,         max: undefined }, isInclusive: true,  isValid: false, key: 'min'     },
    { value: 42,        range: { min: 42,         max: undefined }, isInclusive: true,  isValid: true,  key: 'min'     },
    { value: 43,        range: { min: 42,         max: undefined }, isInclusive: true,  isValid: true,  key: 'min'     },
    { value: 43000,     range: { min: 42,         max: undefined }, isInclusive: true,  isValid: true,  key: 'min'     },
    { value: -41000,    range: { min: 42,         max: undefined }, isInclusive: false, isValid: false, key: 'min'     },
    { value: 41,        range: { min: 42,         max: undefined }, isInclusive: false, isValid: false, key: 'min'     },
    { value: 42,        range: { min: 42,         max: undefined }, isInclusive: false, isValid: false, key: 'min'     },
    { value: 43,        range: { min: 42,         max: undefined }, isInclusive: false, isValid: true,  key: 'min'     },
    { value: 43000,     range: { min: 42,         max: undefined }, isInclusive: false, isValid: true,  key: 'min'     },
    { value: -41000,    range: { min: undefined,  max: 42        }, isInclusive: true,  isValid: true,  key: 'max'     },
    { value: 41,        range: { min: undefined,  max: 42        }, isInclusive: true,  isValid: true,  key: 'max'     },
    { value: 42,        range: { min: undefined,  max: 42        }, isInclusive: true,  isValid: true,  key: 'max'     },
    { value: 43,        range: { min: undefined,  max: 42        }, isInclusive: true,  isValid: false, key: 'max'     },
    { value: 43000,     range: { min: undefined,  max: 42        }, isInclusive: true,  isValid: false, key: 'max'     },
    { value: -41000,    range: { min: undefined,  max: 42        }, isInclusive: false, isValid: true,  key: 'max'     },
    { value: 41,        range: { min: undefined,  max: 42        }, isInclusive: false, isValid: true,  key: 'max'     },
    { value: 42,        range: { min: undefined,  max: 42        }, isInclusive: false, isValid: false, key: 'max'     },
    { value: 43,        range: { min: undefined,  max: 42        }, isInclusive: false, isValid: false, key: 'max'     },
    { value: 43000,     range: { min: undefined,  max: 42        }, isInclusive: false, isValid: false, key: 'max'     },
    { value: 38,        range: { min: 39,         max: 42        }, isInclusive: false, isValid: false, key: 'between' },
    { value: 39,        range: { min: 39,         max: 42        }, isInclusive: false, isValid: false, key: 'between' },
    { value: 40,        range: { min: 39,         max: 42        }, isInclusive: false, isValid: true,  key: 'between' },
    { value: 41,        range: { min: 39,         max: 42        }, isInclusive: false, isValid: true,  key: 'between' },
    { value: 42,        range: { min: 39,         max: 42        }, isInclusive: false, isValid: false, key: 'between' },
    { value: 43,        range: { min: 39,         max: 42        }, isInclusive: false, isValid: false, key: 'between' },
    { value: 38,        range: { min: 39,         max: 42        }, isInclusive: true,  isValid: false, key: 'range'   },
    { value: 39,        range: { min: 39,         max: 42        }, isInclusive: true,  isValid: true,  key: 'range'   },
    { value: 40,        range: { min: 39,         max: 42        }, isInclusive: true,  isValid: true,  key: 'range'   },
    { value: 41,        range: { min: 39,         max: 42        }, isInclusive: true,  isValid: true,  key: 'range'   },
    { value: 42,        range: { min: 39,         max: 42        }, isInclusive: true,  isValid: true,  key: 'range'   },
    { value: 43,        range: { min: 39,         max: 42        }, isInclusive: true,  isValid: false, key: 'range'   },
  ];
  for(const { value, range, isInclusive, isValid, key } of rangeRuleDataRows) {
    it(`RangeRule#execute validates ${value} to be ${isValid} for range ${isInclusive ? `[${range.min}, ${range.max}]` : `(${range.min}, ${range.max})`}`, function () {
      const sut = new RangeRule(isInclusive, range);
      assert.equal(sut.messageKey, key);
      assert.equal(sut.execute(value), isValid);
    });
  }

  const equalsRuleDataRows = [
    { value: null,      expectedValue: 42, isValid: true  },
    { value: undefined, expectedValue: 42, isValid: true  },
    { value: '',        expectedValue: 42, isValid: true  },
    { value: '42',      expectedValue: 42, isValid: false },
    { value: 42,        expectedValue: 42, isValid: true  },
  ];
  for(const { value, expectedValue, isValid } of equalsRuleDataRows) {
    it(`EqualsRule#execute validates ${value} to be ${isValid} for expected value ${expectedValue}`, function () {
      const sut = new EqualsRule(expectedValue);
      assert.equal(sut.execute(value), isValid);
    });
  }
});
