import { Constructable, Metadata } from '@aurelia/kernel';

export type PartialFactDefinition = {
  readonly displayName?: string;
  readonly skip?: string;
  readonly timeout?: number;
};

export function fact(def?: PartialFactDefinition): MethodDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (target: Object, key: string | symbol, descriptor: PropertyDescriptor): void {
    const Type = target.constructor as Constructable;
    Fact.define(key, def === void 0 ? {} : def, Type);
  };
}

export const TestClass = {
  name: 'au:test:class',
  define(Type: Constructable): TestClassDefinition {
    const definition = TestClassDefinition.create(Type);
    Metadata.define(TestClass.name, definition, Type);
    return definition;
  },
  get(Type: Constructable): TestClassDefinition {
    let def = Metadata.getOwn(TestClass.name, Type);
    if (def === void 0) {
      def = TestClass.define(Type);
    }
    return def;
  },
};

export class TestClassDefinition {
  public constructor(
    public readonly Type: Constructable,
    public readonly facts: FactDefinition[] = [],
  ) {}

  public static create(
    Type: Constructable,
  ): TestClassDefinition {
    return new TestClassDefinition(
      Type,
    );
  }
}

export const Fact = {
  define(methodName: string | symbol, def: PartialFactDefinition, Type: Constructable): void {
    const definition = FactDefinition.create(methodName, def);
    const testClass = TestClass.get(Type);
    testClass.facts.push(definition);
  },
};

export class FactDefinition {
  public constructor(
    public readonly methodName: string | symbol,
    public readonly displayName: string | null,
    public readonly skip: string | null,
    public readonly timeout: number | null,
  ) {}

  public static create(
    methodName: string | symbol,
    def: PartialFactDefinition,
  ): FactDefinition {
    return new FactDefinition(
      methodName,
      def.displayName === void 0 ? null : def.displayName,
      def.skip === void 0 ? null : def.skip,
      def.timeout === void 0 ? null : def.timeout,
    );
  }
}
