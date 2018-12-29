import {
  Constructable,
  IRegistry,
  PLATFORM,
  Registration
} from '@aurelia/kernel';
import {
  Aurelia,
  CustomElementResource,
  IDOM,
  ILifecycle,
  IObserverLocator
} from '@aurelia/runtime';
import { HTMLDOM } from '@aurelia/runtime-html';
import { expect } from 'chai';
import {
  _,
  eachCartesianJoin,
  eachCartesianJoinFactory,
  ensureNotCalled,
  htmlStringify,
  jsonStringify,
  massReset,
  massRestore,
  massSpy,
  massStub,
  padRight,
  stringify,
  verifyEqual
} from '../../../../scripts/test-lib';
import {
  createElement,
  h
} from '../../../../scripts/test-lib-dom';
import { HTMLJitConfiguration } from '../../src/index';
import { TestConfiguration } from './resources';

export function cleanup(): void {
  const body = document.body;
  let current = body.firstElementChild;
  while (current !== null) {
    const next = current.nextElementSibling;
    if (current.tagName === 'APP') {
      body.removeChild(current);
    }
    current = next;
  }
}

const buildRequired = { required: true, compiler: 'default' };

export function defineCustomElement<T>(name: string, markupOrNode: string | HTMLElement, $class: Constructable<T>, dependencies: ReadonlyArray<any> = PLATFORM.emptyArray) {
  return CustomElementResource.define(
    {
      name,
      template: markupOrNode,
      dependencies: dependencies.slice() as unknown as IRegistry[],
      build: buildRequired
    },
    $class === null ? class { } : $class
  );
}

export function createCustomElement(markupOrNode: string | HTMLElement, $class: Constructable | null, dependencies: ReadonlyArray<any> = PLATFORM.emptyArray): { [key: string]: any } {
  const App = CustomElementResource.define(
    {
      name: 'app',
      template: markupOrNode,
      dependencies: dependencies.slice() as unknown as IRegistry[],
      build: buildRequired
    },
    $class === null ? class { } : $class
  );
  return new App();
}

export function setup(template: string, $class: Constructable | null, ...registrations: any[]) {
  const container = HTMLJitConfiguration.createContainer();
  container.register(TestConfiguration, ...registrations);
  const dom = new HTMLDOM(document);
  Registration.instance(IDOM, dom).register(container, IDOM);

  const lifecycle = container.get(ILifecycle);
  const observerLocator = container.get(IObserverLocator);
  const host = document.createElement('app');
  const au = new Aurelia(container);
  const component = createCustomElement(template, $class);

  return { container, lifecycle, host, au, component, observerLocator };
}

export function setupAndStart(template: string, $class: Constructable | null, ...registrations: any[]) {
  const { container, lifecycle, host, au, component, observerLocator } = setup(template, $class, ...registrations);

  au.app({ host, component });
  au.start();

  return { container, lifecycle, host, au, component, observerLocator };
}

export function setupWithDocument(template: string, $class: Constructable | null, ...registrations: any[]) {
  const { container, lifecycle, host, au, component, observerLocator } = setup(template, $class, ...registrations);
  document.body.appendChild(host);
  return { container, lifecycle, host, au, component, observerLocator };
}

export function setupWithDocumentAndStart(template: string, $class: Constructable | null, ...registrations: any[]) {
  const { container, lifecycle, host, au, component, observerLocator } = setupWithDocument(template, $class, ...registrations);

  au.app({ host, component });
  au.start();

  return { container, lifecycle, host, au, component, observerLocator };
}

export function tearDown(au: Aurelia, lifecycle: ILifecycle, host: HTMLElement) {
  au.stop();
  expect(lifecycle['flushCount']).to.equal(0);
  host.remove();
}

const reg = /\s+/g;
export function trimFull(text: string) {
  return text.replace(reg, '');
}

export { _, h, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinFactory };
