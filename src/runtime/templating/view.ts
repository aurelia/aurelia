import { DOM, PLATFORM } from "../pal";
import { IEmulatedShadowSlot } from "./shadow-dom";
import { IScope } from "../binding/binding-context";
import { IBindScope } from "../binding/observation";
import { IAttach } from "./lifecycle";
import { DI, IContainer } from "../di";
import { ITemplate } from "./view-engine";
import { Constructable } from "../interfaces";
import { ICompiledViewSource } from "./instructions";

export interface IView {
  firstChild: Node;
  lastChild: Node;
  childNodes: ArrayLike<Node>;

  findTargets(): ReadonlyArray<Node>;
  appendChild(child: Node): void;
  insertBefore(refNode: Node): void;
  appendTo(parent: Node): void;
  remove(): void;
}

export const IViewOwner = DI.createInterface('IViewOwner');

export interface IViewOwnerType extends Constructable<IViewOwner> {
  template: ITemplate;
  source: ICompiledViewSource;
}
export interface IViewOwner {
  $view: IView;
  $scope: IScope;
  $isBound: boolean;

  $bindable: IBindScope[];
  $attachable: IAttach[];

  $slots?: Record<string, IEmulatedShadowSlot>;
  $useShadowDOM?: boolean;
}

const noopView: IView = {
  firstChild: Node = null,
  lastChild: Node = null,
  childNodes: PLATFORM.emptyArray,
  findTargets() { return PLATFORM.emptyArray; },
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
  fromCompiledElementContent(owner: IViewOwner, element: Element, contentElement?: Element): IView {
    contentElement = contentElement || element.firstElementChild;

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
  },
  fromElement(element: Element): IView {
    return {
      firstChild: element,
      lastChild: element,
      childNodes: [element],
      findTargets(): ReadonlyArray<Element> {
        return PLATFORM.emptyArray;
      },
      appendChild(node: Node) {
        element.appendChild(node);
      },
      insertBefore(refNode: Node): void {
        refNode.parentNode.insertBefore(element, refNode);
      },
      appendTo(parent: Node): void {
        parent.appendChild(element);
      },
      remove(): void {
        element.remove();
      }
    };
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

  findTargets() { return PLATFORM.emptyArray; }
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
