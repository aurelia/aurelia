export function memoize() {
  const cache = new Map();
  return function(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const cacheKey = JSON.stringify(args);

      if (cache.has(cacheKey)) {
        return await cache.get(cacheKey);
      }

      const promise = originalMethod.apply(this, args);
      cache.set(cacheKey, promise);

      try {
        const result = await promise;
        cache.set(cacheKey, result);
        return result;
      } catch (error) {
        cache.delete(cacheKey);
        throw error;
      }
    };

    return descriptor;
  };
}