import { FragmentNodeSequence, isRenderLocation } from '@aurelia/runtime-html';
import { TestContext, assert } from '@aurelia/testing';

describe('3-runtime-html/dom.spec.ts', function () {
  const ctx = TestContext.create();
  let sut: FragmentNodeSequence;

  const widthArr = [1, 2, 3];
  const depthArr = [0, 1, 2, 3];
  describe('[UNIT] findTargets', function () {
    it(`should return all elements at all depths`, function () {
      const node = ctx.doc.createElement('div');
      node.innerHTML = `
      <template>
        <div>
          <div>
            <au-m></au-m><!--au-start--><!--au-end-->
          </div>
        </div>
        <p>hey</p><au-m></au-m><el></el>
      </template>`;
      const fragment = (node.firstElementChild as HTMLTemplateElement).content;
      sut = new FragmentNodeSequence(ctx.platform, fragment);
      const actual = sut.findTargets();
      assert.strictEqual(isRenderLocation(actual[0]), true);
      assert.strictEqual(actual[1], fragment.querySelector('el'));
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
