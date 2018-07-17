/**
 * Usage
 * 100 iteration, 1 rotations: node bench/observers.js
 * 100 iterations, 10 rotation: node bench/observers.js 100 10
 * 10 iteration, 100 rotations: node bench/observers.js 10 100
 */

const V0 = { enableArrayObservation(){}, disableArrayObservation(){} };
//const V1 = require('../dist/runtime/binding/array-observation');
const V2 = require('../dist/runtime/binding/observers/array-observer');

const { Benchmark, Column } = require('./util');

const iterations = process.argv[2] || 100;
const rotations = process.argv[3] || 1;


const tests = [
  { op: 'push',    expr: 'push (observed, flush every 1)',     weight: 6,  imports: [V0, /*V1,*/ V2], flush: 1,  observe: true },
  { op: 'unshift', expr: 'unshift (observed, flush every 1)',  weight: 3,  imports: [V0, /*V1,*/ V2], flush: 1,  observe: true },
  { op: 'pop',     expr: 'pop (observed, flush every 1)',      weight: 6,  imports: [V0, /*V1,*/ V2], flush: 1,  observe: true },
  { op: 'shift',   expr: 'shift (observed, flush every 1)',    weight: 3,  imports: [V0, /*V1,*/ V2], flush: 1,  observe: true },
  { op: 'splice',  expr: 'splice (observed, flush every 1)',   weight: 3,  imports: [V0, /*V1,*/ V2], flush: 1,  observe: true },
  { op: 'reverse', expr: 'reverse (observed, flush every 1)',  weight: 3,  imports: [V0, /*V1,*/ V2], flush: 1,  observe: true },
  { op: 'sort',    expr: 'sort (observed, flush every 1)',     weight: 6,  imports: [V0, /*V1,*/ V2], flush: 1,  observe: true },
  { op: 'push',    expr: 'push (observed, flush every 5)',     weight: 6,  imports: [V0, /*V1,*/ V2], flush: 5,  observe: true },
  { op: 'unshift', expr: 'unshift (observed, flush every 5)',  weight: 3,  imports: [V0, /*V1,*/ V2], flush: 5,  observe: true },
  { op: 'pop',     expr: 'pop (observed, flush every 5)',      weight: 6,  imports: [V0, /*V1,*/ V2], flush: 5,  observe: true },
  { op: 'shift',   expr: 'shift (observed, flush every 5)',    weight: 3,  imports: [V0, /*V1,*/ V2], flush: 5,  observe: true },
  { op: 'splice',  expr: 'splice (observed, flush every 5)',   weight: 3,  imports: [V0, /*V1,*/ V2], flush: 5,  observe: true },
  { op: 'reverse', expr: 'reverse (observed, flush every 5)',  weight: 3,  imports: [V0, /*V1,*/ V2], flush: 5,  observe: true },
  { op: 'sort',    expr: 'sort (observed, flush every 5)',     weight: 6,  imports: [V0, /*V1,*/ V2], flush: 5,  observe: true },
  { op: 'push',    expr: 'push (observed, flush every 10)',    weight: 10, imports: [V0, /*V1,*/ V2], flush: 10, observe: true },
  { op: 'unshift', expr: 'unshift (observed, flush every 10)', weight: 5,  imports: [V0, /*V1,*/ V2], flush: 10, observe: true },
  { op: 'pop',     expr: 'pop (observed, flush every 10)',     weight: 10, imports: [V0, /*V1,*/ V2], flush: 10, observe: true },
  { op: 'shift',   expr: 'shift (observed, flush every 10)',   weight: 5,  imports: [V0, /*V1,*/ V2], flush: 10, observe: true },
  { op: 'splice',  expr: 'splice (observed, flush every 10)',  weight: 5,  imports: [V0, /*V1,*/ V2], flush: 10, observe: true },
  { op: 'reverse', expr: 'reverse (observed, flush every 10)', weight: 5,  imports: [V0, /*V1,*/ V2], flush: 10, observe: true },
  { op: 'sort',    expr: 'sort (observed, flush every 10)',    weight: 10, imports: [V0, /*V1,*/ V2], flush: 10, observe: true },
  { op: 'push',    expr: 'push',                               weight: 2,  imports: [V0, /*V1,*/ V2], flush: 0,  observe: false },
  { op: 'unshift', expr: 'unshift',                            weight: 1,  imports: [V0, /*V1,*/ V2], flush: 0,  observe: false },
  { op: 'pop',     expr: 'pop',                                weight: 2,  imports: [V0, /*V1,*/ V2], flush: 0,  observe: false },
  { op: 'shift',   expr: 'shift',                              weight: 1,  imports: [V0, /*V1,*/ V2], flush: 0,  observe: false },
  { op: 'splice',  expr: 'splice',                             weight: 1,  imports: [V0, /*V1,*/ V2], flush: 0,  observe: false },
  { op: 'reverse', expr: 'reverse',                            weight: 1,  imports: [V0, /*V1,*/ V2], flush: 0,  observe: false },
  { op: 'sort',    expr: 'sort',                               weight: 2,  imports: [V0, /*V1,*/ V2], flush: 0,  observe: false }
];

