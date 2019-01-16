import { INode, NodeSequence } from '@aurelia/runtime';
import { expect } from 'chai';
import { spy } from 'sinon';
import { FragmentNodeSequence, NodeSequenceFactory } from '../src/dom';
import { HTMLTestContext, TestContext } from './util';

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
  expect(err instanceof Error).to.equal(true);
}

function verifyDoesNotThrow(call: () => void): void {
  let err;
  try {
    call();
  } catch (e) {
    err = e;
  }
  expect(err).to.equal(undefined);
}

describe('NodeSequenceFactory', () => {
  const ctx = TestContext.createHTMLTestContext();

  describe('createNodeSequenceFactory', () => {
    const textArr = ['', 'text', '#text'];
    const elementsArr = [[''], ['div'], ['div', 'p']];
    const wrapperArr = ['', 'div', 'template'];

    for (const text of textArr) {

      for (const elements of elementsArr) {
        const elementsMarkup = elements.map(e => wrap(text, e)).join('');

        for (const wrapper of wrapperArr) {
          const markup = wrap(elementsMarkup, wrapper);

          it(`should create a factory that returns the correct markup for "${markup}"`, () => {
            const factory = new NodeSequenceFactory(ctx.dom, markup);
            const view = factory.createNodeSequence();
            if (markup.length === 0) {
              expect(view).to.equal(NodeSequence.empty);
            } else {
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
              expect(parsedMarkup).to.equal(markup);
            }
          });

          it(`should create a factory that always returns a view with a different fragment instance for "${markup}"`, () => {
            const factory = new NodeSequenceFactory(ctx.dom, markup);
            const fragment1 = factory.createNodeSequence()['fragment'];
            const fragment2 = factory.createNodeSequence()['fragment'];
            const fragment3 = factory.createNodeSequence()['fragment'];

            if (markup.length === 0) {
              if (!(fragment1 === undefined && fragment2 === undefined && fragment3 === undefined)) {
                throw new Error('Expected all fragments to be undefined');
              }
            } else {
              if (fragment1 === fragment2 || fragment1 === fragment3 || fragment2 === fragment3) {
                throw new Error('Expected all fragments to be different instances');
              }
            }
          });
        }
      }
    }

    const validInputArr: any[] = ['', 'asdf', 'div', 1, true, false, {}, new Error(), undefined, null, Symbol()];
    for (const validInput of validInputArr) {
      it(`should not throw for valid input type "${typeof validInput}"`, () => {
        verifyDoesNotThrow(() => new NodeSequenceFactory(ctx.dom, validInput));
      });
    }

    const invalidInputArr: any[] = [];
    for (const invalidInput of invalidInputArr) {
      it(`should throw for invalid input type "${typeof invalidInput}"`, () => {
        verifyThrows(() => new NodeSequenceFactory(ctx.dom, invalidInput));
      });
    }
  });
});

