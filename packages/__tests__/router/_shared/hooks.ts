import { assert } from '@aurelia/testing';
import { interleave, prepend } from '../_hook-tests.spec';
import { HookName } from './hook-invocation-tracker';

export const addHooks: HookName[] = ['binding', 'afterBind', 'afterAttach', 'afterAttachChildren'];
export const removeHooks: HookName[] = ['beforeDetach', 'beforeUnbind', 'dispose'];

export function* getStartHooks(root: string) {
  yield `start.${root}.binding`;
  yield `start.${root}.afterBind`;
  yield `start.${root}.afterAttach`;
  yield `start.${root}.afterAttachChildren`;
}

export function* getStopHooks(root: string, p: string, c: string = '') {
  yield `stop.${root}.beforeDetach`;
  yield `stop.${root}.beforeUnbind`;

  if (p) { yield* prepend('stop', p, 'unload', 'beforeDetach', 'beforeUnbind'); }
  if (c) { yield* prepend('stop', c, 'unload', 'beforeDetach', 'beforeUnbind'); }
}

export function* getSingleHooks(deferUntil, swapStrategy, componentKind, phase, from, to) {
  if (from) { yield `${phase}.${from}.canUnload`; }
  if (to) { yield `${phase}.${to}.canLoad`; }
  if (from) { yield `${phase}.${from}.unload`; }
  if (to) { yield `${phase}.${to}.load`; }
  switch (swapStrategy) {
    case 'parallel-remove-first':
      switch (componentKind) {
        case 'all-async':
          yield* interleave(
            (function* () {
              if (from) { yield* prepend(phase, from, ...removeHooks); }
            })(),
            (function* () {
              if (to) { yield* prepend(phase, to, ...addHooks); }
            })(),
          );
          break;
        case 'all-sync':
          if (from) { yield* prepend(phase, from, ...removeHooks); }
          if (to) { yield* prepend(phase, to, ...addHooks); }
          break;
      }
      break;
    case 'sequential-remove-first':
      if (from) { yield* prepend(phase, from, ...removeHooks); }
      if (to) { yield* prepend(phase, to, ...addHooks); }
      break;
    case 'sequential-add-first':
      if (to) { yield* prepend(phase, to, ...addHooks); }
      if (from) { yield* prepend(phase, from, ...removeHooks); }
      break;
  }
}

