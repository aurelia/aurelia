/* eslint-disable */
import { IModule, Realm } from '../realm';
import { $HasProperty, $Get, $DefinePropertyOrThrow, $Set, $HasOwnProperty } from '../operations';
import { $PropertyDescriptor } from './property-descriptor';
import { $Any } from './_shared';
import { $String } from './string';
import { $Null } from './null';
import { $Boolean } from './boolean';
import { $Empty } from './empty';
import { $Undefined } from './undefined';
import { $Object } from './object';
import { $Function } from './function';

export type $EnvRec = (
  $DeclarativeEnvRec |
  $ObjectEnvRec |
  $FunctionEnvRec |
  $GlobalEnvRec |
  $ModuleEnvRec
);

let bindingId = 0;

export class $Binding {
  public readonly '<$Binding>': unknown;

  public readonly id: number = ++bindingId;

  public get isIndirect(): boolean {
    return this.M !== null;
  }

  public constructor(
    public isMutable: boolean,
    public isStrict: boolean,
    public isInitialized: boolean,
    public canBeDeleted: boolean,
    public value: $Any,
    public name: string,
    public origin: $EnvRec,
    public M: IModule | null = null,
    public N2: $String | null = null,
  ) {}
}

// http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records
export class $DeclarativeEnvRec {
  public readonly '<$DeclarativeEnvRec>': unknown;

  public readonly bindings: Map<string, $Binding> = new Map();

  // Everything is false because an environment record should not appear like any kind of normal ES value.
  public get isEmpty(): false { return false; }
  public get isUndefined(): false { return false; }
  public get isNull(): false { return false; }
  public get isNil(): false { return false; }
  public get isBoolean(): false { return false; }
  public get isNumber(): false { return false; }
  public get isString(): false { return false; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): false { return false; }
  public get isObject(): false { return false; }
  public get isFunction(): false { return false; }

  // http://www.ecma-international.org/ecma-262/#sec-newdeclarativeenvironment
  public constructor(
    public readonly realm: Realm,
    public readonly outer: $EnvRec | $Null,
  ) {
    // 1. Let env be a new Lexical Environment.
    // 2. Let envRec be a new declarative Environment Record containing no bindings.
    // 3. Set env's EnvironmentRecord to envRec.
    // 4. Set the outer lexical environment reference of env to E.
    // 5. Return env.
  }

  // Overrides
  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-hasbinding-n
  public HasBinding(N: $String): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    const envRec = this;

    // 2. If envRec has a binding for the name that is the value of N, return true.
    if (envRec.bindings.has(N.value)) {
      return intrinsics.true;
    }