describe('dom', () => {
  const ctx = TestContext.createHTMLTestContext();
  // reset dom after each test to make sure self-optimizations do not affect test outcomes
  const DOMBackup = Object.create(null);
  // reset doc after each test to clear any spies
  const DocumentBackup = Object.create(null);

  function restoreBackups(): void {
    Object.assign(ctx.dom, DOMBackup);
    Object.assign(ctx.doc, DocumentBackup);
  }

  before(() => {
    Object.assign(DOMBackup, ctx.dom);
    for (const propName in ctx.doc) {
      const prop = ctx.doc[propName];
      if (typeof prop === 'function') {
        DocumentBackup[propName] = prop;
      }
    }
  });

  afterEach(() => {
    restoreBackups();
  });

  describe('createElement', () => {
    it('should call document.createElement', () => {
      const spyCreateElement = ctx.doc.createElement = spy();
      ctx.dom.createElement('div');
      expect(spyCreateElement).to.have.been.calledWith('div');
    });

    it('should create an element', () => {
      const el = ctx.dom.createElement('div');
      expect(el['outerHTML']).to.equal('<div></div>');
    });

    const validInputArr: any[] = ['asdf', 'div', new Error(), true, false, undefined, null];
    for (const validInput of validInputArr) {
      it(`should not throw for valid input type "${typeof validInput}"`, () => {
        verifyDoesNotThrow(ctx.dom.createElement.bind(ctx.dom, validInput));
      });
    }

    const invalidInputArr: any[] = ['', 1, {}, Object.create(null), Symbol()];
    for (const invalidInput of invalidInputArr) {
      it(`should throw for invalid input type "${typeof invalidInput}"`, () => {
        verifyThrows(ctx.dom.createElement.bind(ctx.dom, invalidInput));
      });
    }
  });

  describe('cloneNode', () => {
    const trueValueArr: any[] = [undefined, null, {}, '', true];
    for (const trueValue of trueValueArr) {
      it(`should call node.cloneNode(true) when given ${trueValue}`, () => {
        const node = ctx.dom.createElement('div');
        node.cloneNode = spy();
        ctx.dom.cloneNode(node, trueValue);
        expect(node.cloneNode).to.have.been.calledWith(true);
      });
    }

    it('should call node.cloneNode(true) by default', () => {
      const node = ctx.dom.createElement('div');
      node.cloneNode = spy();
      ctx.dom.cloneNode(node);
      expect(node.cloneNode).to.have.been.calledWith(true);
    });

    it('should call node.cloneNode(false) if given false', () => {
      const node = ctx.dom.createElement('div');
      node.cloneNode = spy();
      ctx.dom.cloneNode(node, false);
      expect(node.cloneNode).to.have.been.calledWith(false);
    });
  });

  describe('isNodeInstance', () => {
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
      it(`should return true if the value is of type ${Object.prototype.toString.call(node)} (${text})`, () => {
        const actual = ctx.dom.isNodeInstance(node);
        expect(actual).to.equal(true);
      });
    }

    const nonNodes = [
      ctx.doc.createEvent('MouseEvent'),
      {}
    ];
    for (const nonNode of nonNodes) {
      it(`should return false if the value is of type ${Object.prototype.toString.call(nonNode)}`, () => {
        const actual = ctx.dom.isNodeInstance(nonNode);
        expect(actual).to.equal(false);
      });
    }
  });

  describe('remove', () => {
    it('should remove the childNode from its parent (non-polyfilled)', () => {
      const node = ctx.dom.createElement('div');
      const childNode = ctx.dom.createElement('div');
      node.appendChild(childNode);
      ctx.dom.remove(childNode);
      expect(node.childNodes.length).to.equal(0);
    });

    it('should remove the childNode from its parent (polyfilled)', () => {
      const remove = ctx.Element.prototype.remove;
      ctx.Element.prototype.remove = undefined;
      const node = ctx.dom.createElement('div');
      const childNode = ctx.dom.createElement('div');
      node.appendChild(childNode);
      ctx.dom.remove(childNode);
      expect(node.childNodes.length).to.equal(0);
      ctx.Element.prototype.remove = remove;
    });
  });

  describe('appendChild', () => {
    it('should append the childNode to the given parent', () => {
      const node = ctx.dom.createElement('div');
      const childNode = ctx.dom.createElement('div');
      ctx.dom.appendChild(node, childNode);
      expect(node.firstChild === childNode).to.equal(true);
    });
  });

  describe('insertBefore', () => {
    it('should insert the childNode before the referenceNode below the parent of the referenceNode', () => {
      const node = ctx.dom.createElement('div');
      const childNode = ctx.dom.createElement('div');
      const refNode1 = ctx.dom.createElement('div');
      const refNode2 = ctx.dom.createElement('div');
      node.appendChild(refNode1);
      node.appendChild(refNode2);
      ctx.dom.insertBefore(childNode, refNode2);
      expect(node.childNodes.item(0) === refNode1).to.equal(true);
      expect(node.childNodes.item(1) === childNode).to.equal(true);
      expect(node.childNodes.item(2) === refNode2).to.equal(true);
    });
  });

  describe('addEventListener', () => {
    it('should add the specified eventListener to the node if the node is specified', done => {
      const node = ctx.dom.createElement('div');
      const eventListener = spy();
      ctx.dom.addEventListener('click', eventListener, node);
      node.dispatchEvent(new ctx.CustomEvent('click', { bubbles: true }));
      setTimeout(() => {
        expect(eventListener).to.have.been.calledOnce;
        done();
      },         0);
    });

    it('should add the specified eventListener to the document if the node is NOT specified', done => {
      const eventListener = spy();
      ctx.dom.addEventListener('click', eventListener);
      ctx.doc.dispatchEvent(new ctx.CustomEvent('click', { bubbles: true }));
      setTimeout(() => {
        expect(eventListener).to.have.been.calledOnce;
        done();
      },         0);
    });
  });

  describe('removeEventListener', () => {
    it('should remove the specified eventListener from the node if the node is specified', done => {
      const node = ctx.dom.createElement('div');
      const eventListener = spy();
      node.addEventListener('click', eventListener);
      ctx.dom.removeEventListener('click', eventListener, node);
      node.dispatchEvent(new ctx.CustomEvent('click', { bubbles: true }));
      setTimeout(() => {
        expect(eventListener).not.to.have.been.called;
        done();
      },         0);
    });

    it('should remove the specified eventListener from the document if the node is NOT specified', done => {
      const eventListener = spy();
      ctx.doc.addEventListener('click', eventListener);
      ctx.dom.removeEventListener('click', eventListener);
      ctx.doc.dispatchEvent(new ctx.CustomEvent('click', { bubbles: true }));
      setTimeout(() => {
        expect(eventListener).not.to.have.been.called;
        done();
      },         0);
    });
  });

  describe('convertToRenderLocation', () => {
    function createTestNodes() {
      const node = ctx.dom.createElement('div');
      const childNode = ctx.dom.createElement('div');
      node.appendChild(childNode);
      return {node, childNode};
    }

    it('should replace the provided node with two comment nodes', () => {
      const {node, childNode} = createTestNodes();
      const location = ctx.dom.convertToRenderLocation(childNode);
      expect(location['nodeName']).to.equal('#comment');
      expect(location.$start['nodeName']).to.equal('#comment');
      expect(childNode === location).to.equal(false);
      expect(node.childNodes.length).to.equal(2);
      expect(node.firstChild === location).to.equal(false);
      expect(node.firstChild === location.$start).to.equal(true);
      expect(node.lastChild === location).to.equal(true);
    });
  });

  describe('registerElementResolver', () => {
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
      it(`should register the resolver for type ${Object.prototype.toString.call(key)}`, () => {
        const mockContainer: any = { registerResolver: spy() };
        const resolver: any = {};
        ctx.dom.registerElementResolver(mockContainer, resolver);
        expect(mockContainer.registerResolver).to.have.been.calledWith(key, resolver);
      });
    }
  });
});

