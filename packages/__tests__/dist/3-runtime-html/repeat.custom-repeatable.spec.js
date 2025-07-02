import { Registration } from '@aurelia/kernel';
import { ArrayLikeHandler, IRepeatableHandler } from '@aurelia/runtime-html';
import { assert, createFixture } from "@aurelia/testing";
describe("3-runtime-html/repeat.custom-repeatable.spec.ts", function () {
    it('repeats an html collection', async function () {
        var _a;
        const { assertText } = await createFixture('<p ref="p">hey</p> <div repeat.for="i of items">${$index}--${i | nodeName}</div>', class {
            bound() {
                this.items = this.p?.childNodes;
            }
        }, [Registration.singleton(IRepeatableHandler, class ArrayLikeHandler {
                constructor() {
                    this.handles = v => 'length' in v && v.length > 0;
                    this.iterate = (items, func) => {
                        for (let i = 0, ii = items.length; i < ii; ++i) {
                            func(items[i], i);
                        }
                    };
                }
            }), (_a = class {
                    constructor() {
                        this.toView = v => v.nodeName;
                    }
                },
                _a.$au = { type: 'value-converter', name: 'nodeName' },
                _a)]).started;
        assertText('hey 0--#text');
    });
    it('repeats an html collection using the default array like handler', async function () {
        var _a;
        const { assertText } = await createFixture('<p ref="p">hey</p> <div repeat.for="i of items">${$index}--${i | nodeName}</div>', class {
            bound() {
                this.items = this.p?.childNodes;
            }
        }, [ArrayLikeHandler, (_a = class {
                    constructor() {
                        this.toView = v => v.nodeName;
                    }
                },
                _a.$au = { type: 'value-converter', name: 'nodeName' },
                _a)]).started;
        assertText('hey 0--#text');
    });
    it('throws on unknown repetable value', async function () {
        assert.throws(() => createFixture('<div repeat.for="i of {}">${$index}--${i | nodeName}</div>'));
    });
});
//# sourceMappingURL=repeat.custom-repeatable.spec.js.map