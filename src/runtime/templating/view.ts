import { PLATFORM } from '../../kernel/platform';
import { IEmulatedShadowSlot } from './shadow-dom';
import { IScope } from '../binding/binding-context';
import { IBindScope } from '../binding/observation';
import { IAttach } from './lifecycle';
import { DI } from '../../kernel/di';
import { INode, DOM, IChildObserver, IView } from '../dom';
import { IRenderSlot } from './render-slot';
import { Reporter } from '../../kernel/reporter';
import { IVisual } from './visual';
import { IRenderContext } from './render-context';

export const IViewOwner = DI.createInterface<IViewOwner>();

export interface IViewOwner {
  $context: IRenderContext;
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
  fromCompiledContent(host: INode, options: { contentOverride?: INode } = PLATFORM.emptyObject): IContentView | null {
    if (DOM.isUsingSlotEmulation(host)) {
      return new ContentView(options.contentOverride || host);
    } else {
      return null;
    }
  },
  fromNode(node: INode): IView {
    return new NodeView(<Node>node);
  }
};

class NodeView implements IView {
  firstChild: Node;
  lastChild: Node;
  childNodes: Node[];

  constructor(node: Node) {
    this.firstChild = this.lastChild = node;
    this.childNodes = [node];
  }

  findTargets(): Node[] {
    return PLATFORM.emptyArray;
  }

  appendChild(child: Node) {
    this.firstChild.appendChild(child);
  }

  insertBefore(refNode: Node): void {
    refNode.parentNode.insertBefore(this.firstChild, refNode);
  }

  appendTo(parent: Node): void {
    parent.appendChild(this.firstChild);
  }

  remove(): void {
    const node = this.firstChild
    if ((<any>node).remove) {
      (<any>node).remove();
    } else if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }
}

export interface IContentView extends IView {
  childObserver?: IChildObserver;
  insertVisualChildBefore(visual: IVisual, refNode: INode);
  removeVisualChild(visual: IVisual);
  attachChildObserver(onChildrenChanged: () => void): IChildObserver;
}

interface IContentViewChildObserver extends IChildObserver {
  notifyChildrenChanged(): void;
}

class ContentView implements IContentView {
  firstChild: INode;
  lastChild: INode;
  childNodes: INode[];
  childObserver: IContentViewChildObserver = null;

  constructor(private contentHost: INode) {
    const childNodes = this.childNodes = Array.from(contentHost.childNodes)
    this.firstChild = childNodes[0];
    this.lastChild = childNodes[childNodes.length - 1];
  }

  attachChildObserver(onChildrenChanged: () => void): IChildObserver {
    const contentViewNodes = this.childNodes;
    let observer = this.childObserver;

    if (!observer) {
      this.childObserver = observer = {
        get childNodes() {
          return contentViewNodes;
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

      const workQueue = Array.from(contentViewNodes);

      while(workQueue.length) {
        const current = workQueue.shift();
  
        if ((current as any).$isContentProjectionSource) {
          const contentIndex = contentViewNodes.indexOf(current);
  
          ((current as any).$slot as IRenderSlot).children.forEach(x => {
            const childNodes = x.$view.childNodes;
            childNodes.forEach(x => workQueue.push(x));
            contentViewNodes.splice(contentIndex, 0, ...childNodes);
          });
  
          (current as any).$slot.logicalView = this;
        }
      }
    } else {
      Reporter.error(16);
    }
    
    return observer;
  }

  insertVisualChildBefore(visual: IVisual, refNode: INode) {
    const childObserver = this.childObserver;

    if (childObserver) {
      const contentNodes = this.childNodes;
      const contentIndex = contentNodes.indexOf(refNode);
      const projectedNodes = Array.from(visual.$view.childNodes);

      projectedNodes.forEach((node: any) => {
        if (node.$isContentProjectionSource) {
          node.$slot.logicalView = this;
        }
      });

      contentNodes.splice(contentIndex, 0, ...projectedNodes);
      childObserver.notifyChildrenChanged();
    }
  }

  removeVisualChild(visual: IVisual) {
    const childObserver = this.childObserver;

    if (childObserver) {
      const contentNodes = this.childNodes;
      const startIndex = contentNodes.indexOf(visual.$view.firstChild);
      const endIndex = contentNodes.indexOf(visual.$view.lastChild);
    
      contentNodes.splice(startIndex, (endIndex - startIndex) + 1);
      childObserver.notifyChildrenChanged();
    }
  }

  findTargets() { return PLATFORM.emptyArray; }
  appendChild(child: INode) {}
  insertBefore(refNode: INode): void {}
  appendTo(parent: INode): void {}
  remove(): void {}
}
