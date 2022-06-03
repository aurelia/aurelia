import {
  CustomElement,
  SVGAnalyzerRegistration,
} from '@aurelia/runtime-html';
import {
  assert,
  createFixture,
  PLATFORM,
  TestContext
} from '@aurelia/testing';
import { Registration } from '@aurelia/kernel';

describe('3-runtime-html/template-compiler.test-apps.spec.ts', function () {
  it('renders fractal tree', async function () {
    if (PLATFORM.navigator.userAgent.includes('jsdom')) {
      return;
    }

    const ctx = TestContext.create();
    const state = new State();
    Registration.instance(State, state).register(ctx.container);
    ctx.container.register(SVGAnalyzerRegistration, createPythagorasElement());

    const { startPromise, appHost, component, tearDown } = createFixture(
      `<div style='height: 50px;' css='max-width: \${width}px;'>
        <label>Count: \${totalNodes}</label>
      </div>
      <div style='width: 100%; height: calc(100% - 50px);' mousemove.trigger='onMouseMove($event)'>
        <svg>
          <g as-element='pythagoras' level.bind='0' css='transform: \${baseTransform}'></g>
        </svg>
      </div>`,
      class App {
        public static get inject() {
          return [State];
        }

        public state: State;
        public totalNodes: number;
        public baseTransform: string;

        public constructor($state: State) {
          this.state = $state || state;
          const base = state.baseSize;
          this.totalNodes = 2 ** (MAX_LEVEL + 1) - 1;
          this.baseTransform = `translate(50%, 100%) translate(-${base / 2}px, 0) scale(${base}, ${-base})`;
        }

        public onMouseMove({ clientX, clientY }: { clientX: number; clientY: number }) {
          this.state.mouseMoved(clientX, clientY);
        }
      },
      [],
      true,
      ctx
    );

    await startPromise;

    const expectedNodeCount = /* MAX_LEVEL = 6 > 2 ** 7 - 1 nodes */ 2 ** 7 - 1;
    let gNodes = appHost.querySelectorAll('svg g');
    assert.strictEqual(gNodes.length, expectedNodeCount, 'should have rendered 127 <g/>');
    gNodes.forEach((g, idx) => {
      assert.equal(g.getAttribute('transform'), idx === 0 ? null : '');
    });

    component.onMouseMove({ clientX: 50, clientY: 50 });
    ctx.platform.domWriteQueue.flush();

    gNodes = appHost.querySelectorAll('svg g');
    assert.strictEqual(gNodes.length, expectedNodeCount, 'should have rendered 127 <g/>');
    gNodes.forEach(g => {
      assert.notEqual(g.getAttribute('transform'), '');
    });

    await tearDown();
  });

  const MAX_LEVEL = 6;
  const BASE_SIZE = 100;
  const DEGREES = 180 / Math.PI;

  class State {
    public baseSize: number;
    public leftTransform: string;
    public rightTransform: string;

    public constructor() {
      this.leftTransform = '';
      this.rightTransform = '';

      this.baseSize = BASE_SIZE;
    }

    public mouseMoved(x: number, y: number) {
      const height = window.innerHeight;
      const width = window.innerWidth;
      this.update(1 - y / height, x / width);
    }

    public update(ratioH: number, ratioW: number) {
      const h = 0.8 * ratioH;
      const h2 = h * h;
      const l = 0.01 + 0.98 * ratioW;
      const r = 1 - l;
      const leftScale = Math.sqrt(h2 + l * l);
      const rightScale = Math.sqrt(h2 + r * r);
      const leftRotation = Math.atan2(h, l) * DEGREES;
      const rightRotation = -Math.atan2(h, r) * DEGREES;
      this.leftTransform = `translate(0, 1) scale(${leftScale}) rotate(${leftRotation})`;
      this.rightTransform = `translate(${1 - rightScale}, 1) scale(${rightScale}) rotate(${rightRotation} 1 0)`;
    }
  }

  function createPythagorasElement() {
    const TEMPLATE =
    `<template>
      <svg remove>
        <rect
          x='0'
          y='0'
          width='1'
          height='1'
          fill.bind='fill'></rect>
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

    const memoizedViridis = (() => {
      const memo = {};
      const key = (lvl: number, maxlvl: number) => `${lvl}_${maxlvl}`;
      return (lvl: number, maxlvl: number) => {
        const memoKey = key(lvl, maxlvl);
        if (memoKey in memo) {
          return memo[memoKey];
        } else {
          const random = Math.random().toString(16);
          return memo[memoKey] = `#${random.substring(random.length - 6)}`;
        }
      };
    })();

    return CustomElement.define(
      {
        name: 'pythagoras',
        template: (() => {
          const parser = PLATFORM.document.createElement('div');
          parser.innerHTML = TEMPLATE;
          const template = parser.firstElementChild as HTMLTemplateElement;
          const svg = template.content.firstElementChild;
          while (svg.firstChild) {
            template.content.appendChild(svg.firstChild);
          }
          svg.remove();
          template.remove();
          return template;
        })(),
        bindables: ['level'],
      },
      class Pythagoras {
        public static get inject() {
          return [State];
        }

        public level: number;
        public fill: string;
        public renderLeft: boolean;
        public renderRight: boolean;

        public constructor(public state: State) {
          this.level = undefined;
          this.fill = '';
          this.renderLeft = this.renderRight = false;
        }

        public binding() {
          this.renderLeft = this.renderRight = this.level < MAX_LEVEL;
          this.fill = memoizedViridis(this.level, MAX_LEVEL);
        }
      }
    );
  }
});
