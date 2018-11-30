import { Node } from './Node';
import { Document } from './Document';

// interface CharacterData // https://dom.spec.whatwg.org/#characterdata
export class CharacterData extends Node {

  data: string;

  constructor(ownerDocument: Document, data: string) {
    super(ownerDocument);
    this.data = data;
  }
};
