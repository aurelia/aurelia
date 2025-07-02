import { runTasks } from '@aurelia/runtime';
import { CustomElement, Aurelia, } from '@aurelia/runtime-html';
import { eachCartesianJoin, TestContext, trimFull, assert, createFixture, } from '@aurelia/testing';
describe('3-runtime-html/repeater-if-else.spec.ts', function () {
    const behaviorsSpecs = [
        {
            t: '01',
            behaviors: ''
        },
    ];
    const ceTemplateSpecs = [
        {
            t: '101',
            createCETemplate(behaviors) {
                return `<template>
          <div repeat.for="item of items ${behaviors}">
            <div if.bind="display">
              \${item.if}
            </div>
            <div else>
              \${item.else}
            </div>
          </div>
        </template>`;
            }
        },
        {
            t: '102',
            createCETemplate(behaviors) {
                return `<template>
          <div repeat.for="item of items ${behaviors}">
            <div if.bind="display">
              <div if.bind="true">
                \${item.if}
              </div>
            </div>
            <div else>
              \${item.else}
            </div>
          </div>
        </template>`;
            }
        },
        {
            t: '103',
            createCETemplate(behaviors) {
                return `<template>
          <div repeat.for="item of items ${behaviors}">
            <div if.bind="display">
              <div if.bind="false">
                do_not_show
              </div>
              <div else>
                \${item.if}
              </div>
            </div>
            <div else>
              \${item.else}
            </div>
          </div>
        </template>`;
            }
        },
        {
            t: '104',
            createCETemplate(behaviors) {
                return `<template>
          <div if.bind="true" repeat.for="item of items ${behaviors}">
            <div if.bind="display">
              \${item.if}
            </div>
            <div else>
              \${item.else}
            </div>
          </div>
        </template>`;
            }
        },
        {
            t: '105',
            createCETemplate(behaviors) {
                return `<template>
          <div if.bind="false">do_not_show</div>
          <div else repeat.for="item of items ${behaviors}">
            <div if.bind="display">
              \${item.if}
            </div>
            <div else>
              \${item.else}
            </div>
          </div>
        </template>`;
            }
        },
        {
            t: '106',
            createCETemplate(behaviors) {
                return `<template>
          <div repeat.for="item of items ${behaviors}">
            <div if.bind="display" repeat.for="i of 1 ${behaviors}">
              \${item.if}
            </div>
            <div else repeat.for="i of 1 ${behaviors}">
              \${item.else}
            </div>
          </div>
        </template>`;
            }
        },
        {
            t: '107',
            createCETemplate(behaviors) {
                return `<template>
          <div if.bind="true" repeat.for="item of items ${behaviors}">
            <div if.bind="display" repeat.for="i of 1 ${behaviors}">
              \${item.if}
            </div>
            <div else repeat.for="i of 1 ${behaviors}">
              \${item.else}
            </div>
          </div>
        </template>`;
            }
        },
        {
            t: '108',
            createCETemplate(behaviors) {
                return `<template>
          <div repeat.for="a of 1 ${behaviors}">
            <div repeat.for="item of items ${behaviors}">
              <div if.bind="display">
                \${item.if}
              </div>
              <div else>
                \${item.else}
              </div>
            </div>
          </div>
        </template>`;
            }
        },
        {
            t: '109',
            createCETemplate(behaviors) {
                return `<template>
          <template repeat.for="item of items ${behaviors}">
            <div if.bind="display">
              \${item.if}
            </div>
            <div else>
              \${item.else}
            </div>
          </template>
        </template>`;
            }
        },
        {
            t: '110',
            createCETemplate(behaviors) {
                return `<template>
          <div repeat.for="item of items ${behaviors}">
            <template if.bind="display">
              \${item.if}
            </template>
            <template else>
              \${item.else}
            </template>
          </div>
        </template>`;
            }
        },
        {
            t: '111',
            createCETemplate(behaviors) {
                return `<template>
          <template repeat.for="item of items ${behaviors}">
            <template if.bind="display">
              \${item.if}
            </template>
            <template else>
              \${item.else}
            </template>
          </template>
        </template>`;
            }
        },
        {
            t: '112',
            createCETemplate(behaviors) {
                return `<template>
          <div if.bind="display" repeat.for="item of items ${behaviors}">
            \${item.if}
          </div>
          <div else repeat.for="item of items ${behaviors}">
            \${item.else}
          </div>
        </template>`;
            }
        },
        {
            t: '113',
            createCETemplate(behaviors) {
                return `<template>
          <div if.bind="display">
            <div repeat.for="item of items ${behaviors}">
              \${item.if}
            </div>
          </div>
          <div else>
            <div repeat.for="item of items ${behaviors}">
              \${item.else}
            </div>
          </div>
        </template>`;
            }
        },
        {
            t: '114',
            createCETemplate(behaviors) {
                return `<template>
          <div repeat.for="item of items ${behaviors}" with.bind="item">
            <div if.bind="display">
              \${if}
            </div>
            <div else>
              \${else}
            </div>
          </div>
        </template>`;
            }
        },
        {
            t: '115',
            createCETemplate(behaviors) {
                return `<template>
          <div repeat.for="item of items ${behaviors}">
            <div with.bind="item">
              <div if.bind="display">
                \${if}
              </div>
              <div else>
                \${else}
              </div>
            </div>
          </div>
        </template>`;
            }
        }
    ];
    const appTemplateSpecs = [
        {
            t: '01',
            createAppTemplate(behaviors) {
                return `<template>
          <foo repeat.for="i of count ${behaviors}" items.bind="items" display.bind="display">
          </foo>
        </template>`;
            }
        },
        {
            t: '02',
            createAppTemplate(behaviors) {
                return `<template>
          <foo repeat.for="i of count ${behaviors}" if.bind="true" items.bind="items" display.bind="display">
          </foo>
        </template>`;
            }
        },
        {
            t: '03',
            createAppTemplate(behaviors) {
                return `<template>
          <div repeat.for="i of count ${behaviors}">
            <div if.bind="false">
              do_not_show
            </div>
            <foo else items.bind="items" display.bind="display">
            </foo>
          </div>
        </template>`;
            }
        },
        {
            t: '04',
            createAppTemplate(behaviors) {
                return `<template>
          <foo if.bind="true" repeat.for="i of count ${behaviors}" items.bind="items" display.bind="display">
          </foo>
        </template>`;
            }
        },
        {
            t: '05',
            createAppTemplate(behaviors) {
                return `<template>
          <div if.bind="false">
            do_not_show
          </div>
          <foo else repeat.for="i of count ${behaviors}" items.bind="items" display.bind="display">
          </foo>
        </template>`;
            }
        }
    ];
    const itemsSpecs = [
        {
            t: '01',
            createItems() {
                return [{ if: 1, else: 2 }, { if: 3, else: 4 }];
            },
            ifText: '13',
            elseText: '24'
        },
        {
            t: '02',
            createItems() {
                return [{ if: 'a', else: 'b' }, { if: 'c', else: 'd' }, { if: 'e', else: 'f' }, { if: 'g', else: 'h' }];
            },
            ifText: 'aceg',
            elseText: 'bdfh'
        }
    ];
    const countSpecs = [
        {
            t: '01',
            count: 1
        },
        {
            t: '02',
            count: 3
        }
    ];
    const mutationSpecs = [
        {
            t: '01',
            execute(component, platform, host, count, ifText, _elseText) {
                component.display = true;
                runTasks();
                assert.strictEqual(trimFull(host.textContent), ifText.repeat(count), `trimFull(host.textContent)`);
            }
        },
        {
            t: '02',
            execute(component, platform, host, count, _ifText, elseText) {
                component.display = true;
                runTasks();
                component.display = false;
                runTasks();
                assert.strictEqual(trimFull(host.textContent), elseText.repeat(count), `trimFull(host.textContent)`);
            }
        },
        {
            t: '03',
            execute(component, platform, host, count, _ifText, _elseText) {
                component.items = [{ if: 2, else: 1 }, { if: 4, else: 3 }];
                runTasks();
                assert.strictEqual(trimFull(host.textContent), '13'.repeat(count), `trimFull(host.textContent)`);
            }
        },
        {
            t: '04',
            execute(component, platform, host, count, _ifText, elseText) {
                component.items[0].if = 5;
                component.items[0].else = 6;
                component.items[1].if = 7;
                component.items[1].else = 8;
                runTasks();
                assert.strictEqual(trimFull(host.textContent), `68${elseText.slice(2)}`.repeat(count), `trimFull(host.textContent)`);
            }
        },
        {
            t: '05',
            execute(component, platform, host, count, _ifText, elseText) {
                component.items.reverse();
                runTasks();
                assert.strictEqual(trimFull(host.textContent), (elseText.split('').reverse().join('')).repeat(count), `trimFull(host.textContent)`);
            }
        },
        {
            t: '06',
            execute(component, platform, host, count, ifText, _elseText) {
                component.items.reverse();
                component.display = true;
                runTasks();
                assert.strictEqual(trimFull(host.textContent), (ifText.split('').reverse().join('')).repeat(count), `trimFull(host.textContent)`);
            }
        },
        {
            t: '07',
            execute(component, platform, host, count, _ifText, _elseText) {
                component.items = [{ if: 'a', else: 'b' }];
                runTasks();
                assert.strictEqual(trimFull(host.textContent), 'b'.repeat(count), `trimFull(host.textContent)`);
            }
        },
        {
            t: '08',
            execute(component, platform, host, count, _ifText, _elseText) {
                component.items = [{ if: 'a', else: 'b' }];
                component.display = true;
                runTasks();
                assert.strictEqual(trimFull(host.textContent), 'a'.repeat(count), `trimFull(host.textContent)`);
            }
        },
        {
            t: '09',
            execute(component, platform, host, count, _ifText, elseText) {
                component.items.pop();
                runTasks();
                assert.strictEqual(trimFull(host.textContent), elseText.slice(0, -1).repeat(count), `trimFull(host.textContent)`);
            }
        },
        {
            t: '10',
            execute(component, platform, host, count, ifText, _elseText) {
                component.items.pop();
                component.display = true;
                runTasks();
                assert.strictEqual(trimFull(host.textContent), ifText.slice(0, -1).repeat(count), `trimFull(host.textContent)`);
            }
        },
        {
            t: '11',
            execute(component, platform, host, count, _ifText, elseText) {
                component.items = component.items.slice().concat({ if: 'x', else: 'y' });
                runTasks();
                assert.strictEqual(trimFull(host.textContent), `${elseText}y`.repeat(count), `trimFull(host.textContent)`);
            }
        },
        {
            t: '12',
            execute(component, platform, host, count, _ifText, _elseText) {
                component.items = [{ if: 'a', else: 'b' }, { if: 'c', else: 'd' }, { if: 'e', else: 'f' }];
                component.display = true;
                runTasks();
                assert.strictEqual(trimFull(host.textContent), 'ace'.repeat(count), `trimFull(host.textContent)`);
            }
        },
        {
            t: '13',
            execute(component, platform, host, count, _ifText, elseText) {
                component.items.push({ if: 5, else: 6 });
                runTasks();
                assert.strictEqual(trimFull(host.textContent), `${elseText}6`.repeat(count), `trimFull(host.textContent)`);
            }
        },
        {
            t: '14',
            execute(component, platform, host, count, ifText, _elseText) {
                component.items.push({ if: 5, else: 6 });
                component.display = true;
                runTasks();
                assert.strictEqual(trimFull(host.textContent), `${ifText}5`.repeat(count), `trimFull(host.textContent)`);
            }
        }
    ];
    eachCartesianJoin([behaviorsSpecs, ceTemplateSpecs, appTemplateSpecs, itemsSpecs, countSpecs, mutationSpecs], (behaviorsSpec, ceTemplateSpec, appTemplateSpec, itemsSpec, countSpec, mutationSpec) => {
        it(`behaviorsSpec ${behaviorsSpec.t}, ceTemplateSpec ${ceTemplateSpec.t}, appTemplateSpec ${appTemplateSpec.t}, itemsSpec ${itemsSpec.t}, countSpec ${countSpec.t}, mutationSpec ${mutationSpec.t}`, async function () {
            var _a;
            const { behaviors } = behaviorsSpec;
            const { createCETemplate } = ceTemplateSpec;
            const { createAppTemplate } = appTemplateSpec;
            const { ifText, elseText, createItems } = itemsSpec;
            const { count } = countSpec;
            const { execute } = mutationSpec;
            const ctx = TestContext.create();
            const { container } = ctx;
            const initialItems = createItems();
            const Component = CustomElement.define({
                name: 'app',
                template: createAppTemplate(behaviors),
                dependencies: [
                    CustomElement.define({
                        name: 'foo',
                        template: createCETemplate(behaviors),
                    }, (_a = class Foo {
                        },
                        _a.bindables = ['items', 'display'],
                        _a))
                ]
            }, class App {
                created() {
                    this.items = initialItems;
                    this.display = false;
                    this.count = count;
                }
            });
            const host = ctx.createElement('div');
            const au = new Aurelia(container);
            await au
                .app({ host, component: Component })
                .start();
            const component = au.root.controller.viewModel;
            assert.strictEqual(trimFull(host.textContent), elseText.repeat(count), `trimFull(host.textContent) === elseText.repeat(count)`);
            execute(component, ctx.platform, host, count, ifText, elseText);
            await au.stop();
            assert.strictEqual(trimFull(host.textContent), '', `trimFull(host.textContent) === ''`);
            au.dispose();
        });
    });
    it('GH #1119 - works when the repeter is wrapped in if.bind and using the same array with if.bind', async function () {
        const { component, getAllBy } = createFixture(`<div if.bind="!!items.length">
            <p repeat.for="i of items">
              \${i} <button type="button" click.trigger="remove($index)">remove</button><br>
            </p>
          </div>
          <button click.trigger="add()">add</button>`, class App {
            constructor() {
                this.items = [];
            }
            add() {
                this.items.push('item');
            }
            remove(i) {
                this.items.splice(i, 1);
            }
        });
        assert.strictEqual(getAllBy('p').length, 0);
        component.add();
        runTasks();
        assert.strictEqual(getAllBy('p').length, 1);
        component.remove(0);
        runTasks();
        assert.strictEqual(getAllBy('p').length, 0);
        component.add();
        runTasks();
        assert.strictEqual(getAllBy('p').length, 1);
    });
});
//# sourceMappingURL=repeater-if-else.spec.js.map