/**
 * Builds, or helps with building, a certain object
 */
export interface IObjectBuilder {
  /**
   * Creates a new (part of an) object based on a request
   * @param request The request that describes the object to be created
   * @param context A context that can be used to create other objects
   */
  create(request: any, context: IObjectContext): any;
}

/**
 * An intermediate node in a graph of IObjectBuilder instances
 * 
 * Its responsibility is to compose multiple builders in a certain fashion,
 * and expose their cumulative behavior as a single builder
 */
export interface IObjectBuilderNode extends IObjectBuilder, Array<IObjectBuilder> {}

/**
 * A context which recursively builds a requested object based on arbitrary input
 */
export interface IObjectContext {
  /**
   * Creates (a piece of) an object based on some input
   * @param request An object specifying the requested object, along with any input information it should be based on
   */
  resolve(request: any): any;
}

/**
 * A specification that encapsulates evaluation logic for a given request
 */
export interface IRequestSpecification {
  /**
   * Evaluates whether the provided value meets the criteria defined in this specification
   * @param value The value to evaluate
   */
  isSatisfiedBy(request: any): boolean;
}

/**
 * A function object which encapsulates logic to modify an existing object
 */
export interface IObjectCommand {
  /**
   * Performs an operation on the provided object
   * @param obj An existing object to perform the operation on
   * @param context A context that can be used to create other objects
   */
  execute(obj: any, context: IObjectContext): any;
}

/**
 * Defines a strategy for selecting parent, sibling or child objects from another object
 */
export interface IObjectQuery {
  /**
   * Select associated objects for the supplied object
   * @param obj The object to select associated objects from
   */
  select(obj: any): any[];
}
