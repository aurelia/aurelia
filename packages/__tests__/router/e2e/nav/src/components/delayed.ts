import { customElement } from '@aurelia/runtime';
import { wait } from '../utils';

@customElement({ name: 'delayed', template: `<template>A test, just ignore <input></template>` })
export class Delayed {

  public async enter() {
    return wait(5000);
  }
}
