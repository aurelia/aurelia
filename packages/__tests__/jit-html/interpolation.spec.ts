import { assert, setup } from '@aurelia/testing';
import { LifecycleFlags } from '@aurelia/runtime';
describe('interpolation', function () {
    const cases = [
        {
            expected: 'wOOt', app: class { value?: string | number = 'wOOt'; value1?: string | number; }, interpolation: '$\{value}', it: 'Renders expected text'
        } as {
            expected: number | string, expectedValueAfterChange?: number | string, changeFnc?: (val) => any, app: any, interpolation: string, it: string;
        },
        {
            expected: '', app: class { value = undefined }, interpolation: '$\{value}', it: 'Undefined value renders nothing'
        },
        {
            expected: 5, app: class { value1 = undefined; value = 5; }, interpolation: '$\{value1 + value}', it: 'Two values one undefined sum correctly'
        },
        {
            expected: -5, app: class { value = undefined; value1 = 5; }, interpolation: '$\{value - value1}', it: 'Two values one undefined minus correctly'
        },
        {
            expected: 'Infinity', expectedValueAfterChange: 5, app: class { value = undefined; value1 = 5 }, interpolation: '$\{value1/value}', it: 'Number divided by undefined is Infinity'
        },
        {
            expected: 1, expectedValueAfterChange: 0.8333333333333334, app: class { value = 5; value1 = 5 }, interpolation: '$\{value1/value}', it: 'Number divided by number works as planned'
        },
        {
            expected: 1, app: class { Math = Math; value = 1.2; value1 = 5 }, interpolation: '$\{Math.round(value)}', it: 'Global Aliasing works'
        },
        {
            expected: 2, app: class { Math = Math; value = 1.5; value1 = 5 }, interpolation: '$\{Math.round(value)}', it: 'Global Aliasing works #2'
        },
        {
            expected: 'true', expectedValueAfterChange: 'false', changeFnc: (val) => !val, app: class { value = true }, interpolation: '$\{value}', it: 'Boolean prints true'
        },
        {
            expected: 'false', expectedValueAfterChange: 'true', changeFnc: (val) => !val, app: class { value = false }, interpolation: '$\{value}', it: 'Boolean prints false'
        },
        {
            expected: 'false', expectedValueAfterChange: 'false', changeFnc: (val) => !val, app: class { value = false }, interpolation: '$\{value && false}', it: 'Boolean prints false with && no matter what'
        },
        {
            expected: 'test',
            app: class { value = 'test' },
            interpolation: '$\{true && value}',
            it: 'Coalesce works properly'
        },
        {
            expected: 'Sat Feb 02 2002 00:00:00 GMT-0600 (Central Standard Time)',
            expectedValueAfterChange: 'Sun Feb 03 2002 00:00:00 GMT-0600 (Central Standard Time)',
            changeFnc: (val: Date) => {
                val.setDate(3);
                return val; // Date observation no worky
            }, app: class { value = new Date('Sat Feb 02 2002 00:00:00 GMT-0600 (Central Standard Time)') },
            interpolation: '$\{value}', it: 'Date works and setDate triggers change properly'
        },
        {
            expected: 'Sat Feb 02 2002 00:00:00 GMT-0600 (Central Standard Time)',
            expectedValueAfterChange: 'Sun Feb 03 2002 00:00:00 GMT-0600 (Central Standard Time)',
            changeFnc: (val: Date) => {
                val.setDate(3);
                return val; // Date observation no worky
            }, app: class { value = new Date('Sat Feb 02 2002 00:00:00 GMT-0600 (Central Standard Time)') },
            interpolation: '$\{undefined + value}', it: 'Date works with undefined expression and setDate triggers change properly'
        },
        {
            expected: 'Sat Feb 02 2002 00:00:00 GMT-0600 (Central Standard Time)',
            expectedValueAfterChange: 'Sat Feb 02 2002 03:00:00 GMT-0600 (Central Standard Time)',
            changeFnc: (val: Date) => {
                val.setHours(3);
                return val; // Date observation no worky
            }, app: class { value = new Date('Sat Feb 02 2002 00:00:00 GMT-0600 (Central Standard Time)') },
            interpolation: '$\{value}', it: 'Date works and setHours triggers change properly'
        },
        {
            expected: { foo: 'foo', bar: 'bar' }.toString(),
            expectedValueAfterChange: { foo: 'foo', bar: 'bar', wat: 'wat' }.toString(),
            changeFnc: (val) => {
                val.wat = 'wat';
                return val;
            }, app: class { value = { foo: 'foo', bar: 'bar', wat: 'wat' } }, interpolation: '$\{value}', it: 'Object binding works'
        },
        {
            expected: [0, 1, 2].toString(),
            expectedValueAfterChange: [0, 1, 2, 3].toString(),

            changeFnc: (val) => {
                val.push(3);
                return val;  // Array observation no worky
            }, app: class { value = [0, 1, 2] },
            interpolation: '$\{value}',
            it: 'Array prints comma delimited values and observes push correctly'
        },
        {
            expected: [0, 1, 2].toString(),
            expectedValueAfterChange: [0, 1].toString(),

            changeFnc: (val) => {
                val.pop();
                return val;  // Array observation no worky
            }, app: class { value = [0, 1, 2] },
            interpolation: '$\{value}',
            it: 'Array prints comma delimited values and observes pop correctly'
        },

        {
            expected: [0, 1, 2].toString(),
            expectedValueAfterChange: [0, 2].toString(),

            changeFnc: (val) => {
                val.splice(1, 1);
                return val;  // Array observation no worky
            }, app: class { value = [0, 1, 2] },
            interpolation: '$\{value}',
            it: 'Array prints comma delimited values and observes splice correctly'
        },
        {
            expected: [0, 1, 2].toString(),
            expectedValueAfterChange: [5, 6].toString(),

            changeFnc: (val) => {
                return [5, 6];
            }, app: class { value = [0, 1, 2] },
            interpolation: '$\{value}',
            it: 'Array prints comma delimited values and observes new array correctly'
        },
        {
            expected: 'test foo out bar',
            expectedValueAfterChange: 'test foo woot out bar',
            changeFnc: (val) => {
                return val + ' woot';
            }, app: class { value = 'foo'; value2 = 'bar' },
            interpolation: 'test $\{value} out $\{value2}',
            it: 'Multiple statements work in interpolation'
        },
        {
            expected: 'test foo out foo',
            expectedValueAfterChange: 'test foo woot out foo woot',
            changeFnc: (val) => {
                return val + ' woot';
            }, app: class { value = 'foo'; },
            interpolation: 'test $\{value} out $\{value}',
            it: 'Multiple SAME statements work in interpolation'
        },
        {
            expected: 'test  out ',
            expectedValueAfterChange: 'test foo out foo',
            changeFnc: (val) => {
                return 'foo';
            }, app: class { value; },
            interpolation: 'test $\{value} out $\{value}',
            it: 'Multiple SAME statements work in interpolation with undefined'
        },
    ];

    cases.forEach((x) => {
        it(x.it, async function () {
            const { tearDown, appHost, lifecycle, component } = setup(`<template>${x.interpolation}</template>`, x.app);
            assert.strictEqual(appHost.textContent, x.expected.toString(), `host.textContent`);
            await tearDown();
        });
        it(x.it + ' change tests work', async function () {
            const { tearDown, appHost, lifecycle, component } = setup(`<template>${x.interpolation}</template>`, x.app);
            if (x.changeFnc) {
                const val = x.changeFnc(component.value);
                if (val != null) {
                    component.value = val;
                }
            }
            else if (typeof x.expected === 'string' && x.expected !== 'Infinity') {
                component.value = (component.value || '') + '1';

            } else {
                component.value = (component.value || 0) + 1;
            }
            lifecycle.processRAFQueue(LifecycleFlags.none);
            assert.strictEqual(appHost.textContent, (x.expectedValueAfterChange && x.expectedValueAfterChange.toString()) || (x.expected as any + 1).toString(), `host.textContent`);
            await tearDown();
        })
    });


});
