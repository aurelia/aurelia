import { Primitive } from '@aurelia/kernel';
import { LifecycleFlags as LF } from '@aurelia/runtime';
import { SelectValueObserver, BasicConfiguration, BlurCustomAttribute } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { HTMLTestContext, TestContext } from '../util';
import {
  h,
  setup,
  setupAndStart,
  tearDown,
  massSpy
} from '../integration/util';

// TemplateCompiler - <select/> Integration
describe.only('built-in-resources.blur', () => {
  let ctx: HTMLTestContext;

  beforeEach(() => {
    ctx = TestContext.createHTMLTestContext();
  });

  //<select/> - single
  describe('01.', () => {

    //works with multiple toView bindings
    it('01.', (done) => {
      const originalUse = BlurCustomAttribute.use;
      let called = false;
      BlurCustomAttribute.use = function() {
        called = true;
        return originalUse.apply(BlurCustomAttribute, arguments);
      };
      const { au, lifecycle, host, observerLocator, component } = setup(
        ctx,
        `<template>
          <div blur.bind="isBlur"></div>
        </template>`,
        class App {
          public selectedValue: string = '2';
          public isBlur = true;
        },
        BlurCustomAttribute
      );
      au.app({ host, component }).start();

      ctx.doc.body.dispatchEvent(new CustomEvent('mousedown', { bubbles: true }));
      expect(called).to.be.true;

      setTimeout(() => {
        expect(au.root()['isBlur']).to.be.false;
        BlurCustomAttribute.use = originalUse;

        tearDown(au, lifecycle, host);
      }, 50);
    });

  });

});