describe('FragmentNodeSequence', () => {
  const ctx = TestContext.createHTMLTestContext();
  let sut: FragmentNodeSequence;

  const widthArr = [1, 2, 3];
  describe('constructor', () => {
    for (const width of widthArr) {
      it(`should correctly assign children (depth=1,width=${width})`, () => {
        const node = ctx.dom.createElement('div');
        const fragment = createFragment(ctx, node, 0, 1, width);
        sut = new FragmentNodeSequence(ctx.dom, fragment);
        expect(sut.childNodes.length).to.equal(width);
        expect(sut.childNodes[0] === sut.firstChild).to.equal(true);
        expect(sut.childNodes[width - 1] === sut.lastChild).to.equal(true);
      });
    }
  });
  const depthArr = [0, 1, 2, 3];
  describe('findTargets', () => {
    for (const width of widthArr) {
      for (const depth of depthArr) {
        // note: these findTargets tests are quite redundant, but the basic setup might come in handy later
        it(`should return empty array when there are no targets (depth=${depth},width=${width})`, () => {
          const node = ctx.dom.createElement('div');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.dom, fragment);
          const actual = sut.findTargets();
          expect(actual.length).to.equal(0);
        });

        it(`should return all elements when all are targets targets (depth=${depth},width=${width})`, () => {
          const node = ctx.dom.createElement('div');
          node.classList.add('au');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.dom, fragment);
          const actual = sut.findTargets();
          expect(actual.length).to.equal(fragment.querySelectorAll('div').length);
        });
      }
    }
  });

  describe('insertBefore', () => {
    for (const width of widthArr) {
      for (const depth of depthArr.filter(d => d > 0)) {
        it(`should insert the view before the refNode under the parent of the refNode (depth=${depth},width=${width})`, () => {
          const node = ctx.dom.createElement('div');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.dom, fragment);
          const parent = ctx.dom.createElement('div');
          const ref1 = ctx.dom.createElement('div');
          const ref2 = ctx.dom.createElement('div');
          parent.appendChild(ref1);
          parent.appendChild(ref2);
          // @ts-ignore
          sut.insertBefore(ref2);
          expect(parent.childNodes.length).to.equal(width + 2);
          expect(fragment.childNodes.length).to.equal(0);
          expect(parent.childNodes.item(0) === ref1).to.equal(true);
          let i = 0;
          while (i < width) {
            expect(parent.childNodes.item(i + 1) === sut.childNodes[i]).to.equal(true);
            i++;
          }
          expect(parent.childNodes.item(width + 1) === ref2).to.equal(true);
          expect(fragment.childNodes.length).to.equal(0);
        });
      }
    }
  });

  describe('appendTo', () => {
    for (const width of widthArr) {
      for (const depth of depthArr.filter(d => d > 0)) {
        it(`should append the view to the parent (depth=${depth},width=${width})`, () => {
          const node = ctx.dom.createElement('div');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.dom, fragment);
          const parent = ctx.dom.createElement('div');
          sut.appendTo(parent);
          expect(parent.childNodes.length).to.equal(width);
          expect(fragment.childNodes.length).to.equal(0);
          let i = 0;
          while (i < width) {
            expect(parent.childNodes.item(i) === sut.childNodes[i]).to.equal(true);
            i++;
          }
        });
      }
    }
  });

  describe('remove', () => {
    for (const width of widthArr) {
      for (const depth of depthArr.filter(d => d > 0)) {
        it(`should put the view back into the fragment (depth=${depth},width=${width})`, () => {
          const node = ctx.dom.createElement('div');
          const fragment = createFragment(ctx, node, 0, depth, width);
          sut = new FragmentNodeSequence(ctx.dom, fragment);
          const parent = ctx.dom.createElement('div');
          expect(parent.childNodes.length).to.equal(0);
          expect(fragment.childNodes.length).to.equal(width);
          parent.appendChild(fragment);
          expect(parent.childNodes.length).to.equal(width);
          expect(fragment.childNodes.length).to.equal(0);
          sut.remove();
          expect(parent.childNodes.length).to.equal(0);
          expect(fragment.childNodes.length).to.equal(width);
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
