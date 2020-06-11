/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  PLATFORM,
  IIndexable,
  DI,
} from '@aurelia/kernel';

import {
  SegmentExpression,
} from './route-expression';
import {
  Routeable,
  RouteableComponent,
} from './route';
import {
  IRouteContext,
} from './route-context';
import {
  shallowEquals,
} from './validation';

/**
 * Either a `RouteableComponent`, a string (name) that can be resolved to one or a ViewportInstruction:
 * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
 * - `IViewportInstruction`: a viewport instruction object.
 * - `RouteableComponent`: see `RouteableComponent`.
 *
 * NOTE: differs from `Routeable` only in having `IViewportIntruction` instead of `IChildRouteConfig`
 * (which in turn are quite similar, but do have a few minor but important differences that make them non-interchangeable)
 */
export type NavigationInstruction = (
  string |
  IViewportInstruction |
  RouteableComponent
);

export const IViewportInstruction = DI.createInterface<IViewportInstruction>('IViewportInstruction').noDefault();
// All properties except `component` are optional.
export interface IViewportInstruction extends
  Omit<Partial<ViewportInstruction>, 'component'>,
  Pick<ViewportInstruction, 'component'> {}

export class ViewportInstruction {
  public constructor(
    /**
     * The component to load.
     *
     * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
     * - `RouteType`: a custom element class with optional static properties that specify routing-specific attributes.
     * - `PartialCustomElementDefinition`: either a complete `CustomElementDefinition` or a partial definition (e.g. an object literal with at least the `name` property)
     * - `IRouteViewModel`: an existing component instance.
     */
    public readonly component: string | RouteableComponent,
    /**
     * The name of the viewport this component should be loaded into.
     */
    public readonly viewport: string | null,
    /**
     * The parameters to pass into the component.
     */
    public readonly params: Readonly<IIndexable>,
    /**
     * The child routes to load underneath the context of this instruction's component.
     */
    public readonly children: readonly NavigationInstruction[],
  ) {}

  public static create(
    input: IViewportInstruction,
  ): ViewportInstruction {
    return new ViewportInstruction(
      input.component,
      input.viewport ?? null,
      input.params ?? {},
      input.children ?? [],
    );
  }

  public toString(): string {
    // TODO: write some shared serialization logic and use it in this toString() method
    return `ViewportInstruction(component:${this.component},viewport:${this.viewport},children.length:${this.children.length})`;
  }
}

export class RouteNode {
  /** @internal */
  public tree!: RouteTree;
  /** @internal */
  public version: number = 1;
  /** @internal */
  public snapshot: RouteNode | null = null;

  public get root(): RouteNode {
    return this.tree.root;
  }

  public getParent(): RouteNode | null {
    return this.tree.parent(this);
  }

  public constructor(
    /**
     * The `RouteContext` that this route is a child of.
     *
     * All nodes except the synthetic root (and those with unresolvable components) have a non-`null` context.
     */
    public context: IRouteContext | null,
    public readonly matchedSegments: readonly SegmentExpression[],
    public params: IIndexable,
    public queryParams: IIndexable,
    public fragment: string | null,
    public data: IIndexable,
    public viewport: string,
    public component: Routeable | null,
    public append: boolean,
    public readonly children: RouteNode[],
    /**
     * Not-yet-resolved navigation instructions.
     *
     * Instructions need an `IRouteContext` to be resolved into complete `RouteNode`s.
     *
     * Resolved instructions are removed from this array, such that a `RouteNode` can be considered
     * "fully resolved" when it has `residue.length === 0` and `children.length >= 0`
     */
    public readonly residue: NavigationInstruction[],
  ) {}

  public static createEmpty(): RouteNode {
    return new RouteNode(
      /*         context */null,
      /* matchedSegments */[],
      /*          params */{},
      /*     queryParams */{},
      /*        fragment */'',
      /*            data */{},
      /*        viewport */'default',
      /*       component */null,
      /*          append */false,
      /*        children */[],
      /*    instructions */[],
    );
  }

  public appendChild(child: RouteNode): void {
    this.children.push(child);
    child.setTree(this.tree);
  }

  /** @internal */
  public setTree(tree: RouteTree): void {
    this.tree = tree;
    for (const child of this.children) {
      child.setTree(tree);
    }
  }

  /** @internal */
  public findParent(value: RouteNode): RouteNode | null {
    if (value === this) {
      return null;
    }

    for (const child of this.children) {
      if (child === value) {
        return this;
      }

      const parent = child.findParent(value);
      if (parent !== null) {
        return parent;
      }
    }

    return null;
  }

  /** @internal */
  public findPath(value: RouteNode): RouteNode[] {
    if (value === this) {
      return [this];
    }

    for (const child of this.children) {
      const path = child.findPath(value);
      if (path.length > 0) {
        path.unshift(this);
        return path;
      }
    }

    return PLATFORM.emptyArray;
  }

  public clone(): RouteNode {
    const clone = new RouteNode(
      this.context,
      this.matchedSegments,
      { ...this.params },
      { ...this.queryParams },
      this.fragment,
      { ...this.data },
      this.viewport,
      this.component,
      this.append,
      this.children.map(function (childNode) {
        return childNode.clone();
      }),
      [...this.residue],
    );
    clone.version = this.version + 1;
    return clone;
  }

  public makeSnapshot(): void {
    this.snapshot = this.clone();
  }

  /**
   * Performs a shallow equality check on `params`, `queryParams` and `data`,
   * performs a value/reference equality on all other properties.
   *
   * Does not compare `children` or `rawInstructions`.
   */
  public shallowEquals(other: RouteNode): boolean {
    return (
      this.context === other.context &&
      this.matchedSegments === other.matchedSegments &&
      shallowEquals(this.params, other.params) &&
      shallowEquals(this.queryParams, other.queryParams) &&
      this.fragment === other.fragment &&
      shallowEquals(this.data, other.data) &&
      this.viewport === other.viewport &&
      this.component === other.component &&
      this.append === other.append
    );
  }

  public toString(): string {
    const route = this.matchedSegments.map(x => x.toString()).join('/');
    const path = this.context?.definition.config.path ?? '';
    return `RouteNode(route:'${route}',path:'${path}',viewport:'${this.viewport}',children.length:'${this.children.length}',residue.length:'${this.residue.length}')`;
  }
}

export class RouteTree {
  public constructor(
    public url: string,
    public root: RouteNode,
  ) {}

  public static createEmpty(): RouteTree {
    return new RouteTree(
      /*  url */'',
      /* root */RouteNode.createEmpty(),
    );
  }

  public parent(value: RouteNode): RouteNode | null {
    if (value === this.root) {
      return null;
    }

    const path = this.root.findPath(value);
    return path[path.length - 2];
  }

  public siblings(value: RouteNode): RouteNode[] {
    return this.root.findParent(value)?.children ?? PLATFORM.emptyArray;
  }

  public pathFromRoot(value: RouteNode): RouteNode[] {
    return this.root.findPath(value);
  }

  public clone(): RouteTree {
    const clone = new RouteTree(
      this.url,
      this.root.clone(),
    );
    clone.root.setTree(this);
    return clone;
  }

  public toString(): string {
    return this.root.toString();
  }
}
