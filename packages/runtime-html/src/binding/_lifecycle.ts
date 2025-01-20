/* eslint-disable max-lines-per-function */
import { astAssign, astBind, astEvaluate, astUnbind, IObserver, queueTask, type Scope } from '@aurelia/runtime';
import type { AttributeBinding } from './attribute-binding';
import type { ContentBinding } from './content-binding';
import type { InterpolationBinding, InterpolationPartBinding } from './interpolation-binding';
import type { LetBinding } from './let-binding';
import type { ListenerBinding } from './listener-binding';
import type { PropertyBinding } from './property-binding';
import type { RefBinding } from './ref-binding';
import type { SpreadBinding, SpreadValueBinding } from './spread-binding';
import { createMappedError, ErrorNames } from '../errors';
import { BindingTargetSubscriber, IFlushQueue } from './binding-utils';
import { IIndexable, isArray } from '@aurelia/kernel';
import { fromView, IBinding, oneTime, toView } from './interfaces-bindings';

type BindingBase = {
  $kind?: void;
  bind?(scope: Scope): void;
  unbind?(): void;
  handleChange?(): void;
  handleCollectionChange?(): void;
  updateTarget(value: unknown): void;
  flags?: Flags;
};

type $Binding = (
  | AttributeBinding
  | ContentBinding
  | InterpolationBinding
  | InterpolationPartBinding
  | LetBinding
  | ListenerBinding
  | PropertyBinding
  | RefBinding
  | SpreadBinding
  | SpreadValueBinding
) & {
  flags?: Flags;
};

const enum Flags {
  none     = 0b00,
  isQueued = 0b01,
}

const knownBindableBindings = new Set(['Attribute', 'Content', 'Interpolation', 'InterpolationPart', 'Let', 'Listener', 'Property', 'Ref', 'Spread', 'SpreadValue']);
export const bindingBind: {
  (b: $Binding | BindingBase, scope: Scope): void;
  (b: IBinding, scope: Scope): void;
} = (_b: $Binding | BindingBase | IBinding, scope: Scope): void => {
  const b = _b as $Binding | BindingBase;
  if (!b.$kind || !knownBindableBindings.has(b.$kind)) {
    return (b as BindingBase).bind?.(scope);
  }

  if (b.isBound) {
    if (scope === b._scope) {
      return;
    }
    bindingUnbind(b);
  }
  b.isBound = true;
  b._scope = scope;
  b.flags = Flags.none;

  switch (b.$kind) {
    case 'Attribute': {
      astBind(b.ast, scope, b);

      if (b.mode & (toView | oneTime)) {
        b.updateTarget(b._value = astEvaluate(b.ast, scope, b, (b.mode & toView) > 0 ? b : null));
      }
      break;
    }
    case 'Content': {
      astBind(b.ast, scope, b);

      const v = b._value = astEvaluate(b.ast, b._scope, b, (b.mode & toView) > 0 ? b : null);
      if (isArray(v)) {
        b.observeCollection(v);
      }
      b.updateTarget(v);
      break;
    }
    case 'Interpolation': {
      const partBindings = b.partBindings;
      const ii = partBindings.length;
      let i = 0;
      for (; ii > i; ++i) {
        bindingBind(partBindings[i], scope);
      }
      b.updateTarget();
      break;
    }
    case 'InterpolationPart': {
      astBind(b.ast, scope, b);

      b._value = astEvaluate(b.ast, b._scope, b, (b.mode & toView) > 0 ?  b : null);
      if (isArray(b._value)) {
        b.observeCollection(b._value);
      }
      break;
    }
    case 'Let': {
      b.target = (b._toBindingContext ? scope.bindingContext : scope.overrideContext) as IIndexable;

      astBind(b.ast, scope, b);

      const value = astEvaluate(b.ast, b._scope, b, b);
      b.updateTarget(value);
      break;
    }
    case 'Listener': {
      astBind(b.ast, scope, b);

      b.target.addEventListener(b.targetEvent, b, b._options);
      break;
    }
    case 'Property': {
      astBind(b.ast, scope, b);

      const observerLocator = b.oL;
      const $mode = b.mode;
      let targetObserver = b._targetObserver;
      if (!targetObserver) {
        if ($mode & fromView) {
          targetObserver = observerLocator.getObserver(b.target, b.targetProperty);
        } else {
          targetObserver = observerLocator.getAccessor(b.target, b.targetProperty);
        }
        b._targetObserver = targetObserver;
      }

      const shouldConnect = ($mode & toView) > 0;

      if ($mode & (toView | oneTime)) {
        b.updateTarget(astEvaluate(b.ast, b._scope, b, shouldConnect ? b : null));
      }

      if ($mode & fromView) {
        (targetObserver as IObserver).subscribe(b._targetSubscriber ??= new BindingTargetSubscriber(b, b.l.get(IFlushQueue)));
        if (!shouldConnect) {
          b.updateSource(targetObserver.getValue(b.target, b.targetProperty));
        }
      }
      break;
    }
    case 'Ref': {
      astBind(b.ast, scope, b);

      astAssign(b.ast, b._scope, b, b.target);
      break;
    }
    case 'Spread': {
      const innerScope = b._scope = b._hydrationContext.controller.scope.parent ?? void 0;
      if (innerScope == null) {
        throw createMappedError(ErrorNames.no_spread_scope_context_found);
      }

      b._innerBindings.forEach(b => bindingBind(b, innerScope));
      break;
    }
    case 'SpreadValue': {
      astBind(b.ast, scope, b);

      const value = astEvaluate(b.ast, scope, b, b);

      b._createBindings(value as Record<string, unknown> | null, false);
      break;
    }
    default:
      throw new Error(`Invalid binding type: ${(b as $Binding).$kind}`);
  }
};

