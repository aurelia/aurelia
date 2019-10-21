import { INode, NodeSequence } from '@aurelia/runtime';
import { FragmentNodeSequence, NodeSequenceFactory } from '@aurelia/runtime-html';
import { HTMLTestContext, TestContext, assert, createSpy } from '@aurelia/testing';

function wrap(inner: string, tag: string): string {
  if (tag.length === 0) {
    return inner;
  }
  return `<${tag}>${inner}</${tag}>`;
}

function verifyThrows(call: () => void): void {
  let err;
  try {
    call();
  } catch (e) {
    err = e;
  }
  assert.strictEqual(err instanceof Error, true, `err instanceof Error`);
}

function verifyDoesNotThrow(call: () => void): void {
  let err;
  try {
    call();
  } catch (e) {
    err = e;
  }
  assert.strictEqual(err, undefined, `err`);
}

describe('NodeSequenceFactory', function () {
  const ctx = TestContext.createHTMLTestContext();

  describe('createNodeSequenceFactory', function () {
    const textArr = ['', 'text', '#text'];
    const elementsArr = [[''], ['div'], ['div', 'p']];
    const wrapperArr = ['', 'div', 'template'];

    for (const text of textArr) {

      for (const elements of elementsArr) {
        const elementsMarkup = elements.map(e => wrap(text, e)).join('');

        for (const wrapper of wrapperArr) {
          const markup = wrap(elementsMarkup, wrapper);

          it(`should create a factory that returns the correct markup for "${markup}"`, function () {
            const factory = new NodeSequenceFactory(ctx.dom, markup);
            const view = factory.createNodeSequence();
            const fragment = view['fragment'] as DocumentFragment;
            let parsedMarkup = '';
            const childCount = fragment.childNodes.length;
            let i = 0;
            while (i < childCount) {
              const child = fragment.childNodes.item(i);
              if (child['outerHTML']) {
                parsedMarkup += child['outerHTML'];
              } else {
                parsedMarkup += child['textContent'];
              }
              i++;
            }
            assert.strictEqual(parsedMarkup, markup, `parsedMarkup`);
          });

          it(`should create a factory that always returns a view with a different fragment instance for "${markup}"`, function () {
            const factory = new NodeSequenceFactory(ctx.dom, markup);
            const fragment1 = factory.createNodeSequence()['fragment'];
            const fragment2 = factory.createNodeSequence()['fragment'];
            const fragment3 = factory.createNodeSequence()['fragment'];

            if (fragment1 === fragment2 || fragment1 === fragment3 || fragment2 === fragment3) {
              throw new Error('Expected all fragments to be different instances');
            }
          });
        }
      }
    }

    const validInputArr: any[] = ['', 'asdf', 'div', 1, true, false, {}, new Error(), undefined, null, Symbol()];
    for (const validInput of validInputArr) {
      it(`should not throw for valid input type "${typeof validInput}"`, function () {
        verifyDoesNotThrow(() => new NodeSequenceFactory(ctx.dom, validInput));
      });
    }

    const invalidInputArr: any[] = [];
    for (const invalidInput of invalidInputArr) {
      it(`should throw for invalid input type "${typeof invalidInput}"`, function () {
        verifyThrows(() => new NodeSequenceFactory(ctx.dom, invalidInput));
      });
    }
  });
});

