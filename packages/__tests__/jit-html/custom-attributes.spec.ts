import {
    bindable,
    alias,
    customAttribute,
    INode
} from '@aurelia/runtime';
import { HTMLTestContext, TestContext, assert, setup } from '@aurelia/testing';

;

// TemplateCompiler - custom element integration
describe('custom-attributes', function () {
    let ctx: HTMLTestContext;

    beforeEach(function () {
        ctx = TestContext.createHTMLTestContext();
    });

    // custom elements
    describe('01. Aliases', async function () {

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


        const customElementCtors: any[] = [Foo4, Foo5];

        it('Simple spread Alias doesn\'t break def alias works on custom attribute', async function () {
            const options = await setup('<template> <div foo53.bind="value"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });

        it('Simple spread Alias (1st position) works on custom attribute', async function () {
            const options = await setup('<template> <div foo51.bind="value"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });

        it('Simple spread Alias (2nd position) works on custom attribute', async function () {
            const options = await setup('<template> <div foo52.bind="value"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });

        it('Simple spread Alias doesn\'t break original custom attribute', async function () {
            const options = await setup('<template> <div foo5.bind="value"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });


        it('Simple Alias doesn\'t break def alias works on custom attribute', async function () {
            const options = await setup('<template> <div foo43.bind="value"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });

        it('Simple Alias (1st position) works on custom attribute', async function () {
            const options = await setup('<template> <div foo41.bind="value"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });

        it('Simple Alias (2nd position) works on custom attribute', async function () {
            const options = await setup('<template> <div foo42.bind="value"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });

        it('Simple Alias doesn\'t break original custom attribute', async function () {
            const options = await setup('<template> <div foo4.bind="value"></div> </template>', class { value = 'wOOt' }, ctx, true, customElementCtors);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });

    });

});
