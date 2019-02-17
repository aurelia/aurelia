import { InjectArray, IRegistry } from '@aurelia/kernel';
import { ForOfStatement } from '../../binding/ast';
import { Binding } from '../../binding/binding';
import { AttributeDefinition, IAttributeDefinition } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags, State } from '../../flags';
import { IMountableComponent, IRenderable, IView, IViewFactory } from '../../lifecycle';
import { CollectionObserver, IBatchedCollectionSubscriber, IndexMap, IObservedArray, IScope, ObservedCollection } from '../../observation';
import { BindingContext, BindingContextValue, Scope } from '../../observation/binding-context';
import { getCollectionObserver } from '../../observation/observer-locator';
import { ProxyObserver } from '../../observation/proxy-observer';
import { bindable } from '../../templating/bindable';
import { CustomAttributeResource, ICustomAttribute, ICustomAttributeResource } from '../custom-attribute';

export interface Repeat<C extends ObservedCollection, T extends INode = INode> extends ICustomAttribute<T>, IBatchedCollectionSubscriber {}
export class Repeat<C extends ObservedCollection = IObservedArray, T extends INode = INode> implements Repeat<C, T> {
  public static readonly inject: InjectArray = [IRenderLocation, IRenderable, IViewFactory];

  public static readonly register: IRegistry['register'];
  public static readonly bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;

  @bindable public items: C;

  public $scope: IScope;

  public forOf: ForOfStatement;
  public hasPendingInstanceMutation: boolean;
  public local: string;
  public location: IRenderLocation<T>;
  public observer: CollectionObserver | null;
  public renderable: IRenderable<T>;
  public factory: IViewFactory<T>;
  public views: IView<T>[];
  public key: string | null;
  public keyed: boolean;
  private persistentFlags: LifecycleFlags;

  constructor(
    location: IRenderLocation<T>,
    renderable: IRenderable<T>,
    factory: IViewFactory<T>
  ) {
    this.factory = factory;
    this.hasPendingInstanceMutation = false;
    this.location = location;
    this.observer = null;
    this.renderable = renderable;
    this.views = [];
    this.key = null;
    this.keyed = false;
  }

  public binding(flags: LifecycleFlags): void {
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    this.checkCollectionObserver(flags);
    let current = this.renderable.$bindingHead as Binding;
    while (current !== null) {
      if (ProxyObserver.getRawIfProxy(current.target) === ProxyObserver.getRawIfProxy(this) && current.targetProperty === 'items') {
        this.forOf = current.sourceExpression as ForOfStatement;
        break;
      }
      current = current.$nextBinding as Binding;
    }
    this.local = this.forOf.declaration.evaluate(flags, this.$scope, null) as string;

    if (this.keyed || (flags & LifecycleFlags.keyedStrategy) > 0) {
      this.processViewsKeyed(null, flags);
    } else {
      this.processViewsNonKeyed(null, flags);
    }
  }

  public attaching(flags: LifecycleFlags): void {
    const { views, location } = this;
    let view: IView;
    for (let i = 0, ii = views.length; i < ii; ++i) {
      view = views[i];
      view.hold(location);
      view.$attach(flags);
    }
  }

  public detaching(flags: LifecycleFlags): void {
    const { views } = this;
    let view: IView;
    for (let i = 0, ii = views.length; i < ii; ++i) {
      view = views[i];
      view.$detach(flags);
      view.release(flags);
    }
  }

  public unbinding(flags: LifecycleFlags): void {
    this.checkCollectionObserver(flags);

    const { views } = this;
    let view: IView;
    for (let i = 0, ii = views.length; i < ii; ++i) {
      view = views[i];
      view.$unbind(flags);
    }
  }

  // called by SetterObserver (sync)
  public itemsChanged(newValue: C, oldValue: C, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    const $this = ProxyObserver.getRawIfProxy(this);
    $this.checkCollectionObserver(flags);
    flags |= LifecycleFlags.updateTargetInstance;
    if ($this.keyed || (flags & LifecycleFlags.keyedStrategy) > 0) {
      $this.processViewsKeyed(null, flags);
    } else {
      $this.processViewsNonKeyed(null, flags);
    }
  }

