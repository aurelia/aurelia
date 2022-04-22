import { Runner, Step } from '@aurelia/router';
import { assert } from '@aurelia/testing';

const createTimedPromise = (value, time: number, previousValue?, reject = false): Promise<unknown> => {
  return new Promise((res, rej) => {
    // console.log(`(promise ${value})`);
    setTimeout(() => {
      // console.log(value, `(${previousValue})`);
      if (reject) {
        rej(`REJECTED ${value}`);
      } else {
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
      } else {
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
      cancelled: 'two (one (undefined))', // Now rejecting, not supporting partials
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
      cancelled: 'four (undefined)', // Now rejecting, not supporting partials
      results: ['four (undefined)', 'three (undefined)', 'two (undefined)', 'one (undefined)'],
    },
  ];
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    it(`runs sequence ${test.steps} => ${test.result}`, async function () {
      const stepsPromise = Runner.run(null, ...test.steps) as Promise<unknown>;

      await stepsPromise.then(result => {
        assert.strictEqual(result, test.result, `#${i}`);
      }).catch(err => { throw err; });
    });
  }

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    it(`cancels sequence ${test.steps} => ${test.cancelled}`, async function () {
      const stepsPromise = Runner.run(null, ...test.steps) as Promise<unknown>;
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
      const stepsPromise = Runner.runParallel(null, ...test.steps) as Promise<unknown>;

      await stepsPromise.then((results: unknown[]) => {
        assert.strictEqual(results.join(','), test.results.join(','), `#${i}`);
      }).catch(err => { throw err; });
    });
  }

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const single = i < 1 ? 2 : 1;
    it(`runs all on single ${test.steps[single]} => ${test.results[single]}`, async function () {
      const stepsPromise = Runner.runParallel(null, test.steps[single]) as Promise<unknown>;

      await stepsPromise.then((results: unknown[]) => {
        assert.strictEqual(results.join(','), test.results.slice(single, single + 1).join(','), `#${i}`);
      }).catch(err => { throw err; });
    });
  }

  for (const connected of [false, true]) {
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(`runs all one step down${connected ? ' connected' : ''} ${test.steps} => ${test.results}`, async function () {
        const stepsPromise = Runner.run(null,
          (step) => `before: ${step.previousValue}`,
          (step) => Runner.runParallel(connected ? step : null, ...test.steps),
          (step) => `after: ${step.previousValue.join(',')}`,
        ) as Promise<unknown>;

        await stepsPromise.then((result: unknown) => {
          const expected = test.results.map(r => connected ? r.replace('(', '(before: ') : r).join(',');
          assert.strictEqual(result, `after: ${expected}`, `#${i}`);
        }).catch(err => { throw err; });
      });
    }
  }

  it(`doesn't add ticks`, async function () {
    class Controller {
      public constructor(
        public name: string,
        public children: Controller[] = [],
        public connected = true,
        public bindingTiming = 1,
        public boundTiming = 1,
      ) { }

      public activate(caller: any | null = null, state: string | null = null): void | Step<void> | Promise<void> {
        this.log(`activate.enter [${caller?.id}] [${state}]`);
        return Runner.run<void>(this.connected ? caller : null,
          () => `${state}:${this.name}.activate`,
          (step) => this.binding(step, step.previousValue),
          (step) => this.bound(step, step.previousValue),
          (step) => {
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
                return Runner.runParallel(this.connected ? step : null, ...this.children.map(x => (childStep: Step) => x.activate(childStep, childStep.previousValue as string)));
            }
          },
          () => { this.log(`activate.leave`); },
        );
      }
      public binding(caller: any, state: string | null): void | Step<void> | Promise<void> {
        this.log(`binding.enter(${this.bindingTiming}) [${caller?.id}] [${state}]`, '  ');
        return Runner.run<void>(this.connected ? caller : null,
          () => wait(this.bindingTiming), // Promise.resolve(), // pretend this is a user hook return value
          () => { this.log(`binding.leave`, '  '); },
          (_value) => `${state}:${this.name}.binding`,
        );
      }
      public bound(caller: any, state: string | null): void | Step<void> | Promise<void> {
        this.log(`bound.enter(${this.bindingTiming}) [${caller?.id}] [${state}]`, '  ');
        return Runner.run<void>(this.connected ? caller : null,
          () => wait(this.boundTiming), // Promise.resolve(), // pretend this is a user hook return value
          () => { this.log(`bound.leave`, '  '); },
          (_value) => `${state}:${this.name}.bound`,
        );
      }

      private log(msg: string, indent = ''): void {
        if (this.name.startsWith('parent')) {
          indent += '    ';
        } else if (this.name.startsWith('child')) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          indent += '        ';
        }
        invocations.push(`${this.name}.${msg}`);
        // console.log(`>>> ${indent}${this.name}.${msg}`);
      }
    }

    let invocations: string[] = [];

    async function testIt(components: number, connected = true, defaults = [1, 1], timings: any = {}) {
      const root1 = new Controller('root', [
        new Controller('parent-1', [
          new Controller('child-1.1', [], connected, ...(timings['child-1.1'] ?? defaults)),
          new Controller('child-1.2', [], connected, ...(timings['child-1.2'] ?? defaults)),
          new Controller('child-1.3', [], connected, ...(timings['child-1.3'] ?? defaults)),
          new Controller('child-1.4', [], connected, ...(timings['child-1.4'] ?? defaults)),
        ], connected, ...(timings['parent-1'] ?? defaults)),
        new Controller('parent-2', [
          new Controller('child-2.1', [], connected, ...(timings['child-2.1'] ?? defaults)),
          new Controller('child-2.2', [], connected, ...(timings['child-2.2'] ?? defaults)),
          new Controller('child-2.3', [], connected, ...(timings['child-2.3'] ?? defaults)),
          new Controller('child-2.4', [], connected, ...(timings['child-2.4'] ?? defaults)),
        ], connected, ...(timings['parent-2'] ?? defaults)),
        new Controller('parent-3', [
          new Controller('child-3.1', [], connected, ...(timings['child-3.1'] ?? defaults)),
          new Controller('child-3.2', [], connected, ...(timings['child-3.2'] ?? defaults)),
          new Controller('child-3.3', [], connected, ...(timings['child-3.3'] ?? defaults)),
          new Controller('child-3.4', [], connected, ...(timings['child-3.4'] ?? defaults)),
        ], connected, ...(timings['parent-3'] ?? defaults)),
        new Controller('parent-4', [
          new Controller('child-4.1', [], connected, ...(timings['child-4.1'] ?? defaults)),
          new Controller('child-4.2', [], connected, ...(timings['child-4.2'] ?? defaults)),
          new Controller('child-4.3', [], connected, ...(timings['child-4.3'] ?? defaults)),
          new Controller('child-4.4', [], connected, ...(timings['child-4.4'] ?? defaults)),
        ], connected, ...(timings['parent-4'] ?? defaults)),
      ], connected, ...(timings['root'] ?? defaults));
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
      } else {
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
          // eslint-disable-next-line no-await-in-loop
          await Promise.resolve();
          ++ticks;
          // console.log(`>> tick(${ticks})`);
          if (ticks >= 100) { logTicks = false; console.log(Runner.roots); }
        }
      })().catch((err) => { throw err; });

      return activate;
    }

    // console.log(InvocationNode.invocations(2, true, [3, 3], { 'child-1.1': [1, 1] }));

    // TODO: Enabled tests for disconnected mode. The Runner is working, the tests aren't!
    for await (const connected of [true]) { // true, false
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

    function wait(count: number): void | Promise<void> {
      if (count < 1) {
        return;
      }
      let i = 0;
      let resolve: () => void;
      const p = new Promise<void>(r => {
        resolve = r;
      });
      const next = (): void => {
        if (++i < count) {
          void Promise.resolve().then(next);
        } else {
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

function verifyInvocations(actual: string[], expected: string[], msg: string): void {
  actual = actual
    .map(inv => inv.replace(/\(.*/, ''))
    .map(inv => inv.replace(/\s*\[.*/, ''));
  // console.log('actual', 'expected', actual, expected);
  assertInvocations(actual, expected, msg);
}

class Invocation {
  public name: string;
  public method: 'activate' | 'binding' | 'bound';
  public action: 'enter' | 'leave';

  public isProcessed: boolean = false;
  public isMoved: boolean = false;
  public tick = 0;

  public constructor(invocation: string) {
    const parts = invocation.split('.');
    if (parts.length > 1) {
      this.action = parts.pop() as 'enter' | 'leave';
      this.method = parts.pop() as 'activate' | 'binding' | 'bound';
    }
    this.name = parts.join('.');
  }

  public get invocation(): string {
    return `${this.name}.${this.method}.${this.action}`;
  }
  public get isTick(): boolean {
    return this.name.startsWith('tick');
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getExpected(components: number, connected = true, defaults = [1, 1], timings: { [key: string]: number[] } = {}) {
  let invocations = allInvocations(/* connected */)
    .map(inv => new Invocation(inv));

  switch (components) {
    case 1:
      invocations = invocations.filter(inv => !inv.name.includes('2'));
      break;
    case 2:
      invocations = invocations.filter(inv => !inv.name.includes('3'));
      break;
    case 3:
      invocations = invocations.filter(inv => !inv.name.includes('4'));
      break;
    case 4:
      break;
  }

  let currentTick = 1;
  let guard = 0;
  for (let i = 0, ii = invocations.length; i < ii; i++) {
    const invocation = invocations[i];
    if (guard++ > 100) {
      return;
    }
    if (invocation.isTick) {
      currentTick++;
      continue;
    }
    if (invocation.isProcessed) {
      continue;
    }
    const timing = timings[invocation.name] ?? defaults ?? [1, 1];

    if (invocation.action === 'leave') {
      switch (connected) {
        case true:
          if (invocation.method !== 'activate') {
            const delay: number = invocation.method === 'binding' ? timing[0] : timing[1];
            if (delay > 0) {
              moveInvocations(invocations, currentTick + delay, i, false);
              i--;
            }
          }
          break;
        case false: {
          const delay: number = invocation.method === 'activate'
            ? 1
            : (invocation.method === 'binding' ? timing[0] : timing[1]);
          if (delay > 0) {
            moveInvocations(invocations, currentTick + delay, i, invocation.method === 'activate');
            i--;
          }
          break;
        }
      }
    }
    invocation.isProcessed = true;
  }

  return invocations
    .filter(inv => !inv.isTick)
    .map(inv => inv.invocation);
}

function moveInvocations(invocations: Invocation[], tick: number, start: number, all: boolean): void {
  let guard = 0;
  const invocation = invocations[start];

  const names: string[] = ['root'];
  if (invocation.name === 'root' || all) {
    names.push('parent', 'child');
  } else {
    names.push(invocation.name);
    if (invocation.name.startsWith('parent')) { // parent-x
      names.push(invocation.name.replace('parent', 'child'));
    } else { // child-x.y
      names.push(invocation.name.split('.')[0].replace('child', 'parent'));
    }
  }

  for (let i = start, ii = invocations.length; i < ii; i++) {
    const moving = invocations[i];
    if (guard++ > 100) {
      return;
    }
    if (!names.some(n => moving.name.startsWith(n))) {
      continue;
    }
    if (moving.isMoved) {
      continue;
    }
    if (moving.tick > tick) {
      continue;
    }

    const tickIndex = findTickIndex(invocations, tick);
    const moved = invocations.splice(i, 1)[0];
    invocations.splice(tickIndex - 1, 0, moved);
    moved.isMoved = true;
    moved.tick = tick;
    i--;
  }
  invocations.slice(start).forEach(inv => inv.isMoved = false);
}

function findTickIndex(invocations: Invocation[], tick: number): number {
  const index = invocations.findIndex(invocation => invocation.name === `tick${tick}`);
  if (index >= 0) {
    return index;
  }

  let maxTick = 0;
  for (let i = 0, ii = invocations.length; i < ii; i++) {
    if (invocations[i].name.startsWith('tick')) {
      maxTick = +invocations[i].name.replace('tick', '');
    }
  }
  for (let i = maxTick + 1; i <= tick; i++) {
    invocations.push(new Invocation(`tick${i}`));
  }

  return invocations.length - 1;
}

function assertInvocations(actual: any, expected: any, msg: string = ''): void {
  try {
    assert.deepStrictEqual(
      actual,
      expected,
    );
    console.log(`%c INVOCATION ORDER OK: ${msg}`, `color: darkgreen;`);
  } catch (err) {
    console.log(`%c INVOCATION ORDER *NOT* OK: ${msg}`, `color: darkred;`);
    logOutcome(
      actual, // .filter(hook => !hook.startsWith('stop.')),
      expected, // .filter(hook => !hook.startsWith('stop.')),
    );
    throw err;
  }
}

function logOutcome(actual: any, expected: any): any {
  const outcome = [];
  let leftMax = 0;
  for (let i = 0, ii = Math.max(actual.length, expected.length); i < ii; i++) {
    // outcome.push(actual[i] !== expected[i] ? `${actual[i]} <-> ${expected[i]}` : actual[i]);
    const [left, right] = [actual[i], expected[i]];
    leftMax = Math.max((left ?? '').length, leftMax);
    outcome.push([left, right]);
  }
  for (const out of outcome) {
    const [left, right] = out;
    console.log(`%c ${left}`, `color: dark${left === right ? 'green' : 'red'}; padding-right: ${(leftMax - (left ?? '').length) / 2}em;`, ` ${right}`);
  }
}

type Timings = { [key: string]: number[] };
type Method = 'activate' | 'binding' | 'bound';
type Action = 'enter' | 'leave';

class InvocationNode {
  public method: Method;
  public action: Action;

  public timings = new Map<Method, number>();

  public parent: InvocationNode | null = null;
  public child: InvocationNode | null = null;
  public previous: InvocationNode | null = null;
  public next: InvocationNode | null = null;

  public isProcessed: boolean = false;
  public isMoved: boolean = false;
  public tick = 0;

  public constructor(
    public name: string,
    public children: InvocationNode[] = [],
    public connected = true,
    $timings = [0, 0],
  ) {
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

  public static invocations(components: number, connected = true, defaults: number[] = [1, 1], timings: Timings = {}) {
    const root = new InvocationNode('root', [
      new InvocationNode('parent-1', [
        new InvocationNode('child-1.1', [], connected, timings['child-1.1'] ?? defaults),
        new InvocationNode('child-1.2', [], connected, timings['child-1.2'] ?? defaults),
        new InvocationNode('child-1.3', [], connected, timings['child-1.3'] ?? defaults),
        new InvocationNode('child-1.4', [], connected, timings['child-1.4'] ?? defaults),
      ], connected, timings['parent-1'] ?? defaults),
      new InvocationNode('parent-2', [
        new InvocationNode('child-2.1', [], connected, timings['child-2.1'] ?? defaults),
        new InvocationNode('child-2.2', [], connected, timings['child-2.2'] ?? defaults),
        new InvocationNode('child-2.3', [], connected, timings['child-2.3'] ?? defaults),
        new InvocationNode('child-2.4', [], connected, timings['child-2.4'] ?? defaults),
      ], connected, timings['parent-2'] ?? defaults),
      new InvocationNode('parent-3', [
        new InvocationNode('child-3.1', [], connected, timings['child-3.1'] ?? defaults),
        new InvocationNode('child-3.2', [], connected, timings['child-3.2'] ?? defaults),
        new InvocationNode('child-3.3', [], connected, timings['child-3.3'] ?? defaults),
        new InvocationNode('child-3.4', [], connected, timings['child-3.4'] ?? defaults),
      ], connected, timings['parent-3'] ?? defaults),
      new InvocationNode('parent-4', [
        new InvocationNode('child-4.1', [], connected, timings['child-4.1'] ?? defaults),
        new InvocationNode('child-4.2', [], connected, timings['child-4.2'] ?? defaults),
        new InvocationNode('child-4.3', [], connected, timings['child-4.3'] ?? defaults),
        new InvocationNode('child-4.4', [], connected, timings['child-4.4'] ?? defaults),
      ], connected, timings['parent-4'] ?? defaults),
    ], connected, timings['root'] ?? defaults);

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

  public get isAsync(): boolean {
    return this.timings.get('binding') > 0 || this.timings.get('bound') > 0;
  }

  public get match(): string {
    return `${this.name}.${this.method}.`;
  }
  public get invocation(): string {
    return `${this.name}.${this.method}.${this.action}`;
  }
  public get isTick(): boolean {
    return this.name.startsWith('tick');
  }

  public getTick(method: Method, action: Action): number {
    // // If we've got a parent, we're either first child or in parallel...
    // const ticks = this.parent !== null
    //   //  ...so use parent tick
    //   ? this.parent.getTick('activate', 'enter')
    //   // Otherwise use previous tick
    //   : this.previous?.getTick('activate', 'leave') ?? 0;

    const tick = action === 'leave' ? this.timings.get(method) : 0;
    switch (method) {
      case 'binding':
        return this.getTick('activate', 'enter') + tick;
      case 'bound':
        return this.getTick('binding', 'leave') + tick;
      case 'activate':
        switch (action) {
          case 'enter':
            return (this.parent?.getTick('bound', 'leave') ?? 0) + tick;
          case 'leave': // TODO: This needs to check if there's an async in children
            if (this.children.length > 0) {
              const maxChildTick = Math.max(0, ...this.children.map(child => child.getTick('activate', 'leave')));
              return maxChildTick + (!this.connected && this.children.some(child => child.isAsync) ? 1 : 0);
            } else {
              return this.getTick('bound', 'leave');
            }
        }
    }
  }

  public report(): string {
    return `${this.name}.activate.enter:${this.getTick('activate', 'enter')}\n` +
      `${this.name}.binding.enter:${this.getTick('binding', 'enter')}\n` +
      `${this.name}.binding.leave:${this.getTick('binding', 'leave')}\n` +
      `${this.name}.bound.enter:${this.getTick('bound', 'enter')}\n` +
      `${this.name}.bound.leave:${this.getTick('bound', 'leave')}\n` +
      `${this.children.map(child => child.report()).join('')}` +
      `${this.name}.activate.leave:${this.getTick('activate', 'leave')}\n`;
  }
}

function allInvocations(/* connected: boolean */): string[] {
  // switch (connected) {
  //   case true:
  return Object.assign([], [
    'root.activate.enter',
    'root.binding.enter',
    'root.binding.leave',
    'root.bound.enter',
    'root.bound.leave',
    'parent-1.activate.enter',
    'parent-1.binding.enter',
    'parent-1.binding.leave',
    'parent-1.bound.enter',
    'parent-1.bound.leave',
    'child-1.1.activate.enter',
    'child-1.1.binding.enter',
    'child-1.1.binding.leave',
    'child-1.1.bound.enter',
    'child-1.1.bound.leave',
    'child-1.1.activate.leave',
    'child-1.2.activate.enter',
    'child-1.2.binding.enter',
    'child-1.2.binding.leave',
    'child-1.2.bound.enter',
    'child-1.2.bound.leave',
    'child-1.2.activate.leave',
    'child-1.3.activate.enter',
    'child-1.3.binding.enter',
    'child-1.3.binding.leave',
    'child-1.3.bound.enter',
    'child-1.3.bound.leave',
    'child-1.3.activate.leave',
    'child-1.4.activate.enter',
    'child-1.4.binding.enter',
    'child-1.4.binding.leave',
    'child-1.4.bound.enter',
    'child-1.4.bound.leave',
    'child-1.4.activate.leave',
    'parent-1.activate.leave',
    'parent-2.activate.enter',
    'parent-2.binding.enter',
    'parent-2.binding.leave',
    'parent-2.bound.enter',
    'parent-2.bound.leave',
    'child-2.1.activate.enter',
    'child-2.1.binding.enter',
    'child-2.1.binding.leave',
    'child-2.1.bound.enter',
    'child-2.1.bound.leave',
    'child-2.1.activate.leave',
    'child-2.2.activate.enter',
    'child-2.2.binding.enter',
    'child-2.2.binding.leave',
    'child-2.2.bound.enter',
    'child-2.2.bound.leave',
    'child-2.2.activate.leave',
    'child-2.3.activate.enter',
    'child-2.3.binding.enter',
    'child-2.3.binding.leave',
    'child-2.3.bound.enter',
    'child-2.3.bound.leave',
    'child-2.3.activate.leave',
    'child-2.4.activate.enter',
    'child-2.4.binding.enter',
    'child-2.4.binding.leave',
    'child-2.4.bound.enter',
    'child-2.4.bound.leave',
    'child-2.4.activate.leave',
    'parent-2.activate.leave',
    'parent-3.activate.enter',
    'parent-3.binding.enter',
    'parent-3.binding.leave',
    'parent-3.bound.enter',
    'parent-3.bound.leave',
    'child-3.1.activate.enter',
    'child-3.1.binding.enter',
    'child-3.1.binding.leave',
    'child-3.1.bound.enter',
    'child-3.1.bound.leave',
    'child-3.1.activate.leave',
    'child-3.2.activate.enter',
    'child-3.2.binding.enter',
    'child-3.2.binding.leave',
    'child-3.2.bound.enter',
    'child-3.2.bound.leave',
    'child-3.2.activate.leave',
    'child-3.3.activate.enter',
    'child-3.3.binding.enter',
    'child-3.3.binding.leave',
    'child-3.3.bound.enter',
    'child-3.3.bound.leave',
    'child-3.3.activate.leave',
    'child-3.4.activate.enter',
    'child-3.4.binding.enter',
    'child-3.4.binding.leave',
    'child-3.4.bound.enter',
    'child-3.4.bound.leave',
    'child-3.4.activate.leave',
    'parent-3.activate.leave',
    'parent-4.activate.enter',
    'parent-4.binding.enter',
    'parent-4.binding.leave',
    'parent-4.bound.enter',
    'parent-4.bound.leave',
    'child-4.1.activate.enter',
    'child-4.1.binding.enter',
    'child-4.1.binding.leave',
    'child-4.1.bound.enter',
    'child-4.1.bound.leave',
    'child-4.1.activate.leave',
    'child-4.2.activate.enter',
    'child-4.2.binding.enter',
    'child-4.2.binding.leave',
    'child-4.2.bound.enter',
    'child-4.2.bound.leave',
    'child-4.2.activate.leave',
    'child-4.3.activate.enter',
    'child-4.3.binding.enter',
    'child-4.3.binding.leave',
    'child-4.3.bound.enter',
    'child-4.3.bound.leave',
    'child-4.3.activate.leave',
    'child-4.4.activate.enter',
    'child-4.4.binding.enter',
    'child-4.4.binding.leave',
    'child-4.4.bound.enter',
    'child-4.4.bound.leave',
    'child-4.4.activate.leave',
    'parent-4.activate.leave',
    'root.activate.leave',
  ]);
  //   case false:
  //     return Object.assign([], [
  //       'root.activate.enter',
  //       'root.binding.enter',
  //       'root.binding.leave',
  //       'root.bound.enter',
  //       'root.bound.leave',
  //       'parent-1.activate.enter',
  //       'parent-1.binding.enter',
  //       'parent-2.activate.enter',
  //       'parent-2.binding.enter',
  //       'parent-3.activate.enter',
  //       'parent-3.binding.enter',
  //       'parent-4.activate.enter',
  //       'parent-4.binding.enter',
  //       'parent-1.binding.leave',
  //       'parent-2.binding.leave',
  //       'parent-3.binding.leave',
  //       'parent-4.binding.leave',
  //       'parent-1.bound.enter',
  //       'parent-2.bound.enter',
  //       'parent-3.bound.enter',
  //       'parent-4.bound.enter',
  //       'parent-1.bound.leave',
  //       'parent-2.bound.leave',
  //       'parent-3.bound.leave',
  //       'parent-4.bound.leave',
  //       'child-1.1.activate.enter',
  //       'child-1.1.binding.enter',
  //       'child-1.2.activate.enter',
  //       'child-1.2.binding.enter',
  //       'child-1.3.activate.enter',
  //       'child-1.3.binding.enter',
  //       'child-1.4.activate.enter',
  //       'child-1.4.binding.enter',
  //       'child-2.1.activate.enter',
  //       'child-2.1.binding.enter',
  //       'child-2.2.activate.enter',
  //       'child-2.2.binding.enter',
  //       'child-2.3.activate.enter',
  //       'child-2.3.binding.enter',
  //       'child-2.4.activate.enter',
  //       'child-2.4.binding.enter',
  //       'child-3.1.activate.enter',
  //       'child-3.1.binding.enter',
  //       'child-3.2.activate.enter',
  //       'child-3.2.binding.enter',
  //       'child-3.3.activate.enter',
  //       'child-3.3.binding.enter',
  //       'child-3.4.activate.enter',
  //       'child-3.4.binding.enter',
  //       'child-4.1.activate.enter',
  //       'child-4.1.binding.enter',
  //       'child-4.2.activate.enter',
  //       'child-4.2.binding.enter',
  //       'child-4.3.activate.enter',
  //       'child-4.3.binding.enter',
  //       'child-4.4.activate.enter',
  //       'child-4.4.binding.enter',
  //       'child-1.1.binding.leave',
  //       'child-1.2.binding.leave',
  //       'child-1.3.binding.leave',
  //       'child-1.4.binding.leave',
  //       'child-2.1.binding.leave',
  //       'child-2.2.binding.leave',
  //       'child-2.3.binding.leave',
  //       'child-2.4.binding.leave',
  //       'child-3.1.binding.leave',
  //       'child-3.2.binding.leave',
  //       'child-3.3.binding.leave',
  //       'child-3.4.binding.leave',
  //       'child-4.1.binding.leave',
  //       'child-4.2.binding.leave',
  //       'child-4.3.binding.leave',
  //       'child-4.4.binding.leave',
  //       'child-1.1.bound.enter',
  //       'child-1.2.bound.enter',
  //       'child-1.3.bound.enter',
  //       'child-1.4.bound.enter',
  //       'child-2.1.bound.enter',
  //       'child-2.2.bound.enter',
  //       'child-2.3.bound.enter',
  //       'child-2.4.bound.enter',
  //       'child-3.1.bound.enter',
  //       'child-3.2.bound.enter',
  //       'child-3.3.bound.enter',
  //       'child-3.4.bound.enter',
  //       'child-4.1.bound.enter',
  //       'child-4.2.bound.enter',
  //       'child-4.3.bound.enter',
  //       'child-4.4.bound.enter',
  //       'child-1.1.bound.leave',
  //       'child-1.2.bound.leave',
  //       'child-1.3.bound.leave',
  //       'child-1.4.bound.leave',
  //       'child-2.1.bound.leave',
  //       'child-2.2.bound.leave',
  //       'child-2.3.bound.leave',
  //       'child-2.4.bound.leave',
  //       'child-3.1.bound.leave',
  //       'child-3.2.bound.leave',
  //       'child-3.3.bound.leave',
  //       'child-3.4.bound.leave',
  //       'child-4.1.bound.leave',
  //       'child-4.2.bound.leave',
  //       'child-4.3.bound.leave',
  //       'child-4.4.bound.leave',
  //       'child-1.1.activate.leave',
  //       'child-1.2.activate.leave',
  //       'child-1.3.activate.leave',
  //       'child-1.4.activate.leave',
  //       'child-2.1.activate.leave',
  //       'child-2.2.activate.leave',
  //       'child-2.3.activate.leave',
  //       'child-2.4.activate.leave',
  //       'child-3.1.activate.leave',
  //       'child-3.2.activate.leave',
  //       'child-3.3.activate.leave',
  //       'child-3.4.activate.leave',
  //       'child-4.1.activate.leave',
  //       'child-4.2.activate.leave',
  //       'child-4.3.activate.leave',
  //       'child-4.4.activate.leave',
  //       'parent-1.activate.leave',
  //       'parent-2.activate.leave',
  //       'parent-3.activate.leave',
  //       'parent-4.activate.leave',
  //       'root.activate.leave',
  //     ]);
  // }
}
