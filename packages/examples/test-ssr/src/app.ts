import { customElement } from '@aurelia/runtime';

@customElement({
  name: 'app',
  template: 
  `<template>
    <h1>\${message}</h1>
  </template>`
})
export class App {

  message: string;

  constructor(url: string) {
    this.message = url;
  }
}