  // called by a CollectionObserver (async)
  public handleBatchedChange(indexMap: number[] | null, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    const $this = ProxyObserver.getRawIfProxy(this);
    flags |= (LifecycleFlags.fromFlush | LifecycleFlags.updateTargetInstance);
    if ($this.keyed || (flags & LifecycleFlags.keyedStrategy) > 0) {
      $this.processViewsKeyed(indexMap, flags);
    } else {
      $this.processViewsNonKeyed(indexMap, flags);
    }
  }

  // if the indexMap === null, it is an instance mutation, otherwise it's an items mutation
  // TODO: Reduce complexity (currently at 46)
  private processViewsNonKeyed(indexMap: number[] | null, flags: LifecycleFlags): void {
    const { views, $lifecycle } = this;
    let view: IView;
    if (this.$state & (State.isBound | State.isBinding)) {
      const { local, $scope, factory, forOf, items } = this;
      const oldLength = views.length;
      const newLength = forOf.count(flags, items);
      if (oldLength < newLength) {
        views.length = newLength;
        for (let i = oldLength; i < newLength; ++i) {
          views[i] = factory.create(flags);
        }
      } else if (newLength < oldLength) {
        $lifecycle.beginDetach();
        for (let i = newLength; i < oldLength; ++i) {
          view = views[i];
          view.release(flags);
          view.$detach(flags);
        }
        $lifecycle.endDetach(flags);
        $lifecycle.beginUnbind();
        for (let i = newLength; i < oldLength; ++i) {
          view = views[i];
          view.$unbind(flags);
        }
        $lifecycle.endUnbind(flags);
        views.length = newLength;
        if (newLength === 0) {
          return;
        }
      } else if (newLength === 0) {
        return;
      }

      $lifecycle.beginBind();
      if (indexMap === null) {
        forOf.iterate(flags, items, (arr, i, item: BindingContextValue) => {
          view = views[i];
          if (!!view.$scope && view.$scope.bindingContext[local] === item) {
            view.$bind(flags, Scope.fromParent(flags, $scope, view.$scope.bindingContext));
          } else {
            view.$bind(flags, Scope.fromParent(flags, $scope, BindingContext.create(flags, local, item)));
          }
        });
      } else {
        forOf.iterate(flags, items, (arr, i, item: BindingContextValue) => {
          view = views[i];
          if (!!view.$scope && (indexMap[i] === i || view.$scope.bindingContext[local] === item)) {
            view.$bind(flags, Scope.fromParent(flags, $scope, view.$scope.bindingContext));
          } else {
            view.$bind(flags, Scope.fromParent(flags, $scope, BindingContext.create(flags, local, item)));
          }
        });
      }
      $lifecycle.endBind(flags);
    }

    if (this.$state & (State.isAttached | State.isAttaching)) {
      const { location } = this;
      $lifecycle.beginAttach();
      if (indexMap === null) {
        for (let i = 0, ii = views.length; i < ii; ++i) {
          view = views[i];
          view.hold(location);
          view.$attach(flags);
        }
      } else {
        for (let i = 0, ii = views.length; i < ii; ++i) {
          if (indexMap[i] !== i) {
            view = views[i];
            view.hold(location);
            view.$attach(flags);
          }
        }
      }
      $lifecycle.endAttach(flags);
    }
  }

