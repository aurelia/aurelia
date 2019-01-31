import { Constructable } from '@aurelia/kernel';
import { Aurelia, CustomElementResource, ICustomElement, INode } from '@aurelia/runtime';
import { BlurCustomAttribute, FocusCustomAttribute } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { spy } from 'sinon';
import { HTMLDOM } from '../../../runtime-html/src/dom';
import { setup } from '../integration/util';
import { HTMLTestContext, TestContext } from '../util';
import { domainMatch } from 'tough-cookie';

describe.only('built-in-resources.focus', () => {

  interface IApp {
    isBlur: boolean;
  }

  let $aurelia: Aurelia;

  beforeEach(() => {
    $aurelia = undefined;
  });

  afterEach(() => {
    if ($aurelia) {
      $aurelia.stop();
    }
  });

  describe('with <div/>', () => {
    it('focuses div when there is tabindex attribute', () => {
      const { au, component, dom } = setupAndStartNormal<IApp>(
        `<template>
          <div focus.bind="isBlur" id="blurred" tabindex="-1"></div>
        </template>`,
        class App {
          public isBlur = true;
        }
      );
      $aurelia = au;

      const activeElement = dom.document.activeElement;
      const div = dom.document.querySelector('app div');
      expect(div).not.to.be.null;
      expect(activeElement.tagName).to.equal('DIV');
      expect(activeElement).to.equal(div);
      expect(component.isBlur).to.equal(true, 'It should not have affected component.isBlur');
    });
  });

  it('invokes focus div when there is **NO** tabindex attribute', () => {
    let callCount = 0;
    HTMLDivElement.prototype.focus = function() {
      callCount++;
      return HTMLElement.prototype.focus.call(this);
    };

    const { au, component, dom } = setupAndStartNormal<IApp>(
      `<template>
        <div focus.bind="isBlur" id="blurred"></div>
      </template>`,
      class App {
        public isBlur = true;
      }
    );
    $aurelia = au;

    const activeElement = dom.document.activeElement;
    const div = dom.document.querySelector('app div');
    expect(callCount).to.equal(1, 'It should have invoked focus on DIV element prototype');
    expect(div).not.to.be.null;
    expect(activeElement.tagName).not.to.equal('DIV');
    expect(activeElement).not.to.equal(div);
    expect(component.isBlur).to.equal(true, 'It should not have affected component.isBlur');

    // focus belongs to HTMLElement class
    delete HTMLDivElement.prototype.focus;
  });

  describe('with mouse', () => {

    it('Works in basic scenario', async () => {
      const { au, component, dom } = setupAndStartNormal<IApp>(
        `<template>
          <input focus.bind="isBlur" id="blurred">
        </template>`,
        class App {
          public isBlur = true;
        }
      );
      $aurelia = au;

      const activeElement = dom.document.activeElement;
      const input = dom.document.querySelector('input');
      expect(input).not.to.be.null;
      expect(activeElement.tagName).to.equal('INPUT');
      expect(activeElement).to.equal(input);
    });
  });

  function setupAndStartNormal<T>(template: string | Node, $class: Constructable | null, ...registrations: any[]) {
    const ctx = TestContext.createHTMLTestContext();
    registrations = Array.from(new Set([...registrations, FocusCustomAttribute]));
    const { container, lifecycle, host, au, component, observerLocator } = setup(ctx, template, $class, ...registrations);

    ctx.doc.body.appendChild(host);

    au.app({ host, component });
    au.start();
    au['stopTasks'].push(() => ctx.doc.body.removeChild(host));

    return { dom: ctx.dom, container, lifecycle, host, au, component: component as T, observerLocator };
  }

  function waitForDelay(time = 0): Promise<void> {
    return new Promise(r => setTimeout(r, time));
  }
});
