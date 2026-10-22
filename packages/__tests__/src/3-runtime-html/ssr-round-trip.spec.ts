import { Registration } from '@aurelia/kernel';
import {
  Aurelia,
  CustomElement,
  ISSRContext,
  type ISSRScope,
  prepareSSRForSerialization,
  restoreSSRTextNodes,
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

  it('hydrates repeated textarea defaults and keeps them associated through collection updates', async function () {
    const { host, vm, dispose } = await roundTrip(
      'rt-repeated-textareas',
      `<section><textarea repeat.for="entry of entries">\${entry}</textarea></section>`,
      () => ({ entries: ['', 'initial', null] as (string | null)[] }),
      repeatScope('rt-repeated-textareas', [2, 2, 2]),
    );
    try {
      const values = () => Array.from(host.querySelectorAll('textarea'), element => element.value);
      assert.deepStrictEqual(values(), ['', 'initial', '']);
      vm.entries.splice(0, 1, 'replacement');
      vm.entries.push('added');
      await tasksSettled();
      assert.deepStrictEqual(values(), ['replacement', 'initial', '', 'added']);
      vm.entries.reverse();
      await tasksSettled();
      assert.deepStrictEqual(values(), ['added', '', 'initial', 'replacement']);
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

  it('keeps textarea edits separate from its interpolated reset value after hydration', async function () {
    const { host, vm, dispose } = await roundTrip(
      'rt-textarea-reset',
      `<form><textarea>\${text}</textarea></form>`,
      () => ({ text: 'initial' }),
      { name: 'rt-textarea-reset', children: [] },
    );
    try {
      const textarea = host.querySelector('textarea');
      const form = host.querySelector('form');
      assert.strictEqual(textarea.value, 'initial');
      assert.strictEqual(textarea.defaultValue, 'initial');

      // Text interpolation supplies the default, unlike a two-way value binding. Updating it must leave a
      // user's current edit intact; a native form reset then restores the updated default.
      textarea.value = 'edited';
      vm.text = 'replacement';
      await tasksSettled();
      assert.strictEqual(textarea.value, 'edited');
      assert.strictEqual(textarea.defaultValue, 'replacement');

      form.reset();
      assert.strictEqual(textarea.value, 'replacement');
      vm.text = 'next';
      await tasksSettled();
      assert.strictEqual(textarea.value, 'next', 'reset clears the dirty-value flag');
    } finally {
      await dispose();
    }
  });

  it('hydrates empty and adjacent SVG text interpolations without treating its title as HTML raw text', async function () {
    const { host, vm, dispose } = await roundTrip(
      'rt-svg-text',
      `<svg><title>\${label}</title><text>\${prefix}\${suffix}</text></svg>`,
      () => ({ label: '', prefix: '', suffix: 'value' }),
      { name: 'rt-svg-text', children: [] },
    );
    try {
      const title = host.querySelector('title');
      const text = host.querySelector('text');
      assert.strictEqual(title.namespaceURI, 'http://www.w3.org/2000/svg');
      assert.strictEqual(title.textContent, '');
      assert.strictEqual(text.textContent, 'value');

      vm.label = 'chart';
      vm.prefix = 'next ';
      vm.suffix = 'point';
      await tasksSettled();
      assert.strictEqual(title.textContent, 'chart');
      assert.strictEqual(text.textContent, 'next point');

      vm.label = '';
      vm.suffix = '';
      await tasksSettled();
      assert.strictEqual(title.textContent, '');
      assert.strictEqual(text.textContent, 'next ');
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

  describe('restoreSSRTextNodes', function () {
    it('pairs with prepareSSRForSerialization on a document root', function () {
      const { doc } = TestContext.create();
      const document = doc.implementation.createHTMLDocument('');
      document.body.append('a', 'b', '');

      prepareSSRForSerialization(document);
      assert.strictEqual(restoreSSRTextNodes(document), true);
      assert.deepStrictEqual(Array.from(document.body.childNodes, n => (n as Text).data), ['a', 'b', '']);
    });

    it('restores empty and adjacent text after serializing and parsing a complete document', function () {
      const ctx = TestContext.create();
      const document = ctx.doc.implementation.createHTMLDocument('page');
      document.body.append('', '', 'first', 'second', '', 'last', '');
      prepareSSRForSerialization(document);

      const markup = new ctx.wnd.XMLSerializer().serializeToString(document);
      const parsed = new ctx.DOMParser().parseFromString(markup, 'text/html');
      assert.strictEqual(restoreSSRTextNodes(parsed), true);
      assert.strictEqual(parsed.doctype.name, 'html');
      assert.strictEqual(parsed.title, 'page');
      assert.deepStrictEqual(
        Array.from(parsed.body.childNodes, node => [node.nodeType, (node as Text).data]),
        ['', '', 'first', 'second', '', 'last', ''].map(data => [3, data]),
      );
    });

    it('restores a serialized fragment without merging text or removing ordinary comments', function () {
      const { doc } = TestContext.create();
      const fragment = doc.createDocumentFragment();
      fragment.append('', 'first', '', '', 'second', 'third', '');
      fragment.append(doc.createComment('retained note'));
      const expected = Array.from(fragment.childNodes, node => [node.nodeType, (node as CharacterData).data]);
      prepareSSRForSerialization(fragment);

      const holder = doc.createElement('div');
      holder.append(fragment);
      const parsed = doc.createElement('template');
      parsed.innerHTML = holder.innerHTML;
      assert.strictEqual(restoreSSRTextNodes(parsed.content), true);
      assert.deepStrictEqual(
        Array.from(parsed.content.childNodes, node => [node.nodeType, (node as CharacterData).data]),
        expected,
      );

      const nodes = Array.from(parsed.content.childNodes);
      assert.strictEqual(restoreSSRTextNodes(parsed.content), false, 'the preparation marker was already consumed');
      assert.deepStrictEqual(Array.from(parsed.content.childNodes), nodes, 'restoring again leaves the restored nodes intact');
    });

    it('only counts the integrity marker on the root itself', function () {
      const { doc } = TestContext.create();
      const host = doc.createElement('div');
      const nested = host.appendChild(doc.createElement('section'));
      nested.append('a', 'b');
      prepareSSRForSerialization(nested);

      assert.strictEqual(restoreSSRTextNodes(host), false, 'a prepared nested root does not vouch for its host');
      assert.strictEqual(host.innerHTML, '<section>ab</section>', 'nested markers are still restored');
    });
  });
});
