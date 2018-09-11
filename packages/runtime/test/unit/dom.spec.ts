import { spy } from 'sinon';
import { expect } from 'chai';
import { DOM, INode, FragmentNodeSequence } from '../../src/index';

function wrap(inner: string, tag: string): string {
  if (tag.length === 0) {
    return inner;
  }
  return `<${tag}>${inner}</${tag}>`;
}

function verifyThrows(call: Function): void {
  let err;
  try {
    call();
  } catch(e) {
    err = e;
  }
  expect(err instanceof Error).to.be.true;
}

function verifyDoesNotThrow(call: Function): void {
  let err;
  try {
    call();
  } catch(e) {
    err = e;
  }
  expect(err).to.be.undefined;
}

describe('DOM', () => {
  // reset DOM after each test to make sure self-optimizations do not affect test outcomes
  const DOMBackup = Object.create(null);
  // reset document after each test to clear any spies
  const DocumentBackup = Object.create(null);

  function restoreBackups(): void {
    Object.assign(DOM, DOMBackup);
    Object.assign(document, DocumentBackup);
  }

  before(() => {
    Object.assign(DOMBackup, DOM);
    for (const propName in document) {
      const prop = document[propName];
      if (typeof prop === 'function') {
        DocumentBackup[propName] = prop;
      }
    }
  });

  afterEach(() => {
    restoreBackups();
  });

  describe('createFactoryFromMarkupOrNode', () => {
    const textArr = ['', 'text', '#text'];
    const elementsArr = [[''], ['div'], ['div', 'p']];
    const wrapperArr = ['', 'div', 'template'];

    for (const text of textArr) {

      for (const elements of elementsArr) {
        let elementsMarkup = elements.map(e => wrap(text, e)).join('');

        for (const wrapper of wrapperArr) {
          const markup = wrap(elementsMarkup, wrapper);

          it(`should create a factory that returns the correct markup for "${markup}"`, () => {
            const factory = DOM.createFactoryFromMarkupOrNode(markup);
            const view = factory();
            const fragment = <DocumentFragment>view['fragment'];
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
          });

          it(`should create a factory that always returns a view with a different fragment instance for "${markup}"`, () => {
            const factory = DOM.createFactoryFromMarkupOrNode(markup);
            const fragment1 = factory()['fragment'];
            const fragment2 = factory()['fragment'];
            const fragment3 = factory()['fragment'];

            if (fragment1 === fragment2 || fragment1 === fragment3 || fragment2 === fragment3) {
              throw new Error('Expected all fragments to be different instances');
            }
          });
        }
      }
    }

    const validInputArr: any[] = ['', 'asdf', 'div', 1, true, false, {}, new Error(), null, undefined];
    for (const validInput of validInputArr) {
      it(`should not throw for valid input type "${typeof validInput}"`, () => {
        verifyDoesNotThrow(DOM.createFactoryFromMarkupOrNode.bind(null, validInput));
      });
    }

    const invalidInputArr: any[] = [Symbol()];
    for (const invalidInput of invalidInputArr) {
      it(`should throw for invalid input type "${typeof invalidInput}"`, () => {
        verifyThrows(DOM.createFactoryFromMarkupOrNode.bind(null, invalidInput));
      });
    }
  });

  describe('createElement', () => {
    it('should call document.createElement', () => {
      const spyCreateElement = document.createElement = spy();
      DOM.createElement('div');
      expect(spyCreateElement).to.have.been.calledWith('div');
    });

    it('should create an element', () => {
      const el = DOM.createElement('div');
      expect(el['outerHTML']).to.equal('<div></div>');
    });

    const validInputArr: any[] = ['asdf', 'div', new Error(), true, false, undefined, null];
    for (const validInput of validInputArr) {
      it(`should not throw for valid input type "${typeof validInput}"`, () => {
        verifyDoesNotThrow(DOM.createElement.bind(null, validInput));
      });
    }

    const invalidInputArr: any[] = ['', 1, {}, Object.create(null), Symbol()];
    for (const invalidInput of invalidInputArr) {
      it(`should throw for invalid input type "${typeof invalidInput}"`, () => {
        verifyThrows(DOM.createElement.bind(null, invalidInput));
      });
    }
  });

  describe('createChildObserver (no slot emulation)', () => {
    it('should return a MutationObserver', () => {
      const cb = spy();
      const node = document.createElement('div');
      const observer = DOM.createNodeObserver(node, cb, { characterData: true });
      expect(observer instanceof MutationObserver).to.be.true;
    });

    it('should observe changes to the childNodes', done => {
      const cb = spy();
      const node = document.createElement('div');
      const child = document.createElement('div');
      DOM.createNodeObserver(node, cb, { childList: true });
      node.appendChild(child);
      Promise.resolve().then(() => {
        expect(cb).to.have.been.calledOnce;
        done();
      });
    });
  });

  // describe('platformSupportsShadowDOM', () => {
  //   let attachShadow;
  //   beforeEach(() => {
  //     attachShadow = HTMLElement.prototype.attachShadow;
  //   });
  //   afterEach(() => {
  //     HTMLElement.prototype.attachShadow = attachShadow;
  //   });

  //   it('should return true if ShadowDOM is available', () => {
  //     HTMLElement.prototype.attachShadow = <any>function(){};
  //     expect(DOM.platformSupportsShadowDOM()).to.be.true;
  //   });

  //   it('should return false if ShadowDOM is NOT available', () => {
  //     HTMLElement.prototype.attachShadow = undefined;
  //     expect(DOM.platformSupportsShadowDOM()).to.be.false;
  //   });
  // });

  // describe('createElementViewHost (with NO ShadowDOM)', () => {
  //   let attachShadow;
  //   beforeEach(() => {
  //     attachShadow = HTMLElement.prototype.attachShadow;
  //     HTMLElement.prototype.attachShadow = undefined;
  //   });

  //   afterEach(() => {
  //     HTMLElement.prototype.attachShadow = attachShadow;
  //   });

  //   it('should enable SlotEmulation when no options provided', () => {
  //     const node = document.createElement('div');
  //     const actual: any = DOM.createElementViewHost(node);
  //     expect(actual.$usingSlotEmulation).to.be.true;
  //   });

  //   it('should enable SlotEmulation when options are provided', () => {
  //     const node = document.createElement('div');
  //     const actual: any = DOM.createElementViewHost(node, <any>{});
  //     expect(actual.$usingSlotEmulation).to.be.true;
  //   });
  // });

  // describe('createElementViewHost (with ShadowDOM)', () => {
  //   let attachShadow;
  //   beforeEach(() => {
  //     attachShadow = HTMLElement.prototype.attachShadow;
  //     HTMLElement.prototype.attachShadow = spy(node => node);
  //   });

  //   afterEach(() => {
  //     HTMLElement.prototype.attachShadow = attachShadow;
  //   });

  //   it('should enable SlotEmulation when no options provided', () => {
  //     const node = document.createElement('div');
  //     const actual: any = DOM.createElementViewHost(node);
  //     expect(actual.$usingSlotEmulation).to.be.true;
  //   });

  //   it('should NOT attachShadow when no options provided', () => {
  //     const node = document.createElement('div');
  //     DOM.createElementViewHost(node);
  //     expect(HTMLElement.prototype.attachShadow).not.to.have.been.called;
  //   });

  //   it('should NOT enable SlotEmulation when options are provided', () => {
  //     const node = document.createElement('div');
  //     const actual: any = DOM.createElementViewHost(node, <any>{});
  //     expect(actual.$usingSlotEmulation).to.be.undefined;
  //   });

  //   it('should attachShadow when options are provided', () => {
  //     const node = document.createElement('div');
  //     DOM.createElementViewHost(node, <any>{});
  //     expect(HTMLElement.prototype.attachShadow).to.have.been.calledOnce;
  //   });
  // });

  describe('cloneNode', () => {
    const trueValueArr: any[] = [undefined, null, {}, '', true];
    for (const trueValue of trueValueArr) {
      it(`should call node.cloneNode(true) when given ${trueValue}`, () => {
        const node = document.createElement('div');
        node.cloneNode = spy();
        DOM.cloneNode(node, trueValue);
        expect(node.cloneNode).to.have.been.calledWith(true);
      });
    }

    it('should call node.cloneNode(true) by default', () => {
      const node = document.createElement('div');
      node.cloneNode = spy();
      DOM.cloneNode(node);
      expect(node.cloneNode).to.have.been.calledWith(true);
    });

    it('should call node.cloneNode(false) if given false', () => {
      const node = document.createElement('div');
      node.cloneNode = spy();
      DOM.cloneNode(node, false);
      expect(node.cloneNode).to.have.been.calledWith(false);
    });
  });

  // describe('getCustomElementForNode', () => {
  //   it(`should return node.$component if it is a non-null object`, () => {
  //     const node: any = document.createElement('div');
  //     const expected = node.$component = {};
  //     const actual = DOM.getCustomElementForNode(node);
  //     expect(actual === expected).to.be.true;
  //   });

  //   it(`should return null if node.$component is null`, () => {
  //     const node: any = document.createElement('div');
  //     node.$component = null;
  //     const actual = DOM.getCustomElementForNode(node);
  //     expect(actual).to.be.null;
  //   });

  //   it(`should return null if node.$component is undefined`, () => {
  //     const node: any = document.createElement('div');
  //     node.$component = undefined;
  //     const actual = DOM.getCustomElementForNode(node);
  //     expect(actual).to.be.null;
  //   });
  // });

  // describe('isUsingSlotEmulation', () => {
  //   it('should return true if node.$usingSlotEmulation is true', () => {
  //     const node: any = document.createElement('div');
  //     node.$usingSlotEmulation = true;
  //     const actual = DOM.isUsingSlotEmulation(node);
  //     expect(actual).to.be.true;
  //   });

  //   it('should return false if node.$usingSlotEmulation is false', () => {
  //     const node: any = document.createElement('div');
  //     node.$usingSlotEmulation = false;
  //     const actual = DOM.isUsingSlotEmulation(node);
  //     expect(actual).to.be.false;
  //   });

  //   it('should return false if node.$usingSlotEmulation is unset', () => {
  //     const node: any = document.createElement('div');
  //     const actual = DOM.isUsingSlotEmulation(node);
  //     expect(actual).to.be.false;
  //   });
  // });

  describe('isNodeInstance', () => {
    const nodes = [
      document.createAttribute('asdf'),
      document.createElement('div'),
      document.createElement('asdf'),
      document.createComment('asdf'),
      document.createTextNode('asdf'),
      document.createDocumentFragment(),
      document,
      document.doctype
    ];
    for (const node of nodes) {
      it(`should return true if the value is of type ${Object.prototype.toString.call(node)}`, () => {
        const actual = DOM.isNodeInstance(node);
        expect(actual).to.be.true;
      });
    }

    const nonNodes = [
      document.createEvent('MouseEvent'),
      {}
    ];
    for (const nonNode of nonNodes) {
      it(`should return false if the value is of type ${Object.prototype.toString.call(nonNode)}`, () => {
        const actual = DOM.isNodeInstance(nonNode);
        expect(actual).to.be.false;
      });
    }
  });

  describe('isElementNodeType', () => {
    const nodes = [
      document.createElement('div'),
      document.createElement('asdf')
    ];
    for (const node of nodes) {
      it(`should return true if the value is of type ${Object.prototype.toString.call(node)}`, () => {
        const actual = DOM.isElementNodeType(node);
        expect(actual).to.be.true;
      });
    }

    const nonNodes = [
      document.createAttribute('asdf'),
      document.createComment('asdf'),
      document.createTextNode('asdf'),
      document.createDocumentFragment(),
      document,
      document.doctype
    ];
    for (const nonNode of nonNodes) {
      it(`should return false if the value is of type ${Object.prototype.toString.call(nonNode)}`, () => {
        const actual = DOM.isElementNodeType(nonNode);
        expect(actual).to.be.false;
      });
    }
  });

  describe('isTextNodeType', () => {
    const nodes = [
      document.createTextNode('asdf')
    ];
    for (const node of nodes) {
      it(`should return true if the value is of type ${Object.prototype.toString.call(node)}`, () => {
        const actual = DOM.isTextNodeType(node);
        expect(actual).to.be.true;
      });
    }

    const nonNodes = [
      document.createAttribute('asdf'),
      document.createComment('asdf'),
      document.createElement('div'),
      document.createElement('asdf'),
      document.createDocumentFragment(),
      document,
      document.doctype
    ];
    for (const nonNode of nonNodes) {
      it(`should return false if the value is of type ${Object.prototype.toString.call(nonNode)}`, () => {
        const actual = DOM.isTextNodeType(nonNode);
        expect(actual).to.be.false;
      });
    }
  });

  describe('remove', () => {
    it('should remove the childNode from its parent (non-polyfilled)', () => {
      const node = document.createElement('div');
      const childNode = document.createElement('div');
      node.appendChild(childNode);
      DOM.remove(childNode);
      expect(node.childNodes.length).to.equal(0);
    });

    it('should remove the childNode from its parent (polyfilled)', () => {
      const remove = Element.prototype.remove;
      Element.prototype.remove = undefined;
      const node = document.createElement('div');
      const childNode = document.createElement('div');
      node.appendChild(childNode);
      DOM.remove(childNode);
      expect(node.childNodes.length).to.equal(0);
      Element.prototype.remove = remove;
    });
  });

  describe('replaceNode', () => {
    it('should replace the childNode with another childNode', () => {
      const node = document.createElement('div');
      const childNodeOld = document.createElement('div');
      const childNodeNew = document.createElement('div');
      node.appendChild(childNodeOld);
      DOM.replaceNode(childNodeNew, childNodeOld);
      expect(node.firstChild === childNodeNew).to.be.true;
    });
  });

  describe('appendChild', () => {
    it('should append the childNode to the given parent', () => {
      const node = document.createElement('div');
      const childNode = document.createElement('div');
      DOM.appendChild(node, childNode);
      expect(node.firstChild === childNode).to.be.true;
    });
  });

  describe('insertBefore', () => {
    it('should insert the childNode before the referenceNode below the parent of the referenceNode', () => {
      const node = document.createElement('div');
      const childNode = document.createElement('div');
      const refNode1 = document.createElement('div');
      const refNode2 = document.createElement('div');
      node.appendChild(refNode1);
      node.appendChild(refNode2);
      DOM.insertBefore(childNode, refNode2);
      expect(node.childNodes.item(0) === refNode1).to.be.true;
      expect(node.childNodes.item(1) === childNode).to.be.true;
      expect(node.childNodes.item(2) === refNode2).to.be.true;
    });
  });

  describe('getAttribute', () => {
    it('should return the specified attribute', () => {
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const actual = DOM.getAttribute(node, 'foo');
      expect(actual).to.equal('bar');
    });
  });

  describe('setAttribute', () => {
    it('should set the specified attribute to the specified value', () => {
      const node = document.createElement('div');
      DOM.setAttribute(node, 'foo', 'bar');
      const actual = DOM.getAttribute(node, 'foo');
      expect(actual).to.equal('bar');
    });
  });

  describe('removeAttribute', () => {
    it('should remove the specified attribute', () => {
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      DOM.removeAttribute(node, 'foo');
      const actual = DOM.getAttribute(node, 'foo');
      expect(actual).to.be.null;
    });
  });

  describe('hasClass', () => {
    it('should return true if the node has the specified class', () => {
      const node = document.createElement('div');
      node.classList.add('foo');
      const actual = DOM.hasClass(node, 'foo');
      expect(actual).to.be.true;
    });

    it('should return false if the node does NOT have the specified class', () => {
      const node = document.createElement('div');
      node.classList.add('foo');
      const actual = DOM.hasClass(node, 'bar');
      expect(actual).to.be.false;
    });
  });

  describe('addClass', () => {
    it('should add the specified class', () => {
      const node = document.createElement('div');
      DOM.addClass(node, 'foo');
      const actual = node.classList.item(0);
      expect(actual).to.equal('foo');
    });
  });

  describe('removeClass', () => {
    it('should remove the specified class', () => {
      const node = document.createElement('div');
      node.classList.add('foo');
      DOM.removeClass(node, 'foo');
      const actual = node.classList.item(0);
      expect(actual).to.be.null;
    });
  });

  describe('addEventListener', () => {
    it('should add the specified eventListener to the node if the node is specified', done => {
      const node = document.createElement('div');
      const eventListener = spy();
      DOM.addEventListener('click', eventListener, node);
      node.dispatchEvent(new CustomEvent('click', { bubbles: true }));
      setTimeout(() => {
        expect(eventListener).to.have.been.calledOnce;
        done();
      }, 0);
    });

    it('should add the specified eventListener to the document if the node is NOT specified', done => {
      const eventListener = spy();
      DOM.addEventListener('click', eventListener);
      document.dispatchEvent(new CustomEvent('click', { bubbles: true }));
      setTimeout(() => {
        expect(eventListener).to.have.been.calledOnce;
        done();
      }, 0);
    });
  });

  describe('removeEventListener', () => {
    it('should remove the specified eventListener from the node if the node is specified', done => {
      const node = document.createElement('div');
      const eventListener = spy();
      node.addEventListener('click', eventListener);
      DOM.removeEventListener('click', eventListener, node);
      node.dispatchEvent(new CustomEvent('click', { bubbles: true }));
      setTimeout(() => {
        expect(eventListener).not.to.have.been.called;
        done();
      }, 0);
    });

    it('should remove the specified eventListener from the document if the node is NOT specified', done => {
      const eventListener = spy();
      document.addEventListener('click', eventListener);
      DOM.removeEventListener('click', eventListener);
      document.dispatchEvent(new CustomEvent('click', { bubbles: true }));
      setTimeout(() => {
        expect(eventListener).not.to.have.been.called;
        done();
      }, 0);
    });
  });

  describe('isAllWhitespace', () => {
    const whitespaceArr = ['', ' ', '\n', '\t', '\r'];
    for (const whitespace of whitespaceArr) {
      it('should return true if the textNode contains all whitespace', () => {
        const node = document.createTextNode(whitespace);
        const actual = DOM.isAllWhitespace(node);
        expect(actual).to.be.true;
      });

      it('should return false if the textNode contains all whitespace but is set to treatAsNonWhitespace', () => {
        const node = document.createTextNode(whitespace);
        DOM.treatAsNonWhitespace(node);
        const actual = DOM.isAllWhitespace(node);
        expect(actual).to.be.false;
      });

      it('should return false if the textNode contains any non-whitespace', () => {
        const node = document.createTextNode(whitespace + 'foo');
        const actual = DOM.isAllWhitespace(node);
        expect(actual).to.be.false;
      });
    }
  });

  describe('convertToRenderLocation', () => {
    function createTestNodes() {
      const node = document.createElement('div');
      const childNode = document.createElement('div');
      node.appendChild(childNode);
      return {node, childNode};
    }

    it('should replace the provided node with a comment node', () => {
      const {node, childNode} = createTestNodes();
      const location = DOM.convertToRenderLocation(childNode);
      expect(location instanceof Comment).to.be.true;
      expect(childNode === location).to.be.false;
      expect(node.childNodes.length).to.equal(1);
      expect(node.firstChild === location).to.be.true;
    });
  });

  describe('registerElementResolver', () => {
    const keys = [INode, Element, HTMLElement, SVGElement];
    for (const key of keys) {
      it(`should register the resolver for type ${Object.prototype.toString.call(key)}`, () => {
        const mockContainer: any = { registerResolver: spy() };
        const resolver: any = {};
        DOM.registerElementResolver(mockContainer, resolver);
        expect(mockContainer.registerResolver).to.have.been.calledWith(key, resolver);
      });
    }
  });
});

