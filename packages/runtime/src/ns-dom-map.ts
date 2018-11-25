import { NsDOM, INsNode } from './ns-dom';
import { Button } from 'tns-core-modules/ui/button';
import { Label } from 'tns-core-modules/ui/label';
import { TextBase } from 'tns-core-modules/ui/text-base';
import { Page } from 'tns-core-modules/ui/page';
import { Frame } from 'tns-core-modules/ui/frame/frame';
import { View } from 'tns-core-modules/ui/core/view';

(map => {
  map('Page', () => new Page());
  map('Button', () => new Button());
  map('Label', () => new Label());
  map('Text', () => new TextBase());
  map('Frame', () => new Frame());
})(NsDOM.map);

/**
 * Extends PIXI container functionality of first child and last child
 */
([
  ['firstChild', function(this: INsNode): INsNode | null {
      let childView: INsNode;
      this.eachChildView(view => !!(childView = view, false));
      return childView || null;
    }
  ],
  ['lastChild', function(this: INsNode): INsNode | null {
    let childView: INsNode;
    // just iterate through all and get the last
    this.eachChildView((view) => !(childView = view, false));
    return childView || null;
  }],
  ['insertBefore', function<T extends INsNode = INsNode>(this: INsNode, newChild: T, refChild: INsNode): T {
    if (refChild.parent !== this) {
      throw new Error('Invalid referenced Child view');
    }
    return NsDOM.insertBefore(newChild, refChild);
  }, true],
  ['nextSibling', function(this: INsNode) {
    const parent = this.parent as INsNode;
    if (parent) {
      let nextSibling: INsNode | null = null;
      let next = false;
      parent.eachChildView(view => {
        if (view === this) {
          // signal the next one is the right one
          return next = true;
        }
        if (next) {
           nextSibling = view;
           return false;
        }
        return true;
      });
      return nextSibling || null;
    }
    return null;
  }],
  ['previousSibling', function(this: INsNode) {
    const parent = this.parent as INsNode;
    if (parent) {
      let previousSibling: INsNode | null = null;
      parent.eachChildView(view => {
        if (view === this) {
          return false;
        }
        previousSibling = view;
        return true;
      });
      return previousSibling;
    }
    return null;
  }],
] as [string, (...args: any[]) => any, boolean?][]).forEach(([prop, fn, isMethod]) => {
  Reflect.defineProperty(
    View.prototype,
    prop,
    isMethod
      ? { configurable: true, value: fn }
      : { configurable: true, get: fn }
  );
});

