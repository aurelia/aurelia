import { IContainer } from '@aurelia/kernel';
import {
  bindable,
  customElement,
  valueConverter
} from '@aurelia/runtime-html';

@valueConverter('sort')
export class SortValueConverter {
  public toView(arr: unknown[], prop?: string, dir: 'asc' | 'desc' = 'asc'): unknown[] {
    if (Array.isArray(arr)) {
      const factor = dir === 'asc' ? 1 : -1;
      if (prop && prop.length) {
        arr.sort((a, b) => a[prop] - b[prop] * factor);
      } else {
        arr.sort((a, b) => a - b * factor);
      }
    }
    return arr;
  }
}

@valueConverter('json')
export class JsonValueConverter {
  public toView(input: unknown): string {
    return JSON.stringify(input);
  }
  public fromView(input: string): unknown {
    return JSON.parse(input);
  }
}

@customElement({
  name: 'name-tag',
  template: `<template>\${name}</template>`,
  needsCompile: true,
  dependencies: [],
  instructions: [],
  surrogates: []
})
class NameTag {

  @bindable()
  public name!: string;
}

const globalResources: any[] = [
  SortValueConverter,
  JsonValueConverter,
  NameTag
];

export const TestConfiguration = {
  register(container: IContainer) {
    container.register(...globalResources);
  }
};
