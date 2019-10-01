import {
    bindable,
    customElement,
    CustomElement,
    LifecycleFlags,
    alias
} from '@aurelia/runtime';
import { TestConfiguration, assert, setup } from '@aurelia/testing';
import { Registration } from '@aurelia/kernel';

describe('interpolation', function () {
    it('Renders expected text', async function () {
        const { tearDown, appHost } = setup(`<template>$\{value}</template>`, class { value = 'wOOt' });
        assert.strictEqual(appHost.textContent, 'wOOt', `host.textContent`);
        await tearDown();
    });

    it('Undefined value renders nothing', async function () {
        const { tearDown, appHost } = setup(`<template>$\{value}</template>`, class { value; });
        assert.strictEqual(appHost.textContent, '', `host.textContent`);
        await tearDown();
    });

    it('Undefined value combined with static value renders only the static value', async function () {
        const { tearDown, appHost } = setup(`<template>$\{'test' + value}</template>`, class { value; });
        assert.strictEqual(appHost.textContent, 'test', `host.textContent`);
        await tearDown();
    });

    it('Boolean value prints true', async function () {
        const { tearDown, appHost } = setup(`<template>$\{value}</template>`, class { value = true; });
        assert.strictEqual(appHost.textContent, 'true', `host.textContent`);
        await tearDown();
    });
    it('Boolean value prints false', async function () {
        const { tearDown, appHost } = setup(`<template>$\{value}</template>`, class { value = false; });
        assert.strictEqual(appHost.textContent, 'false', `host.textContent`);
        await tearDown();
    });

    it('Boolean plus string plus boolean prints correctly', async function () {
        const { tearDown, appHost } = setup(`<template>$\{value}$\{value2}$\{value3}</template>`, class { value = false; value2 = 'test'; value3 = 'true' });
        assert.strictEqual(appHost.textContent, 'falsetesttrue', `host.textContent`);
        await tearDown();
    });

    it('Date prints correct', async function () {
        const { tearDown, appHost } = setup(`<template>$\{value}</template>`, class {
            value = new Date('Sat Feb 02 2002 00:00:00 GMT-0600 (Central Standard Time)')
        });
        assert.strictEqual(appHost.textContent, 'Sat Feb 02 2002 00:00:00 GMT-0600 (Central Standard Time)', `host.textContent`);
        await tearDown();
    });

    it('Date hours part extracted correctly', async function () {
        const { tearDown, appHost } = setup(`<template>$\{value.getHours()}</template>`, class {
            value = new Date('Sat Feb 02 2002 10:00:00 GMT-0600 (Central Standard Time)')
        });
        assert.strictEqual(appHost.textContent, '10', `host.textContent`);
        await tearDown();
    });

    it('Date with string prints correctly', async function () {
        const { tearDown, appHost } = setup(`<template>$\{value + ' ' + value2}</template>`, class {
            value = new Date('Sat Feb 02 2002 00:00:00 GMT-0600 (Central Standard Time)');
            value2 = 'test-date'
        });
        assert.strictEqual(appHost.textContent, 'Sat Feb 02 2002 00:00:00 GMT-0600 (Central Standard Time) test-date', `host.textContent`);
        await tearDown();
    });

    it('Date with null string prints correctly', async function () {
        const { tearDown, appHost } = setup(`<template>$\{value + ' ' + value2}</template>`, class {
            value = new Date('Sat Feb 02 2002 00:00:00 GMT-0600 (Central Standard Time)');
            value2 = null
        });
        assert.strictEqual(appHost.textContent, 'Sat Feb 02 2002 00:00:00 GMT-0600 (Central Standard Time) ', `host.textContent`);
        await tearDown();
    });

    it('Numbers work correctly', async function () {
        const { tearDown, appHost } = setup(`<template>$\{value}</template>`, class {
            value = 1;
            value2 = null
        });
        assert.strictEqual(appHost.textContent, '1', `host.textContent`);
        await tearDown();
    });

    it('Numbers with string work correctly', async function () {
        const { tearDown, appHost } = setup(`<template>$\{value}$\{value2}</template>`, class {
            value = 1;
            value2 = 'test'
        });
        assert.strictEqual(appHost.textContent, '1test', `host.textContent`);
        await tearDown();
    });
    it('Numbers with undefined string work correctly', async function () {
        const { tearDown, appHost } = setup(`<template>$\{value}$\{value2}</template>`, class {
            value = 1;
            value2 = undefined
        });
        assert.strictEqual(appHost.textContent, '1', `host.textContent`);
        await tearDown();
    });

    it('Sum of numbers works in interpolation', async function () {
        const { tearDown, appHost } = setup(`<template>$\{value + value2}</template>`, class {
            value = 1;
            value2 = 2
        });
        assert.strictEqual(appHost.textContent, '3', `host.textContent`);
        await tearDown();
    });

    it('Sum of numbers works with undefined works in interpolation', async function () {
        const { tearDown, appHost } = setup(`<template>$\{value + (value2 || 0) + value3}</template>`, class {
            value = 1;
            value2 = undefined;
            value3 = 2;
        });
        assert.strictEqual(appHost.textContent, '3', `host.textContent`);
        await tearDown();
    });




});
