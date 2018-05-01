import { PLATFORM } from "../platform";
import { IEmulatedShadowSlot } from "./shadow-dom";
import { IScope } from "../binding/binding-context";
import { IBindScope } from "../binding/observation";
import { IAttach } from "./lifecycle";
import { DI, IContainer } from "../di";
import { ITemplate } from "./view-engine";
import { Constructable } from "../interfaces";
import { ICompiledViewSource } from "./instructions";
import { INode, DOM } from "../dom";
import { IElementComponent } from "./component";

export interface IView {
  firstChild: INode;
  lastChild: INode;
  childNodes: ArrayLike<INode>;

  findTargets(): ArrayLike<INode>;
  appendChild(child: INode): void;
  insertBefore(refNode: INode): void;
  appendTo(parent: INode): void;
  remove(): void;
}

export interface IViewOwnerType extends Constructable<IViewOwner> {
  template: ITemplate;
  source: ICompiledViewSource;
}

export const IViewOwner = DI.createInterface('IViewOwner');

export interface IViewOwner {
  $view: IView;
  $scope: IScope;
  $isBound: boolean;

  $bindable: IBindScope[];
  $attachable: IAttach[];

  $slots?: Record<string, IEmulatedShadowSlot>;
}

const noopView: IView = {
  firstChild: null,
  lastChild: null,
  childNodes: PLATFORM.emptyArray,
  findTargets() { return PLATFORM.emptyArray; },
  insertBefore(refNode: INode): void {},
  appendTo(parent: INode): void {},
  remove(): void {},
  appendChild(child: INode) {}
};

export const View = {
  none: noopView,
  fromCompiledFactory(factory: () => INode): IView {
    return new TemplateView(factory);
  },
  fromCompiledContent(host: INode, contentOverride?: INode): IView {
    if (DOM.isUsingSlotEmulation(host)) {
      return new ContentView(contentOverride || host);
    } else {
      return noopView;
    }
  },
  fromNode(node: INode): IView {
    return {
      firstChild: node,
      lastChild: node,
      childNodes: [node],
      findTargets(): ReadonlyArray<INode> {
        return PLATFORM.emptyArray;
      },
      appendChild(node: INode) {
        DOM.appendChild(node, node);
      },
      insertBefore(refNode: INode): void {
        DOM.insertBefore(node, refNode);
      },
      appendTo(parent: INode): void {
        DOM.appendChild(parent, node);
      },
      remove(): void {
        DOM.removeNode(node);
      }
    };
  }
};

class ContentView implements IView {
  firstChild: INode;
  lastChild: INode;
  childNodes: INode[];

  constructor(private element: INode) {
    let current: INode;
    let childNodes = this.childNodes = new Array(element.childNodes.length);
    let i = -1;

    while(current = element.firstChild) {
      DOM.removeNode(current);
      childNodes[++i] = current;
    }

    this.firstChild = childNodes[0];
    this.lastChild = childNodes[i];
  }

  findTargets() { return PLATFORM.emptyArray; }
  appendChild(child: INode) {}
  insertBefore(refNode: INode): void {}
  appendTo(parent: INode): void {}
  remove(): void {}
}

class TemplateView implements IView {
  private instance: INode;

  firstChild: INode;
  lastChild: INode;

  constructor(factory: () => INode) {
    this.instance = factory();
    this.firstChild = this.instance.firstChild;
    this.lastChild = this.instance.lastChild;
  }

  get childNodes() {
    return this.instance.childNodes;
  }

  appendChild(node: INode) {
    DOM.appendChild(this.instance, node);
  }

  findTargets(): ArrayLike<INode> {
    return DOM.findCompileTargets(this.instance);
  }

  insertBefore(refNode: INode): void {
    DOM.insertBefore(this.instance, refNode);
  }

  appendTo(parent: INode): void {
    DOM.appendChild(parent, this.instance);
  }

  remove(): void {
    let fragment = this.instance;
    let current = this.firstChild;
    let end = this.lastChild;
    let append = DOM.appendChild;
    let next;

    while (current) {
      next = current.nextSibling;
      append(fragment, current);

      if (current === end) {
        break;
      }

      current = next;
    }
  }
}
