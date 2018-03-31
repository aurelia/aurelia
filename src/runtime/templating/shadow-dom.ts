import { DOM } from '../dom';
import { IAttach } from './component';
import { IScope, IBindScope } from '../binding/binding-interfaces';
import { IView, IViewOwner } from './view';
import { ViewSlot } from './view-slot';
import { IVisual, IViewFactory } from './view-engine';

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
  name: string;
  anchor: SlotNode;
  needsFallbackRendering: boolean;

  removeView(view: IView, projectionSource: ShadowProjectionSource);
  removeAll(projectionSource: ShadowProjectionSource);
  projectFrom(view: IView, projectionSource: ShadowProjectionSource);
  addNode(view: IView, node: SlotNode, projectionSource: ShadowProjectionSource, index: number, destination?);
  renderFallbackContent(view: IView, nodes: SlotNode[], projectionSource: ShadowProjectionSource, index: number);
  projectTo?(slots: Record<string, IShadowSlot>);
}

let noNodes: SlotNode[] = <any>Object.freeze([]);

class SlotCustomAttribute {
  value: string;

  constructor(private element: SlotNode) {
    this.element = element;
    this.element.auSlotAttribute = this;
  }
}

class PassThroughSlot implements IShadowSlot {
  private projections = 0;
  private contentView: IVisual = null;
  private destinationSlot: IShadowSlot = null;

  constructor(private owner: IViewOwner, public anchor: SlotNode, public name: string, private destinationName: string, private fallbackFactory?: IViewFactory) {
    this.anchor.viewSlot = this;
    let attr = new SlotCustomAttribute(this.anchor);
    attr.value = this.destinationName;
  }

  get needsFallbackRendering() {
    return this.fallbackFactory && this.projections === 0;
  }

  renderFallbackContent(view: IView, nodes: SlotNode[], projectionSource: ShadowProjectionSource, index = 0) {
    if (this.contentView === null) {
      this.contentView = this.fallbackFactory.create();
      this.contentView.bind(this.owner.$scope);

      let slots = Object.create(null);
      slots[this.destinationSlot.name] = this.destinationSlot;

      ShadowDOM.distributeView(
        this.contentView.$view, 
        slots, 
        projectionSource, 
        index, 
        this.destinationSlot.name
      );
    }
  }

  passThroughTo(destinationSlot: IShadowSlot) {
    this.destinationSlot = destinationSlot;
  }

  addNode(view: IView, node: SlotNode, projectionSource: ShadowProjectionSource, index: number) {
    if (this.contentView !== null) {
      this.contentView.$view.remove();
      this.contentView.detach();
      this.contentView.unbind();
      this.contentView = null;
    }

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

    if (this.needsFallbackRendering) {
      this.renderFallbackContent(null, noNodes, projectionSource);
    }
  }

  removeAll(projectionSource: ShadowProjectionSource) {
    this.projections = 0;
    this.destinationSlot.removeAll(projectionSource);

    if (this.needsFallbackRendering) {
      this.renderFallbackContent(null, noNodes, projectionSource);
    }
  }

  projectFrom(view: IView, projectionSource: ShadowProjectionSource) {
    this.destinationSlot.projectFrom(view, projectionSource);
  }

  bind(scope: IScope) {
    if (this.contentView !== null) {
      this.contentView.bind(scope);
    }
  }

  attach() {
    if (this.contentView !== null) {
      this.contentView.attach();
    }
  }

  detach() {
    if (this.contentView !== null) {
      this.contentView.detach();
    }
  }

  unbind() {
    if (this.contentView !== null) {
      this.contentView.unbind();
    }
  }
}

class ShadowSlot implements IShadowSlot {
  private contentView: IVisual = null;
  private projections = 0;
  private children: SlotNode[] = [];
  private projectFromAnchors: SlotNode[] = null;
  private destinationSlots = null;
  private fallbackSlots;

  constructor(private owner: IViewOwner, public anchor: SlotNode, public name: string, private fallbackFactory?: IViewFactory) {
    this.anchor.isContentProjectionSource = true;
    this.anchor.viewSlot = this;
  }

  get needsFallbackRendering() {
    return this.fallbackFactory && this.projections === 0;
  }

  addNode(view: IView, node: SlotNode, projectionSource: ShadowProjectionSource, index: number, destination: string) {
    if (this.contentView !== null) {
      this.contentView.$view.remove();
      this.contentView.detach();
      this.contentView.unbind();
      this.contentView = null;
    }

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
    } else if (this.contentView && this.contentView.$slots) {
      ShadowDOM.undistributeView(view, this.contentView.$slots, projectionSource);
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

        if (this.needsFallbackRendering) {
          this.renderFallbackContent(view, noNodes, projectionSource);
        }
      }
    }
  }

  removeAll(projectionSource: ShadowProjectionSource) {
    if (this.destinationSlots !== null) {
      ShadowDOM.undistributeAll(this.destinationSlots, this);
    } else if (this.contentView && this.contentView.$slots) {
      ShadowDOM.undistributeAll(this.contentView.$slots, projectionSource);
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

        if (this.needsFallbackRendering) {
          this.renderFallbackContent(null, noNodes, projectionSource);
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

  renderFallbackContent(view: IView, nodes: SlotNode[], projectionSource: ShadowProjectionSource, index = 0) {
    if (this.contentView === null) {
      this.contentView = this.fallbackFactory.create();
      this.contentView.bind(this.owner.$scope);
      this.contentView.$view.insertBefore(this.anchor);
    }

    if (this.contentView.$slots) {
      let slots = this.contentView.$slots;
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

  bind(scope: IScope) {
    if (this.contentView !== null) {
      this.contentView.bind(scope);
    }
  }

  attach() {
    if (this.contentView !== null) {
      this.contentView.attach();
    }
  }

  detach() {
    if (this.contentView !== null) {
      this.contentView.detach();
    }
  }

  unbind() {
    if (this.contentView !== null) {
      this.contentView.unbind();
    }
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

      if (slot.needsFallbackRendering) {
        slot.renderFallbackContent(view, nodes, projectionSource, index);
      }
    }
  }
}