  private processViewsKeyed(indexMap: IndexMap | null, flags: LifecycleFlags): void {
    const { $lifecycle, local, $scope, factory, forOf, items } = this;
    let views = this.views;
    if (indexMap === null) {
      if (this.$state & (State.isBound | State.isBinding)) {
        $lifecycle.beginDetach();
        const oldLength = views.length;
        let view: IView;
        for (let i = 0; i < oldLength; ++i) {
          view = views[i];
          view.release(flags);
          view.$detach(flags);
        }
        $lifecycle.endDetach(flags);
        $lifecycle.beginUnbind();
        for (let i = 0; i < oldLength; ++i) {
          view = views[i];
          view.$unbind(flags);
        }
        $lifecycle.endUnbind(flags);

        const newLen = forOf.count(flags, items);
        views = this.views = Array(newLen);

        $lifecycle.beginBind();
        forOf.iterate(flags, items, (arr, i, item: BindingContextValue) => {
          view = views[i] = factory.create(flags);
          view.$bind(flags, Scope.fromParent(flags, $scope, BindingContext.create(flags, local, item)));
        });
        $lifecycle.endBind(flags);
      }

      if (this.$state & (State.isAttached | State.isAttaching)) {
        const { location } = this;
        $lifecycle.beginAttach();
        let view: IView;
        const len = views.length;
        for (let i = 0; i < len; ++i) {
          view = views[i];
          view.hold(location);
          view.$attach(flags);
        }
        $lifecycle.endAttach(flags);
      }
    } else {
      const mapLen = indexMap.length;
      let view: IView<T>;
      const deleted = indexMap.deletedItems;
      const deletedLen = deleted.length;
      let i = 0;
      if (this.$state & (State.isBound | State.isBinding)) {
        // first detach+unbind+(remove from array) the deleted view indices
        if (deletedLen > 0) {
          $lifecycle.beginDetach();
          i = 0;
          for (; i < deletedLen; ++i) {
            view = views[deleted[i]];
            view.release(flags);
            view.$detach(flags);
          }
          $lifecycle.endDetach(flags);
          $lifecycle.beginUnbind();
          for (i = 0; i < deletedLen; ++i) {
            view = views[deleted[i]];
            view.$unbind(flags);
          }
          $lifecycle.endUnbind(flags);
          i = 0;
          let j = 0;
          let k = 0;
          // tslint:disable-next-line:no-alphabetical-sort // alphabetical (numeric) sort is intentional
          deleted.sort();
          for (; i < deletedLen; ++i) {
            j = deleted[i] - i;
            views.splice(j, 1);
            k = 0;
            for (; k < mapLen; ++k) {
              if (indexMap[k] >= j) {
                --indexMap[k];
              }
            }
          }
        }

        // then insert new views at the "added" indices to bring the views array in aligment with indexMap size
        $lifecycle.beginBind();
        i = 0;
        for (; i < mapLen; ++i) {
          if (indexMap[i] === -2) {
            view = factory.create(flags);
            view.$bind(flags, Scope.fromParent(flags, $scope, BindingContext.create(flags, local, items[i])));
            views.splice(i, 0, view);
          }
        }
        $lifecycle.endBind(flags);
        if (views.length !== mapLen) {
          // TODO: create error code and use reporter with more informative message
          throw new Error(`viewsLen=${views.length}, mapLen=${mapLen}`);
        }
      }

      if (this.$state & (State.isAttached | State.isAttaching)) {
        const { location } = this;
        // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
        // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
        const seq = longestIncreasingSubsequence(indexMap);
        const seqLen = seq.length;
        $lifecycle.beginDetach();
        $lifecycle.beginAttach();
        const operation: Partial<IMountableComponent> = {
          $mount(): void {
            let next = location;
            let j = seqLen - 1;
            i = indexMap.length - 1;
            for (; i >= 0; --i) {
              if (indexMap[i] === -2) {
                view = views[i];

                view.$state |= State.isAttaching;

                let current = view.$componentHead;
                while (current !== null) {
                  current.$attach(flags | LifecycleFlags.fromAttach);
                  current = current.$nextComponent;
                }

                view.$nodes.insertBefore(next);

                view.$state |= (State.isMounted | State.isAttached);
                view.$state &= ~State.isAttaching;
                next = view.$nodes.firstChild;
              } else if (j < 0 || seqLen === 1 || i !== seq[j]) {
                view = views[indexMap[i]];
                view.$state |= State.isDetaching;

                let current = view.$componentTail;
                while (current !== null) {
                  current.$detach(flags | LifecycleFlags.fromDetach);
                  current = current.$prevComponent;
                }
                view.$nodes.remove();

                view.$state &= ~(State.isAttached | State.isDetaching | State.isMounted);

                view.$state |= State.isAttaching;

                current = view.$componentHead;
                while (current !== null) {
                  current.$attach(flags | LifecycleFlags.fromAttach);
                  current = current.$nextComponent;
                }

                view.$nodes.insertBefore(next);

                view.$state |= (State.isMounted | State.isAttached);
                view.$state &= ~State.isAttaching;

                next = view.$nodes.firstChild;
              } else {
                view = views[i];
                next = view.$nodes.firstChild;
                --j;
              }
            }
          },
          $nextMount: null
        };

        $lifecycle.enqueueMount(operation as IMountableComponent);

        $lifecycle.endDetach(flags);
        $lifecycle.endAttach(flags);
      }
    }
  }

