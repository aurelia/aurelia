/* eslint-disable */
import { $Any, $Object, $String, $Boolean, $Undefined, $Function, $Null } from './value';
import { IModule, Host } from './host';
import { $HasProperty, $Get, $DefinePropertyOrThrow, $Set } from './operations';
import { $PropertyDescriptor } from './property-descriptor';

export type $EnvRec = (
  $DeclarativeEnvRec |
  $ObjectEnvRec
);

export class $Binding {
  public readonly '<$Binding>': unknown;

  public constructor(
    public isMutable: boolean,
    public isStrict: boolean,
    public isInitialized: boolean,
    public canBeDeleted: boolean,
    public value: $Any,
    public name: string,
    public origin: $EnvRec,
    public M: IModule | null = null,
    public N2: string | null = null,
  ) {}
}

// http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records
export class $DeclarativeEnvRec {
  public readonly '<$DeclarativeEnvRec>': unknown;

  public readonly bindings: Map<string, $Binding> = new Map();

  public constructor(
    public readonly host: Host,
    public readonly outer: $EnvRec | null,
  ) {}

  // Overrides
  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-hasbinding-n
  public HasBinding(N: string): boolean {
    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    const envRec = this;

    // 2. If envRec has a binding for the name that is the value of N, return true.
    // 3. Return false.
    return envRec.bindings.has(N);
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-createmutablebinding-n-d
  public CreateMutableBinding(N: string, D: boolean): void {
    const intrinsics = this.host.realm['[[Intrinsics]]'];

    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Assert: envRec does not already have a binding for N.
    // 3. Create a mutable binding in envRec for N and record that it is uninitialized. If D is true, record that the newly created binding may be deleted by a subsequent DeleteBinding call.
    const binding = new $Binding(
      /* isMutable */true,
      /* isStrict */false,
      /* isInitialized */false,
      /* canBeDeleted */D,
      /* value */intrinsics.empty,
      /* name */N,
      /* origin */this,
    );
    envRec.bindings.set(N, binding);

    // 4. Return NormalCompletion(empty).
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-createimmutablebinding-n-s
  public CreateImmutableBinding(N: string, S: boolean): void {
    const intrinsics = this.host.realm['[[Intrinsics]]'];

    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Assert: envRec does not already have a binding for N.
    // 3. Create an immutable binding in envRec for N and record that it is uninitialized. If S is true, record that the newly created binding is a strict binding.
    const binding = new $Binding(
      /* isMutable */false,
      /* isStrict */S,
      /* isInitialized */false,
      /* canBeDeleted */false,
      /* value */intrinsics.empty,
      /* name */N,
      /* origin */this,
    );
    envRec.bindings.set(N, binding);

    // 4. Return NormalCompletion(empty).
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-initializebinding-n-v
  public InitializeBinding(N: string, V: $Any): void {
    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Assert: envRec must have an uninitialized binding for N.
    const binding = envRec.bindings.get(N)!;

    // 3. Set the bound value for N in envRec to V.
    binding.value = V;

    // 4. Record that the binding for N in envRec has been initialized.
    binding.isInitialized = true;

    // 5. Return NormalCompletion(empty).
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-setmutablebinding-n-v-s
  public SetMutableBinding(N: string, V: $Any, S: boolean): void {
    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    const envRec = this;

    // 2. If envRec does not have a binding for N, then
    const bindings = this.bindings;
    const binding = bindings.get(N);
    if (binding === void 0) {
      // 2. a. If S is true, throw a ReferenceError exception.
      if (S) {
        throw new ReferenceError('2. a. If S is true, throw a ReferenceError exception.');
      }

      // 2. b. Perform envRec.CreateMutableBinding(N, true).
      envRec.CreateMutableBinding(N, true);

      // 2. c. Perform envRec.InitializeBinding(N, V).
      envRec.InitializeBinding(N, V);

      // 2. d. Return NormalCompletion(empty).
      return;
    }

    // 3. If the binding for N in envRec is a strict binding, set S to true.
    if (binding.isStrict) {
      S = true;
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
      if (S) {
        throw new TypeError('6. b. If S is true, throw a TypeError exception.');
      }
    }
    // 7. Return NormalCompletion(empty).
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-getbindingvalue-n-s
  public GetBindingValue(N: string, S: boolean): $Any {
    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Assert: envRec has a binding for N.
    const binding = envRec.bindings.get(N)!;

    // 3. If the binding for N in envRec is an uninitialized binding, throw a ReferenceError exception.
    if (!binding.isInitialized) {
      throw new ReferenceError('3. If the binding for N in envRec is an uninitialized binding, throw a ReferenceError exception.');
    }

    // 4. Return the value currently bound to N in envRec.
    return binding.value;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-deletebinding-n
  public DeleteBinding(N: string): boolean {
    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    const envRec = this;
    const bindings = envRec.bindings;

    // 2. Assert: envRec has a binding for the name that is the value of N.
    const binding = bindings.get(N)!;

    // 3. If the binding for N in envRec cannot be deleted, return false.
    if (!binding.canBeDeleted) {
      return false;
    }

    // 4. Remove the binding for N from envRec.
    bindings.delete(N);

    // 5. Return true.
    return true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-hasthisbinding
  public HasThisBinding(): boolean {
    // 1. Return false.
    return false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-hassuperbinding
  public HasSuperBinding(): boolean {
    // 1. Return false.
    return false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-withbaseobject
  public WithBaseObject(): undefined {
    // 1. Return undefined.
    return void 0;
  }
}

export class $ObjectEnvRec {
  public readonly '<$ObjectEnvRec>': unknown;

  public withEnvironment: boolean = false;

  public constructor(
    public readonly host: Host,
    public readonly outer: $EnvRec | null,
    public readonly bindingObject: $Object,
  ) {}

  // Overrides
  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-hasbinding-n
  public HasBinding(N: string): boolean {
    const host = this.host;
    const intrinsics = host.realm['[[Intrinsics]]'];

    // 1. Let envRec be the object Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let bindings be the binding object for envRec.
    const bindings = envRec.bindingObject;

    // 3. Let foundBinding be ? HasProperty(bindings, N).
    const foundBinding = $HasProperty(bindings, new $String(host, N));

    // 4. If foundBinding is false, return false.
    if (foundBinding.value === false) {
      return false;
    }

    // 5. If the withEnvironment flag of envRec is false, return true.
    if (!envRec.withEnvironment) {
      return true;
    }

    // 6. Let unscopables be ? Get(bindings, @@unscopables).
    const unscopables = $Get(bindings, intrinsics['@@unscopables']);

    // 7. If Type(unscopables) is Object, then
    if (unscopables.isObject) {
      // 7. a. Let blocked be ToBoolean(? Get(unscopables, N)).
      const blocked = $Get(unscopables, new $String(host, N)).isTruthy;

      // 7. b. If blocked is true, return false.
      if (blocked) {
        return false;
      }
    }

    // 8. Return true.
    return true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-createmutablebinding-n-d
  public CreateMutableBinding(N: string, D: boolean): $Boolean {
    const host = this.host;
    const intrinsics = host.realm['[[Intrinsics]]'];

    // 1. Let envRec be the object Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let bindings be the binding object for envRec.
    const bindings = envRec.bindingObject;

    // 3. Return ? DefinePropertyOrThrow(bindings, N, PropertyDescriptor { [[Value]]: undefined, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: D }).
    const $N = new $String(host, N);
    const Desc = new $PropertyDescriptor(host, $N);
    Desc['[[Value]]'] = intrinsics.undefined;
    Desc['[[Writable]]'] = intrinsics.true;
    Desc['[[Enumerable]]'] = intrinsics.true;
    Desc['[[Configurable]]'] = new $Boolean(host, D);
    return $DefinePropertyOrThrow(bindings, $N, Desc);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-createimmutablebinding-n-s
  public CreateImmutableBinding(N: string, S: boolean): $Boolean {
    // The concrete Environment Record method CreateImmutableBinding is never used within this specification in association with object Environment Records.
    throw new Error('Should not be called');
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-initializebinding-n-v
  public InitializeBinding(N: string, V: $Any): $Boolean {
    // 1. Let envRec be the object Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Assert: envRec must have an uninitialized binding for N.
    // 3. Record that the binding for N in envRec has been initialized.
    // 4. Return ? envRec.SetMutableBinding(N, V, false).
    return envRec.SetMutableBinding(N, V, false);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-setmutablebinding-n-v-s
  public SetMutableBinding(N: string, V: $Any, S: boolean): $Boolean {
    const host = this.host;

    // 1. Let envRec be the object Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let bindings be the binding object for envRec.
    const bindings = envRec.bindingObject;

    // 3. Return ? Set(bindings, N, V, S).
    return $Set(bindings, new $String(host, N), V, S);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-getbindingvalue-n-s
  public GetBindingValue(N: string, S: boolean): $Any {
    const host = this.host;
    const intrinsics = host.realm['[[Intrinsics]]'];

    // 1. Let envRec be the object Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let bindings be the binding object for envRec.
    const bindings = envRec.bindingObject;

    const $N = new $String(host, N);

    // 3. Let value be ? HasProperty(bindings, N).
    const value = $HasProperty(bindings, $N);

    // 4. If value is false, then
    if (value.isFalsey) {
      // 4. a. If S is false, return the value undefined; otherwise throw a ReferenceError exception.
      if (!S) {
        return intrinsics.undefined;
      }

      throw new ReferenceError('4. a. If S is false, return the value undefined; otherwise throw a ReferenceError exception.');
    }

    // 5. Return ? Get(bindings, N).
    return $Get(bindings, $N);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-deletebinding-n
  public DeleteBinding(N: string): $Boolean {
    const host = this.host;

    // 1. Let envRec be the object Environment Record for which the method was invoked.
    const envRec = this;

    // 2. Let bindings be the binding object for envRec.
    const bindings = envRec.bindingObject;

    const $N = new $String(host, N);

    // 3. Return ? bindings.[[Delete]](N).
    return bindings['[[Delete]]']($N);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-hasthisbinding
  public HasThisBinding(): false {
    // 1. Return false.
    return false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-hassuperbinding
  public HasSuperBinding(): false {
    // 1. Return false.
    return false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-environment-records-withbaseobject
  public WithBaseObject(): $Object | $Undefined {
    const intrinsics = this.host.realm['[[Intrinsics]]'];

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

  public constructor(
    host: Host,
    outer: $EnvRec,
    ThisBindingStatus: BindingStatus,
    FunctionObject: $Function,
    HomeObject: $Object | $Undefined,
    NewTarget: $Object | $Undefined,
  ) {
    super(host, outer);

    this['[[ThisBindingStatus]]'] = ThisBindingStatus;
    this['[[FunctionObject]]'] = FunctionObject;
    this['[[HomeObject]]'] = HomeObject;
    this['[[NewTarget]]'] = NewTarget;
  }

  // Overrides
  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-hasthisbinding
  public HasThisBinding(): boolean {
    // 1. Let envRec be the function Environment Record for which the method was invoked.
    const envRec = this;

    // 2. If envRec.[[ThisBindingStatus]] is "lexical", return false; otherwise, return true.
    if (envRec['[[ThisBindingStatus]]'] === 'lexical') {
      return false;
    }
    return true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-hassuperbinding
  public HasSuperBinding(): boolean {
    // 1. Let envRec be the function Environment Record for which the method was invoked.
    const envRec = this;

    // 2. If envRec.[[ThisBindingStatus]] is "lexical", return false.
    if (envRec['[[ThisBindingStatus]]'] === 'lexical') {
      return false;
    }

    // 3. If envRec.[[HomeObject]] has the value undefined, return false; otherwise, return true.
    if (envRec['[[HomeObject]]'].isUndefined) {
      return false;
    }
    return true;
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
    const intrinsics = this.host.realm['[[Intrinsics]]'];

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
