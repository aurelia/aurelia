import { customElement } from '../../../../../../runtime';

@customElement({ name: 'about', template: `<template>ABOUT [\${id}] <input></template>` })
export class About {
  static parameters = ['id'];

  public id: string = 'no id provided';

  enter(parameters, instruction) {
    console.log('enter', parameters, instruction);
    if (parameters.id) {
      this.id = parameters.id;
    }
  }
}