  private checkCollectionObserver(flags: LifecycleFlags): void {
    const $this = ProxyObserver.getRawIfProxy(this);
    const oldObserver = $this.observer;
    if ($this.$state & (State.isBound | State.isBinding)) {
      const newObserver = $this.observer = getCollectionObserver(flags, $this.$lifecycle, $this.items);
      if (oldObserver !== newObserver && oldObserver) {
        oldObserver.unsubscribeBatched($this);
      }
      if (newObserver) {
        newObserver.subscribeBatched($this);
      }
    } else if (oldObserver) {
      oldObserver.unsubscribeBatched($this);
    }
  }
}
CustomAttributeResource.define({ name: 'repeat', isTemplateController: true }, Repeat);

type UintArray = Uint8Array | Uint16Array | Uint32Array;
let prevIndices: UintArray;
let tailIndices: UintArray;
let maxLen = 0;

// Based on inferno's lis_algorithm @ https://github.com/infernojs/inferno/blob/master/packages/inferno/src/DOM/patching.ts#L732
// with some tweaks to make it just a bit faster + account for IndexMap (and some names changes for readability)
/** @internal */
export function longestIncreasingSubsequence(indexMap: IndexMap): Uint8Array | Uint16Array | Uint32Array {
  const len = indexMap.length;
  const origLen = len + indexMap.deletedItems.length;
  const TArr = origLen < 0xFF ? Uint8Array : origLen < 0xFFFF ? Uint16Array : Uint32Array;

  if (len > maxLen) {
    maxLen = len;
    prevIndices = new TArr(len);
    tailIndices = new TArr(len);
  }

  let cursor = 0;
  let cur = 0;
  let prev = 0;
  let i = 0;
  let j = 0;
  let low = 0;
  let high = 0;
  let mid = 0;

  for (; i < len; i++) {
    cur = indexMap[i];
    if (cur !== -2) {
      j = prevIndices[cursor];

      prev = indexMap[j];
      if (prev !== -2 && prev < cur) {
        tailIndices[i] = j;
        prevIndices[++cursor] = i;
        continue;
      }

      low = 0;
      high = cursor;

      while (low < high) {
        mid = (low + high) >> 1;
        prev = indexMap[prevIndices[mid]];
        if (prev !== -2 && prev < cur) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }

      prev = indexMap[prevIndices[low]];
      if (cur < prev || prev === -2) {
        if (low > 0) {
          prevIndices[i] = prevIndices[low - 1];
        }
        prevIndices[low] = i;
      }
    }
  }
  i = ++cursor;
  const result = new TArr(i);
  cur = prevIndices[cursor - 1];

  while (cursor-- > 0) {
    result[cursor] = cur;
    cur = tailIndices[cur];
  }
  while (i-- > 0) prevIndices[i] = 0;
  return result;
}
