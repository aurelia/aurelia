/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { HookName } from './hook-invocation-tracker.js';
import { ITestRouteViewModel } from './view-models.js';

export interface IHookSpec<T extends HookName> {
  name: T;
  type: string;
  ticks: number;
  invoke(
    vm: ITestRouteViewModel,
    getValue: () => ReturnType<ITestRouteViewModel[T]>,
  ): ReturnType<ITestRouteViewModel[T]>;
}

function getHookSpecs<T extends HookName>(name: T) {
  return {
    sync: {
      name,
      type: 'sync',
      ticks: 0,
      invoke(_vm, getValue) {
        return getValue();
      },
    } as IHookSpec<T>,
    async(count: number) {
      return {
        name,
        type: `async${count}`,
        ticks: count,
        invoke(_vm, getValue) {
          const value = getValue();
          let i = -1;
          function next() {
            if (++i < count) {
              return Promise.resolve().then(next);
            }
            return value;
          }
          return next();
        },
      } as IHookSpec<T>;
    },
  };
}

export const hookSpecsMap = {
  binding: getHookSpecs('binding'),
  bound: getHookSpecs('bound'),
  attaching: getHookSpecs('attaching'),
  attached: getHookSpecs('attached'),

  detaching: getHookSpecs('detaching'),
  unbinding: getHookSpecs('unbinding'),

  dispose: getHookSpecs('dispose').sync,

  canLoad: getHookSpecs('canLoad'),
  load: getHookSpecs('load'),
  canUnload: getHookSpecs('canUnload'),
  unload: getHookSpecs('unload'),
};

function groupByPrefix(list: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (let i = 0; i < list.length; ++i) {
    const item = list[i];
    const prefix = item.slice(0, item.indexOf('.'));
    (groups[prefix] ??= []).push(item);
  }
  return groups;
}

export function verifyInvocationsEqual(actual: string[], expected: string[]): void {
  const errors: string[] = [];
  const expectedGroups = groupByPrefix(expected);
  const actualGroups = groupByPrefix(actual);
  for (const prefix in expectedGroups) {
    expected = expectedGroups[prefix];
    actual = actualGroups[prefix] ?? [];
    const len = Math.max(actual.length, expected.length);
    for (let i = 0; i < len; ++i) {
      const $actual = actual[i];
      const $expected = expected[i];
      if ($actual === $expected) {
        errors.push(`    OK : ${$actual}`);
      } else {
        errors.push(`NOT OK : ${$actual} (expected: ${$expected})`);
      }
    }
  }
  if (errors.some(e => e.startsWith('N'))) {
    throw new Error(`Failed assertion: invocation mismatch\n  - ${errors.join('\n  - ')})`);
  }
}
