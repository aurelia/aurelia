import {
  $BuiltinFunction,
  $Function,
} from '../types/function.js';
import {
  Realm,
  ExecutionContext,
} from '../realm.js';
import {
  $AnyNonEmpty,
  $AnyNonEmptyNonError,
} from '../types/_shared.js';
import {
  $Error, $TypeError,
} from '../types/error.js';
import {
  $Undefined,
} from '../types/undefined.js';
import {
  $FunctionPrototype,
} from './function.js';
import {
  $Object,
} from '../types/object.js';
import {
  $List
} from '../types/list.js';
import {
  $ProxyExoticObject,
} from '../exotics/proxy.js';
import {
  $Null,
} from '../types/null.js';
import {
  $CreateDataProperty,
} from '../operations.js';
import {
  $String,
} from '../types/string.js';

// http://www.ecma-international.org/ecma-262/#sec-proxy-objects
// 26.2 Proxy Objects

// http://www.ecma-international.org/ecma-262/#sec-proxy-constructor
// 26.2.1 The Proxy Constructor
export class $ProxyConstructor extends $BuiltinFunction<'%Proxy%'> {
  // http://www.ecma-international.org/ecma-262/#sec-proxy.revocable
  // 26.2.2.1 Proxy.revocable ( target , handler )
  public get revocable(): $Proxy_revocable {
    return this.getProperty(this.realm['[[Intrinsics]]'].revocable)['[[Value]]'] as $Proxy_revocable;
  }
  public set revocable(value: $Proxy_revocable) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].revocable, value);
  }

  public constructor(
    realm: Realm,
    functionPrototype: $FunctionPrototype,
  ) {
    super(realm, '%Proxy%', functionPrototype);
  }

  // http://www.ecma-international.org/ecma-262/#sec-proxy-target-handler
  // 26.2.1.1 Proxy ( target , handler )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [target, handler]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }
    if (handler === void 0) {
      handler = intrinsics.undefined;
    }

    // 1. If NewTarget is undefined, throw a TypeError exception.
    if (NewTarget.isUndefined) {
      return new $TypeError(realm, `Proxy cannot be called as a function`);
    }

    // 2. Return ? ProxyCreate(target, handler).
    return new $ProxyExoticObject(realm, target, handler);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-proxy.revocable
// 26.2.2.1 Proxy.revocable ( target , handler )
export class $Proxy_revocable extends $BuiltinFunction<'Proxy.revocable'> {
  public constructor(
    realm: Realm,
    functionPrototype: $FunctionPrototype,
  ) {
    super(realm, 'Proxy.revocable', functionPrototype);
  }

  // http://www.ecma-international.org/ecma-262/#sec-proxy-target-handler
  // 26.2.1.1 Proxy ( target , handler )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [target, handler]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }
    if (handler === void 0) {
      handler = intrinsics.undefined;
    }

    // 1. Let p be ? ProxyCreate(target, handler).
    const p = new $ProxyExoticObject(realm, target, handler) as $ProxyExoticObject | $Error;
    if (p.isAbrupt) { return p; }

    // 2. Let steps be the algorithm steps defined in Proxy Revocation Functions.
    // 3. Let revoker be CreateBuiltinFunction(steps, « [[RevocableProxy]] »).
    // 4. Set revoker.[[RevocableProxy]] to p.
    const revoker = new $Proxy_revocation(realm, p);

    // 5. Let result be ObjectCreate(%ObjectPrototype%).
    const result = $Object.ObjectCreate(ctx, 'Revocable Proxy', intrinsics['%ObjectPrototype%']);

    // 6. Perform CreateDataProperty(result, "proxy", p).
    $CreateDataProperty(ctx, result, new $String(realm, 'proxy'), p);

    // 7. Perform CreateDataProperty(result, "revoke", revoker).
    $CreateDataProperty(ctx, result, new $String(realm, 'revoke'), revoker);

    // 8. Return result.
    return result;
  }
}

// http://www.ecma-international.org/ecma-262/#sec-proxy-revocation-functions
// 26.2.2.1.1 Proxy Revocation Functions
export class $Proxy_revocation extends $BuiltinFunction<'Proxy Revocation'> {
  public '[[RecovableProxy]]': $ProxyExoticObject | $Null;

  public constructor(
    realm: Realm,
    revocableProxy: $ProxyExoticObject,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, 'Proxy Revocation', intrinsics['%FunctionPrototype%']);

    this['[[RecovableProxy]]'] = revocableProxy;
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [target, handler]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }
    if (handler === void 0) {
      handler = intrinsics.undefined;
    }

    // 1. Let F be the active function object.
    const F = this;

    // 2. Let p be F.[[RevocableProxy]].
    const p = F['[[RecovableProxy]]'];

    // 3. If p is null, return undefined.
    if (p.isNull) {
      return intrinsics.undefined;
    }

    // 4. Set F.[[RevocableProxy]] to null.
    F['[[RecovableProxy]]'] = intrinsics.null;

    // 5. Assert: p is a Proxy object.
    // 6. Set p.[[ProxyTarget]] to null.
    p['[[ProxyTarget]]'] = intrinsics.null;

    // 7. Set p.[[ProxyHandler]] to null.
    p['[[ProxyHandler]]'] = intrinsics.null;

    // 8. Return undefined.
    return intrinsics.undefined;
  }
}

