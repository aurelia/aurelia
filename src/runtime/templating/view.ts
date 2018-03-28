import { DOM } from "../dom";
import { IViewOwner } from "./template";

export interface IView {
  firstChild: Node;
  lastChild: Node;
  childNodes: NodeList;

  findTargets(): ReadonlyArray<Element>;
  appendChild(child: Node): void;
  insertBefore(refNode: Node): void;
  appendTo(parent: Node): void;
  remove(): void;
}

export interface IRender {
  $view: IView;
}

const noNodes = Object.freeze([]);
const noopView: IView = {
  firstChild: Node = null,
  lastChild: Node = null,
  childNodes: <any>noNodes,
  findTargets() { return noNodes; },
  insertBefore(refNode: Node): void {},
  appendTo(parent: Node): void {},
  remove(): void {},
  appendChild(child: Node) {}
};

export const View = {
  none: noopView,
  fromCompiledTemplate(element: HTMLTemplateElement): IView {
    return new TemplateView(element);
  },
  fromCompiledElementContent(owner: IViewOwner, element: Element): IView {
    let contentElement = element.firstElementChild;

    if (contentElement !== null && contentElement !== undefined) {
      DOM.removeNode(contentElement);

      if (owner.$useShadowDOM) {
        while(contentElement.firstChild) {
          element.appendChild(contentElement.firstChild);
        }
      } else {
        return new ContentView(contentElement);
      }
    }
    
    return noopView;
  }
};

class ContentView implements IView {
  firstChild: Node;
  lastChild: Node;

  constructor(private element: Element) {
    this.firstChild = this.element.firstChild;
    this.lastChild = this.element.lastChild;
  }

  get childNodes() {
    return this.element.childNodes;
  }

  appendChild(child: Node) {
    this.element.appendChild(child);
  }

  findTargets() { return noNodes; }
  insertBefore(refNode: Node): void {}
  appendTo(parent: Node): void {}
  remove(): void {}
}

class TemplateView implements IView {
  private fragment: DocumentFragment;

  firstChild: Node;
  lastChild: Node;

  constructor(template: HTMLTemplateElement) {
    this.fragment = (<HTMLTemplateElement>template.cloneNode(true)).content;
    this.firstChild = this.fragment.firstChild;
    this.lastChild = this.fragment.lastChild;
  }

  get childNodes() {
    return this.fragment.childNodes;
  }

  appendChild(node: Node) {
    this.fragment.appendChild(node);
  }

  findTargets(): ReadonlyArray<Element> {
    return <any>this.fragment.querySelectorAll('.au');
  }

  insertBefore(refNode: Node): void {
    refNode.parentNode.insertBefore(this.fragment, refNode);
  }

  appendTo(parent: Node): void {
    parent.appendChild(this.fragment);
  }

  remove(): void {
    let fragment = this.fragment;
    let current = this.firstChild;
    let end = this.lastChild;
    let next;

    while (current) {
      next = current.nextSibling;
      fragment.appendChild(current);

      if (current === end) {
        break;
      }

      current = next;
    }
  }
}
