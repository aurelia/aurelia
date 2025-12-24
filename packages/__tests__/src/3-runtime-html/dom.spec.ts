import { customElement, FragmentNodeSequence, isRenderLocation, refs, IRenderLocation } from '@aurelia/runtime-html';
import { TestContext, assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/dom.spec.ts', function () {
  this.beforeEach(function () {
    refs.hideProp = false;
  });

  describe('refs', function () {
    it('does not set $aurelia on host if refs.hideProp is true', function () {
      refs.hideProp = true;
      const { appHost } = createFixture('', class {});

      assert.strictEqual(appHost['$aurelia'], undefined);
    });

    it('does not set $au on host if refs.hideProp is true', function () {
      refs.hideProp = true;
      const { assertText, appHost } = createFixture('<el>', class {}, [@customElement({ name: 'el', template: 'ell'}) class {}]);
      assertText('ell');
      assert.strictEqual(appHost.querySelector('el')['$au'], undefined);
    });
  });

  const ctx = TestContext.create();
  let sut: FragmentNodeSequence;

  const widthArr = [1, 2, 3];
  const depthArr = [0, 1, 2, 3];

  describe('[UNIT] findTargets - <!--au--> marker system', function () {
    it('finds element targets via <!--au--> marker', function () {
      const node = ctx.doc.createElement('div');
      node.innerHTML = `<template><!--au--><div></div></template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 1, 'should find 1 target');
      assert.strictEqual((actual[0] as Element).tagName, 'DIV', 'target should be the div');
    });

    it('finds multiple element targets in document order', function () {
      const node = ctx.doc.createElement('div');
      node.innerHTML = `<template><!--au--><div></div><!--au--><span></span><!--au--><p></p></template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 3, 'should find 3 targets');
      assert.strictEqual((actual[0] as Element).tagName, 'DIV', 'target 0 should be div');
      assert.strictEqual((actual[1] as Element).tagName, 'SPAN', 'target 1 should be span');
      assert.strictEqual((actual[2] as Element).tagName, 'P', 'target 2 should be p');
    });

    it('finds comment marker targets (text interpolation)', function () {
      const node = ctx.doc.createElement('div');
      // <!--au--> followed by text node (space)
      node.innerHTML = `<template><!--au--> </template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 1, 'should find 1 target');
      assert.strictEqual(actual[0].nodeType, 3, 'target should be text node');
      assert.strictEqual((actual[0] as Text).textContent, ' ', 'target should be the space text');
    });

    it('finds render location targets (containerless/TC)', function () {
      const node = ctx.doc.createElement('div');
      // <!--au--><!--au-start--><!--au-end-->
      node.innerHTML = `<template><!--au--><!--au-start--><!--au-end--></template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 1, 'should find 1 target');
      assert.strictEqual(isRenderLocation(actual[0]), true, 'target should be render location');
      const loc = actual[0] as IRenderLocation;
      assert.strictEqual(loc.nodeType, 8, 'render location should be comment');
      assert.strictEqual((loc as unknown as Comment).textContent, 'au-end', 'should be au-end');
      assert.strictEqual(loc.$start?.textContent, 'au-start', 'should have $start pointing to au-start');
    });

    it('finds mixed element and comment targets with correct indices', function () {
      const node = ctx.doc.createElement('div');
      // Mix: text interpolation, element, TC, element
      node.innerHTML = `<template><!--au--> <!--au--><div></div><!--au--><!--au-start--><!--au-end--><!--au--><span></span></template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 4, 'should find 4 targets');
      assert.strictEqual(actual[0].nodeType, 3, 'target 0 should be text node');
      assert.strictEqual((actual[1] as Element).tagName, 'DIV', 'target 1 should be div');
      assert.strictEqual(isRenderLocation(actual[2]), true, 'target 2 should be render location');
      assert.strictEqual((actual[3] as Element).tagName, 'SPAN', 'target 3 should be span');
    });

    it('finds deeply nested element targets', function () {
      const node = ctx.doc.createElement('div');
      node.innerHTML = `<template><div><span><!--au--><p></p></span></div></template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 1, 'should find 1 target');
      assert.strictEqual((actual[0] as Element).tagName, 'P', 'target should be the nested p');
    });

    it('finds targets in document order (implicit indexing)', function () {
      const node = ctx.doc.createElement('div');
      // 3 markers, targets in document order (0, 1, 2)
      node.innerHTML = `<template><!--au--><div></div><!--au--><span></span><!--au--><p></p></template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 3, 'should find 3 targets');
      assert.strictEqual((actual[0] as Element).tagName, 'DIV', 'target 0 should be div');
      assert.strictEqual((actual[1] as Element).tagName, 'SPAN', 'target 1 should be span');
      assert.strictEqual((actual[2] as Element).tagName, 'P', 'target 2 should be p');
    });

    it('handles 10+ targets correctly (implicit ordering)', function () {
      const node = ctx.doc.createElement('div');
      // Each <!--au--> marker is followed by a <div> target
      const elements = Array(12).fill(0).map(() => `<!--au--><div></div>`).join('');
      node.innerHTML = `<template>${elements}</template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();

      assert.strictEqual(actual.length, 12, 'should find 12 targets');
      for (let i = 0; i < 12; i++) {
        assert.strictEqual((actual[i] as Element).tagName, 'DIV', `target ${i} should be div`);
      }
    });

    it('removes <!--au--> markers after processing', function () {
      const node = ctx.doc.createElement('div');
      node.innerHTML = `<template><!--au--> <!--au--> </template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      sut.findTargets();

      // Check that <!--au--> markers are removed
      // NodeFilter.SHOW_COMMENT = 128
      const walker = ctx.doc.createTreeWalker(fragment, 128);
      const comments: string[] = [];
      while (walker.nextNode()) {
        comments.push((walker.currentNode as Comment).textContent!);
      }
      // No 'au' comments should remain
      assert.strictEqual(comments.filter(c => c === 'au').length, 0, 'no <!--au--> markers should remain');
    });

    it('preserves au-start/au-end comments for render locations', function () {
      const node = ctx.doc.createElement('div');
      node.innerHTML = `<template><!--au--><!--au-start--><!--au-end--></template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      sut.findTargets();

      // Check that au-start and au-end remain
      // NodeFilter.SHOW_COMMENT = 128
      const walker = ctx.doc.createTreeWalker(fragment, 128);
      const comments: string[] = [];
      while (walker.nextNode()) {
        comments.push((walker.currentNode as Comment).textContent!);
      }
      assert.deepStrictEqual(comments, ['au-start', 'au-end'], 'au-start and au-end should remain');
    });
  });

  describe('[UNIT] insertBefore', function () {
    for (const width of widthArr) {
      for (const depth of depthArr.filter(d => d > 0)) {
        it(`should insert the view before the refNode under the parent of the refNode (depth=${depth},width=${width})`, function () {
          const node = ctx.doc.createElement('div');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.platform, fragment);
          const parent = ctx.doc.createElement('div');
          const ref1 = ctx.doc.createElement('div');
          const ref2 = ctx.doc.createElement('div');
          parent.appendChild(ref1);
          parent.appendChild(ref2);
          sut.insertBefore(ref2 as HTMLDivElement & Comment);
          assert.strictEqual(parent.childNodes.length, width + 2, `parent.childNodes.length`);
          assert.strictEqual(fragment.childNodes.length, 0, `fragment.childNodes.length`);
          assert.strictEqual(parent.childNodes.item(0) === ref1, true, `parent.childNodes.item(0) === ref1`);
          let i = 0;
          while (i < width) {
            assert.strictEqual(parent.childNodes.item(i + 1) === sut.childNodes[i], true, `parent.childNodes.item(i + 1) === sut.childNodes[i]`);
            i++;
          }
          assert.strictEqual(parent.childNodes.item(width + 1) === ref2, true, `parent.childNodes.item(width + 1) === ref2`);
          assert.strictEqual(fragment.childNodes.length, 0, `fragment.childNodes.length`);
        });
      }
    }
  });

  describe('appendTo', function () {
    for (const width of widthArr) {
      for (const depth of depthArr.filter(d => d > 0)) {
        it(`should append the view to the parent (depth=${depth},width=${width})`, function () {
          const node = ctx.doc.createElement('div');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.platform, fragment);
          const parent = ctx.doc.createElement('div');
          sut.appendTo(parent);
          assert.strictEqual(parent.childNodes.length, width, `parent.childNodes.length`);
          assert.strictEqual(fragment.childNodes.length, 0, `fragment.childNodes.length`);
          let i = 0;
          while (i < width) {
            assert.strictEqual(parent.childNodes.item(i) === sut.childNodes[i], true, `parent.childNodes.item(i) === sut.childNodes[i]`);
            i++;
          }
        });
      }
    }
  });

  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip('remove', function () {
    for (const width of widthArr) {
      for (const depth of depthArr.filter(d => d > 0)) {
        it(`should put the view back into the fragment (depth=${depth},width=${width})`, function () {
          const node = ctx.doc.createElement('div');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.platform, fragment);
          const parent = ctx.doc.createElement('div');
          assert.strictEqual(parent.childNodes.length, 0, `parent.childNodes.length`);
          assert.strictEqual(fragment.childNodes.length, width, `fragment.childNodes.length`);
          parent.appendChild(fragment);
          assert.strictEqual(parent.childNodes.length, width, `parent.childNodes.length`);
          assert.strictEqual(fragment.childNodes.length, 0, `fragment.childNodes.length`);
          sut.remove();
          assert.strictEqual(parent.childNodes.length, 0, `parent.childNodes.length`);
          assert.strictEqual(fragment.childNodes.length, width, `fragment.childNodes.length`);
        });
      }
    }
  });
});

function createFragment(ctx: TestContext, node: HTMLElement, level: number, depth: number, width: number): DocumentFragment {
  const root: any = ctx.doc.createDocumentFragment();
  appendTree(root, node, level, depth, width);
  return root;
}

function appendTree(root: HTMLElement, node: HTMLElement, level: number, depth: number, width: number): void {
  if (level < depth) {
    const children = appendChildren(root, node, width);
    for (const child of children) {
      appendTree(child, node, level + 1, depth, width);
    }
  }
}

function appendChildren(parent: HTMLElement, child: HTMLElement, count: number): HTMLElement[] {
  const children = new Array(count);
  let i = 0;
  while (i < count) {
    const el = child.cloneNode(true);
    parent.appendChild(el);
    children[i] = el;
    i++;
  }
  return children;
}
