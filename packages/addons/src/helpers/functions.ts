/**
 * Stops immediate propagation of an event and prevents its default behavior.
 * @param {Event} e - The event to stop propagation and prevent default behavior for.
 * @returns {boolean} `false`, indicating that the event has been cancelled.
 */
export function noop(e: Event): boolean {
  e.stopImmediatePropagation();
  e.preventDefault();
  return false;
}

/**
 * Assigns properties from one or more source objects to a target object, skipping undefined values.
 * @param {unknown} target - The object to assign properties to.
 * @param {...unknown} sources - The objects to copy properties from. Multiple objects can be passed as arguments.
 * @returns {void}
 */
export function assignDefined(target: unknown, ...sources: unknown[]): void {
  const sourcesArray = sources as Record<string, unknown>[];
  const targetObj = target as Record<string, unknown>;

  sourcesArray.forEach((source) => {
    Object.keys(source as object).forEach((key) => {
      const val: unknown = source[key];
      if (val !== undefined) {
        targetObj[key] = val;
      }
    });
  });
}

/**
 * Checks if a value exists and is not 'false', returning `true` if it is, or the value otherwise.
 * @param {unknown} value - The value to check.
 * @returns {unknown} `true` if the value exists and is not 'false', or the value itself otherwise.
 */
export function ifExistsThenTrue(value: unknown): unknown {
  return value !== 'false' && (value === '' || value);
}

/**
 * Generates a unique identifier string.
 * @returns {string} A string representing a unique identifier.
 */
export function uid(): string {
  return Math.random().toString(36).substring(2);
}

/**
 * Intercepts a number value and returns it as a CSS pixel value.
 * @param {unknown} value - The value to intercept.
 * @returns {unknown} The number value converted to a CSS pixel value, or `null`/`undefined`.
 * ```
 * export class Hello implements ICustomElementViewModel
 * {
 *        bindable({ set: numberToPixelsInterceptor }) height =  150;
 * }
 * ```
 * */
export function numberToPixelsInterceptor(value: unknown): unknown {
  return numberToPixels(value as string | number | undefined);
}

/**
 * Converts a number value to a CSS pixel value.
 * @param {string|number|null|undefined} value - The value to convert.
 * @returns {string|number|null|undefined} The number value converted to a CSS pixel value, or `null`/`undefined`.
 */
export const numberToPixels = (value: string | number | null | undefined): string | number | null | undefined => {
  if (!value) return value;
  if (typeof value === 'string' && value.trim().includes(' ')) {
    value
      .trim()
      .split(' ')
      .map((x) => numberToPixels(x))
      .join(' ');
  }

  if (isNaN(Number(value))) return String(value);
  return `${value}px`;
};

/**
 * Deep clones an object.
 * 
 * @template T - The type of the input object.
 * @param {T} obj - The input object to clone.
 * @param {WeakMap<any, any>} [visited] - A map that tracks which objects have been visited during cloning.
 * @returns {T} - The cloned object.
 */
export function deepClone<T = unknown>(obj: T, visited = new WeakMap()): T {
  // Handle primitives and non-object types
  if (obj == null || typeof obj !== 'object' || obj instanceof Function) {
    return obj;
  }

  // Check if we've already visited this object before
  if (visited.has(obj)) {
    return visited.get(obj) as T;
  }

  let clone: any;

  // Handle arrays
  if (Array.isArray(obj)) {
    clone = [...obj];
    visited.set(obj, clone);
    for (let i = 0; i < clone.length; i++) {
      clone[i] = deepClone(clone[i], visited);
    }
    return clone as T;
  }

  // Handle dates
  if (obj instanceof Date) {
    clone = new Date(obj.getTime());
    visited.set(obj, clone);
    return clone as T;
  }

  // Handle other objects
  clone = Object.create(Object.getPrototypeOf(obj));
  visited.set(obj, clone);

  // Copy all properties, including non-enumerable ones
  const props = Object.getOwnPropertyDescriptors(obj);
  Object.keys(props).forEach((key) => {
    props[key].value = deepClone(props[key].value, visited);
    Object.defineProperty(clone, key, props[key]);
  });

  return clone as T;
}

/**
 * Returns the value of a nested property in an object, given its path as a string.
 * 
 * @param {Record<string, any>} obj - The input object.
 * @param {string} path - The path of the property, e.g. "foo.bar[2].baz".
 * @returns {any} - The value of the property, or undefined if not found.
 * @example
 * ```
 *  const secondNumber = getValueByPath(person, 'phoneNumbers[1].number');
 *  const baz = getValueByPath(person, 'foo.bar.baz');
 * ```
 * 
 */
function getValueByPath(obj: Record<string, any>, path: string): any {
  // Split the path by '.' and/or '[' and ']'
  const keys = path.split(/\.|\[|\]/).filter(key => key.length > 0);

  // Traverse the object using each key in the path
  let value: any = obj;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    value = value[key];
    if (value === undefined) {
      return undefined;
    }
  }

  return value;
}