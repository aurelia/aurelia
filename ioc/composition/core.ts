import { IObjectContext, IObjectBuilder, IObjectBuilderNode, IRequestSpecification, IObjectCommand } from "./interfaces";

export const NoObject = Symbol.for("NoObject");

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
    throw new Error(`Unable to resolve request: ${request}`);
  }
}
