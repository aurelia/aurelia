import { CustomElementResource } from '@aurelia/runtime';
import { State } from './state';

const MAX_LEVEL = 10;
const TEMPLATE =
`<template>
  <svg remove>
    <rect
      x='0'
      y='0'
      width='1'
      height='1'
      fill.bind='fill' />
    <g
      if.bind='renderLeft'
      as-element='pythagoras'
      level.bind='level + 1'
      transform.bind='state.leftTransform'></g>
    <g
      if.bind='renderRight'
      as-element='pythagoras'
      level.bind='level + 1'
      transform.bind='state.rightTransform'></g>
  </svg>
</template>`;

export class Pythagoras {

  constructor(state) {
    this.state = state;
    this.level = undefined;
    this.fill = '';
    this.renderLeft = this.renderRight = false;
  }

  bound() {
    this.renderLeft = this.renderRight = this.level < MAX_LEVEL;
    this.fill = memoizedViridis(this.level, MAX_LEVEL);
  }
}

Pythagoras.inject = [State];
CustomElementResource.define({
  name: 'pythagoras',
  template: (() => {
    const parser = document.createElement('div');
    parser.innerHTML = TEMPLATE;
    const template = parser.firstElementChild;
    const svg = template.content.firstElementChild;
    while (svg.firstChild) {
      template.content.appendChild(svg.firstChild);
    }
    svg.remove();
    template.remove();
    return template;
  })(),
  bindables: {
    level: { property: 'level', attribute: 'level' }
  }
}, Pythagoras);

const memoizedViridis = (() => {
  const memo = {};
  const key = (lvl, maxlvl) => `${lvl}_${maxlvl}`;
  return (lvl, maxlvl) => {
    const memoKey = key(lvl, maxlvl);
    if (memoKey in memo) {
      return memo[memoKey];
    } else {
      const random = Math.random().toString(16);
      return memo[memoKey] = `#${random.substring(random.length - 6)}`;
    }
  };
})();
