/* eslint-disable max-lines-per-function */
import { astAssign, astBind, astEvaluate, IObserver, type Scope } from '@aurelia/runtime';
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
import { fromView, oneTime, toView } from './interfaces-bindings';

type BindingBase = {
  $kind: void;
  bind(scope: Scope): void;
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
  | BindingBase
);

export const bind = (b: $Binding | BindingBase, scope: Scope): void => {
  if (b.$kind === void 0) {
    return b.bind(scope);
  }

  if (b.isBound) {
    if (scope === b._scope) {
      return;
    }
    b.unbind();
  }
  b.isBound = true;
  b._scope = scope;

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
        partBindings[i].bind(scope);
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

      b._value = astEvaluate(b.ast, b._scope, b, b);
      b.updateTarget();
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

      b._innerBindings.forEach(b => b.bind(innerScope));
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
