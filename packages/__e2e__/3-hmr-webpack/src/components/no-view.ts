import { noView } from '@aurelia/compat-v1';
import { INode, resolve } from 'aurelia';

@noView
export class NoView {
  private readonly node: HTMLElement = resolve(INode) as HTMLElement;
  public attached() {
    this.node.textContent = 'Nothing to see here';
  }
}