export function* getParentChildHooks(deferUntil, swapStrategy, componentKind, phase, from, to) {
  /*
  const parentAdd = [...addHooks];
  const childAdd = [...addHooks];
  const parentRemove = [...removeHooks];
  const childRemove = [...removeHooks];

  if (from.c) { yield `${phase}.${from.c}.canUnload`; }
  if (from.p) { yield `${phase}.${from.p}.canUnload`; }
  yield `${phase}.${to.p}.canLoad`;

  if (deferUntil === 'load-hooks' || deferUntil === 'guard-hooks') {
    if (to.c) { yield `${phase}.${to.c}.canLoad`; }
  }

  if (from.c) { yield `${phase}.${from.c}.unload`; }
  if (from.p) { yield `${phase}.${from.p}.unload`; }
  yield `${phase}.${to.p}.load`;

  if (deferUntil === 'load-hooks') {
    if (to.c) { yield `${phase}.${to.c}.load`; }
  }

  switch (deferUntil) {
    case 'load-hooks':
      // // if (!swapStrategy.includes('parallel')) {
      // parentAdd.pop(); // afterAttachChildren
      // // }
      break;
    case 'guard-hooks':
      childAdd.unshift('load');
      // // if (!swapStrategy.includes('parallel')) {
      // parentAdd.pop(); // afterAttachChildren
      // // }
      // parentRemove.unshift('unload');
      break;
    case 'none':
      childAdd.unshift('canLoad', 'load');
      // parentRemove.unshift('canUnload', 'unload');
      break;
  }
  */

  const parentAdd: HookName[] = [...addHooks];
  const childAdd: HookName[] = ['canLoad', 'load', ...addHooks];
  const parentRemove: HookName[] = ['unload', ...removeHooks];
  const childRemove: HookName[] = [...removeHooks];

  if (from.c) { yield `${phase}.${from.c}.canUnload`; }
  if (from.p) { yield `${phase}.${from.p}.canUnload`; }

  if (to.p) { yield `${phase}.${to.p}.canLoad`; }

  if (deferUntil === 'load-hooks' || deferUntil === 'guard-hooks') {
    if (to.c) { yield `${phase}.${to.c}.canLoad`; }

    childAdd.shift();
  }

  if (from.c) { yield `${phase}.${from.c}.unload`; }

  if (from.p) { yield `${phase}.${from.p}.unload`; }

  parentRemove.shift();

  yield `${phase}.${to.p}.load`;

  if (deferUntil === 'load-hooks') {
    if (to.c) { yield `${phase}.${to.c}.load`; }

    childAdd.shift();
  }

  // switch (deferUntil) {
  //   case 'load-hooks':
  //     // // if (!swapStrategy.includes('parallel')) {
  //     // parentAdd.pop(); // afterAttachChildren
  //     // // }
  //     break;
  //   case 'guard-hooks':
  //     childAdd.unshift('load');
  //     // // if (!swapStrategy.includes('parallel')) {
  //     // parentAdd.pop(); // afterAttachChildren
  //     // // }
  //     // parentRemove.unshift('unload');
  //     break;
  //   case 'none':
  //     childAdd.unshift('canLoad', 'load');
  //     // parentRemove.unshift('canUnload', 'unload');
  //     break;
  // }

  switch (deferUntil) {
    case 'load-hooks':
      switch (swapStrategy) {
        case 'parallel-remove-first':
          switch (componentKind) {
            case 'all-async':
              if (from.p) {
                yield* interleave(
                  (function* () {
                    if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
                    yield* prepend(phase, from.p, ...parentRemove);
                  })(),
                  (function* () {
                    yield* prepend(phase, to.p, ...parentAdd);
                    if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
                  })(),
                );
              } else {
                yield* interleave(
                  (function* () {
                    yield* prepend(phase, to.p, ...parentAdd);
                  })(),
                  (function* () {
                    if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
                  })(),
                );
              }
              break;
            case 'all-sync':
              if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
              if (from.p) { yield* prepend(phase, from.p, ...parentRemove); }
              yield* prepend(phase, to.p, ...parentAdd);
              if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
              break;
          }
          break;
        case 'sequential-remove-first':
          switch (componentKind) {
            case 'all-async':
              if (from.p) {
                yield* interleave(
                  (function* () {
                    if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
                  })(),
                  (function* () {
                    if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
                  })(),
                );
                if (from.p) { yield* prepend(phase, from.p, ...parentRemove); }
                if (to.p) { yield* prepend(phase, to.p, ...parentAdd); }
              } else {
                yield* interleave(
                  (function* () {
                    yield* prepend(phase, to.p, ...parentAdd);
                  })(),
                  (function* () {
                    if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
                  })(),
                );
              }
              break;
            case 'all-sync':
              if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
              if (from.p) { yield* prepend(phase, from.p, ...parentRemove); }
              yield* prepend(phase, to.p, ...parentAdd);
              if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
              break;
          }
          break;
        case 'sequential-add-first':
          switch (componentKind) {
            case 'all-async':
              if (from.p) {
                yield* interleave(
                  (function* () {
                    if (to.p) { yield* prepend(phase, to.p, ...parentAdd); }
                  })(),
                  (function* () {
                    if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
                  })(),
                );
                if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
                if (from.p) { yield* prepend(phase, from.p, ...parentRemove); }
              } else {
                yield* interleave(
                  (function* () {
                    yield* prepend(phase, to.p, ...parentAdd);
                  })(),
                  (function* () {
                    if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
                  })(),
                );
              }
              break;
            case 'all-sync':
              yield* prepend(phase, to.p, ...parentAdd);
              if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
              if (from.p) { yield* prepend(phase, from.p, ...parentRemove); }
              if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
              break;
          }
          break;
      }
      break;
    case 'guard-hooks':
      switch (swapStrategy) {
        case 'parallel-remove-first':
          // if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
          switch (componentKind) {
            case 'all-async':
              if (from.p) {
                yield* interleave(
                  (function* () {
                    if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
                    yield* prepend(phase, from.p, ...parentRemove);
                  })(),
                  (function* () {
                    // prepend(phase, from.p, ...parentRemove),
                    yield* prepend(phase, to.p, ...parentAdd);
                    if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
                  })(),
                );
                // if (from.c) { yield* prepend(phase, from.p, ...parentRemove); }
                // x: yield `${phase}.${to.p}.afterAttachChildren`;
              } else {
                yield* interleave(
                  (function* () {
                    yield* prepend(phase, to.p, ...parentAdd);
                  })(),
                  (function* () {
                    if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
                    // x: yield `${phase}.${to.p}.afterAttachChildren`;
                  })(),
                );
              }
              // if (from.c) { yield* prepend(phase, from.c, ...childRemove); }

              // yield* interleave(
              //   (function* () {
              //     if (from.p) { yield* prepend(phase, from.p, ...parentRemove); }
              //   })(),
              //   (function* () {
              //     yield* prepend(phase, to.p, ...parentAdd);
              //     if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
              //     yield `${phase}.${to.p}.afterAttachChildren`;
              //   })(),
              // );
              break;
            case 'all-sync':
              if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
              if (from.p) { yield* prepend(phase, from.p, ...parentRemove); }
              yield* prepend(phase, to.p, ...parentAdd);
              if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
              // x: yield `${phase}.${to.p}.afterAttachChildren`;
              break;
          }
          break;
        case 'sequential-remove-first':
          switch (componentKind) {
            case 'all-async':
              if (from.p) {
                yield* interleave(
                  (function* () {
                    if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
                  })(),
                  (function* () {
                    if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
                  })(),
                );
                if (from.p) { yield* prepend(phase, from.p, ...parentRemove); }
                if (to.p) { yield* prepend(phase, to.p, ...parentAdd); }
              } else {
                yield* interleave(
                  (function* () {
                    yield* prepend(phase, to.p, ...parentAdd);
                  })(),
                  (function* () {
                    if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
                  })(),
                );
              }
              break;
            case 'all-sync':
              if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
              if (from.p) { yield* prepend(phase, from.p, ...parentRemove); }
              yield* prepend(phase, to.p, ...parentAdd);
              if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
              // x: yield `${phase}.${to.p}.afterAttachChildren`;
              break;
          }
          break;
        case 'sequential-add-first':
          switch (componentKind) {
            case 'all-async':
              if (from.p) {
                yield* interleave(
                  (function* () {
                    if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
                  })(),
                  (function* () {
                    if (to.p) { yield* prepend(phase, to.p, ...parentAdd); }
                  })(),
                );
                if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
                if (from.p) { yield* prepend(phase, from.p, ...parentRemove); }
              } else {
                yield* interleave(
                  (function* () {
                    yield* prepend(phase, to.p, ...parentAdd);
                  })(),
                  (function* () {
                    if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
                  })(),
                );
              }
              break;
            case 'all-sync':
              yield* prepend(phase, to.p, ...parentAdd);
              if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
              if (from.p) { yield* prepend(phase, from.p, ...parentRemove); }
              if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
              // x: yield `${phase}.${to.p}.afterAttachChildren`;
              break;
          }
          break;
      }
      break;
    case 'none':
      switch (swapStrategy) {
        case 'parallel-remove-first':
          // if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
          switch (componentKind) {
            case 'all-async':
              if (from.p) {
                yield* interleave(
                  from.c ? prepend(phase, from.c, ...childRemove) : prepend(phase, from.p, ...parentRemove), // getNothing(),
                  // prepend(phase, from.p, ...parentRemove),
                  prepend(phase, to.p, ...parentAdd),
                );
                if (from.c) { yield* prepend(phase, from.p, ...parentRemove); }
              } else {
                yield* prepend(phase, to.p, ...parentAdd);
              }
              // if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
              if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
              break;
            case 'all-sync':
              if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
              if (from.p) { yield* prepend(phase, from.p, ...parentRemove); }
              yield* prepend(phase, to.p, ...parentAdd);
              if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
              break;
          }
          break;
        case 'sequential-remove-first':
          if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
          if (from.p) { yield* prepend(phase, from.p, ...parentRemove); }
          yield* prepend(phase, to.p, ...parentAdd);
          if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
          break;
        case 'sequential-add-first':
          yield* prepend(phase, to.p, ...parentAdd);
          if (from.c) { yield* prepend(phase, from.c, ...childRemove); }
          if (from.p) { yield* prepend(phase, from.p, ...parentRemove); }
          if (to.c) { yield* prepend(phase, to.c, ...childAdd); }
          break;
      }
      break;
  }
}