    // 3. Return false.
    return intrinsics.false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-createmutablebinding-n-d
  public CreateMutableBinding(N: $String, D: $Boolean): $Empty {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Assert: envRec does not already have a binding for N.
    // 3. Create a mutable binding in envRec for N and record that it is uninitialized. If D is true, record that the newly created binding may be deleted by a subsequent DeleteBinding call.
    const binding = new $Binding(
      /* isMutable */true,
      /* isStrict */false,
      /* isInitialized */false,
      /* canBeDeleted */D.value,
      /* value */intrinsics.empty,
      /* name */N.value,
      /* origin */this,
    );
    envRec.bindings.set(N.value, binding);

    // 4. Return NormalCompletion(empty).
    return intrinsics.empty;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-createimmutablebinding-n-s
  public CreateImmutableBinding(N: $String, S: $Boolean): $Empty {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Assert: envRec does not already have a binding for N.
    // 3. Create an immutable binding in envRec for N and record that it is uninitialized. If S is true, record that the newly created binding is a strict binding.
    const binding = new $Binding(
      /* isMutable */false,
      /* isStrict */S.value,
      /* isInitialized */false,
      /* canBeDeleted */false,
      /* value */intrinsics.empty,
      /* name */N.value,
      /* origin */this,
    );
    envRec.bindings.set(N.value, binding);

    // 4. Return NormalCompletion(empty).
    return intrinsics.empty;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-initializebinding-n-v
  public InitializeBinding(N: $String, V: $Any): $Empty {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Assert: envRec must have an uninitialized binding for N.
    const binding = envRec.bindings.get(N.value)!;

    // 3. Set the bound value for N in envRec to V.
    binding.value = V;

    // 4. Record that the binding for N in envRec has been initialized.
    binding.isInitialized = true;

    // 5. Return NormalCompletion(empty).
    return intrinsics.empty;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-setmutablebinding-n-v-s
  public SetMutableBinding(N: $String, V: $Any, S: $Boolean): $Empty {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    const envRec = this;

    // 2. If envRec does not have a binding for N, then
    const bindings = this.bindings;
    const binding = bindings.get(N.value);
    if (binding === void 0) {
      // 2. a. If S is true, throw a ReferenceError exception.
      if (S.isTruthy) {
        throw new ReferenceError('2. a. If S is true, throw a ReferenceError exception.');
      }

      // 2. b. Perform envRec.CreateMutableBinding(N, true).
      envRec.CreateMutableBinding(N, intrinsics.true);

      // 2. c. Perform envRec.InitializeBinding(N, V).
      envRec.InitializeBinding(N, V);

      // 2. d. Return NormalCompletion(empty).
      return intrinsics.empty;
    }

    // 3. If the binding for N in envRec is a strict binding, set S to true.
    if (binding.isStrict) {
      S = intrinsics.true;
    }

    // 4. If the binding for N in envRec has not yet been initialized, throw a ReferenceError exception.
    if (!binding.isInitialized) {
      throw new ReferenceError('4. If the binding for N in envRec has not yet been initialized, throw a ReferenceError exception.');
    }
    // 5. Else if the binding for N in envRec is a mutable binding, change its bound value to V.
    else if (binding.isMutable) {
      binding.value = V;
    }
    // 6. Else,
    else {
      // 6. a. Assert: This is an attempt to change the value of an immutable binding.
      // 6. b. If S is true, throw a TypeError exception.
      if (S.isTruthy) {
        throw new TypeError('6. b. If S is true, throw a TypeError exception.');
      }
    }

    // 7. Return NormalCompletion(empty).
    return intrinsics.empty;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-getbindingvalue-n-s
  public GetBindingValue(N: $String, S: $Boolean): $Any {
    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Assert: envRec has a binding for N.
    const binding = envRec.bindings.get(N.value)!;

    // 3. If the binding for N in envRec is an uninitialized binding, throw a ReferenceError exception.
    if (!binding.isInitialized) {
      throw new ReferenceError('3. If the binding for N in envRec is an uninitialized binding, throw a ReferenceError exception.');
    }

    // 4. Return the value currently bound to N in envRec.
    return binding.value;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-deletebinding-n
  public DeleteBinding(N: $String): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    const envRec = this;
    const bindings = envRec.bindings;

    // 2. Assert: envRec has a binding for the name that is the value of N.
    const binding = bindings.get(N.value)!;

    // 3. If the binding for N in envRec cannot be deleted, return false.
    if (!binding.canBeDeleted) {
      return intrinsics.false;
    }

    // 4. Remove the binding for N from envRec.
    bindings.delete(N.value);

    // 5. Return true.
    return intrinsics.true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-hasthisbinding
  public HasThisBinding(): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Return false.
    return intrinsics.false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-hassuperbinding
  public HasSuperBinding(): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Return false.
    return intrinsics.false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-withbaseobject
  public WithBaseObject(): $Undefined {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Return undefined.
    return intrinsics.undefined;
  }
}

export class $ObjectEnvRec {
  public readonly '<$ObjectEnvRec>': unknown;

  public withEnvironment: boolean = false;

  // Everything is false because an environment record should not appear like any kind of normal ES value.
  public get isEmpty(): false { return false; }
  public get isUndefined(): false { return false; }
  public get isNull(): false { return false; }
  public get isNil(): false { return false; }
  public get isBoolean(): false { return false; }
  public get isNumber(): false { return false; }
  public get isString(): false { return false; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): false { return false; }
  public get isObject(): false { return false; }
  public get isFunction(): false { return false; }

  // http://www.ecma-international.org/ecma-262/#sec-newobjectenvironment
  public constructor(
    public readonly realm: Realm,
    public readonly outer: $EnvRec | $Null,
    public readonly bindingObject: $Object,
  ) {
    // 1. Let env be a new Lexical Environment.
    // 2. Let envRec be a new object Environment Record containing O as the binding object.
    // 3. Set env's EnvironmentRecord to envRec.
    // 4. Set the outer lexical environment reference of env to E.
    // 5. Return env.
  }

  // Overrides
  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-hasbinding-n
  public HasBinding(N: $String): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];


    // 1. Let envRec be the object Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let bindings be the binding object for envRec.
    const bindings = envRec.bindingObject;

    // 3. Let foundBinding be ? HasProperty(bindings, N).
    const foundBinding = $HasProperty(bindings, N);

    // 4. If foundBinding is false, return false.
    if (foundBinding.isFalsey) {
      return intrinsics.false;
    }

    // 5. If the withEnvironment flag of envRec is false, return true.
    if (!envRec.withEnvironment) {
      return intrinsics.true;
    }

    // 6. Let unscopables be ? Get(bindings, @@unscopables).
    const unscopables = $Get(bindings, intrinsics['@@unscopables']);

    // 7. If Type(unscopables) is Object, then
    if (unscopables.isObject) {
      // 7. a. Let blocked be ToBoolean(? Get(unscopables, N)).
      const blocked = $Get(unscopables, N).isTruthy;

      // 7. b. If blocked is true, return false.
      if (blocked) {
        return intrinsics.false;
      }
    }

    // 8. Return true.
    return intrinsics.true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-createmutablebinding-n-d
  public CreateMutableBinding(N: $String, D: $Boolean): $Boolean {
    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Let envRec be the object Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let bindings be the binding object for envRec.
    const bindings = envRec.bindingObject;

    // 3. Return ? DefinePropertyOrThrow(bindings, N, PropertyDescriptor { [[Value]]: undefined, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: D }).
    const Desc = new $PropertyDescriptor(realm, N);
    Desc['[[Value]]'] = intrinsics.undefined;
    Desc['[[Writable]]'] = intrinsics.true;
    Desc['[[Enumerable]]'] = intrinsics.true;
    Desc['[[Configurable]]'] = D;
    return $DefinePropertyOrThrow(bindings, N, Desc);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-createimmutablebinding-n-s
  public CreateImmutableBinding(N: $String, S: $Boolean): $Boolean {
    // The concrete Environment Record method CreateImmutableBinding is never used within this specification in association with object Environment Records.
    throw new Error('Should not be called');
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-initializebinding-n-v
  public InitializeBinding(N: $String, V: $Any): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the object Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Assert: envRec must have an uninitialized binding for N.
    // 3. Record that the binding for N in envRec has been initialized.
    // TODO: record

    // 4. Return ? envRec.SetMutableBinding(N, V, false).
    return envRec.SetMutableBinding(N, V, intrinsics.false);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-setmutablebinding-n-v-s
  public SetMutableBinding(N: $String, V: $Any, S: $Boolean): $Boolean {
    // 1. Let envRec be the object Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let bindings be the binding object for envRec.
    const bindings = envRec.bindingObject;

    // 3. Return ? Set(bindings, N, V, S).
    return $Set(bindings, N, V, S);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-getbindingvalue-n-s
  public GetBindingValue(N: $String, S: $Boolean): $Any {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the object Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let bindings be the binding object for envRec.
    const bindings = envRec.bindingObject;

    // 3. Let value be ? HasProperty(bindings, N).
    const value = $HasProperty(bindings, N);

    // 4. If value is false, then
    if (value.isFalsey) {
      // 4. a. If S is false, return the value undefined; otherwise throw a ReferenceError exception.
      if (S.isFalsey) {
        return intrinsics.undefined;
      }

      throw new ReferenceError('4. a. If S is false, return the value undefined; otherwise throw a ReferenceError exception.');
    }

    // 5. Return ? Get(bindings, N).
    return $Get(bindings, N);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-deletebinding-n
  public DeleteBinding(N: $String): $Boolean {
    // 1. Let envRec be the object Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let bindings be the binding object for envRec.
    const bindings = envRec.bindingObject;

    // 3. Return ? bindings.[[Delete]](N).
    return bindings['[[Delete]]'](N);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-hasthisbinding
  public HasThisBinding(): $Boolean<false> {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Return false.
    return intrinsics.false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-hassuperbinding
  public HasSuperBinding(): $Boolean<false> {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Return false.
    return intrinsics.false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-withbaseobject
  public WithBaseObject(): $Object | $Undefined {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the object Environment Record for which the method was invoked.
    const envRec = this;

    // 2. If the withEnvironment flag of envRec is true, return the binding object for envRec.
    if (envRec.withEnvironment) {
      return envRec.bindingObject;
    }

    // 3. Otherwise, return undefined.
    return intrinsics.undefined;
  }
}

export type BindingStatus = 'lexical' | 'initialized' | 'uninitialized';

export class $FunctionEnvRec extends $DeclarativeEnvRec {
  public readonly '<$FunctionEnvRec>': unknown;

  public '[[ThisValue]]': $Any;
  public '[[ThisBindingStatus]]': BindingStatus;
  public '[[FunctionObject]]': $Function;
  public '[[HomeObject]]': $Object | $Undefined;
  public '[[NewTarget]]': $Object | $Undefined;

  // Everything is false because an environment record should not appear like any kind of normal ES value.
  public get isEmpty(): false { return false; }
  public get isUndefined(): false { return false; }
  public get isNull(): false { return false; }
  public get isNil(): false { return false; }
  public get isBoolean(): false { return false; }
  public get isNumber(): false { return false; }
  public get isString(): false { return false; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): false { return false; }
  public get isObject(): false { return false; }
  public get isFunction(): false { return false; }

  // http://www.ecma-international.org/ecma-262/#sec-newfunctionenvironment
  public constructor(
    realm: Realm,
    F: $Function,
    newTarget: $Object | $Undefined,
  ) {
    super(realm, F['[[Environment]]']);

    // 1. Assert: F is an ECMAScript function.
    // 2. Assert: Type(newTarget) is Undefined or Object.
    // 3. Let env be a new Lexical Environment.
    // 4. Let envRec be a new function Environment Record containing no bindings.
    const envRec = this;

    // 5. Set envRec.[[FunctionObject]] to F.
    envRec['[[FunctionObject]]'] = F;

    // 6. If F.[[ThisMode]] is lexical, set envRec.[[ThisBindingStatus]] to "lexical".
    if (F['[[ThisMode]]'] === 'lexical') {
      envRec['[[ThisBindingStatus]]'] = 'lexical';
    }
    // 7. Else, set envRec.[[ThisBindingStatus]] to "uninitialized".
    else {
      envRec['[[ThisBindingStatus]]'] = 'uninitialized';
    }

    // 8. Let home be F.[[HomeObject]].
    const home = F['[[HomeObject]]'];

    // 9. Set envRec.[[HomeObject]] to home.
    envRec['[[HomeObject]]'] = home;

    // 10. Set envRec.[[NewTarget]] to newTarget.
    envRec['[[NewTarget]]'] = newTarget;

    // 11. Set env's EnvironmentRecord to envRec.
    // 12. Set the outer lexical environment reference of env to F.[[Environment]].
    // See super(realm, F['[[Environment]]']);

    // 13. Return env.
  }

  // Overrides
  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-hasthisbinding
  public HasThisBinding(): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the function Environment Record for which the method was invoked.
    const envRec = this;

    // 2. If envRec.[[ThisBindingStatus]] is "lexical", return false; otherwise, return true.
    if (envRec['[[ThisBindingStatus]]'] === 'lexical') {
      return intrinsics.false;
    }

    return intrinsics.true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-hassuperbinding
  public HasSuperBinding(): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the function Environment Record for which the method was invoked.
    const envRec = this;

    // 2. If envRec.[[ThisBindingStatus]] is "lexical", return false.
    if (envRec['[[ThisBindingStatus]]'] === 'lexical') {
      return intrinsics.false;
    }

    // 3. If envRec.[[HomeObject]] has the value undefined, return false; otherwise, return true.
    if (envRec['[[HomeObject]]'].isUndefined) {
      return intrinsics.false;
    }

    return intrinsics.true;
  }

  // Additions
  // http://www.ecma-international.org/ecma-262/#sec-bindthisvalue
  public BindThisValue<T extends $Any>(V: T): T {
    // 1. Let envRec be the function Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Assert: envRec.[[ThisBindingStatus]] is not "lexical".
    // 3. If envRec.[[ThisBindingStatus]] is "initialized", throw a ReferenceError exception.
    if (envRec['[[ThisBindingStatus]]'] === 'initialized') {
      throw new ReferenceError('3. If envRec.[[ThisBindingStatus]] is "initialized", throw a ReferenceError exception.');
    }

    // 4. Set envRec.[[ThisValue]] to V.
    envRec['[[ThisValue]]'] = V;

    // 5. Set envRec.[[ThisBindingStatus]] to "initialized".
    envRec['[[ThisBindingStatus]]'] = 'initialized';

    // 6. Return V.
    return V;
  }

  // http://www.ecma-international.org/ecma-262/#sec-function-environment-records-getthisbinding
  public GetThisBinding(): $Any {
    // 1. Let envRec be the function Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Assert: envRec.[[ThisBindingStatus]] is not "lexical".
    // 3. If envRec.[[ThisBindingStatus]] is "uninitialized", throw a ReferenceError exception.
    if (envRec['[[ThisBindingStatus]]'] === 'uninitialized') {
      throw new ReferenceError('3. If envRec.[[ThisBindingStatus]] is "uninitialized", throw a ReferenceError exception.');
    }

    // 4. Return envRec.[[ThisValue]].
    return envRec['[[ThisValue]]'];
  }

  // http://www.ecma-international.org/ecma-262/#sec-getsuperbase
  public GetSuperBase(): $Object | $Null | $Undefined {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the function Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let home be envRec.[[HomeObject]].
    const home = envRec['[[HomeObject]]'];

    // 3. If home has the value undefined, return undefined.
    if (home.isUndefined) {
      return intrinsics.undefined;
    }

    // 4. Assert: Type(home) is Object.
    // 5. Return ? home.[[GetPrototypeOf]]().
    return home['[[GetPrototypeOf]]']();
  }
}

export class $GlobalEnvRec {
  public readonly '<$GlobalEnvRec>': unknown;

  public '[[ObjectRecord]]': $ObjectEnvRec;
  public '[[GlobalThisValue]]': $Object;
  public '[[DeclarativeRecord]]': $DeclarativeEnvRec;
  public '[[VarNames]]': string[];

  public readonly outer: $Null;

  // Everything is false because an environment record should not appear like any kind of normal ES value.
  public get isEmpty(): false { return false; }
  public get isUndefined(): false { return false; }
  public get isNull(): false { return false; }
  public get isNil(): false { return false; }
  public get isBoolean(): false { return false; }
  public get isNumber(): false { return false; }
  public get isString(): false { return false; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): false { return false; }
  public get isObject(): false { return false; }
  public get isFunction(): false { return false; }

  // http://www.ecma-international.org/ecma-262/#sec-newglobalenvironment
  public constructor(
    public readonly realm: Realm,
    G: $Object,
    thisValue: $Object,
  ) {
    this.outer = realm['[[Intrinsics]]'].null;

    // 1. Let env be a new Lexical Environment.
    // 2. Let objRec be a new object Environment Record containing G as the binding object.
    const objRec = new $ObjectEnvRec(realm, realm['[[Intrinsics]]'].null, G);

    // 3. Let dclRec be a new declarative Environment Record containing no bindings.
    const dclRec = new $DeclarativeEnvRec(realm, realm['[[Intrinsics]]'].null);

    // 4. Let globalRec be a new global Environment Record.
    const globalRec = this;

    // 5. Set globalRec.[[ObjectRecord]] to objRec.
    globalRec['[[ObjectRecord]]'] = objRec;

    // 6. Set globalRec.[[GlobalThisValue]] to thisValue.
    globalRec['[[GlobalThisValue]]'] = thisValue;

    // 7. Set globalRec.[[DeclarativeRecord]] to dclRec.
    globalRec['[[DeclarativeRecord]]'] = dclRec;

    // 8. Set globalRec.[[VarNames]] to a new empty List.
    globalRec['[[VarNames]]'] = [];

    // 9. Set env's EnvironmentRecord to globalRec.
    // 10. Set the outer lexical environment reference of env to null.
    // 11. Return env.
  }

  // Overrides
  // http://www.ecma-international.org/ecma-262/#sec-global-environment-records-hasbinding-n
  public HasBinding(N: $String): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let DclRec be envRec.[[DeclarativeRecord]].
    const dclRec = envRec['[[DeclarativeRecord]]'];

    // 3. If DclRec.HasBinding(N) is true, return true.
    if (dclRec.HasBinding(N).isTruthy) {
      return intrinsics.true;
    }

    // 4. Let ObjRec be envRec.[[ObjectRecord]].
    const objRec = envRec['[[ObjectRecord]]'];

    // 5. Return ? ObjRec.HasBinding(N).
    return objRec.HasBinding(N);
  }

  // http://www.ecma-international.org/ecma-262/#sec-global-environment-records-createmutablebinding-n-d
  public CreateMutableBinding(N: $String, D: $Boolean): $Empty {
    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let DclRec be envRec.[[DeclarativeRecord]].
    const dclRec = envRec['[[DeclarativeRecord]]'];

    // 3. If DclRec.HasBinding(N) is true, throw a TypeError exception.
    if (dclRec.HasBinding(N).isTruthy) {
      throw new TypeError('3. If DclRec.HasBinding(N) is true, throw a TypeError exception.');
    }

    // 4. Return DclRec.CreateMutableBinding(N, D).
    return dclRec.CreateMutableBinding(N, D);
  }

  // http://www.ecma-international.org/ecma-262/#sec-global-environment-records-createimmutablebinding-n-s
  public CreateImmutableBinding(N: $String, S: $Boolean): $Empty {
    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let DclRec be envRec.[[DeclarativeRecord]].
    const dclRec = envRec['[[DeclarativeRecord]]'];

    // 3. If DclRec.HasBinding(N) is true, throw a TypeError exception.
    if (dclRec.HasBinding(N).isTruthy) {
      throw new TypeError('3. If DclRec.HasBinding(N) is true, throw a TypeError exception.');
    }

    // 4. Return DclRec.CreateImmutableBinding(N, S).
    return dclRec.CreateImmutableBinding(N, S);
  }

  // http://www.ecma-international.org/ecma-262/#sec-global-environment-records-initializebinding-n-v
  public InitializeBinding(N: $String, V: $Any): $Boolean | $Empty {
    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let DclRec be envRec.[[DeclarativeRecord]].
    const dclRec = envRec['[[DeclarativeRecord]]'];

    // 3. If DclRec.HasBinding(N) is true, then
    if (dclRec.HasBinding(N).isTruthy) {
      // 3. a. Return DclRec.InitializeBinding(N, V).
      return dclRec.InitializeBinding(N, V);
    }

    // 4. Assert: If the binding exists, it must be in the object Environment Record.
    // 5. Let ObjRec be envRec.[[ObjectRecord]].
    const objRec = envRec['[[ObjectRecord]]'];

    // 6. Return ? ObjRec.InitializeBinding(N, V).
    return objRec.InitializeBinding(N, V);
  }

  // http://www.ecma-international.org/ecma-262/#sec-global-environment-records-setmutablebinding-n-v-s
  public SetMutableBinding(N: $String, V: $Any, S: $Boolean): $Boolean | $Empty {
    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let DclRec be envRec.[[DeclarativeRecord]].
    const dclRec = envRec['[[DeclarativeRecord]]'];

    // 3. If DclRec.HasBinding(N) is true, then
    if (dclRec.HasBinding(N).isTruthy) {
      // 3. a. Return DclRec.SetMutableBinding(N, V, S).
      return dclRec.SetMutableBinding(N, V, S);
    }

    // 4. Let ObjRec be envRec.[[ObjectRecord]].
    const objRec = envRec['[[ObjectRecord]]'];

    // 5. Return ? ObjRec.SetMutableBinding(N, V, S).
    return objRec.SetMutableBinding(N, V, S);
  }

  // http://www.ecma-international.org/ecma-262/#sec-global-environment-records-getbindingvalue-n-s
  public GetBindingValue(N: $String, S: $Boolean): $Any {
    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let DclRec be envRec.[[DeclarativeRecord]].
    const dclRec = envRec['[[DeclarativeRecord]]'];

    // 3. If DclRec.HasBinding(N) is true, then
    if (dclRec.HasBinding(N).isTruthy) {
      // 3. a. Return DclRec.GetBindingValue(N, S).
      return dclRec.GetBindingValue(N, S);
    }

    // 4. Let ObjRec be envRec.[[ObjectRecord]].
    const objRec = envRec['[[ObjectRecord]]'];

    // 5. Return ? ObjRec.GetBindingValue(N, S).
    return objRec.GetBindingValue(N, S);
  }

  // http://www.ecma-international.org/ecma-262/#sec-global-environment-records-deletebinding-n
  public DeleteBinding(N: $String): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let DclRec be envRec.[[DeclarativeRecord]].
    const dclRec = envRec['[[DeclarativeRecord]]'];

    // 3. If DclRec.HasBinding(N) is true, then
    if (dclRec.HasBinding(N).isTruthy) {
      // 3. a. Return DclRec.DeleteBinding(N).
      return dclRec.DeleteBinding(N);
    }

    // 4. Let ObjRec be envRec.[[ObjectRecord]].
    const objRec = envRec['[[ObjectRecord]]'];

    // 5. Let globalObject be the binding object for ObjRec.
    const globalObject = objRec.bindingObject;

    // 6. Let existingProp be ? HasOwnProperty(globalObject, N).
    const existingProp = $HasOwnProperty(globalObject, N);

    // 7. If existingProp is true, then
    if (existingProp.isTruthy) {
      // 7. a. Let status be ? ObjRec.DeleteBinding(N).
      const status = objRec.DeleteBinding(N);

      // 7. b. If status is true, then
      if (status.isTruthy) {
        // 7. b. i. Let varNames be envRec.[[VarNames]].
        const varNames = envRec['[[VarNames]]'];

        // 7. b. ii. If N is an element of varNames, remove that element from the varNames.
        const idx = varNames.indexOf(N.value);
        if (idx >= 0) {
          varNames.splice(idx, 1);
        }
      }

      // 7. c. Return status.
      return status;
    }

    // 8. Return true.
    return intrinsics.true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-global-environment-records-hasthisbinding
  public HasThisBinding(): $Boolean<true> {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Return true.
    return intrinsics.true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-global-environment-records-hassuperbinding
  public HasSuperBinding(): $Boolean<false> {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Return false.
    return intrinsics.false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-global-environment-records-withbaseobject
  public WithBaseObject(): $Undefined {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Return undefined.
    return intrinsics.undefined;
  }

  // Additions
  // http://www.ecma-international.org/ecma-262/#sec-global-environment-records-getthisbinding
  public GetThisBinding(): $Object {
    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Return envRec.[[GlobalThisValue]].
    return envRec['[[GlobalThisValue]]'];
  }

  // http://www.ecma-international.org/ecma-262/#sec-hasvardeclaration
  public HasVarDeclaration(N: $String): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let varDeclaredNames be envRec.[[VarNames]].
    const varDeclaredNames = envRec['[[VarNames]]'];

    // 3. If varDeclaredNames contains N, return true.
    if (varDeclaredNames.includes(N.value)) {
      return intrinsics.true;
    }

    // 4. Return false.
    return intrinsics.false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-haslexicaldeclaration
  public HasLexicalDeclaration(N: $String): $Boolean {
    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let DclRec be envRec.[[DeclarativeRecord]].
    const dclRec = envRec['[[DeclarativeRecord]]'];

    // 3. Return DclRec.HasBinding(N).
    return dclRec.HasBinding(N);
  }

  // http://www.ecma-international.org/ecma-262/#sec-hasrestrictedglobalproperty
  public HasRestrictedGlobalProperty(N: $String): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let ObjRec be envRec.[[ObjectRecord]].
    const objRec = envRec['[[ObjectRecord]]'];

    // 3. Let globalObject be the binding object for ObjRec.
    const globalObject = objRec.bindingObject;

    // 4. Let existingProp be ? globalObject.[[GetOwnProperty]](N).
    const existingProp = globalObject['[[GetOwnProperty]]'](N);

    // 5. If existingProp is undefined, return false.
    if (existingProp.isUndefined) {
      return intrinsics.false;
    }

    // 6. If existingProp.[[Configurable]] is true, return false.
    if (existingProp['[[Configurable]]'].isTruthy) {
      return intrinsics.false;
    }

    // 7. Return true.
    return intrinsics.true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-candeclareglobalvar
  public CanDeclareGlobalVar(N: $String): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let ObjRec be envRec.[[ObjectRecord]].
    const objRec = envRec['[[ObjectRecord]]'];

    // 3. Let globalObject be the binding object for ObjRec.
    const globalObject = objRec.bindingObject;

    // 4. Let hasProperty be ? HasOwnProperty(globalObject, N).
    const hasProperty = $HasOwnProperty(globalObject, N);

    // 5. If hasProperty is true, return true.
    if (hasProperty.isTruthy) {
      return intrinsics.true;
    }

    // 6. Return ? IsExtensible(globalObject).
    return globalObject['[[IsExtensible]]']();
  }

  // http://www.ecma-international.org/ecma-262/#sec-candeclareglobalfunction
  public CanDeclareGlobalFunction(N: $String): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let ObjRec be envRec.[[ObjectRecord]].
    const objRec = envRec['[[ObjectRecord]]'];

    // 3. Let globalObject be the binding object for ObjRec.
    const globalObject = objRec.bindingObject;

    // 4. Let existingProp be ? globalObject.[[GetOwnProperty]](N).
    const existingProp = globalObject['[[GetOwnProperty]]'](N);

    // 5. If existingProp is undefined, return ? IsExtensible(globalObject).
    if (existingProp.isUndefined) {
      return globalObject['[[IsExtensible]]']();
    }

    // 6. If existingProp.[[Configurable]] is true, return true.
    if (existingProp['[[Configurable]]'].isTruthy) {
      return intrinsics.true;
    }

    // 7. If IsDataDescriptor(existingProp) is true and existingProp has attribute values { [[Writable]]: true, [[Enumerable]]: true }, return true.
    if (existingProp.isDataDescriptor && existingProp['[[Writable]]'].isTruthy && existingProp['[[Enumerable]]'].isTruthy) {
      return intrinsics.true;
    }

    // 8. Return false.
    return intrinsics.false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-createglobalvarbinding
  public CreateGlobalVarBinding(N: $String, D: $Boolean): $Empty {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let ObjRec be envRec.[[ObjectRecord]].
    const objRec = envRec['[[ObjectRecord]]'];

    // 3. Let globalObject be the binding object for ObjRec.
    const globalObject = objRec.bindingObject;

    // 4. Let hasProperty be ? HasOwnProperty(globalObject, N).
    const hasProperty = $HasOwnProperty(globalObject, N);

    // 5. Let extensible be ? IsExtensible(globalObject).
    const extensible = globalObject['[[IsExtensible]]']();

    // 6. If hasProperty is false and extensible is true, then
    if (hasProperty.isFalsey && extensible.isTruthy) {
      // 6. a. Perform ? ObjRec.CreateMutableBinding(N, D).
      objRec.CreateMutableBinding(N, D);

      // 6. b. Perform ? ObjRec.InitializeBinding(N, undefined).
      objRec.InitializeBinding(N, intrinsics.undefined);
    }

    // 7. Let varDeclaredNames be envRec.[[VarNames]].
    const varDeclaredNames = envRec['[[VarNames]]'];

    // 8. If varDeclaredNames does not contain N, then
    if (!varDeclaredNames.includes(N.value)) {
      // 8. a. Append N to varDeclaredNames.
      varDeclaredNames.push(N.value);
    }

    // 9. Return NormalCompletion(empty).
    return intrinsics.empty;
  }

  // http://www.ecma-international.org/ecma-262/#sec-createglobalfunctionbinding
  public CreateGlobalFunctionBinding(N: $String, V: $Any, D: $Boolean): $Empty {
    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Let envRec be the global Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let ObjRec be envRec.[[ObjectRecord]].
    const objRec = envRec['[[ObjectRecord]]'];

    // 3. Let globalObject be the binding object for ObjRec.
    const globalObject = objRec.bindingObject;

    // 4. Let existingProp be ? globalObject.[[GetOwnProperty]](N).
    const existingProp = globalObject['[[GetOwnProperty]]'](N);

    let desc: $PropertyDescriptor;
    // 5. If existingProp is undefined or existingProp.[[Configurable]] is true, then
    if (existingProp.isUndefined || existingProp['[[Configurable]]'].isTruthy) {
      // 5. a. Let desc be the PropertyDescriptor { [[Value]]: V, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: D }.
      desc = new $PropertyDescriptor(realm, N);
      desc['[[Enumerable]]'] = intrinsics.true;
      desc['[[Configurable]]'] = D;

      desc['[[Value]]'] = V;
      desc['[[Writable]]'] = intrinsics.true;
    }
    // 6. Else,
    else {
      // 6. a. Let desc be the PropertyDescriptor { [[Value]]: V }.
      desc = new $PropertyDescriptor(realm, N);

      desc['[[Value]]'] = V;
    }

    // 7. Perform ? DefinePropertyOrThrow(globalObject, N, desc).
    $DefinePropertyOrThrow(globalObject, N, desc);

    // 8. Record that the binding for N in ObjRec has been initialized.
    // TODO: record

    // 9. Perform ? Set(globalObject, N, V, false).
    $Set(globalObject, N, V, intrinsics.false);

    // 10. Let varDeclaredNames be envRec.[[VarNames]].
    const varDeclaredNames = envRec['[[VarNames]]'];

    // 11. If varDeclaredNames does not contain N, then
    if (!varDeclaredNames.includes(N.value)) {
      // 11. a. Append N to varDeclaredNames.
      varDeclaredNames.push(N.value);
    }

    // 12. Return NormalCompletion(empty).
    return intrinsics.empty;
  }
}

export class $ModuleEnvRec extends $DeclarativeEnvRec {
  public readonly '<$ModuleEnvRec>': unknown;

  // Everything is false because an environment record should not appear like any kind of normal ES value.
  public get isEmpty(): false { return false; }
  public get isUndefined(): false { return false; }
  public get isNull(): false { return false; }
  public get isNil(): false { return false; }
  public get isBoolean(): false { return false; }
  public get isNumber(): false { return false; }
  public get isString(): false { return false; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): false { return false; }
  public get isObject(): false { return false; }
  public get isFunction(): false { return false; }

  // http://www.ecma-international.org/ecma-262/#sec-newmoduleenvironment
  public constructor(
    realm: Realm,
    outer: $EnvRec,
  ) {
    super(realm, outer);
    // 1. Let env be a new Lexical Environment.
    // 2. Let envRec be a new module Environment Record containing no bindings.
    // 3. Set env's EnvironmentRecord to envRec.
    // 4. Set the outer lexical environment reference of env to E.
    // 5. Return env.
  }

  // Overrides
  // http://www.ecma-international.org/ecma-262/#sec-module-environment-records-getbindingvalue-n-s
  public GetBindingValue(N: $String, S: $Boolean): $Any {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Assert: S is true.
    // 2. Let envRec be the module Environment Record for which the method was invoked.
    const envRec = this;

    // 3. Assert: envRec has a binding for N.
    const binding = envRec.bindings.get(N.value)!;

    // 4. If the binding for N is an indirect binding, then
    if (binding.isIndirect) {
      // 4. a. Let M and N2 be the indirection values provided when this binding for N was created.
      const M = binding.M!;
      const N2 = binding.N2!;

      // 4. b. Let targetEnv be M.[[Environment]].
      const targetER = M['[[Environment]]'];

      // 4. c. If targetEnv is undefined, throw a ReferenceError exception.
      if (targetER.isUndefined) {
        throw new ReferenceError('4. c. If targetEnv is undefined, throw a ReferenceError exception.');
      }

      // 4. d. Let targetER be targetEnv's EnvironmentRecord.
      // 4. e. Return ? targetER.GetBindingValue(N2, true).
      return targetER.GetBindingValue(N2, intrinsics.true);
    }

    // 5. If the binding for N in envRec is an uninitialized binding, throw a ReferenceError exception.
    if (!binding.isInitialized) {
      throw new ReferenceError('5. If the binding for N in envRec is an uninitialized binding, throw a ReferenceError exception.');
    }

    // 6. Return the value currently bound to N in envRec.
    return binding.value;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-environment-records-deletebinding-n
  public DeleteBinding(N: never): never {
    // 1. Assert: This method is never invoked. See 12.5.3.1.
    throw new Error('1. Assert: This method is never invoked. See 12.5.3.1.');
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-environment-records-hasthisbinding
  public HasThisBinding(): $Boolean<true> {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Return true.
    return intrinsics.true;
  }

  // Additions
  // http://www.ecma-international.org/ecma-262/#sec-module-environment-records-getthisbinding
  public GetThisBinding(): $Undefined {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Return undefined.
    return intrinsics.undefined;
  }

  // http://www.ecma-international.org/ecma-262/#sec-createimportbinding
  public CreateImportBinding(N: $String, M: IModule, N2: $String): $Empty {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Let envRec be the module Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Assert: envRec does not already have a binding for N.
    // 3. Assert: M is a Module Record.
    // 4. Assert: When M.[[Environment]] is instantiated it will have a direct binding for N2.

    // 5. Create an immutable indirect binding in envRec for N that references M and N2 as its target binding and record that the binding is initialized.
    const binding = new $Binding(
      /* isMutable */false,
      /* isStrict */true,
      /* isInitialized */true,
      /* canBeDeleted */false,
      /* value */intrinsics.empty,
      /* name */N.value,
      /* origin */this,
      /* M */M,
      /* N2 */N2,
    );
    envRec.bindings.set(N.value, binding);

    // 6. Return NormalCompletion(empty).
    return intrinsics.empty;
  }
}
