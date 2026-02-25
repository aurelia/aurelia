/**
 * Returns a decorator function that can be used to validate the parameters of a given method.
 *
 * @param {ParameterConstraints} constraints - An object containing the parameter constraints.
 * @returns {Function} - The decorator function.
 */
export function validate(constraints: ParameterConstraints) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      for (let i = 0; i < args.length; i++) {
        const argValue = args[i];
        const argName = Object.keys(constraints)[i];
        const argConstraints = constraints[argName];

        if (argConstraints.required && argValue === undefined) {
          throw new Error(`${argName} is required`);
        }

        if (typeof argValue !== argConstraints.type) {
          throw new Error(`${argName} must be of type ${argConstraints.type}`);
        }
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Defines the structure of an object containing parameter constraints.
 *
 * @interface
 */
export interface ParameterConstraints {
  [parameterName: string]: {
    /** Specifies whether the parameter is required. */
    required: boolean;
    /** Specifies the expected type of the parameter. */
    type: 'string' | 'number' | 'boolean' | 'object' | 'function';
  };
}
