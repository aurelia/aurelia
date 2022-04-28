var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ConsoleSink, LoggerConfiguration } from '@aurelia/kernel';
import { customElement, ISignaler, valueConverter, Aurelia } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
describe('signaler.integration', function () {
    it('1 non-observed input and 2 observed inputs - toView', async function () {
        const ctx = TestContext.create();
        const tq = ctx.platform.domWriteQueue;
        ctx.container.register(LoggerConfiguration.create({ sinks: [ConsoleSink], level: 3 /* warn */ }));
        const au = new Aurelia(ctx.container);
        const host = ctx.createElement('div');
        let counter = 0;
        let AddValueConverter = class AddValueConverter {
            toView(input, factor) {
                return input + (++counter * factor);
            }
        };
        AddValueConverter = __decorate([
            valueConverter({ name: 'add' })
        ], AddValueConverter);
        let App = class App {
            constructor(signaler) {
                this.signaler = signaler;
                this.input = 0;
                this.factor = 1;
            }
            increment() {
                this.signaler.dispatchSignal('increment');
            }
        };
        App = __decorate([
            customElement({
                name: 'app',
                template: `\${input | add:factor & signal:'increment'}`,
                dependencies: [AddValueConverter],
            }),
            __param(0, ISignaler),
            __metadata("design:paramtypes", [Object])
        ], App);
        const component = au.container.get(App);
        au.app({ host, component });
        await au.start();
        assert.visibleTextEqual(host, '1', 'assert #1');
        assert.areTaskQueuesEmpty();
        component.increment();
        assert.visibleTextEqual(host, '1', 'assert #2');
        tq.flush();
        assert.visibleTextEqual(host, '2', 'assert #3');
        component.factor = 2;
        assert.visibleTextEqual(host, '2', 'assert #4');
        tq.flush();
        assert.visibleTextEqual(host, '6', 'assert #5');
        component.increment();
        assert.visibleTextEqual(host, '6', 'assert #6');
        tq.flush();
        assert.visibleTextEqual(host, '8', 'assert #7');
        component.input = 10;
        assert.visibleTextEqual(host, '8', 'assert #8');
        tq.flush();
        assert.visibleTextEqual(host, '20', 'assert #9');
        component.increment();
        assert.visibleTextEqual(host, '20', 'assert #10');
        tq.flush();
        assert.visibleTextEqual(host, '22', 'assert #11');
        await au.stop();
    });
    describe('array index assignment with repeater', function () {
        for (const expr of [
            `& signal:'updateItem'`,
            `& oneTime & signal:'updateItem'`,
            `& signal:'updateItem' & oneTime`,
        ]) {
            it(expr, async function () {
                const ctx = TestContext.create();
                const tq = ctx.platform.domWriteQueue;
                ctx.container.register(LoggerConfiguration.create({ $console: console, level: 3 /* warn */ }));
                const au = new Aurelia(ctx.container);
                const host = ctx.createElement('div');
                const items = [0, 1, 2];
                let App = class App {
                    constructor(signaler) {
                        this.signaler = signaler;
                        this.items = items;
                    }
                    updateItem() {
                        this.signaler.dispatchSignal('updateItem');
                    }
                };
                App = __decorate([
                    customElement({
                        name: 'app',
                        template: `<div repeat.for="i of 3">\${items[i] ${expr}}</div>`,
                    }),
                    __param(0, ISignaler),
                    __metadata("design:paramtypes", [Object])
                ], App);
                const component = au.container.get(App);
                au.app({ host, component });
                await au.start();
                assert.visibleTextEqual(host, '012', 'assert #1');
                assert.areTaskQueuesEmpty();
                items[0] = 2;
                assert.areTaskQueuesEmpty();
                component.updateItem();
                assert.visibleTextEqual(host, '012', 'assert #2');
                tq.flush();
                assert.visibleTextEqual(host, '212', 'assert #3');
                items[0] = 3;
                items[1] = 4;
                items[2] = 5;
                assert.areTaskQueuesEmpty();
                component.updateItem();
                assert.visibleTextEqual(host, '212', 'assert #3');
                tq.flush();
                assert.visibleTextEqual(host, '345', 'assert #4');
                items.reverse();
                assert.visibleTextEqual(host, '345', 'assert #5');
                if (expr.includes('oneTime')) {
                    tq.flush();
                    assert.visibleTextEqual(host, '345', 'assert #6');
                    component.updateItem();
                    assert.visibleTextEqual(host, '345', 'assert #7');
                    tq.flush();
                    assert.visibleTextEqual(host, '543', 'assert #8');
                }
                else {
                    tq.flush();
                    assert.visibleTextEqual(host, '543', 'assert #9');
                }
                items[1] = 6;
                assert.areTaskQueuesEmpty();
                component.updateItem();
                assert.visibleTextEqual(host, '543', 'assert #10');
                tq.flush();
                assert.visibleTextEqual(host, '563', 'assert #11');
                await au.stop();
            });
        }
    });
});
//# sourceMappingURL=signaler.integration.spec.js.map