// switch (deferUntil) {

//   case 'none':
//     switch (swapStrategy) {
//       case 'parallel-remove-first':
//         if (from.c) { yield* prepend(phase, from.c, ...removeHooks); }
//         switch (componentKind) {
//           case 'all-async':
//             yield* interleave(
//               prepend(phase, from.p, ...removeHooks),
//               prepend(phase, to.p, ...addHooks),
//             );
//             if (to.c) { yield* prepend(phase, to.c, 'canLoad', 'load', ...addHooks); }
//             break;
//           case 'all-sync':
//             yield* prepend(phase, from.p, ...removeHooks);
//             yield* prepend(phase, to.p, ...addHooks);
//             if (to.c) { yield* prepend(phase, to.c, 'canLoad', 'load', ...addHooks); }
//             break;
//         }
//         break;
//       case 'sequential-remove-first':
//         if (from.c) { yield* prepend(phase, from.c, ...removeHooks); }
//         yield* prepend(phase, from.p, ...removeHooks);
//         yield* prepend(phase, to.p, ...addHooks);
//         if (to.c) { yield* prepend(phase, to.c, 'canLoad', 'load', ...addHooks); }
//         break;
//       case 'sequential-add-first':
//         yield* prepend(phase, to.p, ...addHooks);
//         if (to.c) { yield* prepend(phase, to.c, 'canLoad', 'load', ...addHooks); }
//         if (from.c) { yield* prepend(phase, from.c, ...removeHooks); }
//         yield* prepend(phase, from.p, ...removeHooks);
//         break;
//     }
//     break;

