import { DOM, PLATFORM } from '../pal';;
import { IView, IViewOwner } from './view';
import { ViewSlot } from './view-slot';
import { IVisual, IViewFactory } from './view-engine';
import { IBindScope } from '../binding/observation';
import { IScope } from '../binding/binding-context';
import { IAttach, AttachContext, DetachContext } from './lifecycle';

type ShadowProjectionSource = ViewSlot | IShadowSlot;

type ShadowEmulationTracking = { 
  viewSlot: IShadowSlot;
  auSlotAttribute?: SlotCustomAttribute;
  isContentProjectionSource?: boolean;
  auOwnerView?: IView;
  auProjectionSource?: ShadowProjectionSource;
  auSlotProjectFrom?: ShadowProjectionSource;
  auAssignedSlot?: IShadowSlot;
  auProjectionChildren: SlotNode[];
};

type SlotNode = Node & ShadowEmulationTracking;

export interface IShadowSlot extends IBindScope, IAttach {
  readonly name: string;
  readonly needsFallback: boolean;

  removeView(view: IView, projectionSource: ShadowProjectionSource);
  removeAll(projectionSource: ShadowProjectionSource);
  projectFrom(view: IView, projectionSource: ShadowProjectionSource);
  addNode(view: IView, node: SlotNode, projectionSource: ShadowProjectionSource, index: number, destination?);
  renderFallback(view: IView, nodes: SlotNode[], projectionSource: ShadowProjectionSource, index: number);
  projectTo?(slots: Record<string, IShadowSlot>);
}

const noNodes = <SlotNode[]>PLATFORM.emptyArray;

class SlotCustomAttribute {
  value: string;

  constructor(private element: SlotNode) {
    this.element = element;
    this.element.auSlotAttribute = this;
  }
}

function shadowSlotAddFallbackVisual(visual: IVisual, owner: ShadowSlot) {
  owner.fallbackVisual.$view.insertBefore(owner.anchor);
}

function passThroughSlotAddFallbackVisual(visual: IVisual, owner: PassThroughSlot, index: number) {
  let projectionSource = owner.currentProjectionSource;
  let slots = <Record<string, IShadowSlot>>Object.create(null);

  owner.currentProjectionSource = null;
  slots[owner.destinationSlot.name] = owner.destinationSlot;
  
  ShadowDOM.distributeView(
    owner.fallbackVisual.$view, 
    slots, 
    projectionSource, 
    index, 
    owner.destinationSlot.name
  );
}

abstract class ShadowSlotBase implements IShadowSlot {
  fallbackVisual: IVisual = null;
  $isAttached = false;
  $isBound = false;
  projections = 0;

  constructor(public owner: IViewOwner, public anchor: SlotNode, public name: string, public fallbackFactory?: IViewFactory) {
    this.anchor.viewSlot = <any>this;
  }

  get needsFallback() {
    return this.fallbackFactory !== null && this.projections === 0;
  }

  removeFallbackVisual(context?: DetachContext) {
    if (this.fallbackVisual !== null) {
      this.fallbackVisual.detach(context);
      this.fallbackVisual.unbind();
      this.fallbackVisual = null;
    }
  }

  bind(scope: IScope) {
    // fallbackContentView will never be created when the slot isn't already bound
    // so no need to worry about binding it here
    this.$isBound = true;
  }

  attach(context: AttachContext) {
    // fallbackContentView will never be created when the slot isn't already attached
    // so no need to worry about attaching it here
    this.$isAttached = true;
  }

  detach(context: DetachContext) {
    if (this.$isAttached) {
      this.removeFallbackVisual(context);
      this.$isAttached = false;
    }
  }

  unbind() {
    this.$isBound = false;
  }

