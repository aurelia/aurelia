import { PLATFORM } from '../platform';;
import { IViewOwner, IContentView } from './view';
import { IRenderSlot } from './render-slot';
import { IBindScope } from '../binding/observation';
import { IScope } from '../binding/binding-context';
import { IAttach, AttachContext, DetachContext } from './lifecycle';
import { DOM, INode, IView } from '../dom';
import { IVisual, IVisualFactory } from './visual';

type ProjectionSource = IRenderSlot | IEmulatedShadowSlot;

type ShadowEmulationTracking = { 
  $slot: ProjectionSource;
  $slotName?: string;
  $isContentProjectionSource?: boolean;
  $ownerView?: IView;
  $projectionSource?: ProjectionSource;
  $slotProjectFrom?: ProjectionSource;
  $assignedSlot?: IEmulatedShadowSlot;
  $projectionChildren: SlotNode[];
};

type SlotNode = INode & ShadowEmulationTracking;

export interface IEmulatedShadowSlot extends IBindScope, IAttach {
  readonly name: string;
  readonly anchor: INode;
  /** @internal */ readonly needsFallback: boolean;
  /** @internal */ removeView(view: IView, projectionSource: ProjectionSource);
  /** @internal */ removeAll(projectionSource: ProjectionSource);
  /** @internal */ projectFrom(view: IView, projectionSource: ProjectionSource);
  /** @internal */ addNode(view: IView, node: SlotNode, projectionSource: ProjectionSource, index: number, destination?: string);
  /** @internal */ renderFallback(view: IView, nodes: SlotNode[], projectionSource: ProjectionSource, index: number);
  /** @internal */ projectTo?(slots: Record<string, IEmulatedShadowSlot>);
}

const noNodes = <SlotNode[]>PLATFORM.emptyArray;

function shadowSlotAddFallbackVisual(visual: IVisual, owner: ShadowSlot) {
  owner.fallbackVisual.$view.insertBefore(owner.anchor);
}

function passThroughSlotAddFallbackVisual(visual: IVisual, owner: PassThroughSlot, index: number) {
  const projectionSource = owner.currentProjectionSource;
  const slots = <Record<string, IEmulatedShadowSlot>>Object.create(null);

  owner.currentProjectionSource = null;
  slots[owner.destinationSlot.name] = owner.destinationSlot;
  
  ShadowDOMEmulation.distributeView(
    owner.fallbackVisual.$view, 
    slots, 
    projectionSource, 
    index, 
    owner.destinationSlot.name
  );
}

abstract class ShadowSlotBase {
  fallbackVisual: IVisual = null;
  $isAttached = false;
  $isBound = false;
  projections = 0;

  constructor(public owner: IViewOwner, public anchor: SlotNode, public name: string, public fallbackFactory?: IVisualFactory) {
    this.anchor.$slot = <any>this;
  }

  get needsFallback() {
    return this.fallbackFactory !== null && this.projections === 0;
  }

  removeFallbackVisual(context?: DetachContext) {
    if (this.fallbackVisual !== null) {
      this.fallbackVisual.$detach(context);
      this.fallbackVisual.$unbind();
      this.fallbackVisual = null;
    }
  }

  $bind(scope: IScope) {
    // fallbackContentView will never be created when the slot isn't already bound
    // so no need to worry about binding it here
    this.$isBound = true;
  }

  $attach(context: AttachContext) {
    // fallbackContentView will never be created when the slot isn't already attached
    // so no need to worry about attaching it here
    this.$isAttached = true;
  }

  $detach(context: DetachContext) {
    if (this.$isAttached) {
      this.removeFallbackVisual(context);
      this.$isAttached = false;
    }
  }

  $unbind() {
    this.$isBound = false;
  }
}

class PassThroughSlot extends ShadowSlotBase implements IEmulatedShadowSlot {
  destinationSlot: IEmulatedShadowSlot = null;
  currentProjectionSource: ProjectionSource = null;

  constructor(owner: IViewOwner, anchor: SlotNode, name: string, private destinationName: string, fallbackFactory?: IVisualFactory) {
    super(owner, anchor, name, fallbackFactory);
    this.anchor.$slotName = this.destinationName;
  }

  passThroughTo(destinationSlot: IEmulatedShadowSlot) {
    this.destinationSlot = destinationSlot;
  }

  renderFallback(view: IView, nodes: SlotNode[], projectionSource: ProjectionSource, index = 0) {
    if (this.fallbackVisual === null) {
      this.fallbackVisual = this.fallbackFactory.create();
      this.fallbackVisual.$bind(this.owner.$scope);
      this.currentProjectionSource = projectionSource;
      this.fallbackVisual.$attach(null, passThroughSlotAddFallbackVisual, this, index);
    }
  }

