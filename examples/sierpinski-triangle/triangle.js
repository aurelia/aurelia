import { CustomElement } from '@aurelia/runtime-html';
import { clock } from './app';

export const Dot = CustomElement.define(
  {
    name: 'dot',
    template:
      `<template css="
        position: absolute;
        font: normal 15px sans-serif;
        textAlign: center;
        cursor: pointer;
        width: \${size}px;
        height: \${size}px;
        left: \${x}px;
        top: \${y}px;
        border-radius: \${size / 2}px;
        line-height: \${size}px;
        background: \${hover ? '#ff0' : '#61dafb'};
        text-align: center;"
        mouseenter.trigger='hover = true'
        mouseleave.trigger='hover = false'
        >\${hover ? \`*\${clock.seconds}*\` : clock.seconds}</template>`,
    bindables: ['x', 'y', 'size', 'text'],
  },
  class Dot {
    constructor() {
      this.clock = clock;
    }
  }
);

export const SierpinskiTriangle = CustomElement.define(
  {
    name: 'sierpinski-triangle',
    dependencies: [
      Dot
    ],
    template:
      `<template>
        <div as-element='dot' if.bind='size < 25' x.bind='x - 25 / 2' y.bind='y - 25 / 2' size.bind='25'></div>
        <template else>
          <div as-element='sierpinski-triangle' x.bind='x' y.bind='y - (size / 4)' size.bind='size / 2'></div>
          <div as-element='sierpinski-triangle' x.bind='x - size / 2' y.bind='y + (size / 4)' size.bind='size / 2'></div>
          <div as-element='sierpinski-triangle' x.bind='x + size / 2' y.bind='y + (size / 4)' size.bind='size / 2'></div>
        </template>
      </template>`,
    bindables: ['x', 'y', 'size'],
  },
  class SierpinskiTriangle {

  }
);