//   case 'guard-hooks':
//     switch (swapStrategy) {
//       case 'parallel-remove-first':
//         if (from.c) { yield* prepend(phase, from.c, ...removeHooks); }
//         switch (componentKind) {
//           case 'all-async':
//             yield* interleave(
//               (function* () {
//                 yield* prepend(phase, from.p, ...removeHooks);
//               })(),
//               (function* () {
//                 yield* prepend(phase, to.p, 'binding', 'afterBind', 'afterAttach');
//                 if (to.c) { yield* prepend(phase, to.c, 'load', ...addHooks); }
//                 yield `${phase}.${to.p}.afterAttachChildren`;
//               })(),
//             );
//             break;
//           case 'all-sync':
//             yield* prepend(phase, from.p, ...removeHooks);
//             yield* prepend(phase, to.p, 'binding', 'afterBind', 'afterAttach');
//             if (to.c) { yield* prepend(phase, to.c, 'load', ...addHooks); }
//             yield `${phase}.${to.p}.afterAttachChildren`;
//             break;
//         }
//         break;
//       case 'sequential-remove-first':
//         if (from.c) { yield* prepend(phase, from.c, ...removeHooks); }
//         yield* prepend(phase, from.p, ...removeHooks);
//         yield* prepend(phase, to.p, 'binding', 'afterBind', 'afterAttach');
//         if (to.c) { yield* prepend(phase, to.c, 'load', ...addHooks); }
//         yield `${phase}.${to.p}.afterAttachChildren`;
//         break;
//       case 'sequential-add-first':
//         yield* prepend(phase, to.p, 'binding', 'afterBind', 'afterAttach');
//         if (to.c) { yield* prepend(phase, to.c, 'load', ...addHooks); }
//         yield `${phase}.${to.p}.afterAttachChildren`;
//         if (from.c) { yield* prepend(phase, from.c, ...removeHooks); }
//         yield* prepend(phase, from.p, ...removeHooks);
//         break;
//     }
//     break;

