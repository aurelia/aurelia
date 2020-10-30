export class HooksDefinition {
  public static readonly none: Readonly<HooksDefinition> = new HooksDefinition({});

  public readonly hasDefine: boolean;

  public readonly hasHydrating: boolean;
  public readonly hasHydrated: boolean;
  public readonly hasCreated: boolean;

  public readonly hasBinding: boolean;
  public readonly hasBound: boolean;
  public readonly hasAttaching: boolean;
  public readonly hasAttached: boolean;

  public readonly hasDetaching: boolean;
  public readonly hasUnbinding: boolean;

  public readonly hasDispose: boolean;
  public readonly hasAccept: boolean;

  public constructor(target: object) {
    this.hasDefine = 'define' in target;

    this.hasHydrating = 'hydrating' in target;
    this.hasHydrated = 'hydrated' in target;
    this.hasCreated = 'created' in target;

    this.hasBinding = 'binding' in target;
    this.hasBound = 'bound' in target;
    this.hasAttaching = 'attaching' in target;
    this.hasAttached = 'attached' in target;

    this.hasDetaching = 'detaching' in target;
    this.hasUnbinding = 'unbinding' in target;

    this.hasDispose = 'dispose' in target;
    this.hasAccept = 'accept' in target;
  }
}
