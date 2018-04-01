import {
  IObjectContext,
  IObjectBuilder,
  IObjectBuilderNode,
  IRequestSpecification,
  IObjectCommand
} from './interfaces';

export const NoObject = Symbol.for('NoObject');

export class OmitObject {
  public request: any;
  constructor(request?: any) {
    this.request = request;
  }
}

/**
 * The ObjectContext is a resolution scope for a specific graph of builders.
 */
export class ObjectContext implements IObjectContext {
  public builder: IObjectBuilder;

  constructor(builder: IObjectBuilder) {
    this.builder = builder;
  }

  public resolve(request: any): any {
    return this.builder.create(request, this);
  }
}

/**
 * Decorates an IObjectBuilderNode and filters requests so that only certain requests are
 * passed through to the decorated builder
 */
export class FilteringObjectBuilderNode extends Array<IObjectBuilder> implements IObjectBuilderNode {
  public readonly builder: IObjectBuilder;
  public readonly specification: IRequestSpecification;

  constructor(builder: IObjectBuilder, specification: IRequestSpecification) {
    super(builder);
    this.builder = builder;
    this.specification = specification;
    Object.setPrototypeOf(this, Object.create(FilteringObjectBuilderNode.prototype));
  }

  public create(request: any, context: IObjectContext): any {
    if (!this.specification.isSatisfiedBy(request)) {
      return NoObject;
    }

    return this.builder.create(request, context);
  }
}

/**
 * Decorates a list of IObjectBuilderNodes and returns the first result that is not a NoObject
 */
export class CompositeObjectBuilderNode extends Array<IObjectBuilder> implements IObjectBuilderNode {
  constructor(...builders: IObjectBuilder[]) {
    super(...builders);
    Object.setPrototypeOf(this, Object.create(CompositeObjectBuilderNode.prototype));
  }
  public create(request: any, context: IObjectContext): any {
    for (const builder of this) {
      const result = builder.create(request, context);
      if (result !== NoObject) {
        return result;
      }
    }

    return NoObject;
  }
}

/**
 * Decorates an IObjectBuilder and filters requests so that only certain requests are passed through to
 * the decorated builder. Then invokes the provided IObjectCommand on the result returned from that builder.
 */
export class Postprocessor extends Array<IObjectBuilder> implements IObjectBuilderNode {
  public builder: IObjectBuilder;
  public command: IObjectCommand;
  public specification?: IRequestSpecification;

  constructor(builder: IObjectBuilder, command: IObjectCommand, specification?: IRequestSpecification) {
    super(builder);
    this.builder = builder;
    this.command = command;
    this.specification = specification;
    Object.setPrototypeOf(this, Object.create(Postprocessor.prototype));
  }

  public create(request: any, context: IObjectContext): any {
    const result = this.builder.create(request, context);
    if (result === NoObject) {
      return result;
    }

    if (this.specification && !this.specification.isSatisfiedBy(result)) {
      return result;
    }

    return this.command.execute(result, context);
  }
}

/**
 * Guards against NoOutput by always throwing an error
 *
 * This is meant to be the last builder in a chain
 */
export class TerminatingBuilder implements IObjectBuilder {
  public create(request: any, context: IObjectContext): any {
    throw new Error(`Unable to resolve request: ${stringify(request)}`);
  }
}

function stringify(value: any): string {
  const cache: any[] = [];
  function replacer(key: string, value: any): any {
    if (typeof value === 'object') {
      if (cache.indexOf(value) > -1) {
        return '<circular>';
      }
      cache.push(value);
    }
    return value;
  }
  return JSON.stringify(value, replacer);
}

export class AndSpecification implements IRequestSpecification {
  public readonly specifications: IRequestSpecification[];
  constructor(...specifications: IRequestSpecification[]) {
    this.specifications = specifications;
  }

  public isSatisfiedBy(request: any): boolean {
    return this.specifications.every(s => s.isSatisfiedBy(request));
  }
}

export class OrSpecification implements IRequestSpecification {
  public readonly specifications: IRequestSpecification[];
  constructor(...specifications: IRequestSpecification[]) {
    this.specifications = specifications;
  }

  public isSatisfiedBy(request: any): boolean {
    return this.specifications.some(s => s.isSatisfiedBy(request));
  }
}

export class NotSpecification implements IRequestSpecification {
  public readonly specification: IRequestSpecification;
  constructor(specification: IRequestSpecification) {
    this.specification = specification;
  }

  public isSatisfiedBy(request: any): boolean {
    return !this.specification.isSatisfiedBy(request);
  }
}

export class SomeSpecification implements IRequestSpecification {
  public readonly specification: IRequestSpecification;
  constructor(specification: IRequestSpecification) {
    this.specification = specification;
  }

  public isSatisfiedBy(request: any[]): boolean {
    if (!(request && Array.isArray(request))) {
      return false;
    }
    return request.some(i => this.specification.isSatisfiedBy(i));
  }
}
