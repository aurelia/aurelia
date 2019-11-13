import { $Object, $String, $Boolean, $PropertyKey, $Undefined, $Any } from '../value';
import { IModule, ResolveSet, ResolvedBindingRecord, Realm } from '../realm';
import { $SetImmutablePrototype } from '../operations';
import { $PropertyDescriptor } from '../property-descriptor';

// http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects
export class $NamespaceExoticObject extends $Object<'NamespaceExoticObject'> {
  public readonly '[[Module]]': IModule;
  public readonly '[[Exports]]': readonly $String[];

  // http://www.ecma-international.org/ecma-262/#sec-modulenamespacecreate
  public constructor(
    realm: Realm,
    mod: IModule,
    exports: readonly $String[],
  ) {
    super(realm, 'NamespaceExoticObject', realm['[[Intrinsics]]'].null);
    // 1. Assert: module is a Module Record.
    // 2. Assert: module.[[Namespace]] is undefined.
    // 3. Assert: exports is a List of String values.
    // 4. Let M be a newly created object.
    // 5. Set M's essential internal methods to the definitions specified in 9.4.6.
    // 6. Set M.[[Module]] to module.
    this['[[Module]]'] = mod;

    // 7. Let sortedExports be a new List containing the same values as the list exports where the values are ordered as if an Array of the same values had been sorted using Array.prototype.sort using undefined as comparefn.
    // 8. Set M.[[Exports]] to sortedExports.
    this['[[Exports]]'] = exports.slice().sort();

    // 9. Create own properties of M corresponding to the definitions in 26.3.
    // 10. Set module.[[Namespace]] to M.
    mod['[[Namespace]]'] = this;

    // 11. Return M.
  }


  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-setprototypeof-v
  public '[[SetPrototypeOf]]'(V: $Object): $Boolean {
    // 1. Return ? SetImmutablePrototype(O, V).
    return $SetImmutablePrototype(this, V);
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-isextensible
  public '[[IsExtensible]]'(): $Boolean<false> {
    // 1. Return false.
    return this.realm['[[Intrinsics]]'].false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-preventextensions
  public '[[PreventExtensions]]'(): $Boolean<true> {
    // 1. Return true.
    return this.realm['[[Intrinsics]]'].true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-getownproperty-p
  public '[[GetOwnProperty]]'(P: $PropertyKey): $PropertyDescriptor | $Undefined {
    // 1. If Type(P) is Symbol, return OrdinaryGetOwnProperty(O, P).
    if (P.isSymbol) {
      return super['[[GetOwnProperty]]'](P);
    }

    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const O = this;

    // 2. Let exports be O.[[Exports]].
    const exports = O['[[Exports]]'];

    // 3. If P is not an element of exports, return undefined.
    if (exports.every(x => !x.is(P))) {
      return intrinsics.undefined;
    }

    // 4. Let value be ? O.[[Get]](P, O).
    const value = O['[[Get]]'](P, O);

    // 5. Return PropertyDescriptor { [[Value]]: value, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: false }.
    const desc = new $PropertyDescriptor(realm, P);
    desc['[[Value]]'] = value;
    desc['[[Writable]]'] = intrinsics.true;
    desc['[[Enumerable]]'] = intrinsics.true;
    desc['[[Configurable]]'] = intrinsics.false;

    return desc;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-defineownproperty-p-desc
  public '[[DefineOwnProperty]]'(P: $PropertyKey, Desc: $PropertyDescriptor): $Boolean {
    // 1. If Type(P) is Symbol, return OrdinaryDefineOwnProperty(O, P, Desc).
    if (P.isSymbol) {
      return super['[[DefineOwnProperty]]'](P, Desc);
    }

    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const O = this;

    // 2. Let current be ? O.[[GetOwnProperty]](P).
    const current = O['[[GetOwnProperty]]'](P);

    // 3. If current is undefined, return false.
    if (current.isUndefined) {
      return intrinsics.false;
    }

    // 4. If IsAccessorDescriptor(Desc) is true, return false.
    if (Desc.isAccessorDescriptor) {
      return intrinsics.false;
    }

    // 5. If Desc.[[Writable]] is present and has value false, return false.
    if (Desc['[[Writable]]'].value === false) {
      return intrinsics.false;
    }

    // 6. If Desc.[[Enumerable]] is present and has value false, return false.
    if (Desc['[[Enumerable]]'].value === false) {
      return intrinsics.false;
    }

    // 7. If Desc.[[Configurable]] is present and has value true, return false.
    if (Desc['[[Configurable]]'].value === true) {
      return intrinsics.false;
    }

    // 8. If Desc.[[Value]] is present, return SameValue(Desc.[[Value]], current.[[Value]]).
    if (!Desc['[[Value]]'].isEmpty) {
      if (Desc['[[Value]]'].is(current['[[Value]]'])) {
        return intrinsics.true;
      }
      return intrinsics.false;
    }

    // 9. Return true.
    return intrinsics.true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-hasproperty-p
  public '[[HasProperty]]'(P: $PropertyKey): $Boolean {
    // 1. If Type(P) is Symbol, return OrdinaryHasProperty(O, P).
    if (P.isSymbol) {
      return super['[[HasProperty]]'](P);
    }

    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const O = this;

    // 2. Let exports be O.[[Exports]].
    const exports = O['[[Exports]]'];

    // 3. If P is an element of exports, return true.
    if (exports.some(x => x.is(P))) {
      return intrinsics.true;
    }

    // 4. Return false.
    return intrinsics.false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-get-p-receiver
  public '[[Get]]'(P: $PropertyKey, Receiver: $Object): $Any {
    // 1. Assert: IsPropertyKey(P) is true.
    // 2. If Type(P) is Symbol, then
    // 2. a. Return ? OrdinaryGet(O, P, Receiver).
    if (P.isSymbol) {
      return super['[[Get]]'](P, Receiver);
    }

    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const O = this;

    // 3. Let exports be O.[[Exports]].
    const exports = O['[[Exports]]'];

    // 4. If P is not an element of exports, return undefined.
    if (exports.every(x => !x.is(P))) {
      return intrinsics.undefined;
    }

    // 5. Let m be O.[[Module]].
    const m = O['[[Module]]'];

    // 6. Let binding be ! m.ResolveExport(P, « »).
    const binding = m.ResolveExport(P, new ResolveSet()) as ResolvedBindingRecord;

    // 7. Assert: binding is a ResolvedBinding Record.
    // 8. Let targetModule be binding.[[Module]].
    const targetModule = binding.Module;

    // 9. Assert: targetModule is not undefined.
    // 10. Let targetEnv be targetModule.[[Environment]].
    const targetEnv = targetModule['[[Environment]]'];

    // 11. If targetEnv is undefined, throw a ReferenceError exception.
    if (targetEnv.isUndefined) {
      throw new ReferenceError('11. If targetEnv is undefined, throw a ReferenceError exception.');
    }

    // 12. Let targetEnvRec be targetEnv's EnvironmentRecord.
    // 13. Return ? targetEnvRec.GetBindingValue(binding.[[BindingName]], true).
    return targetEnv.GetBindingValue(binding.BindingName, intrinsics.true);
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-set-p-v-receiver
  public '[[Set]]'(P: $PropertyKey, V: $Any, Receiver: $Object): $Boolean<false> {
    // 1. Return false.
    return this.realm['[[Intrinsics]]'].false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-delete-p
  public '[[Delete]]'(P: $PropertyKey): $Boolean {
    // 1. Assert: IsPropertyKey(P) is true.
    // 2. If Type(P) is Symbol, then
    // 2. a. Return ? OrdinaryDelete(O, P).
    if (P.isSymbol) {
      return super['[[Delete]]'](P);
    }

    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const O = this;

    // 3. Let exports be O.[[Exports]].
    const exports = O['[[Exports]]'];

    // 4. If P is an element of exports, return false.
    if (exports.some(x => x.is(P))) {
      return intrinsics.false;
    }

    // 5. Return true.
    return intrinsics.true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-ownpropertykeys
  public '[[OwnPropertyKeys]]'(): readonly $PropertyKey[] {
    // 1. Let exports be a copy of O.[[Exports]].
    const $exports = this['[[Exports]]'].slice() as $PropertyKey[];

    // 2. Let symbolKeys be ! OrdinaryOwnPropertyKeys(O).
    const symbolKeys = super['[[OwnPropertyKeys]]']();

    // 3. Append all the entries of symbolKeys to the end of exports.
    $exports.push(...symbolKeys);

    // 4. Return exports.
    return $exports;
  }
}
