import { $Any } from './value';
import { IModule, Host } from './host';

export type $EnvRec = (
  $DeclarativeEnvRec
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
  public HasThisBinding(): false {
    // 1. Return false.
    return false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-hassuperbinding
  public HasSuperBinding(): false {
    // 1. Return false.
    return false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-declarative-environment-records-withbaseobject
  public WithBaseObject(): undefined {
    // 1. Return undefined.
    return void 0;
  }
}
