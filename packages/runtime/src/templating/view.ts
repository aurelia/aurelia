import { DI, PLATFORM, Reporter } from '@aurelia/kernel';
import { IScope } from '../binding/binding-context';
import { IBindScope } from '../binding/observation';
import { DOM, INode, IView } from '../dom';
import { IAttach } from './lifecycle';
import { IRenderContext } from './render-context';
import { IRenderSlot } from './render-slot';
import { IVisual } from './visual';

export const IViewOwner = DI.createInterface<IViewOwner>();

export interface IViewOwner {
  $context: IRenderContext;
  $view: IView;
  $scope: IScope;
  $isBound: boolean;

  $bindable: IBindScope[];
  $attachable: IAttach[];
}

// This is an implementation of IView that represents "no DOM" to render.
// It's used in various places to ensure that View is never null and to encode
// the explicit idea of "no view".
/*@internal*/
export const noopView: IView = {
  firstChild: null,
  lastChild: null,
  childNodes: PLATFORM.emptyArray,
  findTargets() { return PLATFORM.emptyArray; },
  insertBefore(refNode: INode): void {},
  appendTo(parent: INode): void {},
  remove(): void {}
};

export const View = {
  none: noopView,
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
