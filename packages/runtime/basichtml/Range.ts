// WARNING: this class is incomplete and
//          it doesn't fully reflect the whole client side API
import { DocumentFragment } from './DocumentFragment';

function append(node) {
  this.appendChild(node);
}

function clone(node) {
  return node.cloneNode(true);
}

function remove(node) {
  this.removeChild(node);
}

function getContents(start, end) {
  const nodes = [start];
  while (start !== end) {
    nodes.push(start = start.nextSibling);
  }
  return nodes;
}

// interface Text // https://dom.spec.whatwg.org/#text
export class Range {

  _start: any;
  _end: any;

  cloneContents() {
    const fragment = new DocumentFragment(this._start.ownerDocument);
    getContents(this._start, this._end).map(clone).forEach(append, fragment);
    return fragment;
  }

  deleteContents() {
    getContents(this._start, this._end)
      .forEach(remove, this._start.parentNode);
  }

  extractContents() {
    const fragment = new DocumentFragment(this._start.ownerDocument);
    const nodes = getContents(this._start, this._end);
    nodes.forEach(remove, this._start.parentNode);
    nodes.forEach(append, fragment);
    return fragment;
  }

  cloneRange() {
    const range = new Range;
    range._start = this._start;
    range._end = this._end;
    return range;
  }

  setStartAfter(node) {
    this._start = node.nextSibling;
  }

  setStartBefore(node) {
    this._start = node;
  }

  setEndAfter(node) {
    this._end = node;
  }

  setEndBefore(node) {
    this._end = node.previousSibling;
  }

};
