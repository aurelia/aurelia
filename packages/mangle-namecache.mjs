const mapping = {
  _attrMapper: 'm',
  _callback: 'cb',
  _config: 'cf',
  _container: 'c',
  _exprParser: 'ep',
  _factory: 'f',
  _flags: 'fs',
  _getter: 'g',
  _hasSetter: 'hs',
  _hydrateCustomElement: 'hE',
  _hydrate: 'hS',
  _hydrateChildren: 'hC',
  _isDirty: 'D',
  _isRunning: 'ir',
  _key: 'k',
  _location: 'l',
  _obj: 'o',
  _observerLocator: 'oL',
  _observing: 'iO',
  _oldValue: 'ov',
  _platform: 'p',
  _rendering: 'r',
  _scope: 's',
  _setter: 'S',
  _useProxy: 'up',
  _value: 'v',
  _validationSubscriber: 'vs'
};

(function () {
  const mangledPropToPropMap = new Map();
  for (const prop in mapping) {
    const value = mapping[prop];
    if (mangledPropToPropMap.has(value)) {
      throw new Error(`Invalid mangled name ${value}, already used for ${mangledPropToPropMap.get(value)}`);
    }
    mangledPropToPropMap.set(value, prop);
  }
})();

export const terserNameCache = {
  props: {
    props: Object.keys(mapping).reduce((map, key) => {
      map[`$${key}`] = mapping[key];
      return map;
    }, {}),
  }
};

export const esbuildNameCache = { ...mapping };