//   case 'load-hooks':
//     switch (swapStrategy) {
//       case 'parallel-remove-first':
//         if (from.c) { yield* prepend(phase, from.c, ...removeHooks); }
//         switch (componentKind) {
//           case 'all-async':
//             yield* interleave(
//               (function* () {
//                 yield* prepend(phase, from.p, ...removeHooks);
//               })(),
//               (function* () {
//                 yield* prepend(phase, to.p, 'binding', 'afterBind', 'afterAttach');
//                 if (to.c) { yield* prepend(phase, to.c, ...addHooks); }
//                 yield `${phase}.${to.p}.afterAttachChildren`;
//               })(),
//             );
//             break;
//           case 'all-sync':
//             yield* prepend(phase, from.p, ...removeHooks);
//             yield* prepend(phase, to.p, 'binding', 'afterBind', 'afterAttach');
//             if (to.c) { yield* prepend(phase, to.c, ...addHooks); }
//             yield `${phase}.${to.p}.afterAttachChildren`;
//             break;
//         }
//         break;
//       case 'sequential-remove-first':
//         if (from.c) { yield* prepend(phase, from.c, ...removeHooks); }
//         yield* prepend(phase, from.p, ...removeHooks);
//         yield* prepend(phase, to.p, 'binding', 'afterBind', 'afterAttach');
//         if (to.c) { yield* prepend(phase, to.c, ...addHooks); }
//         yield `${phase}.${to.p}.afterAttachChildren`;
//         break;
//       case 'sequential-add-first':
//         yield* prepend(phase, to.p, 'binding', 'afterBind', 'afterAttach');
//         if (to.c) { yield* prepend(phase, to.c, ...addHooks); }
//         yield `${phase}.${to.p}.afterAttachChildren`;
//         if (from.c) { yield* prepend(phase, from.c, ...removeHooks); }
//         yield* prepend(phase, from.p, ...removeHooks);
//         break;
//     }
//     break;
// }

function* getNothing() { /* return nothing */ }

export function assertHooks(actual: any, expected: any): void {
  try {
    assert.deepStrictEqual(
      actual.filter(hook => !hook.startsWith('stop.')),
      expected.filter(hook => !hook.startsWith('stop.'))
    );
  } catch (err) {
    logOutcome(
      actual.filter(hook => !hook.startsWith('stop.')),
      expected.filter(hook => !hook.startsWith('stop.')),
      'HOOK OUTCOME'
    );
    throw err;
  }
}

function logOutcome(actual: any, expected: any, msg: any): any {
  const outcome = [];
  let leftMax = 0;
  for (let i = 0, ii = Math.max(actual.length, expected.length); i < ii; i++) {
    // outcome.push(actual[i] !== expected[i] ? `${actual[i]} <-> ${expected[i]}` : actual[i]);
    const [left, right] = [actual[i], expected[i]];
    leftMax = Math.max((left ?? '').length, leftMax);
    outcome.push([left, right]);
  }
  console.log(msg);
  for (const out of outcome) {
    const [left, right] = out;
    console.log(`%c ${left}`, `color: dark${left === right ? 'green' : 'red'}; padding-right: ${(leftMax - (left ?? '').length) / 2}em;`, ` ${right}`);
  }
}
