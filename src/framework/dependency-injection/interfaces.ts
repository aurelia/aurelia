import { InvocationHandler } from './invocation-handler';
import { Container } from './container';

/**
 * A strategy for invoking a function, resulting in an object instance.
 */
export interface IInvoker {
  /**
   * Invokes the function with the provided dependencies.
   * @param fn The constructor or factory function.
   * @param dependencies The dependencies of the function call.
   * @return The result of the function invocation.
   */
  invoke(container: Container, fn: Function, dependencies: any[]): any;

  /**
   * Invokes the function with the provided dependencies.
   * @param fn The constructor or factory function.
   * @param staticDependencies The static dependencies of the function.
   * @param dynamicDependencies Additional dependencies to use during invocation.
   * @return The result of the function invocation.
   */
  invokeWithDynamicDependencies(
    container: Container,
    fn: Function,
    staticDependencies: any[],
    dynamicDependencies: any[]
  ): any;
}

/**
 * Used to allow functions/classes to specify custom dependency resolution logic.
 */
export interface IResolver {
  /**
   * Called by the container to allow custom resolution of dependencies for a function/class.
   * @param container The container to resolve from.
   * @param key The key that the resolver was registered as.
   * @return Returns the resolved object.
   */
  get(container: Container, key: any): any;
}

/**
 * Used to configure a Container instance.
 */
export interface IContainerConfiguration {
  /**
   * An optional callback which will be called when any function needs an InvocationHandler created (called once per Function).
   */
  onHandlerCreated?: (handler: InvocationHandler) => InvocationHandler;

  handlers?: Map<any, any>;
}