  abstract removeView(view: IView, projectionSource: IShadowSlot | ViewSlot);
  abstract removeAll(projectionSource: IShadowSlot | ViewSlot);
  abstract projectFrom(view: IView, projectionSource: IShadowSlot | ViewSlot);
  abstract addNode(view: IView, node: Node & { viewSlot: IShadowSlot; auSlotAttribute?: SlotCustomAttribute; isContentProjectionSource?: boolean; auOwnerView?: IView; auProjectionSource?: IShadowSlot | ViewSlot; auSlotProjectFrom?: IShadowSlot | ViewSlot; auAssignedSlot?: IShadowSlot; auProjectionChildren: (Node & ShadowEmulationTracking)[]; }, projectionSource: IShadowSlot | ViewSlot, index: number, destination?: any);
  abstract renderFallback(view: IView, nodes: (Node & { viewSlot: IShadowSlot; auSlotAttribute?: SlotCustomAttribute; isContentProjectionSource?: boolean; auOwnerView?: IView; auProjectionSource?: IShadowSlot | ViewSlot; auSlotProjectFrom?: IShadowSlot | ViewSlot; auAssignedSlot?: IShadowSlot; auProjectionChildren: (Node & ShadowEmulationTracking)[]; })[], projectionSource: IShadowSlot | ViewSlot, index: number);
}

class PassThroughSlot extends ShadowSlotBase implements IShadowSlot {
  destinationSlot: IShadowSlot = null;
  currentProjectionSource: ShadowProjectionSource = null;

  constructor(owner: IViewOwner, anchor: SlotNode, name: string, private destinationName: string, fallbackFactory?: IViewFactory) {
    super(owner, anchor, name, fallbackFactory);

    let attr = new SlotCustomAttribute(this.anchor);
    attr.value = this.destinationName;
  }

  passThroughTo(destinationSlot: IShadowSlot) {
    this.destinationSlot = destinationSlot;
  }

  renderFallback(view: IView, nodes: SlotNode[], projectionSource: ShadowProjectionSource, index = 0) {
    if (this.fallbackVisual === null) {
      this.fallbackVisual = this.fallbackFactory.create();
      this.fallbackVisual.bind(this.owner.$scope);
      this.currentProjectionSource = projectionSource;
      this.fallbackVisual.attach(null, passThroughSlotAddFallbackVisual, this, index);
    }
  }

  addNode(view: IView, node: SlotNode, projectionSource: ShadowProjectionSource, index: number) {
    this.removeFallbackVisual();

    if (node.viewSlot instanceof PassThroughSlot) {
      node.viewSlot.passThroughTo(this);
      return;
    }

    this.projections++;
    this.destinationSlot.addNode(view, node, projectionSource, index);
  }

  removeView(view: IView, projectionSource: ShadowProjectionSource) {
    this.projections--;
    this.destinationSlot.removeView(view, projectionSource);

    if (this.needsFallback) {
      this.renderFallback(null, noNodes, projectionSource);
    }
  }

  removeAll(projectionSource: ShadowProjectionSource) {
    this.projections = 0;
    this.destinationSlot.removeAll(projectionSource);

    if (this.needsFallback) {
      this.renderFallback(null, noNodes, projectionSource);
    }
  }

  projectFrom(view: IView, projectionSource: ShadowProjectionSource) {
    this.destinationSlot.projectFrom(view, projectionSource);
  }
}

class ShadowSlot extends ShadowSlotBase implements IShadowSlot {
  children: SlotNode[] = [];
  projectFromAnchors: SlotNode[] = null;
  destinationSlots = null;
  fallbackSlots;

  constructor(owner: IViewOwner, anchor: SlotNode, name: string, fallbackFactory?: IViewFactory) {
    super(owner, anchor, name, fallbackFactory);
    this.anchor.isContentProjectionSource = true;
  }

