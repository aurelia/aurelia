import { Constructable } from '@aurelia/kernel';
import { Aurelia, CustomElement } from '@aurelia/runtime';
import { ChildList } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

describe('childist.integration.spec.ts', function() {

  it('gets the right childist', function() {
    const { dispose, ctx, component } = setup(
      `<div childlist.bind="childrenOfTheWhale">
        <div></div>
        <button></button>
        <input/>
        <select></select>
      </div>`,
      class App {
        public childrenOfTheWhale: HTMLElement[];
      }
    );

    assert.instanceOf(component.childrenOfTheWhale, Array, 'should have been array');
    assert.equal(component.childrenOfTheWhale.length, 4, 'should have had 4 elements');

    const gbl = ctx.wnd as unknown as typeof globalThis;
    assertElements(
      component.childrenOfTheWhale,
      [ctx.HTMLDivElement, gbl.HTMLButtonElement, gbl.HTMLInputElement, gbl.HTMLSelectElement]
    );
    dispose();
  });

  describe('with surrogate usage', function() {
    it('works with basic usage', function() {
      const { dispose, ctx, component } = setup(
        `<template childlist.bind="childrenOfTheWhale">
          <div></div>
          <button></button>
          <input/>
          <select></select>
        </template>`,
        class App {
          public childrenOfTheWhale: HTMLElement[];
        }
      );

      debugger;
      assert.instanceOf(component.childrenOfTheWhale, Array, 'should have been array');
      assert.equal(component.childrenOfTheWhale.length, 4, 'should have had 4 elements');

      const gbl = ctx.wnd as unknown as typeof globalThis;
      assertElements(
        component.childrenOfTheWhale,
        [ctx.HTMLDivElement, gbl.HTMLButtonElement, gbl.HTMLInputElement, gbl.HTMLSelectElement]
      );
      dispose();
    });
  });

  function assertElements(elements: HTMLElement[], elementTypes: Constructable<HTMLElement>[], assertionMsgPrefix: string = '') {
    assert.equal(
      elements.length,
      elementTypes.length,
      // tslint:disable-next-line:no-nested-template-literals
      `${assertionMsgPrefix ? `${assertionMsgPrefix} ` : ''}Elements count should have been ${Math.max(elements.length, elementTypes.length)}`
    );
    elements.forEach((el, idx) =>
      assert.equal(el instanceof elementTypes[idx], true, `expected <${el.tagName}/> at index [${idx}] to be instanceof ${elementTypes[idx].name}`)
    );
  }

  function setup<T>(template: string | Node, $class: Constructable<T>, autoStart: boolean = true, ...registrations: any[]) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, observerLocator } = ctx;
    container.register(...registrations, ChildList);
    const host = ctx.doc.body.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template }, $class);
    const component = new App();

    let startPromise: Promise<unknown>;
    if (autoStart) {
      au.app({ host, component });
      startPromise = au.start().wait();
    }

    return {
      startPromise,
      ctx,
      container,
      lifecycle,
      host,
      au,
      component,
      observerLocator,
      start: async () => {
        au.app({ host, component });
        await au.start().wait();
      },
      dispose: async () => {
        await au.stop().wait();
        host.remove();
      }
    };
  }
});
