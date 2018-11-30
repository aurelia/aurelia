import { Node } from './Node';
import { CharacterData } from './CharacterData';
import { Document } from './Document';

// interface Text // https://dom.spec.whatwg.org/#text
export class Text extends CharacterData {

  constructor(ownerDocument: Document, text: string) {
    super(ownerDocument, text);
    this.nodeType = Node.TEXT_NODE;
    this.nodeName = '#text';
  }

  get wholeText(): string {
    let text = this.textContent;
    let prev = this.previousSibling;
    while (prev && prev.nodeType === 3) {
      text = prev.textContent + text;
      prev = prev.previousSibling;
    }
    let next = this.nextSibling;
    while (next && next.nodeType === 3) {
      text = text + next.textContent;
      next = next.nextSibling;
    }
    return text;
  }

  set wholeText(_val: string) { }
};