function run(iterations, dry) {
  const benchmark = new Benchmark([
    new Column('Weight', 8, 'left'),
    new Column('Operation', 40, 'left'),
    new Column('Nat', 12, 'right'),
    //new Column('v1', 12, 'right'),
    //new Column('Nat/v1', 9, 'right'),
    new Column('v2', 12, 'right'),
    new Column('Nat/v2', 9, 'right'),
    //new Column('v1/v2', 9, 'right')
  ], tests, 2, iterations, rotations);

  benchmark.writeHeader();

  let r = rotations;
  while (r--) {
    for (const { weight, imports, op, observe, flush } of tests) {
      benchmark.writeLineStart();

      for (const $import of imports) {
        let k = iterations * weight;
        const t = require('../dist/runtime/task-queue');
        const tq = new t.TaskQueue();
        let getObserver;
        let subscribe;
        let flush;
        /*if ($import === V1) {
          getObserver = $import.getArrayObserver.bind(null, tq);
          subscribe = (o, fn) => o.subscribe(fn);
          flush = o => tq.flushMicroTaskQueue();
        } else */if ($import === V2) {
          getObserver = $import.getArrayObserver.bind(null);
          subscribe = (o, fn) => o.subscribeBatched(fn);
          flush = o => o.flushChanges();
        } else {
          getObserver = () => {};
          subscribe = () => {};
          flush = () => {};
        }
        if (observe) {
          $import.enableArrayObservation();
        }
        let start;
        switch(op) {
          case 'push':
          {
            const arr = new Array();
            const o = getObserver(arr);
            subscribe(o, () => {});
            start = process.hrtime();
            while (k--) {
              arr.push({});
              if (k % flush === 0) {
                flush(o);
              }
            }
            break;
          }
          case 'unshift':
          {
            const arr = new Array();
            const o = getObserver(arr);
            subscribe(o, () => {});
            start = process.hrtime();
            while (k--) {
              arr.unshift({});
              if (k % flush === 0) {
                flush(o);
              }
            }
            break;
          }
          case 'pop':
          {
            const arr = new Array(k).fill({});
            const o = getObserver(arr);
            subscribe(o, () => {});
            start = process.hrtime();
            while (k--) {
              arr.pop();
              if (k % flush === 0) {
                flush(o);
              }
            }
            break;
          }
          case 'shift':
          {
            const arr = new Array(k).fill({});
            const o = getObserver(arr);
            subscribe(o, () => {});
            start = process.hrtime();
            while (k--) {
              arr.shift();
              if (k % flush === 0) {
                flush(o);
              }
            }
            break;
          }
          case 'splice':
          {
            const arr = new Array();
            const o = getObserver(arr);
            subscribe(o, () => {});
            start = process.hrtime();
            let i = 0;
            while (k--) {
              arr.splice(i++, 1, {}, {});
              if (k % flush === 0) {
                flush(o);
              }
            }
            break;
          }
          case 'reverse':
          {
            const arr = new Array(10).fill({});
            const o = getObserver(arr);
            subscribe(o, () => {});
            start = process.hrtime();
            while (k--) {
              arr.reverse();
              if (k % flush === 0) {
                flush(o);
              }
            }
            break;
          }
          case 'sort':
          {
            const arr = new Array(10).fill({});
            const o = getObserver(arr);
            subscribe(o, () => {});
            start = process.hrtime();
            while (k--) {
              arr.sort();
              if (k % flush === 0) {
                flush(o);
              }
            }
            break;
          }
        }

        const end = process.hrtime(start);
        benchmark.addResult(end);

        if (observe) {
          $import.disableArrayObservation();
        }
      }
    }

    benchmark.nextRotation();
  }
  benchmark.writeFooter();
}

run(iterations);
