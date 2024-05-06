import { Registration } from '@aurelia/kernel';
import { ArrayLikeHandler, IRepeatableHandler } from '@aurelia/runtime-html';
import { assert, createFixture } from "@aurelia/testing";

describe("3-runtime-html/repeat.custom-repeatable.spec.ts", function () {
  it('repeats an html collection', function () {
    const { assertText } = createFixture(
      '<p ref="p">hey</p> <div repeat.for="i of items">${$index}--${i | nodeName}</div>',
      class {
        items: any[];
        p: any;
        bound() {
          this.items = this.p?.childNodes;
        }
      },
      [Registration.singleton(IRepeatableHandler, class ArrayLikeHandler {
        handles = v => 'length' in v && v.length > 0;
        iterate = (items, func) => {
          for (let i = 0, ii = items.length; i < ii; ++i) {
            func(items[i], i);
          }
        };
      }), class {
        static $au = { type: 'value-converter', name: 'nodeName' };
        toView = v => v.nodeName;
      }]
    );

    assertText('hey 0--#text');
  });

  it('repeats an html collection using the default array like handler', function () {
    const { assertText } = createFixture(
      '<p ref="p">hey</p> <div repeat.for="i of items">${$index}--${i | nodeName}</div>',
      class {
        items: any[];
        p: any;
        bound() {
          this.items = this.p?.childNodes;
        }
      },
      [ArrayLikeHandler, class {
        static $au = { type: 'value-converter', name: 'nodeName' };
        toView = v => v.nodeName;
      }]
    );

    assertText('hey 0--#text');
  });

  it('throws on unknown repetable value', function () {
    assert.throws(() => createFixture('<div repeat.for="i of {}">${$index}--${i | nodeName}</div>'));
  });
});