export const bindingUnbind: {
  (b: $Binding | BindingBase): void;
  (b: IBinding): void;
} = (_b: $Binding | BindingBase | IBinding): void => {
  const b = _b as $Binding | BindingBase;
  if (!b.$kind || !knownBindableBindings.has(b.$kind)) {
    return (b as BindingBase).unbind?.();
  }

  if (!b.isBound) {
    return;
  }
  b.isBound = false;

  switch (b.$kind) {
    case 'Attribute': {
      astUnbind(b.ast, b._scope!, b);

      b._value = void 0;
      b.obs.clearAll();
      break;
    }
    case 'Content': {
      astUnbind(b.ast, b._scope!, b);
      if (b._needsRemoveNode) {
        (b._value as Node).parentNode?.removeChild(b._value as Node);
      }

      // TODO: should existing value (either connected node, or a string)
      // be removed when b binding is unbound?
      // b.updateTarget('');
      b.obs.clearAll();
      break;
    }
    case 'Interpolation': {
      const partBindings = b.partBindings;
      const ii = partBindings.length;
      let i = 0;
      for (; ii > i; ++i) {
        bindingUnbind(partBindings[i]);
      }
      break;
    }
    case 'InterpolationPart': {
      astUnbind(b.ast, b._scope!, b);

      b.obs.clearAll();
      break;
    }
    case 'Let': {
      astUnbind(b.ast, b._scope!, b);

      b.obs.clearAll();
      break;
    }
    case 'Listener': {
      astUnbind(b.ast, b._scope!, b);

      b.target.removeEventListener(b.targetEvent, b, b._options);
      break;
    }
    case 'Property': {
      astUnbind(b.ast, b._scope!, b);

      if (b._targetSubscriber) {
        (b._targetObserver as IObserver).unsubscribe(b._targetSubscriber);
        b._targetSubscriber = null;
      }
      b.obs.clearAll();
      break;
    }
    case 'Ref': {
      if (astEvaluate(b.ast, b._scope!, b, null) === b.target) {
        astAssign(b.ast, b._scope!, b, null);
      }

      astUnbind(b.ast, b._scope!, b);
      break;
    }
    case 'Spread': {
      b._innerBindings.forEach(bindingUnbind);
      break;
    }
    case 'SpreadValue': {
      astUnbind(b.ast, b._scope!, b);
      let key: string;
      // can also try to keep track of what the active bindings are
      // but we know in our impl, all unbind are idempotent
      // so just be simple and unbind all
      for (key in b._bindingCache) {
        bindingUnbind(b._bindingCache[key]);
      }
      break;
    }
    default:
      throw new Error(`Invalid binding type: ${(b as $Binding).$kind}`);
  }

  b._scope = void 0;
  (b.flags as Flags) &= ~Flags.isQueued;
};

