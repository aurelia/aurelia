// This replaces the aurelia-polyfills package. It includes only non-standard polyfills.
(function () {
  const emptyMetadata = Object.freeze({});
  const metadataContainerKey = '__metadata__';

  if (typeof Reflect.getOwnMetadata !== 'function') {
    Reflect.getOwnMetadata = function (metadataKey, target, targetKey) {
      if (Object.prototype.hasOwnProperty.call(target, metadataContainerKey)) {
        return (target[metadataContainerKey][targetKey] || emptyMetadata)[metadataKey];
      }
    };
  }

  if (typeof Reflect.defineMetadata !== 'function') {
    Reflect.defineMetadata = function (metadataKey, metadataValue, target, targetKey) {
      const metadataContainer = Object.prototype.hasOwnProperty.call(target, metadataContainerKey) ? target[metadataContainerKey] : target[metadataContainerKey] = {};
      const targetContainer = metadataContainer[targetKey] || (metadataContainer[targetKey] = {});
      targetContainer[metadataKey] = metadataValue;
    };
  }

  if (typeof Reflect.metadata !== 'function') {
    Reflect.metadata = function (metadataKey, metadataValue) {
      return function (target, targetKey) {
        Reflect.defineMetadata(metadataKey, metadataValue, target, targetKey);
      };
    };
  }
})();
