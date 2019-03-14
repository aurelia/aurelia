import { customElement } from '@aurelia/runtime';

@customElement({ name: 'cancel', template: `<template>THE BIG BOARD! <input></template>` })
export class Cancel {

  public async canEnter() {
    return false;
  }
}
