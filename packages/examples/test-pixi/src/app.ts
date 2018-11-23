
import { customElement } from '@aurelia/runtime-pixi';

@customElement({
  name: 'app',
  template:
  `<template>
    <container>
      <button
        click.trigger="decrement('x')">-</button>
      <button
        x.bind='40'
        click.trigger="increment('x')">+</button>
      <text
        x.bind='80'
        text="X: \${x}"></text>
    </container>
    <b
      x.bind='x'
      y.bind='40'
      text.bind="message"
      click.trigger="randomMessage()"></b>
  </template>`
})
export class App {
  message = 'Hello world';
  x = 10

  increment() {
    this.x += 5;
  }

  decrement() {
    this.x = Math.max(0, this.x - 5);
  }

  randomMessage() {
    return Math.random();
  }
}
