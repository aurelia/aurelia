import { Runner, Step } from '@aurelia/router';
import { assert } from '@aurelia/testing';
const createTimedPromise = (value, time, previousValue, reject = false) => {
    return new Promise((res, rej) => {
        // console.log(`(promise ${value})`);
        setTimeout(() => {
            // console.log(value, `(${previousValue})`);
            if (reject) {
                rej(`REJECTED ${value}`);
            }
            else {
                res(value);
            }
        }, time);
    });
};
describe('Runner', function () {
    this.timeout(30000);
    const oneTests = [
        { step: 1, result: 1 },
        { step: 'one', result: 'one' },
        { step: () => 'one', result: 'one' },
        { step: createTimedPromise('one', 100), result: 'one' },
        { step: createTimedPromise(createTimedPromise('two', 100), 100), result: 'two' },
        { step: createTimedPromise(createTimedPromise(() => 'three', 100), 100), result: 'three' },
        { step: () => createTimedPromise(createTimedPromise(() => 'four', 100), 100), result: 'four' },
    ];
    for (let i = 0; i < oneTests.length; i++) {
        const test = oneTests[i];
        it(`runs one "${test.step}" => "${test.result}"`, function () {
            const result = Runner.run(null, test.step);
            if (result instanceof Promise) {
                return result.then(resolved => {
                    // TODO: Should this be added to the runner?
                    while (resolved instanceof Function) {
                        resolved = resolved();
                    }
                    assert.strictEqual(resolved, test.result, `#${i}`);
                }).catch(err => { throw err; });
            }
            else {
                assert.strictEqual(result, test.result, `#${i}`);
            }
        });
    }
    for (let i = 0; i < oneTests.length; i++) {
        const test = oneTests[i];
        it(`runs 'callback' "${test.step}" => "${test.result}"`, function () {
            Runner.run(null, test.step, (step) => {
                let resolved = step.previousValue;
                // TODO: Should this be added to the runner?
                while (resolved instanceof Function) {
                    resolved = resolved();
                }
                assert.strictEqual(resolved, test.result, `#${i} !`);
            });
        });
    }
    const tests = [
        {
            steps: [
                (step) => `one (${step.previousValue})`,
                (step) => `two (${step.previousValue})`,
                (step) => createTimedPromise(`three (${step.previousValue})`, 2000),
                (step) => createTimedPromise(`four (${step.previousValue})`, 1000),
            ],
            result: 'four (three (two (one (undefined))))',
            cancelled: 'two (one (undefined))',
            results: ['one (undefined)', 'two (undefined)', 'three (undefined)', 'four (undefined)'],
        },
        {
            steps: [
                (step) => createTimedPromise(`four (${step.previousValue})`, 1000),
                (step) => createTimedPromise(`three (${step.previousValue})`, 2000),
                (step) => `two (${step.previousValue})`,
                (step) => `one (${step.previousValue})`,
            ],
            result: 'one (two (three (four (undefined))))',
            cancelled: 'four (undefined)',
            results: ['four (undefined)', 'three (undefined)', 'two (undefined)', 'one (undefined)'],
        },
    ];
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        it(`runs sequence ${test.steps} => ${test.result}`, async function () {
            const stepsPromise = Runner.run(null, ...test.steps);
            await stepsPromise.then(result => {
                assert.strictEqual(result, test.result, `#${i}`);
            });
        });
    }
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        it(`cancels sequence ${test.steps} => ${test.cancelled}`, async function () {
            const stepsPromise = Runner.run(null, ...test.steps);
            setTimeout(() => {
                Runner.cancel(stepsPromise);
            }, 1500);
            await stepsPromise.then(_result => {
                // assert.strictEqual(result, test.cancelled, `#${i}`);
                assert.strictEqual('fulfilled', 'cancelled', `#${i}`);
            }).catch(err => {
                if (err instanceof Error) {
                    throw err;
                }
                assert.strictEqual('cancelled', 'cancelled', `#${i}`);
            });
        });
    }
    // it(`allows waiting for cancel`, function () {
    //   const stepsPromise = Runner.run(null,
    //     () => { console.log('one'); },
    //     (step) => {
    //       return new Promise<void>(res => {
    //         setTimeout(() => {
    //           console.log(`two (${step.previousValue})`);
    //           res();
    //         }, 2000);
    //       })
    //     },
    //     (step) => { console.log(`three (${step.previousValue})`); },
    //   ) as Promise<unknown>;
    //   setTimeout(() => {
    //     Runner.cancel(stepsPromise);
    //   }, 1500);
    //   stepsPromise.then(_result => {
    //     console.log('fulfilled');
    //     assert.strictEqual('fulfilled', 'cancelled', ``);
    //   }).catch(err => {
    //     if (err instanceof Error) {
    //       throw err;
    //     }
    //     console.log('cancelled');
    //     assert.strictEqual('cancelled', 'cancelled', ``);
    //   });
    // });
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        it(`runs all ${test.steps} => ${test.results}`, async function () {
            const stepsPromise = Runner.runParallel(null, ...test.steps);
            await stepsPromise.then((results) => {
                assert.strictEqual(results.join(','), test.results.join(','), `#${i}`);
            });
        });
    }
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const single = i < 1 ? 2 : 1;
        it(`runs all on single ${test.steps[single]} => ${test.results[single]}`, async function () {
            const stepsPromise = Runner.runParallel(null, test.steps[single]);
            await stepsPromise.then((results) => {
                assert.strictEqual(results.join(','), test.results.slice(single, single + 1).join(','), `#${i}`);
            });
        });
    }
    for (const connected of [false, true]) {
        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            it(`runs all one step down${connected ? ' connected' : ''} ${test.steps} => ${test.results}`, async function () {
                const stepsPromise = Runner.run(null, (step) => `before: ${step.previousValue}`, (step) => Runner.runParallel(connected ? step : null, ...test.steps), (step) => `after: ${step.previousValue.join(',')}`);
                await stepsPromise.then((result) => {
                    const expected = test.results.map(r => connected ? r.replace('(', '(before: ') : r).join(',');
                    assert.strictEqual(result, `after: ${expected}`, `#${i}`);
                });
            });
        }
    }
    it(`doesn't add ticks`, async function () {
        class Controller {
            constructor(name, children = [], connected = true, bindingTiming = 1, boundTiming = 1) {
                this.name = name;
                this.children = children;
                this.connected = connected;
                this.bindingTiming = bindingTiming;
                this.boundTiming = boundTiming;
            }
            activate(caller = null, state = null) {
                this.log(`activate.enter [${caller === null || caller === void 0 ? void 0 : caller.id}] [${state}]`);
                return Runner.run(this.connected ? caller : null, () => `${state}:${this.name}.activate`, (step) => this.binding(step, step.previousValue), (step) => this.bound(step, step.previousValue), (step) => {
                    switch (this.children.length) {
                        case 0:
                            return;
                        case 1:
                            return () => this.children[0].activate(step, step.previousValue);
                        default:
                            // return Promise.all(this.children.map(child => child.activate(step)));
                            // for (let child of this.children) {
                            //   child.activate(step);
                            // }
                            // return step.continue(Runner.run(step, () => { this.children.map(x => x.activate(step)); }));
                            // return Runner.run(this.connected ? step : void 0, ...this.children.map(x => (childStep: Step) => x.activate(childStep, childStep.previousValue as string)));
                            // console.log(this.connected ? 'CONNECTED' : 'not connected');
                            return Runner.runParallel(this.connected ? step : null, ...this.children.map(x => (childStep) => x.activate(childStep, childStep.previousValue)));
                    }
                }, () => { this.log(`activate.leave`); });
            }
            binding(caller, state) {
                this.log(`binding.enter(${this.bindingTiming}) [${caller === null || caller === void 0 ? void 0 : caller.id}] [${state}]`, '  ');
                return Runner.run(this.connected ? caller : null, () => wait(this.bindingTiming), // Promise.resolve(), // pretend this is a user hook return value
                () => { this.log(`binding.leave`, '  '); }, (_value) => `${state}:${this.name}.binding`);
            }
            bound(caller, state) {
                this.log(`bound.enter(${this.bindingTiming}) [${caller === null || caller === void 0 ? void 0 : caller.id}] [${state}]`, '  ');
                return Runner.run(this.connected ? caller : null, () => wait(this.boundTiming), // Promise.resolve(), // pretend this is a user hook return value
                () => { this.log(`bound.leave`, '  '); }, (_value) => `${state}:${this.name}.bound`);
            }
            log(msg, indent = '') {
                if (this.name.startsWith('parent')) {
                    indent += '    ';
                }
                else if (this.name.startsWith('child')) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    indent += '        ';
                }
                invocations.push(`${this.name}.${msg}`);
                // console.log(`>>> ${indent}${this.name}.${msg}`);
            }
        }
        let invocations = [];
        async function testIt(components, connected = true, defaults = [1, 1], timings = {}) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
            const root1 = new Controller('root', [
                new Controller('parent-1', [
                    new Controller('child-1.1', [], connected, ...((_a = timings['child-1.1']) !== null && _a !== void 0 ? _a : defaults)),
                    new Controller('child-1.2', [], connected, ...((_b = timings['child-1.2']) !== null && _b !== void 0 ? _b : defaults)),
                    new Controller('child-1.3', [], connected, ...((_c = timings['child-1.3']) !== null && _c !== void 0 ? _c : defaults)),
                    new Controller('child-1.4', [], connected, ...((_d = timings['child-1.4']) !== null && _d !== void 0 ? _d : defaults)),
                ], connected, ...((_e = timings['parent-1']) !== null && _e !== void 0 ? _e : defaults)),
                new Controller('parent-2', [
                    new Controller('child-2.1', [], connected, ...((_f = timings['child-2.1']) !== null && _f !== void 0 ? _f : defaults)),
                    new Controller('child-2.2', [], connected, ...((_g = timings['child-2.2']) !== null && _g !== void 0 ? _g : defaults)),
                    new Controller('child-2.3', [], connected, ...((_h = timings['child-2.3']) !== null && _h !== void 0 ? _h : defaults)),
                    new Controller('child-2.4', [], connected, ...((_j = timings['child-2.4']) !== null && _j !== void 0 ? _j : defaults)),
                ], connected, ...((_k = timings['parent-2']) !== null && _k !== void 0 ? _k : defaults)),
                new Controller('parent-3', [
                    new Controller('child-3.1', [], connected, ...((_l = timings['child-3.1']) !== null && _l !== void 0 ? _l : defaults)),
                    new Controller('child-3.2', [], connected, ...((_m = timings['child-3.2']) !== null && _m !== void 0 ? _m : defaults)),
                    new Controller('child-3.3', [], connected, ...((_o = timings['child-3.3']) !== null && _o !== void 0 ? _o : defaults)),
                    new Controller('child-3.4', [], connected, ...((_p = timings['child-3.4']) !== null && _p !== void 0 ? _p : defaults)),
                ], connected, ...((_q = timings['parent-3']) !== null && _q !== void 0 ? _q : defaults)),
                new Controller('parent-4', [
                    new Controller('child-4.1', [], connected, ...((_r = timings['child-4.1']) !== null && _r !== void 0 ? _r : defaults)),
                    new Controller('child-4.2', [], connected, ...((_s = timings['child-4.2']) !== null && _s !== void 0 ? _s : defaults)),
                    new Controller('child-4.3', [], connected, ...((_t = timings['child-4.3']) !== null && _t !== void 0 ? _t : defaults)),
                    new Controller('child-4.4', [], connected, ...((_u = timings['child-4.4']) !== null && _u !== void 0 ? _u : defaults)),
                ], connected, ...((_v = timings['parent-4']) !== null && _v !== void 0 ? _v : defaults)),
            ], connected, ...((_w = timings['root']) !== null && _w !== void 0 ? _w : defaults));
            let logTicks = true;
            switch (components) {
                case 3:
                    root1.children.pop();
                    root1.children.forEach(child => child.children.pop());
                    break;
                case 2:
                    root1.children.pop();
                    root1.children.pop();
                    root1.children.forEach(child => child.children.pop());
                    root1.children.forEach(child => child.children.pop());
                    break;
                case 1:
                    root1.children.pop();
                    root1.children.pop();
                    root1.children.pop();
                    root1.children.forEach(child => child.children.pop());
                    root1.children.forEach(child => child.children.pop());
                    root1.children.forEach(child => child.children.pop());
                    break;
            }
            invocations = [];
            const activate = root1.activate(null, 'start');
            const title = `ticks: #TICKS#; components: ${components}; ${connected ? 'connected' : 'not connected'}; defaults: [${defaults.join(',')}]; ` +
                `timings: ${Object.keys(timings).map(key => `${key}: [${timings[key].join(',')}]; `)}`;
            // const done = `>>> DONE. ${title}`;
            // const done = `${`>>> DONE. ticks: #TICKS#; components: ${components}; ${connected ? 'connected' : 'not connected'}; defaults: [${defaults.join(',')}]; ` +
            //   `timings: `}${Object.keys(timings).map(key => `${key}: [${timings[key].join(',')}]; `)}`;
            let ticks = 0;
            if (activate instanceof Promise) {
                activate.then(async () => {
                    logTicks = false;
                    // console.log(done.replace('#TICKS#', `${ticks}`));
                    Step.id = 0;
                    Runner.roots = {};
                    // const expected = getExpected(components, connected, defaults, timings);
                    const expected = InvocationNode.invocations(components, connected, defaults, timings);
                    verifyInvocations(invocations, expected, title.replace('#TICKS#', `${ticks}`));
                    await Promise.resolve();
                }).catch(err => { throw err; });
            }
            else {
                logTicks = false;
                // console.log(done.replace('#TICKS#', `${ticks}`));
                Step.id = 0;
                Runner.roots = {};
                // const expected = getExpected(components, connected, defaults, timings);
                const expected = InvocationNode.invocations(components, connected, defaults, timings);
                verifyInvocations(invocations, expected, title.replace('#TICKS#', `${ticks}`));
                await Promise.resolve();
            }
            (async function () {
                // let i = 0;
                while (logTicks) {
                    await Promise.resolve();
                    ++ticks;
                    // console.log(`>> tick(${ticks})`);
                    if (ticks >= 100) {
                        logTicks = false;
                        console.log(Runner.roots);
                    }
                }
            })().catch((err) => { throw err; });
            return activate;
        }
        // console.log(InvocationNode.invocations(2, true, [3, 3], { 'child-1.1': [1, 1] }));
        // TODO: Enabled tests for disconnected mode. The Runner is working, the tests aren't!
        for (const connected of [true]) { // true, false
            // await testIt(1, connected);
            await testIt(2, connected, [0, 0], { 'child-1.1': [0, 0] });
            await testIt(2, connected, [1, 1], { 'child-1.1': [1, 1] });
            await testIt(2, connected, [0, 0], { 'child-1.1': [1, 1] });
            await testIt(2, connected, [1, 1], { 'child-1.1': [0, 0] });
            await testIt(2, connected, [1, 1], { 'child-1.1': [2, 2] });
            await testIt(2, connected, [1, 1], { 'child-1.1': [3, 3] });
            await testIt(2, connected, [3, 3], { 'child-1.1': [1, 1] });
            await testIt(3, connected);
            await testIt(3, connected, [1, 1], { 'child-1.1': [3, 3], 'child-3.2': [0, 1] });
            await testIt(4, connected);
        }
        function wait(count) {
            if (count < 1) {
                return;
            }
            let i = 0;
            let resolve;
            const p = new Promise(r => {
                resolve = r;
            });
            const next = () => {
                if (++i < count) {
                    void Promise.resolve().then(next);
                }
                else {
                    resolve();
                }
            };
            next();
            return p;
            //   let i = -1;
            //   // console.log(`${_vm.name}.${name} enter async(${count})`, value);
            //   function next() {
            //     // if (i >= 0) {
            //     //   console.log(`${_vm.name}.${name} tick ${i + 1} async(${count})`, value);
            //     // }
            //     if (++i < count) {
            //       return Promise.resolve().then(next);
            //     }
            //     // console.log(`${_vm.name}.${name} leave async(${count})`, value);
            //   }
            //   return next();
        }
    });
});
function verifyInvocations(actual, expected, msg) {
    actual = actual
        .map(inv => inv.replace(/\(.*/, ''))
        .map(inv => inv.replace(/\s*\[.*/, ''));
    // console.log('actual', 'expected', actual, expected);
    assertInvocations(actual, expected, msg);
}
function assertInvocations(actual, expected, msg = '') {
    try {
        assert.deepStrictEqual(actual, expected);
        console.log(`%c INVOCATION ORDER OK: ${msg}`, `color: darkgreen;`);
    }
    catch (err) {
        console.log(`%c INVOCATION ORDER *NOT* OK: ${msg}`, `color: darkred;`);
        logOutcome(actual, // .filter(hook => !hook.startsWith('stop.')),
        expected);
        throw err;
    }
}
function logOutcome(actual, expected) {
    const outcome = [];
    let leftMax = 0;
    for (let i = 0, ii = Math.max(actual.length, expected.length); i < ii; i++) {
        // outcome.push(actual[i] !== expected[i] ? `${actual[i]} <-> ${expected[i]}` : actual[i]);
        const [left, right] = [actual[i], expected[i]];
        leftMax = Math.max((left !== null && left !== void 0 ? left : '').length, leftMax);
        outcome.push([left, right]);
    }
    for (const out of outcome) {
        const [left, right] = out;
        console.log(`%c ${left}`, `color: dark${left === right ? 'green' : 'red'}; padding-right: ${(leftMax - (left !== null && left !== void 0 ? left : '').length) / 2}em;`, ` ${right}`);
    }
}
class InvocationNode {
    constructor(name, children = [], connected = true, $timings = [0, 0]) {
        this.name = name;
        this.children = children;
        this.connected = connected;
        this.timings = new Map();
        this.parent = null;
        this.child = null;
        this.previous = null;
        this.next = null;
        this.isProcessed = false;
        this.isMoved = false;
        this.tick = 0;
        // this.timings.set('activate', connected ? 0 : 1); // TODO: This needs to check if there's an async in children!!
        this.timings.set('binding', $timings[0]);
        this.timings.set('bound', $timings[1]);
        this.children.forEach(child => child.parent = this);
        // const parts = invocation.split('.');
        // if (parts.length > 1) {
        //   this.action = parts.pop() as 'enter' | 'leave';
        //   this.method = parts.pop() as 'activate' | 'binding' | 'bound';
        // }
        // this.name = parts.join('.');
    }
    static invocations(components, connected = true, defaults = [1, 1], timings = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        const root = new InvocationNode('root', [
            new InvocationNode('parent-1', [
                new InvocationNode('child-1.1', [], connected, (_a = timings['child-1.1']) !== null && _a !== void 0 ? _a : defaults),
                new InvocationNode('child-1.2', [], connected, (_b = timings['child-1.2']) !== null && _b !== void 0 ? _b : defaults),
                new InvocationNode('child-1.3', [], connected, (_c = timings['child-1.3']) !== null && _c !== void 0 ? _c : defaults),
                new InvocationNode('child-1.4', [], connected, (_d = timings['child-1.4']) !== null && _d !== void 0 ? _d : defaults),
            ], connected, (_e = timings['parent-1']) !== null && _e !== void 0 ? _e : defaults),
            new InvocationNode('parent-2', [
                new InvocationNode('child-2.1', [], connected, (_f = timings['child-2.1']) !== null && _f !== void 0 ? _f : defaults),
                new InvocationNode('child-2.2', [], connected, (_g = timings['child-2.2']) !== null && _g !== void 0 ? _g : defaults),
                new InvocationNode('child-2.3', [], connected, (_h = timings['child-2.3']) !== null && _h !== void 0 ? _h : defaults),
                new InvocationNode('child-2.4', [], connected, (_j = timings['child-2.4']) !== null && _j !== void 0 ? _j : defaults),
            ], connected, (_k = timings['parent-2']) !== null && _k !== void 0 ? _k : defaults),
            new InvocationNode('parent-3', [
                new InvocationNode('child-3.1', [], connected, (_l = timings['child-3.1']) !== null && _l !== void 0 ? _l : defaults),
                new InvocationNode('child-3.2', [], connected, (_m = timings['child-3.2']) !== null && _m !== void 0 ? _m : defaults),
                new InvocationNode('child-3.3', [], connected, (_o = timings['child-3.3']) !== null && _o !== void 0 ? _o : defaults),
                new InvocationNode('child-3.4', [], connected, (_p = timings['child-3.4']) !== null && _p !== void 0 ? _p : defaults),
            ], connected, (_q = timings['parent-3']) !== null && _q !== void 0 ? _q : defaults),
            new InvocationNode('parent-4', [
                new InvocationNode('child-4.1', [], connected, (_r = timings['child-4.1']) !== null && _r !== void 0 ? _r : defaults),
                new InvocationNode('child-4.2', [], connected, (_s = timings['child-4.2']) !== null && _s !== void 0 ? _s : defaults),
                new InvocationNode('child-4.3', [], connected, (_t = timings['child-4.3']) !== null && _t !== void 0 ? _t : defaults),
                new InvocationNode('child-4.4', [], connected, (_u = timings['child-4.4']) !== null && _u !== void 0 ? _u : defaults),
            ], connected, (_v = timings['parent-4']) !== null && _v !== void 0 ? _v : defaults),
        ], connected, (_w = timings['root']) !== null && _w !== void 0 ? _w : defaults);
        switch (components) {
            case 3:
                root.children.pop();
                root.children.forEach(child => child.children.pop());
                break;
            case 2:
                root.children.pop();
                root.children.pop();
                root.children.forEach(child => child.children.pop());
                root.children.forEach(child => child.children.pop());
                break;
            case 1:
                root.children.pop();
                root.children.pop();
                root.children.pop();
                root.children.forEach(child => child.children.pop());
                root.children.forEach(child => child.children.pop());
                root.children.forEach(child => child.children.pop());
                break;
        }
        return root.report()
            .split(`\n`)
            .sort((a, b) => +a.split(':')[1] - +b.split(':')[1])
            .map(inv => inv.split(':')[0])
            .filter(inv => inv.length > 0);
    }
    get isAsync() {
        return this.timings.get('binding') > 0 || this.timings.get('bound') > 0;
    }
    get match() {
        return `${this.name}.${this.method}.`;
    }
    get invocation() {
        return `${this.name}.${this.method}.${this.action}`;
    }
    get isTick() {
        return this.name.startsWith('tick');
    }
    getTick(method, action) {
        // // If we've got a parent, we're either first child or in parallel...
        // const ticks = this.parent !== null
        //   //  ...so use parent tick
        //   ? this.parent.getTick('activate', 'enter')
        //   // Otherwise use previous tick
        //   : this.previous?.getTick('activate', 'leave') ?? 0;
        var _a, _b;
        const tick = action === 'leave' ? this.timings.get(method) : 0;
        switch (method) {
            case 'binding':
                return this.getTick('activate', 'enter') + tick;
            case 'bound':
                return this.getTick('binding', 'leave') + tick;
            case 'activate':
                switch (action) {
                    case 'enter':
                        return ((_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.getTick('bound', 'leave')) !== null && _b !== void 0 ? _b : 0) + tick;
                    case 'leave': // TODO: This needs to check if there's an async in children
                        if (this.children.length > 0) {
                            const maxChildTick = Math.max(0, ...this.children.map(child => child.getTick('activate', 'leave')));
                            return maxChildTick + (!this.connected && this.children.some(child => child.isAsync) ? 1 : 0);
                        }
                        else {
                            return this.getTick('bound', 'leave');
                        }
                }
        }
    }
    report() {
        return `${this.name}.activate.enter:${this.getTick('activate', 'enter')}\n` +
            `${this.name}.binding.enter:${this.getTick('binding', 'enter')}\n` +
            `${this.name}.binding.leave:${this.getTick('binding', 'leave')}\n` +
            `${this.name}.bound.enter:${this.getTick('bound', 'enter')}\n` +
            `${this.name}.bound.leave:${this.getTick('bound', 'leave')}\n` +
            `${this.children.map(child => child.report()).join('')}` +
            `${this.name}.activate.leave:${this.getTick('activate', 'leave')}\n`;
    }
}
//# sourceMappingURL=runner.spec.js.map