import { PLATFORM } from "../platform";
import { IEmulatedShadowSlot } from "./shadow-dom";
import { IScope } from "../binding/binding-context";
import { IBindScope } from "../binding/observation";
import { IAttach } from "./lifecycle";
import { DI, IContainer } from "../di";
import { ITemplate } from "./view-engine";
import { Constructable } from "../interfaces";
import { ICompiledViewSource } from "./instructions";
import { INode, DOM, IChildObserver, IView } from "../dom";
import { IElementComponent } from "./component";

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
  fromCompiledContent(contentHost: INode, contentOverride?: INode): IContentView | null {
    if (DOM.isUsingSlotEmulation(contentHost)) {
      return new ContentView(contentOverride || contentHost);
    } else {
      return null;
    }
  },
  fromNode(node: INode): IView {
    return {
      firstChild: node,
      lastChild: node,
      childNodes: [node],
      findTargets(): INode[] {
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
        DOM.remove(node);
      }
    };
  }
};

export interface IContentView extends IView {
  childObserver?: IContentViewChildObserver;
  attachChildObserver(onChildrenChanged: () => void): IContentViewChildObserver;
}

export interface IContentViewChildObserver extends IChildObserver {
  notifyChildrenChanged(): void;
}

class ContentView implements IContentView {
  firstChild: INode;
  lastChild: INode;
  childNodes: INode[];
  childObserver: IContentViewChildObserver = null;

  constructor(private contentHost: INode) {
    let childNodes = this.childNodes = Array.from(contentHost.childNodes)
    this.firstChild = childNodes[0];
    this.lastChild = childNodes[childNodes.length - 1];
  }

  attachChildObserver(onChildrenChanged: () => void) {
    let childNodes = this.childNodes;
    let observer = {
      get childNodes() {
        return childNodes;
      },
      disconnect() {
        onChildrenChanged = null;
      },
      notifyChildrenChanged() {
        if (onChildrenChanged !== null) {
          onChildrenChanged();
        }
      }
    };

    // TODO: materialize content

    return observer;
  }

  findTargets() { return PLATFORM.emptyArray; }
  appendChild(child: INode) {}
  insertBefore(refNode: INode): void {}
  appendTo(parent: INode): void {}
  remove(): void {}
}
