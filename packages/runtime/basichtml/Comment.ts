import { Node } from './Node';
import { CharacterData } from './CharacterData';
import { Document } from './Document';

// interface Comment // https://dom.spec.whatwg.org/#comment
export class Comment extends CharacterData {
  constructor(ownerDocument: Document, comment: string) {
    super(ownerDocument, comment);
    this.nodeType = Node.COMMENT_NODE;
    this.nodeName = '#comment';
  }
};