export const bindingHandleChange = (b: $Binding | BindingBase): void => {
  if (b.$kind === void 0) {
    return b.handleChange?.();
  }

  if (!b.isBound) {
    return;
  }

  if ((b.flags as Flags) & Flags.isQueued) {
    return;
  }

  (b.flags as Flags) |= Flags.isQueued;

  switch (b.$kind) {
    case 'Let':
    case 'Property': {
      flushChanges(b);
      break;
    }
    default: {
      queueTask(() => {
        flushChanges(b);
      });
      break;
    }
  }
};

export const flushChanges = (b: $Binding): void => {
  if (!b.isBound) {
    return;
  }

  if (((b.flags as Flags) & Flags.isQueued) === 0) {
    return;
  }

  (b.flags as Flags) &= ~Flags.isQueued;

  switch (b.$kind) {
    case 'Attribute':
    case 'Content':
    case 'InterpolationPart':
    case 'SpreadValue':
    case 'Let':
    case 'Property': {
      b.obs.version++;
      const newValue = astEvaluate(b.ast, b._scope!, b, (b.mode & toView) > 0 ? b : null);
      b.obs.clear();

      switch (b.$kind) {
        case 'Attribute':
        case 'Content': {
          if (newValue !== b._value) {
            b._value = newValue;
            b.updateTarget(newValue);
          }
          break;
        }
        case 'InterpolationPart': {
          // todo(!=): maybe should do strict comparison?
          // eslint-disable-next-line eqeqeq
          if (newValue != b._value) {
            b._value = newValue;
            if (isArray(newValue)) {
              b.observeCollection(newValue);
            }
            b.updateTarget();
          }
          break;
        }
        case 'SpreadValue':
        case 'Let':
        case 'Property': {
          b.updateTarget(newValue);
          break;
        }
      }
      break;
    }
  }
};

export const bindingHandleCollectionChange = (b: $Binding | BindingBase): void => {
  if (b.$kind === void 0) {
    return b.handleCollectionChange?.();
  }

  if (!b.isBound) {
    return;
  }

  if ((b.flags as Flags) & Flags.isQueued) {
    return;
  }

  (b.flags as Flags) |= Flags.isQueued;

  queueTask(() => {
    flushCollectionChanges(b);
  });
};

export const flushCollectionChanges = (b: $Binding): void => {
  if (!b.isBound) {
    return;
  }

  if (((b.flags as Flags) & Flags.isQueued) === 0) {
    return;
  }

  (b.flags as Flags) &= ~Flags.isQueued;

  switch (b.$kind) {
    case 'Attribute':
    case 'Let':
    case 'Property':  {
      (b.flags as Flags) |= Flags.isQueued;
      flushChanges(b);
      break;
    }
    case 'Content': {
      b.obs.version++;
      const v = b._value = astEvaluate(b.ast, b._scope!, b, (b.mode & toView) > 0 ? b : null);
      b.obs.clear();
      if (isArray(v)) {
        b.observeCollection(v);
      }

      b.updateTarget(v);
      break;
    }
    case 'InterpolationPart': {
      b.updateTarget();
      break;
    }
    case 'SpreadValue': {
      b.obs.version++;
      const newValue = astEvaluate(b.ast, b._scope!, b, (b.mode & toView) > 0 ? b : null);
      b.obs.clear();
      b.updateTarget(newValue);
      break;
    }
  }
};
