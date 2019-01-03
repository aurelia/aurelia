import { customElement } from '@aurelia/runtime';
import { wait } from '../utils';

@customElement({ name: 'board', template: `<template>THE BIG BOARD! <input></template>` })
export class Board {

  public async enter() {
    return wait(5000);
  }
}
