import { IInvoker, IInvocationHandler, IContainer } from './interfaces';

/**
 * Stores the information needed to invoke a function.
 */
export class InvocationHandler implements IInvocationHandler {
  /**
   * The function to be invoked by this handler.
   */
  fn: Function;

  /**
   * The invoker implementation that will be used to actually invoke the function.
   */
  invoker: IInvoker;

  /**
   * The statically known dependencies of this function invocation.
   */
  dependencies: any[];

  /**
   * Instantiates an InvocationDescription.
   * @param fn The Function described by this description object.
   * @param invoker The strategy for invoking the function.
   * @param dependencies The static dependencies of the function call.
   */
  constructor(fn: Function, invoker: IInvoker, dependencies: any[]) {
    this.fn = fn;
    this.invoker = invoker;
    this.dependencies = dependencies;
  }

  /**
   * Invokes the function.
   * @param container The calling container.
   * @param dynamicDependencies Additional dependencies to use during invocation.
   * @return The result of the function invocation.
   */
  invoke(container: IContainer, dynamicDependencies?: any[]): any {
    return dynamicDependencies !== undefined
      ? this.invoker.invokeWithDynamicDependencies(container, this.fn, this.dependencies, dynamicDependencies)
      : this.invoker.invoke(container, this.fn, this.dependencies);
  }
}