  addNode(view: IView, node: SlotNode, projectionSource: ProjectionSource, index: number) {
    this.removeFallbackVisual();

    if (node.$slot instanceof PassThroughSlot) {
      node.$slot.passThroughTo(this);
      return;
    }

    this.projections++;
    this.destinationSlot.addNode(view, node, projectionSource, index);
  }

  removeView(view: IView, projectionSource: ProjectionSource) {
    this.projections--;
    this.destinationSlot.removeView(view, projectionSource);

    if (this.needsFallback) {
      this.renderFallback(null, noNodes, projectionSource);
    }
  }

  removeAll(projectionSource: ProjectionSource) {
    this.projections = 0;
    this.destinationSlot.removeAll(projectionSource);

    if (this.needsFallback) {
      this.renderFallback(null, noNodes, projectionSource);
    }
  }

  projectFrom(view: IView, projectionSource: ProjectionSource) {
    this.destinationSlot.projectFrom(view, projectionSource);
  }
}

class ShadowSlot extends ShadowSlotBase implements IEmulatedShadowSlot {
  children: SlotNode[] = [];
  projectFromAnchors: SlotNode[] = null;
  destinationSlots = null;
  fallbackSlots;

  constructor(owner: IViewOwner, anchor: SlotNode, name: string, fallbackFactory?: IVisualFactory) {
    super(owner, anchor, name, fallbackFactory);
    this.anchor.$isContentProjectionSource = true;
  }

  renderFallback(view: IView, nodes: SlotNode[], projectionSource: ProjectionSource, index = 0) {
    if (this.fallbackVisual === null) {
      this.fallbackVisual = this.fallbackFactory.create();
      this.fallbackVisual.$bind(this.owner.$scope);
      this.fallbackVisual.$attach(null, shadowSlotAddFallbackVisual, this);
    }

    if (this.fallbackVisual.$slots) {
      const slots = this.fallbackVisual.$slots;
      const projectFromAnchors = this.projectFromAnchors;

      if (projectFromAnchors !== null) {
        for (const slotName in slots) {
          const slot = slots[slotName];

          for (let i = 0, ii = projectFromAnchors.length; i < ii; ++i) {
            const anchor = projectFromAnchors[i];
            slot.projectFrom(anchor.$ownerView, anchor.$slotProjectFrom);
          }
        }
      }

      this.fallbackSlots = slots;
      distributeNodes(view, nodes, slots, projectionSource, index);
    }
  }
  
  addNode(view: IView, node: SlotNode, projectionSource: ProjectionSource, index: number, destination: string) {
    this.removeFallbackVisual();

    if (node.$slot instanceof PassThroughSlot) {
      node.$slot.passThroughTo(this);
      return;
    }

    if (this.destinationSlots !== null) {
      distributeNodes(view, [node], this.destinationSlots, this, index);
    } else {
      node.$ownerView = view;
      node.$projectionSource = projectionSource;
      node.$assignedSlot = this;

      const anchor = this.findAnchor(view, node, projectionSource, index);
      const parent = anchor.parentNode;

      DOM.insertBefore(node, anchor);

      this.children.push(node);
      this.projections++;
    }
  }

