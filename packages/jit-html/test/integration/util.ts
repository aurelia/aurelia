import {
  Constructable,
  IRegistry,
  PLATFORM
} from '@aurelia/kernel';
import {
  Aurelia,
  CustomElementResource,
  ILifecycle
} from '@aurelia/runtime';
import { expect } from 'chai';
import {
  _,
  eachCartesianJoin,
  eachCartesianJoinAsync,
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
  h
} from '../../../../scripts/test-lib-dom';
import { HTMLTestContext, TestContext } from '../util';

export function cleanup(ctx: HTMLTestContext): void {
  const body = ctx.doc.body;
  let current = body.firstElementChild;
  while (current !== null) {
    const next = current.nextElementSibling;
    if (current.tagName === 'APP') {
      body.removeChild(current);
    }
    current = next;
  }
}

export function setup(ctx: HTMLTestContext, template: string | Node, $class: Constructable | null, ...registrations: any[]) {
  const { container, lifecycle, observerLocator } = ctx;
  container.register(...registrations);
  const host = ctx.createElement('app');
  const au = new Aurelia(container);
  const App = CustomElementResource.define({ name: 'app', template }, $class);
  const component = new App() as any;

  return { container, lifecycle, host, au, component, observerLocator };
}

export function setupAndStart(ctx: HTMLTestContext, template: string | Node, $class: Constructable | null, ...registrations: any[]) {
  const { container, lifecycle, host, au, component, observerLocator } = setup(ctx, template, $class, ...registrations);

  au.app({ host, component });
  au.start();

  return { container, lifecycle, host, au, component, observerLocator };
}

export function setupWithDocument(ctx: HTMLTestContext, template: string | Node, $class: Constructable | null, ...registrations: any[]) {
  const { container, lifecycle, host, au, component, observerLocator } = setup(ctx, template, $class, ...registrations);
  ctx.doc.body.appendChild(host);
  return { container, lifecycle, host, au, component, observerLocator };
}

export function setupWithDocumentAndStart(ctx: HTMLTestContext, template: string | Node, $class: Constructable | null, ...registrations: any[]) {
  const { container, lifecycle, host, au, component, observerLocator } = setupWithDocument(ctx, template, $class, ...registrations);

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

export { _, h, stringify, jsonStringify, htmlStringify, verifyEqual, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinAsync, eachCartesianJoinFactory };

const eventCmds = { delegate: 1, capture: 1, call: 1 };

/**
 * jsx with aurelia binding command friendly version of h
 */
export const hJsx = function(name: string, attrs: Record<string, string> | null, ...children: (Node | string | (Node | string)[])[]) {
  const el = document.createElement(name === 'let$' ? 'let' : name);
  if (attrs !== null) {
    let value: string | string[];
    let len: number;
    for (const attr in attrs) {
      value = attrs[attr];
      // if attr is class or its alias
      // split up by splace and add to element via classList API
      if (attr === 'class' || attr === 'className' || attr === 'cls') {
        value = value == null
          ? []
          : Array.isArray(value)
            ? value
            : ('' + value).split(' ');
        el.classList.add(...value as string[]);
      }
      // for attributes with matching properties, simply assign
      // other if special attribute like data, or ones start with _
      // assign as well
      else if (attr in el || attr === 'data' || attr[0] === '_') {
        el[attr] = value;
      }
      // if it's an asElement attribute, camel case it
      else if (attr === 'asElement') {
        el.setAttribute('as-element', value);
      }
      // ortherwise do fallback check
      else {
        // is it an event handler?
        if (attr[0] === 'o' && attr[1] === 'n' && !attr.endsWith('$')) {
          const decoded = PLATFORM.kebabCase(attr.slice(2));
          const parts = decoded.split('-');
          if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            const cmd = eventCmds[lastPart] ? lastPart : 'trigger';
            el.setAttribute(`${parts.slice(0, -1).join('-')}.${cmd}`, value);
          } else {
            el.setAttribute(`${parts[0]}.trigger`, value);
          }
        } else {
          const len = attr.length;
          const parts = attr.split('$');
          if (parts.length === 1) {
            el.setAttribute(PLATFORM.kebabCase(attr), value);
          } else {
            if (parts[parts.length - 1] === '') {
              parts[parts.length - 1] = 'bind';
            }
            el.setAttribute(parts.map(PLATFORM.kebabCase).join('.'), value);
          }
          // const lastIdx = attr.lastIndexOf('$');
          // if (lastIdx === -1) {
          //   el.setAttribute(PLATFORM.kebabCase(attr), value);
          // } else {
          //   let cmd = attr.slice(lastIdx + 1);
          //   cmd = cmd ? PLATFORM.kebabCase(cmd) : 'bind';
          //   el.setAttribute(`${PLATFORM.kebabCase(attr.slice(0, lastIdx))}.${cmd}`, value);
          // }
        }
      }
    }
  }
  const appender = (el instanceof HTMLTemplateElement) ? el.content : el;
  for (const child of children) {
    if (child == null) {
      continue;
    }
    if (Array.isArray(child)) {
      for (const child_child of child) {
        appender.appendChild(child_child instanceof Node ? child_child : document.createTextNode('' + child_child));
      }
    } else {
      appender.appendChild(child instanceof Node ? child : document.createTextNode('' + child));
    }
  }
  return el;
}
