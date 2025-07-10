import { assert, createFixture } from '@aurelia/testing';
describe('4-gh-issues/2156.spec.ts', function () {
    it('should not compose when deactivated', function () {
        var _a, _b;
        const logs = [];
        const { component, assertText } = createFixture(`<el if.bind="show">`, class App {
            constructor() {
                this.show = true;
            }
        }, [(_a = class El2 {
                    activate(model) {
                        logs.push(model);
                    }
                },
                _a.$au = {
                    type: 'custom-element',
                    name: 'el2',
                    template: 'Hi, el2 here'
                },
                _a), (_b = class El {
                    constructor() {
                        this.obj = {
                            model: 'test',
                            component: 'el2'
                        };
                    }
                    unbinding() {
                        this.obj = null;
                    }
                },
                _b.$au = {
                    type: 'custom-element',
                    name: 'el',
                    template: '<au-compose model.bind="obj.model" component.bind="obj.component"></au-compose>'
                },
                _b)]);
        assertText('Hi, el2 here');
        assert.deepStrictEqual(logs, ['test']);
        logs.length = 0;
        component.show = false;
        assert.deepStrictEqual(logs, []);
    });
});
//# sourceMappingURL=2156.spec.js.map