  renderFallback(view: IView, nodes: SlotNode[], projectionSource: ShadowProjectionSource, index = 0) {
    if (this.fallbackVisual === null) {
      this.fallbackVisual = this.fallbackFactory.create();
      this.fallbackVisual.bind(this.owner.$scope);
      this.fallbackVisual.attach(null, shadowSlotAddFallbackVisual, this);
    }

    if (this.fallbackVisual.$slots) {
      let slots = this.fallbackVisual.$slots;
      let projectFromAnchors = this.projectFromAnchors;

      if (projectFromAnchors !== null) {
        for (let slotName in slots) {
          let slot = slots[slotName];

          for (let i = 0, ii = projectFromAnchors.length; i < ii; ++i) {
            let anchor = projectFromAnchors[i];
            slot.projectFrom(anchor.auOwnerView, anchor.auSlotProjectFrom);
          }
        }
      }

      this.fallbackSlots = slots;
      ShadowDOM.distributeNodes(view, nodes, slots, projectionSource, index);
    }
  }
  
  addNode(view: IView, node: SlotNode, projectionSource: ShadowProjectionSource, index: number, destination: string) {
    this.removeFallbackVisual();

    if (node.viewSlot instanceof PassThroughSlot) {
      node.viewSlot.passThroughTo(this);
      return;
    }

    if (this.destinationSlots !== null) {
      ShadowDOM.distributeNodes(view, [node], this.destinationSlots, this, index);
    } else {
      node.auOwnerView = view;
      node.auProjectionSource = projectionSource;
      node.auAssignedSlot = this;

      let anchor = this.findAnchor(view, node, projectionSource, index);
      let parent = anchor.parentNode;

      parent.insertBefore(node, anchor);
      this.children.push(node);
      this.projections++;
    }
  }

  removeView(view: IView, projectionSource: ShadowProjectionSource) {
    if (this.destinationSlots !== null) {
      ShadowDOM.undistributeView(view, this.destinationSlots, this);
    } else if (this.fallbackVisual && this.fallbackVisual.$slots) {
      ShadowDOM.undistributeView(view, this.fallbackVisual.$slots, projectionSource);
    } else {
      let found = this.children.find(x => x.auSlotProjectFrom === projectionSource);
      if (found) {
        let children = found.auProjectionChildren;

        for (let i = 0, ii = children.length; i < ii; ++i) {
          let child = children[i];

          if (child.auOwnerView === view) {
            children.splice(i, 1);
            view.appendChild(child);
            i--; ii--;
            this.projections--;
          }
        }

        if (this.needsFallback) {
          this.renderFallback(view, noNodes, projectionSource);
        }
      }
    }
  }

  removeAll(projectionSource: ShadowProjectionSource) {
    if (this.destinationSlots !== null) {
      ShadowDOM.undistributeAll(this.destinationSlots, this);
    } else if (this.fallbackVisual && this.fallbackVisual.$slots) {
      ShadowDOM.undistributeAll(this.fallbackVisual.$slots, projectionSource);
    } else {
      let found = this.children.find(x => x.auSlotProjectFrom === projectionSource);

      if (found) {
        let children = found.auProjectionChildren;
        for (let i = 0, ii = children.length; i < ii; ++i) {
          let child = children[i];
          child.auOwnerView.appendChild(child);
          this.projections--;
        }

        found.auProjectionChildren = [];

        if (this.needsFallback) {
          this.renderFallback(null, noNodes, projectionSource);
        }
      }
    }
  }

  private findAnchor(view: IView, node: SlotNode, projectionSource: ShadowProjectionSource, index: number) {
    if (projectionSource) {
      //find the anchor associated with the projected view slot
      let found = this.children.find(x => x.auSlotProjectFrom === projectionSource);
      if (found) {
        if (index !== undefined) {
          let children = found.auProjectionChildren;
          let viewIndex = -1;
          let lastView: IView;

          for (let i = 0, ii = children.length; i < ii; ++i) {
            let current = children[i];

            if (current.auOwnerView !== lastView) {
              viewIndex++;
              lastView = current.auOwnerView;

              if (viewIndex >= index && lastView !== view) {
                children.splice(i, 0, node);
                return current;
              }
            }
          }
        }

        found.auProjectionChildren.push(node);
        return found;
      }
    }

    return this.anchor;
  }

