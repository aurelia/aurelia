import { Registration } from '@aurelia/kernel';
import {
  Aurelia,
  CustomElement,
  ISSRContext,
  type ISSRScope,
  prepareSSRForSerialization,
} from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';

// https://github.com/aurelia/aurelia/issues/2526
// Server render, serialize with innerHTML, re-parse and hydrate: the HTML parser drops empty text nodes and merges
// adjacent ones, so the node counts in the manifest only line up when the markup survives the round trip.
describe('3-runtime-html/ssr-round-trip.spec.ts', function () {
  function repeatScope(name: string, nodeCounts: number[]): ISSRScope {
    return {
      name,
      children: [{ type: 'repeat', views: nodeCounts.map(nodeCount => ({ nodeCount, children: [] })) }],
    };
  }

  async function roundTrip<T extends object>(
    name: string,
    template: string,
    createState: () => T,
    ssrScope: ISSRScope,
    { prepare = true, alterMarkup = (markup: string) => markup } = {},
  ) {
    const Component = CustomElement.define({ name, template }, class { public constructor() { Object.assign(this, createState()); } });

    const serverCtx = TestContext.create();
    serverCtx.container.register(Registration.instance(ISSRContext, { preserveMarkers: true }));
    const serverHost = serverCtx.doc.body.appendChild(serverCtx.createElement(name));
    const serverAu = new Aurelia(serverCtx.container).app({ host: serverHost, component: Component });
    let markup: string;
    try {
      await serverAu.start();
      if (prepare) {
        prepareSSRForSerialization(serverHost);
      }
      markup = alterMarkup(serverHost.innerHTML);
    } finally {
      await serverAu.stop(true);
      serverAu.dispose();
      serverHost.remove();
    }

    const clientCtx = TestContext.create();
    const host = clientCtx.doc.body.appendChild(clientCtx.createElement(name));
    host.innerHTML = markup;
    const au = new Aurelia(clientCtx.container);
    const root = await au.hydrate({ host, component: Component, ssrScope });
    return {
      host,
      markup,
      vm: root.controller.viewModel as T,
      async dispose() {
        await root.deactivate();
        root.dispose();
        host.remove();
      },
    };
  }

  it('hydrates an indented <template repeat.for> with 5 items and keeps updating', async function () {
    const { host, vm, dispose } = await roundTrip(
      'rt-indented-repeat',
      `<ul>
        <template repeat.for="i of items">
          <li>\${i}</li>
        </template>
      </ul>`,
      () => ({ items: ['a', 'b', 'c', 'd', 'e'] }),
      repeatScope('rt-indented-repeat', [3, 3, 3, 3, 3]),
    );
    try {
      const texts = () => Array.from(host.querySelectorAll('li'), li => li.textContent);
      assert.deepStrictEqual(texts(), ['a', 'b', 'c', 'd', 'e']);
      assert.strictEqual(host.innerHTML.includes('au-t'), false, 'separators are removed on hydration');

      vm.items.push('f');
      vm.items.splice(1, 2);
      await tasksSettled();
      assert.deepStrictEqual(texts(), ['a', 'd', 'e', 'f']);
    } finally {
      await dispose();
    }
  });

  it('hydrates empty interpolations as the first and last text of a view', async function () {
    const { host, vm, dispose } = await roundTrip(
      'rt-empty-text',
      `<div><template repeat.for="i of items">\${i.a}<b>|</b>\${i.b}</template></div>`,
      () => ({ items: [{ a: '', b: 'x' }, { a: 'y', b: '' }, { a: '', b: '' }] }),
      repeatScope('rt-empty-text', [5, 5, 5]),
    );
    try {
      assert.strictEqual(host.textContent, '|xy||');

      vm.items[0].a = '1';
      vm.items[1].b = '2';
      vm.items[2].b = '3';
      vm.items.push({ a: '4', b: '5' });
      await tasksSettled();
      assert.strictEqual(host.textContent, '1|xy|2|34|5');
    } finally {
      await dispose();
    }
  });

  it('hydrates adjacent static text across repeat views', async function () {
    const { host, vm, dispose } = await roundTrip(
      'rt-static-text',
      `<template repeat.for="i of items">item </template><i>\${items.length}</i>`,
      () => ({ items: [1, 2, 3] }),
      repeatScope('rt-static-text', [1, 1, 1]),
    );
    try {
      assert.strictEqual(host.textContent, 'item item item 3');

      vm.items.pop();
      await tasksSettled();
      assert.strictEqual(host.textContent, 'item item 2');
    } finally {
      await dispose();
    }
  });

  it('hydrates static text next to bound text', async function () {
    const { host, vm, dispose } = await roundTrip(
      'rt-mixed-text',
      `<p>Hi \${name}!</p>`,
      () => ({ name: 'Bob' }),
      { name: 'rt-mixed-text', children: [] },
    );
    try {
      const p = host.querySelector('p');
      assert.strictEqual(p.textContent, 'Hi Bob!');

      vm.name = 'Ann';
      await tasksSettled();
      assert.strictEqual(p.textContent, 'Hi Ann!');
    } finally {
      await dispose();
    }
  });

  it('hydrates an interpolated <textarea> without leaking markers into its text', async function () {
    const { host, markup, vm, dispose } = await roundTrip(
      'rt-textarea',
      `<textarea>\${a}</textarea>`,
      () => ({ a: 'A' }),
      { name: 'rt-textarea', children: [] },
    );
    try {
      assert.strictEqual(markup.includes('&lt;!--') || /<textarea>[^<]*<!--/.test(markup), false, `markup: ${markup}`);
      const textarea = host.querySelector('textarea');
      assert.strictEqual(textarea.value, 'A');

      vm.a = 'B';
      await tasksSettled();
      assert.strictEqual(textarea.value, 'B');
    } finally {
      await dispose();
    }
  });

  it('hydrates an interpolated <title> without leaking markers into its text', async function () {
    const { host, markup, vm, dispose } = await roundTrip(
      'rt-title',
      `<title>\${a} - site</title>`,
      () => ({ a: 'Home' }),
      { name: 'rt-title', children: [] },
    );
    try {
      assert.strictEqual(/<title>[^<]*<!--/.test(markup), false, `markup: ${markup}`);
      const title = host.querySelector('title');
      assert.strictEqual(title.textContent, 'Home - site');

      vm.a = 'About';
      await tasksSettled();
      assert.strictEqual(title.textContent, 'About - site');
    } finally {
      await dispose();
    }
  });

  it('warns in dev when the markup has no integrity marker', async function () {
    const warn = console.warn;
    const warnings: string[] = [];
    console.warn = (message: string) => { warnings.push(message); };
    try {
      const { host, dispose } = await roundTrip(
        'rt-unprepared',
        `<span>\${a}</span>`,
        () => ({ a: 'A' }),
        { name: 'rt-unprepared', children: [] },
        { prepare: false },
      );
      assert.strictEqual(host.textContent, 'A');
      await dispose();
    } finally {
      console.warn = warn;
    }
    assert.strictEqual(warnings.length, 1, warnings.join('\n'));
    assert.includes(warnings[0], 'au-hm');
  });

  it('removes the integrity marker on hydration', async function () {
    const { host, markup, dispose } = await roundTrip(
      'rt-prepared',
      `<span>\${a}</span>`,
      () => ({ a: 'A' }),
      { name: 'rt-prepared', children: [] },
    );
    try {
      assert.includes(markup, '<!--au-hm-->');
      assert.strictEqual(host.innerHTML.includes('au-hm'), false);
    } finally {
      await dispose();
    }
  });
});