describe('dom', function () {
  const ctx = TestContext.createHTMLTestContext();
  // reset dom after each test to make sure self-optimizations do not affect test outcomes
  const DOMBackup = Object.create(null);
  // reset doc after each test to clear any spies
  const DocumentBackup = Object.create(null);

  function restoreBackups(): void {
    Object.assign(ctx.dom, DOMBackup);
    Object.assign(ctx.doc, DocumentBackup);
  }

  // eslint-disable-next-line mocha/no-hooks
  before(function () {
    Object.assign(DOMBackup, ctx.dom);
    for (const propName in ctx.doc) {
      const prop = ctx.doc[propName];
      if (typeof prop === 'function') {
        DocumentBackup[propName] = prop;
      }
    }
  });

  // eslint-disable-next-line mocha/no-hooks
  afterEach(function () {
    restoreBackups();
  });

  describe('createElement', function () {
    it.skip('should call document.createElement', function () {
      const createElementSpy = createSpy(ctx.doc, 'createElement');
      ctx.dom.createElement('div');

      assert.deepStrictEqual(
        createElementSpy,
        [
          ['div'],
        ],
        `createElementSpy`,
      );

      createElementSpy.restore();
    });

    it('should create an element', function () {
      const el = ctx.dom.createElement('div');
      assert.strictEqual(el['outerHTML'], '<div></div>', `el['outerHTML']`);
    });

    const validInputArr: any[] = ['asdf', 'div', new Error(), true, false, undefined, null];
    for (const validInput of validInputArr) {
      it(`should not throw for valid input type "${typeof validInput}"`, function () {
        verifyDoesNotThrow(ctx.dom.createElement.bind(ctx.dom, validInput));
      });
    }

    const invalidInputArr: any[] = ['', 1, {}, Object.create(null), Symbol()];
    for (const invalidInput of invalidInputArr) {
      it(`should throw for invalid input type "${typeof invalidInput}"`, function () {
        verifyThrows(ctx.dom.createElement.bind(ctx.dom, invalidInput));
      });
    }
  });

  describe('cloneNode', function () {
    const trueValueArr: any[] = [undefined, null, {}, '', true];
    for (const trueValue of trueValueArr) {
      it(`should call node.cloneNode(true) when given ${trueValue}`, function () {
        const node = ctx.dom.createElement('div');
        const cloneNodeSpy = createSpy(node, 'cloneNode');
        ctx.dom.cloneNode(node, trueValue);

        assert.deepStrictEqual(
          cloneNodeSpy.calls,
          [
            [true],
          ],
          `cloneNodeSpy.calls`,
        );
      });
    }

    it('should call node.cloneNode(true) by default', function () {
      const node = ctx.dom.createElement('div');
      const cloneNodeSpy = createSpy(node, 'cloneNode');
      ctx.dom.cloneNode(node);

      assert.deepStrictEqual(
        cloneNodeSpy.calls,
        [
          [true],
        ],
        `cloneNodeSpy.calls`,
      );
    });

    it('should call node.cloneNode(false) if given false', function () {
      const node = ctx.dom.createElement('div');
      const cloneNodeSpy = createSpy(node, 'cloneNode');
      ctx.dom.cloneNode(node, false);

      assert.deepStrictEqual(
        cloneNodeSpy.calls,
        [
          [false],
        ],
        `cloneNodeSpy.calls`,
      );
    });
  });

  describe('isNodeInstance', function () {
    const nodes = [
      [ctx.dom.createElement('div'), '<div></div>'],
      [ctx.dom.createElement('asdf'), '<asdf></asdf>'],
      [ctx.doc.createComment('asdf'), '<!-- asdf -->'],
      [ctx.doc.createTextNode('asdf'), 'asdf'],
      [ctx.doc.createDocumentFragment(), 'DocumentFragment'],
      [ctx.doc, '#document'],
      [ctx.doc.doctype, '#doctype'],
    ];
    for (const [node, text] of nodes) {
      it(`should return true if the value is of type ${Object.prototype.toString.call(node)} (${text})`, function () {
        const actual = ctx.dom.isNodeInstance(node);
        assert.strictEqual(actual, true, `actual`);
      });
    }

    const nonNodes = [
      ctx.doc.createEvent('MouseEvent'),
      {}
    ];
    for (const nonNode of nonNodes) {
      it(`should return false if the value is of type ${Object.prototype.toString.call(nonNode)}`, function () {
        const actual = ctx.dom.isNodeInstance(nonNode);
        assert.strictEqual(actual, false, `actual`);
      });
    }
  });

  describe('remove', function () {
    it('should remove the childNode from its parent (non-polyfilled)', function () {
      const node = ctx.dom.createElement('div');
      const childNode = ctx.dom.createElement('div');
      node.appendChild(childNode);
      ctx.dom.remove(childNode);
      assert.strictEqual(node.childNodes.length, 0, `node.childNodes.length`);
    });

    it('should remove the childNode from its parent (polyfilled)', function () {
      const remove = ctx.Element.prototype.remove;
      ctx.Element.prototype.remove = undefined;
      const node = ctx.dom.createElement('div');
      const childNode = ctx.dom.createElement('div');
      node.appendChild(childNode);
      ctx.dom.remove(childNode);
      assert.strictEqual(node.childNodes.length, 0, `node.childNodes.length`);
      ctx.Element.prototype.remove = remove;
    });
  });

  describe('appendChild', function () {
    it('should append the childNode to the given parent', function () {
      const node = ctx.dom.createElement('div');
      const childNode = ctx.dom.createElement('div');
      ctx.dom.appendChild(node, childNode);
      assert.strictEqual(node.firstChild === childNode, true, `node.firstChild === childNode`);
    });
  });

  describe('insertBefore', function () {
    it('should insert the childNode before the referenceNode below the parent of the referenceNode', function () {
      const node = ctx.dom.createElement('div');
      const childNode = ctx.dom.createElement('div');
      const refNode1 = ctx.dom.createElement('div');
      const refNode2 = ctx.dom.createElement('div');
      node.appendChild(refNode1);
      node.appendChild(refNode2);
      ctx.dom.insertBefore(childNode, refNode2);
      assert.strictEqual(node.childNodes.item(0) === refNode1, true, `node.childNodes.item(0) === refNode1`);
      assert.strictEqual(node.childNodes.item(1) === childNode, true, `node.childNodes.item(1) === childNode`);
      assert.strictEqual(node.childNodes.item(2) === refNode2, true, `node.childNodes.item(2) === refNode2`);
    });
  });

  describe('addEventListener', function () {
    it('should add the specified eventListener to the node if the node is specified', function(done) {
      const node = ctx.dom.createElement('div');
      const eventListener = createSpy();
      ctx.dom.addEventListener('click', eventListener, node);
      node.dispatchEvent(new ctx.CustomEvent('click', { bubbles: true }));

      setTimeout(
        () => {
          assert.strictEqual(eventListener.calls.length, 1, `eventListener.calls.length`);
          done();
        },
        0,
      );
    });

    it('should add the specified eventListener to the document if the node is NOT specified', function(done) {
      const eventListener = createSpy();
      ctx.dom.addEventListener('click', eventListener);
      ctx.doc.dispatchEvent(new ctx.CustomEvent('click', { bubbles: true }));

      setTimeout(
        () => {
          assert.strictEqual(eventListener.calls.length, 1, `eventListener.calls.length`);
          done();
        },
        0,
      );
    });
  });

  describe('removeEventListener', function () {
    it('should remove the specified eventListener from the node if the node is specified', function(done) {
      const node = ctx.dom.createElement('div');
      const eventListener = createSpy();
      node.addEventListener('click', eventListener);
      ctx.dom.removeEventListener('click', eventListener, node);
      node.dispatchEvent(new ctx.CustomEvent('click', { bubbles: true }));

      setTimeout(
        () => {
          assert.strictEqual(eventListener.calls.length, 0, `eventListener.calls.length`);
          done();
        },
        0,
      );
    });

    it('should remove the specified eventListener from the document if the node is NOT specified', function(done) {
      const eventListener = createSpy();
      ctx.doc.addEventListener('click', eventListener);
      ctx.dom.removeEventListener('click', eventListener);
      ctx.doc.dispatchEvent(new ctx.CustomEvent('click', { bubbles: true }));

      setTimeout(
        () => {
          assert.strictEqual(eventListener.calls.length, 0, `eventListener.calls.length`);
          done();
        },
        0,
      );
    });
  });

  describe('convertToRenderLocation', function () {
    function createTestNodes() {
      const node = ctx.dom.createElement('div');
      const childNode = ctx.dom.createElement('div');
      node.appendChild(childNode);
      return {node, childNode};
    }

    it('should replace the provided node with two comment nodes', function () {
      const {node, childNode} = createTestNodes();
      const location = ctx.dom.convertToRenderLocation(childNode);
      assert.strictEqual(location['nodeName'], '#comment', `location['nodeName']`);
      assert.strictEqual(location.$start['nodeName'], '#comment', `location.$start['nodeName']`);
      assert.strictEqual(childNode === location, false, `childNode === location`);
      assert.strictEqual(node.childNodes.length, 2, `node.childNodes.length`);
      assert.strictEqual(node.firstChild === location, false, `node.firstChild === location`);
      assert.strictEqual(node.firstChild === location.$start, true, `node.firstChild === location.$start`);
      assert.strictEqual(node.lastChild === location, true, `node.lastChild === location`);
    });
  });

  describe.skip('registerElementResolver', function () {
    const keys = [INode, ctx.Node, ctx.Element, ctx.HTMLElement];
    if (typeof Node !== 'undefined') {
      keys.push(Node);
    }
    if (typeof Element !== 'undefined') {
      keys.push(Element);
    }
    if (typeof HTMLElement !== 'undefined') {
      keys.push(HTMLElement);
    }
    for (const key of keys) {
      it(`should register the resolver for type ${Object.prototype.toString.call(key)}`, function () {
        const mockContainer: any = { registerResolver: createSpy() };
        const resolver: any = {};
        ctx.dom.registerElementResolver(mockContainer, resolver);

        assert.deepStrictEqual(
          mockContainer.registerResolver.calls,
          [
            [key, resolver],
          ],
          `mockContainer.registerResolver.calls`,
        );
      });
    }
  });
});

