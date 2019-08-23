import { CustomElementResource, LifecycleFlags } from '@aurelia/runtime';
import { clock } from "./app";

export const Dot = CustomElementResource.define(
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
        >\${hover ? \`*\${text}*\` : text & priority:'low'}</template>`,
    bindables: ['x', 'y', 'size', 'text'],
  },
  class Dot {
    attached() {
      this.targetObserver = this.$controller.getTargetAccessor('textContent');
      this.$controller.lifecycle.enqueueRAF(this.tick, this, 0);
    }

    detached() {
      this.$controller.lifecycle.dequeueRAF(this.tick, this);
    }

    tick() {
      if (this.targetObserver != void 0) {
        this.targetObserver.setValue(clock.seconds, LifecycleFlags.fromBind);
      }
    }
  }
);

export const SierpinskiTriangle = CustomElementResource.define(
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
