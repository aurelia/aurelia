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
  fromCompiledContent(contentHost: INode, contentOverride?: INode): IView {
    if (DOM.isUsingSlotEmulation(contentHost)) {
      return new ContentView(contentOverride || contentHost);
    } else {
      return noopView;
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
        DOM.removeNode(node);
      }
    };
  }
};

/** @internal */ export class ContentView implements IView {
  firstChild: INode;
  lastChild: INode;
  childNodes: INode[];

  notifyChildrenChanged?: () => void; //Added by INodeObserver and called by RenderSlot

  constructor(private contentHost: INode) {
    let current: INode;
    let childNodes = this.childNodes = new Array(contentHost.childNodes.length);
    let i = -1;

    while(current = contentHost.firstChild) {
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
