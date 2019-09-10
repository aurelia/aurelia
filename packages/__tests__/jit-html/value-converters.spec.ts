import {
    bindable,
    alias,
    customAttribute,
    INode,
    valueConverter
} from '@aurelia/runtime';
import { HTMLTestContext, TestContext, assert, setup } from '@aurelia/testing';

// TemplateCompiler - value converter integration
describe('value-converters', function () {
    let ctx: HTMLTestContext;

    beforeEach(function () {
        ctx = TestContext.createHTMLTestContext();
    });

    // custom elements
    describe('01. Aliases', async function () {

        @valueConverter({ name: 'woot1', aliases: ['woot13'] })
        @alias(...['woot11', 'woot12'])
        class WootConverter {
            toView() {
                return 'wOOt1';
            }
        }

        @valueConverter({ name: 'woot2', aliases: ['woot23'] })
        @alias('woot21', 'woot22')
        class WootConverter2 {
            toView() {
                return 'wOOt1';
            }
        }

        @customAttribute({ name: 'foo5', aliases: ['foo53'] })
        @alias(...['foo51', 'foo52'])
        class Foo5 {
            @bindable({ primary: true })
            public value: any;
            constructor(@INode private readonly element: Element) {
            }

            bound() {
                this.element.setAttribute('test', this.value);
            }
        }

        @customAttribute({ name: 'foo4', aliases: ['foo43'] })
        @alias('foo41', 'foo42')
        class Foo4 {
            @bindable({ primary: true })
            public value: any;
            constructor(@INode private readonly element: Element) {
            }

            bound() {
                this.element.setAttribute('test', this.value);
            }
        }


        const customElementCtors: any[] = [WootConverter, WootConverter2, Foo4, Foo5];

        it('Simple spread Alias doesn\'t break def alias works on value converter', async function () {
            const options = await setup('<template> <div foo53.bind="value | woot13"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.tearDown();
        });

        it('Simple spread Alias (1st position) works on value converter', async function () {
            const options = await setup('<template> <div foo51.bind="value | woot11"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.tearDown();
        });

        it('Simple spread Alias (2nd position) works on value converter', async function () {
            const options = await setup('<template> <div foo52.bind="value | woot12"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.tearDown();
        });

        it('Simple spread Alias doesn\'t break original value converter', async function () {
            const options = await setup('<template> <div foo5.bind="value | woot2"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.tearDown();
        });


        it('Simple Alias doesn\'t break def alias works on value converter', async function () {
            const options = await setup('<template> <div foo43.bind="value | woot23"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.tearDown();
        });

        it('Simple Alias (1st position) works on value converter', async function () {
            const options = await setup('<template> <div foo41.bind="value | woot21"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.tearDown();
        });

        it('Simple Alias (2nd position) works on value converter', async function () {
            const options = await setup('<template> <div foo42.bind="value | woot22"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.tearDown();
        });

        it('Simple Alias doesn\'t break original value converter', async function () {
            const options = await setup('<template> <div foo4.bind="value | woot2"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.tearDown();
        });

    });

});
