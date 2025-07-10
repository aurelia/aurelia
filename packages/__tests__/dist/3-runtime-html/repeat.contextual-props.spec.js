import { noop } from '@aurelia/kernel';
import { ValueConverter, } from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
import { assert, createFixture, } from '@aurelia/testing';
describe(`3-runtime-html/repeat.contextual-props.spec.ts`, function () {
    // todo: enable tests that create new collection via value converter
    const simpleRepeatPropsTestCases = [
        ...[
            {
                title: `Basic - no mutation`,
                mutate() { }
            },
            {
                title: `Basic - set to [null]`,
                mutate(comp) {
                    comp.items = null;
                }
            },
            {
                title: `Basic - set to [undefined]`,
                mutate(comp) {
                    comp.items = undefined;
                }
            },
            {
                title: `Basic - with reverse()`,
                mutate: (items) => items.reverse()
            },
            {
                title: `Basic - with sort()`,
                mutate: (items) => items.sort(sortDesc)
            },
            {
                title: `Basic - with push()`,
                mutate(items) {
                    for (let i = 0; 5 > i; ++i) {
                        items.push({ name: `item - ${i}`, value: i });
                    }
                }
            },
            {
                title: `Basic - with splice()`,
                mutate(items) {
                    // todo: fix fail tests when doing multiple consecutive splices
                    // for (let i = 0; 5 > i; ++i) {
                    //   // tslint:disable-next-line:insecure-random
                    //   const index = Math.floor(Math.random() * items.length);
                    //   items.splice(index, 0, { name: `item - ${items.length}`, value: items.length });
                    // }
                    const index = Math.floor(Math.random() * items.length);
                    items.splice(index, 0, { name: `item - ${items.length}`, value: items.length });
                }
            },
            {
                title: `Basic - with pop()`,
                mutate(items) {
                    items.pop();
                }
            },
            {
                title: `Basic - with shift()`,
                mutate(items) {
                    items.shift();
                }
            },
            {
                title: `Basic - with unshift()`,
                mutate(items) {
                    items.unshift({ name: `item - abcd`, value: 100 });
                }
            },
        ].reduce((allArrayCases, arrayCaseConfig) => {
            return allArrayCases.concat([
                arrayCaseConfig,
                {
                    ...arrayCaseConfig,
                    title: `${arrayCaseConfig.title} - with [Identity] value converter`,
                    repeatExpression: `item of items | identity`
                },
                // {
                //   ...arrayCaseConfig,
                //   title: `${arrayCaseConfig.title} - with [Clone] value converter`,
                //   repeatExpression: `item of items | clone`
                // }
            ]);
        }, []),
        ...[
            {
                title: `Map basic - no mutation`,
                repeatExpression: `entry of items`,
                textExpression: `[\${entry[1].name}] -- \${$index} -- \${$even}`,
                getItems: () => new Map(createItems(10).map((item) => [item.name, item])),
                mutate() { }
            },
            {
                title: `Map basic - set to [null]`,
                repeatExpression: `entry of items`,
                textExpression: `[\${entry[1].name}] -- \${$index} -- \${$even}`,
                getItems: () => new Map(createItems(10).map((item) => [item.name, item])),
                mutate(comp) {
                    comp.items = null;
                }
            },
            {
                title: `Map basic - set to [undefined]`,
                repeatExpression: `entry of items`,
                textExpression: `[\${entry[1].name}] -- \${$index} -- \${$even}`,
                getItems: () => new Map(createItems(10).map((item) => [item.name, item])),
                mutate(comp) {
                    comp.items = undefined;
                }
            },
            {
                title: `Map basic - with set()`,
                repeatExpression: `entry of items`,
                textExpression: `[\${entry[1].name}] -- \${$index} -- \${$even}`,
                getItems: () => new Map(createItems(10).map((item) => [item.name, item])),
                mutate(items) {
                    for (let i = 10; 15 > i; ++i) {
                        items.set(`item - ${i}`, { name: `item - ${i}`, value: i });
                    }
                }
            },
            {
                title: `Map basic - with delete()`,
                repeatExpression: `entry of items`,
                textExpression: `[\${entry[1].name}] -- \${$index} -- \${$even}`,
                getItems: () => new Map(createItems(10).map((item) => [item.name, item])),
                mutate(items) {
                    for (let i = 0; 5 > i; ++i) {
                        items.delete(`item - ${i}`);
                    }
                }
            },
            {
                title: `Map basic - with clear()`,
                repeatExpression: `entry of items`,
                textExpression: `[\${entry[1].name}] -- \${$index} -- \${$even}`,
                getItems: () => new Map(createItems(10).map((item) => [item.name, item])),
                mutate(items) {
                    items.clear();
                }
            }
        ].reduce((allMapCases, mapCaseConfig) => {
            return allMapCases.concat([
                mapCaseConfig,
                {
                    ...mapCaseConfig,
                    title: `${mapCaseConfig.title} - with [Identity] value converter`,
                    repeatExpression: `${mapCaseConfig.repeatExpression} | identity`
                },
                // {
                //   ...mapCaseConfig,
                //   title: `${mapCaseConfig.title} - with [Clone] value converter`,
                //   repeatExpression: `${mapCaseConfig.repeatExpression} | clone`
                // },
            ]);
        }, []),
        ...[
            {
                title: `Set basic - no mutation`,
                repeatExpression: `item of items`,
                textExpression: `[\${item.name}] -- \${$index} -- \${$even}`,
                getItems: () => new Set(createItems(10)),
                mutate() { }
            },
            {
                title: `Set basic - set to [null]`,
                repeatExpression: `item of items`,
                textExpression: `[\${item.name}] -- \${$index} -- \${$even}`,
                getItems: () => new Set(createItems(10)),
                mutate(comp) {
                    comp.items = null;
                }
            },
            {
                title: `Set basic - set to [undefined]`,
                repeatExpression: `item of items`,
                textExpression: `[\${item.name}] -- \${$index} -- \${$even}`,
                getItems: () => new Set(createItems(10)),
                mutate(comp) {
                    comp.items = undefined;
                }
            },
            {
                title: `Set basic - with add()`,
                repeatExpression: `item of items`,
                textExpression: `[\${item.name}] -- \${$index} -- \${$even}`,
                getItems: () => new Set(createItems(10)),
                mutate(items) {
                    for (let i = 0; 5 > i; ++i) {
                        items.add({ name: `item - ${i + 10}`, value: i + 10 });
                    }
                }
            },
            {
                title: `Set basic - with delete()`,
                repeatExpression: `item of items`,
                textExpression: `[\${item.name}] -- \${$index} -- \${$even}`,
                getItems: () => new Set(createItems(10)),
                mutate(items) {
                    const firstFive = [];
                    let i = 0;
                    items.forEach((item) => {
                        if (i++ < 6) {
                            firstFive.push(item);
                        }
                    });
                    firstFive.forEach(item => {
                        items.delete(item);
                    });
                }
            },
            {
                title: `Set basic - with clear()`,
                repeatExpression: `item of items`,
                textExpression: `[\${item.name}] -- \${$index} -- \${$even}`,
                getItems: () => new Set(createItems(10)),
                mutate(items) {
                    items.clear();
                }
            },
        ].reduce((allSetCases, setCaseConfig) => {
            return allSetCases.concat([
                setCaseConfig,
                {
                    ...setCaseConfig,
                    title: `${setCaseConfig.title} - with [Identity] value converter`,
                    repeatExpression: `${setCaseConfig.repeatExpression} | identity`
                },
                // {
                //   ...setCaseConfig,
                //   title: `${setCaseConfig.title} - with [Clone] value converter`,
                //   repeatExpression: `${setCaseConfig.repeatExpression} | clone`
                // }
            ]);
        }, []),
        ...[
            {
                title: `Number basic - no mutation`,
                textExpression: `[number:\${item}] -- \${$index} -- \${$even}`,
                getItems: () => 10,
                mutate() { }
            },
            {
                title: `Number basic - set to [null]`,
                textExpression: `[number:\${item}] -- \${$index} -- \${$even}`,
                getItems: () => 10,
                mutate(items, comp) {
                    comp.items = null;
                }
            },
            {
                title: `Number basic - set to [undefined]`,
                textExpression: `[number:\${item}] -- \${$index} -- \${$even}`,
                getItems: () => 10,
                mutate(items, comp) {
                    comp.items = undefined;
                }
            },
            {
                title: `Number basic - set to [0]`,
                textExpression: `[number:\${item}] -- \${$index} -- \${$even}`,
                getItems: () => 10,
                mutate(items, comp) {
                    comp.items = 0;
                }
            },
            {
                title: `Number basic - set to [-10]`,
                textExpression: `[number:\${item}] -- \${$index} -- \${$even}`,
                mutationWillThrow: true,
                getItems: () => 10,
                mutate(items, comp) {
                    comp.items = -10;
                }
            }
        ].reduce((allNumberCases, numberCaseConfig) => {
            return allNumberCases.concat([
                numberCaseConfig,
                {
                    ...numberCaseConfig,
                    title: `${numberCaseConfig.title} - with [Identity] value converter`,
                    repeatExpression: `item of items | identity`
                },
                // {
                //   ...numberCaseConfig,
                //   title: `${numberCaseConfig.title} - with [clone] value converter`,
                //   repeatExpression: `item of items | clone`
                // }
            ]);
        }, [])
    ];
    // Some tests are using, some aren't
    // but always register these
    const IdentityValueConverter = ValueConverter.define(`identity`, class {
        toView(val) {
            return val;
        }
    });
    const CloneValueConverter = ValueConverter.define(`clone`, class {
        toView(val) {
            return Array.isArray(val)
                ? val.slice(0)
                : val instanceof Map
                    ? new Map(val)
                    : val instanceof Set
                        ? new Set(val)
                        : val;
        }
    });
    for (const testCase of simpleRepeatPropsTestCases) {
        const { title, getItems = () => createItems(10), repeatExpression = `item of items`, textExpression = `[\${item.name}] -- \${$index} -- \${$even}`, only, mutate = noop, expectation = defaultExpectation, testWillThrow, mutationWillThrow } = testCase;
        const template = `<div repeat.for="${repeatExpression}">${textExpression}</div>`;
        class Root {
            constructor() {
                this.items = getItems();
            }
        }
        const suit = (_title, fn) => only
            // eslint-disable-next-line mocha/no-exclusive-tests
            ? it.only(_title, fn)
            : it(_title, fn);
        suit(title, async function () {
            // const ctx = TestContext.create();
            let au;
            let component;
            // let body: HTMLElement;
            let host;
            try {
                // au.app({ host, component: App });
                // await au.start();
                ({ component, au, appHost: host } = createFixture(template, Root, [IdentityValueConverter, CloneValueConverter]));
                assert.strictEqual(host.textContent, expectation(component.items, component), `#before mutation`);
            }
            catch (ex) {
                if (testWillThrow) {
                    // dont try to assert anything on throw
                    // just bails
                    try {
                        void au.stop();
                    }
                    catch { /* and ignore all errors trying to stop */ }
                    return;
                }
                throw ex;
            }
            if (testWillThrow) {
                throw new Error(`Expected test to throw, but did NOT`);
            }
            try {
                mutate(component.items, component);
                await tasksSettled();
                assert.strictEqual(host.textContent, expectation(component.items, component), `#after mutation`);
                await au.stop();
            }
            catch (ex) {
                if (!mutationWillThrow) {
                    try {
                        void au.stop();
                    }
                    catch {
                        /* and ignore all errors trying to stop */
                    }
                    finally {
                        au.dispose();
                    }
                    throw ex;
                }
            }
        });
    }
    function createItems(count) {
        return Array.from({ length: count }, (_, idx) => ({ name: `item - ${idx}`, value: idx }));
    }
    function defaultExpectation(items) {
        if (Array.isArray(items)) {
            return items.map((item, idx) => `[${item.name}] -- ${idx} -- ${idx % 2 === 0}`).join(``);
        }
        if (items instanceof Map) {
            return Array
                .from(items.entries())
                .map(([itemName], idx) => `[${itemName}] -- ${idx} -- ${idx % 2 === 0}`)
                .join(``);
        }
        if (items instanceof Set) {
            return Array
                .from(items)
                .map((item, idx) => `[${item.name}] -- ${idx} -- ${idx % 2 === 0}`)
                .join(``);
        }
        if (items == null) {
            return ``;
        }
        if (typeof items === `number`) {
            let text = ``;
            for (let i = 0; items > i; ++i) {
                text += `[number:${i}] -- ${i} -- ${i % 2 === 0}`;
            }
            return text;
        }
        throw new Error(`Invalid item types`);
    }
    function sortDesc(item1, item2) {
        return item1.value < item2.value ? 1 : -1;
    }
});
//# sourceMappingURL=repeat.contextual-props.spec.js.map