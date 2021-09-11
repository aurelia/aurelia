// a cache for mangling private properties across modules into a consistent property name
export const terserNameCache = (() => {
  const cache = {
    props: {
      props: {
        $_attrMapper: 'm',
        $_callback: 'cb',
        $_container: 'c',
        $_exprParser: 'ep',
        $_factory: 'f',
        $_flags: 'fs',
        $_getter: 'g',
        $_hasSetter: 'hs',
        $_isDirty: 'D',
        $_isRunning: 'ir',
        $_key: 'k',
        $_location: 'l',
        $_obj: 'o',
        $_observerLocator: 'oL',
        $_observing: 'iO',
        $_oldValue: 'ov',
        $_platform: 'p',
        $_rendering: 'r',
        $_setter: 'S',
        $_useProxy: 'up',
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