describe('FragmentNodeSequence', () => {
  let sut: FragmentNodeSequence;

  // describe('appendChild', () => {
  //   it('should add the child to the view', () => {
  //     const fragment = document.createDocumentFragment();
  //     sut = new TemplateView(fragment);
  //     const child = document.createElement('div');
  //     sut.appendChild(child);
  //     expect(fragment.firstChild === child).to.be.true;
  //   });
  // });

  const widthArr = [1, 2, 3];
  describe('constructor', () => {
    for (const width of widthArr) {
      it(`should correctly assign children (depth=1,width=${width})`, () => {
        const node = document.createElement('div');
        const fragment = createFragment(node, 0, 1, width);
        sut = new FragmentNodeSequence(fragment);
        expect(sut.childNodes.length).to.equal(width);
        expect(sut.childNodes[0] === sut.firstChild).to.be.true;
        expect(sut.childNodes[width - 1] === sut.lastChild).to.be.true;
      });
    }
  });
  const depthArr = [0, 1, 2, 3];
  describe('findTargets', () => {
    for (const width of widthArr) {
      for (const depth of depthArr) {
        // note: these findTargets tests are quite redundant, but the basic setup might come in handy later
        it(`should return empty array when there are no targets (depth=${depth},width=${width})`, () => {
          const node = document.createElement('div');
          const fragment = createFragment(node, 0, depth, width);
          sut = new FragmentNodeSequence(fragment);
          const actual = sut.findTargets();
          expect(actual.length).to.equal(0);
        });

        it(`should return all elements when all are targets targets (depth=${depth},width=${width})`, () => {
          const node = document.createElement('div');
          node.classList.add('au');
          const fragment = createFragment(node, 0, depth, width);
          sut = new FragmentNodeSequence(fragment);
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
          const node = document.createElement('div');
          const fragment = createFragment(node, 0, depth, width);
          sut = new FragmentNodeSequence(fragment);
          const parent = document.createElement('div');
          const ref1 = document.createElement('div');
          const ref2 = document.createElement('div');
          parent.appendChild(ref1);
          parent.appendChild(ref2);
          sut.insertBefore(ref2);
          expect(parent.childNodes.length).to.equal(width + 2);
          expect(fragment.childNodes.length).to.equal(0);
          expect(parent.childNodes.item(0) === ref1).to.be.true;
          let i = 0;
          while (i < width) {
            expect(parent.childNodes.item(i + 1) === sut.childNodes[i]).to.be.true;
            i++;
          }
          expect(parent.childNodes.item(width + 1) === ref2).to.be.true;
          expect(fragment.childNodes.length).to.equal(0);
        });
      }
    }
  });

  describe('appendTo', () => {
    for (const width of widthArr) {
      for (const depth of depthArr.filter(d => d > 0)) {
        it(`should append the view to the parent (depth=${depth},width=${width})`, () => {
          const node = document.createElement('div');
          const fragment = createFragment(node, 0, depth, width);
          sut = new FragmentNodeSequence(fragment);
          const parent = document.createElement('div');
          sut.appendTo(parent);
          expect(parent.childNodes.length).to.equal(width);
          expect(fragment.childNodes.length).to.equal(0);
          let i = 0;
          while (i < width) {
            expect(parent.childNodes.item(i) === sut.childNodes[i]).to.be.true;
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
          const node = document.createElement('div');
          const fragment = createFragment(node, 0, depth, width);
          sut = new FragmentNodeSequence(fragment);
          const parent = document.createElement('div');
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

function createFragment(node: HTMLElement, level: number, depth: number, width: number): DocumentFragment {
  const root: any = document.createDocumentFragment();
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

function appendChildren(parent: HTMLElement, child: HTMLElement, count: number): Array<HTMLElement> {
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