describe('FragmentNodeSequence', function () {
  const ctx = TestContext.createHTMLTestContext();
  let sut: FragmentNodeSequence;

  const widthArr = [1, 2, 3];
  describe('constructor', function () {
    for (const width of widthArr) {
      it(`should correctly assign children (depth=1,width=${width})`, function () {
        const node = ctx.dom.createElement('div');
        const fragment = createFragment(ctx, node, 0, 1, width);
        sut = new FragmentNodeSequence(ctx.dom, fragment);
        assert.strictEqual(sut.childNodes.length, width, `sut.childNodes.length`);
        assert.strictEqual(sut.childNodes[0] === sut.firstChild, true, `sut.childNodes[0] === sut.firstChild`);
        assert.strictEqual(sut.childNodes[width - 1] === sut.lastChild, true, `sut.childNodes[width - 1] === sut.lastChild`);
      });
    }
  });
  const depthArr = [0, 1, 2, 3];
  describe('findTargets', function () {
    for (const width of widthArr) {
      for (const depth of depthArr) {
        // note: these findTargets tests are quite redundant, but the basic setup might come in handy later
        it(`should return empty array when there are no targets (depth=${depth},width=${width})`, function () {
          const node = ctx.dom.createElement('div');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.dom, fragment);
          const actual = sut.findTargets();
          assert.strictEqual(actual.length, 0, `actual.length`);
        });

        it(`should return all elements when all are targets targets (depth=${depth},width=${width})`, function () {
          const node = ctx.dom.createElement('div');
          node.classList.add('au');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.dom, fragment);
          const actual = sut.findTargets();
          assert.strictEqual(actual.length, fragment.querySelectorAll('div').length, `actual.length`);
        });
      }
    }
  });

  describe('insertBefore', function () {
    for (const width of widthArr) {
      for (const depth of depthArr.filter(d => d > 0)) {
        it(`should insert the view before the refNode under the parent of the refNode (depth=${depth},width=${width})`, function () {
          const node = ctx.dom.createElement('div');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.dom, fragment);
          const parent = ctx.dom.createElement('div');
          const ref1 = ctx.dom.createElement('div');
          const ref2 = ctx.dom.createElement('div');
          parent.appendChild(ref1);
          parent.appendChild(ref2);
          sut.insertBefore(ref2);
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
          const node = ctx.dom.createElement('div');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.dom, fragment);
          const parent = ctx.dom.createElement('div');
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

  describe.skip('remove', function () {
    for (const width of widthArr) {
      for (const depth of depthArr.filter(d => d > 0)) {
        it(`should put the view back into the fragment (depth=${depth},width=${width})`, function () {
          const node = ctx.dom.createElement('div');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.dom, fragment);
          const parent = ctx.dom.createElement('div');
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

function createFragment(ctx: HTMLTestContext, node: HTMLElement, level: number, depth: number, width: number): DocumentFragment {
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