  projectTo(slots: Record<string, IShadowSlot>) {
    this.destinationSlots = slots;
  }

  projectFrom(view: IView, projectionSource: ShadowProjectionSource) {
    let anchor: SlotNode = <any>DOM.createComment('anchor');
    let parent = this.anchor.parentNode;
    anchor.auSlotProjectFrom = projectionSource;
    anchor.auOwnerView = view;
    anchor.auProjectionChildren = [];
    parent.insertBefore(anchor, this.anchor);
    this.children.push(anchor);

    if (this.projectFromAnchors === null) {
      this.projectFromAnchors = [];
    }

    this.projectFromAnchors.push(anchor);
  }
}

export const ShadowDOM = {
  defaultSlotKey: '__au-default-slot-key__',

  getSlotName(node: Node): string {
    if ((<any>node).auSlotAttribute === undefined) {
      return this.defaultSlotKey;
    }

    return (<any>node).auSlotAttribute.value;
  },

  createSlot(owner: IViewOwner, name: string, destination?: string, fallbackFactory?: IViewFactory) {
    let anchor = DOM.createComment('slot');

    if (destination) {
      return new PassThroughSlot(owner, <any>anchor, name, destination, fallbackFactory);
    } else {
      return new ShadowSlot(owner, <any>anchor, name, fallbackFactory);
    }
  },

  distributeView(view: IView, slots: Record<string, IShadowSlot>, projectionSource: ShadowProjectionSource = null, index = 0, destinationOverride: string = null) {
    let nodes;

    if (view === null) {
      nodes = noNodes;
    } else {
      let childNodes = view.childNodes;
      let ii = childNodes.length;
      nodes = new Array(ii);

      for (let i = 0; i < ii; ++i) {
        nodes[i] = childNodes[i];
      }
    }

    this.distributeNodes(
      view,
      nodes,
      slots,
      projectionSource,
      index,
      destinationOverride
    );
  },

  undistributeView(view: IView, slots: Record<string, IShadowSlot>, projectionSource: ShadowProjectionSource) {
    for (let slotName in slots) {
      slots[slotName].removeView(view, projectionSource);
    }
  },

  undistributeAll(slots: Record<string, IShadowSlot>, projectionSource: ShadowProjectionSource) {
    for (let slotName in slots) {
      slots[slotName].removeAll(projectionSource);
    }
  },

  distributeNodes(view: IView, nodes: SlotNode[], slots: Record<string, IShadowSlot>, projectionSource: ShadowProjectionSource, index: number, destinationOverride: string = null) {
    for (let i = 0, ii = nodes.length; i < ii; ++i) {
      let currentNode = nodes[i];
      let nodeType = currentNode.nodeType;

      if (currentNode.isContentProjectionSource) {
        currentNode.viewSlot.projectTo(slots);

        for (let slotName in slots) {
          slots[slotName].projectFrom(view, currentNode.viewSlot);
        }

        nodes.splice(i, 1);
        ii--; i--;
      } else if (nodeType === 1 || nodeType === 3 || currentNode.viewSlot instanceof PassThroughSlot) { //project only elements and text
        if (nodeType === 3 && DOM.isAllWhitespace(currentNode)) {
          nodes.splice(i, 1);
          ii--; i--;
        } else {
          let found = slots[destinationOverride || ShadowDOM.getSlotName(currentNode)];

          if (found) {
            found.addNode(view, currentNode, projectionSource, index);
            nodes.splice(i, 1);
            ii--; i--;
          }
        }
      } else {
        nodes.splice(i, 1);
        ii--; i--;
      }
    }

    for (let slotName in slots) {
      let slot = slots[slotName];

      if (slot.needsFallback) {
        slot.renderFallback(view, nodes, projectionSource, index);
      }
    }
  }
}
