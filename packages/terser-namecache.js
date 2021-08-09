// a cache for mangling private properties across modules into a consistent property name
export const terserNameCache = (() => {
  const cache = {
    props: {
      props: {
        $_attrMapper: 'm',
        $_exprParser: 'xp',
        $_getter: 'G',
        $_hasSetter: 'HS',
        $_isDirty: 'D',
        $_isRunning: 'iR',
        $_key: 'K',
        $_obj: 'O',
        $_observerLocator: 'oL',
        $_observing: 'iO',
        $_oldValue: 'ov',
        $_platform: 'p',
        $_rendering: 'r',
        $_setter: 'S',
        $_useProxy: 'uP',
        $_value: 'v',
      },
    }
  };

  const mangledPropToPropMap = new Map();
  for (const prop in cache.props.props) {
    const value = cache.props.props[prop];
    if (mangledPropToPropMap.has(value)) {
      throw new Error(`Invalid mangled name ${value}, already used for ${mangledPropToPropMap.get(value)}`);
    }
    mangledPropToPropMap.set(value, prop);
  }

  return cache;
})();