  removeView(view: IView, projectionSource: ProjectionSource) {
    if (this.destinationSlots !== null) {
      ShadowDOMEmulation.undistributeView(view, this.destinationSlots, this);
    } else if (this.fallbackVisual && this.fallbackVisual.$slots) {
      ShadowDOMEmulation.undistributeView(view, this.fallbackVisual.$slots, projectionSource);
    } else {
      const found = this.children.find(x => x.$slotProjectFrom === projectionSource);

      if (found) {
        const children = found.$projectionChildren;

        for (let i = 0, ii = children.length; i < ii; ++i) {
          const child = children[i];

          if (child.$ownerView === view) {
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

  removeAll(projectionSource: ProjectionSource) {
    if (this.destinationSlots !== null) {
      undistributeAll(this.destinationSlots, this);
    } else if (this.fallbackVisual && this.fallbackVisual.$slots) {
      undistributeAll(this.fallbackVisual.$slots, projectionSource);
    } else {
      const found = this.children.find(x => x.$slotProjectFrom === projectionSource);

      if (found) {
        const children = found.$projectionChildren;

        for (let i = 0, ii = children.length; i < ii; ++i) {
          const child = children[i];
          child.$ownerView.appendChild(child);
          this.projections--;
        }

        found.$projectionChildren = [];

        if (this.needsFallback) {
          this.renderFallback(null, noNodes, projectionSource);
        }
      }
    }
  }

  private findAnchor(view: IView, node: SlotNode, projectionSource: ProjectionSource, index: number) {
    if (projectionSource) {
      //find the anchor associated with the projected view slot
      const found = this.children.find(x => x.$slotProjectFrom === projectionSource);
      if (found) {
        if (index !== undefined) {
          const children = found.$projectionChildren;
          let viewIndex = -1;
          let lastView: IView;

          for (let i = 0, ii = children.length; i < ii; ++i) {
            const current = children[i];

            if (current.$ownerView !== lastView) {
              viewIndex++;
              lastView = current.$ownerView;

              if (viewIndex >= index && lastView !== view) {
                children.splice(i, 0, node);
                return current;
              }
            }
          }
        }

        found.$projectionChildren.push(node);
        return found;
      }
    }

    return this.anchor;
  }

  projectTo(slots: Record<string, IEmulatedShadowSlot>) {
    this.destinationSlots = slots;
  }

  projectFrom(view: IView, projectionSource: ProjectionSource) {
    const anchor: SlotNode = <any>DOM.createAnchor();
    const parent = this.anchor.parentNode;

    anchor.$slotProjectFrom = projectionSource;
    anchor.$ownerView = view;
    anchor.$projectionChildren = [];
    DOM.insertBefore(anchor, this.anchor);
    this.children.push(anchor);

    if (this.projectFromAnchors === null) {
      this.projectFromAnchors = [];
    }

    this.projectFromAnchors.push(anchor);
  }
}

function distributeNodes(view: IView, nodes: SlotNode[], slots: Record<string, IEmulatedShadowSlot>, projectionSource: ProjectionSource, index: number, destinationOverride: string = null) {
  for (let i = 0, ii = nodes.length; i < ii; ++i) {
    const currentNode = nodes[i];

    if (currentNode.$isContentProjectionSource) {
      currentNode.$slot.projectTo(slots);

      for (const slotName in slots) {
        slots[slotName].projectFrom(view, currentNode.$slot);
      }

      nodes.splice(i, 1);
      ii--; i--;
    } else if (DOM.isElementNodeType(currentNode) || DOM.isTextNodeType(currentNode) || currentNode.$slot instanceof PassThroughSlot) { //project only elements and text
      if (DOM.isTextNodeType(currentNode) && DOM.isAllWhitespace(currentNode)) {
        nodes.splice(i, 1);
        ii--; i--;
      } else {
        const found = slots[destinationOverride || getSlotName(currentNode)];

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

  for (const slotName in slots) {
    const slot = slots[slotName];

    if (slot.needsFallback) {
      slot.renderFallback(view, nodes, projectionSource, index);
    }
  }
}

function undistributeAll(slots: Record<string, IEmulatedShadowSlot>, projectionSource: ProjectionSource) {
  for (const slotName in slots) {
    slots[slotName].removeAll(projectionSource);
  }
}

const defaultSlotName = 'auDefaultSlot';

function getSlotName(node: INode): string {
  const name = (<any>node).$slotName;

  if (name === undefined) {
    return defaultSlotName;
  }

  return name;
}

function viewToNodes(view: IView) {
  let nodes: SlotNode[];

  if (view === null) {
    nodes = noNodes;
  } else {
    const childNodes = view.childNodes;
    const ii = childNodes.length;

    nodes = new Array(ii);

    for (let i = 0; i < ii; ++i) {
      nodes[i] = <SlotNode>childNodes[i];
    }
  }

  return nodes;
}

export const ShadowDOMEmulation = {
  createSlot(target: INode, owner: IViewOwner, name?: string, destination?: string, fallbackFactory?: IVisualFactory): IEmulatedShadowSlot {
    const anchor = <SlotNode>DOM.createAnchor();
    
    DOM.replaceNode(anchor, target);

    if (destination) {
      return new PassThroughSlot(owner, anchor, name || defaultSlotName, destination, fallbackFactory);
    } else {
      return new ShadowSlot(owner, anchor, name || defaultSlotName, fallbackFactory);
    }
  },

  distributeContent(content: IContentView, slots: Record<string, IEmulatedShadowSlot>): void {
    let nodes = viewToNodes(content);

    nodes.forEach(node => {
      if (node.$isContentProjectionSource) {
        (<any>node.$slot).logicalView = content;
      }
    });

    distributeNodes(content, nodes, slots, null, 0, null);
  },

  /** @internal */ distributeView(view: IView, slots: Record<string, IEmulatedShadowSlot>, projectionSource: ProjectionSource = null, index = 0, destinationOverride: string = null) {
    distributeNodes(view, viewToNodes(view), slots, projectionSource, index, destinationOverride);
  },

  /** @internal */ undistributeView(view: IView, slots: Record<string, IEmulatedShadowSlot>, projectionSource: ProjectionSource) {
    for (const slotName in slots) {
      slots[slotName].removeView(view, projectionSource);
    }
  }
}
