import { PLATFORM } from '@aurelia/kernel';
import { IEmulatedShadowSlot } from './shadow-dom';
import { IScope } from '../binding/binding-context';
import { IBindScope } from '../binding/observation';
import { IAttach } from './lifecycle';
import { DI } from '@aurelia/kernel';
import { INode, DOM, IChildObserver, IView } from '../dom';
import { IRenderSlot } from './render-slot';
import { Reporter } from '@aurelia/kernel';
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

// This is an implementation of IView that represents "no DOM" to render.
// It's used in various places to ensure that View is never null and to encode
// the explicit idea of "no view".
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
  // See below for an explanation of ContentView.
  // This factory method creates the ContentView depending on whether or not
  // shadow dom emulation is active on the host element.
  fromCompiledContent(host: INode, options: { contentOverride?: INode } = PLATFORM.emptyObject): IContentView | null {
    if (DOM.isUsingSlotEmulation(host)) {
      return new ContentView(options.contentOverride || host);
    } else {
      return null;
    }
  },
  // This creates an instance of IView based on an existing node.
  // It's used by the rendering engine to create an instance of IVisual,
  // based on a single component. The rendering engine's createVisualFromComponent
  // method has one consumer: the compose element. The compose element uses this
  // to create an IVisual based on a dynamically determined component instance.
  // This is required because there's no way to get a "loose" component into the view
  // hierarchy without it being part of an element's ContentView or part of an IVisual.
  // ContentViews are appended by the custom element's attach process. IVisuals can only
  // be added via a RenderSlot. So, this form of view effectively enables a single
  // component to be added into a RenderSlot.
  // It's likely that after the RenderLocation abstraction is added and RenderSlot is removed
  // that most of this functionality will go away. The rendering engine will still need the ability
  // to create a dynamic component, but the compose element won't need a RenderSlot and an IView in
  // order to add that dynamic component to the DOM. Instead, it should be able to take the single
  // node and use the RenderLocation to add that node to the DOM.
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
        DOM.remove(node);
      }
    };
  }
};

export interface IContentView extends IView {
  childObserver?: IChildObserver;
  insertVisualChildBefore(visual: IVisual, refNode: INode);
  removeVisualChild(visual: IVisual);
  attachChildObserver(onChildrenChanged: () => void): IChildObserver;
}

interface IContentViewChildObserver extends IChildObserver {
  notifyChildrenChanged(): void;
}

// This is the default and only implementation of IContentView.
// This type of view represents the content that is placed between the opening and closing tags
// of a custom element. It is only used when ShadowDOM Emulation is required. It enables
// various interactions between the content, as a logical view, the ShadowDom Emulation, 
// and the RenderSlot.
// Most if not all of this will go away when we remove the shadow dom emulation and render slot.
// However, we may need to keep the IChildObserver abstraction for enabling the $children property
// in different scenarios, depending on what optimizations we make around when/when not to use shadow dom.
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
